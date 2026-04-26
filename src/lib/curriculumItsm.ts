// CIS-ITSM curriculum (ServiceNow Certified Implementation Specialist — IT Service Management).
// Mirrors the SC-900 curriculum shape so all course-aware components work out of the box.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const itsmModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "itsm-foundations",
    domain: "concepts",
    title: "Module 1 — ITSM Foundations & ServiceNow Platform",
    code: "ITSM-M1",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "ITIL 4 service value system & guiding principles",
      "ServiceNow Now Platform overview (instance, scopes, applications)",
      "Roles: itil, itil_admin, admin, request approver, knowledge author",
      "Process flow: Request → Incident → Problem → Change",
      "Tables vs records vs forms — UI Builder & Service Portal basics",
    ],
    labSlugs: ["itsm-explore-instance", "itsm-roles-and-groups", "itsm-process-map"],
  },
  {
    moduleSlug: "itsm-incident",
    domain: "iam",
    title: "Module 2 — Incident Management",
    code: "ITSM-M2",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Incident lifecycle (New → In Progress → On Hold → Resolved → Closed)",
      "Priority calculation: Impact × Urgency matrix",
      "Assignment groups, on-call schedules, and SLAs (Response, Resolve)",
      "Major Incident Management (MIM) and communication tasks",
      "Incident → Problem promotion and parent/child relationships",
    ],
    labSlugs: ["itsm-create-incident", "itsm-priority-matrix", "itsm-resolve-and-close", "itsm-major-incident"],
  },
  {
    moduleSlug: "itsm-problem",
    domain: "entra",
    title: "Module 3 — Problem & Knowledge Management",
    code: "ITSM-M3",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Problem record vs Known Error vs Workaround",
      "Root Cause Analysis (RCA) techniques: 5 Whys, Fishbone",
      "Knowledge-Centered Service (KCS) workflow & article states",
      "Linking Problems to Incidents and Changes",
      "Publishing & retiring KB articles with approval workflows",
    ],
    labSlugs: ["itsm-create-problem", "itsm-rca-five-whys", "itsm-create-kb-article", "itsm-link-known-error"],
  },
  {
    moduleSlug: "itsm-change",
    domain: "security",
    title: "Module 4 — Change & Release Management",
    code: "ITSM-M4",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Change types: Standard, Normal, Emergency",
      "Change Advisory Board (CAB) workbench & approval policies",
      "Risk & impact assessment, conflict detection",
      "Change schedule / blackout windows",
      "Release vs Change vs Deployment — promotion across environments",
    ],
    labSlugs: ["itsm-standard-change", "itsm-normal-change-cab", "itsm-emergency-change", "itsm-change-schedule", "itsm-release-promote"],
  },
  {
    moduleSlug: "itsm-catalog-cmdb",
    domain: "compliance",
    title: "Module 5 — Request Fulfilment, CMDB & Service Catalog",
    code: "ITSM-M5",
    theoryMinutes: 45,
    labBudgetMinutes: 90,
    topics: [
      "Service Catalog: categories, items, variables, variable sets",
      "Request → Requested Item (RITM) → Catalog Task workflow",
      "CMDB foundations: CIs, classes, relationships, CI lifecycle",
      "Discovery, Service Mapping & CSDM (Common Service Data Model)",
      "Reporting & dashboards for ITSM KPIs (MTTR, FCR, change success rate)",
    ],
    labSlugs: ["itsm-build-catalog-item", "itsm-fulfil-request", "itsm-create-ci", "itsm-relate-cis", "itsm-mttr-dashboard"],
  },
  {
    moduleSlug: "itsm-sla-workflow",
    domain: "concepts",
    title: "Module 6 — SLAs, OLAs & Workflow Automation",
    code: "ITSM-M6",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "SLA Definition: conditions, schedule, retroactive start, pause / resume",
      "SLA vs OLA vs Underpinning Contract",
      "Task SLA records and breach notifications",
      "Flow Designer: triggers, actions, subflows, error handling",
      "Business Rules vs Flow Designer — when to use which",
    ],
    labSlugs: [
      "itsm-build-sla-definition",
      "itsm-pause-resume-sla",
      "itsm-flow-on-incident",
      "itsm-subflow-reuse",
    ],
  },
  {
    moduleSlug: "itsm-portal-va",
    domain: "iam",
    title: "Module 7 — Service Portal & Virtual Agent",
    code: "ITSM-M7",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Service Portal anatomy: portals, pages, widgets, themes",
      "Branding: logo, colour palette, custom CSS scopes",
      "Virtual Agent: topics, topic blocks, NLU model basics",
      "Live Agent handoff and conversation transcripts",
      "Mobile app vs Service Portal — when to use each",
    ],
    labSlugs: [
      "itsm-brand-portal",
      "itsm-add-portal-widget",
      "itsm-build-va-topic",
      "itsm-va-handoff",
    ],
  },
  {
    moduleSlug: "itsm-pa-ci",
    domain: "entra",
    title: "Module 8 — Performance Analytics & Continual Improvement",
    code: "ITSM-M8",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Performance Analytics: indicators, breakdowns, scorecards",
      "Data collectors and historical scoring vs reports",
      "ITSM benchmarks and Predictive Intelligence overview",
      "Continual Improvement Management (CIM): phases & dashboards",
      "Using PA signals to drive CIM initiatives",
    ],
    labSlugs: [
      "itsm-create-pa-indicator",
      "itsm-build-scorecard",
      "itsm-launch-cim-initiative",
      "itsm-pa-benchmark",
    ],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Exam prep — CIS-ITSM strategy",
    theoryMinutes: 15,
    labBudgetMinutes: 15,
    topics: [
      "How CIS-ITSM scenarios are framed (configuration vs customization)",
      "High-yield process terminology to memorise",
      "Time management — 60 questions in 90 minutes (≈ 1m30 per question)",
    ],
    labSlugs: [],
  },
];

