// PEN-200 / OSCP+ curriculum, mirroring the SC-900 / CIS-ITSM shape so all
// course-aware components (Catalog, Module, Lab, Session Plan) work unchanged.
//
// Source: OffSec PEN-200 syllabus (https://www.offsec.com/courses/pen-200/) —
// 19 modules grouped into Recon → Web → Exploitation → Privilege Escalation →
// Lateral Movement → Active Directory.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const pen200ModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "pen200-intro-cyber",
    domain: "concepts",
    title: "Module 1 — Intro to Cybersecurity & the Pentester Mindset",
    code: "PEN200-M1",
    theoryMinutes: 30,
    labBudgetMinutes: 30,
    topics: [
      "CIA triad, threat actors, and the cyber kill chain",
      "Engagement types: black-box, grey-box, white-box, red team, purple team",
      "Pentest phases: scoping → recon → exploitation → post-ex → reporting",
      "Rules of engagement, scope, and authorisation",
      "OSCP+ exam structure and the 'try harder' methodology",
    ],
    labSlugs: ["pen200-kali-tour", "pen200-rules-of-engagement"],
  },
  {
    moduleSlug: "pen200-report-writing",
    domain: "concepts",
    title: "Module 2 — Pentest Report Writing",
    code: "PEN200-M2",
    theoryMinutes: 30,
    labBudgetMinutes: 30,
    topics: [
      "Anatomy of a pro report: exec summary, methodology, findings, evidence",
      "CVSS v3.1 scoring (base, temporal, environmental)",
      "Writing actionable remediation and risk ratings",
      "Screenshots, command history, and reproducibility",
      "OSCP+ exam report requirements (≤24h after exam)",
    ],
    labSlugs: ["pen200-write-finding", "pen200-cvss-score"],
  },
  {
    moduleSlug: "pen200-info-gathering",
    domain: "iam",
    title: "Module 3 — Information Gathering (Recon)",
    code: "PEN200-M3",
    theoryMinutes: 30,
    labBudgetMinutes: 90,
    topics: [
      "Passive recon: WHOIS, DNS, Shodan, Censys, Google dorking",
      "Subdomain enumeration: amass, subfinder, crt.sh",
      "Active recon: nmap host discovery, port and version scanning",
      "Service enumeration: SMB, SMTP, SNMP, NFS, RPC",
      "Mapping the attack surface and prioritising targets",
    ],
    labSlugs: ["pen200-nmap-discovery", "pen200-nmap-version-scan", "pen200-smb-enum", "pen200-subdomain-enum"],
  },
  {
    moduleSlug: "pen200-vuln-scanning",
    domain: "iam",
    title: "Module 4 — Vulnerability Scanning",
    code: "PEN200-M4",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "Authenticated vs unauthenticated scans",
      "Nessus, OpenVAS, and nmap NSE scripts",
      "Triaging false positives and prioritising by exploitability",
      "Mapping CVEs to public exploits (Exploit-DB, Metasploit)",
      "Compliance scans vs offensive scans",
    ],
    labSlugs: ["pen200-nse-vuln-scan", "pen200-triage-cve"],
  },
  {
    moduleSlug: "pen200-web-intro",
    domain: "iam",
    title: "Module 5 — Intro to Web Applications",
    code: "PEN200-M5",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "HTTP/HTTPS fundamentals, methods, status codes, headers",
      "Cookies, sessions, JWTs, and same-origin policy",
      "Burp Suite proxy: intercept, repeater, intruder",
      "Directory and content discovery with gobuster / ffuf",
      "OWASP Top 10 overview",
    ],
    labSlugs: ["pen200-burp-intercept", "pen200-gobuster-dirs"],
  },
  {
    moduleSlug: "pen200-web-attacks",
    domain: "entra",
    title: "Module 6 — Common Web Attacks",
    code: "PEN200-M6",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Cross-Site Scripting (reflected, stored, DOM)",
      "Cross-Site Request Forgery (CSRF) and SameSite cookies",
      "File upload bypasses and webshell deployment",
      "Local & Remote File Inclusion (LFI / RFI)",
      "Server-Side Request Forgery (SSRF)",
    ],
    labSlugs: ["pen200-xss-reflected", "pen200-lfi-exploit", "pen200-file-upload-shell"],
  },
  {
    moduleSlug: "pen200-sqli",
    domain: "entra",
    title: "Module 7 — SQL Injection",
    code: "PEN200-M7",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "In-band vs blind vs out-of-band SQLi",
      "UNION-based extraction: identifying columns and types",
      "Boolean and time-based blind SQLi",
      "Automating with sqlmap (--risk, --level, --tamper)",
      "Hardening: parameterised queries, least-privilege DB users",
    ],
    labSlugs: ["pen200-sqli-union", "pen200-sqli-blind", "pen200-sqlmap-dump"],
  },
  {
    moduleSlug: "pen200-client-side",
    domain: "entra",
    title: "Module 8 — Client-Side Attacks",
    code: "PEN200-M8",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "Macro-enabled Office documents and HTA payloads",
      "Browser exploitation (BeEF basics)",
      "Phishing payload delivery and pretext design",
      "PDF and JavaScript-based attacks",
      "User-driven RCE chains",
    ],
    labSlugs: ["pen200-macro-payload", "pen200-hta-shell"],
  },
  {
    moduleSlug: "pen200-public-exploits",
    domain: "security",
    title: "Module 9 — Locating Public Exploits",
    code: "PEN200-M9",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "searchsploit, Exploit-DB, GitHub PoC repos",
      "Reading exploit code safely before running it",
      "Backdoored exploit detection",
      "CVE → CPE → exploit mapping",
      "Compiling Windows exploits on Kali (mingw)",
    ],
    labSlugs: ["pen200-searchsploit", "pen200-compile-exploit"],
  },
  {
    moduleSlug: "pen200-fix-exploits",
    domain: "security",
    title: "Module 10 — Fixing & Customising Exploits",
    code: "PEN200-M10",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "Modifying shellcode offsets and bad characters",
      "Replacing payloads with msfvenom-generated stagers",
      "Adapting Python 2 PoCs to Python 3",
      "Buffer overflow refresher (32-bit stack BOF)",
      "Egghunter and SEH-based exploits (overview)",
    ],
    labSlugs: ["pen200-bof-eip", "pen200-msfvenom-shellcode"],
  },
  {
    moduleSlug: "pen200-av-evasion",
    domain: "security",
    title: "Module 11 — Antivirus Evasion",
    code: "PEN200-M11",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "Static vs heuristic vs behavioural detection",
      "Encoding & encryption: shikata_ga_nai, custom XOR",
      "Process injection and reflective DLL loading (concepts)",
      "PowerShell AMSI awareness and bypass concepts",
      "Living-off-the-land binaries (LOLBins)",
    ],
    labSlugs: ["pen200-msfvenom-encode", "pen200-amsi-overview"],
  },
  {
    moduleSlug: "pen200-password-attacks",
    domain: "security",
    title: "Module 12 — Password Attacks",
    code: "PEN200-M12",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "Online attacks with hydra, crackmapexec, medusa",
      "Offline cracking: hashcat modes, john the ripper",
      "Wordlist generation: cewl, crunch, hashcat rules",
      "NTLM, Kerberos AS-REP, NetNTLMv2 hash formats",
      "Password spraying vs brute-force vs credential stuffing",
    ],
    labSlugs: ["pen200-hydra-ssh", "pen200-hashcat-ntlm", "pen200-password-spray"],
  },
  {
    moduleSlug: "pen200-win-privesc",
    domain: "security",
    title: "Module 13 — Windows Privilege Escalation",
    code: "PEN200-M13",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Token & privilege abuse (SeImpersonate, SeBackup)",
      "Service misconfigurations: unquoted paths, weak DACLs",
      "AlwaysInstallElevated, scheduled tasks, AutoRuns",
      "Kernel exploits and patch level enumeration",
      "Tools: winPEAS, PowerUp, accesschk",
    ],
    labSlugs: ["pen200-winpeas-enum", "pen200-unquoted-service", "pen200-seimpersonate"],
  },
  {
    moduleSlug: "pen200-linux-privesc",
    domain: "compliance",
    title: "Module 14 — Linux Privilege Escalation",
    code: "PEN200-M14",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "SUID/SGID binaries and GTFOBins",
      "sudo misconfigurations and NOPASSWD",
      "Cron jobs, PATH hijacking, writable scripts",
      "Capabilities (cap_setuid, cap_dac_read_search)",
      "Kernel exploits and container escapes (overview)",
    ],
    labSlugs: ["pen200-linpeas-enum", "pen200-sudo-gtfobins", "pen200-cron-hijack"],
  },
  {
    moduleSlug: "pen200-tunneling",
    domain: "compliance",
    title: "Module 15 — Port Forwarding & Advanced Tunneling",
    code: "PEN200-M15",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "SSH local, remote and dynamic forwarding",
      "chisel, ligolo-ng for SOCKS pivoting",
      "proxychains configuration and gotchas",
      "DNS tunneling and ICMP tunneling (concepts)",
      "Pivoting through multi-tier networks",
    ],
    labSlugs: ["pen200-ssh-pivot", "pen200-chisel-socks"],
  },
  {
    moduleSlug: "pen200-metasploit",
    domain: "compliance",
    title: "Module 16 — The Metasploit Framework",
    code: "PEN200-M16",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "msfconsole workflow: search, use, set, run",
      "Auxiliary, exploit, payload, post modules",
      "Meterpreter: portfwd, hashdump, migrate, kiwi",
      "Sessions, routes, and pivoting via Metasploit",
      "Resource scripts and database (workspace, hosts, services)",
    ],
    labSlugs: ["pen200-msf-exploit", "pen200-meterpreter-postex"],
  },
  {
    moduleSlug: "pen200-ad-enum",
    domain: "exam",
    title: "Module 17 — Active Directory Enumeration",
    code: "PEN200-M17",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Domain, forest, OUs, GPOs, trusts",
      "PowerView and SharpHound collection",
      "BloodHound graph analysis (shortest paths to DA)",
      "Kerberoasting & AS-REP roasting prerequisites",
      "ACL abuse: GenericAll, WriteDACL, AddMember",
    ],
    labSlugs: ["pen200-bloodhound-collect", "pen200-powerview-enum"],
  },
  {
    moduleSlug: "pen200-ad-auth",
    domain: "exam",
    title: "Module 18 — Attacking Active Directory Authentication",
    code: "PEN200-M18",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Kerberos refresher: AS-REQ/AS-REP, TGT, TGS",
      "Kerberoasting: requesting and cracking SPN tickets",
      "AS-REP roasting users without preauth",
      "NTLM relay attacks (responder + ntlmrelayx)",
      "Pass-the-Hash and Pass-the-Ticket",
    ],
    labSlugs: ["pen200-kerberoast", "pen200-asrep-roast", "pen200-pass-the-hash"],
  },
  {
    moduleSlug: "pen200-ad-lateral",
    domain: "exam",
    title: "Module 19 — Lateral Movement in Active Directory",
    code: "PEN200-M19",
    theoryMinutes: 45,
    labBudgetMinutes: 105,
    topics: [
      "WMI, WinRM, PsExec, SMBExec for remote execution",
      "DCSync and DCShadow attacks",
      "Golden & Silver tickets",
      "Unconstrained, constrained, and resource-based delegation",
      "Path to Domain Admin via BloodHound chains",
    ],
    labSlugs: ["pen200-wmi-lateral", "pen200-dcsync", "pen200-golden-ticket"],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Exam prep — OSCP+ strategy",
    theoryMinutes: 30,
    labBudgetMinutes: 30,
    topics: [
      "OSCP+ format: 24h hands-on + 24h reporting; bonus & AD set required",
      "Time management: enumerate broadly, exploit deeply, document constantly",
      "Building your personal cheatsheet & methodology",
      "When to stop, take a break, and rotate targets",
    ],
    labSlugs: [],
  },
];

