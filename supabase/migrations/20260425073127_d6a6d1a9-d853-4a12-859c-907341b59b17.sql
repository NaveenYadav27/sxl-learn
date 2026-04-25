-- Defender alerts (atomic detections)
CREATE TABLE public.tenant_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  incident_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- low | medium | high | informational
  status TEXT NOT NULL DEFAULT 'new', -- new | inProgress | resolved
  category TEXT NOT NULL DEFAULT 'SuspiciousActivity',
  product TEXT NOT NULL DEFAULT 'Microsoft Defender for Identity',
  mitre_technique TEXT,
  affected_user_id UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
  affected_device_id UUID REFERENCES public.tenant_devices(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Defender incidents (groups of alerts)
CREATE TABLE public.tenant_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active', -- active | inProgress | resolved
  classification TEXT, -- truePositive | falsePositive | informationalExpectedActivity | null
  determination TEXT, -- malware | phishing | unwantedSoftware | etc.
  assigned_to UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Now wire alerts -> incidents FK
ALTER TABLE public.tenant_alerts
  ADD CONSTRAINT tenant_alerts_incident_fk
  FOREIGN KEY (incident_id) REFERENCES public.tenant_incidents(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE public.tenant_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_alerts_select_own_or_staff ON public.tenant_alerts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY tenant_alerts_insert_own ON public.tenant_alerts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY tenant_alerts_update_own ON public.tenant_alerts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY tenant_alerts_delete_own ON public.tenant_alerts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY tenant_incidents_select_own_or_staff ON public.tenant_incidents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY tenant_incidents_insert_own ON public.tenant_incidents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY tenant_incidents_update_own ON public.tenant_incidents
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY tenant_incidents_delete_own ON public.tenant_incidents
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- updated_at trigger on incidents
CREATE TRIGGER tenant_incidents_touch
  BEFORE UPDATE ON public.tenant_incidents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Indexes
CREATE INDEX idx_tenant_alerts_user ON public.tenant_alerts(user_id);
CREATE INDEX idx_tenant_alerts_incident ON public.tenant_alerts(incident_id);
CREATE INDEX idx_tenant_incidents_user ON public.tenant_incidents(user_id);

-- Replace seed_tenant: seed includes incidents/alerts; reset also wipes them
CREATE OR REPLACE FUNCTION public.seed_tenant(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  alice_id UUID; bob_id UUID; carol_id UUID; dave_id UUID; eve_id UUID;
  frank_id UUID; grace_id UUID; henry_id UUID; ivy_id UUID; jack_id UUID;
  it_admins_id UUID; finance_id UUID; sales_id UUID; all_users_id UUID;
  dave_macbook_id UUID;
  inc_phish_id UUID; inc_travel_id UUID; inc_malware_id UUID;
BEGIN
  INSERT INTO public.tenant_users (user_id, display_name, user_principal_name, job_title, department, mfa_enabled)
  VALUES (_user_id, 'Alice Anderson', 'alice@contoso.onmicrosoft.com', 'CEO', 'Executive', true) RETURNING id INTO alice_id;
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

  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'IT Admins', 'Tenant administrators', 'security') RETURNING id INTO it_admins_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'Finance Team', 'Finance department members', 'm365') RETURNING id INTO finance_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type, membership_type, dynamic_rule)
  VALUES (_user_id, 'Sales Team', 'All sales staff (dynamic)', 'm365', 'dynamic', 'user.department -eq "Sales"') RETURNING id INTO sales_id;
  INSERT INTO public.tenant_groups (user_id, display_name, description, group_type)
  VALUES (_user_id, 'All Employees', 'Everyone in the org', 'security') RETURNING id INTO all_users_id;

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

  INSERT INTO public.tenant_role_assignments (user_id, role_name, principal_type, principal_id) VALUES
    (_user_id, 'Global Administrator', 'user', alice_id),
    (_user_id, 'User Administrator', 'user', bob_id),
    (_user_id, 'Helpdesk Administrator', 'user', frank_id);

  INSERT INTO public.tenant_ca_policies (user_id, display_name, state, conditions, grant_controls)
  VALUES (
    _user_id, 'Baseline: Require MFA for admins', 'enabled',
    '{"users":{"includeRoles":["Global Administrator","User Administrator"]},"applications":{"includeApplications":["All"]}}'::jsonb,
    '{"operator":"OR","builtInControls":["mfa"]}'::jsonb
  );

  INSERT INTO public.tenant_devices (user_id, display_name, operating_system, os_version, join_type, compliance_state, owner_id) VALUES
    (_user_id, 'ALICE-LAPTOP', 'Windows', '11 23H2', 'AzureAD', 'compliant', alice_id),
    (_user_id, 'BOB-DESKTOP', 'Windows', '11 23H2', 'AzureAD', 'compliant', bob_id),
    (_user_id, 'CAROL-IPAD', 'iOS', '17.4', 'Registered', 'compliant', carol_id);
  INSERT INTO public.tenant_devices (user_id, display_name, operating_system, os_version, join_type, compliance_state, owner_id)
  VALUES (_user_id, 'DAVE-MACBOOK', 'macOS', '14.5', 'AzureAD', 'noncompliant', dave_id) RETURNING id INTO dave_macbook_id;

  INSERT INTO public.tenant_sign_in_logs (user_id, principal_id, app_display_name, ip_address, location, status, risk_level, risk_detail, signed_in_at) VALUES
    (_user_id, alice_id, 'Microsoft 365', '203.0.113.42', 'Seattle, US', 'success', 'none', NULL, now() - interval '2 hours'),
    (_user_id, bob_id, 'Azure Portal', '203.0.113.42', 'Seattle, US', 'success', 'none', NULL, now() - interval '4 hours'),
    (_user_id, dave_id, 'Microsoft 365', '198.51.100.7', 'Lagos, NG', 'failure', 'high', 'unfamiliarFeatures', now() - interval '1 hour'),
    (_user_id, dave_id, 'Microsoft 365', '198.51.100.7', 'Lagos, NG', 'success', 'high', 'unfamiliarFeatures', now() - interval '50 minutes'),
    (_user_id, eve_id, 'Outlook', '192.0.2.15', 'New York, US', 'success', 'low', 'unlikelyTravel', now() - interval '6 hours'),
    (_user_id, carol_id, 'SharePoint', '203.0.113.99', 'Seattle, US', 'success', 'none', NULL, now() - interval '8 hours');

  -- INCIDENTS (3) and their ALERTS
  INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
  VALUES (_user_id, 'Phishing campaign targeting Finance', 'Multiple users in Finance received suspicious emails impersonating the CFO.', 'high', 'active')
  RETURNING id INTO inc_phish_id;

  INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
  VALUES (_user_id, 'Atypical travel for Dave Davis', 'Sign-in from Lagos, NG just 50 minutes after a sign-in from Seattle, US.', 'high', 'active')
  RETURNING id INTO inc_travel_id;

  INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
  VALUES (_user_id, 'Malware detected on DAVE-MACBOOK', 'EDR flagged a suspicious binary executing from /tmp on a non-compliant device.', 'medium', 'active')
  RETURNING id INTO inc_malware_id;

  INSERT INTO public.tenant_alerts (user_id, incident_id, title, description, severity, category, product, mitre_technique, affected_user_id, detected_at) VALUES
    (_user_id, inc_phish_id, 'Suspicious email with credential-harvesting link', 'Email from "cfo-contoso@protonmail.com" sent to 4 Finance users.', 'high', 'Phishing', 'Microsoft Defender for Office 365', 'T1566.002', carol_id, now() - interval '3 hours'),
    (_user_id, inc_phish_id, 'User clicked link in suspicious email', 'Ivy Ingram clicked the URL within 2 minutes of delivery.', 'high', 'Phishing', 'Microsoft Defender for Office 365', 'T1204.001', ivy_id, now() - interval '2 hours 50 minutes'),
    (_user_id, inc_travel_id, 'Atypical travel detected', 'Sign-in from Lagos, NG impossible given last Seattle sign-in.', 'high', 'InitialAccess', 'Microsoft Entra Identity Protection', 'T1078.004', dave_id, now() - interval '50 minutes'),
    (_user_id, inc_travel_id, 'Successful sign-in from anonymous IP', 'Sign-in from known Tor exit node.', 'medium', 'InitialAccess', 'Microsoft Entra Identity Protection', 'T1090.003', dave_id, now() - interval '45 minutes');

  INSERT INTO public.tenant_alerts (user_id, incident_id, title, description, severity, category, product, mitre_technique, affected_user_id, affected_device_id, detected_at) VALUES
    (_user_id, inc_malware_id, 'Suspicious binary executing from /tmp', 'Process "xq9hd" launched from temporary directory.', 'medium', 'Malware', 'Microsoft Defender for Endpoint', 'T1059.004', dave_id, dave_macbook_id, now() - interval '20 minutes');

  INSERT INTO public.tenant_audit_logs (user_id, action, target_type, details)
  VALUES (_user_id, 'tenant_seeded', 'tenant', '{"users":10,"groups":4,"policies":1,"incidents":3,"alerts":5}'::jsonb);
