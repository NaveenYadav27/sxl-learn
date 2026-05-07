// Splunk Enterprise Security SOC curriculum — combined analyst + admin track.
// Targets SPLK-1003 (Splunk Admin) + SPLK-3001 (ES Admin) + SOC analyst workflow
// inside Splunk Enterprise Security. Mirrors the shape of curriculumCsa.ts so all
// course-aware components (Catalog, Module, Lab, Session Plan) work unchanged.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const splunkesModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "splunkes-foundations",
    domain: "concepts",
    title: "Module 1 — Splunk Platform Foundations",
    code: "SPLK-M1",
    theoryMinutes: 45,
    labBudgetMinutes: 30,
    topics: [
      "What Splunk is: indexers, search heads, forwarders, deployment server",
      "Distributed Splunk architecture & index-time vs search-time pipeline",
      "Buckets, hot/warm/cold/frozen lifecycle and retention",
      "Roles, capabilities and indexes_allowed",
      "Splunk Web tour: apps, navigation, jobs manager",
    ],
    labSlugs: ["splunkes-tour", "splunkes-spl-first-search"],
  },
  {
    moduleSlug: "splunkes-spl-essentials",
    domain: "security",
    title: "Module 2 — SPL Essentials for SOC",
    code: "SPLK-M2",
    theoryMinutes: 60,
    labBudgetMinutes: 60,
    topics: [
      "search, fields, table, eval, where, rename",
      "stats, chart, timechart, top/rare, dedup",
      "Subsearches, joins, append and the cost model",
      "transaction vs stats — when to use which",
      "Time picker, earliest/latest and timeranges that scale",
    ],
    labSlugs: ["splunkes-spl-stats-timechart", "splunkes-spl-failed-logons", "splunkes-spl-subsearch"],
  },
  {
    moduleSlug: "splunkes-data-onboarding",
    domain: "security",
    title: "Module 3 — Data Onboarding & Universal Forwarder",
    code: "SPLK-M3",
    theoryMinutes: 45,
    labBudgetMinutes: 60,
    topics: [
      "inputs.conf, outputs.conf, props.conf, transforms.conf",
      "Sourcetypes, line-breaking, timestamp recognition",
      "Universal Forwarder vs Heavy Forwarder",
      "Index design, sizing and data routing",
      "Onboarding Windows, Linux, syslog and CloudTrail",
    ],
    labSlugs: ["splunkes-onboard-syslog", "splunkes-props-transforms"],
  },
  {
    moduleSlug: "splunkes-cim-datamodels",
    domain: "security",
    title: "Module 4 — CIM, Data Models & Acceleration",
    code: "SPLK-M4",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "Why CIM matters for ES (Authentication, Network_Traffic, Endpoint…)",
      "Tags, eventtypes and field aliases that map sources to CIM",
      "Data model acceleration and tstats",
      "Validating CIM compliance with Common Information Model add-on",
      "How ES correlation searches consume datamodels",
    ],
    labSlugs: ["splunkes-cim-validate", "splunkes-tstats-hunt"],
  },
  {
    moduleSlug: "splunkes-install-config",
    domain: "security",
    title: "Module 5 — Splunk ES Install, Config & Permissions",
    code: "SPLK-M5",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "ES app install, technology add-ons (TAs) and dependencies",
      "General settings, indexes used by ES and capacity planning",
      "ES roles: ess_admin, ess_analyst, ess_user",
      "Navigation: Security Posture, Incident Review, Investigations",
      "Configuring data inputs feeding the ES indexes (notable, risk, threat_activity)",
    ],
    labSlugs: ["splunkes-es-tour", "splunkes-permissions-roles"],
  },
  {
    moduleSlug: "splunkes-security-posture",
    domain: "security",
    title: "Module 6 — Security Posture & Dashboards",
    code: "SPLK-M6",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "Security Posture dashboard: key indicators & notable trends",
      "Domain dashboards: Access, Endpoint, Network, Identity",
      "Editing key indicators and creating custom KPIs",
      "Glass Tables: building executive views",
      "Reading and customising the ES home page",
    ],
    labSlugs: ["splunkes-security-posture", "splunkes-glass-table-build"],
  },
  {
    moduleSlug: "splunkes-incident-review",
    domain: "security",
    title: "Module 7 — Incident Review & Notable Events",
    code: "SPLK-M7",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Notable event lifecycle: New → In Progress → Pending → Resolved → Closed",
      "Urgency = severity × priority; ownership and assignment",
      "Triaging in Incident Review: filters, suppress, ad-hoc search",
      "Adjacent Events, Contributing Events and adaptive response",
      "Documenting comments and disposition",
    ],
    labSlugs: ["splunkes-incident-review-triage", "splunkes-notable-suppress", "splunkes-adaptive-response"],
  },
  {
    moduleSlug: "splunkes-correlation-searches",
    domain: "security",
    title: "Module 8 — Correlation Searches & Detections",
    code: "SPLK-M8",
    theoryMinutes: 60,
    labBudgetMinutes: 90,
    topics: [
      "Anatomy of a correlation search (search, schedule, throttle)",
      "Mapping detections to MITRE ATT&CK",
      "Cloning and tuning out-of-the-box rules",
      "Building a new detection from a hunt: brute force → notable",
      "Adaptive response actions: notable, risk, email, ticket, script",
    ],
    labSlugs: ["splunkes-clone-tune-rule", "splunkes-build-correlation", "splunkes-attack-mapping"],
  },
  {
    moduleSlug: "splunkes-rba",
    domain: "security",
    title: "Module 9 — Risk-Based Alerting (RBA)",
    code: "SPLK-M9",
    theoryMinutes: 45,
    labBudgetMinutes: 60,
    topics: [
      "Why RBA: from alert fatigue to risk-scored entities",
      "Risk index, risk objects (user/system/other) and risk_score",
      "Risk Analysis dashboard and contributing risk events",
      "Risk Notables: thresholding, ATT&CK breadth, time windows",
      "Designing an RBA program: rules, scoring, governance",
    ],
    labSlugs: ["splunkes-rba-risk-analysis", "splunkes-rba-create-risk-rule", "splunkes-rba-risk-notable"],
  },
  {
    moduleSlug: "splunkes-investigations",
    domain: "security",
    title: "Module 10 — Investigation Workbench",
    code: "SPLK-M10",
    theoryMinutes: 30,
    labBudgetMinutes: 60,
    topics: [
      "Creating an investigation from a notable",
      "Timeline, artifacts (entities, files, URLs) and notes",
      "Collaboration: collaborators, summary, attachments",
      "Linking adaptive responses and capturing chain of custody",
      "Closing & exporting an investigation",
    ],
    labSlugs: ["splunkes-investigation-timeline", "splunkes-investigation-export"],
  },
  {
    moduleSlug: "splunkes-assets-identities",
    domain: "security",
    title: "Module 11 — Assets, Identities & Threat Intelligence",
    code: "SPLK-M11",
    theoryMinutes: 45,
    labBudgetMinutes: 60,
    topics: [
      "Asset & identity framework: lookups, transforms, merge logic",
      "Onboarding AD/Entra identities and CMDB assets",
      "Threat Intelligence framework: TAXII, file, IOC types",
      "Threat Activity dashboard and threat_activity index",
      "Tuning false positives in intel matches",
    ],
    labSlugs: ["splunkes-asset-onboard", "splunkes-identity-merge", "splunkes-threat-intel-feed"],
  },
  {
    moduleSlug: "splunkes-ueba-soar",
    domain: "exam",
    title: "Module 12 — UEBA, SOAR & Career Prep",
    code: "SPLK-M12",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "Splunk UBA at a glance: anomalies vs threats vs notables",
      "Splunk SOAR (Phantom): playbooks, actions, assets",
      "Connecting ES → SOAR via adaptive response",
      "SPLK-3001 exam strategy + SOC L1/L2 interview drills",
      "Building your portfolio: dashboards, glass tables, RBA story",
    ],
    labSlugs: ["splunkes-soar-playbook", "splunkes-mock-interview"],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Exam prep — SPLK-3001 + SOC interview",
    theoryMinutes: 30,
    labBudgetMinutes: 30,
    topics: [
      "SPLK-3001 ES Certified Admin blueprint walkthrough",
      "SPLK-1003 Splunk Admin overlap topics",
      "Common SPL traps and tstats vs stats trade-offs",
      "Top 50 Splunk SOC interview questions",
    ],
    labSlugs: [],
  },
];

