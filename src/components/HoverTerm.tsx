// Hover-popover that shows a quick tooltip + an expanded definition panel.
// Used in Module 1 & 2 (Docker) theory + lab pages.

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { findHoverTerm, type HoverTerm } from "@/lib/dockerHoverTerms";
import { findGlossaryTerm } from "@/lib/techGlossary";
import { Info, AlertTriangle, ShieldCheck, Building2 } from "lucide-react";

interface Props {
  /** Lookup key in DOCKER_HOVER_TERMS (e.g. "namespace", "cgroup", "FROM"). */
  termKey: string;
  /** Visible label — defaults to the term name. */
  children?: React.ReactNode;
  /** Render as inline chip instead of underline span. */
  asChip?: boolean;
}

export function HoverTerm({ termKey, children, asChip }: Props) {
  const t: HoverTerm | undefined = findHoverTerm(termKey);
  const label = children ?? t?.term ?? termKey;

  if (!t) {
    return <span className="font-medium text-foreground/90">{label}</span>;
  }

  const trigger = asChip ? (
    <Badge
      variant="outline"
      className="cursor-help border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
    >
      {label}
    </Badge>
  ) : (
    <span className="cursor-help font-medium text-primary underline decoration-dotted decoration-primary/50 underline-offset-2">
      {label}
    </span>
  );

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        className="w-80 p-0 overflow-hidden border-border shadow-portal"
        align="start"
      >
        {/* Quick row */}
        <div className="px-3 py-2 bg-primary/10 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
            Quick definition
          </div>
          <div className="text-sm font-semibold text-foreground mt-0.5">{t.term}</div>
          <p className="text-xs text-foreground/85 mt-1">{t.quick}</p>
        </div>

        {/* Expanded */}
        <div className="px-3 py-2 space-y-2.5 max-h-[320px] overflow-y-auto">
          {t.definition && (
            <Row icon={Info} label="Definition" body={t.definition} />
          )}
          {t.bullets?.map((b, i) => (
            <div key={i} className="text-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                {b.label}
              </div>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-1.5 items-center text-foreground/80">
                    <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {t.production && (
            <Row icon={Building2} label="Production relevance" body={t.production} tone="primary" />
          )}
          {t.security && (
            <Row icon={ShieldCheck} label="Security impact" body={t.security} tone="success" />
          )}
          {t.commonIssue && (
            <Row icon={AlertTriangle} label="Common issue" body={t.commonIssue} tone="warning" />
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function Row({
  icon: Icon,
  label,
  body,
  tone,
}: {
  icon: any;
  label: string;
  body: string;
  tone?: "primary" | "warning" | "success";
}) {
  const toneCls =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : tone === "primary"
          ? "text-primary"
          : "text-foreground/70";
  return (
    <div className="flex gap-2 text-xs">
      <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${toneCls}`} />
      <div>
        <div className={`text-[10px] font-semibold uppercase tracking-wide ${toneCls}`}>{label}</div>
        <p className="text-foreground/85 leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export default HoverTerm;
