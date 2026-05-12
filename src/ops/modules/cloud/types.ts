export type CloudProvider = "aws" | "azure" | "gcp" | "oci";
export type ResourceType =
  | "compute" | "storage" | "database" | "network" | "serverless" | "queue" | "kubernetes" | "cdn" | "secret";
export type ResourceState = "running" | "stopped" | "provisioning" | "error" | "deleted";

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  account_id: string; // arn-ish / sub id
  region_primary: string;
  environment: "prod" | "staging" | "dev" | "sandbox";
  owner_team: string;
  monthly_spend_usd: number;
  spend_change_pct: number; // vs last month
  resources: number;
  compliance_score: number; // 0-100
}

export interface CloudResource {
  id: string;
  name: string;
  account_id: string;
  provider: CloudProvider;
  type: ResourceType;
  service: string; // ec2, s3, rds, lambda, eks, app-service, gke...
  region: string;
  state: ResourceState;
  monthly_cost_usd: number;
  tags: Record<string, string>;
  created_at: string;
}

export interface CostBucket {
  service: string;
  provider: CloudProvider;
  monthly_usd: number;
  forecast_usd: number;
  change_pct: number;
}
