// Google Cloud Digital Leader (CDL) — full curriculum mapped to the official
// exam guide (6 sections). Mirrors the K8s/CSA shape so all course-aware UI
// works unchanged.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const cdlModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "cdl-digital-transformation",
    domain: "concepts",
    title: "Module 1 — Digital Transformation with Google Cloud",
    code: "CDL-M1",
    theoryMinutes: 70,
    labBudgetMinutes: 50,
    topics: [
      "Cloud, cloud-native, open source / open standard, digital transformation",
      "On-prem vs public, private, hybrid and multicloud — when each wins",
      "Business benefits: scalable, flexible, agile, secure, cost-effective",
      "Google Cloud transformation pillars: intelligence, freedom, collaboration, trust, sustainability",
      "IaaS, PaaS, SaaS — TCO, staffing and shared responsibility model",
    ],
    labSlugs: [
      "cdl-console-tour",
      "cdl-shared-responsibility-mapping",
    ],
  },
  {
    moduleSlug: "cdl-data-transformation",
    domain: "iam",
    title: "Module 2 — Exploring Data Transformation with Google Cloud",
    code: "CDL-M2",
    theoryMinutes: 65,
    labBudgetMinutes: 55,
    topics: [
      "Data, databases, data warehouses, data lakes — what each is for",
      "Structured vs unstructured data, SQL vs NoSQL, relational vs object",
      "Cloud Storage classes — Standard, Nearline, Coldline, Archive",
      "Cloud SQL, Cloud Spanner, Bigtable, Firestore, BigQuery — pick the right tool",
      "Looker, Pub/Sub and Dataflow — analytics and streaming pipelines",
    ],
    labSlugs: [
      "cdl-bigquery-public-dataset",
      "cdl-storage-class-picker",
    ],
  },
  {
    moduleSlug: "cdl-ai-ml",
    domain: "entra",
    title: "Module 3 — Innovating with Google Cloud AI",
    code: "CDL-M3",
    theoryMinutes: 65,
    labBudgetMinutes: 55,
    topics: [
      "AI vs ML vs analytics — what ML actually solves",
      "Why high-quality data and explainable / responsible AI matter",
      "Google Cloud AI ladder: pre-trained APIs → AutoML → Vertex AI custom",
      "Pre-trained APIs: Vision, Natural Language, Translation, Speech-to-Text, Text-to-Speech",
      "BigQuery ML, Vertex AI, TensorFlow and Cloud TPU at a glance",
    ],
    labSlugs: [
      "cdl-vision-api-tour",
      "cdl-bqml-prediction",
    ],
  },
  {
    moduleSlug: "cdl-modernize-infra",
    domain: "security",
    title: "Module 4 — Modernize Infrastructure & Applications",
    code: "CDL-M4",
    theoryMinutes: 70,
    labBudgetMinutes: 60,
    topics: [
      "Migration vocabulary: rehost / replatform / refactor / reimagine / retire / retain",
      "Compute Engine VMs, autoscaling and load balancing — when to rehost",
      "Serverless: Cloud Run, App Engine, Cloud Functions — benefits and tradeoffs",
      "Containers, Kubernetes, microservices and Google Kubernetes Engine (GKE)",
      "APIs and Apigee; hybrid / multicloud with GKE Enterprise",
    ],
    labSlugs: [
      "cdl-compute-vs-cloudrun",
      "cdl-gke-cluster-tour",
    ],
  },
  {
    moduleSlug: "cdl-trust-security",
    domain: "compliance",
    title: "Module 5 — Trust & Security with Google Cloud",
    code: "CDL-M5",
    theoryMinutes: 60,
    labBudgetMinutes: 50,
    topics: [
      "Top cloud cybersecurity threats and the cloud shared responsibility model",
      "Google's defense-in-depth: data centers, custom hardware, encryption everywhere",
      "Authentication, authorization, auditing, IAM and 2-Step Verification (2SV)",
      "Cloud Armor, DDoS protection and Security Operations (SecOps)",
      "Trust principles, transparency reports, data residency and Compliance Reports Manager",
    ],
    labSlugs: [
      "cdl-iam-roles-tour",
      "cdl-cloud-armor-walkthrough",
    ],
  },
  {
    moduleSlug: "cdl-scaling-operations",
    domain: "exam",
    title: "Module 6 — Scaling with Google Cloud Operations",
    code: "CDL-M6",
    theoryMinutes: 70,
    labBudgetMinutes: 60,
    topics: [
      "Financial governance: resource hierarchy, quotas, budgets, Billing Reports",
      "CapEx → OpEx, TCO modelling and predictability for cloud spend",
      "Reliability, fault tolerance, disaster recovery, DevOps and SRE basics",
      "Google Cloud Customer Care tiers and life of a support case",
      "Sustainability: Google Cloud's net-zero commitments and carbon-aware workloads",
    ],
    labSlugs: [
      "cdl-billing-budget-setup",
      "cdl-resource-hierarchy",
    ],
  },
];

