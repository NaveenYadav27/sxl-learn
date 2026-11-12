import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ChevronDown, ChevronRight, Info, Play } from "lucide-react";
import type { SimEvent } from "../types";
import { COMMAND_DOCS, displayValue, runSpl, visibleColumns, type SplRun } from "../engine/splEngine";

const RANGES = [
  { v: "all", l: "All time (lab data)" },
  { v: "last_15m", l: "Last 15 minutes" },
  { v: "last_60m", l: "Last 60 minutes" },
  { v: "last_24h", l: "Last 24 hours" },
  { v: "last_7d", l: "Last 7 days" },
];

interface Props {
  events: SimEvent[];
  value: string;
  onChange: (v: string) => void;
  onRun?: (spl: string, run: SplRun) => void;
  onTimeRange?: (v: string) => void;
  datasetLabel?: string;
  compact?: boolean;
}

/** SPL editor + deterministic results + per-command Explain. Educational — not real Splunk. */
export function SplWorkbench({ events, value, onChange, onRun, onTimeRange, datasetLabel, compact }: Props) {
  const [range, setRange] = useState("all");
  const [run, setRun] = useState<SplRun | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState<number | null>(null);

  const indexes = useMemo(() => {
    const m = new Map<string, number>();
    events.forEach((e) => m.set(e.index, (m.get(e.index) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [events]);

  function execute() {
    const r = runSpl(value, events, { timeRange: range });
    setRun(r); setOpen(null); setShowRaw(null);
    onRun?.(value, r);
  }

  const cols = run ? visibleColumns(run) : [];
  const shown = run?.rows.slice(0, 100) ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-card p-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">SPL · educational search simulator</span>
          {datasetLabel && <span className="text-[10px] text-muted-foreground">Dataset: {datasetLabel} · {events.length} events</span>}
        </div>
        <Textarea
          aria-label="SPL search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); execute(); } }}
          className={`font-mono text-xs ${compact ? "min-h-[70px]" : "min-h-[96px]"}`}
          placeholder="index=auth action=failure | stats count by src_ip"
          spellCheck={false}
        />
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <select
            aria-label="Time range"
            className="h-8 rounded border border-border bg-background px-2 text-xs"
            value={range}
            onChange={(e) => { setRange(e.target.value); onTimeRange?.(e.target.value); }}
          >
            {RANGES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
          <Button size="sm" className="gap-1" onClick={execute}><Play className="h-3 w-3" /> Search</Button>
          <span className="text-[10px] text-muted-foreground">Ctrl/⌘ + Enter</span>
          <div className="flex-1" />
          <div className="hidden md:flex flex-wrap gap-1">
            {indexes.map(([i, n]) => (
              <button key={i} type="button" onClick={() => onChange(`index=${i}`)} className="rounded border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted">
                index={i} <span className="opacity-60">({n})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {run?.error && (
        <div role="alert" className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <div><div className="font-semibold">Search error</div><div className="text-foreground/90">{run.error}</div></div>
        </div>
      )}
      {run?.warning && !run.error && (
        <div className="flex gap-2 rounded-md border border-warning/40 bg-warning/10 p-2 text-[11px]"><Info className="h-3.5 w-3.5 text-warning" />{run.warning}</div>
      )}

      {run && run.stages.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pipeline — what each command did</div>
          <ol className="divide-y divide-border">
            {run.stages.map((s, i) => {
              const doc = COMMAND_DOCS[s.name];
              const isOpen = open === i;
              return (
                <li key={i} className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{i === 0 ? s.name : `| ${s.name}`}</Badge>
                    <code className="flex-1 truncate text-[11px] text-foreground/80">{s.command}</code>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.rowsIn} → {s.rowsOut}</span>
                    <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[11px]" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                      {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} Explain
                    </Button>
                  </div>
                  {isOpen && (
                    <div className="mt-2 space-y-1.5 rounded bg-muted/50 p-2 text-[11px] leading-relaxed">
                      <p><span className="font-semibold">This run:</span> {s.text}</p>
                      {doc && <>
                        <p><span className="font-semibold">What {doc.name} does:</span> {doc.purpose}</p>
                        <p><span className="font-semibold">Syntax:</span> <code className="font-mono">{doc.syntax}</code></p>
                        <p className="text-muted-foreground"><span className="font-semibold">Tip:</span> {doc.tip}</p>
                      </>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {run && !run.error && (
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{run.mode === "events" ? "Events" : "Statistics"}</span>
            <Badge variant="outline" className="text-[10px]">{run.rows.length} {run.mode === "events" ? "events" : "rows"}</Badge>
            {run.mode === "table" && <span className="text-[10px] text-muted-foreground">from {run.eventCount} matching events</span>}
            {run.rows.length > 100 && <span className="text-[10px] text-muted-foreground">showing first 100</span>}
          </div>
          {run.rows.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">No results. Check spelling of field values, the index name and the time range.</div>
          ) : (
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted text-muted-foreground">
                  <tr>{cols.map((c) => <th key={c} className="whitespace-nowrap px-2 py-1.5 text-left font-medium">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {shown.map((r, i) => (
                    <tr key={i} className="border-t border-border align-top hover:bg-muted/40">
                      {cols.map((c) => (
                        <td key={c} className={`px-2 py-1 font-mono ${c === "_raw" ? "max-w-[520px]" : "whitespace-nowrap"}`}>
                          {c === "_raw" ? (
                            <button type="button" className="text-left" onClick={() => setShowRaw(showRaw === i ? null : i)}>
                              <span className={showRaw === i ? "break-all" : "line-clamp-1 break-all"}>{displayValue(r[c])}</span>
                            </button>
                          ) : displayValue(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
