// PEN-200 / OSCP+ deep module explanations.
// Same shape as src/lib/moduleExplanations.ts (SC-900) so the Module page
// renders without changes. Includes verified `furtherReading` source links to
// the canonical references for each topic (OffSec syllabus, HackTricks,
// PortSwigger Web Academy, OWASP, MITRE ATT&CK, etc.).

import type { ModuleExplanation } from "./moduleExplanations";

// ----------------------------------------------------------------------------
// Helper to keep entries compact while still satisfying the full type.
// ----------------------------------------------------------------------------
type Partial5W1H = Partial<Pick<ModuleExplanation,
  "what" | "why" | "who" | "when" | "where" | "how"
>>;

function build(base: {
  moduleSlug: string;
  tagline: string;
  overview: string;
  whyItMatters: string;
  sections: Partial5W1H;
  conceptDeepDives: ModuleExplanation["conceptDeepDives"];
  comparisons?: ModuleExplanation["comparisons"];
  realExamples?: ModuleExplanation["realExamples"];
  keyTerms?: ModuleExplanation["keyTerms"];
  commonPitfalls?: string[];
  faqs?: ModuleExplanation["faqs"];
  selfCheck?: ModuleExplanation["selfCheck"];
  examTips?: string[];
  furtherReading: ModuleExplanation["furtherReading"];
}): ModuleExplanation {
  const def = (h: string, body: string) => ({ heading: h, body });
  return {
    moduleSlug: base.moduleSlug,
    tagline: base.tagline,
    overview: base.overview,
    whyItMatters: base.whyItMatters,
    what: base.sections.what ?? def("What is this?", base.overview),
    why: base.sections.why ?? def("Why does it matter?", base.whyItMatters),
    who: base.sections.who ?? def("Who performs this?", "Penetration testers, red teamers, and OSCP+ candidates."),
    when: base.sections.when ?? def("When is it used?", "During the corresponding phase of an external or internal engagement."),
    where: base.sections.where ?? def("Where in the kill chain?", "Mapped to the relevant MITRE ATT&CK tactics for this stage."),
    how: base.sections.how ?? def("How is it done?", "Using the tools and methodology covered in the labs for this module."),
    conceptDeepDives: base.conceptDeepDives,
    comparisons: base.comparisons ?? [],
    realExamples: base.realExamples ?? [],
    keyTerms: base.keyTerms ?? [],
    commonPitfalls: base.commonPitfalls ?? [],
    faqs: base.faqs ?? [],
    selfCheck: base.selfCheck ?? [],
    examTips: base.examTips ?? [],
    furtherReading: base.furtherReading,
  };
}

// ----------------------------------------------------------------------------
// Modules
// ----------------------------------------------------------------------------

const m1 = build({
  moduleSlug: "pen200-intro-cyber",
  tagline: "The pentester mindset, OSCP+ structure, and rules of engagement.",
  overview:
    "Module 1 establishes how professional penetration testers think and operate. You learn the kill chain, the four engagement types (black/grey/white-box & red team), and the hard-and-fast legal/ethical rules that separate ethical hacking from a crime. You also get a tour of the OSCP+ exam.",
  whyItMatters:
    "Without scope and authorisation, every later technique is illegal. The mindset you build here — 'enumerate broadly, exploit deeply, document everything, try harder' — is exactly what the OSCP+ exam scores you on.",
  sections: {
    what: { heading: "What is offensive security?", body: "Authorised simulation of real attacks against systems, networks, and people to find weaknesses before adversaries do.", bullets: ["Pentest", "Red team", "Purple team", "Bug bounty"] },
    why: { heading: "Why simulate attacks?", body: "Because defenders only know what they have tested. A finding from a pentest is cheaper than a breach by 100×." },
    who: { heading: "Who is involved?", body: "Pentester, project sponsor, blue team, legal/compliance. Authorisation must be in writing." },
  },
  conceptDeepDives: [
    {
      id: "kill-chain",
      name: "Cyber Kill Chain & MITRE ATT&CK",
      oneLine: "Two complementary models that describe attacker steps end-to-end.",
      formal: "The Lockheed Martin Cyber Kill Chain breaks an attack into 7 phases (recon → weaponisation → delivery → exploitation → installation → C2 → actions on objectives). MITRE ATT&CK is a more granular matrix of Tactics (the 'why') and Techniques (the 'how').",
      plainEnglish: "Kill chain = the storyline. ATT&CK = the dictionary of every move an attacker can make.",
      analogy: "Kill chain is the screenplay; ATT&CK is the prop list and the playbook for each scene.",
      howItWorks: "You map every action you perform in an engagement to an ATT&CK technique so the blue team can replay and detect it.",
      microsoftMapping: "Defender XDR alerts and Sentinel analytic rules are tagged with ATT&CK technique IDs (T1059, T1003 …).",
      whenToUse: "Always — every report finding should cite the ATT&CK technique it abused.",
      commonMistake: "Treating the kill chain as strictly sequential. Real attackers loop and pivot between phases constantly.",
      examAngle: "OSCP+ asks you to think in phases — recon → exploit → privesc → lateral. Your report follows the same structure.",
    },
    {
      id: "rules-of-engagement",
      name: "Rules of Engagement (RoE)",
      oneLine: "The signed contract that defines scope, hours, methods, and emergency contacts.",
      formal: "RoE is a written agreement between the testing party and the customer that explicitly authorises specific IPs/hosts/users, prohibits certain techniques (e.g. DoS), and defines escalation procedures.",
      plainEnglish: "It's the permission slip. No RoE = computer crime.",
      analogy: "Like a movie stunt contract: it spells out exactly which buildings the stuntman is allowed to set on fire.",
      howItWorks: "Both sides sign before any traffic is sent. Out-of-scope hosts must be reported but never touched.",
      microsoftMapping: "When testing M365 / Azure tenants, Microsoft also requires their own Pentest Rules of Engagement.",
      whenToUse: "Every engagement, every time. No exceptions.",
      commonMistake: "Assuming verbal approval is enough.",
      examAngle: "The OSCP+ exam itself is your RoE — only the listed targets and lab subnet are in scope.",
    },
  ],
  furtherReading: [
    { label: "OffSec PEN-200 syllabus", url: "https://www.offsec.com/courses/pen-200/" },
    { label: "Lockheed Martin Cyber Kill Chain", url: "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html" },
    { label: "MITRE ATT&CK Matrix for Enterprise", url: "https://attack.mitre.org/matrices/enterprise/" },
    { label: "Microsoft Cloud Pentest Rules of Engagement", url: "https://www.microsoft.com/en-us/msrc/pentest-rules-of-engagement" },
  ],
  examTips: ["Always write down scope before you start typing.", "Time-box recon to ~30 % of total exam time."],
});

