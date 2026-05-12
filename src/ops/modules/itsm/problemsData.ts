import type { Assignee, Priority, Severity, Status } from "@/ops/lib/types";
import type { CI } from "./types";

export interface Problem {
  number: string;            // PRB0001234
  short_description: string;
  description: string;
  status: Status;
  severity: Severity;
  priority: Priority;
  category: "network" | "endpoint" | "application" | "database" | "cloud" | "security";
  known_error: boolean;
  workaround?: string;
  root_cause?: string;
  assigned_to?: Assignee | null;
  assignment_group?: string;
  cis: CI[];
  related_incidents: string[];   // INC numbers
  opened_at: string;
  updated_at: string;
  resolved_at?: string;
}

const A = (id: string, name: string, group?: string) => ({ id, name, group });
const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();
const hours = (h: number) => minutes(h * 60);
const days = (d: number) => hours(d * 24);

export const PROBLEMS: Problem[] = [
  {
    number: "PRB0001234",
    short_description: "Recurring auth-svc connection pool exhaustion under load",
    description: "Multiple INC reports of auth-svc latency tied to DB pool saturation. Root cause investigation required.",
    status: "in_progress",
    severity: "high",
    priority: 2,
    category: "application",
    known_error: true,
    workaround: "Scale auth-svc replicas to 8 during peak EMEA hours.",
    root_cause: "Connection pool size hard-coded at 25; autoscaling adds replicas but pool stays static.",
    assigned_to: A("u1", "Aarav Mehta", "SRE-EMEA"),
    assignment_group: "SRE-EMEA",
    cis: [{ id: "ci-auth", name: "auth-svc", type: "service", environment: "prod" }],
    related_incidents: ["INC0010234", "INC0010230"],
    opened_at: days(4),
    updated_at: hours(2),
  },
  {
    number: "PRB0001233",
    short_description: "K8s node prod-node-7 repeatedly transitions NotReady",
    description: "Kernel panic logs observed twice this week on prod-node-7. Hardware health check pending.",
    status: "assigned",
    severity: "high",
    priority: 2,
    category: "cloud",
    known_error: false,
    assigned_to: A("u3", "Diego Romero", "SRE-Platform"),
    assignment_group: "SRE-Platform",
    cis: [{ id: "ci-node7", name: "prod-node-7", type: "k8s_node", environment: "prod" }],
    related_incidents: ["INC0010232"],
    opened_at: days(2),
    updated_at: hours(6),
  },
  {
    number: "PRB0001232",
    short_description: "DNS resolver upstream rate limit on eu-west-1",
    description: "Upstream DNS provider applying per-VPC rate limits. Need long-term mitigation.",
    status: "resolved",
    severity: "medium",
    priority: 3,
    category: "network",
    known_error: true,
    workaround: "Use NodeLocal DNSCache on all clusters.",
    root_cause: "Single resolver IP per VPC exceeded 10k qps soft limit.",
    assigned_to: A("u4", "Mei Tanaka", "Network-Ops"),
    assignment_group: "Network-Ops",
    cis: [{ id: "ci-dns", name: "vpc-resolver-eu-west-1", type: "network", environment: "prod" }],
    related_incidents: ["INC0010230"],
    opened_at: days(7),
    updated_at: days(1),
    resolved_at: days(1),
  },
  {
    number: "PRB0001231",
    short_description: "Backup target volume nearing capacity (>90%)",
    description: "Backup storage retention policy causing growth rate of ~3% per week.",
    status: "new",
    severity: "medium",
    priority: 3,
    category: "database",
    known_error: false,
    assigned_to: null,
    assignment_group: "DBA",
    cis: [{ id: "ci-bkp", name: "backup-target-01", type: "server", environment: "prod" }],
    related_incidents: ["INC0010229"],
    opened_at: hours(20),
    updated_at: hours(20),
  },
  {
    number: "PRB0001230",
    short_description: "Phishing lure pattern bypassing email gateway filter",
    description: "Email gateway not catching crafted PDF lures with embedded redirector. SOC requesting rule update.",
    status: "in_progress",
    severity: "high",
    priority: 2,
    category: "security",
    known_error: true,
    workaround: "URL block at proxy + user notification.",
    assigned_to: A("u2", "Lina Okafor", "SOC-Tier2"),
    assignment_group: "SOC-Tier2",
    cis: [{ id: "ci-edr", name: "Defender for Endpoint", type: "service", environment: "prod" }],
    related_incidents: ["INC0010233"],
    opened_at: days(1),
    updated_at: hours(3),
  },
];

export function findProblem(number: string) {
  return PROBLEMS.find((p) => p.number === number);
}