const m = (slug: string) =>
  itsmModuleNotes.find((x) => (slug === "exam" ? x.domain === "exam" : x.moduleSlug === slug))!;

/* ---------- Day plans ---------- */
export const itsmFiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "ITSM Foundations & Now Platform (1h 30m)",
    description: "ITIL 4 service value system, Now Platform tour and core ITSM data model.",
    modules: [m("itsm-foundations")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Incident Management (2h)",
    description: "Full Incident lifecycle, priority matrix, assignment rules, SLAs and Major Incident Management.",
    modules: [m("itsm-incident")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "Problem & Knowledge Management (2h)",
    description: "RCA, known errors, problem tasks and the Knowledge-Centered Service workflow.",
    modules: [m("itsm-problem")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Change & Release Management (2h)",
    description: "Standard, Normal and Emergency change workflows, CAB approvals and release coordination.",
    modules: [m("itsm-change")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Catalog, Request Fulfilment & CMDB (2h 15m)",
    description: "Service Catalog, RITM/Catalog Tasks, CMDB & CSDM foundations and ITSM KPIs.",
    modules: [m("itsm-catalog-cmdb")],
  },
  {
    id: "day6",
    label: "Day 6",
    subtitle: "SLAs, OLAs & Workflow Automation (2h)",
    description: "SLA Definitions with start/pause/stop conditions, Flow Designer triggers, actions and subflows.",
    modules: [m("itsm-sla-workflow")],
  },
  {
    id: "day7",
    label: "Day 7",
    subtitle: "Service Portal & Virtual Agent (2h)",
    description: "Service Portal branding, widget instances and Virtual Agent topic authoring with live-agent handoff.",
    modules: [m("itsm-portal-va")],
  },
  {
    id: "day8",
    label: "Day 8",
    subtitle: "Performance Analytics, CIM & Exam (2h 15m)",
    description: "PA indicators, scorecards and breakdowns, the 7-phase CIM lifecycle and CIS-ITSM exam strategy.",
    modules: [m("itsm-pa-ci"), m("exam")],
  },
];

export const itsmTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations, Incident, Problem & Change (6h)",
    description: "Platform tour, Incident lifecycle, Problem/Knowledge, then Change & Release.",
    modules: itsmModuleNotes.filter((x) =>
      ["itsm-foundations", "itsm-incident", "itsm-problem", "itsm-change"].includes(x.moduleSlug ?? ""),
    ),
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Catalog, SLAs, Portal, PA & Exam (6h)",
    description: "Service Catalog & CMDB, SLAs + Flow Designer, Service Portal & VA, Performance Analytics, then exam strategy.",
    modules: itsmModuleNotes.filter((x) =>
      ["itsm-catalog-cmdb", "itsm-sla-workflow", "itsm-portal-va", "itsm-pa-ci"].includes(x.moduleSlug ?? "")
      || x.domain === "exam",
    ),
  },
];

export const itsmOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full CIS-ITSM bootcamp (10h)",
    description: "Run the entire ITSM curriculum in a single intensive guided session.",
    modules: itsmModuleNotes,
  },
];
