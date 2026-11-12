import { ArrowRight, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ConceptBlock } from "../types";
import { RichText } from "./RichText";

const TONE: Record<string, string> = {
  info: "border-primary/40 bg-primary/10",
  tip: "border-success/40 bg-success/10",
  warn: "border-warning/50 bg-warning/10",
};
const TL_TONE: Record<string, string> = {
  info: "bg-primary", warn: "bg-warning", danger: "bg-destructive", ok: "bg-success",
};

function Title({ text }: { text?: string }) {
  return text ? <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{text}</div> : null;
}

export function ConceptBlockView({ block }: { block: ConceptBlock }) {
  switch (block.kind) {
    case "p":
      return <RichText text={block.text} className="text-sm leading-relaxed text-foreground/90" />;
    case "heading":
      return <h3 className="pt-2 font-display text-lg font-semibold tracking-wide">{block.text}</h3>;
    case "flow":
      return (
        <div className="rounded-lg border border-border bg-card p-4">
          <Title text={block.title} />
          <div className="flex flex-wrap items-stretch gap-2">
            {block.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="min-w-[110px] max-w-[220px] rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs">
                  <div className="mb-0.5 font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</div>
                  <RichText text={s} />
                </div>
                {i < block.steps.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      );
    case "grid":
      return (
        <div>
          <Title text={block.title} />
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {block.items.map((it, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-semibold"><RichText text={it.title} /></div>
                <div className="mt-1 text-xs text-muted-foreground"><RichText text={it.text} /></div>
              </div>
            ))}
          </div>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          {block.title && <div className="border-b border-border px-3 py-2"><Title text={block.title} /></div>}
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-muted-foreground"><tr>{block.cols.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-border align-top">
                  {r.map((c, j) => <td key={j} className={`px-3 py-2 ${j === 0 ? "font-medium" : ""}`}><RichText text={c} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const Icon = block.tone === "warn" ? TriangleAlert : block.tone === "tip" ? Lightbulb : Info;
      return (
        <div className={`flex gap-3 rounded-lg border p-3 ${TONE[block.tone]}`}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm"><div className="font-semibold">{block.title}</div><RichText text={block.text} className="text-foreground/90" /></div>
        </div>
      );
    }
    case "layers":
      return (
        <div className="rounded-lg border border-border bg-card p-4">
          <Title text={block.title} />
          <div className="space-y-2">
            {block.lanes.map((l, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[150px_1fr]">
                <div className="rounded-md bg-muted px-3 py-2 text-xs font-semibold">{l.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {l.items.map((it, j) => <span key={j} className="rounded-md border border-border bg-background px-2 py-1 text-xs"><RichText text={it} /></span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "code":
      return (
        <div className="rounded-lg border border-border bg-card">
          {block.title && <div className="border-b border-border px-3 py-2 text-xs font-semibold">{block.title}</div>}
          <pre className="overflow-x-auto p-3 font-mono text-xs text-foreground/90">{block.code}</pre>
          {block.explain && (
            <ul className="space-y-1 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {block.explain.map((e, i) => <li key={i} className="list-disc ml-3"><RichText text={e} /></li>)}
            </ul>
          )}
        </div>
      );
    case "funnel":
      return (
        <div className="rounded-lg border border-border bg-card p-4">
          <Title text={block.title} />
          <div className="space-y-1.5">
            {block.stages.map((s, i) => {
              const w = 100 - (i * 60) / Math.max(1, block.stages.length - 1);
              return (
                <div key={i} className="mx-auto flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs" style={{ width: `${w}%` }}>
                  <span className="font-semibold">{s.label}</span>
                  <span className="font-mono text-primary">{s.value}</span>
                  {s.note && <span className="hidden text-muted-foreground md:inline">{s.note}</span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className="rounded-lg border border-border bg-card p-4">
          <Title text={block.title} />
          <ol className="relative ml-2 space-y-3 border-l border-border pl-4">
            {block.items.map((it, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${TL_TONE[it.tone ?? "info"]}`} />
                <div className="font-mono text-[11px] text-muted-foreground">{it.time}</div>
                <div className="text-xs"><RichText text={it.label} /></div>
              </li>
            ))}
          </ol>
        </div>
      );
    case "compare":
      return (
        <div>
          <Title text={block.title} />
          <div className="grid gap-2 md:grid-cols-2">
            {[block.left, block.right].map((side, i) => (
              <div key={i} className={`rounded-lg border p-3 ${i === 0 ? "border-border bg-card" : "border-primary/40 bg-primary/10"}`}>
                <div className="mb-1.5 text-sm font-semibold">{side.title}</div>
                <ul className="space-y-1 text-xs">{side.points.map((p, j) => <li key={j} className="ml-3 list-disc"><RichText text={p} /></li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      );
    case "stats":
      return (
        <div>
          <Title text={block.title} />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {block.items.map((it, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.label}</div>
                <div className="mt-1 font-display text-2xl font-bold text-primary">{it.value}</div>
                {it.note && <div className="text-[11px] text-muted-foreground">{it.note}</div>}
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export function ConceptBlocks({ blocks }: { blocks: ConceptBlock[] }) {
  return <div className="space-y-4">{blocks.map((b, i) => <ConceptBlockView key={i} block={b} />)}</div>;
}
