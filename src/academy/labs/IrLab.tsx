import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLessonRuntime } from "../components/runtime";
import { RichText } from "../components/RichText";

const PHASES = ["identification", "containment", "eradication", "recovery", "lessons-learned"];

/** Branching incident-response decisions; wrong choices show consequences and can be retried. */
export function IrLab() {
  const rt = useLessonRuntime();
  const nodes = rt.lesson.lab.irNodes ?? [];
  const solvedInitial = nodes.filter((n) => rt.done.some((d) => d.includes(n.id))).length;
  const [step, setStep] = useState(Math.min(solvedInitial, nodes.length));
  const [picked, setPicked] = useState<string | null>(null);
  const [log, setLog] = useState<{ node: string; label: string; ok: boolean; consequence: string }[]>([]);
  const [closed, setClosed] = useState(false);
  const node = nodes[step];

  function choose(optId: string) {
    const opt = node.options.find((o) => o.id === optId)!;
    setPicked(optId);
    rt.emit({ action: "select:ir-decision", value: `${node.id}=${optId}`, detail: `${node.phase}: chose "${opt.label}"` });
    setLog((l) => [...l, { node: node.id, label: opt.label, ok: opt.correct, consequence: opt.consequence }]);
    if (!opt.correct) rt.mistake(`IR decision "${opt.label}"`);
  }

  const chosen = node?.options.find((o) => o.id === picked);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {PHASES.map((p) => <Badge key={p} variant={node?.phase === p ? "default" : "outline"} className="capitalize">{p.replace("-", " ")}</Badge>)}
        </div>
        {node ? (
          <div className="rounded-lg border border-primary/40 bg-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Decision {step + 1} of {nodes.length} · {node.phase.replace("-", " ")}</div>
            <RichText text={node.situation} className="mt-2 text-sm text-foreground/90" />
            <div className="mt-3 text-sm font-semibold">{node.question}</div>
            <div className="mt-2 space-y-1.5">
              {node.options.map((o) => (
                <button key={o.id} type="button" disabled={!!chosen?.correct}
                  onClick={() => choose(o.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${picked === o.id ? (o.correct ? "border-success bg-success/10" : "border-destructive bg-destructive/10") : "border-border hover:bg-muted"}`}>
                  {o.label}
                </button>
              ))}
            </div>
            {chosen && (
              <div className={`mt-3 rounded-md p-2 text-xs ${chosen.correct ? "bg-success/10" : "bg-destructive/10"}`}>
                <div className="flex items-center gap-1 font-semibold">{chosen.correct ? <><CheckCircle2 className="h-4 w-4 text-success" /> Good call</> : <><XCircle className="h-4 w-4 text-destructive" /> Consequence</>}</div>
                <RichText text={chosen.consequence} />
                {chosen.correct
                  ? <Button size="sm" className="mt-2 h-7 text-[11px]" onClick={() => { setStep(step + 1); setPicked(null); }}>Continue</Button>
                  : <div className="mt-1 text-muted-foreground">Pick another option.</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
            <div className="font-semibold">All decisions made.</div>
            <p className="mt-1 text-xs">Close the incident with a summary of what you contained, eradicated and recovered.</p>
            <Button size="sm" className="mt-2" disabled={closed} onClick={() => { setClosed(true); rt.emit({ action: "click:ir-complete", detail: "Closed the ransomware incident" }); }}>
              {closed ? "Incident closed" : "Close the incident"}
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 text-sm font-semibold">What we know</div>
          <ol className="space-y-1.5 text-xs">{rt.scenario?.timeline.map((t, i) => <li key={i}><span className="font-semibold">{t.phase}:</span> {t.summary}</li>)}</ol>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 text-sm font-semibold">Decision log</div>
          {log.length === 0 ? <div className="text-xs text-muted-foreground">No decisions yet.</div> : (
            <ol className="space-y-1 text-xs">{log.map((l, i) => <li key={i} className="flex gap-1.5">{l.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" /> : <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />}{l.label}</li>)}</ol>
          )}
        </div>
      </div>
    </div>
  );
}
