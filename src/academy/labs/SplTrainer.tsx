import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Lightbulb, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLessonRuntime } from "../components/runtime";
import { RichText } from "../components/RichText";
import { SplWorkbench } from "../components/SplWorkbench";
import { runSpl, validateExercise } from "../engine/splEngine";
import { HINT_LABELS } from "../engine/mentor";

/** Progressive SPL exercises over the lesson's deterministic dataset. */
export function SplTrainer() {
  const rt = useLessonRuntime();
  const exercises = rt.lesson.lab.splExercises ?? [];
  const firstOpen = exercises.findIndex((x) => !rt.done.includes(x.id));
  const [idx, setIdx] = useState(firstOpen < 0 ? 0 : firstOpen);
  const ex = exercises[idx];
  const [spl, setSpl] = useState(ex?.starter ?? "");
  const [result, setResult] = useState<{ ok: boolean; reasons: string[] } | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [range, setRange] = useState("all");

  useEffect(() => { setSpl(exercises[idx]?.starter ?? ""); setResult(null); setShowExample(false); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex || !rt.scenario) return <div className="text-sm text-muted-foreground">This lab has no SPL exercises.</div>;
  const level = rt.hintLevel(ex.id);
  const isDone = rt.done.includes(ex.id);
  const events = rt.scenario.events;

  function check() {
    const run = runSpl(spl, events, { timeRange: range });
    const v = validateExercise(ex, spl, run);
    setResult(v);
    rt.emit({ action: "run-spl", value: spl, detail: `Checked exercise "${ex.title}" (${v.ok ? "pass" : "not yet"})` });
    if (v.ok) rt.emit({ action: `click:spl-exercise-pass:${ex.id}`, detail: `Passed SPL exercise: ${ex.title}` });
    else rt.mistake(`SPL exercise "${ex.title}": ${v.reasons[0] ?? "did not pass"}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {exercises.map((x, i) => {
          const d = rt.done.includes(x.id);
          return (
            <Button key={x.id} size="sm" variant={i === idx ? "default" : "outline"} className="h-7 gap-1 text-[11px]" onClick={() => setIdx(i)}>
              {d && <CheckCircle2 className="h-3 w-3 text-success" />} {i + 1}. {x.title}
            </Button>
          );
        })}
      </div>

      <div className="rounded-lg border border-primary/40 bg-card p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">Exercise {idx + 1}/{exercises.length}</Badge>
          <div className="text-sm font-semibold">{ex.title}</div>
          {isDone && <Badge className="ml-auto gap-1 bg-success/15 text-success border-success/30"><CheckCircle2 className="h-3 w-3" /> Passed</Badge>}
        </div>
        <RichText text={ex.task} className="mt-2 text-sm text-foreground/90" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" disabled={level >= 5} onClick={() => rt.revealHint(ex.id)}>
            <Lightbulb className="h-3 w-3" /> {level === 0 ? "Hint" : `Next hint (${Math.min(level + 1, 5)}/5)`}
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => { setShowExample(true); for (let i = level; i < 4; i++) rt.revealHint(ex.id); }}>
            <Eye className="h-3 w-3" /> Show example{level < 4 ? " (uses hints)" : ""}
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={check}>Check my answer</Button>
        </div>
        {level > 0 && (
          <ol className="mt-3 space-y-1.5">
            {rt.objectives.find((o) => o.id === ex.id)?.hints.slice(0, level).map((h, i) => (
              <li key={i} className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1.5 text-[11px]"><span className="font-semibold">Hint {i + 1} · {HINT_LABELS[i]}:</span> <RichText text={h} /></li>
            ))}
          </ol>
        )}
        {showExample && (
          <div className="mt-3 rounded-md border border-border bg-muted/50 p-2 text-[11px]">
            <div className="mb-1 font-semibold">Example search (try to understand it, then type your own):</div>
            <code className="block break-all font-mono">{ex.solution}</code>
            <Button size="sm" variant="ghost" className="mt-1 h-6 text-[10px]" onClick={() => setSpl(ex.solution)}>Copy into editor</Button>
          </div>
        )}
        {result && (
          <div className={`mt-3 rounded-md border p-2 text-xs ${result.ok ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}>
            {result.ok ? (
              <div className="space-y-1"><div className="flex items-center gap-1 font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Correct</div><RichText text={ex.explanation} /></div>
            ) : (
              <div className="space-y-1"><div className="flex items-center gap-1 font-semibold text-destructive"><XCircle className="h-4 w-4" /> Not yet</div><ul className="ml-4 list-disc">{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
            )}
            {result.ok && idx < exercises.length - 1 && <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={() => setIdx(idx + 1)}>Next exercise</Button>}
          </div>
        )}
      </div>

      <SplWorkbench
        events={events}
        value={spl}
        onChange={setSpl}
        datasetLabel={rt.scenario.name}
        onTimeRange={(v) => { setRange(v); rt.emit({ action: "select:time-range", value: v, detail: `Time range → ${v}` }); }}
        onRun={(q, r) => rt.emit({ action: "run-spl", value: q, detail: `Ran SPL (${r.error ? "error" : `${r.rows.length} rows`}): ${q.slice(0, 70)}` })}
      />
    </div>
  );
}
