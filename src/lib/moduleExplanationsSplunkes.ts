// Splunk ES module explanations — currently no rich explanations authored.
// Module page falls back to topic + lab list view (see Module.tsx fallback).

import type { ModuleExplanation } from "./moduleExplanations";

const explanations: ModuleExplanation[] = [];

export function getSplunkesModuleExplanation(slug: string): ModuleExplanation | undefined {
  return explanations.find((e) => e.moduleSlug === slug);
}
