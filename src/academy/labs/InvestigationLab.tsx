import { useState } from "react";
import { useLessonRuntime } from "../components/runtime";
import { MentorPanel } from "../components/MentorPanel";
import { InvestigationWorkspace, emptyCase, type CaseState } from "./InvestigationWorkspace";

export function InvestigationLab() {
  const rt = useLessonRuntime();
  const [c, setC] = useState<CaseState>(emptyCase);
  if (!rt.scenario) return null;
  return <InvestigationWorkspace scenario={rt.scenario} emit={rt.emit} mistake={rt.mistake} caseState={c} setCase={setC} mentorSlot={<MentorPanel />} />;
}
