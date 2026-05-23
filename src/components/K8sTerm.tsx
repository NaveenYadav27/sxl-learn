/**
 * K8sTerm — hover-glossary trigger.
 *
 * Wrap any K8s term (Pod, kubelet, Service, etc.) with this component to surface
 * a rich popover: simple + technical definition, real-world analogy,
 * Linux vs Windows specifics, SOC relevance, related commands, and common
 * failure modes.
 *
 * Usage:
 *   <K8sTerm term="kubelet">kubelet</K8sTerm>
 *   <K8sTerm term="pod" /> // renders the canonical display name
 */
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { lookupK8sTerm } from "@/lib/k8sGlossary";
import {
  Boxes, Network, Server, Cpu, Database, Shield, Terminal as TerminalIcon, HardDrive,
  BookOpen, Lightbulb, Bug, ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";

const CAT_ICON: Record<string, ReactNode> = {
  "control-plane": <Server className="h-3.5 w-3.5" />,
  node: <Cpu className="h-3.5 w-3.5" />,
  workload: <Boxes className="h-3.5 w-3.5" />,
  networking: <Network className="h-3.5 w-3.5" />,
  storage: <HardDrive className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
  cli: <TerminalIcon className="h-3.5 w-3.5" />,
  runtime: <Database className="h-3.5 w-3.5" />,
};

export function K8sTerm({
  term,
  children,
  className = "",
}: {
  term: string;
  children?: ReactNode;
  className?: string;
}) {
  const entry = lookupK8sTerm(term);
  // Unknown term — render children verbatim, no popover noise.
  if (!entry) return <>{children ?? term}</>;

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={[
            "inline-flex items-center gap-0.5 align-baseline",
            "border-b border-dotted border-[hsl(var(--ops-accent)/0.6)]",
            "text-[hsl(var(--ops-accent))] hover:text-[hsl(var(--ops-accent))]",
            "decoration-dotted cursor-help font-medium",
            className,
          ].join(" ")}
        >
          {children ?? entry.term}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-[420px] max-w-[92vw] p-0 border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] text-[hsl(var(--ops-fg))] shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-accent)/0.08)] px-3 py-2">
          <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
            <span className="text-[hsl(var(--ops-accent))]">
              {CAT_ICON[entry.category] ?? <BookOpen className="h-3.5 w-3.5" />}
            </span>
            {entry.term}
          </div>
          <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
            {entry.category}
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-3 py-2.5 text-[11.5px] leading-relaxed">
          {/* Simple */}
          <Block icon={<Lightbulb className="h-3 w-3" />} label="In plain English">
            {entry.simple}
          </Block>

          {/* Technical */}
          <Block icon={<BookOpen className="h-3 w-3" />} label="Engineer view">
            {entry.technical}
          </Block>

          {/* Analogy */}
          {entry.analogy && (
            <Block icon={<Lightbulb className="h-3 w-3" />} label="Analogy" muted>
              <em>{entry.analogy}</em>
            </Block>
          )}

          {/* Linux vs Windows */}
          {(entry.linux || entry.windows) && (
            <div className="mb-2 grid gap-1.5 sm:grid-cols-2">
              {entry.linux && (
                <OsCard os="Linux" body={entry.linux} tone="azure" />
              )}
              {entry.windows && (
                <OsCard os="Windows" body={entry.windows} tone="violet" />
              )}
            </div>
          )}

          {/* SOC relevance */}
          {entry.soc && (
            <Block icon={<ShieldAlert className="h-3 w-3" />} label="SOC relevance" tone="warning">
              {entry.soc}
            </Block>
          )}

          {/* Commands */}
          {entry.commands && entry.commands.length > 0 && (
            <div className="mb-2">
              <Label icon={<TerminalIcon className="h-3 w-3" />}>Related commands</Label>
              <div className="flex flex-wrap gap-1">
                {entry.commands.map((c) => (
                  <code
                    key={c}
                    className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] px-1.5 py-0.5 font-mono text-[10.5px] text-[hsl(var(--ops-fg))]"
                  >
                    {c}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Failures */}
          {entry.failures && entry.failures.length > 0 && (
            <div>
              <Label icon={<Bug className="h-3 w-3" />}>Common failures</Label>
              <ul className="ml-3 list-disc text-[hsl(var(--ops-muted-fg))]">
                {entry.failures.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function Block({
  icon, label, children, tone, muted,
}: {
  icon: ReactNode; label: string; children: ReactNode;
  tone?: "warning"; muted?: boolean;
}) {
  return (
    <div className={`mb-2 ${tone === "warning" ? "rounded-sm border border-[hsl(var(--ops-warning)/0.4)] bg-[hsl(var(--ops-warning)/0.08)] p-2" : ""}`}>
      <Label icon={icon} tone={tone}>{label}</Label>
      <div className={muted ? "text-[hsl(var(--ops-muted-fg))]" : "text-[hsl(var(--ops-fg))]"}>
        {children}
      </div>
    </div>
  );
}

function Label({ icon, children, tone }: { icon: ReactNode; children: ReactNode; tone?: "warning" }) {
  return (
    <div className={`mb-0.5 inline-flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider ${
      tone === "warning" ? "text-[hsl(var(--ops-warning))]" : "text-[hsl(var(--ops-muted-fg))]"
    }`}>
      {icon}{children}
    </div>
  );
}

function OsCard({ os, body, tone }: { os: string; body: string; tone: "azure" | "violet" }) {
  const color = tone === "azure"
    ? "border-[hsl(210_70%_55%/0.4)] bg-[hsl(210_70%_55%/0.08)] text-[hsl(210_70%_70%)]"
    : "border-[hsl(265_60%_60%/0.4)] bg-[hsl(265_60%_60%/0.08)] text-[hsl(265_70%_75%)]";
  return (
    <div className={`rounded-sm border p-2 ${color}`}>
      <div className="mb-0.5 text-[9.5px] font-semibold uppercase tracking-wider opacity-80">{os}</div>
      <div className="text-[hsl(var(--ops-fg))]">{body}</div>
    </div>
  );
}

export default K8sTerm;
