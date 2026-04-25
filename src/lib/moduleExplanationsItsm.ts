// CIS-ITSM module explanations. Same shape as moduleExplanations.ts so the
// existing Module.tsx page renders ServiceNow content with zero refactor.
//
// Slugs deliberately reuse the SC-900 buckets (concepts/iam/entra/security/compliance)
// so domain styling stays consistent — but every word here is ITSM/ServiceNow.

import type { ModuleExplanation } from "./moduleExplanations";

/* ============================================================== */
/* M1 — ITSM FOUNDATIONS & SERVICENOW PLATFORM                     */
/* ============================================================== */
const m1: ModuleExplanation = {
  moduleSlug: "itsm-foundations",
  tagline: "How ITIL 4 thinking maps onto the ServiceNow Now Platform.",
  overview:
    "Module 1 grounds you in the ITIL 4 vocabulary the CIS-ITSM exam assumes you already know — Service Value System, guiding principles, value streams — and then anchors each idea on a concrete piece of the ServiceNow Now Platform (instance, scopes, applications, tables, ACLs, roles). Master this and the rest of the course is just configuration choices on top of a model you already understand.",
  whyItMatters:
    "Most CIS-ITSM scenario questions are really 'which OOB feature already does this?' — you can only answer that if you know what the platform ships with. Knowing the difference between a record, a form, an application and a scope prevents the #1 implementer mistake: building a custom thing that already exists.",

  what: {
    heading: "What is ITSM on ServiceNow?",
    body:
      "IT Service Management is the discipline of running IT as a value-producing service to the business. ServiceNow ITSM is the ITIL-aligned implementation of that discipline on the Now Platform — Incident, Problem, Change, Request, Knowledge and CMDB applications, all sharing one data model.",
    bullets: [
      "ITIL 4 = the framework (definitions and practices)",
      "ServiceNow ITSM = a vendor implementation of those practices",
      "Now Platform = the underlying tables, workflow, UI and security engine",
    ],
  },
  why: {
    heading: "Why study foundations first?",
    body:
      "Every later module references these foundations. Priority calculations, assignment rules, CAB approvals, KB workflows and CMDB relationships are all just records on tables governed by ACLs and business rules — once you 'see' the platform that way, configuration becomes obvious.",
  },
  who: {
    heading: "Who uses what?",
    body:
      "End users raise requests through Service Portal / Now Mobile. Fulfillers (itil role) work records in the platform UI. Process owners (admin / itil_admin) configure workflows. Implementers (you) deliver the configuration that makes all of that work without customisation.",
    bullets: [
      "End user — no role, raises requests via portal",
      "itil — fulfils Incident / Problem / Change / Request",
      "itil_admin — manages process configuration",
      "admin — full platform access (use sparingly)",
    ],
  },
  when: {
    heading: "When in a project?",
    body:
      "Foundations are taught in week 1 of any ITSM rollout. Skipping them is the #1 reason rollouts blow up: stakeholders ask for 'a custom field' and the team builds 14 of them before realising the OOB model already supported the requirement.",
  },
  where: {
    heading: "Where does it live?",
    body:
      "Everything is a record on a table in the global or an application scope. UI Builder / Service Portal renders forms; Flow Designer orchestrates work; ACLs decide who can see and edit what. There's no separate 'ITSM database' — it's all the Now Platform.",
  },
  how: {
    heading: "How is the platform organised?",
    body:
      "Applications group related tables (e.g. Incident app owns task, incident, sys_journal_field). Scopes provide isolation (global vs application scope). Roles grant access. Business rules, client scripts and Flow Designer add behaviour. UI policies and ACLs control visibility and security.",
  },

  conceptDeepDives: [
    {
      id: "svs",
      name: "ITIL 4 Service Value System (SVS)",
      oneLine: "The end-to-end model of how an organisation turns demand into value.",
      formal: "The SVS describes how all the components and activities of an organisation work together as a system to enable value creation. It includes the guiding principles, governance, the service value chain, practices, and continual improvement.",
      plainEnglish: "It's the picture that says: opportunity / demand goes in, value comes out, and here are the moving parts in between.",
      analogy: "A factory: raw materials in (demand), products out (value), with machines (practices), foremen (governance) and a quality team (continual improvement) in between.",
      howItWorks: "Demand and opportunity feed the Service Value Chain (plan, improve, engage, design & transition, obtain/build, deliver & support). The chain consumes practices (Incident, Change, etc.) and produces products and services that deliver value.",
      microsoftMapping: "ServiceNow ITSM is the operational layer — Incident, Problem, Change, Request, KB and CMDB are the practices that plug into the value chain.",
      whenToUse: "Use the SVS when explaining 'why we need this process' to a sceptical stakeholder.",
      commonMistake: "Treating ITIL practices as silos. The point of the SVS is that they only deliver value when combined.",
      examAngle: "Expect questions that ask which guiding principle applies to a given situation (e.g. 'focus on value', 'start where you are').",
    },
    {
      id: "now-platform",
      name: "Now Platform anatomy",
      oneLine: "Tables + records + UI + workflow + security, all in one app server.",
      formal: "A multi-instance, single-tenant cloud platform built on a relational database, exposing a metadata-driven UI, a workflow engine (Flow Designer), and a JavaScript/Glide API.",
      plainEnglish: "Think of it as 'Excel + workflow + a portal', where every sheet is a table, every row is a record, and every column has rules.",
      analogy: "Salesforce, but for IT operations — same metadata-driven model, same idea of records, fields and ACLs.",
      howItWorks: "Each customer gets isolated instance(s) (e.g. dev, test, prod). Configuration moves between them via Update Sets or via the App Store / Source Control.",
      microsoftMapping: "Instance ≈ a single tenant. Application ≈ a logical product (Incident, HRSD, ITSM Pro). Scope ≈ namespace that prevents two apps from clobbering each other.",
      whenToUse: "Always. Every CIS-ITSM answer ultimately ties back to 'where does this live in the Now Platform?'",
      commonMistake: "Building in the global scope when you should use an application scope — it makes upgrades painful.",
      examAngle: "You will see questions about which scope, which role, and which table a given record belongs to.",
    },
    {
      id: "task-table",
      name: "The Task table & inheritance",
      oneLine: "Incident, Problem, Change, sc_request all extend a common parent: task.",
      formal: "task is the abstract base table. Incident, Problem, Change, Request, sc_req_item and Catalog Task all extend it, inheriting fields like number, assignment_group, state, priority, opened_at and approval.",
      plainEnglish: "All work records share a backbone, which is why you can run reports across 'all open tasks' regardless of type.",
      analogy: "Object inheritance in code — task is the base class, Incident is a subclass that adds incident-specific fields.",
      howItWorks: "Add a field to task and every child gets it. Add a field to incident and only incidents get it. Use this to your advantage — never duplicate a field that already exists on task.",
      microsoftMapping: "Used by SLA engine, assignment rules, approvals and Flow Designer triggers — they all key off task fields.",
      whenToUse: "Whenever you're tempted to add a field 'on incident only', check task first.",
      commonMistake: "Creating a custom u_assignee field on incident when assigned_to already exists on task.",
      examAngle: "Questions often hide the right answer behind 'which table inherits from task?'",
    },
    {
      id: "roles",
      name: "Roles & groups",
      oneLine: "Roles grant capability; groups assign work and bundle roles for users.",
      formal: "A role is a permission token referenced by ACLs and UI policies. A group is a set of users; roles can be granted to a group so all members inherit them.",
      plainEnglish: "Roles say what you can do; groups say who works together and on what.",
      analogy: "Roles = keys. Groups = teams that share a keyring.",
      howItWorks: "User → Group(s) → Role(s) chain. ACLs evaluate role membership at runtime. Assignment rules route tasks to a group, not a person.",
      microsoftMapping: "itil = fulfiller. itil_admin = process admin. admin = god mode. catalog = catalog admin. knowledge = KB author/admin.",
      whenToUse: "Always grant roles via groups, never directly to users.",
      whenNotToUse: "Don't grant admin to users 'temporarily' — there is no temporarily in production.",
      commonMistake: "Assigning roles directly to users — it makes audits and offboarding painful.",
      examAngle: "Expect 'which role is required to…' style questions.",
    },
    {
      id: "scopes",
      name: "Application scopes",
      oneLine: "A namespace boundary that protects custom apps from each other and from upgrades.",
      formal: "An application scope is a metadata container. Scoped apps cannot freely write into another scope; cross-scope access requires explicit privilege.",
      plainEnglish: "Like a sandbox — your custom app can't accidentally break the OOB Incident app, and ServiceNow upgrades can't break yours.",
      analogy: "Microservices vs a monolith — each scope is its own service.",
      howItWorks: "Create a custom app → ServiceNow assigns a scope (e.g. x_acme_app). Tables, scripts and records inside that scope are protected.",
      microsoftMapping: "Scoped apps publish via the App Repository or Source Control. Global scope is the legacy default — avoid for new build.",
      whenToUse: "Every new custom app should be scoped.",
      commonMistake: "Building in global because 'it's quicker' — you pay for it at every upgrade.",
      examAngle: "Questions test whether you know what global vs scoped means for upgrades and ACLs.",
    },
  ],

  comparisons: [
    {
      title: "Application vs Module vs Table vs Record",
      columns: ["Concept", "What it is", "Example"],
      rows: [
        ["Application", "Logical product made of tables, forms and workflow", "Incident Management"],
        ["Module", "A nav menu link inside an application", "All Open Incidents"],
        ["Table", "Where data lives", "incident"],
        ["Record", "A single row on a table", "INC0010001"],
      ],
      bottomLine: "Records live on tables; tables belong to applications; modules just navigate to filtered table views.",
    },
    {
      title: "ITIL practice vs ServiceNow application",
      columns: ["ITIL 4 practice", "ServiceNow application", "Primary table"],
      rows: [
        ["Incident management", "Incident", "incident"],
        ["Problem management", "Problem", "problem"],
        ["Change enablement", "Change", "change_request"],
        ["Service request management", "Service Catalog / Request", "sc_request / sc_req_item"],
        ["Service configuration management", "CMDB", "cmdb_ci"],
        ["Knowledge management", "Knowledge", "kb_knowledge"],
      ],
      bottomLine: "ITIL gives the names; ServiceNow gives the tables. Memorise the pairs.",
    },
  ],

  realExamples: [
    {
      title: "Onboarding scoped app",
      scenario: "A new HR onboarding workflow is needed. The team is tempted to add columns to the existing Incident table.",
      outcome: "You create a scoped application with its own table extending task, inheriting state/assignment/SLA logic without polluting Incident.",
    },
    {
      title: "Role hygiene during go-live",
      scenario: "30 fulfillers need access to a new fulfilment group on day one of go-live.",
      outcome: "You grant the itil role to the group (not the users) and add the users to the group — onboarding/offboarding becomes one click forever.",
    },
  ],

  keyTerms: [
    { term: "Instance", definition: "A single ServiceNow tenant — typically dev, test, prod.", example: "https://acmecorp.service-now.com" },
    { term: "Scope", definition: "Namespace that isolates a custom application's metadata.", example: "x_acme_onboarding" },
    { term: "ACL", definition: "Access Control rule that decides who can read/write a record or field.", example: "Only itil role can write incident.priority" },
    { term: "Update Set", definition: "Bundle of configuration changes used to migrate work between instances.", example: "Promote 'PRJ-Catalog-v2' from dev to test" },
    { term: "Flow Designer", definition: "Low-code visual workflow engine.", example: "On incident assignment → notify group lead" },
  ],

  commonPitfalls: [
    "Granting admin instead of itil_admin — admin bypasses ALL ACLs.",
    "Customising in global scope — every upgrade becomes a merge nightmare.",
    "Adding fields to incident that already exist on task.",
    "Routing work to people instead of groups — breaks the moment they go on leave.",
  ],

  faqs: [
    { q: "Do I need to know JavaScript for CIS-ITSM?", a: "Only at a 'recognise it' level. The exam cares far more about configuration choices than scripting." },
    { q: "What's the difference between itil and itil_admin?", a: "itil works the records (resolve incidents). itil_admin configures the process (assignment rules, SLAs)." },
    { q: "Should I always use Flow Designer over Workflow Editor?", a: "Yes for new builds. Workflow Editor is legacy; Flow Designer is the strategic engine." },
  ],

  selfCheck: [
    {
      question: "Which table do Incident, Problem and Change all extend?",
      options: ["task", "cmdb_ci", "sys_user", "sc_request"],
      correctIndex: 0,
      explanation: "All three extend task, which is why fields like assignment_group, state and priority appear on every fulfilment record.",
    },
    {
      question: "A user needs to fulfil incidents. Which role do you grant?",
      options: ["admin", "itil", "itil_admin", "user_admin"],
      correctIndex: 1,
      explanation: "itil is the fulfiller role. itil_admin configures the process; admin is reserved for platform administrators.",
    },
  ],

  examTips: [
    "Memorise the ITIL → ServiceNow application → primary table mapping.",
    "Always answer 'use the OOB feature' over 'build a custom one'.",
    "Routing is to GROUPS, never to individual users.",
  ],

  furtherReading: [
    { label: "ServiceNow Docs — Now Platform", url: "https://www.servicenow.com/docs/" },
    { label: "ITIL 4 Foundation overview (Axelos)", url: "https://www.axelos.com/certifications/itil-service-management/itil-4-foundation" },
  ],
};