const m2 = build({
  moduleSlug: "pen200-report-writing",
  tagline: "Turning shells into a report a CISO will actually act on.",
  overview:
    "OSCP+ is graded on the report, not the shells. This module teaches the standard report structure (executive summary → methodology → findings → evidence → remediation), how to score with CVSS v3.1, and how to capture reproducible evidence (commands, screenshots, hashes).",
  whyItMatters:
    "A poorly written report can fail an otherwise perfect OSCP+ attempt. In the real world, it's also the only artefact most stakeholders ever see.",
  sections: {},
  conceptDeepDives: [
    {
      id: "cvss-v3",
      name: "CVSS v3.1 Scoring",
      oneLine: "An industry-standard 0.0–10.0 score for a vulnerability's severity.",
      formal: "CVSS v3.1 has Base (intrinsic), Temporal (current state, e.g. exploit availability), and Environmental (per-organisation impact) metrics. The Base score is what you put in reports.",
      plainEnglish: "It's a recipe: pick attack vector, complexity, privileges, user interaction, then CIA impact — the calculator gives a number.",
      analogy: "Like a Scoville scale for bugs.",
      howItWorks: "Use the FIRST.org calculator, paste the resulting vector string into your finding (e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8).",
      microsoftMapping: "Microsoft Security Update Guide and MSRC publish CVSS v3.1 vectors for every CVE.",
      whenToUse: "Every finding in every report.",
      commonMistake: "Scoring environmental severity (your customer's risk) as base severity.",
      examAngle: "OSCP+ wants you to justify severity, not just guess 'High'.",
    },
  ],
  furtherReading: [
    { label: "OffSec exam report template", url: "https://help.offsec.com/hc/en-us/articles/360046404594-OSCP-Exam-Guide" },
    { label: "FIRST CVSS v3.1 calculator", url: "https://www.first.org/cvss/calculator/3.1" },
    { label: "NIST SP 800-115 — Pentest reporting guide", url: "https://csrc.nist.gov/publications/detail/sp/800-115/final" },
  ],
  examTips: ["Take screenshots at every privilege transition (low → user → admin).", "Save command output to a file as you go — never reconstruct it later."],
});

const m3 = build({
  moduleSlug: "pen200-info-gathering",
  tagline: "If you don't enumerate, you don't exploit. Recon is 80 % of pentesting.",
  overview:
    "Module 3 covers passive (no traffic to target) and active (sending packets) reconnaissance. You learn nmap host & service discovery, SMB / SMTP / SNMP enumeration, and subdomain harvesting — the foundation for every other PEN-200 module.",
  whyItMatters:
    "On the OSCP+ exam, candidates fail because they exploit the wrong host or miss a service. Strong recon = right targets, right CVEs, every time.",
  sections: {
    where: { heading: "Where in MITRE ATT&CK?", body: "Tactics: TA0043 Reconnaissance (passive) and TA0007 Discovery (active, post-foothold)." },
  },
  conceptDeepDives: [
    {
      id: "nmap",
      name: "nmap — the Swiss-army scanner",
      oneLine: "TCP/UDP port scanner with version detection, OS fingerprinting, and 600+ NSE scripts.",
      formal: "nmap (Network Mapper) is an open-source utility for network discovery and security auditing, supporting SYN/Connect/UDP scans, service-version detection (-sV), default scripts (-sC), and aggressive OS fingerprinting (-O / -A).",
      plainEnglish: "It knocks on every port and writes down which doors opened, what's behind them, and what version it is.",
      analogy: "Like a building inspector walking down every hallway and listing every shop and what they sell.",
      howItWorks: "Stage 1: host discovery (-sn). Stage 2: top-1000 SYN scan. Stage 3: full TCP scan (-p-) on live hosts. Stage 4: service/version + default scripts (-sCV) on open ports only.",
      microsoftMapping: "N/A — nmap is vendor-neutral. Defender for Endpoint will detect aggressive scans.",
      whenToUse: "Every engagement, first thing after scope confirmation.",
      commonMistake: "Running -A on /16 ranges and either getting blocked or DoSing the SOC.",
      examAngle: "OSCP+ expects -p- on every host. Skip it and you'll miss the port the box was designed around.",
    },
    {
      id: "smb-enum",
      name: "SMB Enumeration",
      oneLine: "Pulling shares, users, and policy from Windows / Samba servers on tcp/445.",
      formal: "SMB (Server Message Block) is the Windows file-sharing protocol. Enumeration tools like enum4linux-ng, smbclient, and crackmapexec extract null-session info: domain, OS, shares, users, password policy.",
      plainEnglish: "Ask the file server politely (or anonymously) what users and shares it has.",
      analogy: "Like calling a hotel's front desk and asking 'who's staying here?' — sometimes they tell you.",
      howItWorks: "Connect anonymously (-N) → list shares → mount readable shares → grep for credentials in scripts/configs.",
      microsoftMapping: "Modern Windows blocks anonymous SMB by default; legacy servers (and Samba) often don't.",
      whenToUse: "Whenever tcp/445 is open.",
      commonMistake: "Skipping SMB because 'modern Windows is hardened' — exam boxes are intentionally not.",
      examAngle: "Many AD boxes leak the user list via SMB null session — feed it straight into Kerberoast / AS-REP.",
    },
  ],
  comparisons: [{
    title: "Passive vs Active Recon",
    columns: ["Criterion", "Passive", "Active"],
    rows: [
      ["Traffic to target?", "No", "Yes"],
      ["Detection risk", "Near zero", "Medium-High"],
      ["Tools", "WHOIS, Shodan, crt.sh", "nmap, gobuster, enum4linux"],
      ["Done when?", "Always first", "After scope confirmed"],
    ],
    bottomLine: "Start passive (zero noise), pivot to active once you have a target list.",
  }],
  furtherReading: [
    { label: "nmap official reference", url: "https://nmap.org/book/man.html" },
    { label: "HackTricks — Pentesting Methodology", url: "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-methodology.html" },
    { label: "HackTricks — SMB enumeration (445)", url: "https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-smb.html" },
    { label: "MITRE ATT&CK — Reconnaissance (TA0043)", url: "https://attack.mitre.org/tactics/TA0043/" },
  ],
  examTips: ["Always run nmap -p- as your second scan.", "Save scan output with -oA so you can grep it later."],
});

