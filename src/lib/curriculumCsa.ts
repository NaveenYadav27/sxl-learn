// Certified SOC Analyst (CSA) curriculum — hybrid track combining EC-Council
// CSA blueprint with Microsoft SC-200 (Defender XDR + Sentinel + KQL) practice.
// Mirrors the SC-900 / CIS-ITSM / PEN-200 shape so all course-aware components
// (Catalog, Module, Lab, Session Plan, Exam) work unchanged.

import { buildThirtyDayPlan, type DayPlan, type ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const csaModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "csa-soc-fundamentals",
    domain: "concepts",
    title: "Module 1 — SOC Fundamentals & Operations",
    code: "CSA-M1",
    theoryMinutes: 45,
    labBudgetMinutes: 30,
    topics: [
      "What a SOC is: people, process, technology",
      "SOC tiers (L1/L2/L3), shift handovers, MTTD vs MTTR",
      "SOC models: in-house, MSSP, hybrid, virtual SOC",
      "Daily life of an analyst: triage, investigation, escalation",
      "Key SOC metrics & SLA reporting",
    ],
    labSlugs: ["csa-soc-tour", "csa-shift-handover-drill"],
  },
  {
    moduleSlug: "csa-cyber-threats",
    domain: "concepts",
    title: "Module 2 — Cyber Threats, Attack Vectors & Kill Chain",
    code: "CSA-M2",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "Threat actors: nation-state, organised crime, insider, hacktivist",
      "Cyber Kill Chain (Lockheed Martin) and the Diamond Model",
      "MITRE ATT&CK tactics, techniques and sub-techniques",
      "Common attack vectors: phishing, credential theft, ransomware, supply chain",
      "Mapping observed activity to ATT&CK techniques",
    ],
    labSlugs: ["csa-attck-mapping", "csa-killchain-walkthrough", "csa-suricata-alert-triage", "csa-zeek-conn-log"],
  },
  {
    moduleSlug: "csa-incidents-events-logs",
    domain: "security",
    title: "Module 3 — Incidents, Events & Log Sources",
    code: "CSA-M3",
    theoryMinutes: 45,
    labBudgetMinutes: 60,
    topics: [
      "Event vs alert vs incident — definitions and lifecycle",
      "Critical log sources: Windows Security, Sysmon, AD, DNS, proxy, EDR",
      "Cloud log sources: Entra ID sign-ins, Azure Activity, M365 Audit, AWS CloudTrail",
      "Log normalisation, parsing and enrichment",
      "Time synchronisation, retention and chain of custody",
    ],
    labSlugs: ["csa-windows-event-tour", "csa-signin-log-triage", "csa-sysmon-process-tree", "csa-wireshark-pcap-triage", "csa-wireshark-conversations"],
  },
  {
    moduleSlug: "csa-siem-fundamentals",
    domain: "security",
    title: "Module 4 — SIEM Fundamentals & Microsoft Sentinel",
    code: "CSA-M4",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "SIEM architecture: collection, parsing, correlation, alerting",
      "Microsoft Sentinel: workspace, data connectors, analytics rules",
      "Watchlists, threat intelligence feeds and entity behaviour",
      "Use-case lifecycle: hypothesis → rule → tuning → retirement",
      "Other SIEMs at a glance: Splunk, QRadar, Elastic",
    ],
    labSlugs: ["csa-sentinel-tour", "csa-create-analytics-rule", "csa-tune-noisy-rule", "csa-splunk-spl-basics", "csa-qradar-rule-tuning", "csa-elastic-detection-rules"],
  },
  {
    moduleSlug: "csa-kql-hunting",
    domain: "security",
    title: "Module 5 — KQL & Threat Hunting",
    code: "CSA-M5",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "KQL essentials: where, project, summarize, join, render",
      "Hunting in SigninLogs, DeviceProcessEvents, EmailEvents",
      "Building hunting queries from ATT&CK techniques",
      "Bookmarks, livestream and scheduled hunts",
      "From hunting query → analytics rule → automation",
    ],
    labSlugs: ["csa-kql-basics", "csa-hunt-impossible-travel", "csa-hunt-suspicious-process", "csa-elastic-discover-kql"],
  },
  {
    moduleSlug: "csa-defender-xdr",
    domain: "security",
    title: "Module 6 — Microsoft Defender XDR & Endpoint Telemetry",
    code: "CSA-M6",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Defender XDR family: Endpoint, Identity, Office 365, Cloud Apps",
      "Incident graph, evidence and correlated alerts",
      "Device timeline, advanced hunting and live response",
      "Automated investigation & response (AIR)",
      "Triaging phishing, malware and identity alerts",
    ],
    labSlugs: ["csa-defender-incident-triage", "csa-device-timeline-walk", "csa-air-review", "csa-splunk-notable-triage", "csa-qradar-offense-triage"],
  },
  {
    moduleSlug: "csa-incident-response",
    domain: "compliance",
    title: "Module 7 — Incident Response & Playbooks",
    code: "CSA-M7",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "NIST IR lifecycle: prepare, detect, contain, eradicate, recover, learn",
      "Severity classification and escalation matrix",
      "Containment options: isolate device, disable user, block hash/IP",
      "Phishing, ransomware and account compromise playbooks",
      "Post-incident review, lessons learned and reporting",
    ],
    labSlugs: ["csa-phishing-playbook", "csa-account-compromise-ir", "csa-ransomware-tabletop", "csa-thehive-create-case"],
  },
  {
    moduleSlug: "csa-threat-intel-soar",
    domain: "exam",
    title: "Module 8 — Threat Intel, SOAR & Career Prep",
    code: "CSA-M8",
    theoryMinutes: 45,
    labBudgetMinutes: 60,
    topics: [
      "Threat intelligence: strategic, tactical, operational, technical",
      "IOCs vs IOAs; STIX/TAXII feeds; MISP basics",
      "SOAR concepts and Sentinel automation rules / Logic Apps playbooks",
      "Reporting up: writing exec summaries non-tech stakeholders understand",
      "Interview prep: top 50 SOC L1 questions, resume polish, mock drills",
    ],
    labSlugs: ["csa-ioc-enrichment", "csa-soar-auto-response", "csa-mock-interview", "csa-misp-event-review", "csa-misp-feed-management", "csa-thehive-cortex-enrichment"],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Exam prep — CSA strategy",
    theoryMinutes: 30,
    labBudgetMinutes: 30,
    topics: [
      "CSA exam structure (EC-Council CSA + SC-200 style scenarios)",
      "Time management across scenario-based questions",
      "Common KQL gotchas and Defender XDR terminology",
      "Building your personal SOC playbook cheatsheet",
    ],
    labSlugs: [],
  },
];

