import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { EmptyState } from "@/ops/components/EmptyState";
import { findProblem } from "./problemsData";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";

export default function ProblemDetail() {
  const { number = "" } = useParams();
  const prb = findProblem(number);

  if (!prb) {
    return (
      <div className="p-6">
        <EmptyState title="Problem not found" hint={`No record matches ${number}.`}
          action={<Link to="/ops/problems" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">← Back to backlog</Link>} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${prb.number} · ${prb.short_description}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/problems" className="hover:text-[hsl(var(--ops-fg))]">Problems</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{prb.number}</span>
          </span>
        }
        actions={
          <Link to="/ops/problems" className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="Problem details">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Status"><StatusBadge status={prb.status} /></Field>
              <Field label="Severity"><SeverityBadge severity={prb.severity} /></Field>
              <Field label="Priority"><span className="font-mono text-[13px]">P{prb.priority}</span></Field>
              <Field label="Category"><span className="capitalize text-[13px]">{prb.category}</span></Field>
              <Field label="Assignment group"><span className="text-[13px]">{prb.assignment_group ?? "—"}</span></Field>
              <Field label="Assigned to"><AssigneeChip assignee={prb.assigned_to} /></Field>
              <Field label="Known error">
                {prb.known_error
                  ? <span className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] px-1.5 py-0.5 text-[11px] text-[hsl(var(--ops-warning))]"><BookOpen className="h-3 w-3"/>Yes</span>
                  : <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">No</span>}
              </Field>
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] p-4 space-y-3">
              <Block label="Description" body={prb.description} />
              {prb.workaround && <Block label="Workaround" body={prb.workaround} accent="warning" />}
              {prb.root_cause && <Block label="Root cause" body={prb.root_cause} accent="info" />}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Affected CIs" bodyClassName="p-0">
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {prb.cis.map((ci) => (
                <li key={ci.id} className="px-3 py-2 text-[12px]">
                  <div className="font-medium">{ci.name}</div>
                  <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                    {ci.type.replace("_", " ")}{ci.environment && ` · ${ci.environment}`}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Related incidents" bodyClassName="p-0">
            {prb.related_incidents.length === 0 ? (
              <div className="p-3 text-[12px] text-[hsl(var(--ops-muted-fg))]">None linked.</div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--ops-border))]">
                {prb.related_incidents.map((n) => (
                  <li key={n} className="px-3 py-2">
                    <Link to={`/ops/incidents/${n}`} className="text-[12px] text-[hsl(var(--ops-accent))] hover:underline font-mono">{n}</Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
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

function Block({ label, body, accent }: { label: string; body: string; accent?: "info" | "warning" }) {
  const color = accent === "warning"
    ? "border-[hsl(var(--ops-warning)/0.4)] bg-[hsl(var(--ops-warning)/0.08)]"
    : accent === "info"
      ? "border-[hsl(var(--ops-info)/0.4)] bg-[hsl(var(--ops-info)/0.08)]"
      : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]";
  return (
    <div className={`rounded-sm border p-3 ${color}`}>
      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-[hsl(var(--ops-fg))]">{body}</p>
    </div>
  );
}
