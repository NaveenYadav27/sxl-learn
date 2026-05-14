import { getModuleExplanation } from "@/lib/moduleExplanations";
import { getItsmModuleExplanation } from "@/lib/moduleExplanationsItsm";
import { getPen200ModuleExplanation } from "@/lib/moduleExplanationsPen200";
import { getCsaModuleExplanation } from "@/lib/moduleExplanationsCsa";
import { getK8sModuleExplanation } from "@/lib/moduleExplanationsK8s";
import { getCdlModuleExplanation } from "@/lib/moduleExplanationsCdl";
import { getCcnaModuleExplanation } from "@/lib/moduleExplanationsCcna";
import { getSplunkesModuleExplanation } from "@/lib/moduleExplanationsSplunkes";
import type { ModuleExplanation } from "@/lib/moduleExplanations";

const getters = [
  getModuleExplanation,
  getItsmModuleExplanation,
  getPen200ModuleExplanation,
  getCsaModuleExplanation,
  getK8sModuleExplanation,
  getCdlModuleExplanation,
  getCcnaModuleExplanation,
  getSplunkesModuleExplanation,
];

export function getAnyModuleExplanation(slug: string): ModuleExplanation | undefined {
  for (const g of getters) {
    const found = g?.(slug);
    if (found) return found;
  }
  return undefined;
}
