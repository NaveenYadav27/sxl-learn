
-- 1. Wipe transactional + content data (safe: 1 attempt, 0 progress, 0 responses)
DELETE FROM public.question_responses;
DELETE FROM public.step_progress;
DELETE FROM public.lab_attempts;
DELETE FROM public.lab_questions;
DELETE FROM public.lab_steps;
DELETE FROM public.labs;
DELETE FROM public.modules;

-- 2. Re-seed 5 modules per the official SC-900 TOC
INSERT INTO public.modules (slug, domain_code, title, description, exam_weight, sort_order, icon) VALUES
  ('concepts',   'SC900-M1', 'Security Concepts',
    'Zero Trust, Defense in Depth, the CIA triad, threats & risk, and the cloud shared responsibility model.',
    '90 min',  1, 'shield'),
  ('iam',        'SC900-M2', 'Identity & Access Management',
    'Authentication vs authorization, MFA, RBAC, Conditional Access, and Privileged Identity Management.',
    '120 min', 2, 'key'),
  ('entra',      'SC900-M3', 'Microsoft Entra Capabilities',
    'Entra ID architecture, hybrid identity, Identity Protection, passwordless, and B2B/B2C.',
    '120 min', 3, 'users'),
  ('security',   'SC900-M4', 'Security Solutions in Microsoft',
    'Microsoft Defender, Microsoft Sentinel, cloud security posture, and endpoint protection.',
    '105 min', 4, 'lock'),
  ('compliance', 'SC900-M5', 'Compliance & Governance',
    'Compliance management, Microsoft Purview, DLP, sensitivity labels, eDiscovery, and auditing.',
    '105 min', 5, 'gavel');

