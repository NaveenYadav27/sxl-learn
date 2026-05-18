import { useNavigate, Link } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { CLUSTERS } from "./clustersData";
import { WORKLOADS } from "./workloadsData";
import { PODS } from "./podsData";
import { K8S_INCIDENTS } from "./incidentsData";
import type { Cluster } from "./types";
import { CLUSTER_TOKEN, pct } from "./lib";
import { BookOpen, ExternalLink } from "lucide-react";

export default function ClustersList() {
  const navigate = useNavigate();
  const kpis = useMemo(() => ({
    clusters: CLUSTERS.length,
    nodes: CLUSTERS.reduce((s, c) => s + c.nodes_total, 0),
    workloads: WORKLOADS.length,
    pods: PODS.length,
  }), []);

  const columns: Column<Cluster>[] = [
    { key: "name", header: "Cluster", sortable: true, render: (r) => (
      <div>
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.provider.toUpperCase()} · {r.region} · v{r.version}</div>
      </div>
    ) },
    { key: "status", header: "Status", width: "110px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${CLUSTER_TOKEN[r.status]}`}>{r.status}</span> },
    { key: "nodes", header: "Nodes", width: "100px", align: "right", render: (r) => <span className={`font-mono text-[12px] ${r.nodes_ready < r.nodes_total ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.nodes_ready} / {r.nodes_total}</span> },
    { key: "cpu", header: "CPU", width: "160px", render: (r) => <Bar used={pct(r.cpu_used, r.cpu_capacity)} label={`${r.cpu_used} / ${r.cpu_capacity} cores`} /> },
    { key: "mem", header: "Memory", width: "160px", render: (r) => <Bar used={pct(r.mem_used_gb, r.mem_capacity_gb)} label={`${r.mem_used_gb} / ${r.mem_capacity_gb} GiB`} /> },
    { key: "pods", header: "Pods", width: "140px", render: (r) => <Bar used={pct(r.pods_running, r.pods_capacity)} label={`${r.pods_running} / ${r.pods_capacity}`} /> },
    { key: "workloads", header: "Workloads", width: "90px", align: "right", render: (r) => <span className="font-mono text-[12px]">{r.workloads}</span> },
    { key: "namespaces", header: "Namespaces", render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.namespaces.join(", ")}</span> },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Kubernetes — Clusters" description="Multi-cluster fleet view across providers and regions." breadcrumb={<span>Reliability / Kubernetes / Clusters</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clusters" value={kpis.clusters} />
        <KpiCard label="Nodes" value={kpis.nodes} />
        <KpiCard label="Workloads" value={kpis.workloads} />
        <KpiCard label="Pods" value={kpis.pods} />
      </div>
      <BuildLearningStrip />
      <div className="px-4 pb-6">

        <SectionCard title="Cluster fleet" description={`${CLUSTERS.length} clusters`} bodyClassName="p-0">
          <DataTable<Cluster>
            columns={columns} rows={CLUSTERS} rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/ops/k8s/workloads?cluster=${r.id}`)}
            pageSize={25}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function Bar({ used, label }: { used: number; label: string }) {
  const color = used > 85 ? "bg-[hsl(var(--ops-critical))]" : used > 70 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-success))]";
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-[hsl(var(--ops-panel-2))]">
        <div className={`h-full ${color}`} style={{ width: `${used}%` }} />
      </div>
      <div className="mt-1 font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">{label} ({used}%)</div>
    </div>
  );
}

function BuildLearningStrip() {
  const m2 = K8S_INCIDENTS.filter((i) => i.module === "K8S-M2" && i.learning).slice(0, 4);
  return (
    <div className="px-4 pb-2">
      <SectionCard
        title="Build Learning Insights — M2 · Building Docker Images"
        description="Image-, build- and registry-side incidents driving the CI/CD KPIs below."
        bodyClassName="p-3"
      >
        <div className="mb-2 grid gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Avg image size" value="412 MB" />
          <Stat label="Avg layers" value="14" />
          <Stat label="Build success" value="92%" tone="success" />
          <Stat label="Registry p95" value="180 ms" />
          <Stat label="Cache hit" value="68%" tone="warning" />
          <Stat label="HIGH CVEs" value="4" tone="critical" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {m2.map((i) => (
            <Link
              key={i.id}
              to={`/ops/k8s-incidents/${i.id}`}
              className="block rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[hsl(var(--ops-accent))]">
                <BookOpen className="h-3 w-3" /> {i.learning?.concept}
              </div>
              <div className="mt-1 font-semibold text-[hsl(var(--ops-fg))]">{i.title}</div>
              <div className="mt-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">{i.learning?.meaning}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[hsl(var(--ops-accent))]">
                Investigate <ExternalLink className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "critical" }) {
  const color =
    tone === "critical" ? "text-[hsl(var(--ops-critical))]" :
    tone === "warning"  ? "text-[hsl(var(--ops-warning))]"  :
    tone === "success"  ? "text-[hsl(var(--ops-success))]"  :
                          "text-[hsl(var(--ops-fg))]";
  return (
    <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className={`font-mono text-[13px] font-semibold ${color}`}>{value}</div>
    </div>
  );
}