const m = (slug: string) =>
  splunkesModuleNotes.find((x) =>
    slug === "exam" ? x.domain === "exam" && x.moduleSlug === null : x.moduleSlug === slug,
  )!;

/* ---------- 5-day plan (recommended) ---------- */
export const splunkesFiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Splunk foundations & SPL (≈ 3h)",
    description: "Tour Splunk Enterprise, then write your first SOC-grade SPL.",
    modules: [m("splunkes-foundations"), m("splunkes-spl-essentials")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Data onboarding & CIM (≈ 3h 15m)",
    description: "Onboard real log sources and align them to the Common Information Model.",
    modules: [m("splunkes-data-onboarding"), m("splunkes-cim-datamodels")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "ES install + Security Posture (≈ 3h)",
    description: "Stand up Splunk ES, set permissions and read the analyst dashboards.",
    modules: [m("splunkes-install-config"), m("splunkes-security-posture")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Triage & detections (≈ 4h 45m)",
    description: "Live triage in Incident Review, then clone & build correlation searches.",
    modules: [m("splunkes-incident-review"), m("splunkes-correlation-searches")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "RBA, Investigations, Assets & exam (≈ 6h 15m)",
    description: "Risk-Based Alerting, Investigation Workbench, Assets/Identities/Intel and SPLK-3001 prep.",
    modules: [
      m("splunkes-rba"),
      m("splunkes-investigations"),
      m("splunkes-assets-identities"),
      m("splunkes-ueba-soar"),
      m("exam"),
    ],
  },
];

/* ---------- 2-day intensive ---------- */
export const splunkesTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations → CIM → ES install (≈ 8h)",
    description: "From SPL to a fully configured ES instance.",
    modules: [
      m("splunkes-foundations"),
      m("splunkes-spl-essentials"),
      m("splunkes-data-onboarding"),
      m("splunkes-cim-datamodels"),
      m("splunkes-install-config"),
    ],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Triage → Detections → RBA → Investigations (≈ 9h)",
    description: "End-to-end SOC analyst workflow inside Splunk ES.",
    modules: [
      m("splunkes-security-posture"),
      m("splunkes-incident-review"),
      m("splunkes-correlation-searches"),
      m("splunkes-rba"),
      m("splunkes-investigations"),
      m("splunkes-assets-identities"),
      m("splunkes-ueba-soar"),
      m("exam"),
    ],
  },
];

