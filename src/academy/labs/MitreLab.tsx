import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MITRE_TACTICS, MITRE_TECHNIQUES, TACTICS_BY_ID, findTechnique } from "../data/mitre";
import { useLessonRuntime } from "../components/runtime";

/** Map scenario evidence to ATT&CK techniques; explore tactics; check intel; view coverage. */
export function MitreLab() {
  const rt = useLessonRuntime();
  const s = rt.scenario!;
  const [tactic, setTactic] = useState<string | null>(null);
  const [tech, setTech] = useState<string | null>(null);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [mapped, setMapped] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<Record<string, boolean>>({});
  const [intel, setIntel] = useState<string[]>([]);
  const [coverage, setCoverage] = useState(false);

  const cards = useMemo(() => [...s.mitreMap].map((m) => ({ m, ev: s.events.find((e) => e.id === m.eventIds[0])! })).sort((a, b) => a.ev.raw.localeCompare(b.ev.raw)), [s]);
  const indicators = [...new Set([...s.intel.map((i) => i.indicator), ...s.entities.filter((e) => e.type === "ip" || e.type === "domain").map((e) => e.value)])];
  const t = tech ? findTechnique(tech) : undefined;

  function map(evId: string, correct: string) {
    const pick = choice[evId]; if (!pick) return;
    rt.emit({ action: "select:map-event", value: `${evId}=${pick}`, detail: `Mapped ${evId} → ${pick}` });
    if (pick === correct) { setMapped((m) => ({ ...m, [evId]: pick })); setWrong((w) => ({ ...w, [evId]: false })); }
    else { setWrong((w) => ({ ...w, [evId]: true })); rt.mistake(`Mapped ${evId} to ${pick}`); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 text-sm font-semibold">ATT&CK tactics <span className="font-normal text-muted-foreground">— the attacker's goals, left to right</span></div>
        <div className="flex flex-wrap gap-1.5">
          {[...MITRE_TACTICS].sort((a, b) => a.order - b.order).map((x) => (
            <Button key={x.id} size="sm" variant={tactic === x.id ? "default" : "outline"} className="h-7 text-[11px]"
              onClick={() => { setTactic(x.id); rt.emit({ action: `click:open-tactic:${x.id}`, detail: `Opened tactic ${x.name}` }); }}>
              {x.name}
            </Button>
          ))}
        </div>
        {tactic && (
          <div className="mt-3 space-y-1.5 text-xs">
            <div><span className="font-mono text-muted-foreground">{tactic}</span> <span className="font-semibold">{TACTICS_BY_ID[tactic]?.name}</span> — “{TACTICS_BY_ID[tactic]?.question}”</div>
            <div className="flex flex-wrap gap-1.5">
              {MITRE_TECHNIQUES.filter((x) => x.tacticIds.includes(tactic)).map((x) => (
                <button key={x.id} className={`rounded border px-2 py-1 text-[11px] ${tech === x.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
                  onClick={() => { setTech(x.id); rt.emit({ action: `click:open-technique:${x.id}`, detail: `Opened ${x.id} ${x.name}` }); }}>
                  <span className="font-mono opacity-70">{x.id}</span> {x.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {t && (
          <div className="mt-3 rounded-md bg-muted/50 p-2 text-xs">
            <div className="font-semibold">{t.id} · {t.name}</div><p>{t.description}</p>
            <p className="text-muted-foreground">Example: {t.example} · Logs: {t.logSources.join(", ")} · Detect: {t.detectionIdea}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Map each piece of evidence to a technique</div>
          {cards.map(({ m, ev }) => (
            <div key={ev.id} className={`rounded-lg border p-3 text-xs ${mapped[ev.id] ? "border-success/40 bg-success/10" : "border-border bg-card"}`}>
              <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{ev.index}</Badge><span className="font-mono text-muted-foreground">{ev.time}</span><span className="font-mono text-muted-foreground">{ev.id}</span></div>
              <div className="mt-1 break-all font-mono text-[11px]">{ev.raw}</div>
              {mapped[ev.id] ? (
                <div className="mt-2 flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> {mapped[ev.id]} · {findTechnique(mapped[ev.id])?.name} — {m.evidence}</div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <select aria-label={`Technique for ${ev.id}`} className="h-7 rounded border border-border bg-background px-1 text-[11px]" value={choice[ev.id] ?? ""} onChange={(e) => setChoice((c) => ({ ...c, [ev.id]: e.target.value }))}>
                    <option value="">choose technique…</option>
                    {MITRE_TECHNIQUES.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}
                  </select>
                  <Button size="sm" className="h-7 text-[11px]" disabled={!choice[ev.id]} onClick={() => map(ev.id, m.techniqueId)}>Map</Button>
                  {wrong[ev.id] && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" /> Not this one — what is the attacker trying to achieve here?</span>}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 text-sm font-semibold">Threat intel lookups</div>
            {indicators.map((ind) => {
              const hit = s.intel.find((i) => i.indicator === ind);
              return (
                <div key={ind} className="flex flex-wrap items-center gap-2 border-t border-border py-1.5 text-xs first:border-0">
                  <span className="font-mono">{ind}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => { setIntel((x) => [...new Set([...x, ind])]); rt.emit({ action: `click:lookup-intel:${ind}`, value: ind, detail: `Looked up ${ind}` }); }}>Lookup</Button>
                  {intel.includes(ind) && <span className={hit ? "text-destructive" : "text-muted-foreground"}>{hit ? `${hit.threat} (${hit.confidence}%)` : "no feed match"}</span>}
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setCoverage(true); rt.emit({ action: "click:view-coverage", detail: "Viewed ATT&CK coverage for this case" }); }}>View case coverage</Button>
            {coverage && (
              <ul className="mt-2 space-y-1 text-xs">
                {[...MITRE_TACTICS].sort((a, b) => a.order - b.order).map((tac) => {
                  const ids = Object.values(mapped).filter((id) => findTechnique(id)?.tacticIds.includes(tac.id));
                  return ids.length ? <li key={tac.id} className="flex justify-between"><span>{tac.name}</span><span className="font-mono">{ids.join(", ")}</span></li> : null;
                })}
                {Object.keys(mapped).length === 0 && <li className="text-muted-foreground">Nothing mapped yet.</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
