import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, FileSearch, Flag, Globe, Grid3x3, ListTree, NotebookPen, Plus, ShieldCheck, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EntityRole, Scenario, SimEvent } from "../types";
import { riskRollup } from "../data/scenarios";
import { MITRE_TACTICS, MITRE_TECHNIQUES } from "../data/mitre";
import { SplWorkbench } from "../components/SplWorkbench";
import type { LabEmit } from "../components/runtime";

export interface CaseState {
  tags: Record<string, EntityRole>;
  evidence: string[];
  techniques: string[];
  patientZero: string;
  severity: string;
  notes: { at: number; text: string }[];
  intelLooked: string[];
  escalated: boolean;
}

export const emptyCase = (): CaseState => ({ tags: {}, evidence: [], techniques: [], patientZero: "", severity: "", notes: [], intelLooked: [], escalated: false });

const ROLES: EntityRole[] = ["attacker", "compromised", "victim", "suspicious", "asset", "benign"];
const TABS = [
  { id: "overview", label: "Overview", icon: FileSearch },
  { id: "timeline", label: "Timeline", icon: ListTree },
  { id: "events", label: "Events", icon: ShieldCheck },
  { id: "entities", label: "Entities", icon: Users },
  { id: "risk", label: "Risk", icon: AlertTriangle },
  { id: "mitre", label: "MITRE", icon: Grid3x3 },
  { id: "intel", label: "Threat Intel", icon: Globe },
  { id: "evidence", label: "Evidence", icon: Flag },
  { id: "notes", label: "Notes", icon: NotebookPen },
];

interface Props {
  scenario: Scenario;
  emit: (e: LabEmit) => void;
  mistake: (detail: string) => void;
  caseState: CaseState;
  setCase: (fn: (c: CaseState) => CaseState) => void;
  mentorSlot?: ReactNode;
  reportSlot?: ReactNode;
}

const URG: Record<string, string> = { critical: "text-destructive", high: "text-shadowx-ember", medium: "text-shadowx-gold", low: "text-muted-foreground" };

