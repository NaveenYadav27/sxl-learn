export type ClusterProvider = "eks" | "aks" | "gke" | "openshift" | "kubeadm" | "docker";
export type ClusterStatus = "healthy" | "degraded" | "down" | "upgrading";

export interface Cluster {
  id: string;                 // clu-xxx
  name: string;
  provider: ClusterProvider;
  region: string;
  version: string;            // k8s version
  status: ClusterStatus;
  nodes_total: number;
  nodes_ready: number;
  cpu_used: number;           // cores
  cpu_capacity: number;
  mem_used_gb: number;
  mem_capacity_gb: number;
  pods_running: number;
  pods_capacity: number;
  workloads: number;
  namespaces: string[];
}

export type WorkloadKind = "Deployment" | "StatefulSet" | "DaemonSet" | "CronJob" | "Job";
export type WorkloadStatus = "ready" | "progressing" | "degraded" | "failed";

export interface Workload {
  id: string;                 // wl-xxx
  name: string;
  kind: WorkloadKind;
  cluster_id: string;
  namespace: string;
  service_id?: string;
  image: string;
  replicas_desired: number;
  replicas_ready: number;
  status: WorkloadStatus;
  age_days: number;
  restarts_24h: number;
  cpu_request_m: number;      // millicores per pod
  mem_request_mi: number;     // mebibytes per pod
  last_deploy_at: string;
  hpa_enabled?: boolean;
  hpa_min?: number;
  hpa_max?: number;
}

export type PodPhase = "Running" | "Pending" | "Succeeded" | "Failed" | "CrashLoopBackOff" | "ImagePullBackOff" | "Terminating";

export interface PodContainer {
  name: string;
  image: string;
  ready: boolean;
  restarts: number;
  state: "running" | "waiting" | "terminated";
  last_reason?: string;
  cpu_milli: number;
  mem_mi: number;
}

export interface Pod {
  id: string;                 // pod-xxx
  name: string;
  cluster_id: string;
  namespace: string;
  workload_id?: string;
  node: string;
  phase: PodPhase;
  ready_containers: number;
  total_containers: number;
  restarts: number;
  age: string;                // human (e.g. 2d3h)
  ip: string;
  qos: "Guaranteed" | "Burstable" | "BestEffort";
  containers: PodContainer[];
  events: { at: string; type: "Normal" | "Warning"; reason: string; message: string }[];
}

// Docker host view (for non-k8s docker engines)
export type DockerState = "running" | "exited" | "restarting" | "paused" | "dead" | "created";

export interface DockerContainer {
  id: string;                 // 12-char short id
  name: string;
  host: string;
  image: string;
  state: DockerState;
  status: string;             // "Up 3 days"
  ports: string;
  cpu_pct: number;
  mem_mb: number;
  mem_limit_mb: number;
  network_rx_mb: number;
  network_tx_mb: number;
  created_at: string;
  command: string;
}
