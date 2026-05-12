import { useMemo } from "react";
import { PageHeader } from "@/ops/components/PageHeader";
import { KpiCard } from "@/ops/components/KpiCard";
import { SectionCard } from "@/ops/components/SectionCard";
import { DataTable, type Column } from "@/ops/components/DataTable";
import { ACCOUNTS, COST_BUCKETS } from "./cloudData";
import type { CostBucket } from "./types";
import { PROVIDER_LABEL, PROVIDER_TOKEN, usd } from "./lib";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function CostsList() {
  const total = COST_BUCKETS.reduce((s, b) => s + b.monthly_usd, 0);
  const forecast = COST_BUCKETS.reduce((s, b) => s + b.forecast_usd, 0);
  const change = ((forecast - total) / total) * 100;

  const byProvider = useMemo(() => {
    const map: Record<string, number> = {};
    COST_BUCKETS.forEach((b) => { map[b.provider] = (map[b.provider] ?? 0) + b.monthly_usd; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const columns: Column<CostBucket>[] = [
    { key: "provider", header: "Provider", width: "100px", render: (r) => (
      <span className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PROVIDER_TOKEN[r.provider]}`}>{PROVIDER_LABEL[r.provider]}</span>
    )},
    { key: "service", header: "Service", render: (r) => (
      <span className="text-[12px] text-[hsl(var(--ops-fg))]">{r.service}</span>
    )},
    { key: "monthly_usd", header: "Current", width: "120px", align: "right", render: (r) => (
      <span className="font-mono text-[12px] tabular-nums">{usd(r.monthly_usd)}</span>
    )},
    { key: "forecast_usd", header: "Forecast", width: "120px", align: "right", render: (r) => (
      <span className="font-mono text-[12px] tabular-nums text-[hsl(var(--ops-muted-fg))]">{usd(r.forecast_usd)}</span>
    )},
    { key: "change_pct", header: "Δ", width: "100px", align: "right", render: (r) => {
      const up = r.change_pct >= 0;
      return (
        <span className={`inline-flex items-center justify-end gap-1 text-[11px] tabular-nums ${up ? "text-[hsl(var(--ops-critical))]" : "text-[hsl(var(--ops-success))]"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(r.change_pct).toFixed(1)}%
        </span>
      );
    }},
    { key: "share", header: "Share", width: "150px", align: "right", render: (r) => {
      const pct = (r.monthly_usd / total) * 100;
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1 w-20 overflow-hidden rounded-full bg-[hsl(var(--ops-panel-2))]">
            <div className="h-full bg-[hsl(var(--ops-accent))]" style={{ width: `${pct}%` }} />
          </div>
          <span className="w-8 text-right text-[11px] tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      );
    }},
  ];

  const sortedAccounts = [...ACCOUNTS].sort((a, b) => b.monthly_spend_usd - a.monthly_spend_usd).slice(0, 6);

  return (
    <div className="flex flex-col">
      <PageHeader title="Cloud Costs" description="Monthly spend, forecasts, and largest cost drivers across providers." breadcrumb={<span>Cloud Ops / Costs</span>} />
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Current month" value={usd(total)} />
        <KpiCard label="Forecast" value={usd(forecast)} intent={change >= 5 ? "warning" : "default"} hint={`${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs current`} />
        <KpiCard label="Top provider" value={PROVIDER_LABEL[byProvider[0][0] as keyof typeof PROVIDER_LABEL]} hint={usd(byProvider[0][1])} />
        <KpiCard label="Cost buckets" value={COST_BUCKETS.length} />
      </div>

      <div className="grid gap-3 px-4 pb-4 lg:grid-cols-3">
        <SectionCard title="Spend by service" className="lg:col-span-2" bodyClassName="p-0">
          <DataTable<CostBucket> columns={columns} rows={[...COST_BUCKETS].sort((a, b) => b.monthly_usd - a.monthly_usd)} rowKey={(r) => `${r.provider}-${r.service}`} pageSize={25} />
        </SectionCard>

        <SectionCard title="Top accounts by spend" bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {sortedAccounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-[12px]">
                <div className="min-w-0">
                  <div className="truncate font-mono">{a.name}</div>
                  <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{PROVIDER_LABEL[a.provider]} · {a.environment}</div>
                </div>
                <span className="font-mono tabular-nums">{usd(a.monthly_spend_usd)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
