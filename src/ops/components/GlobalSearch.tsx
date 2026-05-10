import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_GROUPS } from "../layout/navConfig";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => setTick((t) => t + 1), [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search modules, records, dashboards..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {NAV_GROUPS.map((g) => (
          <CommandGroup key={g.label} heading={g.label}>
            {g.items.map((it) => (
              <CommandItem
                key={it.to}
                disabled={!it.enabled}
                onSelect={() => {
                  if (it.enabled) {
                    navigate(it.to);
                    onOpenChange(false);
                  }
                }}
              >
                <it.icon className="mr-2 h-4 w-4" />
                <span>{it.label}</span>
                {!it.enabled && <span className="ml-auto text-[10px] uppercase tracking-wide opacity-60">soon</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
