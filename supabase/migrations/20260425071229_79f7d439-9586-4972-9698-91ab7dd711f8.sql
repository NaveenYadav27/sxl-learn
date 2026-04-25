-- ============================================================
-- Stateful Entra Tenant Schema
-- Each authenticated user gets their own isolated virtual tenant
-- ============================================================

-- Users in the virtual directory
CREATE TABLE public.tenant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  user_principal_name TEXT NOT NULL,
  job_title TEXT,
  department TEXT,
  account_enabled BOOLEAN NOT NULL DEFAULT true,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  usage_location TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, user_principal_name)
);

CREATE INDEX idx_tenant_users_user_id ON public.tenant_users(user_id);

-- Groups
CREATE TABLE public.tenant_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL DEFAULT 'security', -- 'security' | 'm365'
  membership_type TEXT NOT NULL DEFAULT 'assigned', -- 'assigned' | 'dynamic'
  dynamic_rule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_groups_user_id ON public.tenant_groups(user_id);

-- Group memberships (join table, scoped via group)
CREATE TABLE public.tenant_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- learner who owns the tenant (for fast RLS)
  group_id UUID NOT NULL REFERENCES public.tenant_groups(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES public.tenant_users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, member_user_id)
);

CREATE INDEX idx_tenant_group_members_user_id ON public.tenant_group_members(user_id);

-- Entra role assignments (e.g., Global Admin, User Administrator)
CREATE TABLE public.tenant_role_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_name TEXT NOT NULL, -- 'Global Administrator', 'User Administrator', etc.
  principal_type TEXT NOT NULL DEFAULT 'user', -- 'user' | 'group'
  principal_id UUID NOT NULL, -- references tenant_users.id or tenant_groups.id
  scope TEXT NOT NULL DEFAULT '/', -- directory scope
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_role_assignments_user_id ON public.tenant_role_assignments(user_id);

-- Conditional Access policies
CREATE TABLE public.tenant_ca_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'enabledForReportingButNotEnforced', -- 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced'
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- users, apps, locations, risk
  grant_controls JSONB NOT NULL DEFAULT '{}'::jsonb, -- mfa, compliant device, block
  session_controls JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_ca_policies_user_id ON public.tenant_ca_policies(user_id);

-- Devices
CREATE TABLE public.tenant_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  operating_system TEXT NOT NULL DEFAULT 'Windows',
  os_version TEXT,
  join_type TEXT NOT NULL DEFAULT 'AzureAD', -- 'AzureAD' | 'Hybrid' | 'Registered'
  compliance_state TEXT NOT NULL DEFAULT 'unknown', -- 'compliant' | 'noncompliant' | 'unknown'
  owner_id UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_devices_user_id ON public.tenant_devices(user_id);

-- Sign-in logs (synthetic, for Identity Protection labs)
CREATE TABLE public.tenant_sign_in_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  principal_id UUID REFERENCES public.tenant_users(id) ON DELETE CASCADE,
  app_display_name TEXT NOT NULL,
  ip_address TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'success', -- 'success' | 'failure' | 'interrupted'
  risk_level TEXT NOT NULL DEFAULT 'none', -- 'none' | 'low' | 'medium' | 'high'
  risk_detail TEXT,
  ca_applied JSONB DEFAULT '[]'::jsonb,
  signed_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_sign_in_logs_user_id ON public.tenant_sign_in_logs(user_id);
CREATE INDEX idx_tenant_sign_in_logs_signed_in_at ON public.tenant_sign_in_logs(signed_in_at DESC);

-- Audit log of every learner action
CREATE TABLE public.tenant_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create_user', 'assign_role', 'create_ca_policy', etc.
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_audit_logs_user_id ON public.tenant_audit_logs(user_id);
CREATE INDEX idx_tenant_audit_logs_created_at ON public.tenant_audit_logs(created_at DESC);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_ca_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sign_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — owner full access, instructors/admins read
-- ============================================================

