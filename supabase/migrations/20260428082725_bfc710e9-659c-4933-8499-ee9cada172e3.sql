
-- Seed CSA modules
INSERT INTO public.modules (slug, title, description, domain_code, sort_order, icon) VALUES
('csa-soc-fundamentals',   'SOC Fundamentals & Operations',                'People, process, technology of a SOC.',           'CSA-M1', 100, 'Radar'),
('csa-cyber-threats',      'Cyber Threats, Attack Vectors & Kill Chain',   'Threat actors, kill chain, MITRE ATT&CK.',         'CSA-M2', 101, 'Radar'),
('csa-incidents-events-logs','Incidents, Events & Log Sources',           'Critical on-prem and cloud log sources.',          'CSA-M3', 102, 'Radar'),
('csa-siem-fundamentals',  'SIEM Fundamentals & Microsoft Sentinel',       'SIEM architecture and Sentinel basics.',           'CSA-M4', 103, 'Radar'),
('csa-kql-hunting',        'KQL & Threat Hunting',                         'Hunt with KQL across Defender + Sentinel data.',   'CSA-M5', 104, 'Radar'),
('csa-defender-xdr',       'Microsoft Defender XDR & Endpoint Telemetry',  'Triage incidents in Defender XDR.',                'CSA-M6', 105, 'Radar'),
('csa-incident-response',  'Incident Response & Playbooks',                'NIST IR lifecycle and SOC playbooks.',             'CSA-M7', 106, 'Radar'),
('csa-threat-intel-soar',  'Threat Intel, SOAR & Career Prep',             'Intel sources, SOAR automation, interview prep.',  'CSA-M8', 107, 'Radar')
ON CONFLICT (slug) DO NOTHING;

-- Seed CSA labs
WITH m AS (SELECT slug, id FROM public.modules WHERE slug LIKE 'csa-%')
INSERT INTO public.labs (module_id, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
SELECT m.id, v.slug, v.title, v.scenario, v.objective, v.difficulty, v.duration_min, v.simulator, v.sort_order
FROM (VALUES
  -- M1
  ('csa-soc-fundamentals','csa-soc-tour',               'SOC tour: tiers and shift workflow',  'Walk a virtual SOC and identify L1/L2/L3 responsibilities.', 'Map analyst roles to incidents.',         'beginner',     15, 'sentinel', 1),
  ('csa-soc-fundamentals','csa-shift-handover-drill',   'Shift handover drill',                'Run a structured handover from night to day shift.',          'Produce a clean shift summary.',           'beginner',     15, 'sentinel', 2),
  -- M2
  ('csa-cyber-threats','csa-attck-mapping',             'Map activity to MITRE ATT&CK',        'Tag observed actions to ATT&CK techniques.',                  'Identify tactic + technique IDs.',         'beginner',     20, 'sentinel', 1),
  ('csa-cyber-threats','csa-killchain-walkthrough',     'Cyber Kill Chain walkthrough',        'Trace an intrusion across all 7 kill chain phases.',          'Place evidence on each phase.',            'beginner',     25, 'sentinel', 2),
  -- M3
  ('csa-incidents-events-logs','csa-windows-event-tour','Windows Security event tour',         'Browse Windows Security/Sysmon events for key IDs.',          'Spot 4624, 4625, 4688, 1, 3, 11.',         'beginner',     20, 'defender', 1),
  ('csa-incidents-events-logs','csa-signin-log-triage', 'Entra sign-in log triage',            'Triage risky sign-ins in Entra.',                              'Flag impossible-travel signals.',          'intermediate', 20, 'entra',    2),
  ('csa-incidents-events-logs','csa-sysmon-process-tree','Sysmon process tree investigation',  'Reconstruct the parent/child process tree from Sysmon.',      'Identify suspicious child of winword.exe.','intermediate', 20, 'defender', 3),
  -- M4
  ('csa-siem-fundamentals','csa-sentinel-tour',         'Microsoft Sentinel workspace tour',   'Tour Sentinel: incidents, workbooks, hunting.',               'Locate analytics rules + connectors.',     'beginner',     20, 'sentinel', 1),
  ('csa-siem-fundamentals','csa-create-analytics-rule', 'Create a Sentinel analytics rule',    'Build a scheduled rule for failed admin logons.',             'Save and trigger a custom rule.',          'intermediate', 35, 'sentinel', 2),
  ('csa-siem-fundamentals','csa-tune-noisy-rule',       'Tune a noisy detection rule',         'Reduce false positives on a sign-in rule.',                   'Add filters to drop benign noise.',         'intermediate', 35, 'sentinel', 3),
  -- M5
  ('csa-kql-hunting','csa-kql-basics',                  'KQL essentials in 30 minutes',        'Practice where, project, summarize, join, render.',           'Write 5 working KQL queries.',             'beginner',     30, 'sentinel', 1),
  ('csa-kql-hunting','csa-hunt-impossible-travel',      'Hunt: impossible travel sign-ins',    'KQL hunt across SigninLogs for impossible travel.',           'Return user + cities + delta minutes.',    'intermediate', 30, 'sentinel', 2),
  ('csa-kql-hunting','csa-hunt-suspicious-process',     'Hunt: suspicious child processes',    'Hunt DeviceProcessEvents for LOLBin abuse.',                  'Find rundll32 spawned by Office.',         'intermediate', 30, 'sentinel', 3),
  -- M6
  ('csa-defender-xdr','csa-defender-incident-triage',   'Defender XDR incident triage',        'Triage a multi-stage incident end-to-end.',                   'Classify, assign, and resolve.',           'intermediate', 30, 'defender', 1),
  ('csa-defender-xdr','csa-device-timeline-walk',       'Device timeline investigation',       'Walk a device timeline after an alert fires.',                'Identify root-cause process.',             'intermediate', 25, 'defender', 2),
  ('csa-defender-xdr','csa-air-review',                 'Review an AIR investigation',         'Review automated investigation results and approve actions.', 'Approve/decline pending actions.',         'beginner',     20, 'defender', 3),
  -- M7
  ('csa-incident-response','csa-phishing-playbook',     'Phishing IR playbook',                'Run the phishing playbook from triage to closure.',           'Contain user + purge mail.',               'intermediate', 25, 'defender', 1),
  ('csa-incident-response','csa-account-compromise-ir', 'Account compromise IR',               'Respond to a confirmed account takeover.',                    'Reset, revoke sessions, hunt persistence.','intermediate', 30, 'entra',    2),
  ('csa-incident-response','csa-ransomware-tabletop',   'Ransomware tabletop exercise',        'Tabletop a ransomware outbreak scenario.',                    'Drive containment + comms decisions.',     'advanced',     20, 'sentinel', 3),
  -- M8
  ('csa-threat-intel-soar','csa-ioc-enrichment',        'IOC enrichment workflow',             'Enrich IPs/hashes/domains with TI feeds.',                    'Build an enriched IOC report.',            'beginner',     20, 'sentinel', 1),
  ('csa-threat-intel-soar','csa-soar-auto-response',    'SOAR auto-response in Sentinel',      'Wire an automation rule to a phishing playbook.',             'Auto-disable user on confirmed phish.',    'intermediate', 25, 'sentinel', 2),
  ('csa-threat-intel-soar','csa-mock-interview',        'SOC L1 mock interview',               'Run a 15-question mock interview drill.',                     'Score yourself against rubric.',           'beginner',     15, 'sentinel', 3)
) AS v(module_slug, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
JOIN m ON m.slug = v.module_slug
ON CONFLICT (slug) DO NOTHING;