const m = (slug: string) =>
  csaModuleNotes.find((x) =>
    slug === "exam" ? x.domain === "exam" && x.moduleSlug === null : x.moduleSlug === slug,
  )!;

/* ---------- 5-day plan (≈ 2h / day) — recommended ---------- */
/* ---------- 5-day plan (~2-3h / day) — recommended ---------- */
export const csaFiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "SOC Foundations & Threats (≈ 2h 45m)",
    description: "Understand the SOC, the analyst workflow, and how attackers operate (kill chain + ATT&CK).",
    modules: [m("csa-soc-fundamentals"), m("csa-cyber-threats")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Logs & SIEM Fundamentals (≈ 4h)",
    description: "Read the logs that matter, then meet Microsoft Sentinel and how a SIEM stitches them together.",
    modules: [m("csa-incidents-events-logs"), m("csa-siem-fundamentals")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "KQL & Threat Hunting (≈ 2h 15m)",
    description: "Write KQL from scratch and hunt for impossible-travel and suspicious-process patterns.",
    modules: [m("csa-kql-hunting")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Defender XDR & Incident Response (≈ 4h)",
    description: "Triage Defender XDR incidents end-to-end, then run real IR playbooks.",
    modules: [m("csa-defender-xdr"), m("csa-incident-response")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Threat Intel, SOAR & Exam Prep (≈ 2h 45m)",
    description: "Add intel + automation to your toolkit, then drill the CSA exam and SOC L1 interview.",
    modules: [m("csa-threat-intel-soar"), m("exam")],
  },
];

/* ---------- 2-day intensive (≈ 7-8h / day) ---------- */
export const csaTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "SOC → Logs → SIEM → KQL (≈ 9h — extended day)",
    description: "From SOC fundamentals to writing your first hunting query in Sentinel.",
    modules: csaModuleNotes.filter((x) =>
      [
        "csa-soc-fundamentals",
        "csa-cyber-threats",
        "csa-incidents-events-logs",
        "csa-siem-fundamentals",
        "csa-kql-hunting",
      ].includes(x.moduleSlug ?? ""),
    ),
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Defender → IR → Intel → Exam (≈ 6h 45m)",
    description: "Defender XDR triage, full IR playbooks, threat intel, SOAR and CSA exam strategy.",
    modules: csaModuleNotes.filter(
      (x) =>
        [
          "csa-defender-xdr",
          "csa-incident-response",
          "csa-threat-intel-soar",
        ].includes(x.moduleSlug ?? "") ||
        (x.moduleSlug === null && x.domain === "exam"),
    ),
  },
];

