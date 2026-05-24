import { useEffect, useMemo, useRef, useState } from "react";
import { SectionCard } from "@/ops/components/SectionCard";
import { TOOL_CATALOG } from "./toolStack";
import type { IncidentLab, LabStage, LabStep } from "./incidentLabs";
import { K8sAutoText } from "@/components/K8sAutoText";
import {
  Terminal, Play, RotateCcw, Lightbulb, CheckCircle2, Circle, ChevronRight, Clock, Wrench,
} from "lucide-react";

const STAGE_LABEL: Record<LabStage, string> = {
  plan: "Plan", code: "Code", build: "Build", scan: "Scan", push: "Push",
  deploy: "Deploy", schedule: "Schedule", run: "Run", observe: "Observe",
  triage: "Triage", fix: "Fix", verify: "Verify", recover: "Recover",
};

const STAGE_TOKEN: Record<LabStage, string> = {
  plan:     "border-[hsl(var(--ops-info)/0.5)] text-[hsl(var(--ops-info))] bg-[hsl(var(--ops-info)/0.10)]",
  code:     "border-[hsl(var(--ops-info)/0.5)] text-[hsl(var(--ops-info))] bg-[hsl(var(--ops-info)/0.10)]",
  build:    "border-[hsl(var(--ops-info)/0.5)] text-[hsl(var(--ops-info))] bg-[hsl(var(--ops-info)/0.10)]",
  scan:     "border-[hsl(var(--ops-warning)/0.5)] text-[hsl(var(--ops-warning))] bg-[hsl(var(--ops-warning)/0.10)]",
  push:     "border-[hsl(var(--ops-info)/0.5)] text-[hsl(var(--ops-info))] bg-[hsl(var(--ops-info)/0.10)]",
  deploy:   "border-[hsl(var(--ops-accent)/0.5)] text-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.10)]",
  schedule: "border-[hsl(var(--ops-accent)/0.5)] text-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.10)]",
  run:      "border-[hsl(var(--ops-success)/0.5)] text-[hsl(var(--ops-success))] bg-[hsl(var(--ops-success)/0.10)]",
  observe:  "border-[hsl(var(--ops-info)/0.5)] text-[hsl(var(--ops-info))] bg-[hsl(var(--ops-info)/0.10)]",
  triage:   "border-[hsl(var(--ops-warning)/0.5)] text-[hsl(var(--ops-warning))] bg-[hsl(var(--ops-warning)/0.10)]",
  fix:      "border-[hsl(var(--ops-critical)/0.5)] text-[hsl(var(--ops-critical))] bg-[hsl(var(--ops-critical)/0.10)]",
  verify:   "border-[hsl(var(--ops-success)/0.5)] text-[hsl(var(--ops-success))] bg-[hsl(var(--ops-success)/0.10)]",
  recover:  "border-[hsl(var(--ops-success)/0.5)] text-[hsl(var(--ops-success))] bg-[hsl(var(--ops-success)/0.10)]",
};

const DIFF_TOKEN: Record<IncidentLab["difficulty"], string> = {
  beginner:     "border-[hsl(var(--ops-success)/0.5)] text-[hsl(var(--ops-success))] bg-[hsl(var(--ops-success)/0.10)]",
  intermediate: "border-[hsl(var(--ops-warning)/0.5)] text-[hsl(var(--ops-warning))] bg-[hsl(var(--ops-warning)/0.10)]",
  advanced:     "border-[hsl(var(--ops-critical)/0.5)] text-[hsl(var(--ops-critical))] bg-[hsl(var(--ops-critical)/0.10)]",
};

type StepState = "pending" | "running" | "done";

interface ScrollLine { kind: "prompt" | "out" | "ok" | "hint" | "info"; text: string }

