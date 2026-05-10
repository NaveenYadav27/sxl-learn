import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface Props {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  actions?: ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  chips = [],
  actions,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-[hsl(var(--ops-border))] px-3 py-2 bg-[hsl(var(--ops-panel))]", className)}>
      {onSearchChange && (
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--ops-muted-fg))]" />
          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 pl-7 text-[12px] bg-[hsl(var(--ops-panel-2))] border-[hsl(var(--ops-border))] text-[hsl(var(--ops-fg))] placeholder:text-[hsl(var(--ops-muted-fg))]"
          />
        </div>
      )}
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 py-1 text-[11px] text-[hsl(var(--ops-fg))]"
        >
          <span className="text-[hsl(var(--ops-muted-fg))]">{c.label}:</span>
          <span className="font-medium">{c.value}</span>
          <button onClick={c.onRemove} className="ml-1 text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </div>
  );
}
