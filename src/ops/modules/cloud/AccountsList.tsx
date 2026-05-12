import { useMemo, useState } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { FilterBar } from "@/ops/components/FilterBar";
import { ACCOUNTS } from "./cloudData";
import type { CloudAccount, CloudProvider } from "./types";
import { PROVIDER_LABEL, PROVIDER_TOKEN, usd } from "./lib";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function AccountsList() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<CloudProvider | "all">("all");

  const rows = useMemo(() => ACCOUNTS.filter((a) => {
    if (provider !== "all" && a.provider !== provider) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.account_id.toLowerCase().includes(q) || a.owner_team.toLowerCase().includes(q);
  }), [search, provider]);

  const totalSpend = ACCOUNTS.reduce((s, a) => s + a.monthly_spend_usd, 0);
  const avgCompliance = Math.round(ACCOUNTS.reduce((s, a) => s + a.compliance_score, 0) / ACCOUNTS.length);
  const totalResources = ACCOUNTS.reduce((s, a) => s + a.resources, 0);

  const columns: Column<CloudAccount>[] = [
    { key: "provider", header: "Provider", width: "100px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PROVIDER_TOKEN[r.provider]}`}>{PROVIDER_LABEL[r.provider]}</span>
    )},
    { key: "name", header: "Account", render: (r) => (
      <div>
        <div className="font-mono text-[12px] text-[hsl(var(--ops-fg))]">{r.name}</div>
        <div className="truncate font-mono text-[10px] text-[hsl(var(--ops-muted-fg))]">{r.account_id}</div>
      </div>
    )},
    { key: "environment", header: "Env", width: "90px", render: (r) => (
      <span className="text-[11px] uppercase text-[hsl(var(--ops-muted-fg))]">{r.environment}</span>
    )},
    { key: "owner_team", header: "Owner", width: "120px", render: (r) => (
      <span className="text-[12px]">{r.owner_team}</span>
    )},
    { key: "region_primary", header: "Region", width: "120px", render: (r) => (
      <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{r.region_primary}</span>
    )},
    { key: "resources", header: "Resources", width: "100px", align: "right", render: (r) => (
      <span className="text-[12px] tabular-nums">{r.resources}</span>
    )},
    { key: "monthly_spend_usd", header: "Spend / mo", width: "110px", align: "right", render: (r) => (
      <span className="font-mono text-[12px] tabular-nums">{usd(r.monthly_spend_usd)}</span>
    )},
    { key: "spend_change_pct", header: "Δ MoM", width: "90px", align: "right", render: (r) => {
      const up = r.spend_change_pct >= 0;
      return (
        <span className={`inline-flex items-center justify-end gap-1 text-[11px] tabular-nums ${up ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-success))]"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(r.spend_change_pct).toFixed(1)}%
        </span>
      );
    }},
    { key: "compliance_score", header: "Compliance", width: "120px", align: "right", render: (r) => (
      <div className="flex items-center justify-end gap-2">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-[hsl(var(--ops-panel-2))]">
          <div className={`h-full ${r.compliance_score >= 90 ? "bg-[hsl(var(--ops-success))]" : r.compliance_score >= 80 ? "bg-[hsl(var(--ops-warning))]" : "bg-[hsl(var(--ops-critical))]"}`} style={{ width: `${r.compliance_score}%` }} />
        </div>
        <span className="w-8 text-right text-[11px] tabular-nums">{r.compliance_score}</span>
      </div>
    )},
  ];

  const PROVIDERS: CloudProvider[] = ["aws", "azure", "gcp", "oci"];

  return (
    <div className="flex flex-col">
      <PageHeader title="Cloud Accounts" description="Multi-cloud account inventory across AWS, Azure, GCP and OCI." breadcrumb={<span>Cloud Ops / Accounts</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Accounts" value={ACCOUNTS.length} hint={`${PROVIDERS.length} providers`} />
        <KpiCard label="Monthly spend" value={usd(totalSpend)} intent="default" />
        <KpiCard label="Resources" value={totalResources.toLocaleString()} />
        <KpiCard label="Avg compliance" value={`${avgCompliance}%`} intent={avgCompliance >= 85 ? "success" : "warning"} />
      </div>
      <div className="px-4 pb-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts, owners, IDs..."
          actions={
            <select value={provider} onChange={(e) => setProvider(e.target.value as CloudProvider | "all")} className="h-8 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 text-[12px]">
              <option value="all">All providers</option>
              {PROVIDERS.map((p) => <option key={p} value={p}>{PROVIDER_LABEL[p]}</option>)}
            </select>
          }
        />
        <DataTable<CloudAccount> columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={25} />
      </div>
    </div>
  );
}