END;
$function$;

-- Replace reset_tenant to also wipe alerts/incidents
CREATE OR REPLACE FUNCTION public.reset_tenant()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.tenant_alerts WHERE user_id = uid;
  DELETE FROM public.tenant_incidents WHERE user_id = uid;
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
$function$;

-- Backfill alerts/incidents for existing tenants that don't have any yet
DO $$
DECLARE u RECORD;
BEGIN
  FOR u IN SELECT DISTINCT user_id FROM public.tenant_users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.tenant_incidents WHERE user_id = u.user_id) THEN
      -- Inline a smaller backfill so we don't double-seed users/groups
      DECLARE
        carol_id UUID; ivy_id UUID; dave_id UUID; dave_dev UUID;
        inc_phish_id UUID; inc_travel_id UUID; inc_malware_id UUID;
      BEGIN
        SELECT id INTO carol_id FROM public.tenant_users WHERE user_id = u.user_id AND display_name = 'Carol Chen' LIMIT 1;
        SELECT id INTO ivy_id FROM public.tenant_users WHERE user_id = u.user_id AND display_name = 'Ivy Ingram' LIMIT 1;
        SELECT id INTO dave_id FROM public.tenant_users WHERE user_id = u.user_id AND display_name = 'Dave Davis' LIMIT 1;
        SELECT id INTO dave_dev FROM public.tenant_devices WHERE user_id = u.user_id AND display_name = 'DAVE-MACBOOK' LIMIT 1;

        INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
        VALUES (u.user_id, 'Phishing campaign targeting Finance', 'Multiple users in Finance received suspicious emails impersonating the CFO.', 'high', 'active')
        RETURNING id INTO inc_phish_id;
        INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
        VALUES (u.user_id, 'Atypical travel for Dave Davis', 'Sign-in from Lagos, NG just 50 minutes after a sign-in from Seattle, US.', 'high', 'active')
        RETURNING id INTO inc_travel_id;
        INSERT INTO public.tenant_incidents (user_id, display_name, description, severity, status)
        VALUES (u.user_id, 'Malware detected on DAVE-MACBOOK', 'EDR flagged a suspicious binary executing from /tmp on a non-compliant device.', 'medium', 'active')
        RETURNING id INTO inc_malware_id;

        INSERT INTO public.tenant_alerts (user_id, incident_id, title, description, severity, category, product, mitre_technique, affected_user_id) VALUES
          (u.user_id, inc_phish_id, 'Suspicious email with credential-harvesting link', 'Email from cfo-contoso@protonmail.com sent to 4 Finance users.', 'high', 'Phishing', 'Microsoft Defender for Office 365', 'T1566.002', carol_id),
          (u.user_id, inc_phish_id, 'User clicked link in suspicious email', 'Ivy Ingram clicked the URL within 2 minutes of delivery.', 'high', 'Phishing', 'Microsoft Defender for Office 365', 'T1204.001', ivy_id),
          (u.user_id, inc_travel_id, 'Atypical travel detected', 'Sign-in from Lagos, NG impossible given last Seattle sign-in.', 'high', 'InitialAccess', 'Microsoft Entra Identity Protection', 'T1078.004', dave_id),
          (u.user_id, inc_travel_id, 'Successful sign-in from anonymous IP', 'Sign-in from known Tor exit node.', 'medium', 'InitialAccess', 'Microsoft Entra Identity Protection', 'T1090.003', dave_id);
        INSERT INTO public.tenant_alerts (user_id, incident_id, title, description, severity, category, product, mitre_technique, affected_user_id, affected_device_id) VALUES
          (u.user_id, inc_malware_id, 'Suspicious binary executing from /tmp', 'Process "xq9hd" launched from temporary directory.', 'medium', 'Malware', 'Microsoft Defender for Endpoint', 'T1059.004', dave_id, dave_dev);
      END;
    END IF;
  END LOOP;
END $$;