import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { StatusBadge } from "@/ops/components/StatusBadge";
import { SeverityBadge } from "@/ops/components/SeverityBadge";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { OpsTabs } from "@/ops/components/OpsTabs";
import { ActivityTimeline, type ActivityEvent } from "@/ops/components/ActivityTimeline";
import { EmptyState } from "@/ops/components/EmptyState";
import { findAlert } from "./alertsData";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";

const eventIntent: Record<string, ActivityEvent["intent"]> = {
  created: "info",
  triaged: "default",
  assigned: "default",
  status: "warning",
  comment: "default",
  escalated: "critical",
  linked: "info",
  closed: "success",
  playbook: "info",
};

function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

const obsBadge: Record<string, string> = {
  ip: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  host: "bg-[hsl(var(--ops-accent)/0.15)] text-[hsl(var(--ops-accent))] border-[hsl(var(--ops-accent)/0.4)]",
  user: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  hash: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  domain: "bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.4)]",
  url: "bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.4)]",
  process: "bg-[hsl(var(--ops-high)/0.15)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.4)]",
  file: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
};

export default function AlertDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const a = findAlert(id);
  const [tab, setTab] = useState<"activity" | "observables" | "related">("activity");

  const timeline = useMemo<ActivityEvent[]>(() => {
    if (!a) return [];
    return [...a.events]
      .sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
      .map((e) => ({
        id: e.id,
        at: rel(e.at),
        actor: e.actor,
        intent: eventIntent[e.kind] ?? "default",
        title: e.summary,
        detail: e.detail,
      }));
  }, [a]);

  if (!a) {
    return (
      <div className="p-6">
        <EmptyState
          title="Alert not found"
          hint={`No record matches ${id}.`}
          action={
            <Link to="/ops/alerts" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">
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
        title={`${a.id} · ${a.title}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/alerts" className="hover:text-[hsl(var(--ops-fg))]">Alerts</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{a.id}</span>
          </span>
        }
        actions={
          <>
            <button onClick={() => navigate("/ops/alerts")} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-warning))]">
              Escalate
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-success))]">
              Mark TP
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px]">
              Mark FP
            </button>
          </>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="Alert details">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Status"><StatusBadge status={a.status} /></Field>
              <Field label="Severity"><SeverityBadge severity={a.severity} /></Field>
              <Field label="Risk / Confidence">
                <span className="font-mono text-[13px] text-[hsl(var(--ops-fg))]">{a.risk_score} / {a.confidence}</span>
              </Field>
              <Field label="Source"><span className="capitalize text-[13px]">{a.source.replace("_", " ")}</span></Field>
              <Field label="Rule">
                <div className="text-[13px]">{a.rule_name}</div>
                <div className="font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.rule_id}</div>
              </Field>
              <Field label="MITRE ATT&CK">
                <div className="font-mono text-[13px] text-[hsl(var(--ops-fg))]">{a.technique}</div>
                <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.technique_name}</div>
              </Field>
              <Field label="Tactic"><span className="capitalize text-[13px]">{a.tactic.replace("_", " ")}</span></Field>
              <Field label="Assignment group"><span className="text-[13px]">{a.assignment_group ?? "—"}</span></Field>
              <Field label="Assigned to"><AssigneeChip assignee={a.assigned_to} /></Field>
              <Field label="Disposition"><span className="capitalize text-[13px]">{a.disposition.replace("_", " ")}</span></Field>
              <Field label="Created">
                <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(a.created_at)}</span>
              </Field>
              <Field label="Updated">
                <span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(a.updated_at)}</span>
              </Field>
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] p-4">
              <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Description</div>
              <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--ops-fg))]">{a.description}</p>
            </div>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            <OpsTabs
              active={tab}
              onChange={(k) => setTab(k as typeof tab)}
              tabs={[
                { key: "activity", label: "Activity", count: a.events.length },
                { key: "observables", label: "Observables", count: a.observables.length },
                { key: "related", label: "Related", count: (a.related_alerts?.length ?? 0) + (a.related_incident ? 1 : 0) + (a.related_notable ? 1 : 0) },
              ]}
            />
            <div className="p-4">
              {tab === "activity" && <ActivityTimeline events={timeline} />}
              {tab === "observables" && (
                a.observables.length === 0 ? (
                  <EmptyState title="No observables" hint="No IOCs were extracted." />
                ) : (
                  <table className="w-full text-[12px]">
                    <thead className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                      <tr>
                        <th className="py-1.5 text-left">Type</th>
                        <th className="py-1.5 text-left">Value</th>
                        <th className="py-1.5 text-right">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.observables.map((o, i) => (
                        <tr key={i} className="border-t border-[hsl(var(--ops-border))]">
                          <td className="py-2">
                            <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] uppercase ${obsBadge[o.type]}`}>{o.type}</span>
                          </td>
                          <td className="py-2 font-mono text-[12px] text-[hsl(var(--ops-fg))]">{o.value}</td>
                          <td className="py-2 text-right font-mono text-[11px] text-[hsl(var(--ops-muted-fg))]">{o.risk ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
              {tab === "related" && (
                <div className="space-y-2">
                  {a.related_incident && (
                    <Link to={`/ops/incidents/${a.related_incident}`} className="inline-flex items-center gap-1 text-[12px] text-[hsl(var(--ops-accent))] hover:underline">
                      Incident {a.related_incident} <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {a.related_notable && (
                    <div>
                      <Link to={`/ops/notables/${a.related_notable}`} className="inline-flex items-center gap-1 text-[12px] text-[hsl(var(--ops-accent))] hover:underline">
                        Notable {a.related_notable} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                  {a.related_alerts?.map((rid) => (
                    <div key={rid}>
                      <Link to={`/ops/alerts/${rid}`} className="inline-flex items-center gap-1 text-[12px] text-[hsl(var(--ops-accent))] hover:underline">
                        Alert {rid} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                  {!a.related_incident && !a.related_notable && !a.related_alerts?.length && (
                    <EmptyState title="No related records" hint="No correlations yet." />
                  )}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Affected CIs" bodyClassName="p-0">
            {a.cis.length === 0 ? (
              <div className="p-4"><EmptyState title="No CIs" hint="No assets linked." /></div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--ops-border))]">
                {a.cis.map((ci) => (
                  <li key={ci.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
                    <div>
                      <div className="font-medium text-[hsl(var(--ops-fg))]">{ci.name}</div>
                      <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
                        {ci.type.replace("_", " ")}{ci.environment && ` · ${ci.environment}`}
                      </div>
                    </div>
                    <Link to={`/ops/cmdb/${ci.id}`} className="text-[10px] text-[hsl(var(--ops-accent))] hover:underline">CI</Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quick actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {["Run playbook", "Isolate host", "Block indicator", "Create incident", "Suppress rule (1h)"].map((s) => (
                <button key={s} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1.5 text-left text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)] hover:text-[hsl(var(--ops-accent))]">
                  {s}
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
