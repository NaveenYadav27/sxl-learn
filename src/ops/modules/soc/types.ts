import type { Assignee, Severity, Status } from "@/ops/lib/types";
import type { CI } from "@/ops/modules/itsm/types";

export type AlertSource = "splunk_es" | "defender" | "crowdstrike" | "guardduty" | "wazuh" | "sentinel" | "okta" | "manual";
export type MitreTactic =
  | "initial_access" | "execution" | "persistence" | "privilege_escalation"
  | "defense_evasion" | "credential_access" | "discovery" | "lateral_movement"
  | "collection" | "command_control" | "exfiltration" | "impact";
export type Disposition = "true_positive" | "false_positive" | "benign" | "duplicate" | "pending";

export interface AlertEvent {
  id: string;
  at: string;
  actor?: string;
  kind: "created" | "triaged" | "assigned" | "status" | "comment" | "escalated" | "linked" | "closed" | "playbook";
  summary: string;
  detail?: string;
}

export interface AlertObservable {
  type: "ip" | "host" | "user" | "hash" | "domain" | "url" | "process" | "file";
  value: string;
  risk?: number;
}

export interface SocAlert {
  id: string;                  // ALERT-XXXX
  title: string;
  description: string;
  source: AlertSource;
  rule_name: string;
  rule_id: string;
  severity: Severity;
  status: Status;
  disposition: Disposition;
  risk_score: number;          // 0-100
  confidence: number;          // 0-100
  tactic: MitreTactic;
  technique: string;           // e.g. T1059.001
  technique_name: string;
  assigned_to?: Assignee | null;
  assignment_group?: string;
  cis: CI[];
  observables: AlertObservable[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  related_alerts?: string[];
  related_incident?: string;
  related_notable?: string;
  events: AlertEvent[];
}

export type NotableUrgency = "critical" | "high" | "medium" | "low" | "informational";

export interface NotableEvent {
  id: string;                  // NTBL-XXXX
  title: string;
  description: string;
  search_name: string;         // correlation search
  urgency: NotableUrgency;
  status: "unassigned" | "new" | "in_progress" | "pending" | "resolved" | "closed";
  owner?: Assignee | null;
  index: string;               // splunk index
  sourcetype: string;
  src?: string;
  dest?: string;
  user?: string;
  signature?: string;
  count: number;               // events rolled up
  first_event_at: string;
  last_event_at: string;
  raw_sample: string;          // raw log line
  spl: string;                 // SPL of correlation search
  drilldown_spl: string;
  related_alerts?: string[];
  history: AlertEvent[];
}
