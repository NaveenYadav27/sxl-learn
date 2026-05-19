import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { OpsTabs } from "@/ops/components/OpsTabs";
import { EmptyState } from "@/ops/components/EmptyState";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { findK8sIncident, K8S_PHASES, type K8sIncidentSeverity, type K8sPhaseId } from "./incidentsData";
import { TOOL_CATALOG, PHASE_DEFAULTS } from "./toolStack";
import { getIncidentLab } from "./incidentLabs";
import { IncidentLabConsole } from "./IncidentLabConsole";
import { ArrowLeft, ChevronRight, ExternalLink, Lightbulb, ShieldAlert, Boxes, BookOpen, Wrench, Terminal } from "lucide-react";

const SEV_TOKEN: Record<K8sIncidentSeverity, string> = {
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

export default function K8sIncidentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const n = findK8sIncident(id);
  const [tab, setTab] = useState<"intel" | "logs" | "metrics" | "vuln" | "response">("intel");

  const phaseIdx = useMemo(() => K8S_PHASES.findIndex((p) => p.id === n?.current_phase), [n]);
  const failedSet = useMemo(() => new Set(n?.failed_phases ?? []), [n]);
  const lab = n ? getIncidentLab(n.id) : undefined;

  if (!n) {
    return (
      <div className="p-6">
        <EmptyState
          title="Incident not found"
          hint={`No record matches ${id}.`}
          action={
            <Link to="/ops/k8s-incidents" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">
              ← Back to queue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${n.id} · ${n.title}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/k8s-incidents" className="hover:text-[hsl(var(--ops-fg))]">K8s Incidents</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{n.id}</span>
          </span>
        }
        actions={
          <>
            <button onClick={() => navigate("/ops/k8s-incidents")} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            {n.lab_slug && (
              <Link
                to={`/lab/${n.lab_slug}/sim`}
                className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]"
              >
                Open Lab <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-success))]">
              Resolve
            </button>
          </>
        }
      />

      {/* Curriculum alignment strip */}
      <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] px-3 py-2 text-[12px]">
        <div className="inline-flex items-center gap-1.5 text-[hsl(var(--ops-fg))]">
          <BookOpen className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" />
          <span className="text-[hsl(var(--ops-muted-fg))]">Curriculum module:</span>
          <span className="font-semibold">{n.module_title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lab && (
            <a href="#incident-lab-console" className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--ops-success))]">
              <Terminal className="h-3 w-3" /> Interactive Lab · {lab.steps.length} steps · ~{lab.estimated_minutes} min
            </a>
          )}
          {n.lab_slug && (
            <Link to={`/lab/${n.lab_slug}/sim`} className="inline-flex items-center gap-1 text-[hsl(var(--ops-accent))] hover:underline">
              Open the matching lab <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {/* Analyst briefing — yellow card */}
          <section className="rounded-md border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.08)] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-warning))]">
                <Lightbulb className="h-3.5 w-3.5" /> Analyst Briefing · 5W1H
              </div>
              <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">
                Failure chain: <span className="font-semibold text-[hsl(var(--ops-fg))]">{n.failure_chain}</span>
              </div>
            </div>
            <div className="grid gap-3 text-[12px] leading-relaxed sm:grid-cols-2 lg:grid-cols-3">
              <Briefing k="Who"   v={n.briefing.who} />
              <Briefing k="What"  v={n.briefing.what} />
              <Briefing k="When"  v={n.briefing.when} />
              <Briefing k="Where" v={n.briefing.where} />
              <Briefing k="Why"   v={n.briefing.why} />
              <Briefing k="How"   v={n.briefing.how} />
            </div>
            <div className="mt-3 border-t border-[hsl(var(--ops-warning)/0.3)] pt-2 text-[12px]">
              <span className="font-semibold text-[hsl(var(--ops-warning))]">Severity rationale: </span>
              <span className="text-[hsl(var(--ops-fg))]">{n.briefing.severity_rationale}</span>
            </div>
          </section>

          {/* Top row: description / affected / next steps */}
          <div className="grid gap-3 lg:grid-cols-3">
            <SectionCard title="Description" bodyClassName="p-4 text-[13px] leading-relaxed text-[hsl(var(--ops-fg))]">
              {n.description}
            </SectionCard>

            <SectionCard title={`Affected assets (${n.affected.length})`} bodyClassName="p-3 space-y-2">
              {n.affected.map((a) => (
                <div key={a.kind + a.name} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <Boxes className="h-3.5 w-3.5 text-[hsl(var(--ops-muted-fg))]" />
                      <span className="font-mono text-[hsl(var(--ops-fg))]">{a.name}</span>
                    </div>
                    <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TOKEN[a.severity]}`}>{a.severity}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.kind} · {a.detail}</div>
                  <div className="mt-1 text-[11px] text-[hsl(var(--ops-fg))]">{a.action}</div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Next steps" bodyClassName="p-3 space-y-1.5">
              {n.next_steps.map((s) => (
                <div key={s.level + s.text} className="flex items-start gap-2 text-[12px] text-[hsl(var(--ops-fg))]">
                  <span className="mt-0.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ops-muted-fg))]">{s.level}</span>
                  <span>{s.text}</span>
                </div>
              ))}
              <button className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1.5 text-[12px] text-[hsl(var(--ops-accent))]">
                <ExternalLink className="h-3 w-3" /> Open Full Triage
              </button>
            </SectionCard>
          </div>

          {/* Original event */}
          <SectionCard title="Original event">
            <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre">
{n.original_event}
            </pre>
          </SectionCard>

          {/* Phase chain */}
          <SectionCard title={`Pipeline phases · ${n.failed_phases.length} stage${n.failed_phases.length === 1 ? "" : "s"} failed`}>
            <div className="flex flex-wrap items-stretch gap-1.5 p-3">
              {K8S_PHASES.map((p, idx) => {
                const failed = failedSet.has(p.id);
                const current = p.id === n.current_phase;
                return (
                  <div key={p.id} className="flex items-stretch">
                    <div
                      className={[
                        "min-w-[120px] rounded-sm border px-2.5 py-2 text-[11px]",
                        failed
                          ? "border-[hsl(var(--ops-critical)/0.6)] bg-[hsl(var(--ops-critical)/0.12)]"
                          : current
                          ? "border-[hsl(var(--ops-warning)/0.6)] bg-[hsl(var(--ops-warning)/0.10)]"
                          : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]",
                      ].join(" ")}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Stage {idx + 1}</div>
                      <div className={`font-semibold ${failed ? "text-[hsl(var(--ops-critical))]" : current ? "text-[hsl(var(--ops-warning))]" : "text-[hsl(var(--ops-fg))]"}`}>{p.label}</div>
                      <div className="mt-0.5 text-[10px] text-[hsl(var(--ops-muted-fg))]">{p.hint}</div>
                    </div>
                    {idx < K8S_PHASES.length - 1 && (
                      <span className="self-center px-1 text-[hsl(var(--ops-muted-fg))]">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] px-3 py-2 text-[11px] text-[hsl(var(--ops-muted-fg))]">
              Current phase: <span className="font-semibold text-[hsl(var(--ops-fg))]">{K8S_PHASES[phaseIdx]?.label}</span> · failed: {n.failed_phases.map((id) => K8S_PHASES.find((p) => p.id === id)?.label).join(", ")}
            </div>
          </SectionCard>

          {/* Full DevOps cycle walkthrough — every phase explained */}
          <SectionCard
            title="DevOps cycle walkthrough"
            description="How each of the 10 phases applies to this specific incident."
            bodyClassName="p-0"
          >
            <ol className="divide-y divide-[hsl(var(--ops-border))]">
              {K8S_PHASES.map((p, idx) => {
                const failed = failedSet.has(p.id);
                const current = p.id === n.current_phase;
                const text = n.phase_walkthrough?.[p.id] ?? PHASE_DEFAULTS[p.id];
                const tag = failed ? "FAILED" : current ? "CURRENT" : idx < phaseIdx ? "PASSED" : "PENDING";
                const tagCls = failed
                  ? "border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))]"
                  : current
                  ? "border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))]"
                  : idx < phaseIdx
                  ? "border-[hsl(var(--ops-success)/0.4)] bg-[hsl(var(--ops-success)/0.12)] text-[hsl(var(--ops-success))]"
                  : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))]";
                return (
                  <li key={p.id} className="grid grid-cols-[48px_140px_1fr_90px] items-start gap-3 px-4 py-3 text-[12px]">
                    <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{String(idx + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-semibold text-[hsl(var(--ops-fg))]">{p.label}</div>
                      <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{p.hint}</div>
                    </div>
                    <div className="leading-relaxed text-[hsl(var(--ops-fg))]">{text}</div>
                    <span className={`inline-flex w-fit items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${tagCls}`}>{tag}</span>
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          {/* Interactive step-by-step lab (M1 / M2 incidents) */}
          {lab && <IncidentLabConsole lab={lab} incidentId={n.id} />}

          {/* Deep learning block — only rendered for M1 / M2 incidents that ship a `learning` payload */}
          {n.learning && <LearningBlock learning={n.learning} />}

          {/* Tool stack — explain every aligned tool */}
          <SectionCard bodyClassName="p-0">
            <div className="flex items-center justify-between border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--ops-fg))]">
                <Wrench className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" /> Tool stack · {n.aligned_tools.length} tools in play
              </div>
              <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">Each tool mapped to its DevOps phase and curriculum module.</div>
            </div>
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {n.aligned_tools.map((t) => {
                const d = TOOL_CATALOG[t];
                if (!d) return null;
                return (
                  <li key={t} className="grid gap-2 px-4 py-3 text-[12px] md:grid-cols-[200px_1fr]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-1.5 py-0.5 text-[11px] font-semibold text-[hsl(var(--ops-accent))]">
                          {d.tool}
                        </span>
                        <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">
                          {d.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{d.module_title}</div>
                      <div className="flex flex-wrap gap-1">
                        {d.phases.map((ph) => (
                          <span key={ph} className="rounded-sm border border-[hsl(var(--ops-border))] px-1 py-0.5 text-[10px] text-[hsl(var(--ops-muted-fg))]">
                            {K8S_PHASES.find((x) => x.id === ph)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="leading-relaxed text-[hsl(var(--ops-fg))]">{d.purpose}</div>
                      <div className="text-[11px] italic text-[hsl(var(--ops-muted-fg))]">Why it matters: {d.why_it_matters}</div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {d.commands.map((c) => (
                          <code key={c} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[10.5px] text-[hsl(var(--ops-fg))]">
                            {c}
                          </code>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Cross-tool enrichment */}
          <SectionCard bodyClassName="p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[hsl(var(--ops-border))]">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--ops-fg))]">
                <ShieldAlert className="h-3.5 w-3.5 text-[hsl(var(--ops-accent))]" /> Cross-tool enrichment · {n.aligned_tools.length} aligned tools · {n.data_sources.length} data sources
              </div>
              <div className="flex flex-wrap gap-1">
                {n.data_sources.map((d, i) => (
                  <span key={d} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">
                    D{i + 1} · {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-4 py-2 border-b border-[hsl(var(--ops-border))] flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Aligned tools:</span>
              {n.aligned_tools.map((t) => (
                <span key={t} className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.10)] px-1.5 py-0.5 text-[11px] text-[hsl(var(--ops-accent))]">{t}</span>
              ))}
            </div>
            <OpsTabs
              active={tab}
              onChange={(k) => setTab(k as typeof tab)}
              tabs={[
                { key: "intel",    label: "Threat Intel" },
                { key: "logs",     label: "Logs" },
                { key: "metrics",  label: "Metrics" },
                { key: "vuln",     label: "Vulnerabilities", count: n.cves?.length ?? 0 },
                { key: "response", label: "Response" },
              ]}
            />
            <div className="p-4">
              {tab === "intel" && (
                <div className="text-[12px] leading-relaxed text-[hsl(var(--ops-fg))]">
                  Correlated by phase <span className="font-semibold">{K8S_PHASES.find((p) => p.id === n.current_phase)?.label}</span> across {n.aligned_tools.join(", ")}. {n.briefing.how}
                </div>
              )}
              {tab === "logs" && (
                <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre-wrap break-words">
{n.logs_sample}
                </pre>
              )}
              {tab === "metrics" && (
                <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre">
{n.metrics_sample}
                </pre>
              )}
              {tab === "vuln" && (
                !n.cves?.length ? (
                  <EmptyState title="No CVEs mapped" hint="This incident is not tied to an image scan finding." />
                ) : (
                  <table className="w-full text-[12px]">
                    <thead className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                      <tr><th className="text-left py-1.5">CVE</th><th className="text-left">CVSS</th><th className="text-left">Title</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--ops-border))]">
                      {n.cves.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 font-mono">{c.id}</td>
                          <td className="py-2 font-mono">{c.cvss.toFixed(1)}</td>
                          <td className="py-2">{c.title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
              {tab === "response" && (
                <div className="flex flex-wrap gap-2">
                  {n.response_actions.map((r) => (
                    <button key={r} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)] hover:text-[hsl(var(--ops-accent))]">
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-3">
          <SectionCard title="Incident details">
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <Field label="Severity">
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TOKEN[n.severity]}`}>{n.severity}</span>
              </Field>
              <Field label="Status"><span className="capitalize text-[13px]">{n.status.replace("_", " ")}</span></Field>
              <Field label="Owner"><AssigneeChip assignee={{ id: n.owner, name: n.owner, group: "K8s Ops" }} /></Field>
              <Field label="Cluster"><span className="font-mono text-[12px]">{n.cluster}</span></Field>
              <Field label="Namespace"><span className="font-mono text-[12px]">{n.namespace}</span></Field>
              <Field label="Service"><span className="font-mono text-[12px]">{n.service}</span></Field>
              <Field label="Detected"><span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(n.detected_at)}</span></Field>
              <Field label="Last event"><span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(n.last_event_at)}</span></Field>
            </div>
          </SectionCard>

          <SectionCard title="Quick actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {n.lab_slug && (
                <Link to={`/lab/${n.lab_slug}/sim`} className="inline-flex items-center justify-between rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1.5 text-left text-[12px] text-[hsl(var(--ops-accent))]">
                  <span>Open lab simulator</span><ExternalLink className="h-3 w-3" />
                </Link>
              )}
              <button className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px]">kubectl rollout undo</button>
              <button className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px]">Open in Grafana</button>
              <button className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px]">Promote to ITSM Incident</button>
              <button className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px]">Suppress 1h</button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

