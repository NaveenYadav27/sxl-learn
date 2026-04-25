import { Check, ChevronsUpDown, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCourse } from "@/hooks/useCourse";
import { cn } from "@/lib/utils";

interface Props {
  collapsed?: boolean;
}

export function CourseSwitcher({ collapsed = false }: Props) {
  const { course, courses, setCourseCode } = useCourse();
  const [open, setOpen] = useState(false);
  const Icon = course.icon;

  if (collapsed) {
    return (
      <div
        className="mx-1 my-1 grid h-8 w-8 place-items-center rounded bg-sidebar-accent/50 text-sidebar-foreground"
        title={`${course.shortName} — ${course.longName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Switch course"
          className="mx-1 mt-1 h-auto w-[calc(100%-0.5rem)] justify-between gap-2 rounded-md bg-sidebar-accent/40 px-2 py-1.5 text-left text-sidebar-foreground hover:bg-sidebar-accent/70"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className={cn("grid h-7 w-7 place-items-center rounded bg-sidebar-background/80 shrink-0", course.accentClass)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[10px] uppercase tracking-wider opacity-70">Active course</span>
              <span className="block truncate text-xs font-semibold">{course.shortName}</span>
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-1" align="start">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <GraduationCap className="h-3 w-3" /> Choose a certification track
        </div>
        <div className="space-y-0.5">
          {courses.map((c) => {
            const CIcon = c.icon;
            const active = c.code === course.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setCourseCode(c.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  active ? "bg-primary/10 text-foreground" : "hover:bg-accent",
                )}
              >
                <span className={cn("grid h-8 w-8 place-items-center rounded bg-muted shrink-0", c.accentClass)}>
                  <CIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{c.shortName}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.vendor}</span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{c.longName}</span>
                </span>
                {active && <Check className="h-4 w-4 text-primary shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
