import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { SlaIndicator } from "@/ops/components/SlaIndicator";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { OpsTabs } from "@/ops/components/OpsTabs";
import { ActivityTimeline, type ActivityEvent } from "@/ops/components/ActivityTimeline";
import { EmptyState } from "@/ops/components/EmptyState";
import { findIncident } from "./incidentsData";
import { ArrowLeft, ChevronRight, ExternalLink, MessageSquare } from "lucide-react";

const eventIntent: Record<string, ActivityEvent["intent"]> = {
  created: "info",
  assigned: "default",
  status: "warning",
  comment: "default",
  escalation: "critical",
  linked: "info",
  resolved: "success",
};

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export default function IncidentDetail() {
  const { number = "" } = useParams();
  const navigate = useNavigate();
  const inc = findIncident(number);
  const [tab, setTab] = useState<"activity" | "comments" | "related">("activity");

  const timeline = useMemo<ActivityEvent[]>(() => {
    if (!inc) return [];
    return [...inc.events]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .map((e) => ({
        id: e.id,
        at: rel(e.at),
        actor: e.actor,
        intent: eventIntent[e.kind] ?? "default",
        title: e.summary,
        detail: e.detail,
      }));
  }, [inc]);

  if (!inc) {
    return (
      <div className="p-6">
        <EmptyState
          title="Incident not found"
          hint={`No record matches ${number}.`}
          action={
            <Link to="/ops/incidents" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">
              ← Back to queue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${inc.number} · ${inc.short_description}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/incidents" className="hover:text-[hsl(var(--ops-fg))]">Incidents</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{inc.number}</span>
          </span>
        }
        actions={
          <>
            <button
              onClick={() => navigate("/ops/incidents")}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-warning))]">
              Escalate
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-success))]">
              Resolve
            </button>
          </>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-3">
          <SectionCard title="Incident details">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Status"><StatusBadge status={inc.status} /></Field>
              <Field label="Severity"><SeverityBadge severity={inc.severity} /></Field>
              <Field label="Priority"><span className="font-mono text-[13px]">P{inc.priority}</span></Field>
              <Field label="Category"><span className="capitalize text-[13px]">{inc.category}</span></Field>
              <Field label="Source"><span className="capitalize text-[13px]">{inc.source}</span></Field>
              <Field label="Caller"><span className="text-[13px]">{inc.caller}</span></Field>
              <Field label="Assignment group"><span className="text-[13px]">{inc.assignment_group ?? "—"}</span></Field>
              <Field label="Assigned to"><AssigneeChip assignee={inc.assigned_to} /></Field>
              <Field label="SLA"><SlaIndicator percent={inc.sla_percent} /></Field>
              <Field label="Opened">
                <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(inc.opened_at)}</span>
              </Field>
              <Field label="Updated">
                <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(inc.updated_at)}</span>
              </Field>
              {inc.resolved_at && (
                <Field label="Resolved">
                  <span className="text-[12px] text-[hsl(var(--ops-success))]">{rel(inc.resolved_at)}</span>
                </Field>
              )}
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] p-4">
              <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Description</div>
              <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--ops-fg))]">{inc.description}</p>
            </div>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            <OpsTabs
              active={tab}
              onChange={(k) => setTab(k as typeof tab)}
              tabs={[
                { key: "activity", label: "Activity", count: inc.events.length },
                { key: "comments", label: "Work notes", count: inc.comments.length },
                { key: "related", label: "Related", count: inc.related?.length ?? 0 },
              ]}
            />
            <div className="p-4">
              {tab === "activity" && <ActivityTimeline events={timeline} />}
              {tab === "comments" && (
                inc.comments.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No work notes yet" hint="Add the first update." />
                ) : (
                  <ul className="space-y-3">
                    {inc.comments.map((c) => (
                      <li key={c.id} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3">
                        <div className="flex items-center justify-between text-[11px] text-[hsl(var(--ops-muted-fg))]">
                          <span className="font-semibold text-[hsl(var(--ops-fg))]">{c.author}</span>
                          <span>{rel(c.at)}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-[hsl(var(--ops-fg))]">{c.body}</p>
                      </li>
                    ))}
                  </ul>
                )
              )}
              {tab === "related" && (
                !inc.related?.length ? (
                  <EmptyState title="No related records" hint="Linked incidents will appear here." />
                ) : (
                  <ul className="space-y-1.5">
                    {inc.related.map((n) => (
                      <li key={n}>
                        <Link to={`/ops/incidents/${n}`} className="inline-flex items-center gap-1 text-[12px] text-[hsl(var(--ops-accent))] hover:underline">
                          {n} <ExternalLink className="h-3 w-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </SectionCard>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-3">
          <SectionCard title="Configuration items" bodyClassName="p-0">
            <ul className="divide-y divide-[hsl(var(--ops-border))]">
              {inc.cis.map((ci) => (
                <li key={ci.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
                  <div>
                    <div className="font-medium text-[hsl(var(--ops-fg))]">{ci.name}</div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                      {ci.type.replace("_", " ")}{ci.environment && ` · ${ci.environment}`}
                    </div>
                  </div>
                  <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--ops-muted-fg))]">CI</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {["Reassign", "Add work note", "Link change", "Create problem", "Notify CAB"].map((a) => (
                <button
                  key={a}
                  className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)] hover:text-[hsl(var(--ops-accent))]"
                >
                  {a}
                </button>
              ))}
            </div>
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
