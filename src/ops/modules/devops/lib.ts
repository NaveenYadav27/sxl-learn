import type { PipelineStatus, PipelineProvider, DeploymentEnv } from "./types";

export const PIPELINE_TOKEN: Record<PipelineStatus, string> = {
  success: "bg-[hsl(var(--ops-success)/0.15)] text-[hsl(var(--ops-success))] border-[hsl(var(--ops-success)/0.5)]",
  running: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.5)]",
  failed: "bg-[hsl(var(--ops-critical)/0.18)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
  queued: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  canceled: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
};

export const ENV_TOKEN: Record<DeploymentEnv, string> = {
  dev: "bg-[hsl(var(--ops-muted-fg)/0.15)] text-[hsl(var(--ops-muted-fg))] border-[hsl(var(--ops-border))]",
  staging: "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.5)]",
  canary: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
  prod: "bg-[hsl(var(--ops-critical)/0.15)] text-[hsl(var(--ops-critical))] border-[hsl(var(--ops-critical)/0.5)]",
};

export const PROVIDER_LABEL: Record<PipelineProvider, string> = {
  github_actions: "GitHub Actions",
  gitlab_ci: "GitLab CI",
  jenkins: "Jenkins",
  argo_cd: "Argo CD",
  circleci: "CircleCI",
  azure_devops: "Azure DevOps",
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
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
