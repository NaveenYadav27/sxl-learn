import type { CloudAccount, CloudResource, CostBucket } from "./types";

const days = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const ACCOUNTS: CloudAccount[] = [
  { id: "ACC-AWS-001", name: "acme-prod-platform", provider: "aws", account_id: "arn:aws:iam::482910334221", region_primary: "us-east-1", environment: "prod", owner_team: "Platform", monthly_spend_usd: 84210, spend_change_pct: 4.2, resources: 612, compliance_score: 92 },
  { id: "ACC-AWS-002", name: "acme-prod-data", provider: "aws", account_id: "arn:aws:iam::714082651993", region_primary: "us-west-2", environment: "prod", owner_team: "Data", monthly_spend_usd: 41880, spend_change_pct: -2.1, resources: 287, compliance_score: 88 },
  { id: "ACC-AWS-003", name: "acme-staging", provider: "aws", account_id: "arn:aws:iam::901244172004", region_primary: "us-east-1", environment: "staging", owner_team: "Platform", monthly_spend_usd: 9420, spend_change_pct: 1.7, resources: 198, compliance_score: 84 },
  { id: "ACC-AZ-001", name: "acme-corp-prod", provider: "azure", account_id: "/subscriptions/8c9a-...-44e2", region_primary: "westeurope", environment: "prod", owner_team: "Corp IT", monthly_spend_usd: 28940, spend_change_pct: 6.8, resources: 421, compliance_score: 79 },
  { id: "ACC-AZ-002", name: "acme-m365-svc", provider: "azure", account_id: "/subscriptions/4b2e-...-9f12", region_primary: "northeurope", environment: "prod", owner_team: "EUC", monthly_spend_usd: 14210, spend_change_pct: 0.4, resources: 156, compliance_score: 91 },
  { id: "ACC-GCP-001", name: "acme-ml-prod", provider: "gcp", account_id: "projects/acme-ml-prod-991", region_primary: "us-central1", environment: "prod", owner_team: "ML", monthly_spend_usd: 22340, spend_change_pct: 12.4, resources: 184, compliance_score: 81 },
  { id: "ACC-GCP-002", name: "acme-analytics", provider: "gcp", account_id: "projects/acme-analytics-440", region_primary: "europe-west1", environment: "prod", owner_team: "Data", monthly_spend_usd: 18720, spend_change_pct: -4.3, resources: 132, compliance_score: 86 },
  { id: "ACC-OCI-001", name: "acme-oci-archive", provider: "oci", account_id: "ocid1.tenancy.oc1..a8f2", region_primary: "eu-frankfurt-1", environment: "prod", owner_team: "Storage", monthly_spend_usd: 4120, spend_change_pct: -1.0, resources: 41, compliance_score: 94 },
];

