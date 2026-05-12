import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { CHANGES, type ChangeRequest, type ChangeRisk, type ChangeType } from "./changesData";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_TOKEN: Record<ChangeType, string> = {
  standard:  "border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.12)] text-[hsl(var(--ops-success))]",
  normal:    "border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.12)] text-[hsl(var(--ops-accent))]",
  emergency: "border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.12)] text-[hsl(var(--ops-critical))]",
};

const RISK_TOKEN: Record<ChangeRisk, string> = {
  low:      "text-[hsl(var(--ops-success))]",
  moderate: "text-[hsl(var(--ops-warning))]",
  high:     "text-[hsl(var(--ops-critical))]",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ChangesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!search) return CHANGES;
    const q = search.toLowerCase();
    return CHANGES.filter(
      (c) =>
        c.number.toLowerCase().includes(q) ||
        c.short_description.toLowerCase().includes(q) ||
        (c.assigned_to?.name.toLowerCase().includes(q) ?? false),
    );
  }, [search]);

  const kpis = useMemo(() => {
    const open = CHANGES.filter((c) => c.state !== "closed");
    return {
      open: open.length,
      pending_cab: open.filter((c) => c.cab_required && c.approvals.some((a) => a.status === "pending")).length,
      emergency: open.filter((c) => c.type === "emergency").length,
      scheduled_today: open.filter((c) => {
        const d = new Date(c.planned_start);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length,
    };
  }, []);

  const columns: Column<ChangeRequest>[] = [
    { key: "number", header: "Number", sortable: true, width: "120px",
      render: (r) => <span className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.number}</span> },
    { key: "short_description", header: "Short description",
      render: (r) => (
        <div className="min-w-[260px]">
          <div className="truncate text-[12px]">{r.short_description}</div>
          <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.cis[0]?.name} · {r.assignment_group}</div>
        </div>
      ) },
    { key: "type", header: "Type", width: "100px",
      render: (r) => <span className={cn("inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] uppercase font-medium", TYPE_TOKEN[r.type])}>{r.type}</span> },
    { key: "risk", header: "Risk", width: "80px",
      render: (r) => <span className={cn("text-[12px] font-medium uppercase", RISK_TOKEN[r.risk])}>{r.risk}</span> },
    { key: "state", header: "State", width: "110px", sortable: true,
      render: (r) => <span className="text-[12px] capitalize">{r.state}</span> },
    { key: "status", header: "Status", width: "120px",
      render: (r) => <StatusBadge status={r.status} /> },
    { key: "assigned_to", header: "Owner", width: "180px",
      render: (r) => <AssigneeChip assignee={r.assigned_to} /> },
    { key: "planned_start", header: "Planned start", width: "140px", sortable: true,
      sortValue: (r) => new Date(r.planned_start).getTime(),
      render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))] tabular-nums">{fmt(r.planned_start)}</span> },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Changes"
        description="Change requests across normal, standard, and emergency types."
        breadcrumb={<span>Service Management / Changes</span>}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><RefreshCw className="h-3.5 w-3.5"/>Refresh</button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]"><Plus className="h-3.5 w-3.5"/>New change</button>
          </>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Changes" value={kpis.open} />
        <KpiCard label="CAB Pending" value={kpis.pending_cab} intent="warning" hint="Awaiting approval" />
        <KpiCard label="Emergency" value={kpis.emergency} intent="critical" hint="Active E-CRs" />
        <KpiCard label="Scheduled Today" value={kpis.scheduled_today} hint="Change calendar" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Change calendar" description={`${rows.length} of ${CHANGES.length} records`} bodyClassName="p-0">
          <DataTable<ChangeRequest>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.number}
            rowStatus={(r) => r.status}
            onRowClick={(r) => navigate(`/ops/changes/${r.number}`)}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search number, description, owner..."
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
