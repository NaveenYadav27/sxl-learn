// Module 3 — Kubernetes Concept Panel
// Renders below the standard LearningBlock for any K8s incident that ships
// a k8s_concept payload. Provides: concept card, beginner/engineer toggle,
// interactive architecture flow with hover defs, interactive tool cards,
// and an expandable "Learn this concept" Q&A.

import { useState } from "react";
import { SectionCard } from "@/ops/components/SectionCard";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { GraduationCap, Network, Wrench, BookOpen, Terminal, ChevronRight } from "lucide-react";
import type { K8sConcept, K8sArchNode, K8sToolCard } from "./m3Incidents";

export function K8sConceptPanel({ concept }: { concept: K8sConcept }) {
  return (
    <div className="flex flex-col gap-3">
      <ConceptCard concept={concept} />
      <AudienceCard beginner={concept.beginner} engineer={concept.engineer} />
      <ArchitectureFlow flow={concept.architecture_flow} failedId={concept.failure_stage_id} />
      <ToolCards tools={concept.tools} />
      <LearnMore items={concept.learn_more} />
    </div>
  );
}

/* -------------------- Concept card -------------------- */
function ConceptCard({ concept }: { concept: K8sConcept }) {
  return (
    <SectionCard bodyClassName="p-0">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-accent)/0.08)] px-4 py-2.5">
        <GraduationCap className="h-4 w-4 text-[hsl(var(--ops-accent))]" />
        <span className="text-[13px] font-semibold text-[hsl(var(--ops-fg))]">Kubernetes Concept · {concept.concept}</span>
      </div>
      <div className="grid gap-3 p-4 text-[12px] leading-relaxed lg:grid-cols-3">
        <Field label="Definition" body={concept.definition} />
        <Field label="Why it exists" body={concept.why_it_exists} />
        <Field label="Enterprise impact" body={concept.enterprise_impact} accent />
      </div>
    </SectionCard>
  );
}

