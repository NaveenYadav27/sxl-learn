import type { Assignee, Priority, Severity, Status } from "@/ops/lib/types";

export type IncidentCategory =
  | "network"
  | "endpoint"
  | "identity"
  | "application"
  | "database"
  | "cloud"
  | "security";

export interface IncidentComment {
  id: string;
  at: string;
  author: string;
  body: string;
  internal?: boolean;
}

export interface IncidentEvent {
  id: string;
  at: string;
  actor?: string;
  kind: "created" | "assigned" | "status" | "comment" | "escalation" | "linked" | "resolved";
  summary: string;
  detail?: string;
}

export interface CI {
  id: string;
  name: string;
  type: "server" | "service" | "endpoint" | "k8s_pod" | "k8s_node" | "database" | "network";
  environment?: "prod" | "stage" | "dev";
}

export interface Incident {
  number: string;            // e.g. INC0010234
  short_description: string;
  description: string;
  status: Status;
  severity: Severity;
  priority: Priority;
  category: IncidentCategory;
  caller: string;
  assigned_to?: Assignee | null;
  assignment_group?: string;
  cis: CI[];
  opened_at: string;         // ISO
  updated_at: string;
  resolved_at?: string;
  sla_percent: number;       // 0-120
  source: "manual" | "splunk" | "monitoring" | "email" | "portal";
  related?: string[];        // INC numbers
  comments: IncidentComment[];
  events: IncidentEvent[];
}
