/**
 * Action matcher — same semantics as SplunkEsSimulator's internal `matches()`, extended for Academy labs:
 * select values containing "=" (e.g. "ws-eng-04=compromised") must match exactly (case-insensitive).
 */
import type { ExpectedAction } from "../types";

export interface EmittedAction { action: string; view?: string; value?: string }

export function actionMatches(emitted: EmittedAction, expected: ExpectedAction | undefined): boolean {
  if (!expected) return false;
  if (expected.type === "any") return true;
  if (expected.type === "navigate" && expected.to)
    return emitted.action === "navigate" && (emitted.view ?? "").toLowerCase() === String(expected.to).toLowerCase();
  if (expected.type === "click" && expected.target)
    return emitted.action.toLowerCase() === `click:${expected.target}`.toLowerCase();
  if (expected.type === "select" && expected.target) {
    if (emitted.action.toLowerCase() !== `select:${expected.target}`.toLowerCase()) return false;
    if (!expected.value) return true;
    const got = (emitted.value ?? "").toLowerCase().trim();
    const want = String(expected.value).toLowerCase().trim();
    return want.includes("=") ? got === want : got.includes(want);
  }
  if (expected.type === "run-spl" || expected.type === "run-query") {
    if (emitted.action !== "run-spl") return false;
    const v = (emitted.value ?? "").toLowerCase();
    if (expected.contains) return v.includes(String(expected.contains).toLowerCase());
    if (expected.equals) return v.trim() === String(expected.equals).toLowerCase().trim();
    return true;
  }
  return false;
}

/** Plain-language description of what an objective wants (used by mentor review + hint level 5 fallback). */
export function describeExpected(a: ExpectedAction): string {
  if (a.type === "navigate") return `open the ${String(a.to).replace(/-/g, " ")} view`;
  if (a.type === "click") return `use "${String(a.target).replace(/[:-]/g, " ")}"`;
  if (a.type === "select") return `set ${String(a.target).replace(/-/g, " ")}${a.value ? ` to ${a.value}` : ""}`;
  if (a.type === "run-spl") return `run a search${a.contains ? ` containing ${a.contains}` : ""}`;
  return "explore freely";
}
