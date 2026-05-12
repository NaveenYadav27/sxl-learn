import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { EmptyState } from "@/ops/components/EmptyState";
import { findChange } from "./changesData";
import { ArrowLeft, ChevronRight, Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function ChangeDetail() {
  const { number = "" } = useParams();
  const chg = findChange(number);

  if (!chg) {
    return (
      <div className="p-6">
        <EmptyState title="Change not found" hint={`No record matches ${number}.`}
          action={<Link to="/ops/changes" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">← Back to calendar</Link>} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${chg.number} · ${chg.short_description}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/changes" className="hover:text-[hsl(var(--ops-fg))]">Changes</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{chg.number}</span>
          </span>
        }
        actions={
          <>
            <Link to="/ops/changes" className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-success))]">Approve</button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-critical))]">Reject</button>
          </>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="Change overview">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Type"><span className="text-[13px] capitalize">{chg.type}</span></Field>
              <Field label="Risk"><span className="text-[13px] capitalize">{chg.risk}</span></Field>
              <Field label="Impact"><span className="text-[13px] capitalize">{chg.impact}</span></Field>
              <Field label="State"><span className="text-[13px] capitalize">{chg.state}</span></Field>
              <Field label="Status"><StatusBadge status={chg.status} /></Field>
              <Field label="CAB required"><span className="text-[13px]">{chg.cab_required ? "Yes" : "No"}</span></Field>
              <Field label="Assignment group"><span className="text-[13px]">{chg.assignment_group}</span></Field>
              <Field label="Owner"><AssigneeChip assignee={chg.assigned_to} /></Field>
              <Field label="Planned window">
                <span className="text-[12px] tabular-nums text-[hsl(var(--ops-muted-fg))]">{fmt(chg.planned_start)} → {fmt(chg.planned_end)}</span>
              </Field>
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] p-4">
              <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Description</div>
              <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--ops-fg))]">{chg.description}</p>
            </div>
          </SectionCard>

          <SectionCard title="Implementation plan" bodyClassName="p-4">
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-[hsl(var(--ops-fg))]">{chg.implementation_plan}</pre>
          </SectionCard>

          <SectionCard title="Backout plan" bodyClassName="p-4">
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-[hsl(var(--ops-fg))]">{chg.backout_plan}</pre>
          </SectionCard>

          <SectionCard title="Test plan" bodyClassName="p-4">
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-[hsl(var(--ops-fg))]">{chg.test_plan}</pre>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Approvals" bodyClassName="p-0">
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {chg.approvals.map((a) => {
                const Icon = a.status === "approved" ? Check : a.status === "rejected" ? X : Clock;
                const color = a.status === "approved"
                  ? "text-[hsl(var(--ops-success))]"
                  : a.status === "rejected"
                    ? "text-[hsl(var(--ops-critical))]"
                    : "text-[hsl(var(--ops-warning))]";
                return (
                  <li key={a.name} className="flex items-center justify-between px-3 py-2 text-[12px]">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.role}</div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 text-[11px] uppercase font-medium", color)}>
                      <Icon className="h-3.5 w-3.5" /> {a.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard title="Configuration items" bodyClassName="p-0">
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {chg.cis.map((ci) => (
                <li key={ci.id} className="px-3 py-2 text-[12px]">
                  <div className="font-medium">{ci.name}</div>
                  <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                    {ci.type.replace("_", " ")}{ci.environment && ` · ${ci.environment}`}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {(chg.related_incidents?.length || chg.related_problems?.length) && (
            <SectionCard title="Related" bodyClassName="p-3">
              <div className="space-y-1.5 text-[12px]">
                {chg.related_incidents?.map((n) => (
                  <Link key={n} to={`/ops/incidents/${n}`} className="block font-mono text-[hsl(var(--ops-accent))] hover:underline">{n}</Link>
                ))}
                {chg.related_problems?.map((n) => (
                  <Link key={n} to={`/ops/problems/${n}`} className="block font-mono text-[hsl(var(--ops-accent))] hover:underline">{n}</Link>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
