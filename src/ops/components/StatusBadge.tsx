import { cn } from "@/lib/utils";
import { STATUS_TOKEN } from "../lib/statuses";
import type { Status } from "../lib/types";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = STATUS_TOKEN[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        t.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {t.label}
    </span>
  );
}
