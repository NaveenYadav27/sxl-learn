import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function OpsModal({ open, onOpenChange, title, description, children, footer, size = "md" }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))] text-[hsl(var(--ops-fg))] p-0",
          sizeClass[size],
        )}
      >
        <DialogHeader className="border-b border-[hsl(var(--ops-border))] px-5 py-3">
          <DialogTitle className="text-[14px] font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-5 py-3">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