export function IncidentLabConsole({ lab, incidentId }: { lab: IncidentLab; incidentId: string }) {
  const [current, setCurrent] = useState(0);
  const [states, setStates] = useState<StepState[]>(() => lab.steps.map(() => "pending"));
  const [scroll, setScroll] = useState<Record<string, ScrollLine[]>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});
  const termRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef(false);

  const step = lab.steps[current];
  const tool = TOOL_CATALOG[step.tool];

  const progress = useMemo(
    () => Math.round((states.filter((x) => x === "done").length / states.length) * 100),
    [states],
  );

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [scroll, current]);

  function reset() {
    setStates(lab.steps.map(() => "pending"));
    setScroll({});
    setHintsShown({});
    setCurrent(0);
    streamingRef.current = false;
  }

  function runStep() {
    if (streamingRef.current) return;
    if (states[current] === "done") return;
    streamingRef.current = true;
    setStates((s) => s.map((v, i) => (i === current ? "running" : v)));

    const buf: ScrollLine[] = [
      { kind: "prompt", text: `$ ${step.command}` },
    ];
    setScroll((m) => ({ ...m, [step.id]: [...(m[step.id] ?? []), ...buf] }));

    const lines = step.expected_output.split("\n");
    let idx = 0;
    const tick = () => {
      if (idx >= lines.length) {
        setScroll((m) => ({
          ...m,
          [step.id]: [...(m[step.id] ?? []), { kind: "ok", text: `✓ ${step.success_check}` }],
        }));
        setStates((s) => s.map((v, i) => (i === current ? "done" : v)));
        streamingRef.current = false;
        // auto-advance after a short pause unless last step
        if (current < lab.steps.length - 1) {
          setTimeout(() => setCurrent((c) => Math.min(lab.steps.length - 1, c + 1)), 350);
        }
        return;
      }
      setScroll((m) => ({
        ...m,
        [step.id]: [...(m[step.id] ?? []), { kind: "out", text: lines[idx] }],
      }));
      idx += 1;
      setTimeout(tick, 35);
    };
    tick();
  }

  function showHint() {
    setHintsShown((h) => ({ ...h, [step.id]: true }));
    setScroll((m) => ({
      ...m,
      [step.id]: [...(m[step.id] ?? []), { kind: "hint", text: `💡 ${step.hint}` }],
    }));
  }

  return (
    <SectionCard
      bodyClassName="p-0"
      title={`Interactive Lab Console — ${incidentId}`}
      description={lab.objective}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-3 py-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${DIFF_TOKEN[lab.difficulty]}`}>
            {lab.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[hsl(var(--ops-muted-fg))]">
            <Clock className="h-3 w-3" /> ~{lab.estimated_minutes} min
          </span>
          <span className="text-[hsl(var(--ops-muted-fg))]">
            Step <span className="font-mono text-[hsl(var(--ops-fg))]">{current + 1}</span> / {lab.steps.length}
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-sm bg-[hsl(var(--ops-panel))]">
            <div className="h-full bg-[hsl(var(--ops-accent))]" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-mono text-[hsl(var(--ops-muted-fg))]">{progress}%</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-2 py-1 text-[11px] hover:border-[hsl(var(--ops-accent)/0.5)]"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Stage rail */}
      <div className="flex flex-wrap gap-1 border-b border-[hsl(var(--ops-border))] px-3 py-2">
        {lab.steps.map((st, i) => (
          <span
            key={st.id}
            className={[
              "rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
              i === current
                ? STAGE_TOKEN[st.phase]
                : states[i] === "done"
                ? "border-[hsl(var(--ops-success)/0.4)] bg-[hsl(var(--ops-success)/0.08)] text-[hsl(var(--ops-success))]"
                : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))]",
            ].join(" ")}
          >
            {String(i + 1).padStart(2, "0")} · {STAGE_LABEL[st.phase]}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Step list */}
        <ol className="max-h-[480px] overflow-y-auto border-b border-[hsl(var(--ops-border))] lg:border-b-0 lg:border-r">
          {lab.steps.map((st, i) => {
            const state = states[i];
            const active = i === current;
            return (
              <li key={st.id}>
                <button
                  onClick={() => setCurrent(i)}
                  className={[
                    "block w-full border-b border-[hsl(var(--ops-border))] px-3 py-2 text-left text-[12px] transition-colors",
                    active ? "bg-[hsl(var(--ops-accent)/0.08)]" : "hover:bg-[hsl(var(--ops-panel-2))]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-1.5">
                    {state === "done" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--ops-success))]" />
                    ) : active ? (
                      <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-[hsl(var(--ops-muted-fg))]" />
                    )}
                    <span className="font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`rounded-sm border px-1 py-0 text-[9px] uppercase ${STAGE_TOKEN[st.phase]}`}>
                      {STAGE_LABEL[st.phase]}
                    </span>
                  </div>
                  <div className={`mt-1 font-medium ${active ? "text-[hsl(var(--ops-fg))]" : "text-[hsl(var(--ops-fg))]"}`}>
                    {st.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[hsl(var(--ops-muted-fg))]">
                    {st.tool} · {st.shell}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Terminal */}
        <div className="flex flex-col">
          <StepHeader step={step} />

          <div
            ref={termRef}
            className="max-h-[340px] min-h-[260px] flex-1 overflow-y-auto bg-[hsl(var(--ops-bg))] px-3 py-2 font-mono text-[11.5px] leading-relaxed"
          >
            <ScrollView lines={scroll[step.id] ?? [{ kind: "info", text: `# Ready. Click Run to execute: ${step.command}` }]} />
          </div>

          {/* Run row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-3 py-2">
            <code className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-2 py-1 font-mono text-[11.5px] text-[hsl(var(--ops-fg))]">
              $ {step.command}
            </code>
            <div className="flex items-center gap-1.5">
              <button
                onClick={showHint}
                disabled={hintsShown[step.id]}
                className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.10)] px-2 py-1 text-[11px] text-[hsl(var(--ops-warning))] disabled:opacity-40"
              >
                <Lightbulb className="h-3 w-3" /> Hint
              </button>
              <button
                onClick={runStep}
                disabled={states[current] === "done" || streamingRef.current}
                className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--ops-accent))] disabled:opacity-50"
              >
                <Play className="h-3 w-3" /> {states[current] === "done" ? "Done" : "Run"}
              </button>
            </div>
          </div>

          {/* Bottom: why + tool */}
          <div className="grid gap-3 border-t border-[hsl(var(--ops-border))] p-3 text-[12px] md:grid-cols-[1fr_220px]">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                Why this step matters
              </div>
              <div className="leading-relaxed text-[hsl(var(--ops-fg))]"><K8sAutoText text={step.why} /></div>
              <div className="mt-2 text-[11px] text-[hsl(var(--ops-success))]">
                Success check: <span className="font-mono">{step.success_check}</span>
              </div>
            </div>
            <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2 text-[11px]">
              <div className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[hsl(var(--ops-accent))]">
                <Wrench className="h-3 w-3" /> Tool · {step.tool}
              </div>
              {tool ? (
                <>
                  <div className="text-[hsl(var(--ops-fg))]">{tool.purpose}</div>
                  <div className="mt-1 text-[10px] italic text-[hsl(var(--ops-muted-fg))]">
                    {tool.why_it_matters}
                  </div>
                </>
              ) : (
                <div className="text-[hsl(var(--ops-muted-fg))]">No catalog entry.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function StepHeader({ step }: { step: LabStep }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--ops-border))] px-3 py-2 text-[12px]">
      <div className="flex items-center gap-1.5">
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${STAGE_TOKEN[step.phase]}`}>
          {STAGE_LABEL[step.phase]}
        </span>
        <span className="font-semibold text-[hsl(var(--ops-fg))]">{step.title}</span>
      </div>
      <span className="font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">
        {step.tool} · {step.shell}
      </span>
    </div>
  );
}

function ScrollView({ lines }: { lines: ScrollLine[] }) {
  return (
    <>
      {lines.map((l, i) => {
        const cls =
          l.kind === "prompt" ? "text-[hsl(var(--ops-accent))]" :
          l.kind === "ok"     ? "text-[hsl(var(--ops-success))]" :
          l.kind === "hint"   ? "text-[hsl(var(--ops-warning))]" :
          l.kind === "info"   ? "text-[hsl(var(--ops-muted-fg))]" :
                                "text-[hsl(var(--ops-fg))]";
        return (
          <div key={i} className={`whitespace-pre-wrap ${cls}`}>
            {l.text}
          </div>
        );
      })}
    </>
  );
}