-- Helper macro pattern, applied to each table
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'tenant_users', 'tenant_groups', 'tenant_group_members',
    'tenant_role_assignments', 'tenant_ca_policies', 'tenant_devices',
    'tenant_sign_in_logs', 'tenant_audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "%s_select_own_or_staff" ON public.%I FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), ''instructor''::app_role) OR public.has_role(auth.uid(), ''admin''::app_role))', t, t);
    EXECUTE format('CREATE POLICY "%s_insert_own" ON public.%I FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "%s_update_own" ON public.%I FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "%s_delete_own" ON public.%I FOR DELETE TO authenticated USING (user_id = auth.uid())', t, t);
  END LOOP;
END $$;

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_tenant_users_updated BEFORE UPDATE ON public.tenant_users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_tenant_groups_updated BEFORE UPDATE ON public.tenant_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_tenant_ca_policies_updated BEFORE UPDATE ON public.tenant_ca_policies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- Seed function: populate a fresh tenant with realistic data
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_tenant(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alice_id UUID; bob_id UUID; carol_id UUID; dave_id UUID; eve_id UUID;
  frank_id UUID; grace_id UUID; henry_id UUID; ivy_id UUID; jack_id UUID;
  it_admins_id UUID; finance_id UUID; sales_id UUID; all_users_id UUID;
BEGIN
  -- Sample users
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES
    (_user_id, 'Alice Anderson', 'alice@contoso.onmicrosoft.com', 'CEO', 'Executive', true) RETURNING id INTO alice_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Bob Brown', 'bob@contoso.onmicrosoft.com', 'IT Administrator', 'IT', true) RETURNING id INTO bob_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Carol Chen', 'carol@contoso.onmicrosoft.com', 'CFO', 'Finance', true) RETURNING id INTO carol_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Dave Davis', 'dave@contoso.onmicrosoft.com', 'Sales Rep', 'Sales', false) RETURNING id INTO dave_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Eve Edwards', 'eve@contoso.onmicrosoft.com', 'Marketing Manager', 'Marketing', false) RETURNING id INTO eve_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Frank Foster', 'frank@contoso.onmicrosoft.com', 'Help Desk', 'IT', true) RETURNING id INTO frank_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Grace Green', 'grace@contoso.onmicrosoft.com', 'HR Director', 'HR', true) RETURNING id INTO grace_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled, account_enabled)
  VALUES (_user_id, 'Henry Hill', 'henry@contoso.onmicrosoft.com', 'Contractor', 'Sales', false, false) RETURNING id INTO henry_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Ivy Ingram', 'ivy@contoso.onmicrosoft.com', 'Accountant', 'Finance', true) RETURNING id INTO ivy_id;
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Jack Jones', 'jack@contoso.onmicrosoft.com', 'Sales Manager', 'Sales', true) RETURNING id INTO jack_id;

  -- Sample groups
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'IT Admins', 'Tenant administrators', 'security') RETURNING id INTO it_admins_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'Finance Team', 'Finance department members', 'm365') RETURNING id INTO finance_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type, membership_type, dynamic_rule)
  VALUES (_user_id, 'Sales Team', 'All sales staff (dynamic)', 'm365', 'dynamic', 'user.department -eq "Sales"') RETURNING id INTO sales_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'All Employees', 'Everyone in the org', 'security') RETURNING id INTO all_users_id;

  -- Group memberships
  INSERT INTO public.tenant_group_members (user_id, group_id, member_user_id) VALUES
    (_user_id, it_admins_id, bob_id),
    (_user_id, it_admins_id, frank_id),
    (_user_id, finance_id, carol_id),
    (_user_id, finance_id, ivy_id),
    (_user_id, sales_id, dave_id),
    (_user_id, sales_id, jack_id),
    (_user_id, all_users_id, alice_id),
    (_user_id, all_users_id, bob_id),
    (_user_id, all_users_id, carol_id),
    (_user_id, all_users_id, eve_id),
    (_user_id, all_users_id, grace_id);

  -- Pre-seeded role assignments (Bob is the IT admin)
  INSERT INTO public.tenant_role_assignments (user_id, role_name, principal_type, principal_id) VALUES
    (_user_id, 'Global Administrator', 'user', alice_id),
    (_user_id, 'User Administrator', 'user', bob_id),
    (_user_id, 'Helpdesk Administrator', 'user', frank_id);

  -- A baseline CA policy
  INSERT INTO public.tenant_ca_policies (user_id, display_name, state, conditions, grant_controls)
  VALUES (
    _user_id,
    'Baseline: Require MFA for admins',
    'enabled',
    '{"users":{"includeRoles":["Global Administrator","User Administrator"]},"applications":{"includeApplications":["All"]}}'::jsonb,
    '{"operator":"OR","builtInControls":["mfa"]}'::jsonb
  );

  -- Sample devices
  INSERT INTO public.tenant_devices (user_id, display_name, operating_system, os_version, join_type, compliance_state, owner_id) VALUES
    (_user_id, 'ALICE-LAPTOP', 'Windows', '11 23H2', 'AzureAD', 'compliant', alice_id),
    (_user_id, 'BOB-DESKTOP', 'Windows', '11 23H2', 'AzureAD', 'compliant', bob_id),
    (_user_id, 'CAROL-IPAD', 'iOS', '17.4', 'Registered', 'compliant', carol_id),
    (_user_id, 'DAVE-MACBOOK', 'macOS', '14.5', 'AzureAD', 'noncompliant', dave_id);

  -- Sample sign-in logs (some risky, for Identity Protection labs)
  INSERT INTO public.tenant_sign_in_logs (user_id, principal_id, app_display_name, ip_address, location, status, risk_level, risk_detail, signed_in_at) VALUES
    (_user_id, alice_id, 'Microsoft 365', '203.0.113.42', 'Seattle, US', 'success', 'none', NULL, now() - interval '2 hours'),
    (_user_id, bob_id, 'Azure Portal', '203.0.113.42', 'Seattle, US', 'success', 'none', NULL, now() - interval '4 hours'),
    (_user_id, dave_id, 'Microsoft 365', '198.51.100.7', 'Lagos, NG', 'failure', 'high', 'unfamiliarFeatures', now() - interval '1 hour'),
    (_user_id, dave_id, 'Microsoft 365', '198.51.100.7', 'Lagos, NG', 'success', 'high', 'unfamiliarFeatures', now() - interval '50 minutes'),
    (_user_id, eve_id, 'Outlook', '192.0.2.15', 'New York, US', 'success', 'low', 'unlikelyTravel', now() - interval '6 hours'),
    (_user_id, carol_id, 'SharePoint', '203.0.113.99', 'Seattle, US', 'success', 'none', NULL, now() - interval '8 hours');

  -- Audit log entry
  INSERT INTO public.tenant_audit_logs (user_id, action, target_type, details)
  VALUES (_user_id, 'tenant_seeded', 'tenant', '{"users":10,"groups":4,"policies":1}'::jsonb);
END;
$$;

-- ============================================================
-- Reset function: wipe and re-seed a learner's tenant
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_tenant()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Order matters due to FKs
  DELETE FROM public.tenant_audit_logs WHERE user_id = uid;
  DELETE FROM public.tenant_sign_in_logs WHERE user_id = uid;
  DELETE FROM public.tenant_devices WHERE user_id = uid;
  DELETE FROM public.tenant_ca_policies WHERE user_id = uid;
  DELETE FROM public.tenant_role_assignments WHERE user_id = uid;
  DELETE FROM public.tenant_group_members WHERE user_id = uid;
  DELETE FROM public.tenant_groups WHERE user_id = uid;
  DELETE FROM public.tenant_users WHERE user_id = uid;

  PERFORM public.seed_tenant(uid);
END;
$$;

-- ============================================================
-- Auto-seed tenant on first signup (extend handle_new_user)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'learner');
  PERFORM public.seed_tenant(new.id);
  RETURN new;
END;
$$;