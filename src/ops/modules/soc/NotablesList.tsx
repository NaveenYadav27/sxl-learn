import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { NOTABLES } from "./notablesData";
import type { NotableEvent, NotableUrgency } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, RefreshCw } from "lucide-react";

const URGENCY_TOKEN: Record<NotableUrgency, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high: "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  informational: "bg-[hsl(var(--ops-muted-fg)/0.12)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
};

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function NotablesList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [urgFilter, setUrgFilter] = useState<NotableUrgency | "all">("all");

  const rows = useMemo(() => {
    return NOTABLES.filter((n) => {
      if (urgFilter !== "all" && n.urgency !== urgFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !n.id.toLowerCase().includes(q) &&
          !n.title.toLowerCase().includes(q) &&
          !n.search_name.toLowerCase().includes(q) &&
          !(n.src?.toLowerCase().includes(q) ?? false) &&
          !(n.dest?.toLowerCase().includes(q) ?? false) &&
          !(n.user?.toLowerCase().includes(q) ?? false)
        )
          return false;
      }
      return true;
    });
  }, [search, urgFilter]);

  const kpis = useMemo(() => {
    const open = NOTABLES.filter((n) => n.status !== "resolved" && n.status !== "closed");
    const crit = NOTABLES.filter((n) => n.urgency === "critical").length;
    const unassigned = NOTABLES.filter((n) => !n.owner && n.status !== "closed").length;
    const events = NOTABLES.reduce((s, n) => s + n.count, 0);
    return { open: open.length, crit, unassigned, events };
  }, []);

  const columns: Column<NotableEvent>[] = [
    {
      key: "id",
      header: "Notable",
      sortable: true,
      width: "120px",
      render: (r) => <span className="font-mono text-[12px] text-[hsl(var(--ops-accent))]">{r.id}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (r) => (
        <div className="min-w-[260px]">
          <div className="truncate text-[12px] text-[hsl(var(--ops-fg))]">{r.title}</div>
          <div className="truncate font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.search_name}</div>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      width: "110px",
      sortValue: (r) => ["critical", "high", "medium", "low", "informational"].indexOf(r.urgency),
      render: (r) => (
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${URGENCY_TOKEN[r.urgency]}`}>
          {r.urgency}
        </span>
      ),
    },
    {
      key: "src",
      header: "Source / Dest",
      width: "200px",
      render: (r) => (
        <div className="text-[11px]">
          <div className="font-mono text-[hsl(var(--ops-fg))]">{r.src ?? "—"}</div>
          <div className="font-mono text-[hsl(var(--ops-muted-fg))]">→ {r.dest ?? "—"}</div>
        </div>
      ),
    },
    { key: "user", header: "User", width: "140px", render: (r) => <span className="font-mono text-[11px]">{r.user ?? "—"}</span> },
    {
      key: "count",
      header: "Events",
      sortable: true,
      width: "70px",
      align: "right",
      render: (r) => <span className="font-mono text-[12px]">{r.count}</span>,
    },
    {
      key: "owner",
      header: "Owner",
      width: "180px",
      sortValue: (r) => r.owner?.name ?? "~",
      render: (r) => <AssigneeChip assignee={r.owner} />,
    },
    {
      key: "last_event_at",
      header: "Last event",
      sortable: true,
      width: "100px",
      sortValue: (r) => new Date(r.last_event_at).getTime(),
      render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.last_event_at)}</span>,
    },
  ];

  const chips = urgFilter !== "all" ? [{ key: "u", label: "Urgency", value: urgFilter, onRemove: () => setUrgFilter("all") }] : [];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Splunk ES — Notable Events"
        description="Correlation-search notables flowing into the Enterprise Security workflow."
        breadcrumb={<span>Security / Splunk ES / Notables</span>}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Notables" value={kpis.open} intent="default" hint="ES workflow" />
        <KpiCard label="Critical" value={kpis.crit} intent="critical" hint="Highest urgency" />
        <KpiCard label="Unassigned" value={kpis.unassigned} intent="warning" hint="Need ownership" />
        <KpiCard label="Events Rolled Up" value={kpis.events} intent="info" hint="Across all notables" />
      </div>

      <div className="px-4 pb-6">
        <SectionCard title="Notable queue" description={`${rows.length} of ${NOTABLES.length} records`} bodyClassName="p-0">
          <DataTable<NotableEvent>
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/ops/notables/${r.id}`)}
            pageSize={25}
            filters={
              <FilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search notable id, title, host, user..."
                chips={chips}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
                      <Filter className="h-3.5 w-3.5" /> Urgency
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                      <DropdownMenuLabel className="text-[11px] uppercase">Urgency</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                      {(["all", "critical", "high", "medium", "low", "informational"] as const).map((u) => (
                        <DropdownMenuItem key={u} onClick={() => setUrgFilter(u as NotableUrgency | "all")} className="text-[12px] capitalize">
                          {u}
                        </DropdownMenuItem>
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