type LearningPayload = NonNullable<ReturnType<typeof findK8sIncident>>["learning"];

function LearningBlock({ learning }: { learning: NonNullable<LearningPayload> }) {
  const [audience, setAudience] = useState<"fresher" | "engineer">("fresher");
  const [shell, setShell] = useState<"bash" | "powershell">("bash");
  const cmds = shell === "bash" ? learning.commands_bash : learning.commands_powershell;
  return (
    <>
      <SectionCard
        title={`Runtime Learning · ${learning.concept}`}
        description="Plain-language meaning, enterprise impact, and a depth toggle for fresher vs experienced engineer."
        bodyClassName="p-0"
      >
        <div className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr] text-[12px] leading-relaxed">
          <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Meaning</div>
            <div className="text-[hsl(var(--ops-fg))]">{learning.meaning}</div>
          </div>
          <div className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] p-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-accent))]">Enterprise impact</div>
            <div className="text-[hsl(var(--ops-fg))]">{learning.enterprise_impact}</div>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--ops-border))]">
          <div className="flex items-center gap-1 border-b border-[hsl(var(--ops-border))] px-3 py-1.5 text-[11px]">
            <span className="mr-1 uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Audience:</span>
            <ToggleBtn active={audience === "fresher"} onClick={() => setAudience("fresher")}>Fresher view</ToggleBtn>
            <ToggleBtn active={audience === "engineer"} onClick={() => setAudience("engineer")}>Engineer view</ToggleBtn>
          </div>
          <div className="p-4 text-[12px] leading-relaxed text-[hsl(var(--ops-fg))]">
            {audience === "fresher" ? learning.fresher_view : learning.engineer_view}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Real commands"
        description="Copy-paste these directly into a lab shell. Tabs switch between Bash (Linux/macOS) and PowerShell (Windows / Docker Desktop)."
        bodyClassName="p-0"
      >
        <div className="flex items-center gap-1 border-b border-[hsl(var(--ops-border))] px-3 py-1.5 text-[11px]">
          <ToggleBtn active={shell === "bash"} onClick={() => setShell("bash")}>Bash</ToggleBtn>
          <ToggleBtn active={shell === "powershell"} onClick={() => setShell("powershell")}>PowerShell</ToggleBtn>
        </div>
        <ul className="divide-y divide-[hsl(var(--ops-border))]">
          {cmds.map((c, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2">
              <code className="overflow-x-auto rounded-sm bg-[hsl(var(--ops-panel-2))] px-2 py-1 font-mono text-[11.5px] text-[hsl(var(--ops-fg))]">{c}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(c)}
                className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] uppercase text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-accent))]"
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Recovery guidance" bodyClassName="p-3 space-y-1.5">
        {learning.recovery.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-[hsl(var(--ops-fg))]">
            <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] text-[10px] font-semibold text-[hsl(var(--ops-success))]">{i + 1}</span>
            <span>{r}</span>
          </div>
        ))}
      </SectionCard>
    </>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.18)] text-[hsl(var(--ops-accent))]"
          : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Briefing({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="font-semibold text-[hsl(var(--ops-warning))]">{k}:</span>{" "}
      <span className="text-[hsl(var(--ops-fg))]">{v}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
