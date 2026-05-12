import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { SLOS } from "./slosData";
import { findService } from "./servicesData";
import type { Slo, SloStatus } from "./types";
import { SLO_TOKEN } from "./lib";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export default function SlosList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SloStatus | "all">("all");

  const rows = useMemo(() => SLOS.filter((s) => {
    if (status !== "all" && s.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.service_id.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, status]);

  const kpis = useMemo(() => ({
    total: SLOS.length,
    healthy: SLOS.filter((s) => s.status === "healthy").length,
    burning: SLOS.filter((s) => s.status === "burning" || s.status === "at_risk").length,
    breached: SLOS.filter((s) => s.status === "breached").length,
  }), []);

  const columns: Column<Slo>[] = [
    { key: "name", header: "SLO", sortable: true, render: (r) => <div><div className="text-[12px]">{r.name}</div><div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.kind} · {r.window_days}d</div></div> },
    { key: "service", header: "Service", width: "160px", render: (r) => { const s = findService(r.service_id); return s ? <Link to={`/ops/sre/services/${s.id}`} className="font-mono text-[12px] text-[hsl(var(--ops-accent))] hover:underline">{s.name}</Link> : <span className="font-mono text-[12px]">{r.service_id}</span>; } },
    { key: "objective", header: "Target", width: "100px", align: "right", render: (r) => <span className="font-mono text-[12px]">{r.objective}{r.unit}</span> },
    { key: "current", header: "Current", width: "100px", align: "right", sortable: true, render: (r) => <span className="font-mono text-[12px]">{r.current}{r.unit}</span> },
    { key: "error_budget_pct", header: "Budget", width: "140px", sortable: true, render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-sm bg-[hsl(var(--ops-panel-2))]">
          <div className={`h-full ${r.error_budget_pct < 20 ? "bg-[hsl(var(--ops-critical))]" : r.error_budget_pct < 50 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-success))]"}`} style={{ width: `${r.error_budget_pct}%` }} />
        </div>
        <span className="font-mono text-[11px]">{r.error_budget_pct}%</span>
      </div>
    ) },
    { key: "burn_rate_1h", header: "Burn 1h", width: "80px", align: "right", sortable: true, render: (r) => <span className={`font-mono text-[12px] ${r.burn_rate_1h > 5 ? "text-[hsl(var(--ops-critical))]" : r.burn_rate_1h > 2 ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.burn_rate_1h}×</span> },
    { key: "status", header: "Status", width: "110px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SLO_TOKEN[r.status]}`}>{r.status.replace("_", " ")}</span> },
  ];

  const chips = status !== "all" ? [{ key: "s", label: "Status", value: status, onRemove: () => setStatus("all") }] : [];

  return (
    <div className="flex flex-col">
      <PageHeader title="SRE — SLOs & Error Budgets" description="Service Level Objectives and burn rates across all tracked services." breadcrumb={<span>Reliability / SRE / SLOs</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tracked SLOs" value={kpis.total} />
        <KpiCard label="Healthy" value={kpis.healthy} intent="success" />
        <KpiCard label="At risk / Burning" value={kpis.burning} intent="warning" />
        <KpiCard label="Breached" value={kpis.breached} intent="critical" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="SLO catalog" description={`${rows.length} of ${SLOS.length}`} bodyClassName="p-0">
          <DataTable<Slo>
            columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25}
            filters={
              <FilterBar
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder="Search SLO or service..." chips={chips}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Status</DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                      <DropdownMenuLabel className="text-[11px] uppercase">Status</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                      {(["all", "healthy", "at_risk", "burning", "breached"] as const).map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setStatus(s as SloStatus | "all")} className="text-[12px] capitalize">{s.replace("_", " ")}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
