/**
 * SOC Academy — MITRE ATT&CK reference subset used across scenarios and lessons.
 */
import type { MitreTactic, MitreTechnique } from "../types";

export const MITRE_TACTICS: MitreTactic[] = [
  { id: "TA0043", name: "Reconnaissance",        question: "What did they learn about us first?",      order: 0 },
  { id: "TA0001", name: "Initial Access",        question: "How did they get in?",                     order: 1 },
  { id: "TA0002", name: "Execution",             question: "How did they run their code?",             order: 2 },
  { id: "TA0003", name: "Persistence",           question: "How do they survive a reboot?",            order: 3 },
  { id: "TA0004", name: "Privilege Escalation",  question: "How did they become admin?",               order: 4 },
  { id: "TA0005", name: "Defense Evasion",       question: "How did they hide?",                       order: 5 },
  { id: "TA0006", name: "Credential Access",     question: "How did they steal passwords?",            order: 6 },
  { id: "TA0007", name: "Discovery",             question: "How did they map the environment?",        order: 7 },
  { id: "TA0008", name: "Lateral Movement",      question: "How did they spread?",                     order: 8 },
  { id: "TA0009", name: "Collection",            question: "What data did they gather?",               order: 9 },
  { id: "TA0011", name: "Command and Control",   question: "How do they communicate with malware?",    order: 10 },
  { id: "TA0010", name: "Exfiltration",          question: "How did data leave the network?",          order: 11 },
  { id: "TA0040", name: "Impact",                question: "What damage did they do?",                 order: 12 },
];

