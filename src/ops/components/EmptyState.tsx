import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, hint, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-12", className)}>
      <div className="mb-3 rounded-md bg-[hsl(var(--ops-panel-2))] p-3 text-[hsl(var(--ops-muted-fg))]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-[hsl(var(--ops-fg))]">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-[12px] text-[hsl(var(--ops-muted-fg))]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
