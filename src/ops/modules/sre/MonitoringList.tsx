import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { MONITORS } from "./monitoringData";
import { findService } from "./servicesData";
import type { MonitorState, MonitoringAlert } from "./types";
import { MONITOR_TOKEN, dur, rel } from "./lib";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, RefreshCw } from "lucide-react";

const SOURCE_LABEL: Record<MonitoringAlert["source"], string> = {
  grafana: "Grafana", prometheus: "Prometheus", datadog: "Datadog", newrelic: "New Relic", cloudwatch: "CloudWatch",
};

export default function MonitoringList() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState<MonitorState | "all">("all");

  const rows = useMemo(() => MONITORS.filter((m) => {
    if (state !== "all" && m.state !== state) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.rule_name.toLowerCase().includes(q) && !m.summary.toLowerCase().includes(q) && !JSON.stringify(m.labels).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, state]);

  const kpis = useMemo(() => ({
    alerting: MONITORS.filter((m) => m.state === "alerting").length,
    pending: MONITORS.filter((m) => m.state === "pending").length,
    silenced: MONITORS.filter((m) => m.state === "silenced").length,
    ok: MONITORS.filter((m) => m.state === "ok").length,
  }), []);

  const columns: Column<MonitoringAlert>[] = [
    { key: "rule_name", header: "Alert rule", sortable: true, render: (r) => (
      <div className="min-w-[260px]">
        <div className="truncate text-[12px] text-[hsl(var(--ops-fg))]">{r.rule_name}</div>
        <div className="truncate text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.summary}</div>
      </div>
    ) },
    { key: "severity", header: "Sev", width: "90px", sortable: true, render: (r) => <SeverityBadge severity={r.severity} /> },
    { key: "state", header: "State", width: "100px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${MONITOR_TOKEN[r.state]}`}>{r.state.replace("_", " ")}</span> },
    { key: "source", header: "Source", width: "100px", render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{SOURCE_LABEL[r.source]}</span> },
    { key: "service_id", header: "Service", width: "140px", render: (r) => {
      if (!r.service_id) return <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">—</span>;
      const s = findService(r.service_id);
      return s ? <Link to={`/ops/sre/services/${s.id}`} className="font-mono text-[12px] text-[hsl(var(--ops-accent))] hover:underline">{s.name}</Link> : <span className="font-mono text-[12px]">{r.service_id}</span>;
    } },
    { key: "value", header: "Value / Thr", width: "120px", align: "right", render: (r) => <span className="font-mono text-[11px]"><span className={r.state === "alerting" ? "text-[hsl(var(--ops-critical))]" : ""}>{r.value}</span> / {r.threshold}</span> },
    { key: "duration_s", header: "Duration", width: "90px", sortable: true, render: (r) => <span className="font-mono text-[11px]">{dur(r.duration_s)}</span> },
    { key: "fired_at", header: "Fired", width: "100px", sortable: true, sortValue: (r) => new Date(r.fired_at).getTime(), render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.fired_at)}</span> },
  ];

  const chips = state !== "all" ? [{ key: "s", label: "State", value: state, onRemove: () => setState("all") }] : [];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Monitoring — Alerts"
        description="Aggregated alerts from Grafana, Prometheus, Datadog, New Relic, and CloudWatch."
        breadcrumb={<span>Reliability / Monitoring</span>}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        }
      />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Alerting" value={kpis.alerting} intent="critical" />
        <KpiCard label="Pending" value={kpis.pending} intent="warning" />
        <KpiCard label="Silenced" value={kpis.silenced} hint="Suppressed" />
        <KpiCard label="OK" value={kpis.ok} intent="success" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="Active alerts" description={`${rows.length} of ${MONITORS.length}`} bodyClassName="p-0">
          <DataTable<MonitoringAlert>
            columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25}
            expandable={(r) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_280px] text-[12px]">
                <div>
                  <div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Expression</div>
                  <pre className="mt-1 overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] p-2 font-mono text-[11px] whitespace-pre-wrap">{r.expression}</pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Labels</div>
                  <ul className="mt-1 space-y-0.5">
                    {Object.entries(r.labels).map(([k, v]) => (
                      <li key={k} className="font-mono text-[11px]"><span className="text-[hsl(var(--ops-muted-fg))]">{k}=</span>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            filters={
              <FilterBar
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder="Search rule, summary, label..." chips={chips}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> State</DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                      <DropdownMenuLabel className="text-[11px] uppercase">State</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                      {(["all", "alerting", "pending", "ok", "silenced", "no_data"] as const).map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setState(s as MonitorState | "all")} className="text-[12px] capitalize">{s.replace("_", " ")}</DropdownMenuItem>
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
