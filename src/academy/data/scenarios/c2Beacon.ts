import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS, addSeconds } from "./builder";

/** Scenario 3 — fake browser update → C2 beaconing every ~60 s (intermediate). */
function build(): Scenario {
  const ev = new ScenarioEvents("C2");
  addNoise(ev, { start: "2026-05-07 13:00:00", minutes: 40, count: 80, seed: 33, users: STANDARD_USERS });

  const dl = ev.add({ time: "2026-05-07 13:02:10", index: "proxy", sourcetype: "bluecoat:proxysg", host: "proxy01",
    fields: { user: "m.lee", src_ip: "10.0.4.21", url: "https://chrome-update-check.net/ChromeSetup_x64.exe", http_method: "GET", status: 200, bytes_out: 520, bytes_in: 1834011, category: "Newly Registered Domain" },
    mitre: ["T1071.001"] });
  const exec = ev.add({ time: "2026-05-07 13:03:01", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-eng-04",
    fields: { EventCode: 1, user: "m.lee", process: "ChromeSetup_x64.exe", parent_process: "explorer.exe", hash: "9f2c1e7ab04d55e1c0d8a3b6e1f0c2d4", CommandLine: "C:\\Users\\m.lee\\Downloads\\ChromeSetup_x64.exe" },
    risk: { object: "ws-eng-04", objectType: "system", score: 30, rule: "Endpoint - Unsigned Binary From Downloads" } });
  const rundll = ev.add({ time: "2026-05-07 13:03:09", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-eng-04",
    fields: { EventCode: 1, user: "m.lee", process: "rundll32.exe", parent_process: "ChromeSetup_x64.exe", CommandLine: "rundll32.exe C:\\ProgramData\\cache\\upd.dll,Start" },
    mitre: ["T1059"] });
  const dns = ev.add({ time: "2026-05-07 13:03:15", index: "dns", sourcetype: "stream:dns", host: "dns01",
    fields: { src_ip: "10.0.4.21", src_host: "ws-eng-04", query: "cdn-telemetry-sync.net", query_type: "A", reply_code: "NOERROR", answer: "198.51.100.77", query_length: 22 } });
  const beacons: string[] = [];
  const jitter = [0, 3, -2, 1, 4, -3, 2, 0, -1, 3, -2, 1, 2, -4, 0, 1, -2, 3, 0, -1];
  for (let i = 0; i < 20; i++) {
    const time = addSeconds("2026-05-07 13:03:20", i * 60 + jitter[i]);
    beacons.push(ev.add({ time, index: "firewall", sourcetype: "pan:traffic", host: "fw-edge-01",
      fields: { src_ip: "10.0.4.21", src_host: "ws-eng-04", dest_ip: "198.51.100.77", dest_port: 443, action: "allowed", app: "ssl", bytes: 412 + (i % 3) * 8, process: "rundll32.exe" },
      mitre: ["T1071.001"],
      risk: i === 5 ? { object: "ws-eng-04", objectType: "system", score: 70, rule: "Network - Periodic Beaconing Detected" } : undefined }));
  }
  const sysnet = ev.add({ time: "2026-05-07 13:03:21", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-eng-04",
    fields: { EventCode: 3, user: "m.lee", process: "rundll32.exe", dest_ip: "198.51.100.77", dest_port: 443, protocol: "tcp" } });
  const disc = ev.add({ time: "2026-05-07 13:15:40", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-eng-04",
    fields: { EventCode: 1, user: "m.lee", process: "cmd.exe", parent_process: "rundll32.exe", CommandLine: "cmd.exe /c whoami /all & net view" },
    mitre: ["T1018"], risk: { object: "ws-eng-04", objectType: "system", score: 30, rule: "Endpoint - Discovery Commands From Unusual Parent" } });

  return {
    id: "c2-beacon",
    name: "Fake Update → Command & Control Beaconing",
    tagline: "A workstation that phones home every 60 seconds.",
    difficulty: "intermediate",
    attackStory: [
      "m.lee downloads 'ChromeSetup_x64.exe' from a newly registered look-alike domain.",
      "The binary drops a DLL and launches it with rundll32.exe.",
      "rundll32.exe resolves cdn-telemetry-sync.net and connects to 198.51.100.77:443 every ~60 seconds with tiny, regular payloads — a C2 beacon.",
      "Twelve minutes later the attacker runs discovery commands (whoami, net view) through the beacon.",
    ],
    events: ev.all(),
    notables: [
      { id: "ACAD-NOT-3001", title: "Network - Periodic Beaconing to 198.51.100.77 (ws-eng-04)", urgency: "critical", rule: "Network - Beaconing Detected", entity: "ws-eng-04",
        description: "20 outbound sessions at a ~60 s interval with near-identical byte counts.", eventIds: beacons.slice(0, 5),
        recommendedActions: ["Isolate ws-eng-04", "Block 198.51.100.77 and cdn-telemetry-sync.net", "Acquire upd.dll for analysis", "Hunt for the hash fleet-wide"] },
      { id: "ACAD-NOT-3002", title: "Threat Intel - Outbound connection to known C2 IP", urgency: "high", rule: "Network - TI Match Outbound", entity: "198.51.100.77",
        description: "Destination matches a Cobalt Strike team-server indicator.", eventIds: [beacons[0]], recommendedActions: ["Confirm the source process", "Scope other hosts talking to the IP"] },
    ],
    intel: [
      { indicator: "198.51.100.77", type: "ip", threat: "Cobalt Strike team server", source: "MISP - corp-intel", confidence: 92, eventIds: beacons.slice(0, 3) },
      { indicator: "cdn-telemetry-sync.net", type: "domain", threat: "C2 domain (registered 2 days ago)", source: "AlienVault OTX", confidence: 70, eventIds: [dns] },
      { indicator: "9f2c1e7ab04d55e1c0d8a3b6e1f0c2d4", type: "hash", threat: "Loader masquerading as Chrome installer", source: "VirusTotal", confidence: 85, eventIds: [exec] },
    ],
    entities: [
      { type: "host", value: "ws-eng-04", role: "compromised", note: "Beaconing workstation (10.0.4.21)." },
      { type: "user", value: "m.lee", role: "victim", note: "Downloaded and ran the fake update." },
      { type: "ip", value: "198.51.100.77", role: "attacker", note: "C2 server." },
      { type: "domain", value: "chrome-update-check.net", role: "attacker", note: "Delivery site for the fake installer." },
      { type: "process", value: "rundll32.exe", role: "suspicious", note: "Hosts the implant and makes the network connections." },
      { type: "hash", value: "9f2c1e7ab04d55e1c0d8a3b6e1f0c2d4", role: "attacker", note: "Fake ChromeSetup_x64.exe." },
    ],
    mitreMap: [
      { techniqueId: "T1071.001", evidence: "HTTPS sessions to 198.51.100.77 every ~60 s with ~412-byte payloads.", eventIds: beacons.slice(0, 4) },
      { techniqueId: "T1059", evidence: "rundll32.exe loading upd.dll,Start from ProgramData.", eventIds: [rundll] },
      { techniqueId: "T1018", evidence: "whoami /all & net view spawned from rundll32.exe.", eventIds: [disc] },
    ],
    timeline: [
      { phase: "Fake update downloaded", tacticId: "TA0001", summary: "1.8 MB download from a new domain.", eventIds: [dl] },
      { phase: "Implant runs", tacticId: "TA0002", summary: "Installer → rundll32.exe upd.dll.", eventIds: [exec, rundll] },
      { phase: "Phones home", tacticId: "TA0011", summary: "DNS + 20 regular HTTPS beacons.", eventIds: [dns, sysnet, ...beacons.slice(0, 3)] },
      { phase: "Looks around", tacticId: "TA0007", summary: "whoami / net view.", eventIds: [disc] },
    ],
    patientZero: { entity: "ws-eng-04", explanation: "ws-eng-04 ran the fake installer first; every beacon originates from its rundll32.exe." },
  };
}

export const C2_BEACON = build();
