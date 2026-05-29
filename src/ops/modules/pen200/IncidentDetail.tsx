import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { EmptyState } from "@/ops/components/EmptyState";
import { findPentestIncident } from "./incidentsData";
import { PENTEST_PHASES, type PentestSeverity } from "./types";
import { TOOL_CATALOG, PHASE_DEFAULTS } from "./toolStack";
import { getPentestLab } from "./incidentLabs";
import { PentestLabConsole } from "./PentestLabConsole";
import { PentestConceptPanel } from "./PentestConceptPanel";
import { ArrowLeft, ChevronRight, ExternalLink, Lightbulb, Skull, Target, BookOpen, Wrench, Terminal } from "lucide-react";

const SEV: Record<PentestSeverity, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high:     "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium:   "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low:      "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function PentestIncidentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const n = findPentestIncident(id);
  const lab = n ? getPentestLab(n.id) : undefined;
  const reachedSet = new Set(n?.reached_phases ?? []);

  if (!n) return (
    <div className="p-6">
      <EmptyState title="Finding not found" hint={`No record matches ${id}.`}
        action={<Link to="/ops/pen-incidents" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">← Back to queue</Link>} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${n.id} · ${n.title}`}
        breadcrumb={<span className="inline-flex items-center gap-1">
          <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/ops/pen-incidents" className="hover:text-[hsl(var(--ops-fg))]">PEN-200 Findings</Link>
          <ChevronRight className="h-3 w-3" /><span>{n.id}</span>
        </span>}
        actions={<>
          <button onClick={() => navigate("/ops/pen-incidents")} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {n.lab_slug && (
            <Link to={`/lab/${n.lab_slug}/sim`} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]">
              Open Lab <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </>}
      />

      <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] px-3 py-2 text-[12px]">
        <div className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" />
          <span className="text-[hsl(var(--ops-muted-fg))]">PEN-200 module:</span>
          <span className="font-semibold">{n.module_title}</span>
        </div>
        {lab && (
          <a href="#pen-lab" className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--ops-success))]">
            <Terminal className="h-3 w-3" /> Interactive Lab · {lab.steps.length} steps · ~{lab.estimated_minutes} min
          </a>
        )}
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {/* 5W1H */}
          <section className="rounded-md border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.08)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-warning))]">
                <Lightbulb className="h-3.5 w-3.5" /> Analyst Briefing · 5W1H
              </div>
              <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">Kill chain: <span className="font-semibold text-[hsl(var(--ops-fg))]">{n.kill_chain}</span></div>
            </div>
            <div className="grid gap-3 text-[12px] leading-relaxed sm:grid-cols-2 lg:grid-cols-3">
              {(["who","what","when","where","why","how"] as const).map((k) => (
                <div key={k}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-warning))]">{k}</div>
                  <div className="text-[hsl(var(--ops-fg))]">{n.briefing[k]}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-[hsl(var(--ops-warning)/0.3)] pt-2 text-[12px]">
              <span className="font-semibold text-[hsl(var(--ops-warning))]">Severity rationale: </span>
              <span className="text-[hsl(var(--ops-fg))]">{n.briefing.severity_rationale}</span>
            </div>
          </section>

          <div className="grid gap-3 lg:grid-cols-3">
            <SectionCard title="Description" bodyClassName="p-4 text-[13px] leading-relaxed">{n.description}</SectionCard>
            <SectionCard title={`Affected targets (${n.affected.length})`} bodyClassName="p-3 space-y-2">
              {n.affected.map((a) => (
                <div key={a.kind + a.name} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <Target className="h-3.5 w-3.5 text-[hsl(var(--ops-muted-fg))]" />
                      <span className="font-mono text-[hsl(var(--ops-fg))]">{a.name}</span>
                    </div>
                    <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV[a.severity]}`}>{a.severity}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.kind} · {a.detail}</div>
                  <div className="mt-1 text-[11px]">→ {a.action}</div>
                </div>
              ))}
            </SectionCard>
            <SectionCard title="Next steps" bodyClassName="p-3 space-y-1.5">
              {n.next_steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ops-muted-fg))]">{s.level}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </SectionCard>
          </div>

          <SectionCard title="Original event">
            <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed whitespace-pre">{n.original_event}</pre>
          </SectionCard>

          {/* Phase chain */}
          <SectionCard title={`Kill-chain progression · ${n.reached_phases.length} of ${PENTEST_PHASES.length} stages executed`}>
            <div className="flex flex-wrap items-stretch gap-1.5 p-3">
              {PENTEST_PHASES.map((p, i) => {
                const reached = reachedSet.has(p.id);
                const current = p.id === n.current_phase;
                return (
                  <div key={p.id} className="flex items-stretch">
                    <div className={["min-w-[120px] rounded-sm border px-2.5 py-2 text-[11px]",
                      current ? "border-[hsl(var(--ops-warning)/0.6)] bg-[hsl(var(--ops-warning)/0.10)]"
                      : reached ? "border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.10)]"
                      : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]"].join(" ")}>
                      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Stage {i + 1}</div>
                      <div className={`font-semibold ${current ? "text-[hsl(var(--ops-warning))]" : reached ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-fg))]"}`}>{p.label}</div>
                      <div className="mt-0.5 text-[10px] text-[hsl(var(--ops-muted-fg))]">{p.hint}</div>
                    </div>
                    {i < PENTEST_PHASES.length - 1 && <span className="self-center px-1 text-[hsl(var(--ops-muted-fg))]">→</span>}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Per-phase narrative */}
          <SectionCard title="Kill-chain walkthrough" description="How each of the 10 phases applies to this finding." bodyClassName="p-0">
            <ol className="divide-y divide-[hsl(var(--ops-border))]">
              {PENTEST_PHASES.map((p, i) => {
                const reached = reachedSet.has(p.id);
                const current = p.id === n.current_phase;
                const text = n.phase_walkthrough?.[p.id] ?? PHASE_DEFAULTS[p.id];
                const tag = current ? "CURRENT" : reached ? "EXECUTED" : "PENDING";
                const cls = current ? "border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))]"
                  : reached ? "border-[hsl(var(--ops-critical)/0.4)] bg-[hsl(var(--ops-critical)/0.12)] text-[hsl(var(--ops-critical))]"
                  : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))]";
                return (
                  <li key={p.id} className="grid grid-cols-[48px_140px_1fr_90px] items-start gap-3 px-4 py-3 text-[12px]">
                    <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{p.hint}</div>
                    </div>
                    <div className="leading-relaxed">{text}</div>
                    <span className={`inline-flex w-fit items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>{tag}</span>
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          {n.concept && <PentestConceptPanel concept={n.concept} />}

          {lab && (
            <div id="pen-lab" className="scroll-mt-20">
              <PentestLabConsole lab={lab} incidentId={n.id} />
            </div>
          )}

          {/* Aligned tool stack */}
          <SectionCard bodyClassName="p-0">
            <div className="flex items-center justify-between border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <Wrench className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" /> Tool stack · {n.aligned_tools.length} in play
              </div>
            </div>
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {n.aligned_tools.map((t) => {
                const d = TOOL_CATALOG[t]; if (!d) return null;
                return (
                  <li key={t} className="grid gap-2 px-4 py-3 text-[12px] md:grid-cols-[200px_1fr]">
                    <div className="space-y-1">
                      <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-1.5 py-0.5 text-[11px] font-semibold text-[hsl(var(--ops-accent))]">{d.tool}</span>
                      <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{d.category} · {d.module_title}</div>
                    </div>
                    <div>
                      <div className="leading-relaxed">{d.purpose}</div>
                      <div className="mt-1 text-[11px] italic text-[hsl(var(--ops-muted-fg))]">Why it matters: {d.why_it_matters}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {d.commands.map((c) => (
                          <code key={c} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[10.5px]">{c}</code>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Logs / metrics */}
          <div className="grid gap-3 lg:grid-cols-2">
            <SectionCard title="Tool output sample">
              <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] whitespace-pre-wrap">{n.logs_sample}</pre>
            </SectionCard>
            <SectionCard title="Engagement metrics">
              <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] whitespace-pre">{n.metrics_sample}</pre>
            </SectionCard>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-3">
          <SectionCard title="Engagement details">
            <div className="grid gap-3 p-4 sm:grid-cols-2 text-[12px]">
              <Field label="Severity"><span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV[n.severity]}`}>{n.severity}</span></Field>
              <Field label="Status"><span className="capitalize">{n.status.replace("_", " ")}</span></Field>
              <Field label="Owner"><span className="font-mono">{n.owner}</span></Field>
              <Field label="Engagement"><span className="font-mono">{n.engagement}</span></Field>
              <Field label="Scope"><span className="font-mono">{n.target_scope}</span></Field>
              <Field label="Target"><span className="font-mono break-all">{n.target}</span></Field>
              <Field label="Detected"><span className="text-[hsl(var(--ops-muted-fg))]">{rel(n.detected_at)}</span></Field>
              <Field label="Last event"><span className="text-[hsl(var(--ops-muted-fg))]">{rel(n.last_event_at)}</span></Field>
            </div>
          </SectionCard>
          <SectionCard title="Response actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {n.response_actions.map((r) => (
                <button key={r} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">{r}</button>
              ))}
            </div>
          </SectionCard>
          {n.cves?.length ? (
            <SectionCard title="Mapped weaknesses" bodyClassName="p-3 space-y-1.5 text-[12px]">
              {n.cves.map((c) => (
                <div key={c.id} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2">
                  <div className="font-mono">{c.id} · CVSS {c.cvss.toFixed(1)}</div>
                  <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{c.title}</div>
                </div>
              ))}
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