const m = (slug: string) =>
  pen200ModuleNotes.find((x) => (slug === "exam" ? x.domain === "exam" && x.moduleSlug === null : x.moduleSlug === slug))!;

/* ---------- 8-day plan (≈ 2h / day) — recommended ---------- */
/* ---------- "5-day" cadence (≈ 2-6h / day across 8 days) ----------
 * PEN-200 / OSCP+ is a ~45h syllabus, so the 2h-cadence format extends
 * to 8 days and several days run long (privesc + AD especially). For a
 * strict 2h/day cadence, plan to spread each long day across two
 * consecutive sessions. */
export const pen200FiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations & Reporting (≈ 2h)",
    description: "Pentester mindset, OSCP+ structure, and how to write a finding.",
    modules: [m("pen200-intro-cyber"), m("pen200-report-writing")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Recon & Vulnerability Scanning (≈ 3h 30m)",
    description: "Map the target with nmap, subdomain tools, and triage scanner output.",
    modules: [m("pen200-info-gathering"), m("pen200-vuln-scanning")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "Web Apps & Common Attacks (≈ 3h 45m)",
    description: "Burp basics, content discovery, XSS, LFI, file upload — and stored shells.",
    modules: [m("pen200-web-intro"), m("pen200-web-attacks")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "SQL Injection & Client-Side (≈ 3h 30m)",
    description: "UNION + blind SQLi, sqlmap, then macros and HTA-based phishing payloads.",
    modules: [m("pen200-sqli"), m("pen200-client-side")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Public Exploits, Customisation & AV Evasion (≈ 4h 45m)",
    description: "searchsploit workflow, fixing PoCs, msfvenom, and evading static AV.",
    modules: [m("pen200-public-exploits"), m("pen200-fix-exploits"), m("pen200-av-evasion")],
  },
  {
    id: "day6",
    label: "Day 6",
    subtitle: "Password Attacks & Privilege Escalation (≈ 6h 15m — extended day)",
    description: "Hydra/hashcat workflows, then Windows + Linux privesc enumeration.",
    modules: [m("pen200-password-attacks"), m("pen200-win-privesc"), m("pen200-linux-privesc")],
  },
  {
    id: "day7",
    label: "Day 7",
    subtitle: "Tunneling & Metasploit (≈ 3h 30m)",
    description: "Pivot through chained networks with chisel/SSH, then orchestrate with msfconsole.",
    modules: [m("pen200-tunneling"), m("pen200-metasploit")],
  },
  {
    id: "day8",
    label: "Day 8",
    subtitle: "Active Directory + Exam Prep (≈ 8h — extended day)",
    description: "Enumerate, attack auth, move laterally, then OSCP+ exam strategy.",
    modules: [m("pen200-ad-enum"), m("pen200-ad-auth"), m("pen200-ad-lateral"), m("exam")],
  },
];

/* ---------- 2-day intensive (extended days — full ~35h syllabus) ----------
 * Full PEN-200 content is ~35h. The 4h-per-day format cannot fit it,
 * so this 2-day plan runs long. Recommended only for OSCP+ bootcamp
 * weeks; otherwise pick the 8-day "2h cadence". */
export const pen200TwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations → Recon → Web → SQLi → Client-side → Exploits (≈ 17h 30m — extended)",
    description: "External-attacker workflow: foundations, reporting, recon, web, SQLi, client-side, locating / customising exploits and AV evasion.",
    modules: pen200ModuleNotes.filter((x) => [
      "pen200-intro-cyber", "pen200-report-writing", "pen200-info-gathering", "pen200-vuln-scanning",
      "pen200-web-intro", "pen200-web-attacks", "pen200-sqli", "pen200-client-side",
      "pen200-public-exploits", "pen200-fix-exploits", "pen200-av-evasion",
    ].includes(x.moduleSlug ?? "")),
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Passwords → Privesc → Tunneling → AD → Exam (≈ 17h 45m — extended)",
    description: "Password attacks, post-exploitation, lateral movement, full AD attack path, and OSCP+ exam plan.",
    modules: pen200ModuleNotes.filter((x) => [
      "pen200-password-attacks", "pen200-win-privesc", "pen200-linux-privesc", "pen200-tunneling",
      "pen200-metasploit", "pen200-ad-enum", "pen200-ad-auth", "pen200-ad-lateral",
    ].includes(x.moduleSlug ?? "") || (x.moduleSlug === null && x.domain === "exam")),
  },
];

