import { describe, it, expect } from "vitest";
import { actionMatches } from "@/academy/engine/matcher";
import {
  emptyState,
  objectiveCredit,
  computeMastery,
  canComplete
} from "@/academy/engine/progress";
import { LESSONS } from "@/academy/data/lessons";
import { PASS_MARK } from "@/academy/engine/curriculum";

describe("Action Matcher - Simulator Contract", () => {
  it("matches navigation actions", () => {
    expect(actionMatches({ action: "navigate", view: "incident-review" }, { type: "navigate", to: "incident-review" })).toBe(true);
    expect(actionMatches({ action: "navigate", view: "security-posture" }, { type: "navigate", to: "incident-review" })).toBe(false);
  });

  it("matches click actions", () => {
    expect(actionMatches({ action: "click:assign-to-me" }, { type: "click", target: "assign-to-me" })).toBe(true);
    expect(actionMatches({ action: "click:resolve-notable" }, { type: "click", target: "assign-to-me" })).toBe(false);
  });

  it("matches select actions with exact equals comparison", () => {
    expect(actionMatches({ action: "select:triage", value: "al-1=critical" }, { type: "select", target: "triage", value: "al-1=critical" })).toBe(true);
    expect(actionMatches({ action: "select:triage", value: "al-1=low" }, { type: "select", target: "triage", value: "al-1=critical" })).toBe(false);
  });

  it("matches run-spl actions containing required substrings", () => {
    expect(actionMatches({ action: "run-spl", value: "index=auth EventCode=4625 | stats count" }, { type: "run-spl", contains: "stats count" })).toBe(true);
    expect(actionMatches({ action: "run-spl", value: "index=firewall action=blocked" }, { type: "run-spl", contains: "EventCode=4625" })).toBe(false);
  });
});

describe("Academy Progress & Readiness Engine", () => {
  it("initializes clean empty state", () => {
    const s = emptyState();
    expect(s.version).toBe(1);
    expect(s.lessons).toEqual({});
    expect(s.dictionaryViewed).toEqual([]);
    expect(s.mentorQuestions).toBe(0);
  });

  it("applies penalty for progressive hint level without dropping below 25%", () => {
    expect(objectiveCredit(0)).toBe(1.0);
    expect(objectiveCredit(1)).toBe(0.85);
    expect(objectiveCredit(2)).toBe(0.70);
    expect(objectiveCredit(3)).toBe(0.55);
    expect(objectiveCredit(4)).toBe(0.40);
    expect(objectiveCredit(5)).toBe(0.25);
    expect(objectiveCredit(10)).toBe(0.25);
  });

  it("computes mastery across 10 skills for all 10 lessons", () => {
    const s = emptyState();
    const mastery = computeMastery(LESSONS, s);
    expect(mastery.skills.length).toBe(10);
    expect(mastery.readiness).toBe(0);
    expect(mastery.skills.every((sk) => sk.possible > 0)).toBe(true);
  });

  it("validates pass mark threshold is 70%", () => {
    expect(PASS_MARK).toBe(70);
  });
});
