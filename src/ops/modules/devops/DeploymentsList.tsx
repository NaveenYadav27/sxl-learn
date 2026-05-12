import { useMemo, useState } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { DEPLOYMENTS } from "./pipelinesData";
import type { Deployment, DeploymentEnv } from "./types";
import { ENV_TOKEN, PIPELINE_TOKEN, dur, rel } from "./lib";
import { Link } from "react-router-dom";

export default function DeploymentsList() {
  const [search, setSearch] = useState("");
  const [env, setEnv] = useState<DeploymentEnv | "all">("all");

  const rows = useMemo(() => DEPLOYMENTS.filter((d) => {
    if (env !== "all" && d.env !== env) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.service.toLowerCase().includes(q) && !d.version.toLowerCase().includes(q) && !d.deployed_by.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, env]);

  const kpis = {
    today: DEPLOYMENTS.filter((d) => Date.now() - new Date(d.deployed_at).getTime() < 86_400_000).length,
    failed: DEPLOYMENTS.filter((d) => d.status === "failed").length,
    prod: DEPLOYMENTS.filter((d) => d.env === "prod").length,
    rollback: DEPLOYMENTS.filter((d) => d.rollback_available).length,
  };

  const columns: Column<Deployment>[] = [
    { key: "status", header: "Status", width: "100px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PIPELINE_TOKEN[r.status]}`}>{r.status}</span>
    )},
    { key: "service", header: "Service", render: (r) => (
      <span className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.service}</span>
    )},
    { key: "env", header: "Env", width: "100px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ENV_TOKEN[r.env]}`}>{r.env}</span>
    )},
    { key: "version", header: "Version", width: "180px", render: (r) => (
      <span className="font-mono text-[11px] text-[hsl(var(--ops-accent))]">{r.version}</span>
    )},
    { key: "strategy", header: "Strategy", width: "110px", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.strategy.replace("_", " ")}</span>
    )},
    { key: "cluster", header: "Cluster", width: "140px", render: (r) => (
      <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.cluster ?? "—"}</span>
    )},
    { key: "deployed_by", header: "Deployer", width: "140px", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.deployed_by}</span>
    )},
    { key: "duration_s", header: "Duration", width: "90px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{dur(r.duration_s)}</span>
    )},
    { key: "related_change", header: "Change", width: "100px", render: (r) => r.related_change ? (
      <Link to={`/ops/changes/${r.related_change}`} className="font-mono text-[11px] text-[hsl(var(--ops-accent))] hover:underline">{r.related_change}</Link>
    ) : <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">—</span> },
    { key: "deployed_at", header: "When", width: "100px", align: "right", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.deployed_at)}</span>
    )},
  ];

  const ENVS: DeploymentEnv[] = ["dev", "staging", "canary", "prod"];

  return (
    <div className="flex flex-col">
      <PageHeader title="Deployments" description="Tracked rollouts across environments and clusters." breadcrumb={<span>DevOps / Deployments</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Deployed (24h)" value={kpis.today} />
        <KpiCard label="Failed" value={kpis.failed} intent={kpis.failed > 0 ? "critical" : "success"} />
        <KpiCard label="Prod rollouts" value={kpis.prod} />
        <KpiCard label="Rollback ready" value={kpis.rollback} intent="success" />
      </div>
      <div className="px-4 pb-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search service, version, deployer..."
          actions={
            <select value={env} onChange={(e) => setEnv(e.target.value as DeploymentEnv | "all")} className="h-8 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px]">
              <option value="all">All environments</option>
              {ENVS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          }
        />
        <DataTable<Deployment> columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25} />
      </div>
    </div>
  );
}