/* ---------- 1-day bootcamp (condensed highlights — full curriculum is ~45h) ---------- */
export const pen200OneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "OSCP+ highlights bootcamp (condensed 8h)",
    description: "Whirlwind tour of the entire OSCP+ syllabus in a single 8-hour day. Lab time is heavily trimmed — book the 8-day 2h cadence for genuine OSCP+ preparation.",
    modules: pen200ModuleNotes,
  },
];

/* ---------- 1-hour tool tour ---------- */
const pen200ToolTourModule: ModuleNote = {
  moduleSlug: "pen200-tool-tour",
  domain: "concepts",
  title: "Kali tool tour — 5 essentials in 60 minutes",
  code: "PEN200-T1",
  theoryMinutes: 10,
  labBudgetMinutes: 50,
  topics: [
    "1. nmap host & service discovery",
    "2. gobuster directory brute-force",
    "3. sqlmap automated SQL injection",
    "4. hydra credential brute-force",
    "5. msfconsole basic exploit workflow",
  ],
  labSlugs: [
    "pen200-kali-tour",
    "pen200-nmap-discovery",
    "pen200-gobuster-dirs",
    "pen200-sqlmap-dump",
    "pen200-hydra-ssh",
    "pen200-msf-exploit",
  ],
};

export const pen200OneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Session",
    subtitle: "Kali tool tour — 5 essentials in 1h",
    description:
      "Hands-on 60-minute walkthrough of the five tools every OSCP+ candidate uses on day one: nmap, gobuster, sqlmap, hydra and msfconsole.",
    modules: [pen200ToolTourModule],
  },
];
