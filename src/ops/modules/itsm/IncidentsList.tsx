import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { SlaIndicator } from "@/ops/components/SlaIndicator";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { INCIDENTS } from "./incidentsData";
import type { Incident } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter, Plus, RefreshCw } from "lucide-react";
import type { Severity, Status } from "@/ops/lib/types";

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function IncidentsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sevFilter, setSevFilter] = useState<Severity | "all">("all");

  const rows = useMemo(() => {
    return INCIDENTS.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (sevFilter !== "all" && i.severity !== sevFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.number.toLowerCase().includes(q) &&
          !i.short_description.toLowerCase().includes(q) &&
          !(i.assigned_to?.name.toLowerCase().includes(q) ?? false)
        )
          return false;
      }
      return true;
    });
  }, [search, statusFilter, sevFilter]);

  const kpis = useMemo(() => {
    const open = INCIDENTS.filter((i) => i.status !== "resolved" && i.status !== "closed");
    const crit = open.filter((i) => i.severity === "critical").length;
    const breached = open.filter((i) => i.sla_percent >= 100).length;
    const unassigned = open.filter((i) => !i.assigned_to).length;
    return { open: open.length, crit, breached, unassigned };
  }, []);

  const columns: Column<Incident>[] = [
    {
      key: "number",
      header: "Number",
      sortable: true,
      width: "120px",
      render: (r) => <span className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.number}</span>,
    },
    {
      key: "short_description",
      header: "Short description",
      render: (r) => (
        <div className="min-w-[260px]">
          <div className="truncate text-[12px] text-[hsl(var(--ops-fg))]">{r.short_description}</div>
          <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">
            {r.cis[0]?.name} · {r.category}
          </div>
        </div>
      ),
    },
    { key: "severity", header: "Sev", sortable: true, width: "90px",
      sortValue: (r) => ["critical","high","medium","low","info"].indexOf(r.severity),
      render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: "priority", header: "Pri", sortable: true, width: "60px",
      render: (r) => <span className="font-mono text-[12px]">P{r.priority}</span> },
    { key: "status", header: "Status", sortable: true, width: "120px",
      render: (r) => <StatusBadge status={r.status} /> },
    { key: "assigned_to", header: "Assigned to", width: "200px",
      sortValue: (r) => r.assigned_to?.name ?? "~",
      render: (r) => <AssigneeChip assignee={r.assigned_to} /> },
    { key: "sla", header: "SLA", width: "150px",
      sortValue: (r) => r.sla_percent,
      render: (r) => <SlaIndicator percent={r.sla_percent} /> },
    { key: "updated_at", header: "Updated", sortable: true, width: "100px",
      sortValue: (r) => new Date(r.updated_at).getTime(),
      render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.updated_at)}</span> },
  ];

  const chips = [
    statusFilter !== "all" && { key: "s", label: "Status", value: statusFilter, onRemove: () => setStatusFilter("all") },
    sevFilter !== "all" && { key: "sev", label: "Severity", value: sevFilter, onRemove: () => setSevFilter("all") },
  ].filter(Boolean) as { key: string; label: string; value: string; onRemove: () => void }[];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Incidents"
        description="Active service interruptions across all assignment groups."
        breadcrumb={<span>Service Management / Incidents</span>}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]">
              <Plus className="h-3.5 w-3.5" /> New incident
            </button>
          </>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Incidents" value={kpis.open} intent="default" hint="All groups" />
        <KpiCard label="Critical" value={kpis.crit} intent="critical" hint="P1 / Sev-1 active" />
        <KpiCard label="SLA Breached" value={kpis.breached} intent="warning" hint="Past target time" />
        <KpiCard label="Unassigned" value={kpis.unassigned} intent="default" hint="Awaiting routing" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Queue" description={`${rows.length} of ${INCIDENTS.length} records`} bodyClassName="p-0">
          <DataTable<Incident>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.number}
            rowStatus={(r) => r.status}
            onRowClick={(r) => navigate(`/ops/incidents/${r.number}`)}
            pageSize={25}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search number, description, assignee..."
                chips={chips}
                actions={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
                        <Filter className="h-3.5 w-3.5" /> Status
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Status</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        {(["all","new","assigned","in_progress","pending","resolved","closed"] as const).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => setStatusFilter(s as Status | "all")} className="text-[12px] capitalize">
                            {s.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
                        <Filter className="h-3.5 w-3.5" /> Severity
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Severity</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        {(["all","critical","high","medium","low","info"] as const).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => setSevFilter(s as Severity | "all")} className="text-[12px] capitalize">
                            {s}
                          </DropdownMenuItem>
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