const m6 = build({
  moduleSlug: "pen200-web-attacks",
  tagline: "OWASP Top 10 in practice — XSS, CSRF, file inclusion, file upload, SSRF.",
  overview:
    "Module 6 covers the most common web flaws you will see on OSCP+. Each attack is taught with a manual proof-of-concept first, then automation. You learn to identify, exploit, and remediate each class.",
  whyItMatters:
    "Web apps are the most common entry point in the real world (Verizon DBIR consistently puts web in the top 3) and on OSCP+ at least one box is web-exploitable.",
  sections: {
    where: { heading: "Where in MITRE ATT&CK?", body: "Initial Access — T1190 Exploit Public-Facing Application." },
  },
  conceptDeepDives: [
    {
      id: "xss",
      name: "Cross-Site Scripting (XSS)",
      oneLine: "Injecting attacker-controlled JavaScript into a page another user views.",
      formal: "XSS occurs when user input is rendered in HTML/JS context without proper output encoding. Three types: Reflected (in URL), Stored (saved in DB and shown to others), DOM (entirely client-side sink).",
      plainEnglish: "You write <script> in a comment box and the next person who visits runs your code.",
      analogy: "Sticking a 'kick me' note on someone's back — but the note is a keylogger.",
      howItWorks: "Find a sink (search box, profile field) → inject `<script>alert(1)</script>` → confirm execution → escalate to cookie theft / session hijack / keylogger.",
      microsoftMapping: "Edge has XSS auditor disabled in modern versions — defence is now CSP + output encoding.",
      whenToUse: "Whenever user input is reflected anywhere in the response.",
      commonMistake: "Stopping at alert(1). The OSCP+ wants you to demonstrate impact — at minimum cookie/session theft.",
      examAngle: "Stored XSS that hits an admin panel often chains to admin RCE — high marks.",
    },
    {
      id: "lfi",
      name: "Local File Inclusion (LFI)",
      oneLine: "Tricking an app into reading arbitrary files from disk.",
      formal: "LFI happens when an application uses user input as part of a file path (e.g. ?page=about.php) without sanitising path traversal sequences (../).",
      plainEnglish: "You ask the page to load 'about', then change it to load '/etc/passwd'.",
      analogy: "Asking a librarian for a book by shelf number — and giving the number for the safe in the back office.",
      howItWorks: "Test ?page=../../../../etc/passwd → enumerate readable files → read SSH keys, /proc/self/environ, log files → escalate to RCE via log poisoning or PHP wrappers (php://filter).",
      microsoftMapping: "On Windows IIS/PHP stacks: try ..\\..\\..\\Windows\\win.ini.",
      whenToUse: "Any URL parameter that loads a template/include.",
      commonMistake: "Reading /etc/passwd and stopping. Chain to RCE for full marks.",
      examAngle: "LFI → log poisoning → RCE is a classic OSCP+ chain.",
    },
  ],
  furtherReading: [
    { label: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" },
    { label: "OWASP Top 10:2021", url: "https://owasp.org/Top10/" },
    { label: "PayloadsAllTheThings — Web", url: "https://github.com/swisskyrepo/PayloadsAllTheThings" },
    { label: "HackTricks — File Inclusion / Path Traversal", url: "https://book.hacktricks.wiki/en/pentesting-web/file-inclusion/index.html" },
    { label: "MITRE ATT&CK — T1190", url: "https://attack.mitre.org/techniques/T1190/" },
  ],
  examTips: ["Always view HTML source — comments leak credentials.", "Try every input field for both XSS and SQLi before moving on."],
});

const m7 = build({
  moduleSlug: "pen200-sqli",
  tagline: "Talking directly to the database through an unsanitised input.",
  overview:
    "SQL Injection lets you read, modify, or destroy database content — and often pivot to code execution. You will learn UNION-based extraction, boolean and time-based blind techniques, and how to use sqlmap effectively without getting locked out.",
  whyItMatters: "Still in OWASP Top 10 after 25 years. A single SQLi often equals total compromise of the application and frequently the OS underneath.",
  sections: {},
  conceptDeepDives: [
    {
      id: "union-sqli",
      name: "UNION-based SQL Injection",
      oneLine: "Appending UNION SELECT to merge attacker rows into the original result set.",
      formal: "When the application reflects query results, UNION SELECT lets the attacker append rows from any other table, provided the column count and data types match.",
      plainEnglish: "You ask the page for products, but slip in 'AND ALSO give me everyone's password'.",
      analogy: "Photocopying your own page on top of the school newsletter — and the printer doesn't notice.",
      howItWorks: "1) Find injection point. 2) ORDER BY N to count columns. 3) UNION SELECT NULL,NULL... and replace NULLs to find which echoes back. 4) Extract schema → tables → columns → data.",
      microsoftMapping: "MSSQL has slightly different syntax (xp_cmdshell, OPENROWSET) — note the dialect.",
      whenToUse: "When the page reflects query output back to you.",
      commonMistake: "Forgetting that data types must match — text in a numeric column will error.",
      examAngle: "OSCP+ rewards manual extraction first; sqlmap is a finisher, not a starter.",
    },
  ],
  furtherReading: [
    { label: "PortSwigger — SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
    { label: "sqlmap user manual", url: "https://github.com/sqlmapproject/sqlmap/wiki/Usage" },
    { label: "HackTricks — SQL Injection", url: "https://book.hacktricks.wiki/en/pentesting-web/sql-injection/index.html" },
    { label: "OWASP — SQL Injection Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
  ],
});

const m12 = build({
  moduleSlug: "pen200-password-attacks",
  tagline: "Online brute-force, offline cracking, and password spraying.",
  overview:
    "Password attacks split into two families: online (live service — hydra, crackmapexec) and offline (you have a hash — hashcat, john). You also learn password spraying (one password against many users) which evades lockout policies.",
  whyItMatters: "Every internal engagement and ~70 % of OSCP+ AD chains require cracking at least one hash (Kerberoast, NetNTLMv2, LM/NTLM dumps).",
  sections: {},
  conceptDeepDives: [
    {
      id: "hashcat-modes",
      name: "Hashcat hash modes",
      oneLine: "Hashcat needs the right -m mode for each hash type, otherwise it cracks junk.",
      formal: "Hashcat maps each hash algorithm to a numeric mode: 0=MD5, 1000=NTLM, 1800=sha512crypt, 5600=NetNTLMv2, 13100=Kerberos 5 TGS-REP etcetera. Wrong mode = no cracks, even with the right wordlist.",
      plainEnglish: "Tell hashcat exactly what kind of hash you have, or it tries the wrong recipe.",
      analogy: "Like inserting the right key shape — wrong mode and the lock won't even turn.",
      howItWorks: "1) Identify hash with hashid / hash-identifier. 2) Lookup mode in hashcat --help. 3) Run hashcat -m MODE -a 0 hashes.txt rockyou.txt.",
      microsoftMapping: "NTLM = mode 1000, NetNTLMv2 (responder/relay) = mode 5600, Kerberoast TGS = mode 13100, AS-REP = mode 18200.",
      whenToUse: "Whenever you obtain hashes (DCSync, NTDS.dit, /etc/shadow, cap files, etc).",
      commonMistake: "Cracking NTLM as md5 — same length, totally different algorithm.",
      examAngle: "Memorise modes 1000 / 5600 / 13100 / 18200 — they cover almost every AD lab box.",
    },
  ],
  furtherReading: [
    { label: "Hashcat hash mode reference", url: "https://hashcat.net/wiki/doku.php?id=example_hashes" },
    { label: "Hydra wiki", url: "https://github.com/vanhauser-thc/thc-hydra" },
    { label: "HackTricks — Brute Force / Cracking", url: "https://book.hacktricks.wiki/en/generic-hacking/brute-force.html" },
    { label: "MITRE ATT&CK — T1110 Brute Force", url: "https://attack.mitre.org/techniques/T1110/" },
  ],
  examTips: ["Always run rockyou + best64.rule first — covers ~30 % of weak passwords."],
});

const m13 = build({
  moduleSlug: "pen200-win-privesc",
  tagline: "From shell to SYSTEM via tokens, services, and misconfig.",
  overview:
    "Once you have a low-privilege Windows shell, this module shows the systematic path to NT AUTHORITY\\SYSTEM. You learn token privileges (SeImpersonate, SeBackup), service misconfigurations, scheduled tasks, AlwaysInstallElevated, and how to use winPEAS / PowerUp.",
  whyItMatters: "The OSCP+ scoring model gives major points only for the privileged shell. Privesc is where exams are won or lost.",
  sections: {},
  conceptDeepDives: [
    {
      id: "se-impersonate",
      name: "SeImpersonatePrivilege (Potato attacks)",
      oneLine: "Service accounts holding SeImpersonate can elevate to SYSTEM via the 'potato' family of exploits.",
      formal: "SeImpersonatePrivilege lets a process impersonate a security context after authentication. Combined with a forced NTLM authentication (RPC, COM, DCOM) you trigger a SYSTEM token and impersonate it. Tools: JuicyPotato (≤Win10 1803), PrintSpoofer, RoguePotato, GodPotato.",
      plainEnglish: "If your shell is allowed to 'pretend to be someone else', you trick SYSTEM into talking to you and steal its identity.",
      analogy: "A coat-check attendant who's allowed to wear any coat to deliver it — and decides to walk out wearing the CEO's coat.",
      howItWorks: "1) whoami /priv shows SeImpersonate enabled. 2) Run PrintSpoofer / GodPotato. 3) Receive SYSTEM shell.",
      microsoftMapping: "Defender for Endpoint flags Potato variants by behaviour. Disable Spooler service to mitigate PrintSpoofer.",
      whenToUse: "Any IIS, MSSQL, or service account shell.",
      commonMistake: "Trying JuicyPotato on Server 2019/2022 — patched. Use PrintSpoofer or GodPotato.",
      examAngle: "OSCP+ AD set frequently lands you on a service account — Potato is the standard answer.",
    },
  ],
  furtherReading: [
    { label: "HackTricks — Windows Privilege Escalation", url: "https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html" },
    { label: "PayloadsAllTheThings — Windows Privesc", url: "https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md" },
    { label: "PEASS-ng (winPEAS)", url: "https://github.com/peass-ng/PEASS-ng" },
    { label: "MITRE ATT&CK — T1134 Access Token Manipulation", url: "https://attack.mitre.org/techniques/T1134/" },
  ],
});

const m14 = build({
  moduleSlug: "pen200-linux-privesc",
  tagline: "From user to root via SUID, sudo, cron, and capabilities.",
  overview:
    "Linux privesc is methodical: enumerate (linPEAS / LinEnum), then attack the lowest-hanging fruit — SUID/GTFOBins, sudo NOPASSWD entries, writable cron jobs, world-writable PATH dirs, and Linux capabilities.",
  whyItMatters: "Every Linux box on OSCP+ requires privesc. GTFOBins alone solves a huge percentage of them.",
  sections: {},
  conceptDeepDives: [
    {
      id: "gtfobins",
      name: "GTFOBins & SUID abuse",
      oneLine: "A curated list of legitimate Unix binaries that can be abused to break out, escalate, or read files.",
      formal: "GTFOBins documents how each binary (find, vim, awk, less, ...) can be misused when present as SUID, available via sudo, or with capabilities. Each entry shows the exact one-liner.",
      plainEnglish: "Some normal Linux commands, when run as root, can hand you a root shell. GTFOBins is the cheat sheet.",
      analogy: "A janitor's master key that also happens to open the executive floor.",
      howItWorks: "1) find / -perm -u=s -type f 2>/dev/null lists SUID. 2) For each, check gtfobins.github.io. 3) Run the one-liner.",
      microsoftMapping: "N/A — Linux topic.",
      whenToUse: "Every Linux foothold.",
      commonMistake: "Ignoring binaries you don't recognise. Always check GTFOBins, even for obscure ones.",
      examAngle: "OSCP+ Linux boxes routinely set a custom binary SUID — check GTFOBins for it.",
    },
  ],
  furtherReading: [
    { label: "GTFOBins", url: "https://gtfobins.github.io/" },
    { label: "HackTricks — Linux Privilege Escalation", url: "https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html" },
    { label: "PEASS-ng (linPEAS)", url: "https://github.com/peass-ng/PEASS-ng" },
    { label: "Linux Capabilities reference", url: "https://man7.org/linux/man-pages/man7/capabilities.7.html" },
  ],
});

const m17 = build({
  moduleSlug: "pen200-ad-enum",
  tagline: "Mapping the domain so you can pick the shortest path to Domain Admin.",
  overview:
    "Active Directory holds users, groups, computers, GPOs, and trusts. Enumerating it (PowerView, SharpHound, BloodHound) reveals the misconfigurations — Kerberoastable accounts, unconstrained delegation, ACL misuse — that make lateral movement trivial.",
  whyItMatters: "OSCP+ now mandates a 3-host AD set worth 40 points. You cannot pass without it.",
  sections: {},
  conceptDeepDives: [
    {
      id: "bloodhound",
      name: "BloodHound + SharpHound",
      oneLine: "Collects AD object data (SharpHound) and visualises attack paths as a graph (BloodHound).",
      formal: "SharpHound is a C#/PowerShell collector that enumerates users, groups, sessions, ACLs, GPOs, trusts, and certificates from a domain user context. BloodHound (Neo4j-backed UI) lets you query 'shortest path to Domain Admin' and pre-built attack chains.",
      plainEnglish: "It draws the org chart of the domain and highlights the shortest 'who-can-pwn-whom' route.",
      analogy: "Google Maps for hackers — type your destination (Domain Admin) and it plots the route.",
      howItWorks: "1) Run SharpHound -CollectionMethods All on a domain-joined host. 2) Drop the .zip into BloodHound. 3) Run pre-built query 'Shortest Paths to Domain Admins from Owned Principals'.",
      microsoftMapping: "Defender for Identity (MDI) detects SharpHound LDAP queries on default settings.",
      whenToUse: "Immediately after the first domain credential.",
      commonMistake: "Forgetting to mark your foothold user as 'owned' in BloodHound — paths won't show.",
      examAngle: "Use BloodHound to find Kerberoastable users and ACL paths quickly under exam time pressure.",
    },
  ],
  furtherReading: [
    { label: "BloodHound official docs", url: "https://bloodhound.specterops.io/" },
    { label: "HackTricks — Active Directory Methodology", url: "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/index.html" },
    { label: "ADSecurity by Sean Metcalf", url: "https://adsecurity.org/" },
    { label: "MITRE ATT&CK — Discovery (TA0007)", url: "https://attack.mitre.org/tactics/TA0007/" },
  ],
});

const m18 = build({
  moduleSlug: "pen200-ad-auth",
  tagline: "Kerberoasting, AS-REP roasting, NTLM relay, Pass-the-Hash.",
  overview:
    "AD auth attacks abuse Kerberos and NTLM design choices. You will request and crack TGS tickets (Kerberoast), grab AS-REP hashes from users without preauth, relay NTLM auth via responder + ntlmrelayx, and reuse hashes directly (PtH).",
  whyItMatters: "These four attacks underpin almost every internal red team report and most OSCP+ AD chains.",
  sections: {},
  conceptDeepDives: [
    {
      id: "kerberoast",
      name: "Kerberoasting",
      oneLine: "Any domain user can request a TGS for any SPN; the ticket is signed with the service account's password hash → crack offline.",
      formal: "Kerberos issues TGS tickets encrypted with the service account's NTLM hash (RC4) or AES key. Because any authenticated principal can request a TGS, an attacker dumps tickets for SPN-bearing accounts and cracks them offline (hashcat -m 13100).",
      plainEnglish: "Ask the domain politely for a ticket, then crack the password offline at home — no logins, no lockouts.",
      analogy: "Asking the building for a delivery receipt, then steaming it open to read the pin code on the back.",
      howItWorks: "1) GetUserSPNs.py -request domain/user:pass. 2) Save TGS hashes. 3) hashcat -m 13100 hashes rockyou.txt.",
      microsoftMapping: "Microsoft mitigation: long random passwords on service accounts; gMSA (Group Managed Service Accounts).",
      whenToUse: "First action after getting any low-priv domain user.",
      commonMistake: "Trying to crack AES-encrypted tickets from gMSA — practically impossible.",
      examAngle: "If GetUserSPNs returns hashes, that's almost always your path forward in the AD set.",
    },
  ],
  furtherReading: [
    { label: "HackTricks — Kerberoasting", url: "https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/kerberoast.html" },
    { label: "Impacket toolkit", url: "https://github.com/fortra/impacket" },
    { label: "Sean Metcalf — Kerberoasting paper", url: "https://adsecurity.org/?p=2293" },
    { label: "MITRE ATT&CK — T1558.003 Kerberoasting", url: "https://attack.mitre.org/techniques/T1558/003/" },
  ],
});

const m19 = build({
  moduleSlug: "pen200-ad-lateral",
  tagline: "From any-domain-user to Domain Admin via WMI, DCSync, and Golden Tickets.",
  overview:
    "Once you have a credential, lateral movement and persistence techniques (WMI, WinRM, PsExec, DCSync, Golden Ticket) take you to full domain compromise. You also learn the three delegation flavours and how each leads to DA.",
  whyItMatters: "This is what 'compromised the domain' actually means in a report.",
  sections: {},
  conceptDeepDives: [
    {
      id: "dcsync",
      name: "DCSync",
      oneLine: "Pretending to be a Domain Controller and asking the real DC to replicate password hashes.",
      formal: "An account with the 'Replicating Directory Changes' + 'Replicating Directory Changes All' rights can call DRSUAPI's GetNCChanges and pull NTDS.dit hashes for any user — including krbtgt.",
      plainEnglish: "You impersonate a DC and politely request the password database. Active Directory hands it over.",
      analogy: "Calling the bank pretending to be another branch and asking for everyone's PINs to 'sync our records'.",
      howItWorks: "secretsdump.py -just-dc DOMAIN/admin:pass@DC → dumps every NTLM hash, including krbtgt.",
      microsoftMapping: "Defender for Identity has a high-fidelity 'Suspected DCSync' alert.",
      whenToUse: "Any account that BloodHound flags with replication rights.",
      commonMistake: "Dumping then forgetting to grab krbtgt — that's what enables Golden Tickets.",
      examAngle: "DCSync + krbtgt = total domain compromise in one move.",
    },
    {
      id: "golden-ticket",
      name: "Golden Ticket",
      oneLine: "A self-forged TGT signed with the krbtgt hash — valid for 10 years and any user.",
      formal: "Once you have the krbtgt account's NTLM hash (e.g. via DCSync), Mimikatz / Rubeus can forge a TGT for any SID, any group membership, with arbitrary lifetime.",
      plainEnglish: "You have the master key the entire domain trusts — you can mint VIP passes for yourself forever.",
      analogy: "Stealing the printing plates from the Treasury and printing your own valid passports.",
      howItWorks: "mimikatz # kerberos::golden /user:Administrator /domain:lab.local /sid:S-1-5-21-... /krbtgt:HASH /ptt",
      microsoftMapping: "Mitigation: rotate krbtgt password TWICE (it caches the previous hash). Defender for Identity detects anomalous TGT lifetimes.",
      whenToUse: "Persistence after total compromise.",
      commonMistake: "Rotating krbtgt only once — old hash is still valid.",
      examAngle: "Demonstrating Golden Ticket creation is a 'wow' moment for the report.",
    },
  ],
  furtherReading: [
    { label: "HackTricks — Lateral Movement", url: "https://book.hacktricks.wiki/en/windows-hardening/lateral-movement/index.html" },
    { label: "Mimikatz wiki", url: "https://github.com/gentilkiwi/mimikatz/wiki" },
    { label: "ADSecurity — Golden Ticket", url: "https://adsecurity.org/?p=1640" },
    { label: "MITRE ATT&CK — T1003.006 DCSync", url: "https://attack.mitre.org/techniques/T1003/006/" },
  ],
});

// ----------------------------------------------------------------------------
// Lighter, source-link-rich entries for the remaining modules so that every
// curriculum slug has something to render. We use the same `build()` helper
// with one focused deep dive each.
// ----------------------------------------------------------------------------

const lighter = (
  moduleSlug: string,
  tagline: string,
  overview: string,
  conceptName: string,
  conceptOneLine: string,
  conceptHowItWorks: string,
  furtherReading: ModuleExplanation["furtherReading"],
): ModuleExplanation => build({
  moduleSlug,
  tagline,
  overview,
  whyItMatters: tagline,
  sections: {},
  conceptDeepDives: [{
    id: moduleSlug + "-core",
    name: conceptName,
    oneLine: conceptOneLine,
    formal: conceptOneLine,
    plainEnglish: conceptOneLine,
    analogy: "See the labs for a concrete walkthrough.",
    howItWorks: conceptHowItWorks,
    microsoftMapping: "N/A or covered in linked references.",
    whenToUse: "During the appropriate engagement phase — see overview.",
    commonMistake: "Skipping the manual workflow and jumping straight to automation.",
    examAngle: "OSCP+ rewards methodical, manual proof before tooling.",
  }],
  furtherReading,
});

const m4 = lighter(
  "pen200-vuln-scanning",
  "Authenticated and unauthenticated scanning, plus CVE triage.",
  "Vulnerability scanners (Nessus, OpenVAS, nmap NSE) automate detection of known CVEs. Module 4 teaches how to choose scan profiles, suppress false positives, and pivot from a CVE ID to a working exploit.",
  "Nessus & nmap NSE",
  "Two complementary scanners — heavy commercial vs. lightweight script-based.",
  "Run `nmap --script vuln -p- target` for quick wins; use Nessus authenticated scans for full coverage.",
  [
    { label: "Tenable Nessus docs", url: "https://docs.tenable.com/nessus/" },
    { label: "nmap NSE script reference", url: "https://nmap.org/nsedoc/" },
    { label: "Exploit Database", url: "https://www.exploit-db.com/" },
    { label: "NIST National Vulnerability Database", url: "https://nvd.nist.gov/" },
  ],
);

const m5 = lighter(
  "pen200-web-intro",
  "HTTP, Burp Suite, and content discovery — the toolbelt for every web finding.",
  "Before exploiting web flaws you need fluency in HTTP, sessions, and proxying with Burp. You also need to discover the hidden surface: gobuster / ffuf for directories, content type tricks, and source-map leaks.",
  "Burp Suite — proxy, repeater, intruder",
  "An intercepting proxy that lets you tamper with every request and replay them at will.",
  "Configure browser → 127.0.0.1:8080 → install Burp CA → intercept off for browsing, on for tampering. Send interesting requests to Repeater for safe iteration.",
  [
    { label: "PortSwigger — Burp Suite docs", url: "https://portswigger.net/burp/documentation" },
    { label: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" },
    { label: "ffuf wiki", url: "https://github.com/ffuf/ffuf/wiki" },
    { label: "OWASP — HTTP fundamentals", url: "https://owasp.org/www-community/Web_Application_Security_Testing_Cheat_Sheet" },
  ],
);

const m8 = lighter(
  "pen200-client-side",
  "Phishing payloads: macro docs, HTA, and browser exploitation.",
  "Sometimes the easiest path is the user. Module 8 covers macro-enabled Office documents, HTA payloads, and the social-engineering pretext design that makes them work.",
  "Office macro payloads",
  "VBA in Word/Excel that downloads and executes a stager when the user clicks 'Enable Content'.",
  "Generate VBA with msfvenom (-f vba), paste into Document_Open(), serve a listener, send the doc.",
  [
    { label: "MITRE ATT&CK — T1204.002 Malicious File", url: "https://attack.mitre.org/techniques/T1204/002/" },
    { label: "HackTricks — Phishing methodology", url: "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/phishing-methodology/index.html" },
    { label: "Microsoft — Macro security", url: "https://learn.microsoft.com/en-us/deployoffice/security/internet-macros-blocked" },
  ],
);

const m9 = lighter(
  "pen200-public-exploits",
  "Find, vet, and weaponise public exploit code safely.",
  "Module 9 covers the searchsploit workflow, reading exploit source before running it (backdoors are common), and adapting payload offsets/IPs for your target.",
  "searchsploit & Exploit-DB",
  "Local mirror of Exploit-DB you can grep offline — the first stop after any CVE.",
  "`searchsploit <product> <version>` → mirror to working dir with `-m` → read source → patch IPs/ports → run.",
  [
    { label: "Exploit-DB", url: "https://www.exploit-db.com/" },
    { label: "searchsploit usage", url: "https://www.exploit-db.com/searchsploit" },
    { label: "GitHub PoC-in-GitHub repo", url: "https://github.com/nomi-sec/PoC-in-GitHub" },
  ],
);

const m10 = lighter(
  "pen200-fix-exploits",
  "Stack buffer overflow primer and PoC adaptation.",
  "Most public PoCs need IP/port/offset/Shellcode adjustments to fire on your target. Module 10 walks through a 32-bit stack BOF (EIP overwrite) and shows the universal adaptation workflow.",
  "32-bit Stack Buffer Overflow",
  "Overwrite the saved return address (EIP) with the address of a JMP ESP gadget so execution falls into your shellcode.",
  "Fuzz to find crash → find offset (pattern_create / pattern_offset) → identify bad chars → find JMP ESP → generate shellcode (msfvenom) → catch shell.",
  [
    { label: "OffSec — buffer overflow guide", url: "https://www.offsec.com/blog/cracking-the-perimeter-buffer-overflow/" },
    { label: "HackTricks — Stack Buffer Overflow", url: "https://book.hacktricks.wiki/en/binary-exploitation/stack-overflow/index.html" },
    { label: "msfvenom cheat sheet (HackTricks)", url: "https://book.hacktricks.wiki/en/generic-hacking/reverse-shells/msfvenom.html" },
  ],
);

const m11 = lighter(
  "pen200-av-evasion",
  "Bypass static AV with encoding, custom loaders, and AMSI awareness.",
  "Modern AV uses signatures + heuristics + behavioural detection. Module 11 covers the layered evasion approach: avoid known signatures (custom loaders), avoid heuristics (sleep, jitter), and respect AMSI in PowerShell.",
  "AMSI — Anti-Malware Scan Interface",
  "Windows hook that lets AV scan in-memory PowerShell/JScript before execution.",
  "Test detection in a VM (defender enabled) → patch / bypass AMSI in-memory → run payload. Many 1-line bypasses are public but get burned quickly.",
  [
    { label: "MITRE ATT&CK — T1027 Obfuscated Files", url: "https://attack.mitre.org/techniques/T1027/" },
    { label: "HackTricks — AV Bypass", url: "https://book.hacktricks.wiki/en/windows-hardening/av-bypass.html" },
    { label: "Microsoft AMSI overview", url: "https://learn.microsoft.com/en-us/windows/win32/amsi/antimalware-scan-interface-portal" },
  ],
);

const m15 = lighter(
  "pen200-tunneling",
  "Pivot through firewalled networks with SSH, chisel, and proxychains.",
  "After a foothold you often need to reach internal-only subnets. Module 15 covers SSH local/remote/dynamic forwarding, chisel SOCKS tunnels, and proxychains for routing arbitrary tools through them.",
  "Dynamic SSH SOCKS proxy",
  "`ssh -D 1080` opens a SOCKS proxy on your Kali that forwards through the compromised host into its network.",
  "1) `ssh -D 1080 user@pivot`. 2) Edit /etc/proxychains.conf → socks5 127.0.0.1 1080. 3) `proxychains nmap -sT -Pn 10.10.20.0/24`.",
  [
    { label: "HackTricks — Tunneling and Port Forwarding", url: "https://book.hacktricks.wiki/en/generic-hacking/tunneling-and-port-forwarding.html" },
    { label: "chisel project", url: "https://github.com/jpillora/chisel" },
    { label: "ligolo-ng project", url: "https://github.com/nicocha30/ligolo-ng" },
  ],
);

const m16 = lighter(
  "pen200-metasploit",
  "msfconsole workflow, Meterpreter, and post-exploitation modules.",
  "Metasploit is allowed once on the OSCP+ exam. Module 16 teaches the workflow (search → use → set → check → run), Meterpreter post-ex commands (hashdump, migrate, portfwd, kiwi), and the database-backed workflow.",
  "Meterpreter post-exploitation",
  "An in-memory implant with a rich command set: file ops, screenshot, hashdump, port-forward, migrate process, run-as.",
  "Catch a meterpreter session → `getuid` → `getsystem` (when possible) → `hashdump` → `portfwd add` to expose internal services to your Kali.",
  [
    { label: "Offensive Security — Metasploit Unleashed", url: "https://www.offsec.com/metasploit-unleashed/" },
    { label: "HackTricks — Metasploit cheatsheet", url: "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/metasploit/index.html" },
    { label: "Rapid7 Metasploit docs", url: "https://docs.metasploit.com/" },
  ],
);

const toolTour = lighter(
  "pen200-tool-tour",
  "60-minute hands-on tour of the 5 essential Kali tools.",
  "Compressed walkthrough of nmap, gobuster, sqlmap, hydra and msfconsole — the five tools every OSCP+ candidate uses on day one. Each tool is covered just long enough to give you the muscle memory.",
  "Kali essentials",
  "Five tools that together cover ~80 % of early-engagement work.",
  "Run them in order on the seeded labs: discover hosts → discover web paths → exploit SQLi → spray/brute-force creds → land your first shell with msfconsole.",
  [
    { label: "Kali tools listing", url: "https://www.kali.org/tools/" },
    { label: "HackTricks — Pentesting Methodology", url: "https://book.hacktricks.wiki/en/generic-methodologies-and-resources/pentesting-methodology.html" },
    { label: "OffSec PEN-200 syllabus", url: "https://www.offsec.com/courses/pen-200/" },
  ],
);

// ----------------------------------------------------------------------------
// Registry + lookup
// ----------------------------------------------------------------------------
const PEN200_EXPLANATIONS: Record<string, ModuleExplanation> = {
  "pen200-intro-cyber": m1,
  "pen200-report-writing": m2,
  "pen200-info-gathering": m3,
  "pen200-vuln-scanning": m4,
  "pen200-web-intro": m5,
  "pen200-web-attacks": m6,
  "pen200-sqli": m7,
  "pen200-client-side": m8,
  "pen200-public-exploits": m9,
  "pen200-fix-exploits": m10,
  "pen200-av-evasion": m11,
  "pen200-password-attacks": m12,
  "pen200-win-privesc": m13,
  "pen200-linux-privesc": m14,
  "pen200-tunneling": m15,
  "pen200-metasploit": m16,
  "pen200-ad-enum": m17,
  "pen200-ad-auth": m18,
  "pen200-ad-lateral": m19,
  "pen200-tool-tour": toolTour,
};

export function getPen200ModuleExplanation(slug: string): ModuleExplanation | undefined {
  return PEN200_EXPLANATIONS[slug];
}
