import type { Status, Severity } from "./types";

interface Token {
  label: string;
  className: string; // tailwind classes for badge body
  dot: string;       // bg color for status dot / row stripe
}

export const STATUS_TOKEN: Record<Status, Token> = {
  new:         { label: "New",         className: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",       dot: "bg-[hsl(var(--ops-info))]" },
  assigned:    { label: "Assigned",    className: "bg-[hsl(var(--ops-accent)/0.15)] text-[hsl(var(--ops-accent))] border-[hsl(var(--ops-accent)/0.4)]", dot: "bg-[hsl(var(--ops-accent))]" },
  in_progress: { label: "In Progress", className: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]", dot: "bg-[hsl(var(--ops-warning))]" },
  pending:     { label: "Pending",     className: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",  dot: "bg-[hsl(var(--ops-muted-fg))]" },
  resolved:    { label: "Resolved",    className: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.4)]", dot: "bg-[hsl(var(--ops-success))]" },
  closed:      { label: "Closed",      className: "bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",        dot: "bg-[hsl(var(--ops-muted-fg))]" },
};

export const SEVERITY_TOKEN: Record<Severity, Token> = {
  critical: { label: "Critical", className: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]", dot: "bg-[hsl(var(--ops-critical))]" },
  high:     { label: "High",     className: "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",             dot: "bg-[hsl(var(--ops-high))]" },
  medium:   { label: "Medium",   className: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",   dot: "bg-[hsl(var(--ops-warning))]" },
  low:      { label: "Low",      className: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",             dot: "bg-[hsl(var(--ops-info))]" },
  info:     { label: "Info",     className: "bg-[hsl(var(--ops-muted-fg)/0.12)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",       dot: "bg-[hsl(var(--ops-muted-fg))]" },
};
