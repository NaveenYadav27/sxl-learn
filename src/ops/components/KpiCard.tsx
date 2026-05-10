import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface Props {
  label: string;
  value: ReactNode;
  delta?: number;            // signed percentage change
  deltaLabel?: string;
  trend?: ReactNode;         // optional sparkline slot
  hint?: string;
  className?: string;
  intent?: "default" | "critical" | "warning" | "success";
}

const intentBar: Record<NonNullable<Props["intent"]>, string> = {
  default:  "bg-[hsl(var(--ops-accent))]",
  critical: "bg-[hsl(var(--ops-critical))]",
  warning:  "bg-[hsl(var(--ops-warning))]",
  success:  "bg-[hsl(var(--ops-success))]",
};

export function KpiCard({ label, value, delta, deltaLabel, trend, hint, className, intent = "default" }: Props) {
  const dirIcon = delta == null ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const Icon = dirIcon;
  const deltaColor =
    delta == null
      ? "text-[hsl(var(--ops-muted-fg))]"
      : delta > 0
        ? "text-[hsl(var(--ops-success))]"
        : delta < 0
          ? "text-[hsl(var(--ops-critical))]"
          : "text-[hsl(var(--ops-muted-fg))]";

  return (
    <div className={cn("relative overflow-hidden rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-4 py-3", className)}>
      <span className={cn("absolute left-0 top-0 h-full w-[3px]", intentBar[intent])} />
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</p>
        {delta != null && (
          <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums", deltaColor)}>
            <Icon className="h-3 w-3" />
            {Math.abs(delta).toFixed(1)}%
            {deltaLabel && <span className="ml-1 text-[hsl(var(--ops-muted-fg))]">{deltaLabel}</span>}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold tabular-nums text-[hsl(var(--ops-fg))]">{value}</div>
        {trend && <div className="h-8 flex-1 max-w-[120px]">{trend}</div>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">{hint}</p>}
    </div>
  );
}
