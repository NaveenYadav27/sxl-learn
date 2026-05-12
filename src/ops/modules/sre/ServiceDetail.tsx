import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { OpsTabs } from "@/ops/components/OpsTabs";
import { EmptyState } from "@/ops/components/EmptyState";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { findService, SERVICES } from "./servicesData";
import { SLOS } from "./slosData";
import { MONITORS } from "./monitoringData";
import { HEALTH_TOKEN, TIER_TOKEN, SLO_TOKEN, MONITOR_TOKEN, rel } from "./lib";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function ServiceDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const s = findService(id);
  const [tab, setTab] = useState<"slos" | "alerts" | "deps" | "infra">("slos");

  if (!s) {
    return (
      <div className="p-6">
        <EmptyState title="Service not found" hint={`No service matches ${id}.`}
          action={<Link to="/ops/sre/services" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">← Back</Link>} />
      </div>
    );
  }

  const slos = SLOS.filter((x) => s.slos.includes(x.id));
  const alerts = MONITORS.filter((m) => m.service_id === s.id);
  const deps = SERVICES.filter((x) => s.dependencies.includes(x.id));
  const dependents = SERVICES.filter((x) => x.dependencies.includes(s.id));

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${s.name}`}
        description={s.description}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/sre/services" className="hover:text-[hsl(var(--ops-fg))]">Services</Link>
            <ChevronRight className="h-3 w-3" /><span>{s.name}</span>
          </span>
        }
        actions={
          <>
            <button onClick={() => navigate("/ops/sre/services")} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
            {s.runbook_url && <a href={s.runbook_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">Runbook <ExternalLink className="h-3 w-3" /></a>}
            {s.dashboard_url && <a href={s.dashboard_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]">Open dashboard</a>}
          </>
        }
      />
      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="Golden signals">
            <div className="grid gap-4 p-4 sm:grid-cols-4">
              <Sig label="Uptime 30d" value={`${s.uptime_30d.toFixed(2)}%`} />
              <Sig label="Error rate 5m" value={`${s.error_rate_5m.toFixed(2)}%`} bad={s.error_rate_5m > 1} />
              <Sig label="Latency p95" value={`${s.latency_p95_ms}ms`} />
              <Sig label="Latency p99" value={`${s.latency_p99_ms}ms`} />
              <Sig label="Throughput" value={`${s.rps} rps`} />
              <Sig label="Saturation" value={`${s.saturation}%`} bad={s.saturation > 80} />
              <Sig label="Tier" value={<span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TIER_TOKEN[s.tier]}`}>{s.tier.replace("_", " ")}</span>} />
              <Sig label="Health" value={<span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${HEALTH_TOKEN[s.health]}`}>{s.health}</span>} />
            </div>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            <OpsTabs active={tab} onChange={(k) => setTab(k as typeof tab)}
              tabs={[
                { key: "slos", label: "SLOs", count: slos.length },
                { key: "alerts", label: "Active alerts", count: alerts.length },
                { key: "deps", label: "Dependencies", count: deps.length + dependents.length },
                { key: "infra", label: "Infra & CIs", count: s.ci_ids.length + (s.related_workloads?.length ?? 0) },
              ]}
            />
            <div className="p-4">
              {tab === "slos" && (
                slos.length === 0 ? <EmptyState title="No SLOs" hint="No SLOs defined for this service." /> : (
                  <div className="space-y-2">
                    {slos.map((slo) => (
                      <div key={slo.id} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[12px] text-[hsl(var(--ops-fg))]">{slo.name}</div>
                            <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{slo.kind} · target {slo.objective}{slo.unit} · {slo.window_days}d</div>
                          </div>
                          <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SLO_TOKEN[slo.status]}`}>{slo.status.replace("_", " ")}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
                          <div><span className="text-[hsl(var(--ops-muted-fg))]">Current</span><div className="font-mono">{slo.current}{slo.unit}</div></div>
                          <div><span className="text-[hsl(var(--ops-muted-fg))]">Budget left</span><div className="font-mono">{slo.error_budget_pct}%</div></div>
                          <div><span className="text-[hsl(var(--ops-muted-fg))]">Burn 1h / 6h</span><div className="font-mono">{slo.burn_rate_1h}× / {slo.burn_rate_6h}×</div></div>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-[hsl(var(--ops-panel))]">
                          <div className={`h-full ${slo.status === "breached" ? "bg-[hsl(var(--ops-critical))]" : slo.status === "burning" ? "bg-[hsl(var(--ops-high))]" : slo.status === "at_risk" ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-success))]"}`} style={{ width: `${slo.error_budget_pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {tab === "alerts" && (
                alerts.length === 0 ? <EmptyState title="No active alerts" /> : (
                  <ul className="divide-y divide-[hsl(var(--ops-border))]">
                    {alerts.map((a) => (
                      <li key={a.id} className="flex items-center justify-between py-2 text-[12px]">
                        <div>
                          <div className="text-[hsl(var(--ops-fg))]">{a.rule_name}</div>
                          <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.summary} · {rel(a.fired_at)}</div>
                        </div>
                        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${MONITOR_TOKEN[a.state]}`}>{a.state}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
              {tab === "deps" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Depends on</div>
                    <ul className="mt-2 space-y-1">
                      {deps.length === 0 ? <li className="text-[11px] text-[hsl(var(--ops-muted-fg))] italic">No upstream deps</li> :
                        deps.map((d) => (
                          <li key={d.id}>
                            <Link to={`/ops/sre/services/${d.id}`} className="inline-flex items-center gap-2 text-[12px] hover:text-[hsl(var(--ops-accent))]">
                              <span className={`h-1.5 w-1.5 rounded-full ${d.health === "healthy" ? "bg-[hsl(var(--ops-success))]" : d.health === "degraded" ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-critical))]"}`} />
                              <span className="font-mono">{d.name}</span>
                              <span className="text-[hsl(var(--ops-muted-fg))]">{d.owner_team}</span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Used by</div>
                    <ul className="mt-2 space-y-1">
                      {dependents.length === 0 ? <li className="text-[11px] text-[hsl(var(--ops-muted-fg))] italic">No downstream consumers</li> :
                        dependents.map((d) => (
                          <li key={d.id}>
                            <Link to={`/ops/sre/services/${d.id}`} className="inline-flex items-center gap-2 text-[12px] hover:text-[hsl(var(--ops-accent))]">
                              <span className={`h-1.5 w-1.5 rounded-full ${d.health === "healthy" ? "bg-[hsl(var(--ops-success))]" : d.health === "degraded" ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-critical))]"}`} />
                              <span className="font-mono">{d.name}</span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
              {tab === "infra" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Configuration items</div>
                    <ul className="mt-2 space-y-1">
                      {s.ci_ids.map((ci) => (
                        <li key={ci}><Link to={`/ops/cmdb/${ci}`} className="text-[12px] text-[hsl(var(--ops-accent))] hover:underline font-mono">{ci}</Link></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Workloads (k8s)</div>
                    <ul className="mt-2 space-y-1">
                      {(s.related_workloads ?? []).map((w) => (
                        <li key={w}><Link to={`/ops/k8s/workloads`} className="text-[12px] text-[hsl(var(--ops-accent))] hover:underline font-mono">{w}</Link></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Ownership" bodyClassName="p-3 space-y-2 text-[12px]">
            <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Team</div><div>{s.owner_team}</div></div>
            <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">On-call</div><AssigneeChip assignee={s.on_call} /></div>
            {s.repo && <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Repository</div><div className="font-mono text-[11px]">{s.repo}</div></div>}
          </SectionCard>
          <SectionCard title="Quick actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {["Page on-call", "Open incident", "Trigger runbook", "Scale workload", "Roll back deploy"].map((q) => (
                <button key={q} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)] hover:text-[hsl(var(--ops-accent))]">{q}</button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Sig({ label, value, bad }: { label: string; value: React.ReactNode; bad?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className={`mt-1 font-mono text-[14px] ${bad ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-fg))]"}`}>{value}</div>
    </div>
  );
}
