import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { CLUSTERS } from "./clustersData";
import { WORKLOADS } from "./workloadsData";
import { PODS } from "./podsData";
import type { Cluster } from "./types";
import { CLUSTER_TOKEN, pct } from "./lib";

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