/* ============================================================== */
/* M2 — INCIDENT MANAGEMENT                                        */
/* ============================================================== */
const m2: ModuleExplanation = {
  moduleSlug: "itsm-incident",
  tagline: "Restore service as quickly as possible — measured in MTTR.",
  overview:
    "Incident Management's only goal is to restore normal service operation as fast as possible. In ServiceNow that translates to a tightly defined lifecycle, an Impact × Urgency priority matrix, group-based assignment, SLAs that pause/resume, and a Major Incident Management (MIM) process for the worst cases.",
  whyItMatters:
    "Incident is the front door of any ITSM rollout. If you can't model state transitions, priority and SLA correctly, nothing else in the certification matters.",

  what: {
    heading: "What is an incident?",
    body:
      "An unplanned interruption to a service, or a reduction in the quality of a service. The output of incident management is service restoration — root cause investigation belongs in Problem.",
  },
  why: {
    heading: "Why a strict lifecycle?",
    body:
      "Without an enforced lifecycle, you can't measure MTTR, you can't trigger SLAs, and you can't tell whether a record is stuck. The state field is the spine of every report and every SLA.",
  },
  who: {
    heading: "Who works incidents?",
    body:
      "Service Desk (L1) categorises and resolves trivial cases. Specialist support groups (L2/L3) handle escalations. Major Incident Manager owns P1 communications. Knowledge author publishes resolutions as KB articles.",
  },
  when: {
    heading: "When does an incident open?",
    body:
      "The moment a user, monitoring tool or third-party system detects degradation. ServiceNow can ingest from email, MID Server, Event Management or REST API.",
  },
  where: {
    heading: "Where does it live?",
    body:
      "On the incident table (extends task). Related lists carry attachments, work notes, related CIs, parent/child incidents, and the Problem/Change links.",
  },
  how: {
    heading: "How is priority calculated?",
    body:
      "Priority = lookup(Impact, Urgency) on the priority data lookup table. Impact = how widespread; Urgency = how time-critical. The combination drives SLA selection and assignment rules.",
  },

  conceptDeepDives: [
    {
      id: "lifecycle",
      name: "Incident lifecycle",
      oneLine: "New → In Progress → On Hold → Resolved → Closed.",
      formal: "A finite state machine governing the incident.state field. Transitions are constrained by UI policies, business rules and process flow.",
      plainEnglish: "Every incident must move through these states; you can't jump from New straight to Closed.",
      analogy: "Like an order in an e-commerce site — placed, paid, shipped, delivered, received.",
      howItWorks: "State changes capture timestamps used to compute MTTR, SLA pause windows (On Hold) and reopen rules (within X days of Resolved).",
      microsoftMapping: "Configured via the Process Flow formatter, choice list values, and the Inactivity Monitor for auto-close after N days.",
      whenToUse: "Always — the lifecycle is the contract between Service Desk and reporting.",
      commonMistake: "Adding custom states without updating SLA conditions, business rules and reports — they silently break.",
      examAngle: "Expect a question on what 'On Hold' does to the active SLA timer (it pauses).",
    },
    {
      id: "priority",
      name: "Impact × Urgency priority matrix",
      oneLine: "A 3×3 (or 4×4) lookup that converts Impact and Urgency into Priority 1–5.",
      formal: "The Priority Data Lookup table maps (impact, urgency) tuples to a single priority value, evaluated by a Data Lookup Definition rule.",
      plainEnglish: "Customer says 'this is urgent', you decide based on how many people it affects AND how time-critical it is — not just one of those.",
      analogy: "A hospital triage matrix — bleeding (impact) AND chest pain (urgency) trumps everything else.",
      howItWorks: "On insert/update of impact or urgency, the data lookup rule writes a priority value. Assignment rules and SLAs then key off priority.",
      microsoftMapping: "Configurable via System Policy → Data Lookup Definitions → Priority Lookup Rules. Modify the priority_data_lookup table to change the matrix.",
      whenToUse: "Always — never let users set priority directly. They will set everything to P1.",
      commonMistake: "Removing the data lookup business rule and exposing priority as editable — the matrix becomes meaningless.",
      examAngle: "You'll get a 'a P1 incident has Impact = High, Urgency = ?' question. The answer is High.",
    },
    {
      id: "assignment",
      name: "Assignment rules & groups",
      oneLine: "Route work to a group, not a person; round-robin or load-balanced inside the group.",
      formal: "An Assignment Rule (sys_assignment_rule) sets assignment_group based on conditions; downstream auto-assignment can pick a member.",
      plainEnglish: "The platform picks the right team automatically based on category, location or CI. The team picks the person.",
      analogy: "Call centre IVR — first picks the right queue, then the next available agent.",
      howItWorks: "Triggered on incident insert. Conditions can include category, subcategory, CI's support group, caller's location.",
      microsoftMapping: "Configured under System Policy → Assignment Rules. For load balancing inside a group use the OOB Auto-assignment plugin or Predictive Intelligence.",
      whenToUse: "Always. Manual assignment is the #1 cause of MTTR breach.",
      commonMistake: "Hard-coding a group sys_id in script — when the group is renamed or replaced everything breaks.",
      examAngle: "Expect 'why is this incident not auto-assigning?' troubleshooting questions.",
    },
    {
      id: "sla",
      name: "SLA Definitions & Task SLAs",
      oneLine: "SLA Definition is the rule; Task SLA is the running clock on a specific incident.",
      formal: "An SLA Definition (contract_sla) defines start/pause/stop conditions and target duration. When matched, a Task SLA record is created and an SLA engine job updates remaining time.",
      plainEnglish: "Define once: 'P1 must resolve in 4 business hours, pause when On Hold'. The platform then ticks a clock for each P1 incident.",
      analogy: "A stopwatch with conditions — start, pause when waiting on customer, stop when resolved.",
      howItWorks: "Set start = Active=true & Priority=1. Pause = State=On Hold. Stop = State=Resolved. The SLA Engine business rule maintains it.",
      microsoftMapping: "Use Service Level Management → SLA Definitions. Pair with the Incident SLA workbench.",
      whenToUse: "Every priority should have at least one SLA Definition (Response and Resolve).",
      commonMistake: "Forgetting to add a Pause condition — incidents waiting on the customer breach unfairly.",
      examAngle: "Watch for 'breached vs cancelled vs achieved' status questions.",
    },
    {
      id: "mim",
      name: "Major Incident Management (MIM)",
      oneLine: "Promote a P1 to a Major Incident with a dedicated comms workflow.",
      formal: "A Major Incident is a P1 promoted via the 'Promote to Major Incident' UI Action, creating a Major Incident record with an MIM workbench, comms tasks and a war-room channel.",
      plainEnglish: "When the whole company is down, you don't just work the ticket — you run a comms operation in parallel.",
      analogy: "A fire drill — separate roles, separate channels, separate playbook.",
      howItWorks: "Approval (proposed → accepted) → MIM workbench opens → comms templates fire on a schedule → resolution communications close it out.",
      microsoftMapping: "Requires the Major Incident Management plugin; integrates with Now Mobile and MS Teams for war-room notifications.",
      whenToUse: "Critical-impact, business-stopping incidents.",
      whenNotToUse: "P3 / P4 incidents — running MIM on those creates noise fatigue.",
      commonMistake: "Skipping the proposed/accepted gate — you flood execs with false alarms.",
      examAngle: "Know the Promote → Propose → Accept flow.",
    },
  ],

  comparisons: [
    {
      title: "Incident vs Problem vs Change",
      columns: ["Aspect", "Incident", "Problem", "Change"],
      rows: [
        ["Goal", "Restore service", "Eliminate root cause", "Modify environment safely"],
        ["Trigger", "Service degradation", "Repeating incidents", "Approved business need"],
        ["Output", "Workaround / fix", "Known Error + permanent fix", "Implemented change"],
        ["Primary table", "incident", "problem", "change_request"],
      ],
      bottomLine: "Incident = stop the bleeding. Problem = find the cause. Change = apply the cure safely.",
    },
  ],

  realExamples: [
    {
      title: "Email outage triage",
      scenario: "Outlook is down for 400 users in Bangalore. Service Desk creates an incident.",
      outcome: "Impact=High + Urgency=High → P1 → assigned to Messaging group → SLA target 4h → promoted to Major Incident with hourly comms.",
    },
    {
      title: "VIP password reset",
      scenario: "The CEO can't log in. Service Desk creates an incident.",
      outcome: "Impact=Low + Urgency=High → P3, but VIP flag triggers a separate VIP-Response SLA targeting 15-minute response.",
    },
  ],

  keyTerms: [
    { term: "MTTR", definition: "Mean Time To Resolve — average duration from open to resolved.", example: "P1 MTTR target = 4h" },
    { term: "FCR", definition: "First Call Resolution — % of incidents resolved on first contact without escalation." },
    { term: "Workaround", definition: "A short-term restoration that doesn't fix root cause." },
    { term: "On Hold reason", definition: "Why an incident is paused — Awaiting Caller / Vendor / Change.", example: "Awaiting Caller pauses the SLA" },
  ],

  commonPitfalls: [
    "Letting users set priority directly — kill the matrix and you kill SLA fairness.",
    "Closing incidents straight from In Progress — bypasses the resolved → reopen window.",
    "Forgetting Pause conditions on SLAs — incidents breach unfairly.",
    "Routing to individuals — anything personal breaks at the next holiday.",
  ],

  faqs: [
    { q: "What stops the SLA clock?", a: "A configured Stop condition — typically state = Resolved or Closed." },
    { q: "Should I copy a P1 to Problem immediately?", a: "Promote to Problem only after the incident is restored, unless the same root cause is generating multiple incidents." },
    { q: "Can a user reopen a Closed incident?", a: "By default no — only Resolved incidents can be reopened within the configured window (e.g. 7 days)." },
  ],

  selfCheck: [
    {
      question: "An incident is set to On Hold — Awaiting Caller. What happens to the active Task SLA?",
      options: ["It is cancelled", "It pauses", "It restarts from zero", "Nothing — SLAs only consider state Resolved"],
      correctIndex: 1,
      explanation: "The OOB SLA Definition has a Pause condition on On Hold, so the timer pauses and resumes when work continues.",
    },
    {
      question: "Where is the priority value calculated?",
      options: ["A client script on the Priority field", "A data lookup rule on Impact and Urgency", "Manually by the assignee", "By the SLA engine"],
      correctIndex: 1,
      explanation: "The Priority Data Lookup rule maps Impact × Urgency tuples to a Priority value automatically on insert/update.",
    },
  ],

  examTips: [
    "Memorise the Impact × Urgency = Priority matrix.",
    "Know which states pause the SLA (On Hold) vs stop it (Resolved/Closed).",
    "Major Incident requires a Promote → Propose → Accept gate.",
  ],

  furtherReading: [
    { label: "ServiceNow Docs — Incident Management", url: "https://www.servicenow.com/docs/bundle/yokohama-it-service-management/page/product/incident-management/concept/c_IncidentManagement.html" },
  ],
};