function Field({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div className={[
      "rounded-sm border p-3",
      accent
        ? "border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)]"
        : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]",
    ].join(" ")}>
      <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
        accent ? "text-[hsl(var(--ops-accent))]" : "text-[hsl(var(--ops-muted-fg))]"
      }`}>{label}</div>
      <div className="text-[hsl(var(--ops-fg))]">{body}</div>
    </div>
  );
}

/* -------------------- Beginner vs Engineer toggle -------------------- */
function AudienceCard({ beginner, engineer }: { beginner: string; engineer: string }) {
  const [tab, setTab] = useState<"beginner" | "engineer">("beginner");
  return (
    <SectionCard bodyClassName="p-0">
      <div className="flex items-center gap-1 border-b border-[hsl(var(--ops-border))] px-3 py-1.5 text-[11px]">
        <span className="mr-1 uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Explain like I'm:</span>
        <ToggleBtn active={tab === "beginner"} onClick={() => setTab("beginner")}>Beginner</ToggleBtn>
        <ToggleBtn active={tab === "engineer"} onClick={() => setTab("engineer")}>Engineer</ToggleBtn>
      </div>
      <div className="p-4 text-[12.5px] leading-relaxed text-[hsl(var(--ops-fg))]">
        {tab === "beginner" ? beginner : engineer}
      </div>
    </SectionCard>
  );
}

/* -------------------- Interactive architecture flow -------------------- */
function ArchitectureFlow({ flow, failedId }: { flow: K8sArchNode[]; failedId: string }) {
  const [active, setActive] = useState<string>(failedId);
  const node = flow.find((n) => n.id === active) ?? flow[0];
  return (
    <SectionCard bodyClassName="p-0">
      <div className="flex items-center justify-between border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--ops-fg))]">
          <Network className="h-4 w-4 text-[hsl(var(--ops-accent))]" /> Architecture flow
        </div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">
          Hover any component for its role · highlighted node failed in this incident.
        </div>
      </div>
      <TooltipProvider delayDuration={150}>
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
          {flow.map((n, idx) => {
            const failed = n.id === failedId;
            const selected = n.id === active;
            return (
              <div key={n.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setActive(n.id)}
                      className={[
                        "min-w-[110px] rounded-sm border px-2 py-1.5 text-left text-[11px] transition-colors",
                        selected ? "ring-1 ring-[hsl(var(--ops-accent)/0.7)]" : "",
                        failed
                          ? "border-[hsl(var(--ops-critical)/0.6)] bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] shadow-[0_0_12px_hsl(var(--ops-critical)/0.4)]"
                          : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-fg))] hover:border-[hsl(var(--ops-accent)/0.5)]",
                      ].join(" ")}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{idx + 1}</div>
                      <div className={`font-semibold ${failed ? "" : "text-[hsl(var(--ops-fg))]"}`}>{n.label}</div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] text-[12px]">
                    <div className="font-semibold mb-1">{n.label}</div>
                    <div className="text-[hsl(var(--muted-foreground))]">{n.def}</div>
                  </TooltipContent>
                </Tooltip>
                {idx < flow.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 mx-0.5 text-[hsl(var(--ops-muted-fg))]" />
                )}
              </div>
            );
          })}
        </div>
      </TooltipProvider>
      <div className="border-t border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-4 text-[12px]">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.12)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--ops-accent))]">
            {node.label}
          </span>
          {node.id === failedId && (
            <span className="rounded-sm border border-[hsl(var(--ops-critical)/0.5)] bg-[hsl(var(--ops-critical)/0.15)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[hsl(var(--ops-critical))]">
              Failed in this incident
            </span>
          )}
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <Mini label="Definition" body={node.def} />
          <Mini label="Responsibility" body={node.responsibility} />
          <Mini label="Failure impact" body={node.failure_impact} />
        </div>
        <div className="mt-3 border-t border-[hsl(var(--ops-border))] pt-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Troubleshooting commands</div>
          <div className="flex flex-wrap gap-1">
            {node.commands.map((c) => (
              <code key={c} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] px-1.5 py-0.5 font-mono text-[10.5px] text-[hsl(var(--ops-fg))]">
                {c}
              </code>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function Mini({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">{label}</div>
      <div className="text-[hsl(var(--ops-fg))]">{body}</div>
    </div>
  );
}

/* -------------------- Interactive tool cards -------------------- */
function ToolCards({ tools }: { tools: K8sToolCard[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = tools[activeIdx];
  if (!tools.length) return null;
  return (
    <SectionCard bodyClassName="p-0">
      <div className="flex items-center justify-between border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
        <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--ops-fg))]">
          <Wrench className="h-4 w-4 text-[hsl(var(--ops-accent))]" /> Interactive tool stack · {tools.length} tools
        </div>
        <div className="text-[11px] text-[hsl(var(--ops-muted-fg))]">Pick a tool to see commands, expected output and enterprise usage.</div>
      </div>
      <div className="grid border-t border-[hsl(var(--ops-border))] md:grid-cols-[180px_1fr]">
        <ul className="border-r border-[hsl(var(--ops-border))]">
          {tools.map((t, i) => (
            <li key={t.name}>
              <button
                type="button"
                onClick={() => setActiveIdx(i)}
                className={[
                  "flex w-full items-center gap-2 border-b border-[hsl(var(--ops-border))] px-3 py-2 text-left text-[12px] transition-colors",
                  i === activeIdx
                    ? "bg-[hsl(var(--ops-accent)/0.12)] text-[hsl(var(--ops-accent))]"
                    : "text-[hsl(var(--ops-fg))] hover:bg-[hsl(var(--ops-panel-2))]",
                ].join(" ")}
              >
                <span className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[9.5px] uppercase text-[hsl(var(--ops-muted-fg))]">
                  {t.category}
                </span>
                <span className="font-semibold">{t.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 text-[12px] leading-relaxed">
          <div className="text-[hsl(var(--ops-fg))]">
            <span className="font-semibold">Definition: </span>{active.definition}
          </div>
          <div className="mt-1.5 text-[hsl(var(--ops-muted-fg))]">
            <span className="font-semibold text-[hsl(var(--ops-fg))]">Why engineers use it: </span>{active.why_engineers_use_it}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Mini label="Beginner view" body={active.beginner_view} />
            <Mini label="Advanced view" body={active.advanced_view} />
          </div>

          <div className="mt-3">
            <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
              <Terminal className="h-3 w-3" /> Try these commands
            </div>
            <ul className="space-y-2">
              {active.commands.map((c) => (
                <li key={c.cmd} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] p-2">
                  <div className="flex items-center justify-between gap-2">
                    <code className="overflow-x-auto font-mono text-[11.5px] text-[hsl(var(--ops-fg))]">$ {c.cmd}</code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(c.cmd)}
                      className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 text-[10px] uppercase text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-accent))]"
                    >Copy</button>
                  </div>
                  <pre className="mt-1 overflow-x-auto font-mono text-[10.5px] leading-snug text-[hsl(var(--ops-muted-fg))] whitespace-pre">
{c.expected}
                  </pre>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-sm border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] p-2.5 text-[11.5px]">
            <span className="font-semibold text-[hsl(var(--ops-accent))]">Enterprise usage: </span>
            <span className="text-[hsl(var(--ops-fg))]">{active.enterprise_usage}</span>
          </div>

          {active.related_incidents.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">
              <span className="uppercase tracking-wide">Related incidents:</span>
              {active.related_incidents.map((id) => (
                <span key={id} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-1.5 py-0.5 font-mono text-[10.5px] text-[hsl(var(--ops-fg))]">
                  {id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------- Learn this concept -------------------- */
function LearnMore({ items }: { items: { question: string; answer: string }[] }) {
  if (!items?.length) return null;
  return (
    <SectionCard bodyClassName="p-0">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
        <BookOpen className="h-4 w-4 text-[hsl(var(--ops-accent))]" />
        <span className="text-[13px] font-semibold text-[hsl(var(--ops-fg))]">Learn this concept · {items.length} questions</span>
      </div>
      <Accordion type="multiple" className="px-3">
        {items.map((q, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-b border-[hsl(var(--ops-border))] last:border-b-0">
            <AccordionTrigger className="py-3 text-[12.5px] text-[hsl(var(--ops-fg))] hover:no-underline">
              {q.question}
            </AccordionTrigger>
            <AccordionContent className="text-[12px] leading-relaxed text-[hsl(var(--ops-muted-fg))]">
              {q.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionCard>
  );
}

/* -------------------- shared -------------------- */
function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors",
        active
          ? "border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.18)] text-[hsl(var(--ops-accent))]"
          : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