export const RESOURCES: CloudResource[] = [
  { id: "R-001", name: "checkout-api-prod-asg", account_id: "ACC-AWS-001", provider: "aws", type: "compute", service: "EC2 ASG", region: "us-east-1", state: "running", monthly_cost_usd: 4820, tags: { env: "prod", svc: "checkout-api" }, created_at: days(180) },
  { id: "R-002", name: "prod-eks-blue", account_id: "ACC-AWS-001", provider: "aws", type: "kubernetes", service: "EKS", region: "us-east-1", state: "running", monthly_cost_usd: 12440, tags: { env: "prod" }, created_at: days(420) },
  { id: "R-003", name: "auth-postgres-prod", account_id: "ACC-AWS-001", provider: "aws", type: "database", service: "RDS Postgres", region: "us-east-1", state: "running", monthly_cost_usd: 3120, tags: { env: "prod", svc: "auth-service" }, created_at: days(540) },
  { id: "R-004", name: "static-assets-cdn", account_id: "ACC-AWS-001", provider: "aws", type: "cdn", service: "CloudFront", region: "global", state: "running", monthly_cost_usd: 1820, tags: { env: "prod" }, created_at: days(700) },
  { id: "R-005", name: "warehouse-s3", account_id: "ACC-AWS-002", provider: "aws", type: "storage", service: "S3", region: "us-west-2", state: "running", monthly_cost_usd: 6210, tags: { env: "prod", team: "data" }, created_at: days(820) },
  { id: "R-006", name: "events-kinesis", account_id: "ACC-AWS-002", provider: "aws", type: "queue", service: "Kinesis", region: "us-west-2", state: "running", monthly_cost_usd: 2410, tags: { env: "prod" }, created_at: days(310) },
  { id: "R-007", name: "img-resize-fn", account_id: "ACC-AWS-001", provider: "aws", type: "serverless", service: "Lambda", region: "us-east-1", state: "running", monthly_cost_usd: 142, tags: { env: "prod" }, created_at: days(96) },
  { id: "R-008", name: "stg-eks", account_id: "ACC-AWS-003", provider: "aws", type: "kubernetes", service: "EKS", region: "us-east-1", state: "running", monthly_cost_usd: 1840, tags: { env: "staging" }, created_at: days(180) },
  { id: "R-009", name: "stg-test-rds", account_id: "ACC-AWS-003", provider: "aws", type: "database", service: "RDS MySQL", region: "us-east-1", state: "stopped", monthly_cost_usd: 0, tags: { env: "staging" }, created_at: days(60) },
  { id: "R-010", name: "corp-vnet-prod", account_id: "ACC-AZ-001", provider: "azure", type: "network", service: "VNet + ER", region: "westeurope", state: "running", monthly_cost_usd: 4120, tags: { env: "prod" }, created_at: days(900) },
  { id: "R-011", name: "corp-aks-prod", account_id: "ACC-AZ-001", provider: "azure", type: "kubernetes", service: "AKS", region: "westeurope", state: "running", monthly_cost_usd: 8420, tags: { env: "prod" }, created_at: days(380) },
  { id: "R-012", name: "corp-keyvault", account_id: "ACC-AZ-001", provider: "azure", type: "secret", service: "Key Vault", region: "westeurope", state: "running", monthly_cost_usd: 38, tags: { env: "prod" }, created_at: days(640) },
  { id: "R-013", name: "exchg-storage", account_id: "ACC-AZ-002", provider: "azure", type: "storage", service: "Blob Storage", region: "northeurope", state: "running", monthly_cost_usd: 2840, tags: { env: "prod" }, created_at: days(720) },
  { id: "R-014", name: "ml-training-gke", account_id: "ACC-GCP-001", provider: "gcp", type: "kubernetes", service: "GKE", region: "us-central1", state: "running", monthly_cost_usd: 9410, tags: { env: "prod", team: "ml" }, created_at: days(220) },
  { id: "R-015", name: "ml-feature-bq", account_id: "ACC-GCP-001", provider: "gcp", type: "database", service: "BigQuery", region: "us-central1", state: "running", monthly_cost_usd: 7240, tags: { env: "prod" }, created_at: days(500) },
  { id: "R-016", name: "events-pubsub", account_id: "ACC-GCP-001", provider: "gcp", type: "queue", service: "Pub/Sub", region: "us-central1", state: "running", monthly_cost_usd: 920, tags: { env: "prod" }, created_at: days(140) },
  { id: "R-017", name: "analytics-dataflow", account_id: "ACC-GCP-002", provider: "gcp", type: "serverless", service: "Dataflow", region: "europe-west1", state: "running", monthly_cost_usd: 3140, tags: { env: "prod" }, created_at: days(240) },
  { id: "R-018", name: "archive-object-store", account_id: "ACC-OCI-001", provider: "oci", type: "storage", service: "Object Storage", region: "eu-frankfurt-1", state: "running", monthly_cost_usd: 4120, tags: { env: "prod", retention: "7y" }, created_at: days(1100) },
  { id: "R-019", name: "frontend-web-acm", account_id: "ACC-AWS-001", provider: "aws", type: "compute", service: "ECS Fargate", region: "us-east-1", state: "error", monthly_cost_usd: 1840, tags: { env: "prod", svc: "frontend-web" }, created_at: days(70) },
  { id: "R-020", name: "edge-router-asg", account_id: "ACC-AWS-001", provider: "aws", type: "compute", service: "EC2 ASG", region: "us-east-1", state: "provisioning", monthly_cost_usd: 0, tags: { env: "prod", svc: "edge-router" }, created_at: days(0) },
];

export const COST_BUCKETS: CostBucket[] = [
  { service: "EC2 / Compute", provider: "aws", monthly_usd: 28420, forecast_usd: 29800, change_pct: 4.8 },
  { service: "EKS", provider: "aws", monthly_usd: 14280, forecast_usd: 14900, change_pct: 4.3 },
  { service: "RDS", provider: "aws", monthly_usd: 9210, forecast_usd: 9300, change_pct: 1.0 },
  { service: "S3", provider: "aws", monthly_usd: 7840, forecast_usd: 8120, change_pct: 3.6 },
  { service: "CloudFront", provider: "aws", monthly_usd: 1820, forecast_usd: 2100, change_pct: 15.4 },
  { service: "AKS", provider: "azure", monthly_usd: 8420, forecast_usd: 8700, change_pct: 3.3 },
  { service: "Blob Storage", provider: "azure", monthly_usd: 2840, forecast_usd: 2900, change_pct: 2.1 },
  { service: "VNet / ExpressRoute", provider: "azure", monthly_usd: 4120, forecast_usd: 4200, change_pct: 1.9 },
  { service: "GKE", provider: "gcp", monthly_usd: 9410, forecast_usd: 10800, change_pct: 14.8 },
  { service: "BigQuery", provider: "gcp", monthly_usd: 7240, forecast_usd: 7800, change_pct: 7.7 },
  { service: "Object Storage", provider: "oci", monthly_usd: 4120, forecast_usd: 4080, change_pct: -1.0 },
];
