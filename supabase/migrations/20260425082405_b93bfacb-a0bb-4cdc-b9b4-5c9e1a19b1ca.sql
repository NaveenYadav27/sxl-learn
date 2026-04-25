-- ============ PURVIEW TABLES ============

CREATE TABLE public.tenant_sensitivity_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT 'gray',
  encryption_enabled BOOLEAN NOT NULL DEFAULT false,
  watermark_text TEXT,
  scope TEXT NOT NULL DEFAULT 'file',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_sensitivity_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_sensitivity_labels_select_own_or_staff" ON public.tenant_sensitivity_labels
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_sensitivity_labels_insert_own" ON public.tenant_sensitivity_labels
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_sensitivity_labels_update_own" ON public.tenant_sensitivity_labels
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_sensitivity_labels_delete_own" ON public.tenant_sensitivity_labels
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER touch_sensitivity_labels BEFORE UPDATE ON public.tenant_sensitivity_labels
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.tenant_dlp_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  state TEXT NOT NULL DEFAULT 'test',
  locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  action TEXT NOT NULL DEFAULT 'notify',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_dlp_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_dlp_policies_select_own_or_staff" ON public.tenant_dlp_policies
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_dlp_policies_insert_own" ON public.tenant_dlp_policies
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_dlp_policies_update_own" ON public.tenant_dlp_policies
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_dlp_policies_delete_own" ON public.tenant_dlp_policies
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER touch_dlp_policies BEFORE UPDATE ON public.tenant_dlp_policies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.tenant_classified_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'SharePoint',
  owner_id UUID REFERENCES public.tenant_users(id) ON DELETE SET NULL,
  label_id UUID REFERENCES public.tenant_sensitivity_labels(id) ON DELETE SET NULL,
  classification_source TEXT NOT NULL DEFAULT 'manual',
  sensitivity_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_classified_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_classified_files_select_own_or_staff" ON public.tenant_classified_files
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'instructor') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_classified_files_insert_own" ON public.tenant_classified_files
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_classified_files_update_own" ON public.tenant_classified_files
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tenant_classified_files_delete_own" ON public.tenant_classified_files
  FOR DELETE USING (user_id = auth.uid());