-- 3. Re-seed 18 labs matching TOC titles exactly
WITH m AS (SELECT id, slug FROM public.modules)
INSERT INTO public.labs (module_id, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
SELECT (SELECT id FROM m WHERE slug = src.module_slug), src.slug, src.title, src.scenario, src.objective, src.difficulty, src.duration_min, src.simulator, src.sort_order
FROM (VALUES
  -- Module 1: Security Concepts (3 labs)
  ('concepts', 'secure-score-explore',     'Explore Microsoft Secure Score',
    'Contoso''s CISO wants a baseline of the tenant''s current security posture before the board meeting.',
    'Navigate the Microsoft Secure Score blade, interpret the score, and identify the top three improvement actions.',
    'beginner', 15, 'defender', 1),
  ('concepts', 'analyze-recommendations',  'Analyze Security Recommendations',
    'A new compliance audit flagged several missing controls. You must triage them by impact.',
    'Review Defender for Cloud recommendations, sort by impact, and assign the top item to a remediation owner.',
    'beginner', 15, 'defender', 2),
  ('concepts', 'attack-simulation-overview','Review Attack Simulation Overview',
    'The security team wants to phish-test 5,000 users next quarter and needs a baseline campaign.',
    'Open Attack Simulator in Defender for Office 365, review past campaign results, and draft a new payload.',
    'beginner', 15, 'defender', 3),

  -- Module 2: IAM (4 labs)
  ('iam', 'create-users-groups',     'Create Users and Groups in Entra ID',
    'A new business unit is onboarding 25 employees who need standard productivity access.',
    'Create a security group, add bulk users, and assign a license through group-based licensing.',
    'beginner', 18, 'entra', 1),
  ('iam', 'configure-rbac',          'Configure RBAC Roles in Azure',
    'A junior engineer needs read access to one resource group only — no broader privileges.',
    'Assign the Reader role at resource-group scope using Azure RBAC.',
    'beginner', 18, 'entra', 2),
  ('iam', 'conditional-access',      'Implement Conditional Access Policy',
    'Finance must only access SAP from compliant devices on the corporate network.',
    'Build a Conditional Access policy targeting the Finance group with device + location conditions.',
    'intermediate', 22, 'entra', 3),
  ('iam', 'enable-test-mfa',         'Enable and Test MFA',
    'Following a phishing incident, the CISO mandates MFA for all admins by Friday.',
    'Enable MFA via Security Defaults / per-user MFA and verify a successful challenge.',
    'beginner', 17, 'entra', 4),

  -- Module 3: Microsoft Entra Capabilities (4 labs)
  ('entra', 'passwordless-auth',     'Configure Passwordless Authentication',
    'Engineering wants to ditch passwords and roll out FIDO2 keys for the SRE team.',
    'Enable the FIDO2 authentication method and register a security key for a pilot user.',
    'intermediate', 22, 'entra', 1),
  ('entra', 'identity-protection',   'Set Up Identity Protection Policies',
    'Several impossible-travel sign-ins were detected last week. The CISO wants automated response.',
    'Create user-risk and sign-in-risk policies that require MFA at medium risk and block at high.',
    'intermediate', 23, 'entra', 2),
  ('entra', 'risky-signin-sim',      'Simulate Risky Sign-In Detection',
    'You need to demo Identity Protection to the leadership team using a controlled sign-in event.',
    'Trigger a risky sign-in via the Tor browser scenario and review the detection in the Identity Protection dashboard.',
    'intermediate', 22, 'entra', 3),
  ('entra', 'hybrid-identity',       'Explore Hybrid Identity Configuration',
    'Contoso is migrating from on-prem AD and needs to plan the right sync model.',
    'Compare Password Hash Sync, Pass-Through Auth, and Federation; choose the right model for the scenario.',
    'intermediate', 23, 'entra', 4),

  -- Module 4: Security Solutions (4 labs)
  ('security', 'defender-portal-explore', 'Explore Microsoft Defender Portal',
    'A new SOC analyst is onboarding and needs a tour of the unified Defender XDR portal.',
    'Navigate the Defender XDR home, incidents, and assets blades; pin three favourite views.',
    'beginner', 17, 'defender', 1),
  ('security', 'investigate-alerts',      'Investigate Security Alerts',
    'A high-severity alert just fired on a finance laptop — you''re the on-call analyst.',
    'Open the alert, review the Attack Story graph, and classify it as a true positive with a containment action.',
    'intermediate', 20, 'defender', 2),
  ('security', 'sentinel-dashboards',     'Review Sentinel Dashboards',
    'The SOC manager wants a daily threat-landscape briefing using Sentinel workbooks.',
    'Open the Sentinel Overview workbook, review incident trends, and pin a custom workbook to the home page.',
    'intermediate', 18, 'sentinel', 3),
  ('security', 'analytic-rule-create',    'Create Basic Analytic Rule',
    'You need an alert when any account fails sign-in 10+ times in 5 minutes.',
    'Author a scheduled KQL analytic rule in Sentinel with a 5-minute window and 10-event threshold.',
    'intermediate', 20, 'sentinel', 4),

  -- Module 5: Compliance & Governance (4 labs)
  ('compliance', 'create-sensitivity-label','Create Sensitivity Label',
    'Legal wants all M&A documents auto-encrypted and watermarked.',
    'Create a "Highly Confidential — M&A" label with encryption and visual marking, then publish it.',
    'beginner', 18, 'purview', 1),
  ('compliance', 'configure-dlp',          'Configure DLP Policy',
    'Finance is leaking credit-card numbers via Outlook. You need a stop-and-justify control.',
    'Build a DLP policy that detects PCI data in Exchange + OneDrive and blocks with override.',
    'intermediate', 22, 'purview', 2),
  ('compliance', 'compliance-score',       'Review Compliance Score',
    'The board asked for a quantified compliance posture against ISO 27001.',
    'Open Compliance Manager, filter improvement actions by ISO 27001, and assign one to an owner.',
    'beginner', 17, 'purview', 3),
  ('compliance', 'enable-audit-logging',   'Enable Audit Logging',
    'A pending HR investigation requires unified audit log search.',
    'Verify unified audit log is on and run a search for a user''s recent file activities.',
    'beginner', 18, 'purview', 4)
) AS src(module_slug, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order);
