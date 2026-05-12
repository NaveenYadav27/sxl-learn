import type { Pod } from "./types";

const evt = (mins: number, type: "Normal" | "Warning", reason: string, message: string) =>
  ({ at: new Date(Date.now() - mins * 60000).toISOString(), type, reason, message });

export const PODS: Pod[] = [
  {
    id: "pod-checkout-7b9c-x2k", name: "checkout-api-7b9c-x2k", cluster_id: "clu-prod-use1", namespace: "payments",
    workload_id: "wl-checkout-api", node: "ip-10-3-21-104", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 3, age: "2d3h", ip: "10.244.21.18", qos: "Burstable",
    containers: [{ name: "api", image: "ghcr.io/sxl/checkout-api:1.42.3", ready: true, restarts: 3, state: "running", cpu_milli: 412, mem_mi: 786 }],
    events: [evt(2, "Warning", "Unhealthy", "Liveness probe failed: HTTP 503"), evt(120, "Normal", "Started", "Started container api")],
  },
  {
    id: "pod-checkout-7b9c-q9z", name: "checkout-api-7b9c-q9z", cluster_id: "clu-prod-use1", namespace: "payments",
    workload_id: "wl-checkout-api", node: "ip-10-3-21-118", phase: "CrashLoopBackOff",
    ready_containers: 0, total_containers: 1, restarts: 27, age: "1h22m", ip: "10.244.21.42", qos: "Burstable",
    containers: [{ name: "api", image: "ghcr.io/sxl/checkout-api:1.42.3", ready: false, restarts: 27, state: "waiting", last_reason: "CrashLoopBackOff", cpu_milli: 0, mem_mi: 0 }],
    events: [evt(1, "Warning", "BackOff", "Back-off restarting failed container api"), evt(8, "Warning", "Failed", "Error: connection refused upstream payments-svc:8080")],
  },
  {
    id: "pod-payments-65f-aa1", name: "payments-svc-65f-aa1", cluster_id: "clu-prod-use1", namespace: "payments",
    workload_id: "wl-payments", node: "ip-10-3-22-12", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 0, age: "1d14h", ip: "10.244.22.7", qos: "Guaranteed",
    containers: [{ name: "api", image: "ghcr.io/sxl/payments-svc:3.7.0", ready: true, restarts: 0, state: "running", cpu_milli: 612, mem_mi: 1820 }],
    events: [evt(2280, "Normal", "Pulled", "Container image pulled successfully")],
  },
  {
    id: "pod-identity-9c7-bb2", name: "identity-api-9c7-bb2", cluster_id: "clu-prod-use1", namespace: "platform",
    workload_id: "wl-identity", node: "ip-10-3-23-44", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 1, age: "5d2h", ip: "10.244.23.92", qos: "Guaranteed",
    containers: [{ name: "api", image: "ghcr.io/sxl/identity-api:2.18.1", ready: true, restarts: 1, state: "running", cpu_milli: 320, mem_mi: 690 }],
    events: [evt(7200, "Normal", "Started", "Started container api")],
  },
  {
    id: "pod-search-44d-c1q", name: "search-api-44d-c1q", cluster_id: "clu-prod-use1", namespace: "commerce",
    workload_id: "wl-search", node: "ip-10-3-21-104", phase: "Running",
    ready_containers: 1, total_containers: 2, restarts: 14, age: "3h44m", ip: "10.244.21.66", qos: "Burstable",
    containers: [
      { name: "api", image: "ghcr.io/sxl/search-api:2.11.0", ready: true, restarts: 14, state: "running", cpu_milli: 540, mem_mi: 1380 },
      { name: "sidecar-proxy", image: "envoyproxy/envoy:v1.29.0", ready: false, restarts: 14, state: "waiting", last_reason: "OOMKilled", cpu_milli: 0, mem_mi: 0 },
    ],
    events: [evt(4, "Warning", "OOMKilled", "Container sidecar-proxy exceeded memory limit")],
  },
  {
    id: "pod-notify-1aa-d77", name: "notify-worker-1aa-d77", cluster_id: "clu-prod-use1", namespace: "platform",
    workload_id: "wl-notify", node: "ip-10-3-22-31", phase: "ImagePullBackOff",
    ready_containers: 0, total_containers: 1, restarts: 0, age: "12m", ip: "—", qos: "Burstable",
    containers: [{ name: "worker", image: "ghcr.io/sxl/notify-worker:1.4.1", ready: false, restarts: 0, state: "waiting", last_reason: "ImagePullBackOff", cpu_milli: 0, mem_mi: 0 }],
    events: [evt(2, "Warning", "Failed", "Failed to pull image: manifest unknown")],
  },
  {
    id: "pod-cart-7e2-ee9", name: "cart-svc-7e2-ee9", cluster_id: "clu-prod-use1", namespace: "commerce",
    workload_id: "wl-cart", node: "ip-10-3-22-44", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 0, age: "3d1h", ip: "10.244.22.118", qos: "Burstable",
    containers: [{ name: "api", image: "ghcr.io/sxl/cart-svc:1.9.4", ready: true, restarts: 0, state: "running", cpu_milli: 220, mem_mi: 560 }],
    events: [],
  },
  {
    id: "pod-fluent-bit-5j2", name: "fluent-bit-5j2", cluster_id: "clu-prod-use1", namespace: "monitoring",
    workload_id: "wl-fluent-bit", node: "ip-10-3-21-104", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 2, age: "15d", ip: "10.244.21.2", qos: "BestEffort",
    containers: [{ name: "fluent-bit", image: "fluent/fluent-bit:2.2.0", ready: true, restarts: 2, state: "running", cpu_milli: 32, mem_mi: 96 }],
    events: [],
  },
  {
    id: "pod-redis-ck-0", name: "redis-checkout-0", cluster_id: "clu-prod-use1", namespace: "payments",
    workload_id: "wl-redis-checkout", node: "ip-10-3-22-12", phase: "Running",
    ready_containers: 1, total_containers: 1, restarts: 0, age: "21d", ip: "10.244.22.81", qos: "Guaranteed",
    containers: [{ name: "redis", image: "redis:7.2-alpine", ready: true, restarts: 0, state: "running", cpu_milli: 180, mem_mi: 720 }],
    events: [],
  },
  {
    id: "pod-recon-262-zzm", name: "nightly-recon-29262-zzm", cluster_id: "clu-prod-use1", namespace: "payments",
    workload_id: "wl-nightly-recon", node: "ip-10-3-22-31", phase: "Succeeded",
    ready_containers: 0, total_containers: 1, restarts: 0, age: "8h", ip: "—", qos: "Burstable",
    containers: [{ name: "recon", image: "ghcr.io/sxl/recon:0.8.1", ready: false, restarts: 0, state: "terminated", last_reason: "Completed", cpu_milli: 0, mem_mi: 0 }],
    events: [evt(480, "Normal", "Completed", "Job completed successfully")],
  },
];

export function findPod(id: string) { return PODS.find((p) => p.id === id); }
