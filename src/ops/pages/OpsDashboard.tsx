import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiCard";
import { SectionCard } from "../components/SectionCard";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusBadge } from "../components/StatusBadge";
import { INCIDENTS } from "../modules/itsm/incidentsData";
import { CHANGES } from "../modules/itsm/changesData";
import { ALERTS } from "../modules/soc/alertsData";
import { NOTABLES } from "../modules/soc/notablesData";
import { SERVICES } from "../modules/sre/servicesData";
import { SLOS } from "../modules/sre/slosData";
import { MONITORS } from "../modules/sre/monitoringData";
import { CLUSTERS } from "../modules/k8s/clustersData";
import { WORKLOADS } from "../modules/k8s/workloadsData";
import { PODS } from "../modules/k8s/podsData";
import { HEALTH_TOKEN, SLO_TOKEN } from "../modules/sre/lib";
import { POD_TOKEN } from "../modules/k8s/lib";

export default function OpsDashboard() {
  const openIncidents = INCIDENTS.filter((i) => i.status !== "resolved" && i.status !== "closed");
  const critIncidents = openIncidents.filter((i) => i.severity === "critical").length;
  const activeAlerts = ALERTS.filter((a) => a.status !== "resolved" && a.status !== "closed").length;
  const openNotables = NOTABLES.filter((n) => n.status !== "resolved" && n.status !== "closed").length;
  const pendingChanges = CHANGES.filter((c) => c.approvals.some((a) => a.status === "pending")).length;
  const firingMonitors = MONITORS.filter((m) => m.state === "alerting").length;
  const breachedSlos = SLOS.filter((s) => s.status === "breached" || s.status === "burning").length;
  const failingWorkloads = WORKLOADS.filter((w) => w.status === "degraded" || w.status === "failed").length;
  const failingPods = PODS.filter((p) => ["CrashLoopBackOff", "ImagePullBackOff", "Failed"].includes(p.phase)).length;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Operations Dashboard"
        description="Single pane of glass across ITSM, SOC, and reliability operations."
        breadcrumb={<span>Operate / Dashboard</span>}
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Course
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Incidents" value={openIncidents.length} hint={`${critIncidents} critical`} intent={critIncidents > 0 ? "critical" : "default"} />
        <KpiCard label="Active Alerts" value={activeAlerts} hint={`${openNotables} ES notables`} intent={activeAlerts > 5 ? "warning" : "default"} />
        <KpiCard label="Pending Changes" value={pendingChanges} hint="Awaiting CAB approval" intent="default" />
        <KpiCard label="Firing Monitors" value={firingMonitors} hint="Across Grafana / Prom / DD" intent={firingMonitors > 0 ? "critical" : "success"} />
      </div>

      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="SLOs Breached / Burning" value={breachedSlos} intent={breachedSlos > 0 ? "critical" : "success"} hint={`${SLOS.length} SLOs tracked`} />
        <KpiCard label="Degraded Workloads" value={failingWorkloads} intent={failingWorkloads > 0 ? "warning" : "success"} hint={`${WORKLOADS.length} k8s workloads`} />
        <KpiCard label="Failing Pods" value={failingPods} intent={failingPods > 0 ? "critical" : "success"} hint={`${PODS.length} total pods`} />
        <KpiCard label="Clusters" value={CLUSTERS.length} hint={`${CLUSTERS.reduce((s, c) => s + c.nodes_total, 0)} nodes`} />
      </div>

      <div className="grid gap-3 px-4 pb-6 lg:grid-cols-3">
        <SectionCard title="Top open incidents" description="Highest severity, unresolved" className="lg:col-span-2" bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {openIncidents.slice(0, 6).map((i) => (
              <li key={i.number} className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="min-w-0 flex-1">
                  <Link to={`/ops/incidents/${i.number}`} className="text-[12px] text-[hsl(var(--ops-accent))] font-mono">{i.number}</Link>
                  <span className="ml-2 text-[12px] text-[hsl(var(--ops-fg))]">{i.short_description}</span>
                </div>
                <SeverityBadge severity={i.severity} />
                <StatusBadge status={i.status} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Service health" description="Top services" bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-2 text-[12px]">
                <Link to={`/ops/sre/services/${s.id}`} className="font-mono text-[hsl(var(--ops-accent))] hover:underline">{s.name}</Link>
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${HEALTH_TOKEN[s.health]}`}>{s.health}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="SLOs at risk" description="Burning or breached" className="lg:col-span-2" bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {SLOS.filter((s) => s.status !== "healthy").slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2 text-[12px]">
                <div>
                  <div>{s.name}</div>
                  <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">budget {s.error_budget_pct}% · burn {s.burn_rate_1h}× / 1h</div>
                </div>
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SLO_TOKEN[s.status]}`}>{s.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Failing pods" description="Across all clusters" bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {PODS.filter((p) => ["CrashLoopBackOff", "ImagePullBackOff", "Failed"].includes(p.phase)).slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2 text-[12px]">
                <span className="truncate font-mono text-[11px]">{p.name}</span>
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${POD_TOKEN[p.phase]}`}>{p.phase}</span>
              </li>
            ))}
            {PODS.filter((p) => ["CrashLoopBackOff", "ImagePullBackOff", "Failed"].includes(p.phase)).length === 0 && (
              <li className="px-4 py-3 text-[12px] text-[hsl(var(--ops-muted-fg))] italic">All pods healthy</li>
            )}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