/* ---------- 1-day bootcamp ---------- */
export const splunkesOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full Splunk ES bootcamp (extended day)",
    description: "Compressed run of the entire program. Use the 5-day cadence for full lab depth.",
    modules: splunkesModuleNotes,
  },
];

/* ---------- 1-hour intro ---------- */
const introOrientation: ModuleNote = {
  moduleSlug: "splunkes-intro-orientation",
  domain: "concepts",
  title: "Block 1 — Orientation: what Splunk ES actually is (15 min)",
  code: "SPLK-I1",
  theoryMinutes: 15,
  labBudgetMinutes: 0,
  topics: [
    "0:00–0:05 — Hook: a real SOC story powered by Splunk ES",
    "0:05–0:10 — Splunk Core vs Enterprise Security: where ES adds value",
    "0:10–0:15 — Tour: Security Posture → Incident Review → Risk Analysis",
  ],
  labSlugs: [],
};
const introHandsOn: ModuleNote = {
  moduleSlug: "splunkes-intro-handson",
  domain: "security",
  title: "Block 2 — Hands-on: SPL → Triage → RBA (45 min)",
  code: "SPLK-I2",
  theoryMinutes: 5,
  labBudgetMinutes: 40,
  topics: [
    "0:15–0:25 — Lab 1 · First SPL hunt (failed → success logons)",
    "0:25–0:40 — Lab 2 · Triage a notable in Incident Review",
    "0:40–0:50 — Lab 3 · Read the Risk Analysis dashboard for a noisy user",
    "0:50–1:00 — Wrap-up + SPLK-3001 roadmap & Q&A",
  ],
  labSlugs: ["splunkes-spl-failed-logons", "splunkes-incident-review-triage", "splunkes-rba-risk-analysis"],
};

