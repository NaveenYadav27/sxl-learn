import { useMemo, useState } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { RESOURCES, ACCOUNTS } from "./cloudData";
import type { CloudResource, CloudProvider, ResourceType } from "./types";
import { PROVIDER_LABEL, PROVIDER_TOKEN, STATE_TOKEN, TYPE_LABEL, usd, rel } from "./lib";

export default function ResourcesList() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<CloudProvider | "all">("all");
  const [type, setType] = useState<ResourceType | "all">("all");

  const accountById = useMemo(() => Object.fromEntries(ACCOUNTS.map((a) => [a.id, a])), []);

  const rows = useMemo(() => RESOURCES.filter((r) => {
    if (provider !== "all" && r.provider !== provider) return false;
    if (type !== "all" && r.type !== type) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.service.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || JSON.stringify(r.tags).toLowerCase().includes(q);
  }), [search, provider, type]);

  const total = RESOURCES.length;
  const running = RESOURCES.filter((r) => r.state === "running").length;
  const errored = RESOURCES.filter((r) => r.state === "error").length;
  const monthly = RESOURCES.reduce((s, r) => s + r.monthly_cost_usd, 0);

  const columns: Column<CloudResource>[] = [
    { key: "state", header: "State", width: "110px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${STATE_TOKEN[r.state]}`}>{r.state}</span>
    )},
    { key: "name", header: "Resource", render: (r) => (
      <div>
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.service} · {accountById[r.account_id]?.name ?? r.account_id}</div>
      </div>
    )},
    { key: "provider", header: "Provider", width: "90px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PROVIDER_TOKEN[r.provider]}`}>{PROVIDER_LABEL[r.provider]}</span>
    )},
    { key: "type", header: "Type", width: "110px", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{TYPE_LABEL[r.type]}</span>
    )},
    { key: "region", header: "Region", width: "120px", render: (r) => (
      <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.region}</span>
    )},
    { key: "tags", header: "Tags", render: (r) => (
      <div className="flex flex-wrap gap-1">
        {Object.entries(r.tags).slice(0, 3).map(([k, v]) => (
          <span key={k} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">{k}={v}</span>
        ))}
      </div>
    )},
    { key: "monthly_cost_usd", header: "Cost / mo", width: "100px", align: "right", render: (r) => (
      <span className="font-mono text-[12px] tabular-nums">{usd(r.monthly_cost_usd)}</span>
    )},
    { key: "created_at", header: "Age", width: "80px", align: "right", render: (r) => (
      <span className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{rel(r.created_at)}</span>
    )},
  ];

  const PROVIDERS: CloudProvider[] = ["aws", "azure", "gcp", "oci"];
  const TYPES: ResourceType[] = ["compute", "storage", "database", "network", "serverless", "queue", "kubernetes", "cdn", "secret"];

  return (
    <div className="flex flex-col">
      <PageHeader title="Cloud Resources" description="Cross-cloud resource inventory with cost and state tracking." breadcrumb={<span>Cloud Ops / Resources</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total resources" value={total} />
        <KpiCard label="Running" value={running} intent="success" />
        <KpiCard label="Error state" value={errored} intent={errored > 0 ? "critical" : "success"} />
        <KpiCard label="Monthly spend" value={usd(monthly)} />
      </div>
      <div className="px-4 pb-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, service, tag..."
          actions={
            <div className="flex items-center gap-2">
              <select value={provider} onChange={(e) => setProvider(e.target.value as CloudProvider | "all")} className="h-8 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px]">
                <option value="all">All providers</option>
                {PROVIDERS.map((p) => <option key={p} value={p}>{PROVIDER_LABEL[p]}</option>)}
              </select>
              <select value={type} onChange={(e) => setType(e.target.value as ResourceType | "all")} className="h-8 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px]">
                <option value="all">All types</option>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
          }
        />
        <DataTable<CloudResource> columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25} />
      </div>
    </div>
  );
}
