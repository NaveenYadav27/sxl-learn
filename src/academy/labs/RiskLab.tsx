import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLessonRuntime } from "../components/runtime";

/** Risk-Based Alerting lab: replay risk events, compare alert noise vs RBA, tune the threshold. */
export function RiskLab() {
  const rt = useLessonRuntime();
  const scenario = rt.scenario!;
  const riskEvents = useMemo(() => scenario.events.filter((e) => e.risk).sort((a, b) => a.epoch - b.epoch), [scenario]);
  const [mode, setMode] = useState<"alerts" | "rba">("rba");
  const [threshold, setThreshold] = useState(rt.lesson.lab.riskThreshold ?? 100);
  const [played, setPlayed] = useState(riskEvents.length);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [notables, setNotables] = useState<string[]>([]);
  const [verdicts, setVerdicts] = useState<Record<string, string>>({});
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => setPlayed((p) => { if (p >= riskEvents.length) { setPlaying(false); return p; } return p + 1; }), 700);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, riskEvents.length]);

  const visible = riskEvents.slice(0, played);
  const objects = useMemo(() => {
    const m = new Map<string, { object: string; type: string; score: number; rules: string[]; techniques: Set<string>; events: typeof visible }>();
    for (const e of visible) {
      const r = e.risk!;
      const cur = m.get(r.object) ?? { object: r.object, type: r.objectType, score: 0, rules: [], techniques: new Set<string>(), events: [] };
      cur.score += r.score; cur.rules.push(r.rule); (e.mitre ?? []).forEach((t) => cur.techniques.add(t)); cur.events.push(e);
      m.set(r.object, cur);
    }
    return [...m.values()].sort((a, b) => b.score - a.score);
  }, [visible]);
  const max = Math.max(threshold * 1.5, ...objects.map((o) => o.score), 1);

  function toggle(m: "alerts" | "rba") { setMode(m); rt.emit({ action: `click:toggle-mode:${m}`, detail: `Switched to ${m === "alerts" ? "traditional alerts" : "risk-based alerting"} view` }); }
  function play() { setPlayed(0); setPlaying(true); rt.emit({ action: "click:play-replay", detail: "Replayed risk events in time order" }); }
  function createNotable(obj: string, score: number) {
    if (score < threshold) { rt.mistake(`Tried to raise a risk notable for ${obj} (${score}) below the threshold ${threshold}`); return; }
    if (!notables.includes(obj)) setNotables((n) => [...n, obj]);
    rt.emit({ action: `click:create-risk-notable:${obj}`, detail: `Raised risk notable for ${obj} (score ${score})` });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <div className="flex rounded-md border border-border p-0.5">
          <Button size="sm" variant={mode === "alerts" ? "default" : "ghost"} className="h-7 text-[11px]" onClick={() => toggle("alerts")}>Traditional alerts</Button>
          <Button size="sm" variant={mode === "rba" ? "default" : "ghost"} className="h-7 text-[11px]" onClick={() => toggle("rba")}>Risk-based (RBA)</Button>
        </div>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => (playing ? setPlaying(false) : play())}>
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />} {playing ? "Pause" : "Replay risk events"}
        </Button>
        <span className="text-[11px] text-muted-foreground">{played}/{riskEvents.length} risk events</span>
        <div className="flex min-w-[260px] flex-1 items-center gap-3">
          <span className="text-[11px] font-medium">Threshold</span>
          <Slider aria-label="Risk threshold" min={20} max={200} step={10} value={[threshold]} onValueChange={(v) => setThreshold(v[0])}
            onValueCommit={(v) => rt.emit({ action: "select:threshold", value: String(v[0]), detail: `Risk threshold → ${v[0]}` })} className="flex-1" />
          <Badge variant="outline" className="font-mono">{threshold}</Badge>
        </div>
      </div>

      {mode === "alerts" ? (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-3 py-2 text-sm font-semibold">Every rule fires its own alert — {visible.length} alerts to triage</div>
          <ul className="max-h-[420px] divide-y divide-border overflow-auto">
            {visible.map((e) => (
              <li key={e.id} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                <span className="font-mono text-muted-foreground">{e.time.slice(11)}</span>
                <span className="flex-1">{e.risk!.rule}</span>
                <span className="font-mono">{e.risk!.object}</span>
                <Badge variant="outline" className="text-[10px]">medium</Badge>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">Each looks small on its own. Switch to RBA to see which object these signals add up on.</div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="text-sm font-semibold">Risk objects</div>
            {objects.map((o) => {
              const over = o.score >= threshold;
              return (
                <div key={o.object} className={`rounded-md border p-2 ${open === o.object ? "border-primary/60" : "border-border"}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button className="font-mono font-semibold hover:underline" onClick={() => { setOpen(o.object); rt.emit({ action: `click:open-risk-object:${o.object}`, detail: `Opened risk object ${o.object}` }); }}>{o.object}</button>
                    <Badge variant="outline" className="text-[10px]">{o.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{o.rules.length} rules · {o.techniques.size} techniques</span>
                    <span className={`ml-auto font-mono font-bold ${over ? "text-destructive" : "text-shadowx-gold"}`}>{o.score}</span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 rounded bg-muted">
                    <div className={`h-full rounded ${over ? "bg-destructive" : "bg-shadowx-gold"}`} style={{ width: `${(o.score / max) * 100}%` }} />
                    <div className="absolute top-[-3px] h-4 w-0.5 bg-foreground" style={{ left: `${(threshold / max) * 100}%` }} title={`threshold ${threshold}`} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant={notables.includes(o.object) ? "secondary" : "outline"} className="h-6 px-2 text-[10px]" onClick={() => createNotable(o.object, o.score)}>
                      {notables.includes(o.object) ? "Risk notable raised" : "Raise risk notable"}
                    </Button>
                    <select aria-label={`Verdict for ${o.object}`} className="h-6 rounded border border-border bg-background px-1 text-[10px]" value={verdicts[o.object] ?? ""}
                      onChange={(e) => { setVerdicts((v) => ({ ...v, [o.object]: e.target.value })); rt.emit({ action: "select:risk-verdict", value: `${o.object}=${e.target.value}`, detail: `${o.object} → ${e.target.value}` }); }}>
                      <option value="">verdict…</option><option value="investigate">investigate</option><option value="monitor">monitor</option><option value="ignore">ignore</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            {open ? (() => { const o = objects.find((x) => x.object === open); return o ? (
              <div className="space-y-2 text-xs">
                <div className="text-sm font-semibold">Contributing risk events · <span className="font-mono">{o.object}</span></div>
                <ol className="space-y-1.5">
                  {o.events.map((e) => (
                    <li key={e.id} className="rounded bg-muted/50 p-2">
                      <div className="flex items-center gap-2"><span className="font-mono text-muted-foreground">{e.time.slice(11)}</span><span className="flex-1 font-medium">{e.risk!.rule}</span><span className="font-mono text-shadowx-gold">+{e.risk!.score}</span></div>
                      {e.mitre && <div className="font-mono text-[10px] text-muted-foreground">{e.mitre.join(", ")}</div>}
                    </li>
                  ))}
                </ol>
                <div className="text-muted-foreground">Total {o.score} vs threshold {threshold}: {o.score >= threshold ? "one rich notable instead of " + o.events.length + " separate alerts." : "below threshold — keep watching."}</div>
              </div>) : null; })() : <div className="text-xs text-muted-foreground">Open a risk object to see the story its risk events tell.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
