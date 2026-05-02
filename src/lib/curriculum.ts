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

/* ---------- 1-hour tool tour ---------- */
const sc900ToolTourModule: ModuleNote = {
  moduleSlug: "sc900-tool-tour",
  domain: "concepts",
  title: "Microsoft security tool tour — 5 essentials in 60 minutes",
  code: "SC900-T1",
  theoryMinutes: 10,
  labBudgetMinutes: 50,
  topics: [
    "1. Microsoft Entra — users, groups & sign-in logs",
    "2. Defender portal — incidents & alerts overview",
    "3. Microsoft Sentinel — workspace & dashboards",
    "4. Microsoft Purview — sensitivity labels in action",
    "5. Microsoft Secure Score — posture at a glance",
  ],
  labSlugs: [
    "create-users-groups",
    "defender-portal-explore",
    "sentinel-dashboards",
    "create-sensitivity-label",
    "secure-score-explore",
  ],
};

export const oneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Session",
    subtitle: "Microsoft security tool tour — 5 essentials in 1h",
    description:
      "Express 60-minute walkthrough of the five Microsoft security & compliance portals every SC-900 learner should recognise: Entra, Defender, Sentinel, Purview and Secure Score.",
    modules: [sc900ToolTourModule],
  },
];

export function findDayForModule(plan: DayPlan[], moduleSlug: string | null): DayPlan | undefined {
  return plan.find((d) => d.modules.some((x) => x.moduleSlug === moduleSlug));
}

/* ---------- 30-day / ~1h-per-day generator ---------- */
// Splits a course's modules across 30 daily ~60-minute cards. Days per module
// are proportional to the module's total minutes (theory + lab). Each day card
// references the parent module, with a slice of its topic list shown in the
// subtitle so learners see meaningful per-day themes.
//
// All UI surfaces that already render DayPlan[] (Catalog, SessionPlanDuration,
// program marketing pages) work unchanged — we just hand them 30 cards.
export function buildThirtyDayPlan(modules: ModuleNote[], totalDays = 30): DayPlan[] {
  if (modules.length === 0) return [];
  const weights = modules.map((m) => Math.max(1, m.theoryMinutes + m.labBudgetMinutes));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Largest-remainder allocation so day counts sum exactly to totalDays.
  const exact = weights.map((w) => (w / totalWeight) * totalDays);
  const floor = exact.map((x) => Math.max(1, Math.floor(x)));
  let allocated = floor.reduce((a, b) => a + b, 0);
  // adjust by adding/removing days from largest-remainder modules
  const remainders = exact.map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r);
  let ri = 0;
  while (allocated < totalDays) { floor[remainders[ri % remainders.length].i] += 1; allocated += 1; ri += 1; }
  while (allocated > totalDays) {
    // shrink the module with the most days (but never below 1)
    const idx = floor
      .map((d, i) => ({ d, i }))
      .filter((x) => x.d > 1)
      .sort((a, b) => b.d - a.d)[0]?.i;
    if (idx == null) break;
    floor[idx] -= 1; allocated -= 1;
  }

  const plan: DayPlan[] = [];
  let dayCount = 0;
  modules.forEach((mod, mi) => {
    const days = floor[mi];
    const minutesPerDay = Math.round((mod.theoryMinutes + mod.labBudgetMinutes) / Math.max(1, days));
    const topics = mod.topics.length > 0 ? mod.topics : [mod.title];
    // chunk topics evenly across days
    const chunkSize = Math.max(1, Math.ceil(topics.length / days));
    for (let d = 0; d < days; d += 1) {
      dayCount += 1;
      const slice = topics.slice(d * chunkSize, (d + 1) * chunkSize);
      const subtitle = slice.length > 0
        ? `${slice[0]}${slice.length > 1 ? ` (+${slice.length - 1} more)` : ""} (≈ ${minutesPerDay}m)`
        : `${mod.title} — focus session (≈ ${minutesPerDay}m)`;
      plan.push({
        id: `d${String(dayCount).padStart(2, "0")}`,
        label: `Day ${dayCount}`,
        subtitle,
        description: slice.length > 0
          ? slice.map((t) => `• ${t}`).join("\n")
          : `Continued deep-dive on ${mod.title}.`,
        modules: [mod],
      });
    }
  });
  return plan;
}

/* ---------- 30-day / 1h-per-day plan (auto-generated) ---------- */
export const thirtyDayPlan: DayPlan[] = buildThirtyDayPlan(moduleNotes);
