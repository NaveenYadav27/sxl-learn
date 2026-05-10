import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, description, actions, children, className, bodyClassName }: Props) {
  return (
    <section
      className={cn(
        "rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] shadow-[0_1px_2px_hsl(0_0%_0%/0.3)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
          <div>
            {title && <h2 className="text-[13px] font-semibold text-[hsl(var(--ops-fg))]">{title}</h2>}
            {description && <p className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}
