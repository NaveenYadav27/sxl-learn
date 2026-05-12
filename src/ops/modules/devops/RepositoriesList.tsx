import { useMemo, useState } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { REPOSITORIES } from "./pipelinesData";
import type { Repository } from "./types";
import { rel } from "./lib";
import { GitBranch } from "lucide-react";

export default function RepositoriesList() {
  const [search, setSearch] = useState("");

  const rows = useMemo(() => REPOSITORIES.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.language.toLowerCase().includes(q);
  }), [search]);

  const kpis = {
    repos: REPOSITORIES.length,
    open_prs: REPOSITORIES.reduce((s, r) => s + r.open_prs, 0),
    open_issues: REPOSITORIES.reduce((s, r) => s + r.open_issues, 0),
    contributors: REPOSITORIES.reduce((s, r) => s + r.contributors, 0),
  };

  const columns: Column<Repository>[] = [
    { key: "name", header: "Repository", render: (r) => (
      <div>
        <div className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.org}/{r.name}</div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.visibility} · {r.language}</div>
      </div>
    )},
    { key: "default_branch", header: "Default", width: "140px", render: (r) => (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]"><GitBranch className="h-3 w-3" /> {r.default_branch}</span>
    )},
    { key: "open_prs", header: "Open PRs", width: "90px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{r.open_prs}</span>
    )},
    { key: "open_issues", header: "Issues", width: "90px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{r.open_issues}</span>
    )},
    { key: "contributors", header: "Contributors", width: "120px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{r.contributors}</span>
    )},
    { key: "loc", header: "LOC", width: "100px", align: "right", render: (r) => (
      <span className="text-[11px] tabular-nums text-[hsl(var(--ops-muted-fg))]">{r.loc.toLocaleString()}</span>
    )},
    { key: "last_commit_at", header: "Last commit", width: "120px", align: "right", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.last_commit_at)}</span>
    )},
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Repositories" description="Source code repositories under DevOps governance." breadcrumb={<span>DevOps / Repositories</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Repositories" value={kpis.repos} />
        <KpiCard label="Open PRs" value={kpis.open_prs} />
        <KpiCard label="Open issues" value={kpis.open_issues} />
        <KpiCard label="Contributors" value={kpis.contributors} />
      </div>
      <div className="px-4 pb-4">
        <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search repos..." />
        <DataTable<Repository> columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25} />
      </div>
    </div>
  );
}
