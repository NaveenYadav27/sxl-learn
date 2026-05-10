import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "./EmptyState";
import { Bell } from "lucide-react";

export function NotificationCenter({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))] text-[hsl(var(--ops-fg))]">
        <SheetHeader>
          <SheetTitle className="text-[14px] text-[hsl(var(--ops-fg))]">Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            hint="Operational alerts, assignments, and SLA warnings will appear here."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
