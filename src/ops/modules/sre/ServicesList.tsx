import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { SERVICES } from "./servicesData";
import type { Service, ServiceHealth, ServiceTier } from "./types";
import { HEALTH_DOT, HEALTH_TOKEN, TIER_TOKEN } from "./lib";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, RefreshCw } from "lucide-react";

export default function ServicesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<ServiceTier | "all">("all");
  const [health, setHealth] = useState<ServiceHealth | "all">("all");

  const rows = useMemo(() => {
    return SERVICES.filter((s) => {
      if (tier !== "all" && s.tier !== tier) return false;
      if (health !== "all" && s.health !== health) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.owner_team.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, tier, health]);

  const kpis = useMemo(() => ({
    total: SERVICES.length,
    healthy: SERVICES.filter((s) => s.health === "healthy").length,
    degraded: SERVICES.filter((s) => s.health === "degraded").length,
    down: SERVICES.filter((s) => s.health === "down").length,
  }), []);

  const columns: Column<Service>[] = [
    {
      key: "health", header: "", width: "8px",
      render: (r) => <span className={`block h-3 w-1 rounded-sm ${HEALTH_DOT[r.health]}`} />,
    },
    {
      key: "name", header: "Service", sortable: true,
      render: (r) => (
        <div className="min-w-[220px]">
          <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
          <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.description}</div>
        </div>
      ),
    },
    {
      key: "tier", header: "Tier", width: "80px", sortable: true,
      render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TIER_TOKEN[r.tier]}`}>{r.tier.replace("_", " ")}</span>,
    },
    {
      key: "health_b", header: "Health", width: "100px", sortable: true, sortValue: (r) => r.health,
      render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${HEALTH_TOKEN[r.health]}`}>{r.health}</span>,
    },
    { key: "uptime_30d", header: "Uptime 30d", width: "90px", align: "right", sortable: true, render: (r) => <span className="font-mono text-[12px]">{r.uptime_30d.toFixed(2)}%</span> },
    { key: "error_rate_5m", header: "Err 5m", width: "70px", align: "right", sortable: true, render: (r) => <span className={`font-mono text-[12px] ${r.error_rate_5m > 1 ? "text-[hsl(var(--ops-critical))]" : ""}`}>{r.error_rate_5m.toFixed(2)}%</span> },
    { key: "latency_p95_ms", header: "p95", width: "70px", align: "right", sortable: true, render: (r) => <span className="font-mono text-[12px]">{r.latency_p95_ms}ms</span> },
    { key: "rps", header: "RPS", width: "70px", align: "right", sortable: true, render: (r) => <span className="font-mono text-[12px]">{r.rps}</span> },
    {
      key: "saturation", header: "Sat", width: "100px", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-[hsl(var(--ops-panel-2))]">
            <div className={`h-full ${r.saturation > 80 ? "bg-[hsl(var(--ops-critical))]" : r.saturation > 60 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-success))]"}`} style={{ width: `${r.saturation}%` }} />
          </div>
          <span className="font-mono text-[11px]">{r.saturation}%</span>
        </div>
      ),
    },
    { key: "owner_team", header: "Team", width: "140px", render: (r) => <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{r.owner_team}</span> },
    { key: "on_call", header: "On-call", width: "180px", render: (r) => <AssigneeChip assignee={r.on_call} /> },
  ];

  const chips = [
    ...(tier !== "all" ? [{ key: "t", label: "Tier", value: tier, onRemove: () => setTier("all") }] : []),
    ...(health !== "all" ? [{ key: "h", label: "Health", value: health, onRemove: () => setHealth("all") }] : []),
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="SRE — Services"
        description="Service catalog with golden signals, SLOs, on-call ownership, and dependencies."
        breadcrumb={<span>Reliability / SRE / Services</span>}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Services" value={kpis.total} hint="Across catalog" />
        <KpiCard label="Healthy" value={kpis.healthy} intent="success" />
        <KpiCard label="Degraded" value={kpis.degraded} intent="warning" />
        <KpiCard label="Down" value={kpis.down} intent="critical" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="Service catalog" description={`${rows.length} of ${SERVICES.length} services`} bodyClassName="p-0">
          <DataTable<Service>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/ops/sre/services/${r.id}`)}
            pageSize={25}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search service, team, description..."
                chips={chips}
                actions={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Tier</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Tier</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        {(["all", "tier_1", "tier_2", "tier_3"] as const).map((t) => (
                          <DropdownMenuItem key={t} onClick={() => setTier(t as ServiceTier | "all")} className="text-[12px] capitalize">{t.replace("_", " ")}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Health</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Health</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        {(["all", "healthy", "degraded", "down", "maintenance"] as const).map((h) => (
                          <DropdownMenuItem key={h} onClick={() => setHealth(h as ServiceHealth | "all")} className="text-[12px] capitalize">{h}</DropdownMenuItem>
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
