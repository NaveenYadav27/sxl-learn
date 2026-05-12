import type { ServiceHealth, SloStatus, MonitorState, ServiceTier } from "./types";

export const HEALTH_TOKEN: Record<ServiceHealth, string> = {
  healthy: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  degraded: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  down: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  maintenance: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

export const HEALTH_DOT: Record<ServiceHealth, string> = {
  healthy: "bg-[hsl(var(--ops-success))]",
  degraded: "bg-[hsl(var(--ops-warning))]",
  down: "bg-[hsl(var(--ops-critical))]",
  maintenance: "bg-[hsl(var(--ops-info))]",
};

export const TIER_TOKEN: Record<ServiceTier, string> = {
  tier_1: "bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.4)]",
  tier_2: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
  tier_3: "bg-[hsl(var(--ops-info)/0.12)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

export const SLO_TOKEN: Record<SloStatus, string> = {
  healthy: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  at_risk: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  burning: "bg-[hsl(var(--ops-high)/0.18)] text-[hsl(var(--ops-high))] border-[hsl(var(--ops-high)/0.5)]",
  breached: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
};

export const MONITOR_TOKEN: Record<MonitorState, string> = {
  alerting: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  pending: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  ok: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  no_data: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  silenced: "bg-[hsl(var(--ops-info)/0.12)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

export function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

export function dur(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d`;
}
