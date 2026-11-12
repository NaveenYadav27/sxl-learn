import { CheckCircle2, Circle, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HINT_LABELS } from "../engine/mentor";
import { RichText } from "./RichText";
import { useLessonRuntime } from "./runtime";
import { useAcademy } from "../engine/progress";

/** Objective checklist + progressive 5-level hint ladder for the current objective. */
export function ObjectivesPanel() {
  const rt = useLessonRuntime();
  const academy = useAcademy();
  const total = rt.objectives.length;
  const pct = total ? Math.round((rt.done.length / total) * 100) : 0;
  const cur = rt.current;
  const level = rt.hintLevel();

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>Lab objectives</span><span className="font-mono text-muted-foreground">{rt.done.length}/{total}</span>
        </div>
        <Progress value={pct} className="mt-1.5 h-1.5" />
      </div>
      {cur && (
        <div className="space-y-2 border-b border-border bg-primary/5 px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Current objective · {rt.currentIndex + 1} of {total}</div>
          <div className="text-sm font-semibold">{cur.title}</div>
          <RichText text={cur.instruction} className="text-xs text-foreground/90" />
          {level > 0 && (
            <ol className="space-y-1.5">
              {cur.hints.slice(0, level).map((h, i) => (
                <li key={i} className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1.5 text-[11px]">
                  <span className="font-semibold">Hint {i + 1} · {HINT_LABELS[i]}:</span> <RichText text={h} />
                </li>
              ))}
            </ol>
          )}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" disabled={level >= 5} onClick={() => rt.revealHint()}>
              <Lightbulb className="h-3 w-3" /> {level === 0 ? "Hint" : level >= 5 ? "All hints shown" : `Next hint (${level + 1}/5)`}
            </Button>
            <span className="text-[10px] text-muted-foreground">Each hint lowers this objective's mastery credit.</span>
          </div>
        </div>
      )}
      {!cur && total > 0 && (
        <div className="border-b border-border bg-success/10 px-3 py-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Lab complete</div>
          <p className="mt-1 text-foreground/90">Every objective is done. Ask the mentor for a Review, then take the Assessment.</p>
        </div>
      )}
      <ol className="max-h-[280px] space-y-0.5 overflow-auto p-2">
        {rt.objectives.map((o, i) => {
          const isDone = rt.done.includes(o.id);
          const isCur = cur?.id === o.id;
          return (
            <li key={o.id} className={`flex items-start gap-2 rounded px-2 py-1.5 text-xs ${isCur ? "bg-primary/10" : ""}`}>
              {isDone ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              <span className={isDone ? "text-muted-foreground line-through" : ""}>{i + 1}. {o.title}</span>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-border p-2">
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={() => { academy.resetLab(rt.lesson.id); rt.clearActions(); }}>
          <RotateCcw className="h-3 w-3" /> Reset lab
        </Button>
      </div>
    </div>
  );
}
