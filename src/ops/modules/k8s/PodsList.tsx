import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { PODS } from "./podsData";
import { CLUSTERS, findCluster } from "./clustersData";
import { findWorkload } from "./workloadsData";
import type { Pod, PodPhase } from "./types";
import { POD_TOKEN } from "./lib";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export default function PodsList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const wlFilter = params.get("workload");
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState<string>("all");
  const [phase, setPhase] = useState<PodPhase | "all">("all");

  const rows = useMemo(() => PODS.filter((p) => {
    if (wlFilter && p.workload_id !== wlFilter) return false;
    if (cluster !== "all" && p.cluster_id !== cluster) return false;
    if (phase !== "all" && p.phase !== phase) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.namespace.toLowerCase().includes(q) && !p.node.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, cluster, phase, wlFilter]);

  const kpis = useMemo(() => ({
    total: PODS.length,
    running: PODS.filter((p) => p.phase === "Running").length,
    pending: PODS.filter((p) => p.phase === "Pending").length,
    failed: PODS.filter((p) => ["CrashLoopBackOff", "ImagePullBackOff", "Failed"].includes(p.phase)).length,
  }), []);

  const columns: Column<Pod>[] = [
    { key: "name", header: "Pod", sortable: true, render: (r) => (
      <div className="min-w-[260px]">
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.namespace} · {findCluster(r.cluster_id)?.name}</div>
      </div>
    ) },
    { key: "ready", header: "Ready", width: "70px", align: "right", render: (r) => <span className={`font-mono text-[12px] ${r.ready_containers < r.total_containers ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.ready_containers}/{r.total_containers}</span> },
    { key: "phase", header: "Phase", width: "150px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${POD_TOKEN[r.phase]}`}>{r.phase}</span> },
    { key: "restarts", header: "Restarts", width: "80px", align: "right", sortable: true, render: (r) => <span className={`font-mono text-[12px] ${r.restarts > 10 ? "text-[hsl(var(--ops-critical))]" : r.restarts > 0 ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.restarts}</span> },
    { key: "age", header: "Age", width: "70px", render: (r) => <span className="font-mono text-[11px]">{r.age}</span> },
    { key: "node", header: "Node", width: "150px", render: (r) => <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.node}</span> },
    { key: "ip", header: "IP", width: "120px", render: (r) => <span className="font-mono text-[11px]">{r.ip}</span> },
    { key: "qos", header: "QoS", width: "100px", render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.qos}</span> },
  ];

  const chips = [
    ...(wlFilter ? [{ key: "w", label: "Workload", value: findWorkload(wlFilter)?.name ?? wlFilter, onRemove: () => navigate("/ops/k8s/pods") }] : []),
    ...(cluster !== "all" ? [{ key: "c", label: "Cluster", value: findCluster(cluster)?.name ?? cluster, onRemove: () => setCluster("all") }] : []),
    ...(phase !== "all" ? [{ key: "p", label: "Phase", value: phase, onRemove: () => setPhase("all") }] : []),
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Kubernetes — Pods" description="Live pod inventory with phase, restarts, containers and events." breadcrumb={<span>Reliability / Kubernetes / Pods</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pods" value={kpis.total} />
        <KpiCard label="Running" value={kpis.running} intent="success" />
        <KpiCard label="Pending" value={kpis.pending} intent="warning" />
        <KpiCard label="Failing" value={kpis.failed} intent="critical" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="Pods" description={`${rows.length} of ${PODS.length}`} bodyClassName="p-0">
          <DataTable<Pod>
            columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25}
            expandable={(r) => (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))] mb-1">Containers</div>
                  <table className="w-full text-[11px]">
                    <thead className="text-[hsl(var(--ops-muted-fg))]"><tr><th className="text-left font-normal">Name</th><th className="text-left font-normal">Image</th><th className="text-left font-normal">State</th><th className="text-right font-normal">CPU</th><th className="text-right font-normal">Mem</th><th className="text-right font-normal">Restarts</th></tr></thead>
                    <tbody>
                      {r.containers.map((c) => (
                        <tr key={c.name} className="border-t border-[hsl(var(--ops-border))]">
                          <td className="py-1 font-mono">{c.name}</td>
                          <td className="font-mono break-all">{c.image}</td>
                          <td><span className={c.state === "running" ? "text-[hsl(var(--ops-success))]" : c.state === "waiting" ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-muted-fg))]"}>{c.state}{c.last_reason && ` · ${c.last_reason}`}</span></td>
                          <td className="text-right font-mono">{c.cpu_milli}m</td>
                          <td className="text-right font-mono">{c.mem_mi}Mi</td>
                          <td className="text-right font-mono">{c.restarts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {r.events.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))] mb-1">Recent events</div>
                    <ul className="space-y-1">
                      {r.events.map((e, i) => (
                        <li key={i} className="font-mono text-[11px]"><span className={e.type === "Warning" ? "text-[hsl(var(--ops-warning))]" : "text-[hsl(var(--ops-muted-fg))]"}>{e.type}</span> · <span className="text-[hsl(var(--ops-fg))]">{e.reason}</span> — {e.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            filters={
              <FilterBar
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder="Search pod, namespace, node..." chips={chips}
                actions={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Cluster</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Cluster</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        <DropdownMenuItem onClick={() => setCluster("all")} className="text-[12px]">All</DropdownMenuItem>
                        {CLUSTERS.map((c) => <DropdownMenuItem key={c.id} onClick={() => setCluster(c.id)} className="text-[12px] font-mono">{c.name}</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Phase</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        {(["all", "Running", "Pending", "Succeeded", "Failed", "CrashLoopBackOff", "ImagePullBackOff", "Terminating"] as const).map((p) => (
                          <DropdownMenuItem key={p} onClick={() => setPhase(p as PodPhase | "all")} className="text-[12px]">{p}</DropdownMenuItem>
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
