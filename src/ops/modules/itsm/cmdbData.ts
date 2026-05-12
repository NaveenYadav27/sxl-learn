import type { CI } from "./types";

export interface CmdbItem extends CI {
  owner: string;
  group: string;
  criticality: "tier1" | "tier2" | "tier3";
  status: "operational" | "degraded" | "down" | "maintenance" | "retired";
  location?: string;
  ip?: string;
  os?: string;
  tags?: string[];
  depends_on?: string[];   // CI ids
  supports?: string[];     // CI ids
  open_incidents?: number;
  open_changes?: number;
  last_seen?: string;
}

const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();
const hours = (h: number) => minutes(h * 60);

export const CMDB: CmdbItem[] = [
  {
    id: "ci-auth", name: "auth-svc", type: "service", environment: "prod",
    owner: "Aarav Mehta", group: "SRE-EMEA", criticality: "tier1", status: "degraded",
    tags: ["identity", "edge", "java"],
    depends_on: ["ci-db1", "ci-vault"], supports: ["ci-portal", "ci-pay"],
    open_incidents: 1, open_changes: 1, last_seen: minutes(2),
  },
  {
    id: "ci-db1", name: "auth-db-eu-west-01", type: "database", environment: "prod",
    owner: "Tom Becker", group: "DBA", criticality: "tier1", status: "operational",
    ip: "10.41.7.12", os: "PostgreSQL 15.6",
    tags: ["postgres", "rds"], supports: ["ci-auth"],
    open_incidents: 0, open_changes: 1, last_seen: minutes(1),
  },
  {
    id: "ci-node7", name: "prod-node-7", type: "k8s_node", environment: "prod",
    owner: "Diego Romero", group: "SRE-Platform", criticality: "tier2", status: "down",
    ip: "10.50.4.27", os: "Bottlerocket 1.19",
    tags: ["k8s", "worker"], supports: ["ci-pay"],
    open_incidents: 1, open_changes: 1, last_seen: hours(1),
  },
  {
    id: "ci-pay", name: "payment-svc", type: "service", environment: "prod",
    owner: "Mira Chen", group: "Payments", criticality: "tier1", status: "degraded",
    tags: ["pci", "go"], depends_on: ["ci-node7", "ci-auth"], supports: ["ci-portal"],
    open_incidents: 1, open_changes: 0, last_seen: minutes(3),
  },
  {
    id: "ci-portal", name: "customer-portal", type: "service", environment: "prod",
    owner: "Kai Rivera", group: "Web", criticality: "tier1", status: "operational",
    tags: ["nextjs", "edge"], depends_on: ["ci-auth", "ci-pay"],
    open_incidents: 0, open_changes: 0, last_seen: minutes(1),
  },
  {
    id: "ci-edr", name: "Defender for Endpoint", type: "service", environment: "prod",
    owner: "Lina Okafor", group: "SOC-Tier2", criticality: "tier1", status: "operational",
    tags: ["security", "edr"], open_incidents: 1, open_changes: 1, last_seen: minutes(1),
  },
  {
    id: "ci-vault", name: "secrets-vault", type: "service", environment: "prod",
    owner: "Noor Hassan", group: "Platform", criticality: "tier1", status: "operational",
    tags: ["hashicorp", "secrets"], supports: ["ci-auth"],
    last_seen: minutes(1),
  },
  {
    id: "ci-dns", name: "vpc-resolver-eu-west-1", type: "network", environment: "prod",
    owner: "Mei Tanaka", group: "Network-Ops", criticality: "tier1", status: "operational",
    ip: "10.0.0.2", tags: ["dns", "vpc"], open_incidents: 0, open_changes: 1, last_seen: minutes(1),
  },
  {
    id: "ci-bkp", name: "backup-target-01", type: "server", environment: "prod",
    owner: "Tom Becker", group: "DBA", criticality: "tier2", status: "degraded",
    ip: "10.42.9.4", os: "Ubuntu 22.04", tags: ["backup", "storage"],
    open_incidents: 1, open_changes: 0, last_seen: minutes(5),
  },
  {
    id: "ci-mfp", name: "MFP-04", type: "endpoint", environment: "prod",
    owner: "Service Desk", group: "Service Desk", criticality: "tier3", status: "down",
    location: "HQ Floor 4", tags: ["printer"],
    open_incidents: 1, open_changes: 0, last_seen: hours(20),
  },
  {
    id: "ci-vpn", name: "Corp VPN Client", type: "service", environment: "prod",
    owner: "Anita Rao", group: "Endpoint-Eng", criticality: "tier2", status: "operational",
    tags: ["vpn", "endpoint"], last_seen: minutes(1),
  },
  {
    id: "ci-edge", name: "edge-fleet", type: "service", environment: "prod",
    owner: "Noor Hassan", group: "Platform", criticality: "tier1", status: "operational",
    tags: ["edge", "tls"], open_changes: 1, last_seen: minutes(1),
  },
];

export function findCi(id: string) {
  return CMDB.find((c) => c.id === id);
}
