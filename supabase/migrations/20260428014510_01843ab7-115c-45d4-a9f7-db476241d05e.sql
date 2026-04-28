
-- 1) Enable realtime broadcasting on the two tables LabSimulator/Lab subscribe to.
ALTER TABLE public.step_progress REPLICA IDENTITY FULL;
ALTER TABLE public.lab_attempts  REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'step_progress'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.step_progress';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'lab_attempts'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_attempts';
  END IF;
END$$;

-- 2) Top-up missing steps to make every PEN-200 lab a 3-step flow.
-- Helper insert pattern: skip if (lab_id, step_number) already exists.

WITH s AS (
  SELECT id AS lab_id FROM public.labs WHERE slug = 'pen200-bloodhound-collect'
)
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.step_number, x.title, x.instructions, x.hint, x.expected_action, x.points FROM s, (VALUES
  (2, 'Zip the JSON output',
   'After SharpHound finishes, archive the per-domain JSON files so they are easy to import into BloodHound CE.',
   'Use the standard zip command on Linux.',
   '{"type":"command","contains":"zip"}'::jsonb, 10),
  (3, 'Import into BloodHound CE',
   'Drag the zip into BloodHound or use bloodhound-cli ingest-zip <file>. For this lab, run the CLI command.',
   'bloodhound-cli ingest-zip 20240101-bloodhound.zip',
   '{"type":"command","contains":"bloodhound-cli ingest"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-gobuster-dirs')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (2, 'Try common extensions',
   'Re-run gobuster including PHP, TXT and HTML extensions to surface backup files (-x php,txt,html).',
   'Add -x php,txt,html to the previous command.',
   '{"type":"command","contains":"-x"}'::jsonb, 10),
  (3, 'Bust virtual hosts',
   'Now use vhost mode to find virtual hosts on the same server: gobuster vhost -u http://target -w wordlist.',
   'gobuster vhost -u ...',
   '{"type":"command","contains":"gobuster vhost"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-hashcat-ntlm')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (2, 'Use rockyou wordlist',
   'Re-run hashcat against rockyou.txt to maximise crack rate against NTLM (-m 1000).',
   'hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt',
   '{"type":"command","contains":"rockyou"}'::jsonb, 10),
  (3, 'Show cracked passwords',
   'Display recovered plaintexts with hashcat --show.',
   'hashcat -m 1000 hashes.txt --show',
   '{"type":"command","contains":"--show"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-hydra-ssh')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (2, 'Throttle the attack',
   'Re-run hydra limiting parallel tasks to 4 (-t 4) so the SSH service does not lock you out.',
   'Add -t 4 to your hydra command.',
   '{"type":"command","contains":"-t 4"}'::jsonb, 10),
  (3, 'Verify with ssh',
   'Once a credential is found, log in with ssh user@target to confirm it works.',
   'ssh kali@10.10.10.5',
   '{"type":"command","contains":"ssh "}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-seimpersonate')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (2, 'Confirm the privilege',
   'First, confirm SeImpersonatePrivilege is enabled on your token with whoami /priv.',
   'whoami /priv',
   '{"type":"command","contains":"whoami /priv"}'::jsonb, 10),
  (3, 'Catch the SYSTEM shell',
   'Set up a netcat listener on Kali to receive the SYSTEM-level reverse shell PrintSpoofer launches.',
   'nc -lvnp 4444',
   '{"type":"command","contains":"nc -l"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-sudo-gtfobins')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (2, 'Enumerate sudo rights first',
   'Always start by running sudo -l to see exactly which binaries you can run as root.',
   'sudo -l',
   '{"type":"command","contains":"sudo -l"}'::jsonb, 10),
  (3, 'Verify root access',
   'Inside the spawned shell, run id to confirm you are uid=0 (root).',
   'id',
   '{"type":"command","contains":"id"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-kerberoast')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'Validate cracked credential',
   'Once hashcat recovers the plaintext, validate by authenticating with crackmapexec smb.',
   'crackmapexec smb dc01.lab.local -u svc_sql -p Password1',
   '{"type":"command","contains":"crackmapexec"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-linpeas-enum')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'Hunt for SUID binaries',
   'Manually verify with find / -perm -4000 -type f 2>/dev/null to spot SUID escalation paths.',
   'find / -perm -4000 -type f 2>/dev/null',
   '{"type":"command","contains":"-perm -4000"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-nmap-discovery')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'Aggressive scan + OS detection',
   'Finally run an aggressive scan with -A on the live host you found to detect OS, services and run default scripts.',
   'nmap -A 10.10.10.5',
   '{"type":"command","contains":"nmap -A"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-smb-enum')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'Check for null sessions',
   'Use rpcclient -U "" target to test if anonymous RPC binds are allowed.',
   'rpcclient -U "" 10.10.10.5',
   '{"type":"command","contains":"rpcclient"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-sqlmap-dump')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'Spawn a SQL shell',
   'Drop into an interactive SQL shell to issue ad-hoc queries: sqlmap -u <url> --sql-shell.',
   'sqlmap -u "http://target/page?id=1" --sql-shell',
   '{"type":"command","contains":"--sql-shell"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='pen200-winpeas-enum')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (3, 'List unquoted service paths',
   'Manually confirm with wmic service get name,pathname,startmode | findstr /i "auto" | findstr /v /i "c:\\windows\\\\".',
   'wmic service get name,pathname,startmode',
   '{"type":"command","contains":"wmic service"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;