/* ============================================================== */
/* M3 — PROBLEM & KNOWLEDGE MANAGEMENT                             */
/* ============================================================== */
const m3: ModuleExplanation = {
  moduleSlug: "itsm-problem",
  tagline: "Find the root cause once; never solve the same incident twice.",
  overview:
    "Problem Management investigates the root cause of one or many incidents and produces a Known Error (with a Workaround) and ultimately a permanent fix. Knowledge Management captures what's been learned so the next person doesn't reinvent the answer. Together they shrink MTTR and ticket volume.",
  whyItMatters:
    "Incident closes tickets; Problem closes recurrence. The CIS-ITSM exam tests whether you can articulate the difference and configure the lifecycle correctly.",

  what: {
    heading: "What is a problem?",
    body:
      "A cause, or potential cause, of one or more incidents. A Known Error is a problem with a documented workaround. A Workaround restores service without fixing the root cause.",
  },
  why: {
    heading: "Why bother if incidents are resolved?",
    body:
      "Each repeating incident is a tax on operations. One problem record + Known Error + KB article can prevent dozens of future incidents and SLA breaches.",
  },
  who: {
    heading: "Who works problems?",
    body:
      "Problem coordinator triages and prioritises. Subject Matter Experts perform RCA. Knowledge author publishes the workaround as a KB article. Change manager owns the permanent fix via a Change.",
  },
  when: {
    heading: "When to open a problem?",
    body:
      "When a P1 just resolved, when an incident pattern repeats, when a proactive review identifies a brittle service, or when a vendor advisory predicts impact.",
  },
  where: {
    heading: "Where does it live?",
    body:
      "On the problem table (extends task). Knowledge articles live on kb_knowledge with article states (Draft, Review, Published, Retired) and a workflow.",
  },
  how: {
    heading: "How does RCA work?",
    body:
      "Use a structured technique — 5 Whys, Fishbone (Ishikawa), Pareto. ServiceNow doesn't enforce a method but provides RCA fields, related incidents and a structured Root Cause / Fix Notes section.",
  },

  conceptDeepDives: [
    {
      id: "problem-states",
      name: "Problem state model",
      oneLine: "New → Assess → Root Cause Analysis → Fix in Progress → Resolved → Closed.",
      formal: "A finite state machine on problem.state with mandatory fields gating each transition (e.g. Workaround required to leave Assess).",
      plainEnglish: "Each phase forces evidence — you can't move forward without filling in what you've learned.",
      analogy: "A scientific paper — hypothesis, experiment, results, conclusion.",
      howItWorks: "UI policies make Workaround/Root Cause mandatory at the right gates. Resolved sets resolution_code; Closed locks the record.",
      microsoftMapping: "Configurable via the Problem state Choice list and Process Flow formatter.",
      whenToUse: "Every problem should follow it; bypassing gates loses the audit trail.",
      commonMistake: "Closing problems directly from Assess — you lose RCA capture.",
      examAngle: "Know which fields are mandatory in which state.",
    },
    {
      id: "known-error",
      name: "Known Error & Workaround",
      oneLine: "A problem with documented root cause and an interim fix.",
      formal: "A Problem record where known_error = true, with workaround text populated. Surfaced to Service Desk via the Known Error related list on Incident.",
      plainEnglish: "We know what's broken AND a way to keep users productive while we work on the real fix.",
      analogy: "A patched tyre — you can drive on it while you wait for a new one.",
      howItWorks: "On Incident creation, agents see the Known Error list filtered by failing CI / category. Workaround is one click away.",
      microsoftMapping: "Knowledge integration shows the Workaround inline on the incident form.",
      whenToUse: "Anytime root cause is known but the permanent fix isn't yet deployed.",
      commonMistake: "Marking known_error = true without a workaround field — defeats the purpose.",
      examAngle: "'When does an incident agent see Known Errors?' — when matched to the failing CI or category.",
    },
    {
      id: "five-whys",
      name: "5 Whys RCA",
      oneLine: "Ask 'why?' five times to drill from symptom to systemic cause.",
      formal: "An iterative interrogative technique that follows the chain of causation past human error to a process or systemic flaw.",
      plainEnglish: "Don't stop at 'the disk filled up' — ask why the disk filled, why monitoring missed it, why monitoring wasn't tested, etc.",
      analogy: "Toddler interrogation — keep asking until the parent admits the real reason.",
      howItWorks: "Document each Why in the RCA section. The 5th Why typically reveals a process, not a person.",
      microsoftMapping: "Capture in problem.cause_notes or a custom 5 Whys related list.",
      whenToUse: "Most repeating incidents.",
      whenNotToUse: "Genuine novel events with no precedent — try Fishbone instead.",
      commonMistake: "Stopping at the first technical cause — you'll keep firefighting.",
      examAngle: "Recognise 5 Whys as a Problem-management RCA technique, not an Incident one.",
    },
    {
      id: "kcs",
      name: "Knowledge-Centered Service (KCS)",
      oneLine: "Capture knowledge while solving, not after.",
      formal: "A methodology where solving a ticket and writing/improving an article are the same task — articles are continuously refined.",
      plainEnglish: "Don't promise to write the KB later — write a draft as you solve, and the next person improves it.",
      analogy: "Wikipedia editing — small contributions accumulate into a great article.",
      howItWorks: "Article states: Draft → Review → Published → Retired. Each use logs Helpful/Not helpful to drive improvement.",
      microsoftMapping: "kb_knowledge table; KB workflow; flag/feedback related lists; Knowledge Demand/Gap analytics.",
      whenToUse: "Every resolved incident with a non-trivial answer should produce or improve an article.",
      commonMistake: "Treating KB authoring as a separate, deferred task — it never happens.",
      examAngle: "Know the article state model and who can move articles between states.",
    },
  ],

  comparisons: [
    {
      title: "Problem vs Known Error vs Workaround",
      columns: ["", "Problem", "Known Error", "Workaround"],
      rows: [
        ["Has a root cause yet?", "Maybe", "Yes", "Doesn't matter"],
        ["Has a permanent fix?", "Not yet", "Not yet", "No"],
        ["Visible to Service Desk?", "Internal", "Yes", "Yes"],
      ],
      bottomLine: "Problem = investigation. Known Error = investigation done. Workaround = how to keep users moving meanwhile.",
    },
  ],

  realExamples: [
    {
      title: "Repeating VPN drops",
      scenario: "Service Desk sees 12 VPN-related incidents per week.",
      outcome: "A Problem is opened, RCA points to MTU mismatch, Known Error + workaround (use mobile hotspot) is published, Change deploys the firewall fix.",
    },
  ],

  keyTerms: [
    { term: "RCA", definition: "Root Cause Analysis — the structured search for the underlying cause." },
    { term: "Pareto chart", definition: "An 80/20 chart that identifies the few causes producing most incidents." },
    { term: "Article feedback", definition: "User-submitted Helpful/Not Helpful + comments on a KB article." },
  ],

  commonPitfalls: [
    "Promoting every incident to a problem — drowns the team in noise.",
    "Closing a problem without a Known Error or KB article — knowledge is lost.",
    "Editing Published articles directly — bypasses the review workflow.",
  ],

  faqs: [
    { q: "Who can publish KB articles?", a: "Users with the kb_knowledge_manager role, after a Knowledge Author submits and a reviewer approves." },
    { q: "Can a Problem be opened without an Incident?", a: "Yes — proactive problem management opens problems from monitoring trends, vendor advisories or audits." },
  ],

  selfCheck: [
    {
      question: "What's the difference between a Workaround and a Permanent Fix?",
      options: [
        "Nothing — they're synonyms",
        "Workaround restores service without fixing root cause; Permanent Fix removes root cause via Change",
        "Workaround is documented, Permanent Fix isn't",
        "Workaround is for P1 only",
      ],
      correctIndex: 1,
      explanation: "Workaround = service restored interim. Permanent Fix = root cause removed, typically via a Change.",
    },
  ],

  examTips: [
    "Know the Problem state gates and what each requires.",
    "Known Error = problem + workaround surfaced to Incident.",
    "KB article workflow: Draft → Review → Published → Retired.",
  ],

  furtherReading: [
    { label: "ServiceNow Docs — Problem Management", url: "https://www.servicenow.com/docs/bundle/yokohama-it-service-management/page/product/problem-management/concept/c_ProblemManagement.html" },
    { label: "ServiceNow Docs — Knowledge Management", url: "https://www.servicenow.com/docs/bundle/yokohama-servicenow-platform/page/product/knowledge-management/concept/c_KnowledgeManagement.html" },
  ],
};

