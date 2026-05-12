import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { WORKLOADS } from "./workloadsData";
import { CLUSTERS, findCluster } from "./clustersData";
import type { Workload, WorkloadKind, WorkloadStatus } from "./types";
import { WORKLOAD_TOKEN, rel } from "./lib";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export default function WorkloadsList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialCluster = params.get("cluster") ?? "all";
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<string>(initialCluster);
  const [kind, setKind] = useState<WorkloadKind | "all">("all");
  const [status, setStatus] = useState<WorkloadStatus | "all">("all");

  const rows = useMemo(() => WORKLOADS.filter((w) => {
    if (cluster !== "all" && w.cluster_id !== cluster) return false;
    if (kind !== "all" && w.kind !== kind) return false;
    if (status !== "all" && w.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!w.name.toLowerCase().includes(q) && !w.namespace.toLowerCase().includes(q) && !w.image.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, cluster, kind, status]);

  const kpis = useMemo(() => ({
    total: WORKLOADS.length,
    ready: WORKLOADS.filter((w) => w.status === "ready").length,
    degraded: WORKLOADS.filter((w) => w.status === "degraded").length,
    failed: WORKLOADS.filter((w) => w.status === "failed").length,
  }), []);

  const columns: Column<Workload>[] = [
    { key: "name", header: "Workload", sortable: true, render: (r) => (
      <div className="min-w-[220px]">
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.image}</div>
      </div>
    ) },
    { key: "kind", header: "Kind", width: "100px", sortable: true, render: (r) => <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] uppercase">{r.kind}</span> },
    { key: "namespace", header: "Namespace", width: "120px", sortable: true, render: (r) => <span className="font-mono text-[11px]">{r.namespace}</span> },
    { key: "cluster_id", header: "Cluster", width: "120px", render: (r) => { const c = findCluster(r.cluster_id); return <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{c?.name ?? r.cluster_id}</span>; } },
    { key: "replicas", header: "Replicas", width: "90px", align: "right", render: (r) => <span className={`font-mono text-[12px] ${r.replicas_ready < r.replicas_desired ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.replicas_ready}/{r.replicas_desired}</span> },
    { key: "status", header: "Status", width: "110px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${WORKLOAD_TOKEN[r.status]}`}>{r.status}</span> },
    { key: "restarts_24h", header: "Restarts 24h", width: "100px", align: "right", sortable: true, render: (r) => <span className={`font-mono text-[12px] ${r.restarts_24h > 10 ? "text-[hsl(var(--ops-critical))]" : r.restarts_24h > 0 ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.restarts_24h}</span> },
    { key: "service_id", header: "Service", width: "140px", render: (r) => r.service_id ? <Link to={`/ops/sre/services/${r.service_id}`} className="font-mono text-[12px] text-[hsl(var(--ops-accent))] hover:underline">{r.service_id.replace("svc-", "")}</Link> : <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">—</span> },
    { key: "last_deploy_at", header: "Last deploy", width: "100px", sortable: true, sortValue: (r) => new Date(r.last_deploy_at).getTime(), render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.last_deploy_at)}</span> },
  ];

  const chips = [
    ...(cluster !== "all" ? [{ key: "c", label: "Cluster", value: findCluster(cluster)?.name ?? cluster, onRemove: () => setCluster("all") }] : []),
    ...(kind !== "all" ? [{ key: "k", label: "Kind", value: kind, onRemove: () => setKind("all") }] : []),
    ...(status !== "all" ? [{ key: "s", label: "Status", value: status, onRemove: () => setStatus("all") }] : []),
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Kubernetes — Workloads" description="Deployments, StatefulSets, DaemonSets, Jobs across all clusters." breadcrumb={<span>Reliability / Kubernetes / Workloads</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Workloads" value={kpis.total} />
        <KpiCard label="Ready" value={kpis.ready} intent="success" />
        <KpiCard label="Degraded" value={kpis.degraded} intent="warning" />
        <KpiCard label="Failed" value={kpis.failed} intent="critical" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="Workloads" description={`${rows.length} of ${WORKLOADS.length}`} bodyClassName="p-0">
          <DataTable<Workload>
            columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25}
            onRowClick={(r) => navigate(`/ops/k8s/pods?workload=${r.id}`)}
            expandable={(r) => (
              <div className="grid gap-3 sm:grid-cols-3 text-[12px]">
                <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Image</div><div className="font-mono text-[11px] break-all">{r.image}</div></div>
                <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Resources / pod</div><div className="font-mono text-[11px]">CPU {r.cpu_request_m}m · Mem {r.mem_request_mi}Mi</div></div>
                <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">HPA</div><div className="font-mono text-[11px]">{r.hpa_enabled ? `${r.hpa_min}–${r.hpa_max} replicas` : "disabled"}</div></div>
              </div>
            )}
            filters={
              <FilterBar
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder="Search workload, namespace, image..." chips={chips}
                actions={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Cluster</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Cluster</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        <DropdownMenuItem onClick={() => setCluster("all")} className="text-[12px]">All</DropdownMenuItem>
                        {CLUSTERS.map((c) => (
                          <DropdownMenuItem key={c.id} onClick={() => setCluster(c.id)} className="text-[12px] font-mono">{c.name}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Kind</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        {(["all", "Deployment", "StatefulSet", "DaemonSet", "CronJob", "Job"] as const).map((k) => (
                          <DropdownMenuItem key={k} onClick={() => setKind(k as WorkloadKind | "all")} className="text-[12px]">{k}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Status</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        {(["all", "ready", "progressing", "degraded", "failed"] as const).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => setStatus(s as WorkloadStatus | "all")} className="text-[12px] capitalize">{s}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
