// Live strip on the Ops Dashboard that surfaces simulated incidents fired
// from the lab simulators (e.g. "image build failed" from Module 2 Lab 2).

import { useEffect, useState } from "react";
import { Sparkles, FlaskConical, X } from "lucide-react";
import { SectionCard } from "./SectionCard";
import {
  readLearnerOpsEvents,
  subscribeLearnerOpsEvents,
  type LearnerOpsEvent,
} from "../lib/learnerEvents";

export function LearnerOpsStrip() {
  const [events, setEvents] = useState<LearnerOpsEvent[]>([]);

  useEffect(() => {
    setEvents(readLearnerOpsEvents());
    return subscribeLearnerOpsEvents(() => setEvents(readLearnerOpsEvents()));
  }, []);

  // Collapse open/close pairs so a "resolved" incident is shown crossed out.
  const seen = new Map<string, LearnerOpsEvent[]>();
  for (const e of events) {
    if (!e.incidentId) continue;
    const arr = seen.get(e.incidentId) ?? [];
    arr.push(e);
    seen.set(e.incidentId, arr);
  }
  const rows = Array.from(seen.values()).map((arr) => {
    const open = arr.find((x) => x.kind === "incident_open");
    const closed = arr.find((x) => x.kind === "incident_close");
    return { open, closed, latest: arr[0] };
  });

  if (!rows.length) return null;

  return (
    <div className="px-4 pb-3">
      <SectionCard
        title="Lab-driven incidents"
        description="Synthetic events injected from your hands-on labs — they flow through the real ITSM pipeline."
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-[hsl(var(--ops-border))]">
          {rows.map((r) => {
            const e = r.open ?? r.latest;
            const closed = !!r.closed;
            return (
              <li
                key={e.incidentId}
                className="flex items-center justify-between gap-3 px-4 py-2 text-[12px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {closed ? (
                    <X className="h-3.5 w-3.5 text-[hsl(var(--ops-muted-fg))] shrink-0" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))] shrink-0" />
                  )}
                  <span
                    className={`font-mono text-[11px] ${
                      closed ? "line-through text-[hsl(var(--ops-muted-fg))]" : "text-[hsl(var(--ops-accent))]"
                    }`}
                  >
                    {e.incidentId}
                  </span>
                  <span className={closed ? "text-[hsl(var(--ops-muted-fg))] line-through truncate" : "truncate"}>
                    {e.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.severity && !closed && (
                    <span className="rounded-sm border border-[hsl(var(--ops-border))] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--ops-fg))]">
                      {e.severity}
                    </span>
                  )}
                  {e.source && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--ops-muted-fg))]">
                      <FlaskConical className="h-2.5 w-2.5" /> {e.source.replace("lab:", "")}
                    </span>
                  )}
                  <span
                    className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      closed
                        ? "border-[hsl(var(--ops-border))] text-[hsl(var(--ops-muted-fg))]"
                        : "border-warning/40 bg-warning/10 text-warning"
                    }`}
                  >
                    {closed ? "resolved" : "open"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}

export default LearnerOpsStrip;
