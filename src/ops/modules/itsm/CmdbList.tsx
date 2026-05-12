import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { CMDB, type CmdbItem } from "./cmdbData";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const HEALTH_TOKEN: Record<CmdbItem["status"], string> = {
  operational: "border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))]",
  degraded:    "border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))]",
  down:        "border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))]",
  maintenance: "border-[hsl(var(--ops-info)/0.5)] bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))]",
  retired:     "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))]",
};

const CRIT_TOKEN: Record<CmdbItem["criticality"], string> = {
  tier1: "text-[hsl(var(--ops-critical))]",
  tier2: "text-[hsl(var(--ops-warning))]",
  tier3: "text-[hsl(var(--ops-muted-fg))]",
};

export default function CmdbList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!search) return CMDB;
    const q = search.toLowerCase();
    return CMDB.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.includes(q)),
    );
  }, [search]);

  const kpis = useMemo(() => ({
    total: CMDB.length,
    tier1: CMDB.filter((c) => c.criticality === "tier1").length,
    degraded: CMDB.filter((c) => c.status === "degraded" || c.status === "down").length,
    open_incidents: CMDB.reduce((s, c) => s + (c.open_incidents ?? 0), 0),
  }), []);

  const columns: Column<CmdbItem>[] = [
    { key: "name", header: "CI Name", sortable: true,
      render: (r) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
          <div className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.id}</div>
        </div>
      ) },
    { key: "type", header: "Type", width: "120px", sortable: true,
      render: (r) => <span className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{r.type.replace("_", " ")}</span> },
    { key: "criticality", header: "Tier", width: "70px", sortable: true,
      render: (r) => <span className={cn("text-[12px] font-semibold uppercase", CRIT_TOKEN[r.criticality])}>{r.criticality}</span> },
    { key: "status", header: "Health", width: "120px", sortable: true,
      render: (r) => <span className={cn("inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] uppercase font-medium", HEALTH_TOKEN[r.status])}>{r.status}</span> },
    { key: "owner", header: "Owner", width: "160px", sortable: true,
      render: (r) => (
        <div>
          <div className="text-[12px]">{r.owner}</div>
          <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.group}</div>
        </div>
      ) },
    { key: "environment", header: "Env", width: "70px",
      render: (r) => <span className="text-[11px] uppercase">{r.environment}</span> },
    { key: "open_incidents", header: "Open INC", width: "80px", align: "right", sortable: true,
      sortValue: (r) => r.open_incidents ?? 0,
      render: (r) => <span className={cn("font-mono text-[12px]", (r.open_incidents ?? 0) > 0 && "text-[hsl(var(--ops-critical))]")}>{r.open_incidents ?? 0}</span> },
    { key: "open_changes", header: "Open CHG", width: "80px", align: "right", sortable: true,
      sortValue: (r) => r.open_changes ?? 0,
      render: (r) => <span className="font-mono text-[12px]">{r.open_changes ?? 0}</span> },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="CMDB"
        description="Configuration items, ownership, dependencies, and health."
        breadcrumb={<span>Service Management / CMDB</span>}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><RefreshCw className="h-3.5 w-3.5"/>Discover</button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]"><Plus className="h-3.5 w-3.5"/>Register CI</button>
          </>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total CIs" value={kpis.total} hint="Across all environments" />
        <KpiCard label="Tier 1" value={kpis.tier1} intent="critical" hint="Business-critical" />
        <KpiCard label="Degraded / Down" value={kpis.degraded} intent="warning" />
        <KpiCard label="Open Incidents" value={kpis.open_incidents} hint="Aggregated by CI" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Inventory" description={`${rows.length} of ${CMDB.length} records`} bodyClassName="p-0">
          <DataTable<CmdbItem>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/ops/cmdb/${r.id}`)}
            expandable={(r) => (
              <div className="grid gap-4 sm:grid-cols-3 text-[12px]">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Network</div>
                  <div className="mt-1 space-y-0.5">
                    {r.ip && <div>IP: <span className="font-mono">{r.ip}</span></div>}
                    {r.os && <div>OS: <span className="font-mono">{r.os}</span></div>}
                    {r.location && <div>Location: {r.location}</div>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Depends on</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.depends_on?.length ? r.depends_on.map((d) => (
                      <span key={d} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[11px]">{d}</span>
                    )) : <span className="text-[hsl(var(--ops-muted-fg))]">—</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Supports</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.supports?.length ? r.supports.map((d) => (
                      <span key={d} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[11px]">{d}</span>
                    )) : <span className="text-[hsl(var(--ops-muted-fg))]">—</span>}
                  </div>
                </div>
                {r.tags && r.tags.length > 0 && (
                  <div className="sm:col-span-3">
                    <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Tags</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.tags.map((t) => <span key={t} className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.1)] px-1.5 py-0.5 text-[11px] text-[hsl(var(--ops-accent))]">#{t}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search CI name, id, owner, tag..."
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
