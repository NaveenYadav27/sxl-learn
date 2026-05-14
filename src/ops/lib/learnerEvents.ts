// Lightweight learner-event bus that the Ops Console dashboard subscribes to.
// When a lab triggers a simulated incident (e.g. image build failure), we push
// a fake incident card into localStorage and dispatch a window event so any
// open Ops dashboard tab reflects the change without a backend round-trip.

export type LearnerOpsEvent = {
  id: string;
  ts: number;        // epoch ms
  kind: "incident_open" | "incident_close" | "alert_open" | "alert_close";
  incidentId?: string;
  title: string;
  service?: string;
  severity?: "low" | "medium" | "high" | "critical";
  source?: string;   // e.g. "lab:k8s-build-tag-image"
};

const KEY = "shadowx.ops.learner_events";
const EVENT = "shadowx:ops:learner_event";

export function readLearnerOpsEvents(): LearnerOpsEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LearnerOpsEvent[]) : [];
  } catch {
    return [];
  }
}

export function emitLearnerOpsEvent(e: Omit<LearnerOpsEvent, "id" | "ts">) {
  const full: LearnerOpsEvent = {
    ...e,
    id: `LRN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    ts: Date.now(),
  };
  const all = readLearnerOpsEvents();
  all.unshift(full);
  // keep last 50
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: full }));
  return full;
}

export function subscribeLearnerOpsEvents(handler: (e: LearnerOpsEvent) => void) {
  const fn = (ev: Event) => {
    const ce = ev as CustomEvent<LearnerOpsEvent>;
    if (ce.detail) handler(ce.detail);
  };
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

/** Convenience helpers used by the Docker labs ----------------------------- */
export function emitImageBuildFailure(labSlug: string) {
  return emitLearnerOpsEvent({
    kind: "incident_open",
    incidentId: "INC001024",
    title: "Container Build Failed — payments-api image rejected",
    service: "payments-api",
    severity: "high",
    source: `lab:${labSlug}`,
  });
}
export function emitImageBuildResolved(labSlug: string) {
  return emitLearnerOpsEvent({
    kind: "incident_close",
    incidentId: "INC001024",
    title: "Container Build Failed — resolved",
    service: "payments-api",
    severity: "high",
    source: `lab:${labSlug}`,
  });
}
