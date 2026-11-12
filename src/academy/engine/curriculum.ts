/** Curriculum helpers: derived objectives (incl. SPL exercises) and skill catalogue. */
import type { Lesson, LabObjective, ReadinessKey } from "../types";

export const SKILLS: { key: ReadinessKey; label: string; blurb: string }[] = [
  { key: "foundations", label: "Foundations", blurb: "SOC roles, tools and vocabulary" },
  { key: "logs", label: "Logs", blurb: "Reading raw events and fields" },
  { key: "spl", label: "SPL", blurb: "Searching, filtering and aggregating" },
  { key: "detection", label: "Detection", blurb: "Correlation searches and thresholds" },
  { key: "triage", label: "Triage", blurb: "Prioritising and dispositioning alerts" },
  { key: "investigation", label: "Investigation", blurb: "Pivoting, evidence and timelines" },
  { key: "risk", label: "Risk", blurb: "Risk-based alerting" },
  { key: "intel", label: "Threat Intel", blurb: "IOCs, feeds and confidence" },
  { key: "mitre", label: "MITRE ATT&CK", blurb: "Mapping behaviour to tactics and techniques" },
  { key: "response", label: "Incident Response", blurb: "Containment, eradication, recovery" },
];

export const SKILL_LABEL = Object.fromEntries(SKILLS.map((s) => [s.key, s.label])) as Record<ReadinessKey, string>;

/** All gradeable objectives of a lesson: explicit lab objectives + one per SPL exercise. */
export function lessonObjectives(lesson: Lesson): LabObjective[] {
  const own = lesson.lab.objectives;
  const ex = (lesson.lab.splExercises ?? [])
    .filter((x) => !own.some((o) => o.id === x.id))
    .map<LabObjective>((x) => {
      const hints = [...x.hints];
      while (hints.length < 4) hints.push(`Look at the example search in the task description and adapt it.`);
      if (hints.length < 5) hints.push(`One working answer: ${x.solution}`);
      return {
        id: x.id, title: x.title, instruction: x.task,
        action: { type: "click", target: `spl-exercise-pass:${x.id}` },
        hints: hints.slice(0, 5), why: x.explanation, skill: lesson.number === 3 ? "spl" : lesson.number === 4 ? "detection" : "spl",
      };
    });
  return [...own, ...ex];
}

export const PASS_MARK = 70;