/* ---------- 1-day bootcamp (full ~14h, condensed to ~8h with trimmed labs) ---------- */
export const csaOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full CSA bootcamp (≈ 15h 45m — extended day)",
    description: "Run the entire Certified SOC Analyst curriculum in a single intensive guided day. Lab time is trimmed to fit ~8h — book the 5-day cadence for full hands-on coverage.",
    modules: csaModuleNotes,
  },
];

/* ---------- 1-hour CSA intro session ----------
   Designed as a single 60-minute live session with a clear narrative arc:
   Hook (5) → SOC mental model (8) → Live alert triage in Sentinel (12) →
   First KQL hunt (10) → Defender XDR pivot (10) → Phishing IR mini-playbook (10) →
   Wrap-up + CSA roadmap + Q&A (5). Total = 60 min.
   Split into two ModuleNotes so the timeline renders as two clear blocks
   (Orientation + Hands-on), but together they sum to exactly 60 minutes. */

const csaIntroOrientation: ModuleNote = {
  moduleSlug: "csa-intro-orientation",
  domain: "concepts",
  title: "Block 1 — Orientation: what a SOC analyst actually does (13 min)",
  code: "CSA-I1",
  theoryMinutes: 13,
  labBudgetMinutes: 0,
  topics: [
    "0:00–0:05 — Hook: a real breach timeline (SolarWinds / MGM) and where the SOC stepped in",
    "0:05–0:09 — SOC in 4 boxes: collect → detect → triage → respond (people, process, tech)",
    "0:09–0:12 — Day in the life of an L1 analyst: queue, SLAs, escalation, shift handover",
    "0:12–0:13 — What you'll touch in the next 47 minutes: Sentinel, KQL, Defender XDR, IR playbook",
  ],
  labSlugs: [],
};

const csaIntroHandsOn: ModuleNote = {
  moduleSlug: "csa-intro-handson",
  domain: "security",
  title: "Block 2 — Hands-on: triage → hunt → respond (47 min)",
  code: "CSA-I2",
  theoryMinutes: 5,
  labBudgetMinutes: 42,
  topics: [
    "0:13–0:25 — Lab 1 · Sentinel workspace tour: open an incident, read entities, assign + comment",
    "0:25–0:35 — Lab 2 · First KQL hunt: SigninLogs | where ResultType != 0 — filter, project, summarize",
    "0:35–0:45 — Lab 3 · Defender XDR pivot: incident graph, device timeline, isolate a device",
    "0:45–0:55 — Lab 4 · Phishing IR mini-playbook: identify → contain → eradicate → recover",
    "0:55–1:00 — Wrap-up: CSA 5-day roadmap, free resources, Q&A and next-batch CTA",
  ],
  labSlugs: [
    "csa-sentinel-tour",
    "csa-kql-basics",
    "csa-defender-incident-triage",
    "csa-phishing-playbook",
  ],
};

export const csaOneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Intro session",
    subtitle: "CSA in 60 minutes — triage your first incident",
    description:
      "A tightly-timed 1-hour live intro to the Certified SOC Analyst track. Learners walk away having (1) opened a real Sentinel incident, (2) written their first KQL hunt, (3) pivoted into Defender XDR, and (4) executed a phishing IR playbook — with a clear roadmap to the full 5-day program.",
    modules: [csaIntroOrientation, csaIntroHandsOn],
  },
];

/* ---------- 30-day / 1h-per-day plan ----------
   Hand-curated: 30 standalone daily modules, each ~60 minutes (≈25m theory +
   ≈35m guided lab). One sharply-scoped focus per day so learners get a fresh,
   clearly different topic and lab every day for 30 days. Labs are drawn from
   the existing CSA lab catalog (csa-* slugs in the labs table).            */

const day = (
  n: number,
  parent: string,
  domain: ModuleNote["domain"],
  title: string,
  topics: string[],
  labSlugs: string[],
  theoryMinutes = 25,
  labBudgetMinutes = 35,
): DayPlan => {
  const id = `d${String(n).padStart(2, "0")}`;
  const dayModule: ModuleNote = {
    moduleSlug: `csa-30d-${id}`,
    domain,
    title: `Day ${n} — ${title}`,
    code: `CSA-D${n}`,
    theoryMinutes,
    labBudgetMinutes,
    topics,
    labSlugs,
  };
  return {
    id,
    label: `Day ${n}`,
    subtitle: `${title} (≈ 1h)`,
    description: `Parent: ${parent}. ${topics[0]}.`,
    modules: [dayModule],
  };
};

