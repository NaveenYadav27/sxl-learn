import type { Pipeline, Build, Deployment, Repository } from "./types";

const now = Date.now();
const mins = (n: number) => new Date(now - n * 60_000).toISOString();
const hrs = (n: number) => new Date(now - n * 3_600_000).toISOString();
const days = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const PIPELINES: Pipeline[] = [
  { id: "PL-1001", name: "checkout-api / build-and-deploy", provider: "github_actions", repo: "acme/checkout-api", branch: "main", status: "success", last_run_at: mins(12), duration_s: 312, triggered_by: "merge:m.singh", commit_sha: "a3f91c2", commit_message: "feat(payments): add idempotency key to charge endpoint", success_rate_7d: 96, runs_7d: 48 },
  { id: "PL-1002", name: "auth-service / ci", provider: "github_actions", repo: "acme/auth-service", branch: "main", status: "failed", last_run_at: mins(34), duration_s: 187, triggered_by: "push:k.tanaka", commit_sha: "9e2c411", commit_message: "refactor(jwt): rotate signing keys via vault", success_rate_7d: 71, runs_7d: 36 },
  { id: "PL-1003", name: "search-svc / pipeline", provider: "gitlab_ci", repo: "acme/search-svc", branch: "release/2.4", status: "running", last_run_at: mins(3), duration_s: 154, triggered_by: "schedule", commit_sha: "1a9c802", commit_message: "chore(deps): bump opensearch client to 2.11", success_rate_7d: 88, runs_7d: 22 },
  { id: "PL-1004", name: "edge-router / argo-sync", provider: "argo_cd", repo: "acme/edge-router", branch: "main", status: "success", last_run_at: mins(48), duration_s: 92, triggered_by: "argo:auto-sync", commit_sha: "bb70f1a", commit_message: "deploy(prod): edge-router v3.12.4", success_rate_7d: 100, runs_7d: 14 },
  { id: "PL-1005", name: "billing-jobs / nightly", provider: "jenkins", repo: "acme/billing-jobs", branch: "main", status: "success", last_run_at: hrs(7), duration_s: 1840, triggered_by: "cron", commit_sha: "ce4419f", commit_message: "fix(report): correct EU VAT rounding", success_rate_7d: 94, runs_7d: 7 },
  { id: "PL-1006", name: "frontend-web / preview", provider: "circleci", repo: "acme/frontend-web", branch: "feat/checkout-ux", status: "queued", last_run_at: mins(1), duration_s: 0, triggered_by: "pr:#4821", commit_sha: "77ad99c", commit_message: "feat(checkout): inline 3DS2 flow", success_rate_7d: 82, runs_7d: 64 },
  { id: "PL-1007", name: "data-platform / dbt-run", provider: "azure_devops", repo: "acme/data-platform", branch: "main", status: "success", last_run_at: hrs(2), duration_s: 612, triggered_by: "schedule", commit_sha: "5d2e7a1", commit_message: "models(orders): add cohort retention table", success_rate_7d: 98, runs_7d: 21 },
  { id: "PL-1008", name: "infra-tf / terraform-apply", provider: "github_actions", repo: "acme/infra-tf", branch: "main", status: "failed", last_run_at: hrs(4), duration_s: 248, triggered_by: "push:s.lee", commit_sha: "0f8c2bd", commit_message: "infra(eks): scale prod-blue node group to 24", success_rate_7d: 80, runs_7d: 10 },
  { id: "PL-1009", name: "notifications-svc / build", provider: "github_actions", repo: "acme/notifications-svc", branch: "main", status: "canceled", last_run_at: hrs(9), duration_s: 41, triggered_by: "manual:m.singh", commit_sha: "a112cc3", commit_message: "wip: kafka consumer migration", success_rate_7d: 90, runs_7d: 18 },
  { id: "PL-1010", name: "ml-recommender / train", provider: "gitlab_ci", repo: "acme/ml-recommender", branch: "main", status: "success", last_run_at: hrs(11), duration_s: 4380, triggered_by: "schedule", commit_sha: "deadbe7", commit_message: "model: weekly retrain on 2025-W19 data", success_rate_7d: 100, runs_7d: 4 },
];

export const BUILDS: Build[] = PIPELINES.flatMap((p, idx) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `BLD-${1000 + idx * 10 + i}`,
    pipeline_id: p.id,
    number: 200 - i,
    status: i === 0 ? p.status : (["success", "success", "failed", "success", "canceled"][i] as Pipeline["status"]),
    started_at: mins(10 + i * 47 + idx * 3),
    duration_s: 90 + ((i + idx) % 7) * 60,
    commit_sha: p.commit_sha.slice(0, 7),
    branch: p.branch,
    artifacts: (i + idx) % 5,
  })),
);

