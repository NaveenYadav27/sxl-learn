import { useContext } from "react";
import { AcademyCtxExport } from "./progress";

/** Like useAcademy() but returns null outside the provider (for components reused elsewhere). */
export function useAcademyOptional() {
  return useContext(AcademyCtxExport);
}
