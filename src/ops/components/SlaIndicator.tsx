import { cn } from "@/lib/utils";

interface Props {
  /** 0-100. >100 means breached. */
  percent: number;
  label?: string;
  className?: string;
}

export function SlaIndicator({ percent, label, className }: Props) {
  const clamped = Math.max(0, Math.min(percent, 120));
  const breached = percent >= 100;
  const warn = percent >= 75;
  const color = breached
    ? "bg-[hsl(var(--ops-critical))]"
    : warn
      ? "bg-[hsl(var(--ops-warning))]"
      : "bg-[hsl(var(--ops-success))]";
  return (
    <div className={cn("flex items-center gap-2 min-w-[120px]", className)}>
      <div className="h-1.5 flex-1 rounded-full bg-[hsl(var(--ops-panel-2))] overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${Math.min(clamped, 100)}%` }} />
      </div>
      <span className={cn("text-[11px] tabular-nums", breached ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-muted-fg))]")}>
        {label ?? `${Math.round(percent)}%`}
      </span>
    </div>
  );
}