export function InvestigationWorkspace({ scenario, emit, mistake, caseState: c, setCase, mentorSlot, reportSlot }: Props) {
  const [tab, setTab] = useState("overview");
  const [spl, setSpl] = useState(`index=${scenario.events.find((e) => e.risk)?.index ?? "*"}`);
  const [filter, setFilter] = useState("");
  const [idx, setIdx] = useState("all");
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const tabs = [...TABS, ...(mentorSlot ? [{ id: "mentor", label: "AI Mentor", icon: CheckCircle2 }] : []), ...(reportSlot ? [{ id: "report", label: "Report", icon: NotebookPen }] : [])];
  const byId = useMemo(() => new Map(scenario.events.map((e) => [e.id, e])), [scenario]);
  const indexes = useMemo(() => [...new Set(scenario.events.map((e) => e.index))].sort(), [scenario]);
  const filtered = useMemo(() => scenario.events
    .filter((e) => (idx === "all" || e.index === idx) && (!filter || e.raw.toLowerCase().includes(filter.toLowerCase())))
    .slice().sort((a, b) => a.epoch - b.epoch), [scenario, filter, idx]);
  const entitiesSorted = useMemo(() => [...scenario.entities].sort((a, b) => a.value.localeCompare(b.value)), [scenario]);
  const candidates = scenario.entities.filter((e) => e.type === "host" || e.type === "user");
  const indicators = useMemo(() => {
    const fromIntel = scenario.intel.map((i) => i.indicator);
    const fromEntities = scenario.entities.filter((e) => ["ip", "domain", "hash"].includes(e.type)).map((e) => e.value);
    return [...new Set([...fromIntel, ...fromEntities])];
  }, [scenario]);

  function go(t: string) { setTab(t); emit({ action: "navigate", view: t, detail: `Opened ${t} tab` }); }

  function tag(value: string, role: EntityRole) {
    const truth = scenario.entities.find((e) => e.value === value);
    setCase((x) => ({ ...x, tags: { ...x.tags, [value]: role } }));
    emit({ action: "select:tag-entity", value: `${value}=${role}`, detail: `Tagged ${value} as ${role}` });
    if (truth && truth.role !== role) { mistake(`Tagged ${value} as ${role}`); setFeedback(`${value} as "${role}"? Check its events again — what did it actually do?`); }
    else setFeedback(truth ? `${value} → ${role}. ${truth.note}` : null);
  }

  function addEvidence(id: string) {
    if (c.evidence.includes(id)) return;
    setCase((x) => ({ ...x, evidence: [...x.evidence, id] }));
    const ev = byId.get(id);
    emit({ action: `click:add-evidence:${id}`, detail: `Added ${id} (${ev?.index}) to evidence` });
  }

  function mapTechnique(tid: string) {
    if (c.techniques.includes(tid)) return;
    setCase((x) => ({ ...x, techniques: [...x.techniques, tid] }));
    emit({ action: "select:map-technique", value: tid, detail: `Mapped case to ${tid}` });
    if (!scenario.mitreMap.some((m) => m.techniqueId === tid)) { mistake(`Mapped ${tid}, which isn't supported by the evidence`); setFeedback(`${tid} isn't supported by this case's evidence. Map only what you can prove.`); }
    else setFeedback(null);
  }

  function setPatientZero(v: string) {
    setCase((x) => ({ ...x, patientZero: v }));
    emit({ action: "select:patient-zero", value: v, detail: `Patient zero → ${v}` });
    if (v && v !== scenario.patientZero.entity) mistake(`Patient zero set to ${v}`);
  }

  function lookup(ind: string) {
    setCase((x) => ({ ...x, intelLooked: x.intelLooked.includes(ind) ? x.intelLooked : [...x.intelLooked, ind] }));
    const hit = scenario.intel.find((i) => i.indicator === ind);
    emit({ action: `click:lookup-intel:${ind}`, value: ind, detail: hit ? `Intel hit: ${ind} = ${hit.threat} (${hit.confidence}%)` : `No intel match for ${ind}` });
  }

  const ev = openEvent ? byId.get(openEvent) : undefined;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <FileSearch className="h-4 w-4 text-shadowx-gold" />
        <div className="text-sm font-semibold">Investigation Workspace</div>
        <Badge variant="outline" className="text-[10px]">{scenario.name}</Badge>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">Evidence {c.evidence.length} · Entities tagged {Object.keys(c.tags).length} · Techniques {c.techniques.length}</span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto border-b border-border bg-muted/30 px-2" role="tablist">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => go(t.id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-colors ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {feedback && <div className="border-b border-border bg-primary/5 px-3 py-1.5 text-[11px]">{feedback}</div>}

      <div className="min-h-[460px] p-4">
        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notables in this case</div>
              {scenario.notables.map((n) => (
                <div key={n.id} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{n.id}</span><span className={`font-mono text-[10px] uppercase ${URG[n.urgency]}`}>{n.urgency}</span></div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-muted-foreground">{n.description}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-xs">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case decisions</div>
              <label className="block space-y-1">
                <span className="font-medium">Patient zero — where did it start?</span>
                <select aria-label="Patient zero" className="h-8 w-full rounded border border-border bg-background px-2" value={c.patientZero} onChange={(e) => setPatientZero(e.target.value)}>
                  <option value="">Not decided</option>
                  {candidates.map((e) => <option key={e.value} value={e.value}>{e.value} ({e.type})</option>)}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="font-medium">Case severity</span>
                <select aria-label="Case severity" className="h-8 w-full rounded border border-border bg-background px-2" value={c.severity}
                  onChange={(e) => { setCase((x) => ({ ...x, severity: e.target.value })); emit({ action: "select:severity", value: e.target.value, detail: `Severity → ${e.target.value}` }); }}>
                  <option value="">Not set</option>{["critical", "high", "medium", "low"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <Button size="sm" variant={c.escalated ? "secondary" : "default"} disabled={c.escalated}
                onClick={() => { setCase((x) => ({ ...x, escalated: true })); emit({ action: "click:escalate", detail: "Escalated case to Tier 2 / IR" }); }}>
                {c.escalated ? "Escalated to IR" : "Escalate to Tier 2 / IR"}
              </Button>
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Your case timeline is built from the evidence you pin, in time order. Notable trigger events are shown as anchors.</p>
            {(() => {
              const anchors = new Set(scenario.notables.flatMap((n) => n.eventIds.slice(0, 1)));
              const ids = [...new Set([...c.evidence, ...anchors])];
              const list = ids.map((id) => byId.get(id)).filter((e): e is SimEvent => !!e).sort((a, b) => a.epoch - b.epoch);
              return (
                <ol className="relative ml-2 space-y-3 border-l border-border pl-4">
                  {list.map((e) => (
                    <li key={e.id} className="relative text-xs">
                      <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${c.evidence.includes(e.id) ? "bg-primary" : "bg-warning"}`} />
                      <div className="flex items-center gap-2"><span className="font-mono text-muted-foreground">{e.time}</span><Badge variant="outline" className="text-[10px]">{e.index}</Badge><span className="text-[10px] text-muted-foreground">{c.evidence.includes(e.id) ? "evidence" : "notable anchor"}</span>
                        <button className="text-[10px] text-primary hover:underline" onClick={() => { setOpenEvent(e.id); emit({ action: `click:open-event:${e.id}`, detail: `Opened event ${e.id}` }); }}>open</button></div>
                      <div className="mt-0.5 break-all font-mono text-[11px] text-foreground/85">{e.raw}</div>
                    </li>
                  ))}
                </ol>
              );
            })()}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-4">
            <SplWorkbench events={scenario.events} value={spl} onChange={setSpl} datasetLabel={scenario.name} compact
              onRun={(q, r) => emit({ action: "run-spl", value: q, detail: `Ran SPL (${r.error ? "error" : `${r.rows.length} rows`}): ${q.slice(0, 70)}` })} />
            <div className="rounded-md border border-border">
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                <span className="text-xs font-semibold">Event browser</span>
                <select aria-label="Index filter" className="h-7 rounded border border-border bg-background px-2 text-[11px]" value={idx} onChange={(e) => setIdx(e.target.value)}>
                  <option value="all">all indexes</option>{indexes.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                <Input aria-label="Filter events" placeholder="filter text, e.g. 198.51.100.77" className="h-7 max-w-xs text-[11px]" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <span className="text-[10px] text-muted-foreground">{filtered.length} events (oldest first)</span>
              </div>
              <ul className="max-h-[340px] divide-y divide-border overflow-auto">
                {filtered.slice(0, 120).map((e) => (
                  <li key={e.id} className={`flex items-start gap-2 px-3 py-1.5 text-[11px] ${openEvent === e.id ? "bg-primary/10" : ""}`}>
                    <span className="shrink-0 font-mono text-muted-foreground">{e.time.slice(11)}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{e.index}</Badge>
                    <button className="min-w-0 flex-1 text-left font-mono line-clamp-1 break-all" onClick={() => { setOpenEvent(e.id); emit({ action: `click:open-event:${e.id}`, detail: `Opened event ${e.id}` }); }}>{e.raw}</button>
                    <Button size="sm" variant={c.evidence.includes(e.id) ? "secondary" : "ghost"} className="h-6 shrink-0 gap-1 px-2 text-[10px]" disabled={c.evidence.includes(e.id)} onClick={() => addEvidence(e.id)}>
                      <Plus className="h-3 w-3" /> {c.evidence.includes(e.id) ? "Pinned" : "Evidence"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "entities" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Tag every entity with its role. Base each tag on what its events show, not on its name.</p>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground"><tr><th className="py-1 text-left">Entity</th><th className="text-left">Type</th><th className="text-left">Events</th><th className="text-left">Your tag</th></tr></thead>
              <tbody>
                {entitiesSorted.map((e) => {
                  const t = c.tags[e.value];
                  return (
                    <tr key={e.value} className="border-t border-border">
                      <td className="py-1.5 font-mono">{e.value}</td><td>{e.type}</td>
                      <td className="font-mono">{scenario.events.filter((x) => x.raw.toLowerCase().includes(e.value.toLowerCase())).length}</td>
                      <td>
                        <select aria-label={`Role for ${e.value}`} className="h-7 rounded border border-border bg-background px-1 text-[11px]" value={t ?? ""} onChange={(ev2) => tag(e.value, ev2.target.value as EntityRole)}>
                          <option value="">— choose —</option>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {t && (t === e.role ? <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-success" /> : <XCircle className="ml-1 inline h-3.5 w-3.5 text-destructive" />)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "risk" && (
          <table className="w-full text-xs">
            <thead className="text-muted-foreground"><tr><th className="py-1 text-left">Risk object</th><th className="text-left">Type</th><th className="text-left">Score</th><th className="text-left">Rules</th><th className="text-left">Techniques</th></tr></thead>
            <tbody>{riskRollup(scenario).map((r) => (
              <tr key={r.object} className="border-t border-border align-top">
                <td className="py-1.5 font-mono">{r.object}</td><td>{r.objectType}</td>
                <td className={`font-mono font-bold ${r.score >= 100 ? "text-destructive" : r.score >= 60 ? "text-shadowx-ember" : "text-shadowx-gold"}`}>{r.score}</td>
                <td className="text-[11px]">{r.rules.join(" · ")}</td><td className="font-mono text-[11px]">{r.techniques.join(", ")}</td>
              </tr>))}
            </tbody>
          </table>
        )}

        {tab === "mitre" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input aria-label="Filter techniques" placeholder="filter techniques…" className="h-7 max-w-xs text-[11px]" value={techFilter} onChange={(e) => setTechFilter(e.target.value)} />
              <span className="text-[11px] text-muted-foreground">Mapped: {c.techniques.join(", ") || "none yet"}</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {[...MITRE_TACTICS].sort((a, b) => a.order - b.order).map((tac) => {
                const techs = MITRE_TECHNIQUES.filter((t) => t.tacticIds[0] === tac.id && (!techFilter || `${t.id} ${t.name}`.toLowerCase().includes(techFilter.toLowerCase())));
                if (!techs.length) return null;
                return (
                  <div key={tac.id} className="rounded-md border border-border p-2">
                    <div className="text-[11px] font-semibold">{tac.name} <span className="font-normal text-muted-foreground">— {tac.question}</span></div>
                    <div className="mt-1.5 space-y-1">
                      {techs.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono text-muted-foreground">{t.id}</span><span className="flex-1">{t.name}</span>
                          <Button size="sm" variant={c.techniques.includes(t.id) ? "secondary" : "ghost"} className="h-6 px-2 text-[10px]" disabled={c.techniques.includes(t.id)} onClick={() => mapTechnique(t.id)}>
                            {c.techniques.includes(t.id) ? "Mapped" : "Map"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "intel" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Look up each indicator in the threat-intel feeds. No match does not mean safe.</p>
            {indicators.map((ind) => {
              const hit = scenario.intel.find((i) => i.indicator === ind);
              const looked = c.intelLooked.includes(ind);
              return (
                <div key={ind} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-xs">
                  <span className="font-mono">{ind}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => lookup(ind)}>Lookup</Button>
                  {looked && (hit
                    ? <span className="text-destructive">{hit.threat} · {hit.source} · confidence {hit.confidence}</span>
                    : <span className="text-muted-foreground">No match in MISP / OTX / AbuseIPDB feeds</span>)}
                </div>
              );
            })}
          </div>
        )}

        {tab === "evidence" && (
          <div className="space-y-2">
            {c.evidence.length === 0 && <p className="text-xs text-muted-foreground">No evidence yet. Pin events from the Events tab.</p>}
            {c.evidence.map((id) => { const e = byId.get(id); return e ? (
              <div key={id} className="flex items-start gap-2 rounded-md border border-border p-2 text-[11px]">
                <span className="font-mono text-muted-foreground">{e.time}</span><Badge variant="outline" className="text-[10px]">{e.index}</Badge>
                <span className="flex-1 break-all font-mono">{e.raw}</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setCase((x) => ({ ...x, evidence: x.evidence.filter((y) => y !== id) }))}>Remove</Button>
              </div>) : null; })}
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-2">
            <Textarea aria-label="Investigation note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What do you know, how do you know it, what's next?" className="min-h-[90px] text-xs" />
            <Button size="sm" disabled={!note.trim()} onClick={() => { setCase((x) => ({ ...x, notes: [...x.notes, { at: Date.now(), text: note.trim() }] })); emit({ action: "click:add-note", value: note.trim(), detail: `Added note: ${note.trim().slice(0, 60)}` }); setNote(""); }}>Add note</Button>
            <ul className="space-y-1.5">{c.notes.map((n, i) => <li key={i} className="rounded-md bg-muted/50 p-2 text-xs"><span className="font-mono text-[10px] text-muted-foreground">{new Date(n.at).toLocaleTimeString()}</span> {n.text}</li>)}</ul>
          </div>
        )}

        {tab === "mentor" && mentorSlot}
        {tab === "report" && reportSlot}
      </div>

      {ev && (
        <div className="border-t border-border bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center gap-2 text-xs"><span className="font-semibold">Event {ev.id}</span><span className="font-mono text-muted-foreground">{ev.time} · {ev.index} · {ev.sourcetype} · {ev.host}</span>
            <Button size="sm" variant="outline" className="ml-auto h-6 gap-1 px-2 text-[10px]" disabled={c.evidence.includes(ev.id)} onClick={() => addEvidence(ev.id)}><Plus className="h-3 w-3" /> Evidence</Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setOpenEvent(null)}>Close</Button></div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(ev.fields).map(([k, v]) => <div key={k} className="rounded bg-background px-2 py-1 font-mono text-[11px]"><span className="text-primary">{k}</span>={String(v)}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
