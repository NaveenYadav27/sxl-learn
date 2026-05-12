import type { Assignee, Status } from "@/ops/lib/types";
import type { CI } from "./types";

export type ChangeType = "standard" | "normal" | "emergency";
export type ChangeRisk = "low" | "moderate" | "high";
export type ChangeState =
  | "draft"
  | "assess"
  | "authorize"
  | "scheduled"
  | "implement"
  | "review"
  | "closed";

export interface ChangeRequest {
  number: string;            // CHG0009876
  short_description: string;
  description: string;
  type: ChangeType;
  risk: ChangeRisk;
  impact: "low" | "medium" | "high";
  state: ChangeState;
  status: Status;            // mapped for badge color
  assignment_group?: string;
  assigned_to?: Assignee | null;
  cis: CI[];
  planned_start: string;
  planned_end: string;
  cab_required: boolean;
  approvals: { name: string; role: string; status: "pending" | "approved" | "rejected" }[];
  implementation_plan: string;
  backout_plan: string;
  test_plan: string;
  related_incidents?: string[];
  related_problems?: string[];
  created_at: string;
  updated_at: string;
}

const A = (id: string, name: string, group?: string) => ({ id, name, group });
const now = Date.now();
const future = (h: number) => new Date(now + h * 3600_000).toISOString();
const past = (h: number) => new Date(now - h * 3600_000).toISOString();

export const CHANGES: ChangeRequest[] = [
  {
    number: "CHG0009876",
    short_description: "Increase auth-svc DB connection pool to 100; rolling restart",
    description: "Address PRB0001234 by raising pool size from 25→100. Rolling restart of 8 replicas in prod-eu-west.",
    type: "normal",
    risk: "moderate",
    impact: "high",
    state: "authorize",
    status: "in_progress",
    assignment_group: "SRE-EMEA",
    assigned_to: A("u1", "Aarav Mehta", "SRE-EMEA"),
    cis: [
      { id: "ci-auth", name: "auth-svc", type: "service", environment: "prod" },
      { id: "ci-db1", name: "auth-db-eu-west-01", type: "database", environment: "prod" },
    ],
    planned_start: future(18),
    planned_end: future(20),
    cab_required: true,
    approvals: [
      { name: "Service Owner", role: "Identity Platform", status: "approved" },
      { name: "CAB Chair", role: "Change Advisory Board", status: "pending" },
      { name: "Security Review", role: "InfoSec", status: "approved" },
    ],
    implementation_plan: "1. Apply ConfigMap update.\n2. kubectl rollout restart deploy/auth-svc -n identity.\n3. Verify pool gauge metric.",
    backout_plan: "Re-apply previous ConfigMap revision and rollout undo.",
    test_plan: "Synthetic login probe + p95 latency dashboard for 30 minutes post-deploy.",
    related_problems: ["PRB0001234"],
    related_incidents: ["INC0010234"],
    created_at: past(6),
    updated_at: past(1),
  },
  {
    number: "CHG0009875",
    short_description: "Replace prod-node-7 — hardware swap",
    description: "Cordon, drain, and replace prod-node-7 due to recurring kernel panics.",
    type: "normal",
    risk: "high",
    impact: "medium",
    state: "scheduled",
    status: "assigned",
    assignment_group: "SRE-Platform",
    assigned_to: A("u3", "Diego Romero", "SRE-Platform"),
    cis: [{ id: "ci-node7", name: "prod-node-7", type: "k8s_node", environment: "prod" }],
    planned_start: future(48),
    planned_end: future(52),
    cab_required: true,
    approvals: [
      { name: "Platform Owner", role: "SRE-Platform", status: "approved" },
      { name: "CAB Chair", role: "Change Advisory Board", status: "approved" },
    ],
    implementation_plan: "Cordon → drain → power down → swap NIC → cordon off → re-image → join.",
    backout_plan: "Re-add original node if new hardware fails health check.",
    test_plan: "Run platform smoke suite + 1h soak.",
    related_problems: ["PRB0001233"],
    created_at: past(24),
    updated_at: past(2),
  },
  {
    number: "CHG0009874",
    short_description: "Deploy NodeLocal DNSCache to all EMEA clusters",
    description: "Long-term mitigation for DNS upstream rate-limit issue (PRB0001232).",
    type: "normal",
    risk: "low",
    impact: "medium",
    state: "implement",
    status: "in_progress",
    assignment_group: "Network-Ops",
    assigned_to: A("u4", "Mei Tanaka", "Network-Ops"),
    cis: [{ id: "ci-dns", name: "vpc-resolver-eu-west-1", type: "network", environment: "prod" }],
    planned_start: past(2),
    planned_end: future(2),
    cab_required: false,
    approvals: [
      { name: "Network Owner", role: "Network-Ops", status: "approved" },
    ],
    implementation_plan: "Helm upgrade nodelocaldns to v1.23 with EMEA values overlay.",
    backout_plan: "helm rollback nodelocaldns 1",
    test_plan: "dig probe from sample pods; verify metrics.",
    related_problems: ["PRB0001232"],
    created_at: past(8),
    updated_at: past(1),
  },
  {
    number: "CHG0009873",
    short_description: "Emergency: Block phishing redirector domain at proxy",
    description: "Block list update for active phishing campaign affecting 14 endpoints.",
    type: "emergency",
    risk: "low",
    impact: "high",
    state: "closed",
    status: "resolved",
    assignment_group: "SOC-Tier2",
    assigned_to: A("u2", "Lina Okafor", "SOC-Tier2"),
    cis: [{ id: "ci-edr", name: "Defender for Endpoint", type: "service", environment: "prod" }],
    planned_start: past(20),
    planned_end: past(19),
    cab_required: false,
    approvals: [
      { name: "SOC Manager", role: "Security", status: "approved" },
    ],
    implementation_plan: "Push proxy ACL update via automation pipeline.",
    backout_plan: "Revert ACL commit.",
    test_plan: "Curl from test endpoint must return 403.",
    related_incidents: ["INC0010233"],
    created_at: past(21),
    updated_at: past(19),
  },
  {
    number: "CHG0009872",
    short_description: "Quarterly TLS certificate rotation — *.corp.shadowxlab.com",
    description: "Standard pre-approved cert rotation across edge fleet.",
    type: "standard",
    risk: "low",
    impact: "low",
    state: "scheduled",
    status: "new",
    assignment_group: "Platform",
    assigned_to: A("u8", "Noor Hassan", "Platform"),
    cis: [{ id: "ci-edge", name: "edge-fleet", type: "service", environment: "prod" }],
    planned_start: future(72),
    planned_end: future(73),
    cab_required: false,
    approvals: [
      { name: "Standard Template", role: "Pre-approved", status: "approved" },
    ],
    implementation_plan: "Run cert-rotate playbook against edge inventory.",
    backout_plan: "Roll back to previous cert from vault.",
    test_plan: "Curl edge endpoints + verify expiry.",
    created_at: past(48),
    updated_at: past(12),
  },
];

export function findChange(number: string) {
  return CHANGES.find((c) => c.number === number);
}
