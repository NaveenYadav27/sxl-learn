export type PipelineProvider = "github_actions" | "gitlab_ci" | "jenkins" | "argo_cd" | "circleci" | "azure_devops";
export type PipelineStatus = "success" | "running" | "failed" | "queued" | "canceled";
export type DeploymentEnv = "dev" | "staging" | "prod" | "canary";
export type DeploymentStrategy = "rolling" | "blue_green" | "canary" | "recreate";

export interface Pipeline {
  id: string;
  name: string;
  provider: PipelineProvider;
  repo: string;
  branch: string;
  status: PipelineStatus;
  last_run_at: string;
  duration_s: number;
  triggered_by: string;
  commit_sha: string;
  commit_message: string;
  success_rate_7d: number; // 0-100
  runs_7d: number;
}

export interface Build {
  id: string;
  pipeline_id: string;
  number: number;
  status: PipelineStatus;
  started_at: string;
  duration_s: number;
  commit_sha: string;
  branch: string;
  artifacts: number;
}

export interface Deployment {
  id: string;
  service: string;
  env: DeploymentEnv;
  version: string;
  status: PipelineStatus;
  strategy: DeploymentStrategy;
  deployed_at: string;
  deployed_by: string;
  duration_s: number;
  cluster?: string;
  rollback_available: boolean;
  related_change?: string; // CHG-XXXX
}

export interface Repository {
  id: string;
  name: string;
  org: string;
  language: string;
  default_branch: string;
  open_prs: number;
  open_issues: number;
  last_commit_at: string;
  contributors: number;
  loc: number;
  visibility: "public" | "private" | "internal";
}
