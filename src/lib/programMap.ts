// Map between course codes (used in UI/curriculum) and program codes (DB enum).
// program_code enum in DB: 'soc' | 'itsm' | 'pen200' | 'csa' | 'k8s'

import type { CourseCode } from "./courses";

export type ProgramCode = "soc" | "itsm" | "pen200" | "csa" | "k8s";

export const courseCodeToProgram: Record<CourseCode, ProgramCode> = {
  "sc-900": "soc",
  "cis-itsm": "itsm",
  "pen-200": "pen200",
  "csa": "csa",
  "k8s": "k8s",
};

export const programToCourseCode: Record<ProgramCode, CourseCode> = {
  soc: "sc-900",
  itsm: "cis-itsm",
  pen200: "pen-200",
  csa: "csa",
  k8s: "k8s",
};

export const programLabels: Record<ProgramCode, string> = {
  soc: "SOC Analyst (SC-900)",
  itsm: "ITSM / ServiceNow",
  pen200: "PEN-200 / OSCP+",
  csa: "Certified SOC Analyst (CSA)",
  k8s: "Kubernetes & Docker",
};

export const programMarketingPath: Record<ProgramCode, string> = {
  soc: "/soc",
  itsm: "/itsm",
  pen200: "/pen200",
  csa: "/csa",
  k8s: "/k8s",
};

// First module slug per program — used for free-preview gating.
// Module 1 is open to everyone with an account; the rest require program_access.
export const firstModuleByProgram: Record<ProgramCode, string> = {
  soc: "concepts",
  itsm: "concepts",
  pen200: "pen200-intro-cyber",
  csa: "csa-soc-fundamentals",
  k8s: "k8s-containerization-fundamentals",
};

export function getProgramForModuleSlug(slug: string): ProgramCode | null {
  if (slug.startsWith("k8s-")) return "k8s";
  if (slug.startsWith("csa-")) return "csa";
  if (slug.startsWith("pen200-")) return "pen200";
  if (slug.startsWith("itsm-")) return "itsm";
  if (["concepts", "iam", "entra", "security", "compliance"].includes(slug)) {
    // SC-900 + ITSM share these slugs; default to soc.
    return "soc";
  }
  return null;
}

export function isFirstModule(program: ProgramCode, slug: string): boolean {
  return firstModuleByProgram[program] === slug;
}
