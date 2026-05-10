import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumb, actions, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-2 border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-6 py-4", className)}>
      {breadcrumb && <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{breadcrumb}</div>}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold leading-tight text-[hsl(var(--ops-fg))]">{title}</h1>
          {description && <p className="mt-0.5 text-[12px] text-[hsl(var(--ops-muted-fg))]">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
