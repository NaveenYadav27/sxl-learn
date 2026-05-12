import type { Assignee, Severity } from "@/ops/lib/types";

export type ServiceTier = "tier_1" | "tier_2" | "tier_3";
export type ServiceHealth = "healthy" | "degraded" | "down" | "maintenance";

export interface ServiceMetric {
  ts: string;          // ISO
  value: number;
}

export interface Service {
  id: string;          // svc-<slug>
  name: string;
  description: string;
  tier: ServiceTier;
  owner_team: string;
  on_call?: Assignee | null;
  repo?: string;
  runbook_url?: string;
  dashboard_url?: string;
  health: ServiceHealth;
  uptime_30d: number;          // 0-100
  error_rate_5m: number;       // %
  latency_p95_ms: number;
  latency_p99_ms: number;
  rps: number;
  saturation: number;          // %
  dependencies: string[];      // service ids
  ci_ids: string[];            // CMDB CI ids
  related_workloads?: string[];// k8s workload ids
  slos: string[];              // slo ids
}

export type SloKind = "availability" | "latency" | "error_rate" | "throughput";
export type SloStatus = "healthy" | "at_risk" | "burning" | "breached";

export interface Slo {
  id: string;                  // slo-XXXX
  name: string;
  service_id: string;
  kind: SloKind;
  objective: number;           // e.g. 99.9
  unit: string;                // %, ms
  window_days: 7 | 28 | 30 | 90;
  current: number;             // current sli value
  error_budget_pct: number;    // 0-100 remaining
  burn_rate_1h: number;
  burn_rate_6h: number;
  status: SloStatus;
  description?: string;
}

export type MonitorState = "alerting" | "pending" | "ok" | "no_data" | "silenced";

export interface MonitoringAlert {
  id: string;                  // mon-XXXX
  rule_name: string;
  source: "grafana" | "prometheus" | "datadog" | "newrelic" | "cloudwatch";
  state: MonitorState;
  severity: Severity;
  service_id?: string;
  workload_id?: string;
  summary: string;
  expression: string;          // promql / query
  value: number;
  threshold: number;
  fired_at: string;
  duration_s: number;
  labels: Record<string, string>;
  runbook_url?: string;
  silenced_until?: string;
}
