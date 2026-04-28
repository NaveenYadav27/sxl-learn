// Multi-course registry. Adding a new course = add an entry here + a curriculum file.
// All UI surfaces (Sidebar, Catalog, Dashboard, Module, Exam, Licensing) read from
// this registry so they stay in sync.

import type { LucideIcon } from "lucide-react";
import { Shield, Wrench, Crosshair, Radar } from "lucide-react";
import { fiveDayPlan as sc900FiveDay, twoDayPlan as sc900TwoDay, oneDayPlan as sc900OneDay, oneHourPlan as sc900OneHour, moduleNotes as sc900Modules, type DayPlan, type ModuleNote } from "./curriculum";
import { itsmFiveDayPlan, itsmTwoDayPlan, itsmOneDayPlan, itsmOneHourPlan, itsmModuleNotes } from "./curriculumItsm";
import { pen200ModuleNotes, pen200FiveDayPlan, pen200TwoDayPlan, pen200OneDayPlan, pen200OneHourPlan } from "./curriculumPen200";
import { csaModuleNotes, csaFiveDayPlan, csaTwoDayPlan, csaOneDayPlan, csaOneHourPlan } from "./curriculumCsa";

export type CourseCode = "sc-900" | "cis-itsm" | "pen-200" | "csa";

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
    plans: { fiveDay: sc900FiveDay, twoDay: sc900TwoDay, oneDay: sc900OneDay, oneHour: sc900OneHour },
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
  "pen-200": {
    code: "pen-200",
    shortName: "PEN-200",
    longName: "Penetration Testing with Kali Linux — OSCP+",
    vendor: "OffSec",
    certCode: "OSCP+",
    tagline: "Offensive Security Penetration Testing with Kali Linux (OSCP+).",
    icon: Crosshair,
    accentClass: "text-domain-security",
    modules: pen200ModuleNotes,
    plans: { fiveDay: pen200FiveDayPlan, twoDay: pen200TwoDayPlan, oneDay: pen200OneDayPlan, oneHour: pen200OneHourPlan },
    examTitle: "OSCP+ Practice Exam",
    examIntroBullets: [
      "Hands-on offensive security curriculum — practice exam coming soon.",
      "Visit the PEN-200 program page for the full module map and enrollment.",
    ],
    licensingFocus: "What you need to spin up your own pentest lab environment for PEN-200 / OSCP+ practice.",
  },
  "csa": {
    code: "csa",
    shortName: "CSA",
    longName: "Certified SOC Analyst — Defender XDR & Sentinel",
    vendor: "EC-Council / Microsoft",
    certCode: "CSA",
    tagline: "Certified SOC Analyst — hybrid EC-Council CSA + Microsoft SC-200 track.",
    icon: Radar,
    accentClass: "text-domain-security",
    modules: csaModuleNotes,
    plans: { fiveDay: csaFiveDayPlan, twoDay: csaTwoDayPlan, oneDay: csaOneDayPlan, oneHour: csaOneHourPlan },
    examTitle: "CSA Practice Exam",
    examIntroBullets: [
      "Scenario-based questions across SOC ops, SIEM, KQL, Defender XDR and IR playbooks.",
      "You can flag questions and revisit before submitting.",
      "Auto-submits when the timer reaches zero.",
      "Detailed review with per-module score and rationale on submit.",
    ],
    licensingFocus: "What you need to access Microsoft Sentinel, Defender XDR and Entra for CSA hands-on practice.",
  },
};

export const COURSE_LIST: CourseDefinition[] = Object.values(COURSES);

export const DEFAULT_COURSE: CourseCode = "sc-900";

export function getCourse(code: CourseCode): CourseDefinition {
  return COURSES[code] ?? COURSES[DEFAULT_COURSE];
}
