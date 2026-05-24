import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { K8S_INCIDENTS, K8S_MODULES, type K8sIncidentSeverity, type K8sIncidentStatus, type K8sModuleCode } from "./incidentsData";
import { AlertOctagon, BookOpen, ExternalLink } from "lucide-react";

const SEV_TOKEN: Record<K8sIncidentSeverity, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high:     "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium:   "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low:      "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

const STATUS_TOKEN: Record<K8sIncidentStatus, string> = {
  open:        "text-[hsl(var(--ops-critical))]",
  in_progress: "text-[hsl(var(--ops-warning))]",
  resolved:    "text-[hsl(var(--ops-success))]",
};

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function K8sIncidentsList() {
  const [sev, setSev] = useState<"all" | K8sIncidentSeverity>("all");
  const [status, setStatus] = useState<"all" | K8sIncidentStatus>("all");
  const [mod, setMod] = useState<"all" | K8sModuleCode>("all");

  const rows = useMemo(
    () =>
      K8S_INCIDENTS.filter((i) =>
        (sev === "all" || i.severity === sev) &&
        (status === "all" || i.status === status) &&
        (mod === "all" || i.module === mod),
      ).sort((a, b) => new Date(b.last_event_at).getTime() - new Date(a.last_event_at).getTime()),
    [sev, status, mod],
  );

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 } as Record<K8sIncidentSeverity, number>;
    K8S_INCIDENTS.forEach((i) => { c[i.severity]++; });
    return c;
  }, []);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Kubernetes & Container Incidents"
        description="Pod-, image-, build- and registry-level failures correlated across kubectl, Docker, Trivy, ArgoCD, Prometheus and GHCR."
      />

      <div className="grid gap-3 p-4">
        {/* M3 Learning Hub banner */}
        {(() => {
          const m3 = K8S_INCIDENTS.filter((i) => i.module === "M3" && (i as any).k8s_concept);
          if (m3.length === 0) return null;
          return (
            <div className="rounded-md border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--ops-accent))]">
                    <BookOpen className="h-4 w-4" /> Module 3 · Kubernetes Fundamentals — Interactive Learning Hub
                  </div>
                  <div className="mt-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">
                    {m3.length} concept-driven incidents · hoverable glossary · Linux ↔ Windows comparison · scripted lab console · troubleshooting terminal
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m3.slice(0, 4).map((i) => (
                    <Link
                      key={i.id}
                      to={`/ops/k8s-incidents/${i.id}`}
                      className="rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-bg))] px-2 py-1 text-[11px] text-[hsl(var(--ops-accent))] hover:bg-[hsl(var(--ops-accent)/0.15)]"
                    >
                      {i.id} · {i.title.length > 38 ? i.title.slice(0, 38) + "…" : i.title}
                    </Link>
                  ))}
                  {m3.length > 4 && (
                    <button
                      onClick={() => setMod("M3")}
                      className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 py-1 text-[11px] text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]"
                    >
                      +{m3.length - 4} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-4 py-2.5">
          <div className="flex items-center gap-3 text-[12px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--ops-success))]" />
              <span className="text-[hsl(var(--ops-muted-fg))]">Live feed:</span>
              <span className="font-semibold text-[hsl(var(--ops-success))]">RUNNING</span>
            </span>
            <span className="text-[hsl(var(--ops-muted-fg))]">· kubelet · containerd · buildkit · GHCR audit</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Chip color="critical" label={`${counts.critical} crit`} />
            <Chip color="high"     label={`${counts.high} high`} />
            <Chip color="medium"   label={`${counts.medium} med`} />
            <Chip color="low"      label={`${counts.low} low`} />
          </div>
        </div>

        {/* Module strip — curriculum alignment */}
        <div className="rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] p-3">
          <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
            <BookOpen className="h-3.5 w-3.5" /> Aligned to K8s curriculum modules
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ModChip active={mod === "all"} onClick={() => setMod("all")} label={`All (${K8S_INCIDENTS.length})`} />
            {K8S_MODULES.map((m) => {
              const c = K8S_INCIDENTS.filter((i) => i.module === m.code).length;
              return (
                <ModChip key={m.code} active={mod === m.code} onClick={() => setMod(m.code)} label={`${m.code} · ${c}`} title={m.title} />
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Severity" value={sev} onChange={(v) => setSev(v as typeof sev)}
            opts={[["all", "all"], ["critical", "critical"], ["high", "high"], ["medium", "medium"], ["low", "low"]]} />
          <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as typeof status)}
            opts={[["all", "all"], ["open", "open"], ["in_progress", "in progress"], ["resolved", "resolved"]]} />
          <div /><div />
        </div>

        <SectionCard title={`${rows.length} incident${rows.length === 1 ? "" : "s"}`} bodyClassName="p-0">
          <ul className="divide-y divide-[hsl(var(--ops-border))]">
            {rows.map((i) => (
              <li key={i.id}>
                <Link
                  to={`/ops/k8s-incidents/${i.id}`}
                  className="grid grid-cols-[100px_70px_1fr_180px_120px_90px] items-center gap-3 px-4 py-3 text-[12px] hover:bg-[hsl(var(--ops-panel-2))]"
                >
                  <span className="font-mono text-[hsl(var(--ops-muted-fg))]">{i.id}</span>
                  <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.10)] px-1.5 py-0.5 text-center font-mono text-[10px] text-[hsl(var(--ops-accent))]" title={i.module_title}>
                    {i.module}
                  </span>
                  <span className="flex items-center gap-2 text-[hsl(var(--ops-fg))]">
                    <AlertOctagon className="h-3.5 w-3.5 text-[hsl(var(--ops-warning))]" />
                    {i.title}
                  </span>
                  <span className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{i.cluster} / {i.namespace}</span>
                  <span className={`text-[11px] uppercase tracking-wide ${STATUS_TOKEN[i.status]}`}>{i.status.replace("_", " ")}</span>
                  <span className={`inline-flex w-fit items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TOKEN[i.severity]}`}>
                    {i.severity}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">
          Tip: each incident maps to a hands-on K8s lab — open one and click <ExternalLink className="inline h-3 w-3" /> Open Lab from the detail page.
        </div>
      </div>
    </div>
  );
}

function Chip({ color, label }: { color: K8sIncidentSeverity; label: string }) {
  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TOKEN[color]}`}>{label}</span>
  );
}

function FilterSelect({ label, value, onChange, opts }: {
  label: string; value: string; onChange: (v: string) => void; opts: [string, string][];
}) {
  return (
    <label className="block text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-2 py-1.5 text-[12px] text-[hsl(var(--ops-fg))]"
      >
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function ModChip({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.18)] text-[hsl(var(--ops-accent))]"
          : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