export const csaThirtyDayPlan: DayPlan[] = [
  // Week 1 — SOC foundations, threats, kill chain, ATT&CK
  day(1, "M1 SOC Fundamentals", "concepts", "Welcome to the SOC", [
    "What a SOC is: people, process, technology",
    "SOC tiers L1/L2/L3 and the analyst career ladder",
    "SOC models: in-house, MSSP, hybrid, virtual",
  ], ["csa-soc-tour"]),
  day(2, "M1 SOC Fundamentals", "concepts", "Daily life of an L1 analyst", [
    "Queue triage, ticket SLAs, escalation paths",
    "MTTD vs MTTR and other SOC KPIs",
    "Shift handover discipline and the analyst journal",
  ], ["csa-shift-handover-drill"]),
  day(3, "M2 Cyber Threats", "concepts", "Threat actors & motivations", [
    "Nation-state, organised crime, hacktivist, insider",
    "Targets, motives and typical TTPs per actor type",
    "Reading a threat report: who, what, why, how",
  ], ["csa-killchain-walkthrough"]),
  day(4, "M2 Cyber Threats", "concepts", "Cyber Kill Chain & Diamond Model", [
    "Lockheed Martin Cyber Kill Chain — 7 stages",
    "Diamond Model: adversary, capability, infra, victim",
    "Mapping a real breach to kill-chain stages",
  ], ["csa-killchain-walkthrough"]),
  day(5, "M2 Cyber Threats", "security", "MITRE ATT&CK in practice", [
    "Tactics vs techniques vs sub-techniques",
    "Reading an ATT&CK technique page end-to-end",
    "Mapping observed activity to ATT&CK IDs",
  ], ["csa-attck-mapping"]),
  day(6, "M2 Cyber Threats", "security", "Network alert triage with Suricata", [
    "How an IDS produces alerts (signatures + anomaly)",
    "Reading a Suricata C2 beacon alert",
    "Pivoting from alert → flow → host",
  ], ["csa-suricata-alert-triage"]),
  day(7, "M2 Cyber Threats", "security", "Zeek conn.log for analysts", [
    "Why Zeek/Bro logs are SOC gold",
    "Fields that matter: duration, bytes, conn_state",
    "Spotting beaconing and exfil patterns",
  ], ["csa-zeek-conn-log"]),

  // Week 2 — Logs everywhere & SIEM intro
  day(8, "M3 Logs", "security", "Windows Security event log tour", [
    "Event IDs you must know (4624, 4625, 4672, 4688)",
    "Logon types decoded",
    "Building a mental index of the Security log",
  ], ["csa-windows-event-tour"]),
  day(9, "M3 Logs", "security", "Sysmon process trees", [
    "Why Sysmon beats default Windows logging",
    "Reading ProcessCreate (Event ID 1) like a story",
    "Spotting living-off-the-land binaries (LOLBins)",
  ], ["csa-sysmon-process-tree"]),
  day(10, "M3 Logs", "security", "Entra ID sign-in log triage", [
    "Sign-in log fields: ResultType, risk, CA applied",
    "Triaging failed and risky sign-ins",
    "Spotting password spray vs brute force",
  ], ["csa-signin-log-triage"]),
  day(11, "M3 Logs", "security", "PCAP triage with Wireshark", [
    "Capture, display & follow-stream filters",
    "Triaging a phishing-delivery PCAP",
    "Extracting IOCs from packet captures",
  ], ["csa-wireshark-pcap-triage"]),
  day(12, "M3 Logs", "security", "Wireshark conversations & top talkers", [
    "Conversations and Endpoints statistics",
    "Finding the loudest host in a capture",
    "From top-talker → suspicious destination",
  ], ["csa-wireshark-conversations"]),
  day(13, "M4 SIEM", "security", "SIEM architecture in 60 minutes", [
    "Collection → parsing → correlation → alerting",
    "Watchlists, threat intel and entity behaviour",
    "Use-case lifecycle: hypothesis → rule → tune → retire",
  ], ["csa-sentinel-tour"]),
  day(14, "M4 SIEM", "security", "Microsoft Sentinel workspace tour", [
    "Workspace, data connectors, tables",
    "Incidents, entities, comments and assignment",
    "Where analytics rules and hunts live",
  ], ["csa-sentinel-tour"]),

  // Week 3 — KQL, hunting, SIEM tuning, Defender XDR
  day(15, "M5 KQL", "security", "KQL essentials in one sitting", [
    "where, project, extend, summarize, render",
    "Time filters and the implicit TimeGenerated",
    "Building your first useful query in 5 lines",
  ], ["csa-kql-basics"]),
  day(16, "M5 KQL", "security", "Hunting impossible-travel sign-ins", [
    "Why impossible travel is a strong indicator",
    "Joining SigninLogs to itself by user",
    "Calculating geo-distance vs time delta",
  ], ["csa-hunt-impossible-travel"]),
  day(17, "M5 KQL", "security", "Hunting suspicious child processes", [
    "Why parent-child relationships matter",
    "Common bad pairs (winword.exe → powershell.exe)",
    "DeviceProcessEvents and ATT&CK T1059",
  ], ["csa-hunt-suspicious-process"]),
  day(18, "M5 KQL", "security", "Elastic Discover & KQL", [
    "Switching mental model from Sentinel to Elastic",
    "Discover, fields, saved searches",
    "Hunting failed logons across data views",
  ], ["csa-elastic-discover-kql"]),
  day(19, "M4 SIEM", "security", "Build a Sentinel analytics rule", [
    "From hunting query → scheduled rule",
    "Entity mapping and incident grouping",
    "Severity, frequency and lookback choices",
  ], ["csa-create-analytics-rule"]),
  day(20, "M4 SIEM", "security", "Tune a noisy detection rule", [
    "Reading false-positive patterns",
    "Allow-listing safely (IP, user, app)",
    "Threshold, suppression and entity tuning",
  ], ["csa-tune-noisy-rule"]),
  day(21, "M6 Defender XDR", "security", "Defender XDR incident triage", [
    "Incident graph and correlated alerts",
    "Evidence: devices, users, files, IPs",
    "Triage decision tree in 5 minutes",
  ], ["csa-defender-incident-triage"]),

  // Week 4 — XDR depth, IR playbooks, intel, SOAR, exam prep
  day(22, "M6 Defender XDR", "security", "Device timeline investigation", [
    "Reading a device timeline like an attack story",
    "Pivoting between processes, files and network",
    "When to escalate vs contain vs close",
  ], ["csa-device-timeline-walk"]),
  day(23, "M6 Defender XDR", "security", "Automated Investigation & Response (AIR)", [
    "What AIR can and cannot decide",
    "Reviewing AIR verdicts and pending actions",
    "When to override automation",
  ], ["csa-air-review"]),
  day(24, "M4 SIEM", "security", "Splunk SPL hunt for brute-force", [
    "SPL crash course: search → stats → eval",
    "Hunting failed logons that turn into success",
    "Building a notable event from your hunt",
  ], ["csa-splunk-spl-basics", "csa-splunk-notable-triage"]),
  day(25, "M4 SIEM", "security", "QRadar offense triage & rule tuning", [
    "QRadar magnitude, credibility, severity",
    "Investigating an offense end-to-end",
    "Reading and tuning correlation rules",
  ], ["csa-qradar-offense-triage", "csa-qradar-rule-tuning"]),
  day(26, "M7 IR", "compliance", "Phishing IR playbook", [
    "NIST IR phases applied to phishing",
    "Identify → contain → eradicate → recover",
    "Communications & user-awareness loop",
  ], ["csa-phishing-playbook"]),
  day(27, "M7 IR", "compliance", "Account compromise IR", [
    "Indicators of a compromised user",
    "Containment: revoke sessions, reset, MFA reset",
    "Post-incident hardening checklist",
  ], ["csa-account-compromise-ir"]),
  day(28, "M7 IR", "compliance", "Ransomware tabletop exercise", [
    "Tabletop mechanics and roles",
    "Decision points: pay, isolate, restore, disclose",
    "Lessons-learned format that ships",
  ], ["csa-ransomware-tabletop", "csa-thehive-create-case"]),
  day(29, "M8 Threat Intel & SOAR", "exam", "Threat intel + IOC enrichment + SOAR", [
    "Strategic vs tactical vs operational vs technical intel",
    "MISP & TheHive/Cortex enrichment workflow",
    "Sentinel automation rules & Logic Apps playbooks",
  ], ["csa-ioc-enrichment", "csa-misp-event-review", "csa-thehive-cortex-enrichment", "csa-soar-auto-response"]),
  day(30, "M8 Career Prep", "exam", "CSA exam strategy & SOC L1 mock interview", [
    "CSA exam structure and time management",
    "Top 50 SOC L1 interview questions",
    "Resume polish, STAR stories, next-batch CTA",
  ], ["csa-mock-interview"]),
];
