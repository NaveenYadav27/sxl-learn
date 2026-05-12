import type { Cluster } from "./types";

export const CLUSTERS: Cluster[] = [
  { id: "clu-prod-use1", name: "prod-use1", provider: "eks", region: "us-east-1", version: "1.29.4", status: "healthy",
    nodes_total: 24, nodes_ready: 24, cpu_used: 142, cpu_capacity: 192, mem_used_gb: 612, mem_capacity_gb: 768,
    pods_running: 412, pods_capacity: 660, workloads: 86, namespaces: ["payments", "commerce", "platform", "ingress", "monitoring", "security"] },
  { id: "clu-prod-euw1", name: "prod-euw1", provider: "eks", region: "eu-west-1", version: "1.29.4", status: "degraded",
    nodes_total: 12, nodes_ready: 11, cpu_used: 78, cpu_capacity: 96, mem_used_gb: 280, mem_capacity_gb: 384,
    pods_running: 198, pods_capacity: 330, workloads: 54, namespaces: ["payments", "commerce", "platform", "ingress"] },
  { id: "clu-stg-use1", name: "stg-use1", provider: "eks", region: "us-east-1", version: "1.30.0", status: "healthy",
    nodes_total: 6, nodes_ready: 6, cpu_used: 22, cpu_capacity: 48, mem_used_gb: 96, mem_capacity_gb: 192,
    pods_running: 110, pods_capacity: 220, workloads: 70, namespaces: ["payments", "commerce", "platform", "qa"] },
  { id: "clu-data-gke", name: "data-gke", provider: "gke", region: "us-central1", version: "1.28.7", status: "upgrading",
    nodes_total: 18, nodes_ready: 16, cpu_used: 96, cpu_capacity: 144, mem_used_gb: 420, mem_capacity_gb: 576,
    pods_running: 240, pods_capacity: 480, workloads: 42, namespaces: ["data", "ml", "platform"] },
  { id: "clu-edge-aks", name: "edge-aks", provider: "aks", region: "westus2", version: "1.28.5", status: "healthy",
    nodes_total: 8, nodes_ready: 8, cpu_used: 30, cpu_capacity: 64, mem_used_gb: 110, mem_capacity_gb: 256,
    pods_running: 88, pods_capacity: 220, workloads: 24, namespaces: ["edge", "ingress"] },
];

export function findCluster(id: string) { return CLUSTERS.find((c) => c.id === id); }
