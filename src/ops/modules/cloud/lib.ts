import type { CloudProvider, ResourceState, ResourceType } from "./types";

export const PROVIDER_LABEL: Record<CloudProvider, string> = {
  aws: "AWS", azure: "Azure", gcp: "GCP", oci: "Oracle",
};

export const PROVIDER_TOKEN: Record<CloudProvider, string> = {
  aws: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  azure: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.5)]",
  gcp: "bg-[hsl(var(--ops-accent)/0.15)] text-[hsl(var(--ops-accent))] border-[hsl(var(--ops-accent)/0.5)]",
  oci: "bg-[hsl(var(--ops-critical)/0.12)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.4)]",
};

export const STATE_TOKEN: Record<ResourceState, string> = {
  running: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  stopped: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  provisioning: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.5)]",
  error: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  deleted: "bg-[hsl(var(--ops-warning)/0.12)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.4)]",
};

export const TYPE_LABEL: Record<ResourceType, string> = {
  compute: "Compute", storage: "Storage", database: "Database", network: "Network",
  serverless: "Serverless", queue: "Queue", kubernetes: "Kubernetes", cdn: "CDN", secret: "Secrets",
};

export function usd(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export function rel(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (d < 1) return `${Math.round(d * 24)}h ago`;
  if (d < 30) return `${Math.round(d)}d ago`;
  return `${Math.round(d / 30)}mo ago`;
}