export const MITRE_TECHNIQUES: MitreTechnique[] = [
  {
    id: "T1595", name: "Active Scanning", tacticIds: ["TA0043"],
    description: "Probing target infrastructure for open ports, services and weaknesses before attacking.",
    example: "A burst of connection attempts across ports 21,22,80,443,3389 from one external IP.",
    logSources: ["firewall", "ids"],
    detectionIdea: "One src_ip touching many distinct dest ports/hosts in a short window.",
  },
  {
    id: "T1566", name: "Phishing", tacticIds: ["TA0001"],
    description: "Malicious emails carrying links or attachments to gain initial access.",
    example: "'Invoice_Q2.docm' attachment that asks the user to Enable Macros.",
    logSources: ["email gateway", "proxy", "edr"],
    detectionIdea: "Office process spawning script interpreters shortly after an attachment open.",
  },
  {
    id: "T1566.001", name: "Spearphishing Attachment", tacticIds: ["TA0001"],
    description: "Targeted phishing with a weaponised file attached.",
    example: "Finance team receives a macro-enabled 'payment reminder' doc from a look-alike domain.",
    logSources: ["email gateway", "edr", "sysmon"],
    detectionIdea: "winword.exe/excel.exe writing then executing new files, or spawning powershell/cmd.",
  },
  {
    id: "T1078", name: "Valid Accounts", tacticIds: ["TA0001", "TA0003", "TA0004"],
    description: "Using legitimate (stolen or guessed) credentials to log in like a normal user.",
    example: "The attacker signs into VPN with j.doe's real password obtained via brute force.",
    logSources: ["authentication", "vpn", "cloud audit"],
    detectionIdea: "Logins from new geo/ASN, impossible travel, or success right after failure bursts.",
  },
  {
    id: "T1110", name: "Brute Force", tacticIds: ["TA0006"],
    description: "Systematically guessing credentials until one works.",
    example: "Hundreds of failed logins against one account from a single source IP.",
    logSources: ["authentication"],
    detectionIdea: "stats count of failures by user, src_ip with a threshold; success-after-failures.",
  },
  {
    id: "T1110.001", name: "Password Guessing", tacticIds: ["TA0006"],
    description: "Repeated guesses against one or few accounts.",
    example: "40 × EventCode 4625 for j.doe from 203.0.113.5 in six minutes.",
    logSources: ["authentication"],
    detectionIdea: "Failure count per (user, src_ip) over a rolling window above threshold.",
  },
  {
    id: "T1110.003", name: "Password Spraying", tacticIds: ["TA0006"],
    description: "One password tried across many accounts to evade lockouts.",
    example: "One IP fails exactly once against 60 different users in 10 minutes.",
    logSources: ["authentication"],
    detectionIdea: "High dc(user) with low per-user failure count from one src_ip.",
  },
  {
    id: "T1059", name: "Command and Scripting Interpreter", tacticIds: ["TA0002"],
    description: "Abusing shells and interpreters (PowerShell, cmd, bash) to run attacker code.",
    example: "An Office macro launches an interpreter to download second-stage malware.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "Unusual parent processes spawning interpreters; encoded/obfuscated command lines.",
  },
  {
    id: "T1059.001", name: "PowerShell", tacticIds: ["TA0002"],
    description: "Using PowerShell — often encoded or download-cradle one-liners — for execution.",
    example: "powershell.exe -nop -w hidden -enc JABzAD0A… spawned by winword.exe.",
    logSources: ["sysmon", "edr", "powershell logs"],
    detectionIdea: "Flags like -enc/-nop/-w hidden, or Office parents; ScriptBlock logging content.",
  },
  {
    id: "T1053.005", name: "Scheduled Task", tacticIds: ["TA0003", "TA0002"],
    description: "Creating Windows scheduled tasks so malware re-runs automatically.",
    example: "schtasks /create /tn 'WindowsUpdateSvc' /tr C:\\ProgramData\\upd.exe /sc minute.",
    logSources: ["wineventlog", "sysmon"],
    detectionIdea: "EventCode 4698 task creation with binaries in user-writable paths.",
  },
  {
    id: "T1136.001", name: "Create Account: Local", tacticIds: ["TA0003"],
    description: "Creating rogue accounts for durable access.",
    example: "net user svc-update P@ss123 /add at 02:14, outside change windows.",
    logSources: ["wineventlog"],
    detectionIdea: "EventCode 4720 account creation by non-provisioning processes or odd hours.",
  },
  {
    id: "T1548", name: "Abuse Elevation Control", tacticIds: ["TA0004", "TA0005"],
    description: "Bypassing UAC or abusing sudo/setuid to gain elevated rights.",
    example: "fodhelper.exe UAC bypass launching an elevated payload without a prompt.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "Auto-elevating binaries with unusual child processes or registry writes.",
  },
  {
    id: "T1003.001", name: "OS Credential Dumping: LSASS", tacticIds: ["TA0006"],
    description: "Reading credentials from LSASS process memory (Mimikatz-style).",
    example: "procdump -ma lsass.exe lsass.dmp run from a temp directory.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "Sysmon EventCode 10 — non-system processes opening lsass.exe with full access.",
  },
  {
    id: "T1562.001", name: "Impair Defenses: Disable Tools", tacticIds: ["TA0005"],
    description: "Turning off AV/EDR or logging to operate unseen.",
    example: "Registry write disabling Defender real-time protection before payload drop.",
    logSources: ["wineventlog", "sysmon", "edr"],
    detectionIdea: "Defender state-change events, service stops, audit-policy tampering.",
  },
  {
    id: "T1018", name: "Remote System Discovery", tacticIds: ["TA0007"],
    description: "Enumerating other hosts to plan lateral movement.",
    example: "net view /domain, ping sweeps, or AD queries listing all servers.",
    logSources: ["sysmon", "edr", "netflow"],
    detectionIdea: "Discovery command sequences from unusual users/hosts within minutes.",
  },
  {
    id: "T1087", name: "Account Discovery", tacticIds: ["TA0007"],
    description: "Enumerating users and groups — especially admins.",
    example: "net group 'Domain Admins' /domain from a workstation.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "Group-enumeration commands from non-IT hosts; LDAP queries for admin groups.",
  },
  {
    id: "T1021.001", name: "Remote Services: RDP", tacticIds: ["TA0008"],
    description: "Moving between hosts over Remote Desktop with valid credentials.",
    example: "First-ever RDP from ws-fin-12 to three servers in one evening.",
    logSources: ["wineventlog", "netflow"],
    detectionIdea: "4624 LogonType=10 from new source→dest pairs; workstation→server RDP.",
  },
  {
    id: "T1021.002", name: "Remote Services: SMB/Admin Shares", tacticIds: ["TA0008"],
    description: "Using admin$ / C$ shares (PsExec-style) to run code on remote hosts.",
    example: "PsExec service installs on five servers from one workstation in 20 minutes.",
    logSources: ["wineventlog", "sysmon"],
    detectionIdea: "5140/5145 admin-share access + 7045 new service from the same source.",
  },
  {
    id: "T1071.001", name: "App Layer Protocol: Web", tacticIds: ["TA0011"],
    description: "C2 traffic hidden inside normal-looking HTTP/HTTPS.",
    example: "Beacon POSTs to /jquery.min.js on an IP with no domain, every 60 seconds.",
    logSources: ["proxy", "firewall", "netflow"],
    detectionIdea: "Fixed-interval low-jitter connections; rare destinations with long sessions.",
  },
  {
    id: "T1071.004", name: "App Layer Protocol: DNS", tacticIds: ["TA0011"],
    description: "Using DNS queries/responses as a covert C2 channel.",
    example: "TXT queries to cmd.tunnel-zone.example carrying base32 payload chunks.",
    logSources: ["dns"],
    detectionIdea: "Query volume, label length and entropy per domain per host.",
  },
  {
    id: "T1005", name: "Data from Local System", tacticIds: ["TA0009"],
    description: "Gathering files of interest from compromised hosts before theft.",
    example: "Archiving Finance share documents into c:\\temp\\backup.zip.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "Mass file reads + archiver execution (7z, rar) writing large archives.",
  },
  {
    id: "T1048", name: "Exfiltration Over Alternative Protocol", tacticIds: ["TA0010"],
    description: "Stealing data over protocols like DNS/FTP instead of the C2 channel.",
    example: "4,200 unique long subdomains of tunnel-zone.example in one hour.",
    logSources: ["dns", "firewall"],
    detectionIdea: "Per-host outbound volume by protocol vs baseline; DNS entropy analytics.",
  },
  {
    id: "T1567.002", name: "Exfiltration to Cloud Storage", tacticIds: ["TA0010"],
    description: "Uploading stolen data to attacker-controlled cloud storage.",
    example: "4.2 GB to an unsanctioned file-sharing site at 02:30 from a database server.",
    logSources: ["proxy", "firewall", "casb"],
    detectionIdea: "Large uploads to rare cloud domains, off-hours, from server segments.",
  },
  {
    id: "T1490", name: "Inhibit System Recovery", tacticIds: ["TA0040"],
    description: "Deleting backups and shadow copies so victims can't restore.",
    example: "vssadmin delete shadows /all /quiet minutes before encryption starts.",
    logSources: ["sysmon", "edr"],
    detectionIdea: "vssadmin/wbadmin/bcdedit recovery-tampering command lines — near-zero FP.",
  },
  {
    id: "T1486", name: "Data Encrypted for Impact", tacticIds: ["TA0040"],
    description: "Mass-encrypting files for ransom.",
    example: "Thousands of renames to .lockbit within minutes across file shares.",
    logSources: ["sysmon", "edr", "file audit"],
    detectionIdea: "File-modification rate spikes + ransom-note filename patterns.",
  },
];

export const TECHNIQUES_BY_ID: Record<string, MitreTechnique> = Object.fromEntries(
  MITRE_TECHNIQUES.map((x) => [x.id, x]),
);

export const TACTICS_BY_ID: Record<string, MitreTactic> = Object.fromEntries(
  MITRE_TACTICS.map((x) => [x.id, x]),
);

export function techniquesForTactic(tacticId: string): MitreTechnique[] {
  return MITRE_TECHNIQUES.filter((t) => t.tacticIds.includes(tacticId));
}

/** Resolve a technique id (incl. sub-technique fallback to parent). */
export function findTechnique(id: string): MitreTechnique | undefined {
  return TECHNIQUES_BY_ID[id] ?? TECHNIQUES_BY_ID[id.split(".")[0]];
}
