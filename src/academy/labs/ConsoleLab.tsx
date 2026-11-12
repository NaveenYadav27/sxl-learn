import { SplunkEsSimulator } from "@/components/simulators/SplunkEsSimulator";
import { useLessonRuntime } from "../components/runtime";
import { TriageBoard } from "./TriageBoard";

const NO_EXPECTATION = { type: "academy" };

/** Drives the existing educational Splunk ES-style simulator with the lesson's scenario. */
export function ConsoleLab() {
  const rt = useLessonRuntime();
  const alerts = rt.lesson.lab.triageAlerts;
  return (
    <div className="space-y-4">
      <SplunkEsSimulator
        expectedAction={NO_EXPECTATION}
        onValidate={() => { /* objectives are matched by the Academy runtime */ }}
        onAction={(e) => rt.emit(e)}
        scenario={rt.scenario}
        showObjectiveHint={false}
        initialView="security-posture"
      />
      {alerts && alerts.length > 0 && <TriageBoard alerts={alerts} />}
    </div>
  );
}
