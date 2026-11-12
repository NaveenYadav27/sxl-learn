import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 7 — exposed RDP → Defender off → shadow copies deleted → mass encryption (advanced). */
function build(): Scenario {
  const ev = new ScenarioEvents("RW");
  addNoise(ev, { start: "2026-05-08 01:30:00", minutes: 60, count: 40, seed: 77, users: STANDARD_USERS });

  const rdp = ev.add({ time: "2026-05-08 01:41:09", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "jump01",
    fields: { EventCode: 4624, action: "success", user: "svc-backup", src_ip: "91.240.118.33", dest: "jump01", Logon_Type: 10 },
    mitre: ["T1078"], risk: { object: "svc-backup", objectType: "user", score: 50, rule: "Access - Service Account Interactive RDP From Internet" } });
  const def = ev.add({ time: "2026-05-08 01:44:30", index: "edr", sourcetype: "crowdstrike:events", host: "jump01",
    fields: { user: "svc-backup", process: "powershell.exe", CommandLine: "Set-MpPreference -DisableRealtimeMonitoring $true", severity: "high", signature: "Tamper protection: real-time monitoring disabled" },
    mitre: ["T1562.001"], risk: { object: "jump01", objectType: "system", score: 60, rule: "Endpoint - AV Real-time Protection Disabled" } });
  const psx = ev.add({ time: "2026-05-08 01:49:02", index: "wineventlog", sourcetype: "WinEventLog:System", host: "fs01",
    fields: { EventCode: 7045, user: "svc-backup", Service_Name: "PSEXESVC", src_host: "jump01" },
    mitre: ["T1021.002"], risk: { object: "fs01", objectType: "system", score: 50, rule: "Endpoint - PsExec Service Installed" } });
  const vss = ev.add({ time: "2026-05-08 01:52:40", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "fs01",
    fields: { EventCode: 1, user: "svc-backup", process: "vssadmin.exe", parent_process: "PSEXESVC.exe", CommandLine: "vssadmin.exe delete shadows /all /quiet" },
    mitre: ["T1490"], risk: { object: "fs01", objectType: "system", score: 90, rule: "Endpoint - Shadow Copy Deletion" } });
  const bcd = ev.add({ time: "2026-05-08 01:52:44", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "fs01",
    fields: { EventCode: 1, user: "svc-backup", process: "bcdedit.exe", parent_process: "PSEXESVC.exe", CommandLine: "bcdedit /set {default} recoveryenabled No" }, mitre: ["T1490"] });
  const enc = ev.repeat(30, "2026-05-08 01:53:10", 2, (i) => ({ index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "fs01",
    fields: { EventCode: 11, user: "svc-backup", process: "lockx.exe", file_name: `D:\\Shares\\Finance\\Q${(i % 4) + 1}_report_${100 + i}.xlsx.lockx`, action: "file_rename" },
    mitre: ["T1486"], risk: i === 29 ? { object: "fs01", objectType: "system", score: 100, rule: "Endpoint - Mass File Encryption" } : undefined }));
  const note = ev.add({ time: "2026-05-08 01:54:20", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "fs01",
    fields: { EventCode: 11, user: "svc-backup", process: "lockx.exe", file_name: "D:\\Shares\\README_LOCKX.txt", action: "file_create" }, mitre: ["T1486"] });
  const smbSpread = ev.add({ time: "2026-05-08 01:55:05", index: "firewall", sourcetype: "pan:traffic", host: "fw-core-01",
    fields: { src_ip: "10.0.0.20", src_host: "fs01", dest_ip: "10.0.0.21", dest_port: 445, action: "allowed", app: "ms-ds-smb", bytes: 88123 } });

  return {
    id: "ransomware",
    name: "Ransomware on the File Server",
    tagline: "Shadow copies gone, finance shares turning into .lockx.",
    difficulty: "advanced",
    attackStory: [
      "The attacker logs in over internet-exposed RDP to jump01 using the svc-backup service account.",
      "They disable Defender real-time monitoring, then PsExec to the file server fs01.",
      "On fs01 they delete Volume Shadow Copies and disable boot recovery so files can't be restored.",
      "lockx.exe encrypts finance spreadsheets and drops README_LOCKX.txt; fs01 starts reaching other servers over SMB.",
    ],
    events: ev.all(),
    notables: [
      { id: "ACAD-NOT-7001", title: "Endpoint - Shadow Copy Deletion on fs01", urgency: "critical", rule: "Endpoint - Inhibit System Recovery", entity: "fs01",
        description: "vssadmin delete shadows /all /quiet launched via PSEXESVC.", eventIds: [vss, bcd],
        recommendedActions: ["Isolate fs01 immediately", "Disable svc-backup", "Block SMB from fs01", "Protect backups / take offline", "Activate ransomware playbook"] },
      { id: "ACAD-NOT-7002", title: "Endpoint - Mass File Encryption (.lockx) on fs01", urgency: "critical", rule: "Endpoint - Ransomware Behaviour", entity: "fs01",
        description: "30 file renames to .lockx in 60 seconds + ransom note.", eventIds: [...enc.slice(0, 3), note],
        recommendedActions: ["Isolate", "Preserve memory and the ransom note", "Do not reboot"] },
    ],
    intel: [{ indicator: "91.240.118.33", type: "ip", threat: "Ransomware affiliate RDP brute-force infrastructure", source: "MISP - corp-intel", confidence: 90, eventIds: [rdp] }],
    entities: [
      { type: "user", value: "svc-backup", role: "compromised", note: "Service account used for RDP, PsExec and encryption." },
      { type: "host", value: "jump01", role: "compromised", note: "Internet-exposed RDP entry point." },
      { type: "host", value: "fs01", role: "victim", note: "File server being encrypted." },
      { type: "ip", value: "91.240.118.33", role: "attacker", note: "External RDP source." },
      { type: "process", value: "lockx.exe", role: "attacker", note: "Ransomware binary." },
    ],
    mitreMap: [
      { techniqueId: "T1078", evidence: "svc-backup RDP from 91.240.118.33.", eventIds: [rdp] },
      { techniqueId: "T1562.001", evidence: "Set-MpPreference -DisableRealtimeMonitoring $true.", eventIds: [def] },
      { techniqueId: "T1021.002", evidence: "PSEXESVC on fs01 from jump01.", eventIds: [psx] },
      { techniqueId: "T1490", evidence: "vssadmin delete shadows + bcdedit recoveryenabled No.", eventIds: [vss, bcd] },
      { techniqueId: "T1486", evidence: "Mass .lockx renames + README_LOCKX.txt.", eventIds: [enc[0], note] },
    ],
    timeline: [
      { phase: "RDP entry", tacticId: "TA0001", summary: "svc-backup logs in from the internet.", eventIds: [rdp] },
      { phase: "Defences off", tacticId: "TA0005", summary: "Defender disabled.", eventIds: [def] },
      { phase: "To the file server", tacticId: "TA0008", summary: "PsExec to fs01.", eventIds: [psx] },
      { phase: "Recovery destroyed", tacticId: "TA0040", summary: "Shadow copies deleted.", eventIds: [vss, bcd] },
      { phase: "Encryption", tacticId: "TA0040", summary: ".lockx + ransom note; SMB to neighbours.", eventIds: [enc[0], note, smbSpread] },
    ],
    patientZero: { entity: "jump01", explanation: "The attacker entered through jump01's exposed RDP before reaching fs01." },
  };
}

export const RANSOMWARE = build();
