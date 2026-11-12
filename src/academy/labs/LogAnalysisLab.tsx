import { useMemo, useState } from "react";
import { CheckCircle2, ListOrdered, MousePointerClick, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LogQuestion, SimEvent } from "../types";
import { useLessonRuntime } from "../components/runtime";
import { RichText } from "../components/RichText";

const INDEX_LABEL: Record<string, string> = {
  auth: "Windows authentication", wineventlog: "Windows Security", linux_secure: "Linux auth", firewall: "Firewall", dns: "DNS",
  proxy: "Web proxy", sysmon: "Sysmon", edr: "EDR", vpn: "VPN", email: "Email", web: "Web server", cloud: "Cloud audit",
};

/** Raw-event analysis: read events, answer evidence questions, build a timeline. */
export function LogAnalysisLab() {
  const rt = useLessonRuntime();
  const lab = rt.lesson.lab;
  const scenario = rt.scenario;
  const events: SimEvent[] = useMemo(() => {
    if (!scenario) return [];
    const ids = lab.logEventIds ?? [];
    const list = ids.length ? ids.map((id) => scenario.events.find((e) => e.id === id)).filter((e): e is SimEvent => !!e) : scenario.events.slice(0, 15);
    return list; // shown in the given (deliberately shuffled) order
  }, [scenario, lab.logEventIds]);
  const questions = lab.logQuestions ?? [];
  const [selected, setSelected] = useState<string | null>(events[0]?.id ?? null);
  const [answered, setAnswered] = useState<Record<string, boolean>>(() => Object.fromEntries(questions.filter((q) => rt.done.includes(q.id)).map((q) => [q.id, true])));
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string[]>([]);
  const active = questions.find((q) => !answered[q.id]);

  const sel = events.find((e) => e.id === selected);

  function check(q: LogQuestion, answer: string) {
    const expected = Array.isArray(q.answer) ? q.answer.join(",") : q.answer;
    if (answer.toLowerCase() === expected.toLowerCase()) {
      setAnswered((a) => ({ ...a, [q.id]: true }));
      setFeedback((f) => ({ ...f, [q.id]: "" }));
      rt.emit({ action: "select:log-answer", value: `${q.id}=${expected}`, detail: `Answered "${q.prompt}" correctly` });
    } else {
      setFeedback((f) => ({ ...f, [q.id]: "Not quite — look at the fields of the events again." }));
      rt.mistake(`Wrong answer for "${q.prompt}": ${answer}`);
    }
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="text-sm font-semibold">Raw events · {scenario?.name}</div>
            <span className="text-[10px] text-muted-foreground">Click an event to break it into fields</span>
          </div>
          <ul className="max-h-[420px] divide-y divide-border overflow-auto">
            {events.map((e, i) => {
              const inOrder = order.indexOf(e.id);
              return (
                <li key={e.id} className={`px-3 py-2 ${selected === e.id ? "bg-primary/10" : "hover:bg-muted/40"}`}>
                  <button type="button" className="w-full text-left" onClick={() => setSelected(e.id)}>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-mono text-muted-foreground">#{i + 1}</span>
                      <Badge variant="outline" className="text-[10px]">{INDEX_LABEL[e.index] ?? e.index}</Badge>
                      <span className="font-mono text-muted-foreground">index={e.index} sourcetype={e.sourcetype}</span>
                      {inOrder >= 0 && <Badge className="ml-auto text-[10px]">step {inOrder + 1}</Badge>}
                    </div>
                    <div className="mt-1 break-all font-mono text-[11px] text-foreground/90">{e.raw}</div>
                  </button>
                  {active && (active.kind === "pick-event" || active.kind === "order") && (
                    <div className="mt-1.5 flex gap-1.5">
                      {active.kind === "pick-event" && (
                        <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]" onClick={() => check(active, e.id)}>
                          <MousePointerClick className="h-3 w-3" /> This is the one
                        </Button>
                      )}
                      {active.kind === "order" && inOrder < 0 && (
                        <Button size="sm" variant="outline" className="h-6 gap-1 text-[10px]" onClick={() => setOrder((o) => [...o, e.id])}>
                          <ListOrdered className="h-3 w-3" /> Add as step {order.length + 1}
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {sel && (
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 text-xs font-semibold">Field breakdown <span className="font-normal text-muted-foreground">· the SIEM extracts these key=value pairs so you can search them</span></div>
            <div className="grid gap-1 sm:grid-cols-2">
              {[["_time", sel.time], ["host", sel.host], ["index", sel.index], ["sourcetype", sel.sourcetype], ...Object.entries(sel.fields).map(([k, v]) => [k, String(v)])].map(([k, v]) => (
                <div key={k} className="flex gap-2 rounded bg-muted/40 px-2 py-1 font-mono text-[11px]">
                  <span className="text-primary">{k}</span><span className="break-all text-foreground/90">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Evidence questions</div>
        {questions.map((q, i) => {
          const isActive = active?.id === q.id;
          const ok = answered[q.id];
          return (
            <div key={q.id} className={`rounded-lg border p-3 text-xs ${ok ? "border-success/40 bg-success/10" : isActive ? "border-primary/50 bg-card" : "border-border bg-card opacity-60"}`}>
              <div className="flex items-start gap-2">
                {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <span className="font-mono text-muted-foreground">{i + 1}.</span>}
                <RichText text={q.prompt} className="font-medium" />
              </div>
              {isActive && q.kind === "choice" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(q.options ?? []).map((o) => <Button key={o} size="sm" variant="outline" className="h-7 font-mono text-[11px]" onClick={() => check(q, o)}>{o}</Button>)}
                </div>
              )}
              {isActive && q.kind === "pick-event" && <div className="mt-2 text-[11px] text-muted-foreground">Click “This is the one” on the matching event in the list.</div>}
              {isActive && q.kind === "order" && (
                <div className="mt-2 space-y-1.5">
                  <div className="text-[11px] text-muted-foreground">Use “Add as step N” on events in the order they happened ({order.length}/{Array.isArray(q.answer) ? q.answer.length : 0} chosen).</div>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-[11px]" disabled={!Array.isArray(q.answer) || order.length !== q.answer.length} onClick={() => { check(q, order.join(",")); }}>Check timeline</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setOrder([])}>Clear</Button>
                  </div>
                </div>
              )}
              {feedback[q.id] && !ok && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-destructive"><XCircle className="h-3.5 w-3.5" /> {feedback[q.id]}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
