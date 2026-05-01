// Cloud Digital Leader (CDL) — full module explanations.
// One ModuleExplanation per slug declared in src/lib/curriculumCdl.ts.

import type { ModuleExplanation } from "./moduleExplanations";

/* ------------------------------------------------------------------ */
/* 0. Tool tour                                                        */
/* ------------------------------------------------------------------ */
const toolTour: ModuleExplanation = {
  moduleSlug: "cdl-tool-tour",
  tagline: "Touch the five Google Cloud surfaces every CDL candidate must recognize — in 60 minutes.",
  overview:
    "A 60-minute hands-on tour through Google Cloud's five most-discussed surfaces: the Cloud Console, Cloud Storage, BigQuery, Cloud Run / Compute Engine, and IAM. By the end you'll know which icon to click, which product to recommend, and how Google Cloud charges you for it.",
  whyItMatters:
    "The CDL exam is scenario-driven. Picking the right product on the first try is the entire skill. This tour gives you the muscle memory.",
  what: {
    heading: "What is the tool tour?",
    body:
      "Five 10-minute stops in the simulated Google Cloud Console. Each stop has one objective and one screenshot worth artifact.",
    bullets: [
      "Cloud Console — projects, IAM and the navigation menu.",
      "Cloud Storage — create a bucket and pick a storage class.",
      "BigQuery — run a SQL query against a public dataset.",
      "Compute Engine vs Cloud Run — when to rehost, when to go serverless.",
      "IAM — grant a role and read the audit log.",
    ],
  },
  why: {
    heading: "Why start with a tour?",
    body:
      "CDL is about confident product recommendations to a business. Touching each surface once removes the abstract feel and makes the names stick.",
  },
  who: {
    heading: "Who runs these tasks?",
    body:
      "Cloud champions, project managers, sales engineers, fresh cloud hires and anyone preparing for the CDL exam.",
  },
  when: {
    heading: "When do you use this tour?",
    body: "Day one of CDL prep, before any deeper module. Also a perfect 60-minute warm-up before a CDL exam booking.",
  },
  where: {
    heading: "Where does this happen?",
    body:
      "In the simulated Google Cloud Console inside the lab — same look-and-feel as console.cloud.google.com, no billing required.",
  },
  how: {
    heading: "How is the hour structured?",
    body:
      "Five 10-minute stops + a 10-minute wrap. Each stop produces one artefact (a bucket, a query result, a Service URL, an IAM grant) you can show in your portfolio.",
    bullets: [
      "0–10m — Tour the Console: Project picker, hamburger menu, Cloud Shell.",
      "10–20m — Cloud Storage: create bucket, pick Standard / Nearline / Coldline / Archive.",
      "20–30m — BigQuery: SELECT against bigquery-public-data.",
      "30–45m — Compute Engine vs Cloud Run: rehost vs serverless tradeoffs.",
      "45–55m — IAM: grant Viewer role, view audit log.",
      "55–60m — Wrap-up: which product solves which business problem?",
    ],
  },
  conceptDeepDives: [
    {
      id: "console",
      name: "Cloud Console",
      oneLine: "The web UI for managing every Google Cloud resource and project.",
      formal:
        "console.cloud.google.com is Google Cloud's primary management surface — a project-scoped web app that wraps the underlying REST APIs for every product.",
      plainEnglish: "It's the Google Cloud dashboard. Pick a project, click a service, manage resources.",
      analogy: "Like a hotel front desk — every guest interaction (booking a room, asking for towels, paying the bill) goes through the same desk.",
      howItWorks:
        "Every action in the Console is a call to a Google Cloud API. The same calls can be made via gcloud CLI, Terraform or client libraries.",
      microsoftMapping: "Equivalent to the Azure Portal or AWS Management Console.",
      whenToUse: "Anytime you want to learn, configure, or one-off-fix something. Use IaC (Terraform / Deployment Manager) for repeatable production work.",
      commonMistake: "Doing production changes in the Console with no audit trail — always prefer IaC for repeatability.",
      examAngle: "Know that the Console is one of three management surfaces (Console, gcloud CLI, REST/RPC APIs).",
    },
    {
      id: "project",
      name: "Project",
      oneLine: "The base container for any Google Cloud resource — billing, IAM and quotas all attach here.",
      formal:
        "A Google Cloud project is the unit of resource ownership; every resource belongs to exactly one project, and IAM policies, billing accounts and APIs are scoped to it.",
      plainEnglish: "Think of a project like a folder that holds all the cloud stuff for one app or team.",
      analogy: "A project is to Google Cloud what a tenant is to an apartment building — your stuff, your bill, your keys.",
      howItWorks:
        "Projects sit inside the resource hierarchy (Org → Folder → Project → Resource) and inherit IAM and policies from their parents.",
      microsoftMapping: "Closest to an Azure subscription or an AWS account.",
      whenToUse: "Always — every resource needs one. Use one project per environment (dev / stage / prod) for isolation and cost tracking.",
      commonMistake: "Mixing prod and dev workloads in one project; IAM blast radius and billing confusion follow.",
      examAngle: "Know the resource hierarchy in order: Organization → Folder → Project → Resource.",
    },
    {
      id: "iam",
      name: "IAM (Identity & Access Management)",
      oneLine: "Who (identity) can do what (role) on which (resource).",
      formal:
        "Cloud IAM grants principals (users, groups, service accounts) roles (collections of permissions) on resources, evaluated through a policy attached to the resource or inherited from a parent.",
      plainEnglish: "IAM is the bouncer: who you are, what you can do, and where.",
      analogy: "IAM is a building access card — your identity unlocks specific floors (resources) only when your card has the right colour (role).",
      howItWorks:
        "When a request hits a Google Cloud API, IAM evaluates the policy on the target resource (and its ancestors) to allow or deny the action.",
      microsoftMapping: "Same idea as Azure RBAC or AWS IAM — different naming.",
      whenToUse: "Always — never share credentials. Grant least privilege via predefined roles or custom roles.",
      whenNotToUse: "Don't grant Owner/Editor at the project level for daily work — use granular predefined roles.",
      commonMistake: "Granting roles to individual users rather than groups — unmanageable at scale.",
      examAngle: "Know predefined vs basic vs custom roles, and that policies are inherited down the resource hierarchy.",
    },
    {
      id: "bigquery",
      name: "BigQuery",
      oneLine: "Serverless, petabyte-scale data warehouse with built-in SQL and ML.",
      formal:
        "BigQuery is a fully-managed analytical data warehouse offering SQL-based querying, columnar storage, automatic scaling, and built-in ML (BigQuery ML).",
      plainEnglish: "Drop your CSVs in, write SQL, get answers in seconds — even on petabytes.",
      analogy: "BigQuery is to data what Google Search is to the web — type a query, get an answer, no infrastructure thinking.",
      howItWorks:
        "Queries are decomposed across thousands of slots (workers); storage is columnar and decoupled from compute, so you pay separately for each.",
      microsoftMapping: "Closest to Azure Synapse Analytics or Snowflake.",
      whenToUse: "Analytics, dashboards, ad-hoc reporting, ML on structured data, multicloud queries via BigQuery Omni.",
      whenNotToUse: "Not for transactional / OLTP workloads — use Cloud SQL, Spanner or Firestore.",
      commonMistake: "Using SELECT * on huge tables — BigQuery charges by bytes scanned.",
      examAngle: "Expect BigQuery to be the right answer for serverless data warehouse + analytics scenarios.",
    },
    {
      id: "cloudrun",
      name: "Cloud Run",
      oneLine: "Serverless container platform — deploy a container, get a URL, pay per request.",
      formal:
        "Cloud Run runs stateless containers in a fully managed environment, scaling from zero to N based on traffic, billing only for the time your container handles requests.",
      plainEnglish: "Push a container, get an HTTPS URL, pay nothing when nobody is using it.",
      analogy: "Cloud Run is to containers what Lambda is to functions — bring your code, forget the servers.",
      howItWorks:
        "Cloud Run schedules your container on an autoscaled fleet behind a global load balancer; instances scale up on incoming requests and to zero when idle.",
      microsoftMapping: "Closest to Azure Container Apps or AWS App Runner.",
      whenToUse: "HTTP APIs, web apps, microservices, async workers — anything stateless that fits in a container.",
      whenNotToUse: "Not for stateful workloads (use GKE / Compute Engine) or for jobs needing GPUs not supported by Cloud Run.",
      commonMistake: "Storing user state in container memory — instances are ephemeral and can be killed at any time.",
      examAngle: "Cloud Run = serverless containers. Cloud Functions = serverless functions. App Engine = serverless apps. Know the differences.",
    },
  ],
  comparisons: [
    {
      title: "Compute Engine vs Cloud Run vs Cloud Functions vs App Engine",
      columns: ["Criterion", "Compute Engine", "Cloud Run", "Cloud Functions", "App Engine"],
      rows: [
        ["Unit of deployment", "VM", "Container", "Function", "App"],
        ["Scales to zero", "❌", "✅", "✅", "✅ (Standard)"],
        ["You manage OS", "✅", "❌", "❌", "❌"],
        ["Use case", "Lift-and-shift legacy", "Stateless containers / APIs", "Event-driven snippets", "Web apps in supported runtimes"],
      ],
      bottomLine: "Pick the highest level of abstraction that runs your workload — only drop down for control or compatibility.",
    },
  ],
  realExamples: [
    {
      title: "From idea to live API in 5 minutes",
      scenario: "You containerize a small Python API, push it to Artifact Registry, and gcloud run deploy.",
      outcome: "Cloud Run gives you a global HTTPS URL. Idle = $0. 1M requests / month ≈ a coffee.",
    },
  ],
  keyTerms: [
    { term: "Project", definition: "Container for resources, billing and IAM in Google Cloud.", example: "shadowx-cdl-prod" },
    { term: "Region / Zone", definition: "Geographic location (region) split into isolated failure domains (zones).", example: "us-central1 with zones a/b/c" },
    { term: "Bucket", definition: "Top-level container for objects in Cloud Storage.", example: "gs://shadowx-cdl-archive" },
    { term: "Quota", definition: "Cap on how much of a resource a project can consume.", example: "100 VMs per region" },
    { term: "Audit log", definition: "Immutable record of who did what when, surfaced via Cloud Logging.", example: "Admin Activity logs are on by default" },
  ],
  commonPitfalls: [
    "Confusing Cloud Run (containers) with Cloud Functions (snippets) and App Engine (apps).",
    "Forgetting that BigQuery storage and compute are billed separately.",
    "Granting basic Owner / Editor roles instead of predefined granular roles.",
    "Mixing prod and non-prod resources in a single project.",
  ],
  faqs: [
    { q: "Do I need a credit card to follow the tour?", a: "No — the labs run inside the simulator. The free tier is fine if you want to follow along on a real account." },
    { q: "Is the CDL exam hands-on?", a: "No — CDL is a 90-minute multiple-choice exam focused on business scenarios and product mapping." },
    { q: "Where do I book the exam?", a: "On cloud.google.com/certification/cloud-digital-leader. It's $99 USD and proctored online." },
  ],
  selfCheck: [
    {
      question: "Which Google Cloud product is a serverless data warehouse?",
      options: ["Cloud SQL", "Cloud Spanner", "BigQuery", "Bigtable"],
      correctIndex: 2,
      explanation: "BigQuery is the serverless analytics data warehouse; the others are operational databases.",
    },
    {
      question: "Which option scales to zero and bills per request for stateless containers?",
      options: ["Compute Engine", "Cloud Run", "GKE Standard", "App Engine Flex"],
      correctIndex: 1,
      explanation: "Cloud Run is the serverless container platform that scales to zero and bills per request.",
    },
  ],
  examTips: [
    "When a question mentions 'serverless data warehouse' → BigQuery.",
    "When it mentions 'stateless container with autoscaling' → Cloud Run.",
    "When it mentions 'lift and shift' → Compute Engine.",
    "When it mentions 'event-driven snippet of code' → Cloud Functions.",
  ],
  furtherReading: [
    { label: "Cloud Digital Leader exam guide", url: "https://cloud.google.com/learn/certification/guides/cloud-digital-leader" },
    { label: "Google Cloud — Free tier", url: "https://cloud.google.com/free" },
    { label: "Cloud Run documentation", url: "https://cloud.google.com/run/docs" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 1 — Digital Transformation                                   */
/* ------------------------------------------------------------------ */
const m1: ModuleExplanation = {
  moduleSlug: "cdl-digital-transformation",
  tagline: "Why companies move to the cloud and how Google Cloud frames the journey.",
  overview:
    "Module 1 establishes the vocabulary used everywhere on the CDL exam: what the cloud is, why companies are migrating, the four deployment models (public, private, hybrid, multicloud), the three service models (IaaS / PaaS / SaaS), and Google Cloud's transformation pillars (intelligence, freedom, collaboration, trust, sustainability).",
  whyItMatters:
    "Every later module assumes you can already explain why a board would approve a cloud project. Get this lexicon right and the rest of the exam is straightforward product mapping.",
  what: {
    heading: "What is digital transformation?",
    body:
      "Using digital technology — especially cloud — to change how a business operates and delivers value. It's not just lifting servers to AWS; it's rethinking products, data, customers and culture around always-available, always-improving technology.",
    bullets: [
      "Cloud — on-demand compute, storage and networking over the internet.",
      "Cloud-native — designed for the cloud (microservices, containers, managed services).",
      "Open source / open standard — code you can read, fork and run anywhere.",
      "Capex → Opex shift — buy hardware vs rent capacity by the hour.",
    ],
  },
  why: {
    heading: "Why are companies transforming?",
    body:
      "Customer expectations changed (24×7 mobile, instant updates), data exploded (need ML to read it), and competitors got faster. Staying on-prem usually means slower releases, higher fixed cost and worse security than a hyperscaler.",
  },
  who: {
    heading: "Who drives transformation?",
    body:
      "Sponsorship comes from CIO/CTO/CFO; execution involves platform, security, data, app and FinOps teams. The CDL exam frames most questions from a non-technical sponsor's perspective.",
  },
  when: {
    heading: "When do organizations transform?",
    body:
      "When fixed-cost data centers reach end of life, when a competitor releases faster, when AI/ML demands scale on-prem can't deliver, or when regulations push data residency / encryption guarantees on-prem can't meet cheaply.",
  },
  where: {
    heading: "Where does it run?",
    body:
      "Public cloud (Google Cloud), private cloud (on-prem), hybrid (both, connected) or multicloud (more than one public cloud). Most enterprises end up hybrid + multicloud and need a single control plane like GKE Enterprise.",
  },
  how: {
    heading: "How does Google Cloud frame the transformation?",
    body:
      "Around five pillars — intelligence (data + AI), freedom (open source / multicloud), collaboration (Workspace), trust (security & compliance) and sustainability (carbon-aware regions).",
  },
  conceptDeepDives: [
    {
      id: "deployment-models",
      name: "Deployment models — public / private / hybrid / multicloud",
      oneLine: "Where the infrastructure physically runs and who owns the hardware.",
      formal: "Public = shared multi-tenant cloud. Private = single-tenant (on-prem or hosted). Hybrid = public + private connected. Multicloud = more than one public cloud.",
      plainEnglish: "Renting space in a shared building, owning your own building, or doing both at once.",
      analogy: "Public = hotel; private = your house; hybrid = house + frequent hotel stays; multicloud = staying at multiple hotel chains.",
      howItWorks: "Workloads are placed where their data residency, latency, cost and integration constraints are best met.",
      microsoftMapping: "Same model as Azure — public regions, Azure Stack for private, Azure Arc for multicloud.",
      whenToUse: "Hybrid for regulated workloads with on-prem dependencies; multicloud to avoid vendor lock-in or to use best-of-breed services.",
      commonMistake: "Calling 'hosted single-tenant' a public cloud — it's private cloud regardless of who runs the data center.",
      examAngle: "Match a customer constraint (data must stay in-country, must reuse on-prem CRM, must avoid lock-in) to the right model.",
    },
    {
      id: "service-models",
      name: "Service models — IaaS / PaaS / SaaS",
      oneLine: "How much of the stack the cloud provider runs for you.",
      formal:
        "IaaS gives VMs and networks; PaaS adds the runtime / OS / middleware; SaaS delivers a finished application. Responsibility shifts left as you climb the ladder.",
      plainEnglish: "IaaS = bring your own house; PaaS = rent a furnished apartment; SaaS = book a hotel room.",
      analogy: "Pizza-as-a-service: make at home (IaaS), buy take-and-bake (PaaS), eat at the restaurant (SaaS).",
      howItWorks: "Each layer abstracts the one below; the customer manages everything above the line, the provider everything below.",
      microsoftMapping: "Compute Engine = IaaS, App Engine / Cloud Run = PaaS, Workspace = SaaS.",
      whenToUse: "Climb as high as your workload allows — less ops to do, faster delivery, often cheaper TCO.",
      commonMistake: "Treating Cloud Run as IaaS and trying to SSH into it — it's PaaS / serverless.",
      examAngle: "Map a Google Cloud product to its service model and to who is responsible for what.",
    },
    {
      id: "shared-responsibility",
      name: "Shared responsibility model",
      oneLine: "Google secures the cloud; you secure your usage of it.",
      formal:
        "A model where the provider is responsible for the security of underlying infrastructure (hardware, hypervisor, network, physical) and the customer is responsible for the security of their data, identities, configurations and apps.",
      plainEnglish: "Google locks the building; you choose who gets a key card and what they can carry inside.",
      analogy: "Cloud is a rented hotel room: hotel guarantees walls and locks, you decide who you let in and what you leave in the safe.",
      howItWorks: "The line shifts based on service model — more of the stack is the customer's in IaaS, less in SaaS.",
      microsoftMapping: "Same model as Microsoft / AWS shared responsibility diagrams.",
      whenToUse: "Always — design every cloud workload assuming you own data, identities and config.",
      commonMistake: "Assuming the cloud provider patches your VM OS or your IAM mistakes — they don't.",
      examAngle: "Expect a 'who is responsible for X' question — usually data, identities or app code is the customer's.",
    },
  ],
  comparisons: [
    {
      title: "On-prem vs cloud — what actually changes",
      columns: ["Criterion", "On-prem", "Cloud"],
      rows: [
        ["Cost model", "Capex (buy hardware)", "Opex (pay per use)"],
        ["Provisioning time", "Weeks–months", "Minutes"],
        ["Scalability", "Limited by hardware", "Elastic, near-unlimited"],
        ["Innovation speed", "Slow (hardware refresh)", "Fast (managed services)"],
        ["Sustainability", "Customer's problem", "Hyperscaler net-zero pledges"],
      ],
      bottomLine: "Cloud trades up-front capex for elastic opex and faster innovation cycles.",
    },
  ],
  realExamples: [
    {
      title: "Bank closes a data center",
      scenario:
        "A regional bank's leases on three data centers expire. They migrate 60% of workloads to Google Cloud (rehost), refactor the customer portal to Cloud Run, and keep the core banking system on a smaller private footprint connected via Cloud Interconnect.",
      outcome: "Annual infrastructure cost drops 35%, deployment frequency rises from monthly to weekly, and DR tests run nightly instead of yearly.",
    },
  ],
  keyTerms: [
    { term: "Capex", definition: "Up-front capital expenditure — buying assets like servers.", example: "Buying $2M of racks for a data center." },
    { term: "Opex", definition: "Ongoing operational expenditure — paying as you use.", example: "Cloud bill at end of month." },
    { term: "TCO", definition: "Total cost of ownership — full lifetime cost including ops, power, people.", example: "TCO of on-prem includes electricity and admins." },
    { term: "Cloud-native", definition: "Built for the cloud — microservices, containers, managed services, declarative ops.", example: "An app on GKE + Cloud SQL + Pub/Sub." },
  ],
  commonPitfalls: [
    "Treating digital transformation as a tooling project instead of a culture / process change.",
    "Lifting and shifting everything without modernising the highest-value workloads.",
    "Forgetting the shared responsibility model — Google does not patch your VM OS.",
    "Calling a single-tenant hosted environment 'public cloud' — it isn't.",
  ],
  faqs: [
    { q: "Is cloud always cheaper than on-prem?", a: "Not always. For very predictable, very high utilisation workloads on long hardware cycles, on-prem can be cheaper. Cloud's edge is elasticity, speed, and managed services." },
    { q: "What is 'cloud-native'?", a: "Software designed to take advantage of the cloud — usually means containerised microservices, managed services, declarative infra and CI/CD." },
    { q: "What's the difference between hybrid and multicloud?", a: "Hybrid = public + private. Multicloud = more than one public cloud (often Google Cloud + AWS + Azure)." },
  ],
  selfCheck: [
    {
      question: "A company wants to keep regulated data on-prem but burst to Google Cloud for ML. What model is this?",
      options: ["Public cloud only", "Private cloud only", "Hybrid cloud", "Multicloud"],
      correctIndex: 2,
      explanation: "Workloads run across both private and public — that's the definition of hybrid.",
    },
    {
      question: "Which is an Opex example?",
      options: ["Buying $1M of servers", "Building a new data center", "Paying monthly for Compute Engine VMs", "Buying network switches"],
      correctIndex: 2,
      explanation: "Pay-as-you-go usage of cloud resources is an operating expense, not a capital one.",
    },
  ],
  examTips: [
    "Memorise the four deployment models and their typical use case.",
    "Memorise IaaS / PaaS / SaaS and one Google Cloud product per layer.",
    "If a question mentions 'data must stay in country' → think data residency / sovereignty.",
    "If a question mentions 'reduce up-front cost' → Capex → Opex shift.",
  ],
  furtherReading: [
    { label: "Google Cloud — What is cloud computing?", url: "https://cloud.google.com/learn/what-is-cloud-computing" },
    { label: "Cloud Digital Leader exam guide", url: "https://cloud.google.com/learn/certification/guides/cloud-digital-leader" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 2 — Data Transformation                                      */
/* ------------------------------------------------------------------ */
const m2: ModuleExplanation = {
  moduleSlug: "cdl-data-transformation",
  tagline: "Pick the right Google Cloud database, warehouse or pipeline for any business question.",
  overview:
    "Module 2 covers the data side of the exam: where data sits (databases vs warehouses vs lakes), how Google Cloud organizes its options (Cloud SQL, Spanner, Bigtable, Firestore, BigQuery, Cloud Storage) and how analytics and streaming pipelines (Looker, Pub/Sub, Dataflow) turn raw events into business value.",
  whyItMatters:
    "Roughly one in six exam questions is 'which database / warehouse / pipeline?'. Knowing the cheat-sheet wins those points outright.",
  what: { heading: "What is the data value chain?", body: "Capture → store → process → analyze → act. Every Google Cloud data product owns one or two of those steps." },
  why: { heading: "Why does it matter?", body: "Data is the raw material for AI and decisions. Wrong storage = slow / expensive / non-compliant analytics." },
  who: { heading: "Who uses it?", body: "Data engineers build the pipeline, analysts query, ML engineers train models, leadership consumes dashboards." },
  when: { heading: "When?", body: "Whenever a business question is being answered with numbers — and that's most of the time." },
  where: { heading: "Where?", body: "Cloud Storage for objects, Cloud SQL/Spanner for OLTP, Bigtable for high-throughput NoSQL, BigQuery for OLAP." },
  how: {
    heading: "How do I pick?",
    body: "Two questions: structured or unstructured? Operational (OLTP) or analytical (OLAP)? Then map.",
    bullets: [
      "Unstructured object → Cloud Storage.",
      "Structured OLTP, regional → Cloud SQL.",
      "Structured OLTP, global, strong consistency → Cloud Spanner.",
      "NoSQL high-throughput → Bigtable.",
      "Mobile/web NoSQL document → Firestore.",
      "Analytics / warehouse → BigQuery.",
    ],
  },
  conceptDeepDives: [
    {
      id: "db-vs-warehouse-vs-lake",
      name: "Database vs Data Warehouse vs Data Lake",
      oneLine: "Operational store vs analytical store vs raw landing zone.",
      formal:
        "A database is optimized for transactional reads/writes (OLTP). A data warehouse is optimized for analytical queries on structured data (OLAP). A data lake stores raw structured and unstructured data for later processing.",
      plainEnglish: "Databases run the app, warehouses answer business questions, lakes hoard everything for later.",
      analogy: "Database = restaurant kitchen (live orders). Warehouse = corporate accountant (clean reports). Lake = warehouse-of-warehouses (every receipt ever).",
      howItWorks: "Data flows lake → warehouse → analytics; databases feed both.",
      microsoftMapping: "Cloud SQL/Spanner (DB), BigQuery (warehouse), Cloud Storage (lake).",
      whenToUse: "DB for live apps, warehouse for dashboards & reports, lake for ML training data and audit retention.",
      commonMistake: "Putting analytical queries on the production database — it kills app performance.",
      examAngle: "Match the workload (OLTP / OLAP / raw) to the right Google Cloud product.",
    },
    {
      id: "bigquery",
      name: "BigQuery",
      oneLine: "Serverless, petabyte-scale data warehouse.",
      formal: "Fully managed, columnar, separates storage from compute, supports standard SQL and ML via BigQuery ML.",
      plainEnglish: "Drop in CSVs, query with SQL, get answers in seconds.",
      analogy: "BigQuery is a Google Search for your business data.",
      howItWorks: "Queries fan out across thousands of slots; storage and compute are billed independently.",
      microsoftMapping: "Closest to Snowflake / Synapse.",
      whenToUse: "Analytics, dashboards, ad-hoc queries, ML on structured data, multicloud queries via BigQuery Omni.",
      commonMistake: "SELECT * on huge tables — BigQuery charges by bytes scanned.",
      examAngle: "If the keywords are 'serverless analytics warehouse' → BigQuery.",
    },
    {
      id: "storage-classes",
      name: "Cloud Storage classes",
      oneLine: "Four price/availability tiers for object storage.",
      formal: "Standard (hot), Nearline (≥ 30d), Coldline (≥ 90d), Archive (≥ 365d) — same API, different storage and retrieval pricing.",
      plainEnglish: "Hot, warm, cold, frozen — pay less the colder it gets, pay more to read.",
      analogy: "Standard is your fridge, Archive is the deep freezer in the basement.",
      howItWorks: "All four classes are durable and global; cheaper classes have higher retrieval cost and minimum storage duration.",
      microsoftMapping: "Equivalent to Azure Hot/Cool/Archive or S3 Standard/IA/Glacier.",
      whenToUse: "Match access frequency to class. Lifecycle rules can demote objects automatically.",
      commonMistake: "Putting active website assets in Coldline / Archive — retrieval costs blow up.",
      examAngle: "Map an access pattern (daily / monthly / yearly / never) to the correct class.",
    },
  ],
  comparisons: [
    {
      title: "Pick a database — Google Cloud cheat sheet",
      columns: ["Need", "Product"],
      rows: [
        ["Structured, relational, regional", "Cloud SQL"],
        ["Structured, relational, global, strong consistency", "Cloud Spanner"],
        ["NoSQL, high throughput, low latency", "Bigtable"],
        ["NoSQL, document, mobile/web", "Firestore"],
        ["Analytics warehouse", "BigQuery"],
        ["Object storage", "Cloud Storage"],
      ],
      bottomLine: "Workload shape decides the product — never the other way around.",
    },
    {
      title: "Cloud Storage classes",
      columns: ["Class", "Min storage", "Best for"],
      rows: [
        ["Standard", "None", "Hot, frequently accessed"],
        ["Nearline", "30 days", "≤ 1 access / month"],
        ["Coldline", "90 days", "≤ 1 access / quarter"],
        ["Archive", "365 days", "Long-term backup, regulatory retention"],
      ],
      bottomLine: "Colder = cheaper to store, more expensive to read.",
    },
  ],
  realExamples: [
    {
      title: "Retailer builds real-time recommendations",
      scenario: "Mobile events → Pub/Sub → Dataflow → BigQuery. Looker dashboards on top, Vertex AI model trained on the warehouse.",
      outcome: "5-minute latency from click to recommendation refresh; merchandising team self-serves dashboards.",
    },
  ],
  keyTerms: [
    { term: "OLTP", definition: "Online Transaction Processing — many small, latency-sensitive read/writes.", example: "An e-commerce checkout." },
    { term: "OLAP", definition: "Online Analytical Processing — large aggregations and reporting.", example: "Quarterly sales by region." },
    { term: "Pub/Sub", definition: "Managed messaging service for event ingestion and decoupling.", example: "Click events → analytics pipeline." },
    { term: "Dataflow", definition: "Managed Apache Beam — batch and stream data processing.", example: "Transform Pub/Sub events into BigQuery rows." },
    { term: "Looker", definition: "BI platform that turns BigQuery data into dashboards and embedded analytics.", example: "Self-serve revenue dashboard." },
  ],
  commonPitfalls: [
    "Choosing Bigtable for relational data — it's NoSQL.",
    "Using Cloud SQL when global consistency is required — use Spanner.",
    "Picking a colder Cloud Storage class than the access pattern justifies.",
    "Running analytics directly against the production database.",
  ],
  faqs: [
    { q: "BigQuery vs Bigtable — what's the difference?", a: "BigQuery is a SQL analytics warehouse. Bigtable is a wide-column NoSQL store for high-throughput operational workloads (IoT, ad-tech, financial tickers)." },
    { q: "When do I need Spanner instead of Cloud SQL?", a: "When you need strong consistency at global scale — Cloud SQL is regional and capped, Spanner is global with horizontal scale." },
    { q: "Is Cloud Storage object or block storage?", a: "Object — for files, blobs, backups, media. Persistent Disk is block storage attached to VMs." },
  ],
  selfCheck: [
    {
      question: "You need to store user-uploaded photos. Which product?",
      options: ["BigQuery", "Cloud SQL", "Cloud Storage", "Firestore"],
      correctIndex: 2,
      explanation: "Cloud Storage is Google Cloud's object store for files / media / backups.",
    },
    {
      question: "Which storage class fits data accessed once a year?",
      options: ["Standard", "Nearline", "Coldline", "Archive"],
      correctIndex: 3,
      explanation: "Archive has a 365-day minimum storage duration — perfect for once-a-year access.",
    },
  ],
  examTips: [
    "Serverless analytics warehouse → BigQuery.",
    "Globally consistent relational DB → Spanner.",
    "Object storage → Cloud Storage (pick the class by access frequency).",
    "Streaming events → Pub/Sub + Dataflow.",
  ],
  furtherReading: [
    { label: "Google Cloud — Database options", url: "https://cloud.google.com/products/databases" },
    { label: "BigQuery documentation", url: "https://cloud.google.com/bigquery/docs" },
    { label: "Cloud Storage classes", url: "https://cloud.google.com/storage/docs/storage-classes" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 3 — AI / ML                                                  */
/* ------------------------------------------------------------------ */
const m3: ModuleExplanation = {
  moduleSlug: "cdl-ai-ml",
  tagline: "Where AI/ML creates business value, and which Google Cloud product to recommend.",
  overview:
    "Module 3 frames AI and ML as a business multiplier and walks the Google Cloud AI ladder: pre-trained APIs (fastest), AutoML (your data, no code), Vertex AI custom (full control). It also touches BigQuery ML, TensorFlow, and Cloud TPUs.",
  whyItMatters:
    "AI questions are often the easiest points on the exam — they map keywords (image, text, voice, translation, custom model) directly to a product.",
  what: { heading: "What is ML?", body: "Letting a model learn patterns from data instead of hand-coding rules. Useful when the rules are too many, too fuzzy, or change too often." },
  why: { heading: "Why ML?", body: "Scales decisions to millions of inputs, finds patterns humans miss, unlocks unstructured data (images, voice, text)." },
  who: { heading: "Who builds ML?", body: "Data scientists, ML engineers; the CDL exam targets the sponsor / CIO who chooses pre-trained vs custom." },
  when: { heading: "When to use ML?", body: "When you have lots of data, the rules are non-obvious, and being slightly wrong is acceptable." },
  where: { heading: "Where on Google Cloud?", body: "Three rungs of the ladder: pre-trained API, AutoML, custom Vertex AI." },
  how: {
    heading: "How to pick?",
    body: "Trade off speed vs differentiation.",
    bullets: [
      "Need it tomorrow, generic problem → pre-trained API.",
      "Need it next month, your data → AutoML.",
      "Need full control, unique data → Vertex AI custom.",
    ],
  },
  conceptDeepDives: [
    {
      id: "ai-ladder",
      name: "Google Cloud AI ladder",
      oneLine: "Three rungs: pre-trained APIs → AutoML → custom Vertex AI.",
      formal: "A spectrum from fully managed pre-trained models (no training, no data) to fully custom training with your code on Vertex AI.",
      plainEnglish: "Buy ready, train no-code, or build from scratch.",
      analogy: "Buy a suit, tailor a suit, or have a suit hand-stitched.",
      howItWorks: "Each rung trades less effort for less differentiation.",
      microsoftMapping: "Equivalent to Azure Cognitive Services / Custom Vision / Azure ML.",
      whenToUse: "Climb only as high as differentiation requires.",
      commonMistake: "Building custom for a problem a pre-trained API already solves.",
      examAngle: "Map a scenario keyword to the right rung.",
    },
    {
      id: "pretrained-apis",
      name: "Pre-trained APIs",
      oneLine: "REST endpoints for common ML tasks — no model, no data, no training.",
      formal: "Vision API (image), Natural Language API (text), Translation API (language), Speech-to-Text and Text-to-Speech (audio).",
      plainEnglish: "Send a photo / sentence / audio, get back a structured answer.",
      analogy: "Like calling Google Translate as a function from your code.",
      howItWorks: "Authenticated POST to the endpoint with the payload; pricing is per character / image / second.",
      microsoftMapping: "Cognitive Services equivalents.",
      whenToUse: "Generic problems (OCR, sentiment, transcription) where Google's model is already strong enough.",
      commonMistake: "Re-training when a pre-trained API already meets accuracy bars.",
      examAngle: "Match keyword (image, text, language, voice) to the right API.",
    },
    {
      id: "vertex-ai",
      name: "Vertex AI",
      oneLine: "Unified platform for training, tuning and deploying custom ML models on Google Cloud.",
      formal:
        "Vertex AI bundles datasets, AutoML, custom training, model registry, prediction endpoints and MLOps pipelines into one product.",
      plainEnglish: "One place to do all your custom ML on Google Cloud.",
      analogy: "Vertex AI is the workshop; pre-trained APIs are the off-the-shelf tools.",
      howItWorks: "Datasets → training jobs (AutoML or custom code) → model registry → endpoints for online or batch prediction.",
      microsoftMapping: "Closest to Azure ML or AWS SageMaker.",
      whenToUse: "Problems unique to your business, where differentiation justifies the build.",
      commonMistake: "Standing up Vertex AI for problems pre-trained APIs already solve.",
      examAngle: "Vertex AI = custom ML platform. Recognise it as the answer when the question asks for differentiation or proprietary data.",
    },
  ],
  comparisons: [
    {
      title: "Pre-trained API vs AutoML vs Custom (Vertex AI)",
      columns: ["Criterion", "Pre-trained API", "AutoML", "Custom Vertex AI"],
      rows: [
        ["Time to ship", "Hours", "Days", "Weeks–months"],
        ["Your data?", "No", "Yes", "Yes"],
        ["Differentiation", "Low", "Medium", "High"],
        ["Required expertise", "Developer", "Analyst+", "ML engineer"],
      ],
      bottomLine: "Climb only as high as differentiation requires.",
    },
  ],
  realExamples: [
    {
      title: "Logistics company reads driver licences",
      scenario: "Use Vision API for OCR + Natural Language API for entity extraction. No model training required.",
      outcome: "Onboarding form fills itself in seconds; manual data entry team cut by 70%.",
    },
  ],
  keyTerms: [
    { term: "AutoML", definition: "Train a custom model on your data with minimal code via the Vertex AI UI/API.", example: "AutoML Vision for product classification." },
    { term: "BigQuery ML", definition: "Train and run ML models directly inside BigQuery using SQL.", example: "CREATE MODEL on a sales table." },
    { term: "TensorFlow", definition: "Open-source ML framework originally created by Google.", example: "Used in research labs and production at Google scale." },
    { term: "TPU", definition: "Tensor Processing Unit — Google's purpose-built ML accelerator.", example: "Train large models faster than on GPUs." },
    { term: "Responsible AI", definition: "Building AI systems that are fair, explainable, secure and privacy-preserving.", example: "Bias testing on a hiring model." },
  ],
  commonPitfalls: [
    "Picking custom training when a pre-trained API would suffice.",
    "Ignoring data quality — garbage in, garbage out.",
    "Skipping responsible-AI review on user-impacting models.",
    "Confusing analytics (BigQuery, Looker) with ML (Vertex, BQML).",
  ],
  faqs: [
    { q: "Is BigQuery ML real ML?", a: "Yes — it trains genuine models (linear regression, boosted trees, even imported TensorFlow) using SQL inside BigQuery, perfect for analysts." },
    { q: "What's the difference between AutoML and Vertex AI?", a: "AutoML is a low-code training experience inside the Vertex AI platform. Vertex AI is the full platform — AutoML is one entry point." },
    { q: "Do I need GPUs / TPUs?", a: "Only for large custom training. Pre-trained APIs and most AutoML jobs are fully managed — you don't see the hardware." },
  ],
  selfCheck: [
    {
      question: "You need to detect objects in user-uploaded photos with no training. Which is best?",
      options: ["AutoML Vision", "Vertex AI custom", "Vision API", "BigQuery ML"],
      correctIndex: 2,
      explanation: "Vision API is the pre-trained API for object/label detection — fastest path.",
    },
    {
      question: "Analyst wants to build a sales-forecast model using SQL. Which product?",
      options: ["AutoML Tabular", "BigQuery ML", "Vertex AI custom", "Cloud Translation API"],
      correctIndex: 1,
      explanation: "BigQuery ML lets analysts build forecasting models in plain SQL inside BigQuery.",
    },
  ],
  examTips: [
    "Image / OCR scenario → Vision API.",
    "Sentiment / entity extraction → Natural Language API.",
    "Voice → Speech-to-Text / Text-to-Speech.",
    "Translation → Cloud Translation API.",
    "Custom model on proprietary data → Vertex AI (or AutoML).",
  ],
  furtherReading: [
    { label: "Google Cloud — AI products", url: "https://cloud.google.com/products/ai" },
    { label: "Vertex AI documentation", url: "https://cloud.google.com/vertex-ai/docs" },
    { label: "BigQuery ML", url: "https://cloud.google.com/bigquery-ml/docs" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 4 — Modernize Infrastructure & Apps                          */
/* ------------------------------------------------------------------ */
const m4: ModuleExplanation = {
  moduleSlug: "cdl-modernize-infra",
  tagline: "Migration paths, compute options and how to choose serverless, containers or VMs.",
  overview:
    "Module 4 covers what to do with existing apps when you move to Google Cloud — the migration vocabulary (rehost, replatform, refactor, reimagine, retain, retire) and the compute spectrum (Compute Engine VMs, GKE / Cloud Run containers, App Engine / Cloud Functions serverless, Apigee API management, GKE Enterprise hybrid).",
  whyItMatters:
    "Choosing the right migration path and compute option per workload is the day-job of a cloud lead — and a heavy share of CDL exam questions.",
  what: { heading: "What is modernization?", body: "Replacing or evolving legacy apps to take advantage of cloud-native primitives — containers, managed services, autoscaling, declarative ops." },
  why: { heading: "Why modernize?", body: "Faster releases, lower ops cost, better resilience, easier hiring, smaller carbon footprint." },
  who: { heading: "Who runs it?", body: "Platform / SRE teams, app dev, security and FinOps — co-led by an architect." },
  when: { heading: "When?", body: "When the app is strategic, has change demand, or its underlying tech is end-of-life." },
  where: { heading: "Where?", body: "Compute Engine, GKE, Cloud Run, Cloud Functions, App Engine, Apigee, GKE Enterprise — pick by workload shape." },
  how: {
    heading: "How to choose a migration path?",
    body: "Match each workload to a strategy.",
    bullets: [
      "Retire — turn it off.",
      "Retain — keep it where it is.",
      "Rehost (lift-and-shift) — same app on a Compute Engine VM.",
      "Replatform — minor changes (e.g. Cloud SQL).",
      "Refactor — re-architect for cloud-native (containers, microservices).",
      "Reimagine — rebuild as a new product / experience.",
    ],
  },
  conceptDeepDives: [
    {
      id: "compute-spectrum",
      name: "Google Cloud compute spectrum",
      oneLine: "From VMs to functions — pick the highest abstraction your workload allows.",
      formal: "Compute Engine (VMs) → GKE (Kubernetes containers) → Cloud Run (serverless containers) → App Engine (managed apps) → Cloud Functions (event-driven snippets).",
      plainEnglish: "Higher up the ladder = less ops, less control. Pick the highest one your workload tolerates.",
      analogy: "VMs are renting an empty truck; Cloud Run is calling Uber Freight; Cloud Functions is sending a parcel by post.",
      howItWorks: "Each option is a different layer of managed infrastructure with its own scaling and pricing model.",
      microsoftMapping: "VM ≈ Azure VMs / EC2; GKE ≈ AKS / EKS; Cloud Run ≈ Container Apps / App Runner.",
      whenToUse: "Go highest you can; drop down for compatibility (legacy OS, GPUs, special drivers).",
      commonMistake: "Defaulting to VMs out of habit — usually a serverless or container option is cheaper and faster.",
      examAngle: "Map a scenario keyword (legacy / stateless API / event / Java app) to the right product.",
    },
    {
      id: "containers-microservices",
      name: "Containers & microservices",
      oneLine: "Package once, run anywhere; small services with single responsibilities.",
      formal:
        "Containers are isolated packages of an app and its runtime; microservices are an architectural style splitting an app into independently deployable services communicating over APIs.",
      plainEnglish: "Box your app so it runs identically anywhere; split big apps into small, focused pieces.",
      analogy: "Containers = shipping containers (standard, portable). Microservices = modular furniture (swap pieces independently).",
      howItWorks: "Build an OCI image, push to Artifact Registry, deploy to GKE / Cloud Run / Anywhere.",
      microsoftMapping: "Same OCI standard across Azure, AWS and on-prem.",
      whenToUse: "Whenever portability, density and faster releases matter.",
      commonMistake: "Splitting too aggressively — a 'microservice' per file creates network spaghetti.",
      examAngle: "Recognise GKE for orchestrated containers and Cloud Run for serverless containers.",
    },
    {
      id: "apis-apigee",
      name: "APIs & Apigee API Management",
      oneLine: "Turn services into products via versioned, monetisable, secured APIs.",
      formal:
        "Apigee is Google Cloud's full-lifecycle API management platform — design, security, throttling, analytics, monetisation and developer portals.",
      plainEnglish: "Apigee is a security guard, gift shop and front desk for your APIs.",
      analogy: "Apigee turns an internal pipe into a product with a price tag and a usage report.",
      howItWorks: "Apigee proxies calls to your backend, applying policies (auth, quota, transform) before responding to clients.",
      microsoftMapping: "Closest to Azure API Management or AWS API Gateway.",
      whenToUse: "When you want to expose APIs externally, monetise them, or apply enterprise governance.",
      commonMistake: "Using Apigee just as a load balancer — you're paying for the policy and analytics layer.",
      examAngle: "Apigee is the answer for 'expose, secure, monetise APIs' scenarios.",
    },
  ],
  comparisons: [
    {
      title: "Migration paths cheat sheet",
      columns: ["Path", "What changes", "When to use"],
      rows: [
        ["Retire", "Turn off", "App no longer needed"],
        ["Retain", "Nothing", "Constraints prevent move"],
        ["Rehost (lift-and-shift)", "Same app on cloud VM", "Quick exit from data center"],
        ["Replatform", "Minor (e.g. managed DB)", "Easy quick wins"],
        ["Refactor", "Re-architect for cloud-native", "Strategic workloads"],
        ["Reimagine", "Rebuild as new product", "Differentiating digital experiences"],
      ],
      bottomLine: "Most enterprises end up with a mix — categorise every workload before choosing.",
    },
  ],
  realExamples: [
    {
      title: "Insurance company modernization mix",
      scenario:
        "Mainframe → retain (with API wrap). Java monolith → rehost on Compute Engine. New customer portal → refactor to Cloud Run. Internal HR tool → retire.",
      outcome: "Annual infra spend −30%, time-to-release improves from quarterly to weekly for the portal.",
    },
  ],
  keyTerms: [
    { term: "Lift-and-shift", definition: "Moving an app to the cloud as a VM, with no changes.", example: "VMware → Compute Engine via Migrate to Virtual Machines." },
    { term: "Serverless", definition: "You run code, the provider runs the servers and bills per use.", example: "Cloud Run, Cloud Functions, App Engine Standard." },
    { term: "Microservice", definition: "A small, independently deployable service with one responsibility.", example: "Cart-service, Order-service, Payment-service." },
    { term: "GKE Enterprise", definition: "Single control plane to manage Kubernetes across Google Cloud, on-prem and other clouds.", example: "Manage AKS / EKS clusters from one place." },
  ],
  commonPitfalls: [
    "Lifting and shifting strategic workloads instead of modernizing them.",
    "Picking GKE for every container — Cloud Run is simpler when stateless.",
    "Building APIs without API management — auth, quota, analytics become bolted on.",
    "Forgetting that Cloud Functions is for event-driven snippets, not full apps.",
  ],
  faqs: [
    { q: "Cloud Run vs GKE — which one?", a: "Cloud Run is serverless, scales to zero, no cluster to operate. GKE gives you full Kubernetes power for stateful, multi-service or specialised workloads." },
    { q: "Is App Engine deprecated?", a: "No. App Engine Standard is still a great fit for managed apps in Python/Node/Go/Java/etc. Many teams now choose Cloud Run for new work because it accepts any container." },
    { q: "What is GKE Enterprise?", a: "A platform that lets you manage Kubernetes across Google Cloud, on-prem (GKE on-prem) and other clouds (GKE attached) from one control plane." },
  ],
  selfCheck: [
    {
      question: "Stateless HTTP API in a container that needs to scale to zero. Best fit?",
      options: ["Compute Engine", "Cloud Run", "Cloud Functions", "App Engine Flex"],
      correctIndex: 1,
      explanation: "Cloud Run runs stateless containers, scales to zero and bills per request.",
    },
    {
      question: "What does 'rehost' mean?",
      options: ["Rebuild as a new product", "Move with no changes", "Replace with SaaS", "Refactor into microservices"],
      correctIndex: 1,
      explanation: "Rehost (lift-and-shift) is moving an app to the cloud unchanged.",
    },
  ],
  examTips: [
    "Stateless containers, scale to zero → Cloud Run.",
    "Event-driven snippet of code → Cloud Functions.",
    "Lift-and-shift legacy → Compute Engine.",
    "Manage K8s across clouds → GKE Enterprise.",
    "Expose / secure / monetise APIs → Apigee.",
  ],
  furtherReading: [
    { label: "Cloud Run docs", url: "https://cloud.google.com/run/docs" },
    { label: "Google Kubernetes Engine docs", url: "https://cloud.google.com/kubernetes-engine/docs" },
    { label: "Apigee overview", url: "https://cloud.google.com/apigee" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 5 — Trust & Security                                         */
/* ------------------------------------------------------------------ */
const m5: ModuleExplanation = {
  moduleSlug: "cdl-trust-security",
  tagline: "Google's defense-in-depth, the shared responsibility model and how customers earn trust.",
  overview:
    "Module 5 covers how Google secures its infrastructure (custom hardware, encryption everywhere, defense in depth), how customers extend that with IAM, 2SV and Cloud Armor, and how compliance, transparency reports and data residency build trust at the policy level.",
  whyItMatters:
    "Security and trust questions are scenario-based and frequent. Knowing the model and naming the right product wins the points.",
  what: { heading: "What is cloud security?", body: "Protecting confidentiality, integrity and availability of cloud workloads — combining the provider's controls with the customer's." },
  why: { heading: "Why does it matter?", body: "Breaches cost money and trust. Cloud done right is more secure than typical on-prem; cloud done wrong is more exposed." },
  who: { heading: "Who is responsible?", body: "Both — Google for the cloud, customer for what's in it. Roles vary by IaaS / PaaS / SaaS." },
  when: { heading: "When to plan it?", body: "From day zero — identity, encryption, audit and network controls before workloads." },
  where: { heading: "Where do controls live?", body: "Globally — encryption at rest and in transit by default, IAM in every API, Cloud Armor at the edge, Compliance Reports Manager for audits." },
  how: {
    heading: "How does Google's defense-in-depth work?",
    body: "Layered controls from custom hardware up to the application — every layer assumes the others may fail.",
    bullets: [
      "Custom server / network hardware in Google data centers.",
      "Encryption of data at rest and in transit by default.",
      "Identity-Aware Proxy, IAM, 2SV / hardware keys for access.",
      "Cloud Armor for DDoS / WAF at the edge.",
      "SecOps (Chronicle, Mandiant) for detection and response.",
    ],
  },
  conceptDeepDives: [
    {
      id: "shared-responsibility",
      name: "Shared responsibility model",
      oneLine: "Google secures the cloud; you secure your usage.",
      formal: "Layered model where the provider owns lower-stack security (hardware, hypervisor, network) and the customer owns upper-stack (data, identities, configuration).",
      plainEnglish: "Google locks the building; you decide who gets a key card.",
      analogy: "Cloud is a hotel: hotel guarantees the locks, you decide who you let in.",
      howItWorks: "The line shifts based on service model — more in IaaS, less in SaaS.",
      microsoftMapping: "Same model across all clouds.",
      whenToUse: "Always — design every cloud workload assuming you own data, identities and config.",
      commonMistake: "Assuming the provider patches your VM OS or fixes your IAM mistakes.",
      examAngle: "Expect a 'who is responsible for X' question — usually data, identities or app code is the customer's.",
    },
    {
      id: "iam-2sv",
      name: "IAM, authentication, authorization, auditing",
      oneLine: "Three As: who you are, what you can do, and what you did.",
      formal:
        "Authentication establishes identity (passwords + 2SV / FIDO keys). Authorization grants permissions via IAM roles. Auditing records actions in Cloud Audit Logs.",
      plainEnglish: "Show your badge, get the doors you're allowed to open, leave a record of what you touched.",
      analogy: "Three As are the door, the lock and the security camera.",
      howItWorks: "Sign-in flow → token with identity → IAM check on every API → Audit log entry.",
      microsoftMapping: "Same 3 As across Azure / AWS / Google Cloud.",
      whenToUse: "Always — never deploy a workload without IAM least privilege and 2SV on admin accounts.",
      commonMistake: "Sharing service-account keys instead of using Workload Identity Federation.",
      examAngle: "Know that IAM is the answer for 'control who can do what' and audit logs are the answer for 'who did what'.",
    },
    {
      id: "cloud-armor",
      name: "Cloud Armor",
      oneLine: "Edge DDoS / WAF protection for HTTP(S) load-balanced apps.",
      formal:
        "Google Cloud's edge security service providing DDoS mitigation, IP/geo allow-deny lists, OWASP Top-10 rules and adaptive protection backed by Google's threat intelligence.",
      plainEnglish: "A bouncer for your web app at Google's network edge.",
      analogy: "Cloud Armor is to the internet what airport security is to a flight.",
      howItWorks: "Policies are attached to Google Cloud HTTP(S) load balancers; traffic is filtered before reaching the backend.",
      microsoftMapping: "Closest to AWS WAF/Shield or Azure Front Door + WAF.",
      whenToUse: "Whenever a public web app is deployed behind a Google load balancer.",
      commonMistake: "Forgetting to enable Cloud Armor for new front-end services.",
      examAngle: "Cloud Armor = DDoS / WAF answer.",
    },
  ],
  comparisons: [
    {
      title: "Shared responsibility — who owns what?",
      columns: ["Layer", "On-prem", "IaaS", "PaaS", "SaaS"],
      rows: [
        ["Application", "You", "You", "You", "Provider"],
        ["Runtime / OS", "You", "You", "Provider", "Provider"],
        ["Hypervisor / hardware", "You", "Provider", "Provider", "Provider"],
        ["Data", "You", "You", "You", "You"],
        ["Identities", "You", "You", "You", "You"],
      ],
      bottomLine: "Data and identities are always the customer's responsibility — climbing up the model only shrinks infra ops.",
    },
  ],
  realExamples: [
    {
      title: "Public e-commerce site under DDoS",
      scenario: "Cloud Armor adaptive protection auto-builds rules to block a botnet hitting the checkout endpoint while letting genuine traffic through.",
      outcome: "Site stays up; backend autoscaler avoids unnecessary spend on attack traffic.",
    },
  ],
  keyTerms: [
    { term: "2SV", definition: "Two-Step Verification — second factor (TOTP, security key) on top of password.", example: "Titan key plus password for admins." },
    { term: "Encryption at rest", definition: "Data is encrypted on disk by default in Google Cloud.", example: "All Cloud Storage objects, BigQuery datasets, etc." },
    { term: "Encryption in transit", definition: "Data is encrypted in flight (TLS) on the public internet and inside Google's network.", example: "All API calls to *.googleapis.com use TLS." },
    { term: "Data residency", definition: "Where data is physically stored.", example: "Pin a Cloud Storage bucket to europe-west3 to keep data in Germany." },
    { term: "SecOps", definition: "Security Operations — detection, investigation and response, often SIEM-driven.", example: "Chronicle SecOps for SIEM/SOAR." },
  ],
  commonPitfalls: [
    "Assuming Google patches your OS — it doesn't, you do (in IaaS).",
    "Skipping 2SV on admin accounts — the #1 breach vector.",
    "Sharing service account keys via email or git.",
    "Confusing data residency (where it sits) with data sovereignty (whose laws apply).",
  ],
  faqs: [
    { q: "Is data encrypted by default?", a: "Yes — at rest and in transit on Google Cloud, with no configuration required." },
    { q: "What proves Google's compliance?", a: "Compliance Reports Manager and the Compliance Resource Center publish SOC, ISO, PCI, HIPAA and many other reports." },
    { q: "Can I keep my data in a specific country?", a: "Yes — pick a region in that country and use Organization Policies to constrain placement." },
  ],
  selfCheck: [
    {
      question: "Which Google Cloud product blocks DDoS / WAF threats at the edge?",
      options: ["Cloud Armor", "Cloud IDS", "Cloud Run", "Cloud KMS"],
      correctIndex: 0,
      explanation: "Cloud Armor is the edge DDoS / WAF service for HTTP(S) load-balanced apps.",
    },
    {
      question: "Which is ALWAYS the customer's responsibility regardless of service model?",
      options: ["Hardware", "Hypervisor", "Data and identities", "Network fabric"],
      correctIndex: 2,
      explanation: "Data and identity are always the customer's — even in SaaS, you choose who gets access.",
    },
  ],
  examTips: [
    "DDoS / WAF → Cloud Armor.",
    "Who can do what → IAM.",
    "Encryption — by default on Google Cloud.",
    "Data must stay in country → data residency / region pinning.",
  ],
  furtherReading: [
    { label: "Google Cloud security", url: "https://cloud.google.com/security" },
    { label: "Cloud Armor docs", url: "https://cloud.google.com/armor/docs" },
    { label: "Compliance Reports Manager", url: "https://cloud.google.com/security/compliance/compliance-reports-manager" },
  ],
};

/* ------------------------------------------------------------------ */
/* Module 6 — Scaling Operations                                       */
/* ------------------------------------------------------------------ */
const m6: ModuleExplanation = {
  moduleSlug: "cdl-scaling-operations",
  tagline: "Financial governance, reliability, support and sustainability — running cloud at scale.",
  overview:
    "Module 6 covers the operational pillars of a Google Cloud customer: financial governance (resource hierarchy, quotas, budgets, billing reports), reliability (DevOps, SRE, fault tolerance, DR), Customer Care support tiers, and sustainability commitments.",
  whyItMatters:
    "These are the questions sponsors actually ask: 'How do I avoid surprise bills?', 'How reliable is it?', 'Who do I call?' — exam questions follow the same shape.",
  what: { heading: "What is operational excellence?", body: "Running cloud workloads predictably (reliability), affordably (FinOps), and sustainably." },
  why: { heading: "Why?", body: "Without governance, costs surge; without SRE practices, outages multiply; without sustainability, ESG goals are missed." },
  who: { heading: "Who is involved?", body: "FinOps, SRE / DevOps, support engineers and sustainability leads — co-led by a cloud center of excellence." },
  when: { heading: "When to set it up?", body: "From day zero — billing budgets and resource hierarchy must exist before workloads land." },
  where: { heading: "Where to look?", body: "Cloud Billing, Cloud Monitoring, Cloud Logging, Cloud Customer Care portal, and Google's sustainability reports." },
  how: {
    heading: "How does Google Cloud help?",
    body: "Tooling at every layer.",
    bullets: [
      "Resource hierarchy + Org Policies for guardrails.",
      "Quotas and budgets for cost control.",
      "Billing Reports + BigQuery export for chargeback / showback.",
      "SRE practices (SLI / SLO / error budget) baked into managed services.",
      "Customer Care tiers from Basic to Premium with named TAMs.",
    ],
  },
  conceptDeepDives: [
    {
      id: "resource-hierarchy",
      name: "Resource hierarchy",
      oneLine: "Organization → Folder → Project → Resource — IAM and policy inherit downward.",
      formal:
        "Google Cloud's resource hierarchy starts at the Organization node, optionally groups projects into Folders, contains Projects, and contains Resources. IAM bindings, Org Policies and Tags inherit down the tree.",
      plainEnglish: "It's the org chart for your cloud — set rules at the top, they apply to everything below.",
      analogy: "Like company → department → team → desk: rules set at the company level apply to every desk.",
      howItWorks: "Inheritance is additive for IAM (cannot deny higher-level grants) and overlay for Org Policies.",
      microsoftMapping: "Closest to Azure Management Group → Subscription → Resource Group → Resource.",
      whenToUse: "Always — even single-project orgs benefit from setting Org Policies at the org level.",
      commonMistake: "Granting Owner at the Organization node — blast radius is the entire company.",
      examAngle: "Order of the hierarchy is a frequently tested fact.",
    },
    {
      id: "quotas-budgets",
      name: "Quotas, budgets and billing reports",
      oneLine: "Cap usage, alert on spend, and explain the bill.",
      formal:
        "Quotas cap how much of a resource a project can consume. Budgets alert (or trigger automation) when forecast/actual cost crosses thresholds. Billing Reports visualise spend by project / service / SKU.",
      plainEnglish: "Quotas keep your cloud from running away; budgets warn you early; reports show you why.",
      analogy: "Quotas = credit limit, budgets = spending alerts, reports = monthly statement.",
      howItWorks: "Quotas are enforced server-side; budgets evaluate against billing data and can fire Pub/Sub messages for automation.",
      microsoftMapping: "Same idea as Azure quotas + cost alerts + Cost Management.",
      whenToUse: "Always — every project should have a budget alert before it sees production traffic.",
      commonMistake: "Believing a budget alert blocks spending — it doesn't, it only notifies (without automation).",
      examAngle: "Expect a 'how do I prevent surprise bills?' question — answer: quotas + budgets + billing reports.",
    },
    {
      id: "sre-reliability",
      name: "Reliability, DevOps and SRE",
      oneLine: "Treat reliability as a feature with measurable targets.",
      formal:
        "Site Reliability Engineering (SRE) defines Service Level Indicators (SLIs), Service Level Objectives (SLOs) and Error Budgets to balance velocity and reliability.",
      plainEnglish: "Pick a number for 'reliable enough' and use it to decide when to release vs when to fix.",
      analogy: "SLOs are the speed limit; the error budget is the points on your driving licence.",
      howItWorks: "Measure SLI from monitoring → compare to SLO → if error budget remains, ship features; if exhausted, freeze features and fix reliability.",
      microsoftMapping: "Same practice — SRE was popularised by Google but is industry-wide.",
      whenToUse: "Any service with users — internal tools, customer apps, data pipelines.",
      commonMistake: "Setting SLOs to 100% — leaves no room to ship change and burns out the team.",
      examAngle: "Know what SLI / SLO / error budget mean and that they come from SRE.",
    },
  ],
  comparisons: [
    {
      title: "Customer Care support tiers",
      columns: ["Tier", "Response time", "Best for"],
      rows: [
        ["Basic", "Best effort", "Free — billing, account questions"],
        ["Standard", "P2 4h business hours", "Dev / test workloads"],
        ["Enhanced", "P1 1h 24×7", "Production workloads"],
        ["Premium", "P1 15min 24×7 + TAM", "Mission-critical, large enterprise"],
      ],
      bottomLine: "Match support tier to business impact and SLO of the workload.",
    },
  ],
  realExamples: [
    {
      title: "Surprise bill prevention",
      scenario:
        "A startup sets a budget at 80% of their monthly limit with email alerts plus a Pub/Sub trigger that pauses non-prod Cloud Run services automatically.",
      outcome: "Spend stays predictable; engineers learn cost-aware design without a finance escalation.",
    },
  ],
  keyTerms: [
    { term: "Resource hierarchy", definition: "Org → Folder → Project → Resource model.", example: "Folder per business unit." },
    { term: "Quota", definition: "Cap on resource consumption per project / region.", example: "100 VMs per region." },
    { term: "Budget", definition: "Cost threshold that triggers alerts (and optional automation).", example: "80% of $5K monthly cap." },
    { term: "SLI / SLO", definition: "Service Level Indicator (measurement) and Objective (target).", example: "99.9% availability of /checkout." },
    { term: "Error budget", definition: "Allowed unreliability over a period — drives release vs fix decisions.", example: "0.1% of monthly minutes." },
  ],
  commonPitfalls: [
    "Trusting budgets to enforce caps — they only alert (without automation hooked up).",
    "Forgetting to use the resource hierarchy — flat projects = no governance.",
    "Confusing reliability (uptime) with resilience (recover from failure).",
    "Ignoring sustainability when picking regions — pick low-CO₂ regions when latency allows.",
  ],
  faqs: [
    { q: "Will a budget block spending?", a: "By default it only alerts. To block, hook the alert into Pub/Sub and write automation that disables billing on the project." },
    { q: "What does Customer Care Premium include?", a: "15-minute P1 response 24×7, a Technical Account Manager (TAM), training credits and proactive reviews." },
    { q: "How does Google Cloud help with sustainability?", a: "Public per-region carbon data, carbon-aware workload placement guidance, and Google's matched 100% renewable energy commitment." },
  ],
  selfCheck: [
    {
      question: "What does a Cloud Billing budget do by default?",
      options: ["Hard-stops billing at the threshold", "Alerts when threshold reached", "Pauses all VMs", "Migrates workloads to a cheaper region"],
      correctIndex: 1,
      explanation: "Budgets alert by default. Enforcement requires Pub/Sub + automation.",
    },
    {
      question: "Order of the Google Cloud resource hierarchy?",
      options: ["Project → Folder → Org", "Org → Folder → Project → Resource", "Resource → Project → Org", "Folder → Org → Project"],
      correctIndex: 1,
      explanation: "Organization at the top, then Folder, Project, Resource — IAM and policy inherit down.",
    },
  ],
  examTips: [
    "Surprise-bill prevention → quotas + budgets + billing reports.",
    "Order of hierarchy → Organization → Folder → Project → Resource.",
    "Reliability practice → SRE (SLI / SLO / error budget).",
    "Mission-critical 24×7 with TAM → Premium support.",
    "Sustainability → carbon-free regions, Google's net-zero commitments.",
  ],
  furtherReading: [
    { label: "Cloud Billing best practices", url: "https://cloud.google.com/billing/docs/onboarding-checklist" },
    { label: "Google SRE book", url: "https://sre.google/books/" },
    { label: "Google Cloud sustainability", url: "https://cloud.google.com/sustainability" },
  ],
};

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */
const all: Record<string, ModuleExplanation> = {
  "cdl-tool-tour": toolTour,
  "cdl-digital-transformation": m1,
  "cdl-data-transformation": m2,
  "cdl-ai-ml": m3,
  "cdl-modernize-infra": m4,
  "cdl-trust-security": m5,
  "cdl-scaling-operations": m6,
};

export function getCdlModuleExplanation(slug: string): ModuleExplanation | undefined {
  return all[slug];
}
