import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TERMS_BY_ID, TERM_WHY, termLesson } from "../data/dictionary";
import { useAcademyOptional } from "../engine/useAcademyOptional";

/** Clickable SOC dictionary term (popover). Unknown ids render as plain text. */
export function TermChip({ id, label }: { id: string; label?: string }) {
  const term = TERMS_BY_ID[id];
  const academy = useAcademyOptional();
  if (!term) return <>{label ?? id}</>;
  return (
    <Popover onOpenChange={(o) => { if (o) academy?.viewTerm(id); }}>
      <PopoverTrigger asChild>
        <button type="button" className="inline rounded-sm px-0.5 font-medium text-primary underline decoration-dotted underline-offset-2 hover:bg-primary/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {label ?? term.term}
        </button>
      </PopoverTrigger>
      <PopoverContent className="dark w-80 border-border bg-popover text-popover-foreground text-xs" align="start">
        <div className="space-y-2">
          <div className="font-display text-sm font-semibold">{term.term}</div>
          <p className="leading-relaxed">{term.short}</p>
          <p className="text-muted-foreground leading-relaxed"><span className="font-semibold text-foreground">Example: </span>{term.example}</p>
          {TERM_WHY[id] && <p className="text-muted-foreground leading-relaxed"><span className="font-semibold text-foreground">Why it matters: </span>{TERM_WHY[id]}</p>}
          <div className="flex gap-3 pt-1">
            <Link to={`/ops/academy/dictionary?term=${id}`} className="text-primary hover:underline">Full definition</Link>
            <Link to={`/ops/academy/lesson/${termLesson(id)}?step=lab`} className="text-primary hover:underline">Practice in lab</Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const TOKEN = /(\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\]|\*\*[^*]+\*\*|`[^`]+`)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(TOKEN).filter((p) => p !== "").map((part, i) => {
    if (part.startsWith("[[")) {
      const [id, label] = part.slice(2, -2).split("|");
      return <TermChip key={i} id={id} label={label} />;
    }
    if (part.startsWith("**")) return <strong key={i} className="font-semibold">{renderInline(part.slice(2, -2))}</strong>;
    if (part.startsWith("`")) return <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Text with [[term-id|Label]] dictionary refs, **bold**, `code` and paragraph breaks. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n{2,}/);
  if (paras.length === 1 && !text.includes("\n")) return <span className={className}>{renderInline(text)}</span>;
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {paras.map((p, i) => (
        <p key={i} className="leading-relaxed">
          {p.split("\n").map((line, j, arr) => <Fragment key={j}>{renderInline(line)}{j < arr.length - 1 && <br />}</Fragment>)}
        </p>
      ))}
    </div>
  );
}

/** Strip refs/markdown for plain-text contexts. */
export function plainText(text: string): string {
  return text.replace(/\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([a-z0-9-]+)\]\]/g, (_m, id: string) => TERMS_BY_ID[id]?.term ?? id).replace(/\*\*|`/g, "");
}
