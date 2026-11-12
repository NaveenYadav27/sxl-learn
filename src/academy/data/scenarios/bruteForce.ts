import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

/** Scenario 1 — external brute force that ends in a successful logon (beginner). */
function build(): Scenario {
  const ev = new ScenarioEvents("BF");
  addNoise(ev, { start: "2026-05-07 08:55:00", minutes: 60, count: 70, seed: 11, users: STANDARD_USERS });

  // a.kumar fat-fingers a password (benign noise, 3 failures)
  ev.repeat(3, "2026-05-07 09:02:10", 25, () => ({
    index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4625, action: "failure", user: "a.kumar", src_ip: "10.0.3.7", dest: "dc01", Logon_Type: 3, Failure_Reason: "Unknown user name or bad password" },
  }));
  ev.add({ time: "2026-05-07 09:03:40", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4624, action: "success", user: "a.kumar", src_ip: "10.0.3.7", dest: "dc01", Logon_Type: 3 } });

  // The attack: 42 failures from 203.0.113.5 against j.doe in ~3 min
  const fails = ev.repeat(42, "2026-05-07 09:12:04", 4.5, (i) => ({
    index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4625, action: "failure", user: "j.doe", src_ip: "203.0.113.5", dest: "dc01", Logon_Type: 3, Failure_Reason: "Unknown user name or bad password", attempt: i + 1 },
    mitre: ["T1110.001"],
    risk: i === 41 ? { object: "j.doe", objectType: "user", score: 40, rule: "Access - Brute Force Detected" } : undefined,
  }));
  const success = ev.add({ time: "2026-05-07 09:15:20", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "dc01",
    fields: { EventCode: 4624, action: "success", user: "j.doe", src_ip: "203.0.113.5", dest: "dc01", Logon_Type: 3 },
    mitre: ["T1078"], risk: { object: "j.doe", objectType: "user", score: 50, rule: "Access - Successful Logon After Failures" } });
  const vpn = ev.add({ time: "2026-05-07 09:16:02", index: "vpn", sourcetype: "cisco:asa", host: "vpn-gw01",
    fields: { action: "success", user: "j.doe", src_ip: "203.0.113.5", assigned_ip: "10.8.0.44", geo: "Moldova" },
    mitre: ["T1078"], risk: { object: "j.doe", objectType: "user", score: 30, rule: "Access - Unusual Geo VPN Login" } });
  const ws = ev.add({ time: "2026-05-07 09:18:45", index: "wineventlog", sourcetype: "WinEventLog:Security", host: "ws-fin-12",
    fields: { EventCode: 4624, action: "success", user: "j.doe", src_ip: "10.8.0.44", dest: "ws-fin-12", Logon_Type: 10, app: "win:rdp" },
    mitre: ["T1021.001"] });
  const fw = ev.add({ time: "2026-05-07 09:11:50", index: "firewall", sourcetype: "pan:traffic", host: "fw-edge-01",
    fields: { src_ip: "203.0.113.5", dest_ip: "198.18.0.10", dest_port: 443, action: "allowed", app: "ssl", bytes: 1200 } });

  const failIds = fails;
  return {
    id: "brute-force",
    name: "Brute Force → Account Takeover",
    tagline: "42 failed logins, then one success from the same IP.",
    difficulty: "beginner",
    attackStory: [
      "An external IP (203.0.113.5) starts guessing j.doe's password against the domain controller.",
      "After 42 failures in about three minutes, one guess succeeds — the attacker is now logged in as j.doe.",
      "The attacker connects to the VPN from Moldova, which is an unusual location for this user.",
      "They RDP to j.doe's workstation ws-fin-12 over the VPN — the intrusion is now inside the network.",
    ],
    // Authentication events live in index=auth so Lesson 3 can start from `index=auth`.
    events: ev.all().map((e) => (e.fields.EventCode === 4624 || e.fields.EventCode === 4625 ? { ...e, index: "auth" } : e)),
    notables: [{
      id: "ACAD-NOT-1001", title: "Access - Brute Force Detected on j.doe", urgency: "critical",
      rule: "Access - Brute Force Detected", entity: "j.doe",
      description: "42 failed logons (4625) from 203.0.113.5 against j.doe followed by a success (4624).",
      eventIds: [...failIds.slice(-3), success],
      recommendedActions: ["Disable j.doe in AD", "Force password reset and revoke sessions", "Block 203.0.113.5 at the edge firewall", "Review ws-fin-12 for post-compromise activity"],
    }],
    intel: [{ indicator: "203.0.113.5", type: "ip", threat: "Known credential-stuffing infrastructure", source: "MISP - corp-intel", confidence: 88, eventIds: [failIds[0], success, vpn] }],
    entities: [
      { type: "ip", value: "203.0.113.5", role: "attacker", note: "Source of all 42 failures, the success and the VPN login." },
      { type: "user", value: "j.doe", role: "victim", note: "Finance analyst whose account was taken over." },
      { type: "host", value: "ws-fin-12", role: "compromised", note: "j.doe's workstation, RDP'd to by the attacker." },
      { type: "host", value: "dc01", role: "asset", note: "Domain controller that authenticated the attempts." },
      { type: "user", value: "a.kumar", role: "benign", note: "3 failed logons were a typo — below threshold, then a success from her own IP." },
      { type: "ip", value: "10.8.0.44", role: "suspicious", note: "VPN-assigned address the attacker used inside the network." },
    ],
    mitreMap: [
      { techniqueId: "T1110.001", evidence: "42× EventCode 4625 for one user from one external IP in ~3 minutes.", eventIds: failIds.slice(0, 3) },
      { techniqueId: "T1078", evidence: "A 4624 success from the brute-forcing IP, then a VPN login from Moldova.", eventIds: [success, vpn] },
      { techniqueId: "T1021.001", evidence: "Logon_Type 10 (RDP) to ws-fin-12 from the VPN address.", eventIds: [ws] },
    ],
    timeline: [
      { phase: "Probing the front door", tacticId: "TA0043", summary: "Edge firewall allows HTTPS from the attacker IP.", eventIds: [fw] },
      { phase: "Guessing passwords", tacticId: "TA0006", summary: "42 failed logons for j.doe.", eventIds: failIds.slice(0, 5) },
      { phase: "Got in", tacticId: "TA0001", summary: "Successful logon + VPN session from Moldova.", eventIds: [success, vpn] },
      { phase: "Moving to a workstation", tacticId: "TA0008", summary: "RDP to ws-fin-12.", eventIds: [ws] },
    ],
    patientZero: { entity: "j.doe", explanation: "j.doe's credentials were the first thing compromised. a.kumar's failures are a typo, not part of the attack." },
  };
}

export const BRUTE_FORCE = build();
