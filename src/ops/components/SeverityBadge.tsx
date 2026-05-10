import { cn } from "@/lib/utils";
import { SEVERITY_TOKEN } from "../lib/statuses";
import type { Severity } from "../lib/types";

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const t = SEVERITY_TOKEN[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        t.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}
