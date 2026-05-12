import { useMemo, useState } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { PIPELINES } from "./pipelinesData";
import type { Pipeline, PipelineStatus } from "./types";
import { PIPELINE_TOKEN, PROVIDER_LABEL, dur, rel } from "./lib";
import { GitBranch, RotateCw } from "lucide-react";

export default function PipelinesList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PipelineStatus | "all">("all");

  const rows = useMemo(() => PIPELINES.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.repo.toLowerCase().includes(q) && !p.commit_message.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, status]);

  const kpis = {
    running: PIPELINES.filter((p) => p.status === "running").length,
    failed: PIPELINES.filter((p) => p.status === "failed").length,
    success: PIPELINES.filter((p) => p.status === "success").length,
    avg_success: Math.round(PIPELINES.reduce((s, p) => s + p.success_rate_7d, 0) / PIPELINES.length),
  };

  const columns: Column<Pipeline>[] = [
    { key: "status", header: "Status", width: "100px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PIPELINE_TOKEN[r.status]}`}>{r.status}</span>
    )},
    { key: "name", header: "Pipeline", render: (r) => (
      <div className="min-w-0">
        <div className="truncate font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.commit_message}</div>
      </div>
    )},
    { key: "provider", header: "Provider", width: "140px", render: (r) => (
      <span className="text-[12px]">{PROVIDER_LABEL[r.provider]}</span>
    )},
    { key: "branch", header: "Branch", width: "180px", render: (r) => (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]"><GitBranch className="h-3 w-3" /> {r.branch}</span>
    )},
    { key: "commit_sha", header: "Commit", width: "100px", render: (r) => (
      <span className="font-mono text-[11px] text-[hsl(var(--ops-accent))]">{r.commit_sha.slice(0,7)}</span>
    )},
    { key: "triggered_by", header: "Trigger", width: "140px", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.triggered_by}</span>
    )},
    { key: "duration_s", header: "Duration", width: "90px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{dur(r.duration_s)}</span>
    )},
    { key: "success_rate_7d", header: "7d success", width: "120px", align: "right", render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-[hsl(var(--ops-panel-2))]">
          <div className={`h-full ${r.success_rate_7d >= 90 ? "bg-[hsl(var(--ops-success))]" : r.success_rate_7d >= 70 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-critical))]"}`} style={{ width: `${r.success_rate_7d}%` }} />
        </div>
        <span className="w-8 text-right text-[11px] tabular-nums">{r.success_rate_7d}%</span>
      </div>
    )},
    { key: "last_run_at", header: "Last run", width: "100px", align: "right", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.last_run_at)}</span>
    )},
  ];

  const STATUSES: PipelineStatus[] = ["success", "running", "failed", "queued", "canceled"];

  return (
    <div className="flex flex-col">
      <PageHeader title="CI/CD Pipelines" description="Build & delivery pipelines across GitHub Actions, GitLab CI, Jenkins, Argo CD." breadcrumb={<span>DevOps / Pipelines</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Running" value={kpis.running} intent={kpis.running > 0 ? "default" : "default"} />
        <KpiCard label="Failed" value={kpis.failed} intent={kpis.failed > 0 ? "critical" : "success"} />
        <KpiCard label="Successful" value={kpis.success} intent="success" />
        <KpiCard label="Avg success (7d)" value={`${kpis.avg_success}%`} intent={kpis.avg_success >= 90 ? "success" : "warning"} />
      </div>
      <div className="px-4 pb-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search pipeline, repo, commit..."
          actions={
            <div className="flex items-center gap-2">
              <select value={status} onChange={(e) => setStatus(e.target.value as PipelineStatus | "all")} className="h-8 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px]">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="inline-flex h-8 items-center gap-1 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"><RotateCw className="h-3 w-3" /> Refresh</button>
            </div>
          }
        />
        <DataTable<Pipeline> columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25} />
      </div>
    </div>
  );
}
