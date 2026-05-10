import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ActivityEvent {
  id: string;
  at: string;            // ISO or display string
  actor?: string;
  title: ReactNode;
  detail?: ReactNode;
  intent?: "default" | "info" | "warning" | "critical" | "success";
}

const dotColor: Record<NonNullable<ActivityEvent["intent"]>, string> = {
  default: "bg-[hsl(var(--ops-muted-fg))]",
  info: "bg-[hsl(var(--ops-info))]",
  warning: "bg-[hsl(var(--ops-warning))]",
  critical: "bg-[hsl(var(--ops-critical))]",
  success: "bg-[hsl(var(--ops-success))]",
};

export function ActivityTimeline({ events, className }: { events: ActivityEvent[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-3 pl-5", className)}>
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-[hsl(var(--ops-border))]" aria-hidden />
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className={cn("absolute -left-[17px] top-1.5 h-2 w-2 rounded-full ring-2 ring-[hsl(var(--ops-panel))]", dotColor[e.intent ?? "default"])} />
          <div className="text-[12px] text-[hsl(var(--ops-fg))]">{e.title}</div>
          {e.detail && <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{e.detail}</div>}
          <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
            {e.actor && <span>{e.actor} · </span>}
            {e.at}
          </div>
        </li>
      ))}
    </ol>
  );
}
