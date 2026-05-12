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
import { PROBLEMS, type Problem } from "./problemsData";
import { Plus, RefreshCw, BookOpen } from "lucide-react";

function rel(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 60000;
  if (d < 60) return `${Math.round(d)}m ago`;
  if (d < 1440) return `${Math.round(d / 60)}h ago`;
  return `${Math.round(d / 1440)}d ago`;
}

export default function ProblemsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!search) return PROBLEMS;
    const q = search.toLowerCase();
    return PROBLEMS.filter(
      (p) =>
        p.number.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.assigned_to?.name.toLowerCase().includes(q) ?? false),
    );
  }, [search]);

  const kpis = useMemo(() => {
    const open = PROBLEMS.filter((p) => p.status !== "resolved" && p.status !== "closed");
    return {
      open: open.length,
      ke: PROBLEMS.filter((p) => p.known_error).length,
      high: open.filter((p) => p.severity === "critical" || p.severity === "high").length,
      unassigned: open.filter((p) => !p.assigned_to).length,
    };
  }, []);

  const columns: Column<Problem>[] = [
    { key: "number", header: "Number", sortable: true, width: "120px",
      render: (r) => <span className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.number}</span> },
    { key: "short_description", header: "Short description",
      render: (r) => (
        <div className="min-w-[260px]">
          <div className="truncate text-[12px]">{r.short_description}</div>
          <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">
            {r.related_incidents.length} linked INC · {r.category}
          </div>
        </div>
      ) },
    { key: "known_error", header: "KE", width: "60px", align: "center",
      sortValue: (r) => (r.known_error ? 1 : 0),
      render: (r) => r.known_error
        ? <span className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] px-1.5 py-0.5 text-[10px] text-[hsl(var(--ops-warning))]"><BookOpen className="h-3 w-3"/>KE</span>
        : <span className="text-[hsl(var(--ops-muted-fg))] text-[11px]">—</span> },
    { key: "severity", header: "Sev", sortable: true, width: "90px",
      sortValue: (r) => ["critical","high","medium","low","info"].indexOf(r.severity),
      render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: "status", header: "Status", sortable: true, width: "120px",
      render: (r) => <StatusBadge status={r.status} /> },
    { key: "assigned_to", header: "Assigned to", width: "200px",
      sortValue: (r) => r.assigned_to?.name ?? "~",
      render: (r) => <AssigneeChip assignee={r.assigned_to} /> },
    { key: "updated_at", header: "Updated", sortable: true, width: "100px",
      sortValue: (r) => new Date(r.updated_at).getTime(),
      render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.updated_at)}</span> },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Problems"
        description="Underlying causes of one or more incidents."
        breadcrumb={<span>Service Management / Problems</span>}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><RefreshCw className="h-3.5 w-3.5"/>Refresh</button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]"><Plus className="h-3.5 w-3.5"/>New problem</button>
          </>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Problems" value={kpis.open} hint="All groups" />
        <KpiCard label="Known Errors" value={kpis.ke} intent="warning" hint="Documented workarounds" />
        <KpiCard label="High / Critical" value={kpis.high} intent="critical" />
        <KpiCard label="Unassigned" value={kpis.unassigned} hint="Awaiting routing" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Backlog" description={`${rows.length} of ${PROBLEMS.length} records`} bodyClassName="p-0">
          <DataTable<Problem>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.number}
            rowStatus={(r) => r.status}
            onRowClick={(r) => navigate(`/ops/problems/${r.number}`)}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search number, description, assignee..."
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
}