/* ============================================================== */
/* M4 — CHANGE & RELEASE MANAGEMENT                                */
/* ============================================================== */
const m4: ModuleExplanation = {
  moduleSlug: "itsm-change",
  tagline: "Modify the environment safely — every change is a controlled risk.",
  overview:
    "Change Management governs how modifications to services and CIs are proposed, assessed, approved and implemented. ServiceNow models this with three change types (Standard, Normal, Emergency), a CAB workbench, risk and impact assessments, conflict detection and a blackout schedule.",
  whyItMatters:
    "Most outages are caused by changes. Configuring change correctly is the single biggest reliability lever the platform offers, and the CIS-ITSM exam reflects that.",

  what: {
    heading: "What is a change?",
    body:
      "Any addition, modification or removal that could have an effect on services. Modelled as a change_request record extending task.",
  },
  why: {
    heading: "Why three types?",
    body:
      "Risk-appropriate friction. Routine, repeatable changes shouldn't go through the same gauntlet as a database failover.",
  },
  who: {
    heading: "Who's involved?",
    body:
      "Requester proposes; Change Coordinator checks completeness; CAB assesses risk; Change Manager approves; Implementer executes; CMDB Owner is consulted on affected CIs.",
  },
  when: {
    heading: "When does change run?",
    body:
      "Inside change windows; outside blackout windows. Standard changes can run anytime; Normals are scheduled; Emergencies bypass CAB but require post-implementation review.",
  },
  where: {
    heading: "Where do changes live?",
    body:
      "On change_request. Tasks, approvals, affected CIs and conflict checks all hang off the parent record.",
  },
  how: {
    heading: "How is risk assessed?",
    body:
      "Via the Risk Assessment Questionnaire (a configurable set of questions) plus the Risk Calculator. Higher score → more approvals required.",
  },

  conceptDeepDives: [
    {
      id: "change-types",
      name: "Standard / Normal / Emergency",
      oneLine: "Three risk profiles, three approval flows.",
      formal: "Standard = pre-approved, low-risk, repeatable, executed against a Change Model. Normal = full assessment + CAB. Emergency = bypass CAB for urgent changes, post-implementation review required.",
      plainEnglish: "Routine = paperwork-light, novel = full review, on fire = approve fast and ask questions later.",
      analogy: "Surgery: outpatient, scheduled, emergency.",
      howItWorks: "Type drives which flow runs (different approval definitions, different SLAs, different state model nuances).",
      microsoftMapping: "Standard Change Catalog (sn_chg_rest_api) lists pre-approved templates available to requesters.",
      whenToUse: "Standard for repeatable; Normal for default; Emergency only when delay would cause greater harm than the change risk.",
      commonMistake: "Marking everything Standard to skip CAB — defeats governance.",
      examAngle: "Recognise scenarios and pick the correct type.",
    },
    {
      id: "cab",
      name: "Change Advisory Board (CAB)",
      oneLine: "A meeting (or workbench) that reviews and decides on Normal changes.",
      formal: "A defined group of stakeholders that assesses, prioritises, schedules and authorises change proposals.",
      plainEnglish: "The grown-ups in the room ask 'what could possibly go wrong?' before you press Go.",
      analogy: "A planning permission committee for IT.",
      howItWorks: "Approvals (sysapproval_approver) are auto-generated based on Approval Policy (e.g. CI's support group manager + Change Manager). CAB Workbench provides a meeting view.",
      microsoftMapping: "CAB Workbench module; meeting agenda and minutes records; integration with calendar systems.",
      whenToUse: "Every Normal change.",
      whenNotToUse: "Standard changes (already pre-approved); true emergencies (use ECAB).",
      commonMistake: "Configuring 'all changes' to require CAB — drowns the board.",
      examAngle: "Know what triggers CAB vs ECAB vs no CAB.",
    },
    {
      id: "risk-impact",
      name: "Risk & Impact",
      oneLine: "Risk = chance of failure. Impact = blast radius.",
      formal: "Both are computed from the Risk Assessment Questionnaire and CI relationships, with the Risk Conditions table mapping answers to scores.",
      plainEnglish: "How likely will this break (risk) and how loud will it be if it does (impact).",
      analogy: "Risk = chance of car crash; Impact = how many people in the car.",
      howItWorks: "Answers populate risk_assessment_score; Impact aggregates affected CIs by criticality.",
      microsoftMapping: "Risk Assessment Questionnaire (sn_change_risk_assessment); Impact via affected_ci related list and CMDB criticality.",
      whenToUse: "Always — they drive approval routing.",
      commonMistake: "Treating high risk as automatically high impact (or vice-versa).",
      examAngle: "Know the difference and that they're independently calculated.",
    },
    {
      id: "conflict",
      name: "Conflict detection & change schedule",
      oneLine: "The platform spots overlapping changes on the same CIs and blackout collisions.",
      formal: "A scheduled job and on-demand action evaluates change_request planned_start/end against Maintenance Schedules, Blackout windows, and other changes affecting the same CI.",
      plainEnglish: "If two teams both reboot the same server on Saturday night, the platform tells you.",
      analogy: "A meeting room booking system that highlights double-bookings.",
      howItWorks: "Conflicts surface on the Change Schedule and on the change form's Conflict tab. Blackouts are CMDB-CI-aware.",
      microsoftMapping: "Change Schedule module; Maintenance Schedules; cmn_blackout_window.",
      whenToUse: "Run before submitting; rerun before implementation.",
      commonMistake: "Ignoring blackout windows and rescheduling on the morning of go-live.",
      examAngle: "Know that Conflict Detection runs both scheduled and on-demand.",
    },
    {
      id: "release",
      name: "Release vs Change vs Deployment",
      oneLine: "Release = bundle of changes; Change = the authorised modification; Deployment = the act of putting code/config live.",
      formal: "A Release groups related Changes (often by application or sprint) and tracks their journey through environments. Deployment is the technical execution step inside a Change Task.",
      plainEnglish: "Release = the train. Change = a carriage. Deployment = the wheels turning.",
      analogy: "A retail product launch — multiple work streams (carriages) bundled into one launch event (release).",
      howItWorks: "Release records (rm_release) link to multiple Change records; promotion tasks track environment progression.",
      microsoftMapping: "Release Management plugin (rm_release, rm_release_phase); integrates with DevOps Change Velocity.",
      whenToUse: "When multiple Changes must coordinate (e.g. one quarterly release).",
      commonMistake: "Confusing Release Management with Software Asset Management — different domains.",
      examAngle: "Be able to distinguish the three concepts in scenario questions.",
    },
  ],

  comparisons: [
    {
      title: "Standard vs Normal vs Emergency",
      columns: ["Aspect", "Standard", "Normal", "Emergency"],
      rows: [
        ["Pre-approval", "Yes (template)", "No", "No (post-review)"],
        ["CAB required", "No", "Yes", "ECAB only"],
        ["Risk profile", "Low", "Medium/High", "Medium/High but urgent"],
        ["Example", "Add user to AD group", "Database upgrade", "Restore prod after outage"],
      ],
      bottomLine: "Pick the type that matches risk and urgency — never use Emergency to dodge CAB.",
    },
  ],

  realExamples: [
    {
      title: "Patch Tuesday",
      scenario: "Monthly OS patches across 800 servers.",
      outcome: "Standard Change template used; auto-scheduled inside maintenance window; conflict detection shows no clash with the CRM upgrade Normal Change.",
    },
  ],

  keyTerms: [
    { term: "Change Model", definition: "A reusable template defining the lifecycle and approvals for a change type." },
    { term: "Approval policy", definition: "A rule that decides which approvers are required based on change attributes." },
    { term: "Blackout window", definition: "A time range during which changes to specified CIs are forbidden." },
    { term: "ECAB", definition: "Emergency Change Advisory Board — small subset of CAB authorised to approve emergencies fast." },
  ],

  commonPitfalls: [
    "Misusing Emergency to bypass CAB.",
    "Standard catalog with too many templates that no longer match the live environment.",
    "Not running conflict detection before implementation.",
  ],

  faqs: [
    { q: "Can a Standard change be rejected?", a: "Procedurally no — but the Change Coordinator can refuse to schedule it if the template no longer matches reality." },
    { q: "What's the difference between a Change and a Change Task?", a: "Change is the authorisation; Change Task is the unit of work performed by a fulfiller during implementation." },
  ],

  selfCheck: [
    {
      question: "Which change type bypasses CAB but requires a post-implementation review?",
      options: ["Standard", "Normal", "Emergency", "Routine"],
      correctIndex: 2,
      explanation: "Emergency changes skip CAB to act fast but require a Post-Implementation Review (PIR) for governance.",
    },
  ],

  examTips: [
    "Know what triggers CAB vs ECAB vs no CAB.",
    "Conflict detection considers both other changes AND blackout windows.",
    "Standard changes are pre-approved against a Change Model template.",
  ],

  furtherReading: [
    { label: "ServiceNow Docs — Change Management", url: "https://www.servicenow.com/docs/bundle/yokohama-it-service-management/page/product/change-management/concept/c_ITILChangeManagement.html" },
  ],
};

