import type { Scenario, ScenarioId, SimEvent } from "../../types";
import { BRUTE_FORCE } from "./bruteForce";
import { PHISH_POWERSHELL } from "./phishPowershell";
import { C2_BEACON } from "./c2Beacon";
import { DNS_TUNNEL } from "./dnsTunnel";
import { PRIV_ESC } from "./privEsc";
import { LATERAL_MOVE } from "./lateralMove";
import { RANSOMWARE } from "./ransomware";
import { INSIDER_EXFIL } from "./insiderExfil";
import { CAPSTONE_APT } from "./capstoneApt";

export const SCENARIOS: Scenario[] = [
  BRUTE_FORCE, PHISH_POWERSHELL, C2_BEACON, DNS_TUNNEL, PRIV_ESC,
  LATERAL_MOVE, RANSOMWARE, INSIDER_EXFIL, CAPSTONE_APT,
];

export const SCENARIOS_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s])) as Record<ScenarioId, Scenario>;

export function getScenario(id: ScenarioId | undefined): Scenario | undefined {
  return id ? SCENARIOS_BY_ID[id] : undefined;
}

export function eventById(s: Scenario, id: string): SimEvent | undefined {
  return s.events.find((e) => e.id === id);
}

/** Risk events grouped per risk object, summed — what ES Risk Analysis shows. */
export function riskRollup(s: Scenario) {
  const map = new Map<string, { object: string; objectType: "user" | "system"; score: number; rules: Set<string>; techniques: Set<string>; eventIds: string[] }>();
  for (const e of s.events) {
    if (!e.risk) continue;
    const cur = map.get(e.risk.object) ?? { object: e.risk.object, objectType: e.risk.objectType, score: 0, rules: new Set(), techniques: new Set(), eventIds: [] };
    cur.score += e.risk.score;
    cur.rules.add(e.risk.rule);
    (e.mitre ?? []).forEach((t) => cur.techniques.add(t));
    cur.eventIds.push(e.id);
    map.set(e.risk.object, cur);
  }
  return [...map.values()]
    .map((r) => ({ object: r.object, objectType: r.objectType, score: r.score, sources: r.rules.size, rules: [...r.rules], techniques: [...r.techniques], eventIds: r.eventIds }))
    .sort((a, b) => b.score - a.score);
}

export { BRUTE_FORCE, PHISH_POWERSHELL, C2_BEACON, DNS_TUNNEL, PRIV_ESC, LATERAL_MOVE, RANSOMWARE, INSIDER_EXFIL, CAPSTONE_APT };
