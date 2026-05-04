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

/* ---------- 30-day / 1h-per-day plan (auto-generated) ---------- */
export const csaThirtyDayPlan: DayPlan[] = buildThirtyDayPlan(csaModuleNotes);
