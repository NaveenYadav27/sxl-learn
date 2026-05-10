import { cn } from "@/lib/utils";
import type { Assignee } from "../lib/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AssigneeChip({ assignee, className }: { assignee?: Assignee | null; className?: string }) {
  if (!assignee) {
    return <span className={cn("text-[12px] italic text-[hsl(var(--ops-muted-fg))]", className)}>Unassigned</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-[12px] text-[hsl(var(--ops-fg))]", className)}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--ops-accent)/0.2)] text-[10px] font-semibold text-[hsl(var(--ops-accent))]">
        {initials(assignee.name)}
      </span>
      <span className="leading-tight">
        {assignee.name}
        {assignee.group && <span className="ml-1 text-[hsl(var(--ops-muted-fg))]">· {assignee.group}</span>}
      </span>
    </span>
  );
}
