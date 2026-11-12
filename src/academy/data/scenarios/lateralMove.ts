import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 6 — credential dumping on one workstation → PsExec/RDP across the estate (advanced). */
function build(): Scenario {
  const ev = new ScenarioEvents("LM");
  addNoise(ev, { start: "2026-05-07 16:00:00", minutes: 50, count: 70, seed: 66, users: STANDARD_USERS });

  const lsass = ev.add({ time: "2026-05-07 16:05:12", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-fin-12",
    fields: { EventCode: 10, user: "j.doe", process: "rundll32.exe", TargetImage: "C:\\Windows\\System32\\lsass.exe", GrantedAccess: "0x1010", CommandLine: "rundll32.exe comsvcs.dll, MiniDump 724 C:\\Temp\\l.dmp full" },
    mitre: ["T1003.001"], risk: { object: "ws-fin-12", objectType: "system", score: 80, rule: "Endpoint - LSASS Memory Access" } });
  const disc1 = ev.add({ time: "2026-05-07 16:07:40", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-fin-12",
    fields: { EventCode: 1, user: "j.doe", process: "net.exe", parent_process: "cmd.exe", CommandLine: "net group \"Domain Admins\" /domain" },
    mitre: ["T1087"], risk: { object: "j.doe", objectType: "user", score: 20, rule: "Endpoint - Domain Admin Enumeration" } });
  const disc2 = ev.add({ time: "2026-05-07 16:07:55", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-fin-12",
    fields: { EventCode: 1, user: "j.doe", process: "nltest.exe", parent_process: "cmd.exe", CommandLine: "nltest /dclist:corp.local" }, mitre: ["T1018"] });
  const smb = ev.add({ time: "2026-05-07 16:12:03", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "fs01",
    fields: { EventCode: 4624, action: "success", user: "adm.jdoe", src_ip: "10.0.4.12", src_host: "ws-fin-12", dest: "fs01", Logon_Type: 3 },
    mitre: ["T1078", "T1021.002"], risk: { object: "adm.jdoe", objectType: "user", score: 30, rule: "Access - Admin Logon From Workstation" } });
  const svc = ev.add({ time: "2026-05-07 16:12:06", index: "wineventlog", sourcetype: "WinEventLog:System", host: "fs01",
    fields: { EventCode: 7045, user: "adm.jdoe", Service_Name: "PSEXESVC", Service_File_Name: "%SystemRoot%\\PSEXESVC.exe", src_host: "ws-fin-12" },
    mitre: ["T1021.002"], risk: { object: "fs01", objectType: "system", score: 60, rule: "Endpoint - PsExec Service Installed" } });
  const sql = ev.add({ time: "2026-05-07 16:18:30", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "sql-prd-02",
    fields: { EventCode: 4624, action: "success", user: "adm.jdoe", src_ip: "10.0.4.12", src_host: "ws-fin-12", dest: "sql-prd-02", Logon_Type: 10 },
    mitre: ["T1021.001"], risk: { object: "adm.jdoe", objectType: "user", score: 40, rule: "Access - First-Time RDP To Database Server" } });
  const dc = ev.add({ time: "2026-05-07 16:24:10", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4624, action: "success", user: "adm.jdoe", src_ip: "10.0.5.50", src_host: "sql-prd-02", dest: "dc01", Logon_Type: 3 },
    mitre: ["T1021.002"], risk: { object: "adm.jdoe", objectType: "user", score: 50, rule: "Access - Admin Logon Chain To Domain Controller" } });
  const priv = ev.add({ time: "2026-05-07 16:24:11", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4672, user: "adm.jdoe", dest: "dc01", Privileges: "SeDebugPrivilege SeBackupPrivilege" } });
  // Benign: IT admin doing legit RDP from the jump host
  ev.add({ time: "2026-05-07 16:30:00", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "sql-prd-02",
    fields: { EventCode: 4624, action: "success", user: "adm.ops", src_ip: "10.0.0.5", src_host: "jump01", dest: "sql-prd-02", Logon_Type: 10 } });

  return {
    id: "lateral-move",
    name: "Credential Dumping → Lateral Movement to the DC",
    tagline: "One stolen admin password, three servers in twenty minutes.",
    difficulty: "advanced",
    attackStory: [
      "On ws-fin-12 (already compromised), the attacker dumps LSASS memory with comsvcs.dll MiniDump.",
      "They enumerate Domain Admins and domain controllers with net and nltest.",
      "Using the stolen adm.jdoe credentials they PsExec to fs01, then RDP to sql-prd-02.",
      "From sql-prd-02 they authenticate to dc01 with SeDebug/SeBackup privileges — domain compromise is imminent.",
    ],
    events: ev.all(),
    notables: [
      { id: "ACAD-NOT-6001", title: "Endpoint - LSASS Memory Dump on ws-fin-12", urgency: "critical", rule: "Endpoint - Credential Dumping", entity: "ws-fin-12",
        description: "rundll32 comsvcs.dll MiniDump targeting lsass.exe.", eventIds: [lsass],
        recommendedActions: ["Isolate ws-fin-12", "Reset adm.jdoe and all accounts cached on the host", "Hunt for adm.jdoe logons"] },
      { id: "ACAD-NOT-6002", title: "Risk - adm.jdoe Risk Threshold Exceeded", urgency: "high", rule: "Risk - Threshold Exceeded", entity: "adm.jdoe",
        description: "Admin logon chain ws-fin-12 → fs01 → sql-prd-02 → dc01.", eventIds: [smb, sql, dc],
        recommendedActions: ["Disable adm.jdoe", "Review dc01 for persistence", "Engage incident response lead"] },
    ],
    intel: [],
    entities: [
      { type: "host", value: "ws-fin-12", role: "compromised", note: "Where credentials were dumped — origin of the movement." },
      { type: "user", value: "adm.jdoe", role: "compromised", note: "Stolen admin account used to pivot." },
      { type: "host", value: "fs01", role: "compromised", note: "PsExec target." },
      { type: "host", value: "sql-prd-02", role: "compromised", note: "RDP target, then a hop to the DC." },
      { type: "host", value: "dc01", role: "victim", note: "Domain controller reached with privileged logon." },
      { type: "user", value: "adm.ops", role: "benign", note: "Legit admin RDP from the jump host." },
    ],
    mitreMap: [
      { techniqueId: "T1003.001", evidence: "LSASS dump via comsvcs.dll MiniDump.", eventIds: [lsass] },
      { techniqueId: "T1087", evidence: "net group \"Domain Admins\" /domain.", eventIds: [disc1] },
      { techniqueId: "T1018", evidence: "nltest /dclist.", eventIds: [disc2] },
      { techniqueId: "T1021.002", evidence: "PSEXESVC service installed on fs01 by adm.jdoe.", eventIds: [svc] },
      { techniqueId: "T1021.001", evidence: "Logon_Type 10 from ws-fin-12 to sql-prd-02.", eventIds: [sql] },
    ],
    timeline: [
      { phase: "Steals credentials", tacticId: "TA0006", summary: "LSASS dumped.", eventIds: [lsass] },
      { phase: "Maps the domain", tacticId: "TA0007", summary: "Domain Admins + DC list.", eventIds: [disc1, disc2] },
      { phase: "Spreads", tacticId: "TA0008", summary: "PsExec fs01 → RDP sql-prd-02 → dc01.", eventIds: [smb, svc, sql, dc] },
      { phase: "Domain-level access", tacticId: "TA0004", summary: "Privileged logon on dc01.", eventIds: [priv] },
    ],
    patientZero: { entity: "ws-fin-12", explanation: "Every adm.jdoe hop traces back to src_host ws-fin-12, where LSASS was dumped." },
  };
}

export const LATERAL_MOVE = build();
