import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";
import { OpsTabs } from "@/ops/components/OpsTabs";
import { ActivityTimeline, type ActivityEvent } from "@/ops/components/ActivityTimeline";
import { EmptyState } from "@/ops/components/EmptyState";
import { AssigneeChip } from "@/ops/components/AssigneeChip";
import { findNotable } from "./notablesData";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { NotableUrgency } from "./types";

const URGENCY_TOKEN: Record<NotableUrgency, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high: "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  informational: "bg-[hsl(var(--ops-muted-fg)/0.12)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
};

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

export default function NotableDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const n = findNotable(id);
  const [tab, setTab] = useState<"spl" | "raw" | "activity">("spl");

  const timeline = useMemo<ActivityEvent[]>(() => {
    if (!n) return [];
    return [...n.history]
      .sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
      .map((e) => ({
        id: e.id,
        at: rel(e.at),
        actor: e.actor,
        intent: eventIntent[e.kind] ?? "default",
        title: e.summary,
        detail: e.detail,
      }));
  }, [n]);

  if (!n) {
    return (
      <div className="p-6">
        <EmptyState
          title="Notable not found"
          hint={`No record matches ${id}.`}
          action={
            <Link to="/ops/notables" className="text-[hsl(var(--ops-accent))] text-[12px] hover:underline">
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
        title={`${n.id} · ${n.title}`}
        breadcrumb={
          <span className="inline-flex items-center gap-1">
            <Link to="/ops" className="hover:text-[hsl(var(--ops-fg))]">Operate</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/ops/notables" className="hover:text-[hsl(var(--ops-fg))]">Notables</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{n.id}</span>
          </span>
        }
        actions={
          <>
            <button onClick={() => navigate("/ops/notables")} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]">
              Take ownership
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-success))]">
              Resolve
            </button>
          </>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <SectionCard title="Notable details">
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <Field label="Urgency">
                <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${URGENCY_TOKEN[n.urgency]}`}>
                  {n.urgency}
                </span>
              </Field>
              <Field label="Status"><span className="capitalize text-[13px]">{n.status.replace("_", " ")}</span></Field>
              <Field label="Owner"><AssigneeChip assignee={n.owner} /></Field>
              <Field label="Index"><span className="font-mono text-[13px]">{n.index}</span></Field>
              <Field label="Sourcetype"><span className="font-mono text-[12px] text-[hsl(var(--ops-muted-fg))]">{n.sourcetype}</span></Field>
              <Field label="Events rolled up"><span className="font-mono text-[13px]">{n.count}</span></Field>
              <Field label="Source"><span className="font-mono text-[13px]">{n.src ?? "—"}</span></Field>
              <Field label="Destination"><span className="font-mono text-[13px]">{n.dest ?? "—"}</span></Field>
              <Field label="User"><span className="font-mono text-[13px]">{n.user ?? "—"}</span></Field>
              <Field label="Signature"><span className="font-mono text-[12px]">{n.signature ?? "—"}</span></Field>
              <Field label="First seen"><span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(n.first_event_at)}</span></Field>
              <Field label="Last seen"><span className="text-[12px] text-[hsl(var(--ops-muted-fg))]">{rel(n.last_event_at)}</span></Field>
            </div>
            <div className="border-t border-[hsl(var(--ops-border))] p-4">
              <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Description</div>
              <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--ops-fg))]">{n.description}</p>
            </div>
          </SectionCard>

          <SectionCard bodyClassName="p-0">
            <OpsTabs
              active={tab}
              onChange={(k) => setTab(k as typeof tab)}
              tabs={[
                { key: "spl", label: "Correlation SPL" },
                { key: "raw", label: "Raw event" },
                { key: "activity", label: "Activity", count: n.history.length },
              ]}
            />
            <div className="p-4">
              {tab === "spl" && (
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Correlation search</div>
                    <pre className="mt-1 overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre">
{n.spl}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Drilldown</div>
                    <pre className="mt-1 overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre">
{n.drilldown_spl}
                    </pre>
                  </div>
                </div>
              )}
              {tab === "raw" && (
                <pre className="overflow-x-auto rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-3 font-mono text-[11px] leading-relaxed text-[hsl(var(--ops-fg))] whitespace-pre-wrap break-words">
{n.raw_sample}
                </pre>
              )}
              {tab === "activity" && <ActivityTimeline events={timeline} />}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <SectionCard title="Related alerts" bodyClassName="p-0">
            {!n.related_alerts?.length ? (
              <div className="p-4"><EmptyState title="No alerts linked" hint="No alerts mapped yet." /></div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--ops-border))]">
                {n.related_alerts.map((a) => (
                  <li key={a} className="px-3 py-2 text-[12px]">
                    <Link to={`/ops/alerts/${a}`} className="inline-flex items-center gap-1 text-[hsl(var(--ops-accent))] hover:underline">
                      {a} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Quick actions" bodyClassName="p-3">
            <div className="grid gap-1.5">
              {["Open in Splunk ES", "Adjust correlation rule", "Suppress 1h", "Promote to incident", "Add to investigation"].map((s) => (
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
