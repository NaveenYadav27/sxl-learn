import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { EmptyState } from "@/ops/components/EmptyState";
import { findCi, CMDB } from "./cmdbData";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function CmdbDetail() {
  const { id = "" } = useParams();
  const ci = findCi(id);

  if (!ci) {
    return (
      <div className="p-6">
        <EmptyState title="CI not found" hint={`No record matches ${id}.`}
          action={<Link to="/ops/cmdb" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">← Back to inventory</Link>} />
      </div>
    );
  }

  const dependsOn = (ci.depends_on ?? []).map((d) => CMDB.find((c) => c.id === d)).filter(Boolean);
  const supports  = (ci.supports ?? []).map((d) => CMDB.find((c) => c.id === d)).filter(Boolean);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${ci.name}`}
        description={`${ci.id} · ${ci.type.replace("_", " ")} · ${ci.environment}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/cmdb" className="hover:text-[hsl(var(--ops-fg))]">CMDB</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{ci.id}</span>
          </span>
        }
        actions={
          <Link to="/ops/cmdb" className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="CI details">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Owner"><span className="text-[13px]">{ci.owner}</span></Field>
              <Field label="Group"><span className="text-[13px]">{ci.group}</span></Field>
              <Field label="Criticality"><span className="text-[13px] uppercase">{ci.criticality}</span></Field>
              <Field label="Health"><span className="text-[13px] capitalize">{ci.status}</span></Field>
              <Field label="Environment"><span className="text-[13px] uppercase">{ci.environment}</span></Field>
              <Field label="Type"><span className="text-[13px] capitalize">{ci.type.replace("_", " ")}</span></Field>
              {ci.ip && <Field label="IP"><span className="font-mono text-[13px]">{ci.ip}</span></Field>}
              {ci.os && <Field label="OS"><span className="font-mono text-[13px]">{ci.os}</span></Field>}
              {ci.location && <Field label="Location"><span className="text-[13px]">{ci.location}</span></Field>}
            </div>
            {ci.tags && (
              <div className="border-t border-[hsl(var(--ops-border))] p-4">
                <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Tags</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ci.tags.map((t) => <span key={t} className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.1)] px-1.5 py-0.5 text-[11px] text-[hsl(var(--ops-accent))]">#{t}</span>)}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Dependency map" bodyClassName="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <RelList title="Depends on" items={dependsOn as typeof CMDB} />
              <RelList title="Supports" items={supports as typeof CMDB} />
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Open work" bodyClassName="p-3">
            <div className="space-y-1.5 text-[12px]">
              <div className="flex items-center justify-between"><span className="text-[hsl(var(--ops-muted-fg))]">Incidents</span><span className="font-mono">{ci.open_incidents ?? 0}</span></div>
              <div className="flex items-center justify-between"><span className="text-[hsl(var(--ops-muted-fg))]">Changes</span><span className="font-mono">{ci.open_changes ?? 0}</span></div>
              {ci.last_seen && <div className="flex items-center justify-between"><span className="text-[hsl(var(--ops-muted-fg))]">Last seen</span><span className="font-mono">{rel(ci.last_seen)}</span></div>}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function rel(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 60000;
  if (d < 60) return `${Math.round(d)}m ago`;
  if (d < 1440) return `${Math.round(d / 60)}h ago`;
  return `${Math.round(d / 1440)}d ago`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RelList({ title, items }: { title: string; items: typeof CMDB }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))] mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-[12px] text-[hsl(var(--ops-muted-fg))]">No dependencies.</div>
      ) : (
        <ul className="space-y-1">
          {items.map((c) => (
            <li key={c.id}>
              <Link to={`/ops/cmdb/${c.id}`} className="block rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
                <div className="font-medium">{c.name}</div>
                <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{c.type.replace("_", " ")} · {c.criticality}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