export const splunkesOneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Intro session",
    subtitle: "Splunk Enterprise Security in 60 minutes",
    description:
      "A tightly-timed 1-hour live intro to Splunk ES. Learners write their first SPL, triage a real notable in Incident Review, and read the Risk Analysis dashboard — with a roadmap to the full 5-day program.",
    modules: [introOrientation, introHandsOn],
  },
];

/* ---------- 30-day / 1h-per-day plan ---------- */
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
    moduleSlug: `splunkes-30d-${id}`,
    domain,
    title: `Day ${n} — ${title}`,
    code: `SPLK-D${n}`,
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

export const splunkesThirtyDayPlan: DayPlan[] = [
  day(1, "M1 Foundations", "concepts", "Welcome to Splunk", [
    "Splunk components: indexer, search head, forwarder, DS",
    "Index-time vs search-time pipeline",
    "Splunk Web tour and the jobs manager",
  ], ["splunkes-tour"]),
  day(2, "M1 Foundations", "concepts", "Buckets, indexes & retention", [
    "Hot/warm/cold/frozen bucket lifecycle",
    "Index sizing and retention policy",
    "Choosing where data lives",
  ], ["splunkes-tour"]),
  day(3, "M2 SPL", "security", "First SPL search", [
    "search, fields, table, eval",
    "Time picker basics (earliest/latest)",
    "Reading the Search timeline & jobs",
  ], ["splunkes-spl-first-search"]),
  day(4, "M2 SPL", "security", "stats, chart, timechart", [
    "stats count by, dc, sum, avg",
    "timechart span and sparklines",
    "Building the analyst's first KPI",
  ], ["splunkes-spl-stats-timechart"]),
  day(5, "M2 SPL", "security", "Hunting failed logons", [
    "Windows EventCode 4625 vs 4624",
    "Failed → success transitions per user",
    "Threshold patterns that ship as detections",
  ], ["splunkes-spl-failed-logons"]),
  day(6, "M2 SPL", "security", "Subsearches, joins, append", [
    "When subsearch is faster than join",
    "Cost model and the 50k subsearch cap",
    "Practical SOC examples",
  ], ["splunkes-spl-subsearch"]),
  day(7, "M2 SPL", "security", "transaction vs stats", [
    "When transaction beats stats (sequence matters)",
    "Performance trade-offs",
    "Session-stitching for web logs",
  ], ["splunkes-spl-stats-timechart"]),
  day(8, "M3 Onboarding", "security", "inputs.conf & sourcetypes", [
    "Monitor stanzas and blacklists",
    "Sourcetype design discipline",
    "First-time data onboarding checklist",
  ], ["splunkes-onboard-syslog"]),
  day(9, "M3 Onboarding", "security", "props.conf & transforms.conf", [
    "Line-breaking and timestamp recognition",
    "REGEX field extractions",
    "Routing & filtering data with transforms",
  ], ["splunkes-props-transforms"]),
  day(10, "M3 Onboarding", "security", "Universal Forwarder install", [
    "UF vs HF: when to use each",
    "outputs.conf to indexers",
    "Deployment server basics",
  ], ["splunkes-onboard-syslog"]),
  day(11, "M4 CIM", "security", "Common Information Model", [
    "Why CIM matters for ES",
    "Authentication / Network_Traffic / Endpoint datamodels",
    "Validating compliance",
  ], ["splunkes-cim-validate"]),
  day(12, "M4 CIM", "security", "Datamodel acceleration & tstats", [
    "Why tstats is the SOC's secret weapon",
    "Acceleration design and storage cost",
    "Re-writing a slow search with tstats",
  ], ["splunkes-tstats-hunt"]),
  day(13, "M5 ES install", "security", "ES install & dependencies", [
    "Installing the ES app and TAs",
    "Indexes ES uses (notable, risk, threat_activity)",
    "General settings walkthrough",
  ], ["splunkes-es-tour"]),
  day(14, "M5 ES install", "security", "ES roles & permissions", [
    "ess_admin / ess_analyst / ess_user",
    "Capabilities and indexes_allowed",
    "Lab: grant analyst access safely",
  ], ["splunkes-permissions-roles"]),
  day(15, "M6 Posture", "security", "Security Posture dashboard", [
    "Reading key indicators",
    "Notable trend & top notable events",
    "Customising KPIs",
  ], ["splunkes-security-posture"]),
  day(16, "M6 Posture", "security", "Glass Tables for execs", [
    "Glass Table editor tour",
    "Binding a KPI to a metric",
    "Designing an exec one-pager",
  ], ["splunkes-glass-table-build"]),
  day(17, "M7 Incident Review", "security", "Triaging notables", [
    "New → In Progress → Resolved lifecycle",
    "Urgency = severity × priority",
    "Documenting comments well",
  ], ["splunkes-incident-review-triage"]),
  day(18, "M7 Incident Review", "security", "Suppression & tuning", [
    "Suppress vs disable: choose wisely",
    "Adjacent & contributing events",
    "Closing the loop with the detection author",
  ], ["splunkes-notable-suppress"]),
  day(19, "M7 Incident Review", "security", "Adaptive response actions", [
    "Notable, risk, email, ticket, script actions",
    "Wiring an action to an existing rule",
    "When to automate vs ask a human",
  ], ["splunkes-adaptive-response"]),
  day(20, "M8 Detections", "security", "Anatomy of a correlation search", [
    "Search, schedule, throttle, action",
    "Cron tips that don't melt the SH",
    "Naming conventions that scale",
  ], ["splunkes-clone-tune-rule"]),
  day(21, "M8 Detections", "security", "Clone & tune an OOB rule", [
    "Picking a noisy rule from ES content",
    "Tuning lookbacks, thresholds, throttle",
    "Documenting the change",
  ], ["splunkes-clone-tune-rule"]),
  day(22, "M8 Detections", "security", "Build your first correlation", [
    "From SPL hunt → scheduled rule",
    "Creating a notable with severity",
    "Mapping to MITRE ATT&CK",
  ], ["splunkes-build-correlation", "splunkes-attack-mapping"]),
  day(23, "M9 RBA", "security", "RBA fundamentals", [
    "Why RBA beats per-rule alerts",
    "Risk index & risk_score",
    "Risk objects: user, system, other",
  ], ["splunkes-rba-risk-analysis"]),
  day(24, "M9 RBA", "security", "Create a risk rule", [
    "Convert a hunt into a risk-creating rule",
    "Score weighting and ATT&CK breadth",
    "Risk Analysis dashboard pivot",
  ], ["splunkes-rba-create-risk-rule"]),
  day(25, "M9 RBA", "security", "Risk Notable thresholding", [
    "Designing a risk-notable rule",
    "Time-window and breadth controls",
    "Alert fatigue: before vs after",
  ], ["splunkes-rba-risk-notable"]),
  day(26, "M10 Investigations", "security", "Workbench timeline", [
    "Building an investigation from a notable",
    "Adding artifacts and notes",
    "Collaboration features",
  ], ["splunkes-investigation-timeline"]),
  day(27, "M10 Investigations", "security", "Closing & exporting", [
    "Summary that ships to leadership",
    "Exporting evidence",
    "Lessons-learned format",
  ], ["splunkes-investigation-export"]),
  day(28, "M11 Assets/Identities/Intel", "security", "Assets & Identities", [
    "Asset & identity framework basics",
    "Lookup design and merge order",
    "Onboarding CMDB & AD",
  ], ["splunkes-asset-onboard", "splunkes-identity-merge"]),
  day(29, "M11 Assets/Identities/Intel", "security", "Threat Intel framework", [
    "TAXII feeds and IOC types",
    "Threat Activity dashboard",
    "Tuning intel false positives",
  ], ["splunkes-threat-intel-feed"]),
  day(30, "M12 UEBA / SOAR / Exam", "exam", "SPLK-3001 + interview drill", [
    "SPLK-3001 blueprint walkthrough",
    "Top 50 Splunk SOC interview questions",
    "Resume polish & next steps",
  ], ["splunkes-soar-playbook", "splunkes-mock-interview"]),
];