const m = (slug: string) => cdlModuleNotes.find((x) => x.moduleSlug === slug)!;

/* ---------- 5-day plan (~2h / day cadence) — recommended ----------
 * Day totals are tuned to fit the 2h session format. Modules 5 & 6 are
 * split across two separate days (so this is actually a 6-slot plan
 * presented as the "2h cadence" — each slot ≈ 2h, easier to schedule
 * across a working week). */
export const cdlFiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Digital Transformation foundations (≈ 2h)",
    description:
      "What 'cloud' actually means, on-prem vs cloud, IaaS / PaaS / SaaS, and Google Cloud's transformation story.",
    modules: [m("cdl-digital-transformation")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Data transformation with Google Cloud (≈ 2h)",
    description:
      "Pick the right database / warehouse / lake, master Cloud Storage classes and meet BigQuery, Looker and Dataflow.",
    modules: [m("cdl-data-transformation")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "AI & ML on Google Cloud (≈ 2h)",
    description:
      "Where AI/ML creates business value, the Google Cloud AI ladder, pre-trained APIs and Vertex AI for custom models.",
    modules: [m("cdl-ai-ml")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Modernize infrastructure & apps (≈ 2h 10m)",
    description:
      "Migration paths, Compute Engine, serverless (Cloud Run, App Engine, Functions), containers, GKE, Apigee and hybrid/multicloud.",
    modules: [m("cdl-modernize-infra")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Trust & Security with Google Cloud (≈ 1h 50m)",
    description:
      "Google's defense-in-depth, IAM, Cloud Armor, DDoS protection and the cloud shared responsibility model.",
    modules: [m("cdl-trust-security")],
  },
  {
    id: "day6",
    label: "Day 6",
    subtitle: "Scaling with Google Cloud Operations (≈ 2h 10m)",
    description:
      "Financial governance, reliability & SRE basics, Customer Care tiers, sustainability and exam wrap.",
    modules: [m("cdl-scaling-operations")],
  },
];

/* ---------- 2-day intensive (≈ 4h / day) ---------- */
export const cdlTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Transformation & Data (≈ 4h)",
    description:
      "Modules 1-2: cloud and digital transformation foundations, then data & analytics on Google Cloud.",
    modules: [
      m("cdl-digital-transformation"),
      m("cdl-data-transformation"),
    ],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "AI, Modernization, Trust & Operations (≈ 8h — extended day)",
    description:
      "Modules 3-6: AI/ML, infrastructure modernization, security & trust, financial governance & sustainability. Run as a long second day or split into two evenings.",
    modules: [
      m("cdl-ai-ml"),
      m("cdl-modernize-infra"),
      m("cdl-trust-security"),
      m("cdl-scaling-operations"),
    ],
  },
];

/* ---------- 1-day bootcamp (≈ 8h with breaks — full curriculum is ~12h, condensed) ---------- */
export const cdlOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full Cloud Digital Leader bootcamp (condensed 8h)",
    description:
      "All six exam sections in a single intensive day. Lab time is trimmed to fit ~8h — book the 5-day cadence for full hands-on coverage.",
    modules: cdlModuleNotes,
  },
];

/* ---------- 1-hour Google Cloud tool tour ---------- */
const cdlToolTourModule: ModuleNote = {
  moduleSlug: "cdl-tool-tour",
  domain: "concepts",
  title: "Google Cloud tool tour — 5 essentials in 60 minutes",
  code: "CDL-T1",
  theoryMinutes: 10,
  labBudgetMinutes: 50,
  topics: [
    "1. Cloud Console — projects, navigation and the resource hierarchy",
    "2. Cloud Storage — buckets and the four storage classes",
    "3. BigQuery — run a SQL query against a public dataset",
    "4. Compute Engine vs Cloud Run — when to pick which",
    "5. IAM — grant a role and read the audit log",
  ],
  labSlugs: [
    "cdl-console-tour",
    "cdl-storage-class-picker",
    "cdl-bigquery-public-dataset",
    "cdl-compute-vs-cloudrun",
    "cdl-iam-roles-tour",
  ],
};

export const cdlOneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Session",
    subtitle: "Google Cloud tool tour — 5 essentials in 1h",
    description:
      "Hands-on 60-minute walkthrough of the five things every Cloud Digital Leader candidate should be able to point to: the Console, Cloud Storage, BigQuery, Cloud Run vs Compute Engine, and IAM.",
    modules: [cdlToolTourModule],
  },
];