/* ============================================================== */
/* M5 — REQUEST FULFILMENT, CMDB & SERVICE CATALOG                  */
/* ============================================================== */
const m5: ModuleExplanation = {
  moduleSlug: "itsm-catalog-cmdb",
  tagline: "Self-service for users, single source of truth for the platform.",
  overview:
    "Service Catalog turns IT into a self-service shop. Each Catalog Item generates a Request (REQ), one or more Requested Items (RITM), and Catalog Tasks (SCTASK) for fulfillers. CMDB underpins everything by recording Configuration Items (CIs) and their relationships, framed by the Common Service Data Model (CSDM).",
  whyItMatters:
    "Catalog deflects ticket volume; CMDB powers impact analysis, automation and reporting. The CIS-ITSM exam tests both heavily because they're the foundation of every other practice.",

  what: {
    heading: "What is the Service Catalog?",
    body:
      "A user-facing storefront of IT services and goods. Items are organised by category, gathered into Cart, ordered as Requests, and fulfilled via tasks driven by Flow Designer.",
  },
  why: {
    heading: "Why a CMDB?",
    body:
      "Without a CI inventory you can't do impact analysis, automated discovery, change conflict detection or accurate reporting. CMDB is the connective tissue of ITSM.",
  },
  who: {
    heading: "Who owns what?",
    body:
      "Catalog Manager owns items and variables; Catalog Item Designer creates them in the low-code Catalog Builder; CMDB Steward owns data quality; Service Owner owns the business service end-to-end.",
  },
  when: {
    heading: "When do they get used?",
    body:
      "Catalog every time a user wants something repeatable. CMDB every time something needs to be related to a CI — incidents, problems, changes, requests.",
  },
  where: {
    heading: "Where do records live?",
    body:
      "Catalog: sc_cat_item, sc_request (REQ), sc_req_item (RITM), sc_task (SCTASK). CMDB: cmdb_ci and ~600 child classes; relationships on cmdb_rel_ci.",
  },
  how: {
    heading: "How are CIs organised?",
    body:
      "Through the CMDB class hierarchy and the CSDM (Common Service Data Model) — a 4-domain framework (Foundation → Design → Build → Manage) that says where each CI type belongs.",
  },

  conceptDeepDives: [
    {
      id: "request-flow",
      name: "REQ → RITM → SCTASK",
      oneLine: "One order, many items, many tasks.",
      formal: "A Request (sc_request) is the order header. Each Requested Item (sc_req_item) is a single Catalog Item ordered. Each generates one or more Catalog Tasks (sc_task) executed by fulfillers.",
      plainEnglish: "Like Amazon: one checkout (REQ) can contain multiple products (RITMs); each product triggers warehouse picks (tasks).",
      analogy: "Restaurant order — one bill, many dishes, each dish has prep tasks in the kitchen.",
      howItWorks: "Order → Flow Designer flow runs per RITM → tasks generated → fulfillers complete tasks → RITM moves to Closed Complete → REQ closes when all RITMs done.",
      microsoftMapping: "Catalog UI (Service Portal / Now Mobile / Employee Center) → sc_request → Flow Designer → sc_task assignment.",
      whenToUse: "Every repeatable user-facing offering.",
      commonMistake: "Closing the REQ without checking RITMs are all closed — leaves orphan tasks.",
      examAngle: "Be precise: REQ is the header, RITM is the line item, SCTASK is the work.",
    },
    {
      id: "variables",
      name: "Variables & variable sets",
      oneLine: "Form fields shown to the requester at order time.",
      formal: "Variables are dynamic form elements attached to a Catalog Item; Variable Sets are reusable bundles (e.g. 'requestor info').",
      plainEnglish: "The form a user fills in to order — text boxes, checkboxes, reference pickers.",
      analogy: "Configuring a laptop on Apple's website — the variables are 'colour', 'RAM', 'engraving'.",
      howItWorks: "Variables persist on the RITM as JSON; available to Flow Designer steps for branching and task content.",
      microsoftMapping: "Variable types include Single line text, Reference, Multiple choice, Container, Macro.",
      whenToUse: "Use Variable Sets for any field group used across multiple items.",
      commonMistake: "Recreating the same variables on every item — should be a Variable Set.",
      examAngle: "Know which variable types exist and that Variable Sets are reusable.",
    },
    {
      id: "cmdb-class",
      name: "CMDB class hierarchy",
      oneLine: "CIs extend cmdb_ci through ~600 specialised child tables.",
      formal: "An object-inheritance tree; each child class adds attributes specific to its CI type (e.g. cmdb_ci_server adds CPU, RAM; cmdb_ci_database adds DB type).",
      plainEnglish: "All CIs share basic attributes; specific types add their own.",
      analogy: "Animal taxonomy — vertebrate is the parent class, mammal extends it, dog extends mammal.",
      howItWorks: "Discovery and Service Mapping populate the right class automatically. Manual CIs should also be classified specifically (avoid generic cmdb_ci).",
      microsoftMapping: "Class Manager UI; CI Lifecycle workflow; Identification & Reconciliation Engine (IRE) prevents duplicates.",
      whenToUse: "Always classify to the most specific available class.",
      commonMistake: "Putting everything on cmdb_ci — breaks reporting and Service Mapping.",
      examAngle: "Recognise common classes (server, database, application, network, business_service).",
    },
    {
      id: "csdm",
      name: "CSDM (Common Service Data Model)",
      oneLine: "A reference model that says where each CI type belongs and how services relate.",
      formal: "A four-domain framework (Foundation, Design, Build, Manage / Operate) defining the canonical relationships between Business Application, Application Service, Service Offering, Business Service, etc.",
      plainEnglish: "ServiceNow's opinion on the right way to model your service portfolio.",
      analogy: "An IKEA assembly diagram for your CMDB — follow it and the pieces fit.",
      howItWorks: "Map your existing CIs into CSDM domains; align reporting and dashboards to CSDM relationships.",
      microsoftMapping: "Drives Service Mapping, Service Owner ownership, Subscription Management and AIOps.",
      whenToUse: "Any new CMDB rollout from Tokyo onwards.",
      commonMistake: "Building bespoke service hierarchies that diverge from CSDM — pain at every upgrade.",
      examAngle: "Know the four CSDM domains and core entities.",
    },
    {
      id: "discovery",
      name: "Discovery & Service Mapping",
      oneLine: "Discovery finds CIs; Service Mapping maps them into business services.",
      formal: "Discovery uses Probes & Sensors and the MID Server to populate cmdb_ci classes. Service Mapping uses traffic-based or pattern-based mapping to build top-down maps from a business service entry point.",
      plainEnglish: "Discovery answers 'what do we have?'. Service Mapping answers 'how do they connect to deliver service X?'.",
      analogy: "Discovery = census. Service Mapping = transport map.",
      howItWorks: "Discovery schedules → MID Server probes → IRE reconciles → CMDB updated. Service Mapping uses business service entry points to crawl dependencies.",
      microsoftMapping: "Discovery and Service Mapping plugins; MID Server installed inside customer infrastructure.",
      whenToUse: "Any environment with more than ~50 CIs.",
      commonMistake: "Running Discovery without IRE rules tuned — duplicate CIs everywhere.",
      examAngle: "Distinguish Discovery (bottom-up inventory) from Service Mapping (top-down service maps).",
    },
  ],

  comparisons: [
    {
      title: "REQ vs RITM vs SCTASK",
      columns: ["", "REQ", "RITM", "SCTASK"],
      rows: [
        ["Table", "sc_request", "sc_req_item", "sc_task"],
        ["Granularity", "Order header", "One catalog item", "One unit of work"],
        ["Closed when…", "All RITMs complete", "All SCTASKs complete", "Fulfiller marks complete"],
      ],
      bottomLine: "Header → Items → Tasks. Always.",
    },
  ],

  realExamples: [
    {
      title: "Laptop request",
      scenario: "New hire requests a MacBook + monitor + headset.",
      outcome: "1 REQ → 3 RITMs → SCTASKs for procurement, asset tagging, IT setup. Closes only when every task does.",
    },
  ],

  keyTerms: [
    { term: "CI", definition: "Configuration Item — anything tracked in the CMDB.", example: "A server, an app, a router" },
    { term: "Catalog Item", definition: "A single offering in the Service Catalog.", example: "Request a new laptop" },
    { term: "Variable Set", definition: "Reusable bundle of variables that can be attached to multiple Catalog Items." },
    { term: "MTTR / FCR / Change success rate", definition: "Core ITSM KPIs surfaced via Performance Analytics." },
  ],

  commonPitfalls: [
    "Catalog Items with too many freeform variables → bad data on RITMs.",
    "Generic cmdb_ci records that should be classified as cmdb_ci_server / database / etc.",
    "Skipping CSDM and inventing a custom model — every upgrade hurts.",
    "Closing REQ manually instead of letting the flow close it when RITMs complete.",
  ],

  faqs: [
    { q: "Can a single RITM have multiple SCTASKs?", a: "Yes — a flow can branch and create as many tasks as needed (e.g. procurement + asset + delivery)." },
    { q: "Should I use Catalog Builder or Workflow Editor?", a: "Use Catalog Builder + Flow Designer. Workflow Editor is legacy and being deprecated." },
    { q: "What's the difference between Business Service and Application Service in CSDM?", a: "Business Service = customer-facing offering (Email). Application Service = a deployed instance of a Business Application supporting it (Exchange Online prod)." },
  ],

  selfCheck: [
    {
      question: "A user orders three items in one Service Portal checkout. How many REQ records are created?",
      options: ["3", "1", "0 — the cart is the record", "1 per item"],
      correctIndex: 1,
      explanation: "One REQ (the order header) with 3 RITMs (the line items). Each RITM may spawn one or more SCTASKs.",
    },
    {
      question: "Which framework defines the canonical relationship between Business Application, Application Service and Business Service?",
      options: ["ITIL 4 SVS", "CMDB", "CSDM", "ServiceNow Now Platform"],
      correctIndex: 2,
      explanation: "CSDM (Common Service Data Model) defines the canonical service hierarchy across the four CMDB domains.",
    },
  ],

  examTips: [
    "REQ → RITM → SCTASK — burn it in.",
    "CSDM has four domains: Foundation, Design, Build, Manage.",
    "Variable Sets are reusable; lone variables are not.",
  ],

  furtherReading: [
    { label: "ServiceNow Docs — Service Catalog", url: "https://www.servicenow.com/docs/bundle/yokohama-it-service-management/page/product/service-catalog-management/concept/c_ServiceCatalogManagement.html" },
    { label: "ServiceNow Docs — CSDM", url: "https://www.servicenow.com/docs/bundle/yokohama-it-service-management/page/product/configuration-management/concept/csdm-overview.html" },
  ],
};

export const itsmModuleExplanations: ModuleExplanation[] = [m1, m2, m3, m4, m5];

export function getItsmModuleExplanation(slug: string): ModuleExplanation | undefined {
  return itsmModuleExplanations.find((m) => m.moduleSlug === slug);
}
