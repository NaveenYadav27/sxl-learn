// Authoritative SC-900 curriculum (TOC-aligned). Single source of truth used by
// both the day-wise Course Catalog and the Session Plan page.

export type DomainKey = "concepts" | "iam" | "entra" | "security" | "compliance" | "exam";

export type ModuleNote = {
  moduleSlug: string | null;
  domain: DomainKey;
  title: string;
  code?: string;            // e.g. SC900-M1
  theoryMinutes: number;
  labBudgetMinutes: number;  // scheduled lab time for the module (per official TOC)
  topics: string[];          // theory bullets from the TOC
  labSlugs: string[];        // ordered slugs that map to the labs table
};

export type DayPlan = {
  id: string;
  label: string;             // e.g. "Day 1"
  subtitle: string;
  description: string;
  modules: ModuleNote[];
};

/* ---------- Per-module notes (TOC §Topics + §Hands-on Labs) ---------- */
export const moduleNotes: ModuleNote[] = [
  {
    moduleSlug: "concepts",
    domain: "concepts",
    title: "Module 1 — Security Concepts",
    code: "SC900-M1",
    theoryMinutes: 45,
    labBudgetMinutes: 45,
    topics: [
      "Zero Trust principles (verify explicitly, least privilege, assume breach)",
      "Defense in Depth strategy",
      "CIA Triad — Confidentiality, Integrity, Availability",
      "Threats, vulnerabilities, and risk management",
      "Shared responsibility model in cloud security",
    ],
    labSlugs: ["secure-score-explore", "analyze-recommendations", "attack-simulation-overview"],
  },
  {
    moduleSlug: "iam",
    domain: "iam",
    title: "Module 2 — Identity & Access Management",
    code: "SC900-M2",
    theoryMinutes: 45,
    labBudgetMinutes: 75,
    topics: [
      "Authentication vs Authorization",
      "Multi-Factor Authentication (MFA)",
      "Role-Based Access Control (RBAC)",
      "Conditional Access policies",
      "Privileged Identity Management (PIM) overview",
    ],
    labSlugs: ["create-users-groups", "configure-rbac", "conditional-access", "enable-test-mfa"],
  },
  {
    moduleSlug: "entra",
    domain: "entra",
    title: "Module 3 — Microsoft Entra Capabilities",
    code: "SC900-M3",
    theoryMinutes: 30,
    labBudgetMinutes: 90,
    topics: [
      "Microsoft Entra ID architecture",
      "Hybrid identity concepts",
      "Identity protection",
      "Passwordless authentication",
      "B2B and B2C identity concepts",
    ],
    labSlugs: ["passwordless-auth", "identity-protection", "risky-signin-sim", "hybrid-identity", "live-tenant-harden-identities"],
  },
  {
    moduleSlug: "security",
    domain: "security",
    title: "Module 4 — Security Solutions in Microsoft",
    code: "SC900-M4",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "Microsoft Defender overview (XDR, MDE, MDO, MDCA)",
      "Microsoft Sentinel basics — SIEM + SOAR",
      "Cloud security posture management (CSPM)",
      "Endpoint protection concepts",
    ],
    labSlugs: ["defender-portal-explore", "investigate-alerts", "sentinel-dashboards", "analytic-rule-create", "live-defender-triage-phishing"],
  },
  {
    moduleSlug: "compliance",
    domain: "compliance",
    title: "Module 5 — Compliance & Governance",
    code: "SC900-M5",
    theoryMinutes: 30,
    labBudgetMinutes: 75,
    topics: [
      "Compliance management overview",
      "Microsoft Purview basics",
      "Data Loss Prevention (DLP) concepts",
      "Information protection & sensitivity labels",
      "eDiscovery and auditing basics",
    ],
    labSlugs: ["create-sensitivity-label", "configure-dlp", "compliance-score", "enable-audit-logging", "live-purview-classify-and-protect"],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Exam prep & practice discussion",
    theoryMinutes: 15,
    labBudgetMinutes: 15,
    topics: [
      "How SC-900 questions are framed (definitions, scenarios, capabilities)",
      "High-yield Microsoft terminology to memorise",
      "Time management — 60 minutes for ~50 questions",
    ],
    labSlugs: [], // links to /exam separately
  },
];

/* ---------- Day groupings ---------- */
// Helper to grab a module by slug (or the exam block).
const m = (slug: ModuleNote["moduleSlug"] | "exam") =>
  moduleNotes.find((x) => (slug === "exam" ? x.domain === "exam" : x.moduleSlug === slug))!;

// Default plan: 5 days × ~2 hours (one module per day, exam folded into Day 5).
// Matches the official SC-900 TOC time table (Theory + Lab per module).
export const fiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Security Concepts (1h 30m)",
    description: "Zero Trust, Defense in Depth, CIA triad, threats, and the shared responsibility model.",
    modules: [m("concepts")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Identity & Access Management (2h)",
    description: "Authentication vs authorization, MFA, RBAC, Conditional Access, and PIM.",
    modules: [m("iam")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "Microsoft Entra Capabilities (2h)",
    description: "Entra ID architecture, hybrid identity, identity protection, passwordless, B2B/B2C.",
    modules: [m("entra")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Security Solutions in Microsoft (1h 45m)",
    description: "Microsoft Defender XDR, Sentinel SIEM/SOAR, CSPM, endpoint protection.",
    modules: [m("security")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Compliance & Governance + Exam (2h 15m)",
    description: "Purview, DLP, sensitivity labels, eDiscovery — then SC-900 exam strategy.",
    modules: [m("compliance"), m("exam")],
  },
];

// Backwards-compatible alias (Catalog still imports `fourDayPlan`).
export const fourDayPlan = fiveDayPlan;

// 1-day intensive: everything sequential.
export const oneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Full SC-900 bootcamp (8h)",
    description: "Run the entire curriculum in a single guided 8-hour session.",
    modules: moduleNotes,
  },
];

// 2-day split: foundations on day 1, defence + compliance on day 2.
export const twoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Foundations & identity (4h)",
    description: "Core concepts, identity & access, and Entra capabilities.",
    modules: moduleNotes.filter((x) =>
      ["concepts", "iam", "entra"].includes(x.moduleSlug ?? ""),
    ),
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Defence, compliance & exam (4h)",
    description: "Security solutions, compliance & governance, and exam prep.",
    modules: moduleNotes.filter((x) =>
      ["security", "compliance"].includes(x.moduleSlug ?? "") || x.domain === "exam",
    ),
  },
];

export function findDayForModule(plan: DayPlan[], moduleSlug: string | null): DayPlan | undefined {
  return plan.find((d) => d.modules.some((x) => x.moduleSlug === moduleSlug));
}
