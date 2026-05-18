import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { DOCKERS } from "./dockersData";
import { K8S_INCIDENTS } from "./incidentsData";
import type { DockerContainer, DockerState } from "./types";
import { DOCKER_TOKEN, rel } from "./lib";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Filter, BookOpen, ExternalLink } from "lucide-react";

export default function ContainersList() {
  const [search, setSearch] = useState("");
  const [host, setHost] = useState<string>("all");
  const [state, setState] = useState<DockerState | "all">("all");

  const hosts = useMemo(() => Array.from(new Set(DOCKERS.map((d) => d.host))), []);

  const rows = useMemo(() => DOCKERS.filter((d) => {
    if (host !== "all" && d.host !== host) return false;
    if (state !== "all" && d.state !== state) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.name.toLowerCase().includes(q) && !d.image.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [search, host, state]);

  const kpis = useMemo(() => ({
    total: DOCKERS.length,
    running: DOCKERS.filter((d) => d.state === "running").length,
    exited: DOCKERS.filter((d) => d.state === "exited" || d.state === "dead").length,
    restarting: DOCKERS.filter((d) => d.state === "restarting").length,
  }), []);

  const columns: Column<DockerContainer>[] = [
    { key: "name", header: "Container", sortable: true, render: (r) => (
      <div className="min-w-[220px]">
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.id}</div>
      </div>
    ) },
    { key: "image", header: "Image", render: (r) => <span className="font-mono text-[11px] break-all">{r.image}</span> },
    { key: "state", header: "State", width: "110px", sortable: true, render: (r) => <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${DOCKER_TOKEN[r.state]}`}>{r.state}</span> },
    { key: "status", header: "Status", width: "160px", render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.status}</span> },
    { key: "host", header: "Host", width: "180px", render: (r) => <span className="font-mono text-[11px]">{r.host}</span> },
    { key: "cpu_pct", header: "CPU", width: "70px", align: "right", sortable: true, render: (r) => <span className={`font-mono text-[12px] ${r.cpu_pct > 80 ? "text-[hsl(var(--ops-critical))]" : r.cpu_pct > 50 ? "text-[hsl(var(--ops-warning))]" : ""}`}>{r.cpu_pct.toFixed(1)}%</span> },
    { key: "mem_mb", header: "Mem", width: "120px", sortable: true, render: (r) => {
      const p = r.mem_limit_mb ? Math.round((r.mem_mb / r.mem_limit_mb) * 100) : 0;
      return (
        <div>
          <div className="h-1 w-16 overflow-hidden rounded-sm bg-[hsl(var(--ops-panel-2))]"><div className={`h-full ${p > 85 ? "bg-[hsl(var(--ops-critical))]" : p > 70 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-success))]"}`} style={{ width: `${p}%` }} /></div>
          <div className="mt-0.5 font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">{r.mem_mb}/{r.mem_limit_mb} MB</div>
        </div>
      );
    } },
    { key: "ports", header: "Ports", width: "140px", render: (r) => <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.ports}</span> },
    { key: "created_at", header: "Created", width: "100px", sortable: true, sortValue: (r) => new Date(r.created_at).getTime(), render: (r) => <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.created_at)}</span> },
  ];

  const chips = [
    ...(host !== "all" ? [{ key: "h", label: "Host", value: host, onRemove: () => setHost("all") }] : []),
    ...(state !== "all" ? [{ key: "s", label: "State", value: state, onRemove: () => setState("all") }] : []),
  ];

  return (
    <div className="flex flex-col">
      <PageHeader title="Docker — Containers" description="Standalone Docker engine container inventory across managed hosts." breadcrumb={<span>Reliability / Docker / Containers</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Containers" value={kpis.total} />
        <KpiCard label="Running" value={kpis.running} intent="success" />
        <KpiCard label="Exited / Dead" value={kpis.exited} hint="Stopped" />
        <KpiCard label="Restarting" value={kpis.restarting} intent="warning" />
      </div>
      <div className="px-4 pb-6">
        <SectionCard title="Containers" description={`${rows.length} of ${DOCKERS.length}`} bodyClassName="p-0">
          <DataTable<DockerContainer>
            columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25}
            expandable={(r) => (
              <div className="grid gap-3 sm:grid-cols-3 text-[12px]">
                <div className="sm:col-span-2"><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Command</div><pre className="mt-1 overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] p-2 font-mono text-[11px] whitespace-pre-wrap">{r.command}</pre></div>
                <div><div className="text-[10px] uppercase text-[hsl(var(--ops-muted-fg))]">Network I/O</div><div className="font-mono text-[11px]">RX {r.network_rx_mb} MB · TX {r.network_tx_mb} MB</div></div>
              </div>
            )}
            filters={
              <FilterBar
                searchValue={search} onSearchChange={setSearch}
                searchPlaceholder="Search container, image, id..." chips={chips}
                actions={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> Host</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        <DropdownMenuLabel className="text-[11px] uppercase">Host</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
                        <DropdownMenuItem onClick={() => setHost("all")} className="text-[12px]">All</DropdownMenuItem>
                        {hosts.map((h) => <DropdownMenuItem key={h} onClick={() => setHost(h)} className="text-[12px] font-mono">{h}</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]"><Filter className="h-3.5 w-3.5" /> State</DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                        {(["all", "running", "exited", "restarting", "paused", "dead", "created"] as const).map((s) => (
                          <DropdownMenuItem key={s} onClick={() => setState(s as DockerState | "all")} className="text-[12px] capitalize">{s}</DropdownMenuItem>
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
