import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (k: string) => void;
  className?: string;
}

export function OpsTabs({ tabs, active, onChange, className }: Props) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-[hsl(var(--ops-border))] px-3", className)}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative px-3 py-2 text-[12px] font-medium transition-colors",
              isActive ? "text-[hsl(var(--ops-fg))]" : "text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]",
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {t.count != null && (
                <span className="rounded-sm bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] tabular-nums text-[hsl(var(--ops-muted-fg))]">
                  {t.count}
                </span>
              )}
            </span>
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[hsl(var(--ops-accent))]" />}
          </button>
        );
      })}
    </div>
  );
}
