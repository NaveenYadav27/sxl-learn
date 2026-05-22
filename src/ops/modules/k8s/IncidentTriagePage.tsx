import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { findK8sIncident, K8S_PHASES, type K8sIncidentSeverity } from "./incidentsData";
import { TOOL_CATALOG } from "./toolStack";
import { getIncidentLab } from "./incidentLabs";
import { EmptyState } from "@/ops/components/EmptyState";
import { toast } from "@/hooks/use-toast";
import { ShieldAlert, ExternalLink, CheckCircle2, Circle, Copy, PlayCircle, ArrowLeft } from "lucide-react";

const SEV_TOKEN: Record<K8sIncidentSeverity, string> = {
  critical: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  high:     "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  medium:   "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  low:      "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

export default function IncidentTriagePage() {
  const { id = "" } = useParams();
  const n = findK8sIncident(id);
  const [doneSteps, setDoneSteps] = useState<Record<string, boolean>>({});
  const toggleStep = (k: string) => setDoneSteps((s) => ({ ...s, [k]: !s[k] }));
  const copyCmd = (c: string) => {
    navigator.clipboard?.writeText(c);
    toast({ title: "Copied", description: c });
  };
  const phaseIdx = useMemo(() => K8S_PHASES.findIndex((p) => p.id === n?.current_phase), [n]);
  const lab = n ? getIncidentLab(n.id) : undefined;

  if (!n) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ops-bg))] p-6 text-[hsl(var(--ops-fg))]">
        <EmptyState title="Incident not found" hint={`No record matches ${id}.`} />
      </div>
    );
  }

  const detailUrl = `/ops/k8s-incidents/${n.id}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--ops-bg))] text-[hsl(var(--ops-fg))]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-5 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[hsl(var(--ops-warning))]" />
          <div>
            <div className="text-[13px] font-semibold">Full Triage · {n.id}</div>
            <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{n.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={detailUrl}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Incident
          </Link>
          {n.lab_slug && (
            <Link
              to={`/lab/${n.lab_slug}/sim`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))]"
            >
              <ExternalLink className="h-3 w-3" /> Open simulator
            </Link>
          )}
          <button
            onClick={() => window.close()}
            className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"
          >
            Close
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-5 text-[12px]">
        {/* Summary strip */}
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Failure chain</div>
            <div className="mt-0.5 font-semibold">{n.failure_chain}</div>
          </div>
          <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Current phase</div>
            <div className="mt-0.5 font-semibold">{K8S_PHASES[phaseIdx]?.label ?? "—"}</div>
          </div>
          <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Affected</div>
            <div className="mt-0.5 font-semibold">{n.affected.length} asset{n.affected.length === 1 ? "" : "s"}</div>
          </div>
        </div>

        {/* Triage checklist */}
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
            Triage checklist · {Object.values(doneSteps).filter(Boolean).length}/{n.next_steps.length} done
          </div>
          <ul className="space-y-1.5">
            {n.next_steps.map((s, i) => {
              const k = `step-${i}`;
              const done = !!doneSteps[k];
              return (
                <li key={k}>
                  <button
                    onClick={() => toggleStep(k)}
                    className={[
                      "flex w-full items-start gap-2 rounded-sm border px-2.5 py-2 text-left transition-colors",
                      done
                        ? "border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.10)]"
                        : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] hover:border-[hsl(var(--ops-accent)/0.5)]",
                    ].join(" ")}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--ops-success))]" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 text-[hsl(var(--ops-muted-fg))]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--ops-muted-fg))]">{s.level}</span>
                        <span className={done ? "line-through text-[hsl(var(--ops-muted-fg))]" : "text-[hsl(var(--ops-fg))]"}>{s.text}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick commands */}
        {n.aligned_tools.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Quick triage commands</div>
            <ul className="space-y-1">
              {n.aligned_tools.flatMap((t) => {
                const d = TOOL_CATALOG[t];
                if (!d) return [];
                return d.commands.slice(0, 2).map((c) => (
                  <li key={`${t}-${c}`} className="flex items-center justify-between gap-2 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 py-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ops-accent))]">{d.tool}</span>
                      <code className="truncate font-mono text-[11px] text-[hsl(var(--ops-fg))]">{c}</code>
                    </div>
                    <button
                      onClick={() => copyCmd(c)}
                      className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-1.5 py-0.5 text-[10px] uppercase text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-accent))]"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </li>
                ));
              })}
            </ul>
          </div>
        )}

        {/* Affected assets */}
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Affected assets</div>
          <ul className="space-y-1">
            {n.affected.map((a) => (
              <li key={a.kind + a.name} className="flex items-start justify-between gap-2 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-2">
                <div>
                  <div className="font-mono text-[hsl(var(--ops-fg))]">{a.name}</div>
                  <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">{a.kind} · {a.detail}</div>
                  <div className="mt-0.5 text-[11px] text-[hsl(var(--ops-fg))]">→ {a.action}</div>
                </div>
                <span className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TOKEN[a.severity]}`}>{a.severity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(var(--ops-border))] pt-3">
          {lab && (
            <Link
              to={`${detailUrl}#incident-lab-console`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-3 py-1.5 text-[12px] text-[hsl(var(--ops-success))]"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Jump to interactive lab
            </Link>
          )}
          <button
            onClick={() => toast({ title: "Triage acknowledged", description: `${n.id} marked as actively triaged.` })}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-warning)/0.5)] bg-[hsl(var(--ops-warning)/0.15)] px-3 py-1.5 text-[12px] text-[hsl(var(--ops-warning))]"
          >
            Acknowledge & start
          </button>
        </div>
      </main>
    </div>
  );
}
