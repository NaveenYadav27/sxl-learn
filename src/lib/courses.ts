// Multi-course registry. Adding a new course = add an entry here + a curriculum file.
// All UI surfaces (Sidebar, Catalog, Dashboard, Module, Exam, Licensing) read from
// this registry so they stay in sync.

import type { LucideIcon } from "lucide-react";
import { Shield, Wrench } from "lucide-react";
import { fiveDayPlan as sc900FiveDay, twoDayPlan as sc900TwoDay, oneDayPlan as sc900OneDay, moduleNotes as sc900Modules, type DayPlan, type ModuleNote } from "./curriculum";
import { itsmFiveDayPlan, itsmTwoDayPlan, itsmOneDayPlan, itsmOneHourPlan, itsmModuleNotes } from "./curriculumItsm";

export type CourseCode = "sc-900" | "cis-itsm";

export type CourseDefinition = {
  code: CourseCode;
  shortName: string;          // e.g. "SC-900"
  longName: string;           // e.g. "Security, Compliance & Identity Fundamentals"
  vendor: string;             // "Microsoft" | "ServiceNow"
  certCode: string;           // exam code shown in chips
  tagline: string;
  icon: LucideIcon;
  accentClass: string;        // tailwind text class for chips
  modules: ModuleNote[];
  plans: { fiveDay: DayPlan[]; twoDay: DayPlan[]; oneDay: DayPlan[]; oneHour?: DayPlan[] };
  examTitle: string;          // "SC-900 Practice Exam"
  examIntroBullets: string[]; // shown on the exam intro card
  licensingFocus: string;     // banner copy on /licensing
};

export const COURSES: Record<CourseCode, CourseDefinition> = {
  "sc-900": {
    code: "sc-900",
    shortName: "SC-900",
    longName: "Security, Compliance & Identity Fundamentals",
    vendor: "Microsoft",
    certCode: "SC-900",
    tagline: "Microsoft Security, Compliance & Identity Fundamentals.",
    icon: Shield,
    accentClass: "text-domain-security",
    modules: sc900Modules,
    plans: { fiveDay: sc900FiveDay, twoDay: sc900TwoDay, oneDay: sc900OneDay },
    examTitle: "SC-900 Practice Exam",
    examIntroBullets: [
      "Questions drawn randomly from across all SC-900 modules.",
      "You can flag questions and revisit before submitting.",
      "Auto-submits when the timer reaches zero.",
      "Detailed review with per-module score and explanations on submit.",
    ],
    licensingFocus: "What you need to access the real Microsoft security and compliance portals for SC-900 hands-on practice.",
  },
  "cis-itsm": {
    code: "cis-itsm",
    shortName: "CIS-ITSM",
    longName: "Certified Implementation Specialist — IT Service Management",
    vendor: "ServiceNow",
    certCode: "CIS-ITSM",
    tagline: "ServiceNow Certified Implementation Specialist — IT Service Management.",
    icon: Wrench,
    accentClass: "text-domain-entra",
    modules: itsmModuleNotes,
    plans: { fiveDay: itsmFiveDayPlan, twoDay: itsmTwoDayPlan, oneDay: itsmOneDayPlan, oneHour: itsmOneHourPlan },
    examTitle: "CIS-ITSM Practice Exam",
    examIntroBullets: [
      "Scenario-based questions across Incident, Problem, Change, Request, CMDB & Knowledge.",
      "You can flag questions and revisit before submitting.",
      "Auto-submits when the timer reaches zero.",
      "Detailed review with per-process score and rationale on submit.",
    ],
    licensingFocus: "What you need to access a real ServiceNow instance for CIS-ITSM hands-on practice.",
  },
};

export const COURSE_LIST: CourseDefinition[] = Object.values(COURSES);

export const DEFAULT_COURSE: CourseCode = "sc-900";

export function getCourse(code: CourseCode): CourseDefinition {
  return COURSES[code] ?? COURSES[DEFAULT_COURSE];
}