export const DEPLOYMENTS: Deployment[] = [
  { id: "DEP-9001", service: "checkout-api", env: "prod", version: "v4.18.2", status: "success", strategy: "blue_green", deployed_at: mins(14), deployed_by: "argo:auto-sync", duration_s: 184, cluster: "prod-eks-blue", rollback_available: true, related_change: "CHG-0007" },
  { id: "DEP-9002", service: "checkout-api", env: "staging", version: "v4.18.3-rc1", status: "running", strategy: "rolling", deployed_at: mins(2), deployed_by: "m.singh", duration_s: 88, cluster: "stg-eks", rollback_available: true },
  { id: "DEP-9003", service: "auth-service", env: "prod", version: "v2.9.1", status: "failed", strategy: "canary", deployed_at: mins(38), deployed_by: "k.tanaka", duration_s: 121, cluster: "prod-eks-blue", rollback_available: true, related_change: "CHG-0011" },
  { id: "DEP-9004", service: "edge-router", env: "prod", version: "v3.12.4", status: "success", strategy: "rolling", deployed_at: mins(48), deployed_by: "argo:auto-sync", duration_s: 92, cluster: "prod-eks-green", rollback_available: true },
  { id: "DEP-9005", service: "search-svc", env: "canary", version: "v2.4.0-canary.3", status: "running", strategy: "canary", deployed_at: mins(3), deployed_by: "j.okafor", duration_s: 31, cluster: "prod-eks-blue", rollback_available: true },
  { id: "DEP-9006", service: "frontend-web", env: "prod", version: "2026.05.11-1", status: "success", strategy: "blue_green", deployed_at: hrs(2), deployed_by: "ci-bot", duration_s: 220, rollback_available: true },
  { id: "DEP-9007", service: "billing-jobs", env: "prod", version: "v1.7.0", status: "success", strategy: "recreate", deployed_at: hrs(7), deployed_by: "cron", duration_s: 1840, cluster: "prod-eks-blue", rollback_available: false },
  { id: "DEP-9008", service: "notifications-svc", env: "dev", version: "v0.9.0-dev", status: "canceled", strategy: "rolling", deployed_at: hrs(9), deployed_by: "m.singh", duration_s: 41, cluster: "dev-eks", rollback_available: false },
];

export const REPOSITORIES: Repository[] = [
  { id: "RP-001", name: "checkout-api", org: "acme", language: "Go", default_branch: "main", open_prs: 7, open_issues: 23, last_commit_at: mins(12), contributors: 18, loc: 84210, visibility: "private" },
  { id: "RP-002", name: "auth-service", org: "acme", language: "TypeScript", default_branch: "main", open_prs: 4, open_issues: 11, last_commit_at: mins(34), contributors: 12, loc: 47120, visibility: "private" },
  { id: "RP-003", name: "search-svc", org: "acme", language: "Rust", default_branch: "main", open_prs: 2, open_issues: 6, last_commit_at: hrs(1), contributors: 9, loc: 32811, visibility: "private" },
  { id: "RP-004", name: "edge-router", org: "acme", language: "Go", default_branch: "main", open_prs: 1, open_issues: 4, last_commit_at: hrs(3), contributors: 7, loc: 21044, visibility: "internal" },
  { id: "RP-005", name: "billing-jobs", org: "acme", language: "Python", default_branch: "main", open_prs: 6, open_issues: 19, last_commit_at: hrs(8), contributors: 14, loc: 56720, visibility: "private" },
  { id: "RP-006", name: "frontend-web", org: "acme", language: "TypeScript", default_branch: "main", open_prs: 12, open_issues: 41, last_commit_at: mins(22), contributors: 26, loc: 184910, visibility: "private" },
  { id: "RP-007", name: "data-platform", org: "acme", language: "Python", default_branch: "main", open_prs: 3, open_issues: 9, last_commit_at: hrs(2), contributors: 11, loc: 92140, visibility: "internal" },
  { id: "RP-008", name: "infra-tf", org: "acme", language: "HCL", default_branch: "main", open_prs: 5, open_issues: 14, last_commit_at: hrs(4), contributors: 8, loc: 41880, visibility: "private" },
  { id: "RP-009", name: "notifications-svc", org: "acme", language: "Go", default_branch: "main", open_prs: 2, open_issues: 5, last_commit_at: days(1), contributors: 6, loc: 18920, visibility: "private" },
  { id: "RP-010", name: "ml-recommender", org: "acme", language: "Python", default_branch: "main", open_prs: 1, open_issues: 3, last_commit_at: hrs(11), contributors: 5, loc: 27314, visibility: "private" },
  { id: "RP-011", name: "design-system", org: "acme", language: "TypeScript", default_branch: "main", open_prs: 4, open_issues: 12, last_commit_at: days(2), contributors: 9, loc: 38420, visibility: "public" },
];