CREATE TRIGGER touch_classified_files BEFORE UPDATE ON public.tenant_classified_files
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ EXTEND SEED + RESET ============

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
  lbl_public UUID; lbl_internal UUID; lbl_conf UUID; lbl_highconf UUID; lbl_restricted UUID;
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
    (_user_id, it_admins_id, bob_id), (_user_id, it_admins_id, frank_id),
    (_user_id, finance_id, carol_id), (_user_id, finance_id, ivy_id),
    (_user_id, sales_id, dave_id), (_user_id, sales_id, jack_id),
    (_user_id, all_users_id, alice_id), (_user_id, all_users_id, bob_id),
    (_user_id, all_users_id, carol_id), (_user_id, all_users_id, eve_id),
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

  -- PURVIEW: sensitivity labels (5)
  INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, scope)
  VALUES (_user_id, 'Public', 'Information that can be shared publicly.', 1, 'green', false, 'file') RETURNING id INTO lbl_public;
  INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, scope)
  VALUES (_user_id, 'Internal', 'For use within Contoso only.', 2, 'blue', false, 'file') RETURNING id INTO lbl_internal;
  INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
  VALUES (_user_id, 'Confidential', 'Sensitive business data.', 3, 'orange', true, 'CONFIDENTIAL', 'file') RETURNING id INTO lbl_conf;
  INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
  VALUES (_user_id, 'Highly Confidential', 'Crown-jewel data; encrypt and watermark.', 4, 'red', true, 'HIGHLY CONFIDENTIAL', 'file') RETURNING id INTO lbl_highconf;
  INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
  VALUES (_user_id, 'Restricted', 'Regulatory data; legal hold required.', 5, 'purple', true, 'RESTRICTED', 'file') RETURNING id INTO lbl_restricted;

  -- PURVIEW: DLP policies (2)
  INSERT INTO public.tenant_dlp_policies (user_id, display_name, description, state, locations, rules, action) VALUES
    (_user_id, 'Block credit cards leaving org', 'Prevent CCN exfiltration via Exchange and Teams.', 'enabled',
     '["Exchange","Teams"]'::jsonb,
     '{"sensitiveInfoTypes":["Credit Card Number"],"threshold":1,"externalRecipients":true}'::jsonb,
     'block'),
    (_user_id, 'Notify on PII in OneDrive', 'Surface policy tip when PII detected in OneDrive uploads.', 'test',
     '["OneDrive"]'::jsonb,
     '{"sensitiveInfoTypes":["U.S. Social Security Number","Passport Number"],"threshold":1}'::jsonb,
     'notify');

  -- PURVIEW: classified files (6)
  INSERT INTO public.tenant_classified_files (user_id, file_name, location, owner_id, label_id, classification_source, sensitivity_score) VALUES
    (_user_id, 'Q4-Earnings-DRAFT.xlsx', 'SharePoint/Finance', carol_id, lbl_highconf, 'manual', 90),
    (_user_id, 'Vendor-Contract-Acme.docx', 'SharePoint/Legal', alice_id, lbl_conf, 'manual', 70),
    (_user_id, 'Marketing-Brochure.pdf', 'SharePoint/Marketing', eve_id, lbl_public, 'manual', 10),
    (_user_id, 'Employee-Handbook.docx', 'SharePoint/HR', grace_id, lbl_internal, 'auto', 30),
    (_user_id, 'Customer-PII-Export.csv', 'OneDrive/Dave', dave_id, NULL, 'auto', 85),
    (_user_id, 'Patent-Filing-Notes.docx', 'OneDrive/Alice', alice_id, lbl_restricted, 'manual', 95);

  INSERT INTO public.tenant_audit_logs (user_id, action, target_type, details)
  VALUES (_user_id, 'tenant_seeded', 'tenant', '{"users":10,"groups":4,"policies":1,"incidents":3,"alerts":5,"labels":5,"dlp":2,"files":6}'::jsonb);
END;
$function$;

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
  DELETE FROM public.tenant_classified_files WHERE user_id = uid;
  DELETE FROM public.tenant_dlp_policies WHERE user_id = uid;
  DELETE FROM public.tenant_sensitivity_labels WHERE user_id = uid;
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

-- Backfill: seed Purview data for existing users who already have tenants but no labels yet
INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, scope)
SELECT DISTINCT tu.user_id, 'Public', 'Information that can be shared publicly.', 1, 'green', false, 'file'
FROM public.tenant_users tu
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_sensitivity_labels l WHERE l.user_id = tu.user_id);

INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, scope)
SELECT DISTINCT tu.user_id, 'Internal', 'For use within Contoso only.', 2, 'blue', false, 'file'
FROM public.tenant_users tu
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_sensitivity_labels l WHERE l.user_id = tu.user_id AND l.display_name = 'Internal');

INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
SELECT DISTINCT tu.user_id, 'Confidential', 'Sensitive business data.', 3, 'orange', true, 'CONFIDENTIAL', 'file'
FROM public.tenant_users tu
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_sensitivity_labels l WHERE l.user_id = tu.user_id AND l.display_name = 'Confidential');

INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
SELECT DISTINCT tu.user_id, 'Highly Confidential', 'Crown-jewel data; encrypt and watermark.', 4, 'red', true, 'HIGHLY CONFIDENTIAL', 'file'
FROM public.tenant_users tu
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_sensitivity_labels l WHERE l.user_id = tu.user_id AND l.display_name = 'Highly Confidential');

INSERT INTO public.tenant_sensitivity_labels (user_id, display_name, description, priority, color, encryption_enabled, watermark_text, scope)
SELECT DISTINCT tu.user_id, 'Restricted', 'Regulatory data; legal hold required.', 5, 'purple', true, 'RESTRICTED', 'file'
FROM public.tenant_users tu
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_sensitivity_labels l WHERE l.user_id = tu.user_id AND l.display_name = 'Restricted');