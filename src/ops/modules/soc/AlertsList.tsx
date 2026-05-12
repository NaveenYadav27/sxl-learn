import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { ALERTS } from "./alertsData";
import type { SocAlert } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, RefreshCw, ShieldCheck } from "lucide-react";
import type { Severity, Status } from "@/ops/lib/types";

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

function RiskBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "var(--ops-critical)" :
    value >= 60 ? "var(--ops-high)" :
    value >= 40 ? "var(--ops-warning)" :
    "var(--ops-info)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-[hsl(var(--ops-panel-2))]">
        <div className="h-full" style={{ width: `${value}%`, background: `hsl(${color})` }} />
      </div>
      <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{value}</span>
    </div>
  );
}

export default function AlertsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sevFilter, setSevFilter] = useState<Severity | "all">("all");

  const rows = useMemo(() => {
    return ALERTS.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (sevFilter !== "all" && a.severity !== sevFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.id.toLowerCase().includes(q) &&
          !a.title.toLowerCase().includes(q) &&
          !a.rule_name.toLowerCase().includes(q) &&
          !(a.assigned_to?.name.toLowerCase().includes(q) ?? false) &&
          !a.observables.some((o) => o.value.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [search, statusFilter, sevFilter]);

  const kpis = useMemo(() => {
    const open = ALERTS.filter((a) => a.status !== "resolved" && a.status !== "closed");
    const crit = open.filter((a) => a.severity === "critical").length;
    const unassigned = open.filter((a) => !a.assigned_to).length;
    const tp = ALERTS.filter((a) => a.disposition === "true_positive").length;
    return { open: open.length, crit, unassigned, tp };
  }, []);

  const columns: Column<SocAlert>[] = [
    {
      key: "id",
      header: "Alert",
      sortable: true,
      width: "130px",
      render: (r) => <span className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.id}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (r) => (
        <div className="min-w-[280px]">
          <div className="truncate text-[12px] text-[hsl(var(--ops-fg))]">{r.title}</div>
          <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">
            {r.rule_name} · {r.source.replace("_", " ")}
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Sev",
      sortable: true,
      width: "90px",
      sortValue: (r) => ["critical", "high", "medium", "low", "info"].indexOf(r.severity),
      render: (r) => <SeverityBadge severity={r.severity} />,
    },
    {
      key: "risk_score",
      header: "Risk",
      sortable: true,
      width: "110px",
      render: (r) => <RiskBar value={r.risk_score} />,
    },
    {
      key: "tactic",
      header: "Tactic",
      width: "150px",
      render: (r) => (
        <div className="text-[11px]">
          <div className="font-mono text-[hsl(var(--ops-fg))]">{r.technique}</div>
          <div className="capitalize text-[hsl(var(--ops-muted-fg))]">{r.tactic.replace("_", " ")}</div>
        </div>
      ),
    },
    { key: "status", header: "Status", sortable: true, width: "120px", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "assigned_to",
      header: "Assigned to",
      width: "190px",
      sortValue: (r) => r.assigned_to?.name ?? "~",
      render: (r) => <AssigneeChip assignee={r.assigned_to} />,
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      width: "100px",
      sortValue: (r) => new Date(r.updated_at).getTime(),
      render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.updated_at)}</span>,
    },
  ];

  const chips = [
    statusFilter !== "all" && { key: "s", label: "Status", value: statusFilter, onRemove: () => setStatusFilter("all") },
    sevFilter !== "all" && { key: "sev", label: "Severity", value: sevFilter, onRemove: () => setSevFilter("all") },
  ].filter(Boolean) as { key: string; label: string; value: string; onRemove: () => void }[];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Security Alerts"
        description="Triage queue across EDR, SIEM, identity, cloud and email sensors."
        breadcrumb={<span>Security / Alerts</span>}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]">
              <ShieldCheck className="h-3.5 w-3.5" /> Run Playbook
            </button>
          </>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Alerts" value={kpis.open} intent="default" hint="All sensors" />
        <KpiCard label="Critical" value={kpis.crit} intent="critical" hint="Risk ≥ 80" />
        <KpiCard label="Unassigned" value={kpis.unassigned} intent="warning" hint="Awaiting Tier 1" />
        <KpiCard label="True Positives (24h)" value={kpis.tp} intent="default" hint="Confirmed threats" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Triage queue" description={`${rows.length} of ${ALERTS.length} records`} bodyClassName="p-0">
          <DataTable<SocAlert>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            rowStatus={(r) => r.status}
            onRowClick={(r) => navigate(`/ops/alerts/${r.id}`)}
            pageSize={25}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search alert id, title, rule, observable..."
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
                        {(["all", "new", "assigned", "in_progress", "pending", "resolved", "closed"] as const).map((s) => (
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
                        {(["all", "critical", "high", "medium", "low", "info"] as const).map((s) => (
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
