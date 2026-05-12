import type { ClusterStatus, WorkloadStatus, PodPhase, DockerState } from "./types";

export const CLUSTER_TOKEN: Record<ClusterStatus, string> = {
  healthy: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  degraded: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  down: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  upgrading: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
};

export const WORKLOAD_TOKEN: Record<WorkloadStatus, string> = {
  ready: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  progressing: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  degraded: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  failed: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
};

export const POD_TOKEN: Record<PodPhase, string> = {
  Running: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  Pending: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  Succeeded: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  Failed: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  CrashLoopBackOff: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  ImagePullBackOff: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  Terminating: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
};

export const DOCKER_TOKEN: Record<DockerState, string> = {
  running: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  exited: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  restarting: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  paused: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  dead: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  created: "bg-[hsl(var(--ops-muted-fg)/0.12)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
};

export function pct(used: number, cap: number) {
  return cap === 0 ? 0 : Math.round((used / cap) * 100);
}

export function rel(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}
