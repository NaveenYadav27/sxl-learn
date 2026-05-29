import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { PEN_INCIDENTS } from "./incidentsData";
import { PEN_MODULES, type PentestSeverity, type PentestStatus, type PenModuleCode } from "./types";
import { AlertOctagon, BookOpen, ExternalLink, Skull } from "lucide-react";

const SEV: Record<PentestSeverity, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high:     "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium:   "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low:      "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};
const STATUS: Record<PentestStatus, string> = {
  open: "text-[hsl(var(--ops-critical))]",
  in_progress: "text-[hsl(var(--ops-warning))]",
  resolved: "text-[hsl(var(--ops-success))]",
};

export default function PentestIncidentsList() {
  const [sev, setSev] = useState<"all" | PentestSeverity>("all");
  const [status, setStatus] = useState<"all" | PentestStatus>("all");
  const [mod, setMod] = useState<"all" | PenModuleCode>("all");

  const rows = useMemo(() => PEN_INCIDENTS.filter((i) =>
    (sev === "all" || i.severity === sev) &&
    (status === "all" || i.status === status) &&
    (mod === "all" || i.module === mod),
  ).sort((a, b) => new Date(b.last_event_at).getTime() - new Date(a.last_event_at).getTime()), [sev, status, mod]);

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 } as Record<PentestSeverity, number>;
    PEN_INCIDENTS.forEach((i) => { c[i.severity]++; });
    return c;
  }, []);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="PEN-200 / OSCP+ Engagement Findings"
        description="Pentest-style incidents from recon to report, mapped to the OffSec PEN-200 syllabus. Each finding ships a 10-step Kali lab and a kill-chain concept walkthrough."
      />

      <div className="grid gap-3 p-4">
        <div className="rounded-md border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] p-3">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--ops-accent))]">
            <Skull className="h-4 w-4" /> PEN-200 Learning Hub — {PEN_INCIDENTS.length} kill-chain incidents
          </div>
          <div className="mt-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">
            5W1H briefing · attack tool cards · 10-step Kali lab · CVSS-ready remediation
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-4 py-2.5">
          <div className="flex items-center gap-3 text-[12px]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--ops-success))]" />
            <span className="text-[hsl(var(--ops-muted-fg))]">Engagement feed:</span>
            <span className="font-semibold text-[hsl(var(--ops-success))]">ACTIVE</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV.critical}`}>{counts.critical} crit</span>
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV.high}`}>{counts.high} high</span>
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV.medium}`}>{counts.medium} med</span>
            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV.low}`}>{counts.low} low</span>
          </div>
        </div>

        <div className="rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] p-3">
          <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
            <BookOpen className="h-3.5 w-3.5" /> Aligned to PEN-200 modules
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={mod === "all"} onClick={() => setMod("all")} label={`All (${PEN_INCIDENTS.length})`} />
            {PEN_MODULES.map((m) => {
              const c = PEN_INCIDENTS.filter((i) => i.module === m.code).length;
              if (c === 0) return null;
              return <Chip key={m.code} active={mod === m.code} onClick={() => setMod(m.code)} label={`${m.code} · ${c}`} title={m.title} />;
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Severity" value={sev} onChange={(v) => setSev(v as any)}
            opts={[["all", "all"], ["critical", "critical"], ["high", "high"], ["medium", "medium"], ["low", "low"]]} />
          <Select label="Status" value={status} onChange={(v) => setStatus(v as any)}
            opts={[["all", "all"], ["open", "open"], ["in_progress", "in progress"], ["resolved", "resolved"]]} />
          <div /><div />
        </div>

        <SectionCard title={`${rows.length} finding${rows.length === 1 ? "" : "s"}`} bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {rows.map((i) => (
              <li key={i.id}>
                <Link to={`/ops/pen-incidents/${i.id}`}
                  className="grid grid-cols-[110px_70px_1fr_180px_120px_90px] items-center gap-3 px-4 py-3 text-[12px] hover:bg-[hsl(var(--ops-panel-2))]">
                  <span className="font-mono text-[hsl(var(--ops-muted-fg))]">{i.id}</span>
                  <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.10)] px-1.5 py-0.5 text-center font-mono text-[10px] text-[hsl(var(--ops-accent))]" title={i.module_title}>{i.module}</span>
                  <span className="flex items-center gap-2 text-[hsl(var(--ops-fg))]">
                    <AlertOctagon className="h-3.5 w-3.5 text-[hsl(var(--ops-warning))]" />{i.title}
                  </span>
                  <span className="truncate font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{i.target}</span>
                  <span className={`text-[11px] uppercase tracking-wide ${STATUS[i.status]}`}>{i.status.replace("_", " ")}</span>
                  <span className={`inline-flex w-fit items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV[i.severity]}`}>{i.severity}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">
          Tip: each finding maps to the matching PEN-200 lab — open one and click <ExternalLink className="inline h-3 w-3" /> Open Lab from the detail page.
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className={[
      "rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors",
      active ? "border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.18)] text-[hsl(var(--ops-accent))]"
             : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]",
    ].join(" ")}>{label}</button>
  );
}

function Select({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <label className="block text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-2 py-1.5 text-[12px] text-[hsl(var(--ops-fg))]">
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
