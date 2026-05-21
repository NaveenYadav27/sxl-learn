// Module 3 — Kubernetes Fundamentals & Pod Architecture
// 12 incidents spanning pod fundamentals, node/runtime, networking, ops.
// Each incident ships with the full K8sIncident payload PLUS a `k8s_concept`
// block (the architecture flow + interactive tool cards + beginner/engineer
// explanations). Rendered by K8sConceptPanel inside IncidentDetail.

import type { K8sIncident } from "./incidentsData";

export type K8sArchNode = {
  id: string;
  label: string;
  def: string;            // hover definition
  responsibility: string; // what it owns
  failure_impact: string; // what breaks if it dies
  commands: string[];     // troubleshooting commands
};

export type K8sToolCard = {
  name: string;
  category: "cli" | "runtime" | "control_plane" | "observability" | "gitops" | "networking";
  definition: string;
  why_engineers_use_it: string;
  beginner_view: string;
  advanced_view: string;
  commands: { cmd: string; expected: string }[];
  enterprise_usage: string;
  related_incidents: string[]; // incident IDs
};

export type K8sConcept = {
  concept: string;
  definition: string;
  why_it_exists: string;
  enterprise_impact: string;
  beginner: string;
  engineer: string;
  architecture_flow: K8sArchNode[];
  failure_stage_id: string; // id of the arch node that failed
  tools: K8sToolCard[];
  learn_more: { question: string; answer: string }[]; // expandable "Learn this concept"
};

// Extend the shared incident shape with our concept payload.
export type K8sIncidentWithConcept = K8sIncident & { k8s_concept?: K8sConcept };

const iso = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();

// Shared architecture flow used by most pod / scheduling / runtime incidents.
// Different incidents override `failure_stage_id` to highlight a different node.
const POD_LIFECYCLE_FLOW: K8sArchNode[] = [
  {
    id: "kubectl",
    label: "kubectl",
    def: "Command-line client that speaks to the Kubernetes API server over HTTPS.",
    responsibility: "Authenticate the user, marshal YAML / JSON, send REST calls to the API server.",
    failure_impact: "Engineer can't manage the cluster — but workloads keep running.",
    commands: ["kubectl version --short", "kubectl config current-context", "kubectl cluster-info"],
  },
  {
    id: "api",
    label: "API Server",
    def: "Front door of the control plane. Validates and persists every cluster change to etcd.",
    responsibility: "Authn/authz, admission, watch streams, and the single source of truth for cluster state.",
    failure_impact: "No new pods can be created or modified; running workloads continue.",
    commands: ["kubectl get --raw=/healthz", "kubectl get componentstatuses"],
  },
  {
    id: "scheduler",
    label: "kube-scheduler",
    def: "Control-plane component that picks a Node for every unscheduled Pod.",
    responsibility: "Filter nodes (capacity, taints, affinity) then score and bind the Pod to a Node.",
    failure_impact: "Pods stay Pending forever; existing pods keep running.",
    commands: ["kubectl get events --field-selector reason=FailedScheduling", "kubectl describe pod <pod>"],
  },
  {
    id: "kubelet",
    label: "kubelet",
    def: "Node agent that watches the API for pods bound to its node and makes them real.",
    responsibility: "Pull images, talk to the CRI runtime, run probes, report status, post node heartbeats.",
    failure_impact: "Node goes NotReady; pods on it become orphaned and eventually evicted.",
    commands: ["systemctl status kubelet", "journalctl -u kubelet -n 100", "kubectl get nodes"],
  },
  {
    id: "cri",
    label: "containerd (CRI)",
    def: "Container runtime that kubelet calls through the Container Runtime Interface.",
    responsibility: "Pull images, manage container lifecycle, talk to the low-level OCI runtime.",
    failure_impact: "kubelet sees CRI errors, can't start containers, node becomes NotReady.",
    commands: ["crictl ps", "crictl images", "systemctl status containerd"],
  },
  {
    id: "runc",
    label: "runc",
    def: "OCI-compliant runtime that actually creates the Linux namespaces and cgroups for a container.",
    responsibility: "clone() + unshare() + cgroup setup + exec the process. Hands control to the kernel.",
    failure_impact: "Containers fail to start; CRI surfaces RunContainerError.",
    commands: ["runc --version", "runc list"],
  },
  {
    id: "kernel",
    label: "Linux kernel",
    def: "Provides namespaces, cgroups, seccomp, and the actual process execution.",
    responsibility: "Enforce isolation and resource limits, kill OOM victims, audit syscalls.",
    failure_impact: "Pod terminated with 137/OOMKilled or 139/Segfault; cgroup limits hit.",
    commands: ["dmesg --since '5 min ago' | grep -i oom", "journalctl -k -n 50"],
  },
];

// Networking flow used by Service / DNS / Ingress incidents.
const NETWORKING_FLOW: K8sArchNode[] = [
  { id: "client",  label: "Client", def: "External or in-cluster caller (browser, service, pod).", responsibility: "Issue request to a Service DNS name or Ingress host.", failure_impact: "User-visible error: timeout or connection refused.", commands: ["curl -sv http://<host>/"] },
  { id: "ingress", label: "Ingress", def: "L7 router (nginx, traefik, ALB) that maps hostnames + paths to Services.", responsibility: "TLS termination, host/path routing, rate limiting.", failure_impact: "502 / 503 to the client even though pods are healthy.", commands: ["kubectl get ingress -A", "kubectl describe ingress <name>"] },
  { id: "service", label: "Service", def: "Stable virtual IP and DNS name backed by a set of pod endpoints.", responsibility: "Load-balance traffic across pods that match its label selector.", failure_impact: "ClusterIP works but no endpoints → connection refused.", commands: ["kubectl get svc", "kubectl get endpoints <svc>"] },
  { id: "endpoints", label: "EndpointSlice", def: "List of pod IPs+ports that currently back a Service.", responsibility: "Reconciled by the endpoints controller from Service selector + ready pods.", failure_impact: "Empty EndpointSlice when selector mismatches pod labels.", commands: ["kubectl get endpointslice -l kubernetes.io/service-name=<svc>"] },
  { id: "kubeproxy", label: "kube-proxy", def: "Node agent that programs iptables / IPVS rules for Service VIPs.", responsibility: "DNAT ClusterIP → pod IP, maintain conntrack entries.", failure_impact: "Service VIP unreachable from nodes.", commands: ["iptables -t nat -L KUBE-SERVICES -n | head"] },
  { id: "coredns", label: "CoreDNS", def: "Cluster DNS server resolving svc.namespace.svc.cluster.local.", responsibility: "Serve A/AAAA/SRV records for Services and headless pods.", failure_impact: "DNS lookups fail; symptoms look like 'service unreachable'.", commands: ["kubectl -n kube-system get pods -l k8s-app=kube-dns", "kubectl run -it --rm dns --image=busybox -- nslookup kubernetes.default"] },
  { id: "pod", label: "Pod", def: "The workload actually serving the request.", responsibility: "Accept connections, return response.", failure_impact: "Readiness false → pod removed from endpoints → 503.", commands: ["kubectl logs <pod>", "kubectl exec -it <pod> -- curl localhost:<port>/healthz"] },
];

// Shared interactive tool cards. We pick the right subset per incident.
const TOOL_KUBECTL: K8sToolCard = {
  name: "kubectl",
  category: "cli",
  definition: "Primary CLI for the Kubernetes API server. Every troubleshooting workflow starts here.",
  why_engineers_use_it: "Read state (get/describe/logs), mutate state (apply/patch/delete), and shell in (exec).",
  beginner_view: "Think of kubectl as 'docker ps + docker logs + docker exec', but for a whole cluster.",
  advanced_view: "Client-side YAML → REST call → API admission → etcd. --v=8 reveals every HTTP round-trip.",
  commands: [
    { cmd: "kubectl get pods -A -o wide", expected: "NAMESPACE   NAME          READY   STATUS    RESTARTS   AGE   IP          NODE" },
    { cmd: "kubectl describe pod <pod>",  expected: "Events:\n  Warning  FailedScheduling  ...  0/3 nodes available: 3 Insufficient memory" },
    { cmd: "kubectl logs <pod> --previous", expected: "Error: connection refused to redis:6379 — exiting" },
    { cmd: "kubectl exec -it <pod> -- sh",  expected: "/ # " },
  ],
  enterprise_usage: "Wrapped by every CI/CD pipeline, every on-call runbook, every k9s/Lens session.",
  related_incidents: ["K8S-INC-3001", "K8S-INC-3002", "K8S-INC-3003"],
};

const TOOL_KUBELET: K8sToolCard = {
  name: "kubelet",
  category: "runtime",
  definition: "Per-node agent that turns Pod specs into running containers and posts the Node's heartbeat.",
  why_engineers_use_it: "Read its logs whenever a Node is NotReady or pods never reach Running.",
  beginner_view: "kubelet is the worker on each server that actually starts your containers.",
  advanced_view: "Watches PodSpecs via the API, drives CRI (containerd/cri-o), runs probes, manages eviction, posts NodeStatus every 10s.",
  commands: [
    { cmd: "systemctl status kubelet", expected: "Active: active (running) since ...  Memory: 128.4M" },
    { cmd: "journalctl -u kubelet -n 50 --no-pager", expected: "kubelet[1842]: E PLEG: skipping pod sync, container runtime not ready" },
    { cmd: "curl -sk https://localhost:10250/healthz", expected: "ok" },
  ],
  enterprise_usage: "First place SREs look during a Node NotReady incident.",
  related_incidents: ["K8S-INC-3004", "K8S-INC-3005"],
};

const TOOL_SCHEDULER: K8sToolCard = {
  name: "kube-scheduler",
  category: "control_plane",
  definition: "Control-plane component that picks the Node for every unscheduled Pod.",
  why_engineers_use_it: "Explains why a Pod is Pending — events tell you exactly which constraints failed.",
  beginner_view: "The scheduler is the matchmaker between Pods and Nodes.",
  advanced_view: "Two phases: Filter (predicates: capacity, taints, affinity, topology) then Score. Configurable via SchedulerProfile.",
  commands: [
    { cmd: "kubectl get events --field-selector reason=FailedScheduling -A", expected: "0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint" },
    { cmd: "kubectl get pod <pod> -o yaml | grep -A2 nodeSelector", expected: "nodeSelector:\n  workload: gpu" },
    { cmd: "kubectl describe node <node> | grep -A3 Allocatable", expected: "Allocatable:\n  cpu: 3800m\n  memory: 7.2Gi" },
  ],
  enterprise_usage: "Tuned via priority classes, pod topology spread, and custom scheduler plugins on large clusters.",
  related_incidents: ["K8S-INC-3001"],
};

const TOOL_CONTAINERD: K8sToolCard = {
  name: "containerd",
  category: "runtime",
  definition: "Industry-standard CRI runtime — pulls images and runs containers via runc.",
  why_engineers_use_it: "When kubelet can't start a container, containerd logs/crictl tell you why.",
  beginner_view: "containerd does what Docker Engine used to do — actually start containers.",
  advanced_view: "Exposes CRI gRPC on /run/containerd/containerd.sock. Snapshotter manages overlay layers; shims wrap runc per-container.",
  commands: [
    { cmd: "systemctl status containerd", expected: "Active: active (running)" },
    { cmd: "crictl ps", expected: "CONTAINER ID  IMAGE  CREATED  STATE  NAME\nabc...  nginx:1.25  2m  Running  web" },
    { cmd: "journalctl -u containerd -n 30", expected: "containerd[1842]: panic: failed to open snapshotter: no space left on device" },
  ],
  enterprise_usage: "Default CRI in EKS, AKS, GKE since Dockershim removal (k8s 1.24).",
  related_incidents: ["K8S-INC-3005"],
};

const TOOL_CRICTL: K8sToolCard = {
  name: "crictl",
  category: "cli",
  definition: "CRI-level CLI for talking directly to containerd / cri-o, bypassing kubelet.",
  why_engineers_use_it: "When the API server or kubelet is broken, crictl is how you see what's actually running on the node.",
  beginner_view: "Like 'docker ps' but for the runtime Kubernetes uses underneath.",
  advanced_view: "Reads /etc/crictl.yaml to find the runtime endpoint; ps/pods/inspect/logs map 1:1 onto CRI gRPC calls.",
  commands: [
    { cmd: "crictl ps -a", expected: "CONTAINER ID  IMAGE       STATE   NAME\nabc...        nginx:1.25  Exited  web" },
    { cmd: "crictl logs <containerId>", expected: "2024-05-20T08:01:14 starting nginx 1.25..." },
    { cmd: "crictl inspect <containerId> | jq .status.exitCode", expected: "137" },
  ],
  enterprise_usage: "Mandatory tool on dockershim-free clusters; ships in every kubeadm node image.",
  related_incidents: ["K8S-INC-3002", "K8S-INC-3005"],
};

const TOOL_COREDNS: K8sToolCard = {
  name: "CoreDNS",
  category: "networking",
  definition: "Cluster DNS server resolving Service names like web.default.svc.cluster.local.",
  why_engineers_use_it: "When pods can hit IPs but not names, CoreDNS is broken or its Corefile is wrong.",
  beginner_view: "CoreDNS is the phone book of the cluster — it turns service names into IPs.",
  advanced_view: "Plugin chain in Corefile; kubernetes plugin watches Services/EndpointSlices via the API.",
  commands: [
    { cmd: "kubectl -n kube-system get pods -l k8s-app=kube-dns", expected: "coredns-5d6...  2/2  Running" },
    { cmd: "kubectl run -it --rm dns --image=busybox -- nslookup kubernetes.default", expected: "Server: 10.96.0.10\nName: kubernetes.default.svc.cluster.local\nAddress: 10.96.0.1" },
    { cmd: "kubectl -n kube-system logs deploy/coredns --tail=20", expected: "[ERROR] plugin/errors: 2 web.default.svc.cluster.local. A: read udp i/o timeout" },
  ],
  enterprise_usage: "Scaled with HPA on large clusters; NodeLocal DNSCache mitigates conntrack pressure.",
  related_incidents: ["K8S-INC-3008"],
};

const TOOL_PROMETHEUS: K8sToolCard = {
  name: "Prometheus",
  category: "observability",
  definition: "Pull-based metrics database — scrapes /metrics on every pod and stores time series.",
  why_engineers_use_it: "Confirm an incident is real with hard numbers; alerting rules page on-call.",
  beginner_view: "Prometheus is the cluster's heartbeat monitor.",
  advanced_view: "PromQL evaluates over TSDB; alertmanager handles routing/silencing. kube-state-metrics is the standard exporter for K8s objects.",
  commands: [
    { cmd: "promtool query instant http://prom:9090 'kube_pod_status_phase{phase=\"Pending\"}'", expected: "{pod=\"orders-7f...\"}  1" },
    { cmd: "kubectl -n monitoring port-forward svc/prometheus 9090", expected: "Forwarding from 127.0.0.1:9090 -> 9090" },
  ],
  enterprise_usage: "De-facto K8s metrics stack; powers Grafana dashboards and SLO burn-rate alerts.",
  related_incidents: ["K8S-INC-3001", "K8S-INC-3006"],
};

const TOOL_JOURNALCTL: K8sToolCard = {
  name: "journalctl",
  category: "observability",
  definition: "systemd-journal reader — the canonical log source for kubelet, containerd, and the kernel.",
  why_engineers_use_it: "Reach the truth when pod logs are empty (container never started, OOM, runtime panic).",
  beginner_view: "journalctl shows the system's diary — what every daemon and the kernel said.",
  advanced_view: "Filter by unit (-u), kernel (-k), time (--since), and priority (-p err). Pair with jq via -o json.",
  commands: [
    { cmd: "journalctl -u kubelet --since '10 min ago' --no-pager", expected: "kubelet[1842]: E PLEG: skipping pod sync, container runtime not ready" },
    { cmd: "journalctl -k --since '2 min ago' | grep -i oom", expected: "kernel: Memory cgroup out of memory: Killed process 18342 (python)" },
  ],
  enterprise_usage: "Shipped to Loki / Elastic / CloudWatch on every production node.",
  related_incidents: ["K8S-INC-3004", "K8S-INC-3006"],
};

// --------- Convenience builder ---------
type M3In = Omit<K8sIncident, "module" | "module_title" | "cves" | "phase_walkthrough"> & {
  k8s_concept: K8sConcept;
};

const mk = (x: M3In): K8sIncidentWithConcept => ({
  module: "K8S-M3",
  module_title: "M3 · Kubernetes Fundamentals & Pod Architecture",
  ...x,
});

// =============================================================================
// CATEGORY 1 — POD FUNDAMENTALS
// =============================================================================

const INC_3001 = mk({
  id: "K8S-INC-3001",
  title: "Pending Pod — scheduler reports insufficient memory (M3-INC-301)",
  severity: "high",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "orders",
  service: "orders-api",
  detected_at: iso(12),
  last_event_at: iso(1),
  failure_chain: "Deploy → Schedule",
  current_phase: "schedule",
  failed_phases: ["schedule"],
  briefing: {
    who: "orders-api Deployment — 2 new replicas stuck Pending.",
    what: "kube-scheduler cannot place pods: 0/11 nodes available, 9 Insufficient memory, 2 NotReady.",
    where: "Cluster prod-use1, namespace orders, node group ng-app-prod.",
    when: `${iso(12)} — first FailedScheduling event 12 min ago, retried every 30s.`,
    why: "Pod memory.requests (4Gi) exceeds allocatable on every Ready node; autoscaler is at max-nodes.",
    how: "kubectl describe pod → Events show FailedScheduling with per-node reasons.",
    severity_rationale: "HIGH — existing replicas absorb load but autoscale events will fail; one node loss = outage.",
  },
  description: "Two orders-api pods cannot be scheduled. The scheduler emits FailedScheduling events that list the exact predicate that failed on every candidate node.",
  original_event: `Events:
  Type     Reason             Age   From               Message
  ----     ------             ----  ----               -------
  Warning  FailedScheduling   12m   default-scheduler  0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint {node.kubernetes.io/not-ready: }
  Warning  FailedScheduling   30s   default-scheduler  0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint`,
  affected: [
    { kind: "Pod", name: "orders-api-7d4f-xkqz2", detail: "Pending · 0 nodes available", action: "Lower requests or scale up nodes.", severity: "high" },
    { kind: "Deployment", name: "orders-api", detail: "desired=4 · ready=2", action: "kubectl edit deploy/orders-api → reduce resources.requests.memory.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus", "Grafana"],
  data_sources: ["kube-scheduler", "kube-apiserver", "prom"],
  logs_sample: `kube-scheduler: pod orders/orders-api-7d4f-xkqz2 unscheduled: 0/11 nodes available
cluster-autoscaler: max node group size reached (12/12) for ng-app-prod
kube-apiserver: PATCH /api/v1/namespaces/orders/events/orders-api-7d4f-xkqz2 200`,
  metrics_sample: `kube_pod_status_phase{phase="Pending"}            2
kube_node_status_allocatable_memory_bytes (max)  7.2Gi
kube_pod_resource_requests{resource="memory"}    4.0Gi`,
  response_actions: ["Lower memory.requests", "Raise autoscaler max-nodes", "Cordon offending workload", "Open in Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl describe pod orders-api-7d4f-xkqz2 — read the FailedScheduling event verbatim." },
    { level: "L2", text: "Reduce resources.requests.memory from 4Gi → 2Gi if the workload genuinely fits." },
    { level: "L3", text: "Raise cluster-autoscaler max-nodes for ng-app-prod or add a higher-memory node group." },
  ],
  learning: {
    concept: "Pod requests vs node allocatable",
    meaning: "Scheduler runs predicates per node. 'Insufficient memory' = pod.requests.memory > node.allocatable.memory minus what other pods already requested.",
    enterprise_impact: "Over-provisioned requests silently waste 30-50% of cluster spend and block autoscale during incidents.",
    fresher_view: "Kubernetes won't pack a pod onto a node unless the requested resources literally fit. Fix: ask for less, or add more nodes.",
    engineer_view: "Scheduler scores after filter; even one failing predicate eliminates the node. Tune requests against actual usage (kubectl top, VPA recommender).",
    commands_bash: [
      "kubectl get events --field-selector reason=FailedScheduling -A --sort-by=.lastTimestamp",
      "kubectl describe node | grep -A6 Allocated",
      "kubectl top pod -n orders --containers",
    ],
    commands_powershell: [
      "kubectl get events --field-selector reason=FailedScheduling -A",
      "kubectl describe node",
    ],
    recovery: [
      "Right-size pod requests against p95 of actual usage.",
      "Enable VPA in recommend-only mode for the workload.",
      "Add headroom in the node group or use larger instance types.",
    ],
  },
  k8s_concept: {
    concept: "kube-scheduler",
    definition: "Control-plane component that selects a Node for every unscheduled Pod by filtering and scoring.",
    why_it_exists: "Clusters span tens to thousands of nodes — humans cannot pick placement; the scheduler does it 100×/sec.",
    enterprise_impact: "Bad requests / tight quotas → Pending pods → failed deploys, missed SLOs, paged on-call.",
    beginner: "Kubernetes is trying to find a server with enough free memory for your app. Right now nothing fits.",
    engineer: "Scheduler rejected all candidate nodes because pod.requests.memory exceeded allocatable on every Ready node and the only candidates left were tainted NotReady.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "scheduler",
    tools: [TOOL_KUBECTL, TOOL_SCHEDULER, TOOL_PROMETHEUS],
    learn_more: [
      { question: "What is a Pod?", answer: "Smallest deployable unit in Kubernetes — one or more containers sharing network and storage namespaces, scheduled together as a unit." },
      { question: "What does the scheduler actually do?", answer: "Two phases: Filter (drop nodes that violate predicates: capacity, taints, affinity, topology) then Score (rank survivors, bind Pod to top node via the API server)." },
      { question: "What is 'allocatable' on a node?", answer: "Capacity minus reservations for the kubelet, OS, and eviction headroom. It's the real ceiling the scheduler sees." },
      { question: "Why do I see 'untolerated taint'?", answer: "Taints repel pods unless those pods carry a matching toleration. Used to isolate GPU nodes, NotReady nodes, etc." },
    ],
  },
});

const INC_3002 = mk({
  id: "K8S-INC-3002",
  title: "CrashLoopBackOff — pod crashes on startup, kubelet backs off (M3-INC-302)",
  severity: "critical",
  status: "open",
  owner: "checkout-team",
  cluster: "prod-use1",
  namespace: "checkout",
  service: "checkout-svc",
  detected_at: iso(6),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "checkout-svc Deployment v3.2.1 — all 3 replicas in CrashLoopBackOff.",
    what: "Container exits within 4s of start; kubelet restarts with exponential backoff (now 5m between retries).",
    where: "prod-use1, namespace checkout.",
    when: `${iso(6)} — restarted 11 times in 6 minutes.`,
    why: "Container reads DATABASE_URL from a Secret that no longer exists in the namespace.",
    how: "kubectl logs --previous shows 'panic: dial tcp: lookup db.checkout.svc.cluster.local: no such host'.",
    severity_rationale: "CRITICAL — checkout is down; revenue impact is direct.",
  },
  description: "Pod lifecycle: kubelet starts the container, app panics on missing env, container exits non-zero, kubelet records the failure and starts the CrashLoopBackOff backoff timer.",
  original_event: `NAME                  READY  STATUS             RESTARTS   AGE
checkout-svc-7f-...   0/1    CrashLoopBackOff   11 (44s ago)  6m
Events:
  Warning  BackOff   30s  kubelet  Back-off restarting failed container
  Normal   Pulled    1m   kubelet  Successfully pulled image "ghcr.io/acme/checkout:3.2.1"
  Warning  Failed    1m   kubelet  Error: container exited with code 1`,
  affected: [
    { kind: "Pod", name: "checkout-svc-7f-xkqz2", detail: "CrashLoopBackOff · restarts=11", action: "Read previous logs, fix env, redeploy.", severity: "critical" },
  ],
  aligned_tools: ["kubectl", "crictl", "Prometheus", "Grafana"],
  data_sources: ["kubelet", "cri", "prom"],
  logs_sample: `checkout-svc: panic: dial tcp: lookup db.checkout.svc.cluster.local on 10.96.0.10:53: no such host
checkout-svc: goroutine 1 [running]: main.main() /src/main.go:42
kubelet: Container checkout-svc exited with code 1
kubelet: Back-off 5m restarting failed container`,
  metrics_sample: `kube_pod_container_status_restarts_total{pod=~"checkout-svc.*"}  11
kube_pod_container_status_waiting_reason{reason="CrashLoopBackOff"}  3
checkout_http_requests_per_min   0`,
  response_actions: ["Read --previous logs", "Restore Secret", "kubectl rollout undo", "Suspend deployment"],
  next_steps: [
    { level: "L1", text: "kubectl logs <pod> --previous — read the panic message." },
    { level: "L2", text: "kubectl get secret db-credentials -n checkout — confirm secret exists and key names match envFrom." },
    { level: "L3", text: "kubectl rollout undo deploy/checkout-svc -n checkout to revert to v3.2.0 while you fix forward." },
  ],
  k8s_concept: {
    concept: "Pod lifecycle & restartPolicy",
    definition: "kubelet drives every pod through phases: Pending → ContainerCreating → Running, and on failure: Terminated → Restart (per restartPolicy) with exponential backoff.",
    why_it_exists: "Crashes are inevitable; backoff prevents a sick pod from saturating the node with restart traffic.",
    enterprise_impact: "Unbounded restarts mask real bugs and inflate CPU; bounded backoff alerts on-call quickly.",
    beginner: "The container starts, fails, restarts, fails again — Kubernetes waits longer between each retry so it doesn't make things worse.",
    engineer: "kubelet records the exit, computes 10s · 2^n backoff (cap 5m), and only schedules the next container start when the timer elapses. CrashLoopBackOff is a *waiting reason*, not a phase.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBECTL, TOOL_KUBELET, TOOL_CRICTL],
    learn_more: [
      { question: "What is restartPolicy?", answer: "Pod-level setting: Always (default for Deployments), OnFailure (Jobs), Never (debug pods). kubelet honours it per container." },
      { question: "Why does the backoff cap at 5 minutes?", answer: "kubelet uses exponential backoff (10s × 2^n) but caps at 300s so a fixed pod recovers within at most 5 minutes after the fix lands." },
      { question: "How is CrashLoopBackOff different from Error?", answer: "Error = the container has stopped. CrashLoopBackOff = it has stopped *repeatedly* and kubelet is now waiting before the next attempt." },
    ],
  },
});

const INC_3003 = mk({
  id: "K8S-INC-3003",
  title: "ImagePullBackOff — kubelet cannot pull from private registry (M3-INC-303)",
  severity: "high",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "prod-euw1",
  namespace: "payments",
  service: "fraud-engine",
  detected_at: iso(9),
  last_event_at: iso(1),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "fraud-engine Deployment — 3/3 new pods stuck ImagePullBackOff.",
    what: "kubelet → containerd → registry returned 401 unauthorized.",
    where: "prod-euw1, namespace payments, registry ghcr.io.",
    when: `${iso(9)} — kicked off by rotated PAT.`,
    why: "imagePullSecret 'ghcr-pull' was rotated in the cluster vault but not synced to the payments namespace.",
    how: "Events: Failed to pull image 'ghcr.io/acme/fraud:2.4.0': 401 Unauthorized.",
    severity_rationale: "HIGH — running pods still serve traffic; autoscale event would fail.",
  },
  description: "ImagePullBackOff is the chain of: kubelet asks the CRI runtime to pull → runtime authenticates with the registry using the pod's imagePullSecret → registry says no → kubelet backs off.",
  original_event: `Events:
  Warning  Failed    7m  kubelet  Failed to pull image "ghcr.io/acme/fraud:2.4.0": rpc error: code = Unknown desc = failed to resolve reference: unexpected status: 401 Unauthorized
  Warning  Failed    7m  kubelet  Error: ErrImagePull
  Normal   BackOff   1m  kubelet  Back-off pulling image "ghcr.io/acme/fraud:2.4.0"
  Warning  Failed    1m  kubelet  Error: ImagePullBackOff`,
  affected: [
    { kind: "Pod", name: "fraud-engine-7c-xkqz2", detail: "ImagePullBackOff", action: "Re-apply imagePullSecret, then delete pod.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "containerd", "crictl", "journalctl"],
  data_sources: ["kubelet", "cri", "ghcr"],
  logs_sample: `kubelet: E pod="payments/fraud-engine-7c-xkqz2" image="ghcr.io/acme/fraud:2.4.0" status=401
containerd: failed to resolve reference: unexpected status: 401 Unauthorized
crictl pull ghcr.io/acme/fraud:2.4.0 → FATA[0001] pulling image: 401 Unauthorized`,
  metrics_sample: `kube_pod_container_status_waiting_reason{reason="ImagePullBackOff"}  3
container_image_pull_errors_total{reason="401"}  17`,
  response_actions: ["Recreate ghcr-pull secret", "Delete failing pods", "Rotate token in GHCR"],
  next_steps: [
    { level: "L1", text: "kubectl -n payments get secret ghcr-pull -o yaml — decode and verify auth string." },
    { level: "L2", text: "kubectl -n payments create secret docker-registry ghcr-pull --docker-server=ghcr.io ... --dry-run=client -o yaml | kubectl apply -f -" },
    { level: "L3", text: "Sync via External Secrets Operator so future PAT rotations propagate automatically." },
  ],
  k8s_concept: {
    concept: "Image pull lifecycle & imagePullSecrets",
    definition: "kubelet delegates image pulls to the CRI runtime; the runtime sends the pod's imagePullSecret as a docker-style auth header.",
    why_it_exists: "Private registries need credentials; secret-per-pod scoping limits blast radius.",
    enterprise_impact: "Expired PATs are the #1 cause of failed deploys after weekend on-call shifts.",
    beginner: "Kubernetes is asking the registry for the image, and the registry is saying 'who are you?'",
    engineer: "Auth header derived from the named imagePullSecret; 401 means the credential is wrong or expired, 404 means the tag/repo doesn't exist, 429 means rate-limited.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "cri",
    tools: [TOOL_KUBECTL, TOOL_CONTAINERD, TOOL_CRICTL],
    learn_more: [
      { question: "ErrImagePull vs ImagePullBackOff?", answer: "ErrImagePull = the most recent attempt failed. ImagePullBackOff = kubelet has now backed off and is waiting before retrying." },
      { question: "How does imagePullPolicy interact?", answer: "Always = pull every start (defaults for :latest). IfNotPresent = pull only if missing locally. Never = use only the cached image." },
    ],
  },
});

// =============================================================================
// CATEGORY 2 — NODE & RUNTIME
// =============================================================================

const INC_3004 = mk({
  id: "K8S-INC-3004",
  title: "Node NotReady — kubelet stopped posting heartbeats (M3-INC-304)",
  severity: "critical",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "platform",
  service: "ip-10-4-12-7",
  detected_at: iso(4),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "Worker node ip-10-4-12-7 hosting 17 pods.",
    what: "Node condition Ready=False; kubelet has not posted status in 90s.",
    where: "prod-use1, node group ng-app-prod.",
    when: `${iso(4)} — flipped NotReady 4 min ago.`,
    why: "kubelet process is alive but PLEG (Pod Lifecycle Event Generator) is stuck because containerd is unresponsive.",
    how: "journalctl shows 'PLEG: skipping pod sync, container runtime not ready'.",
    severity_rationale: "CRITICAL — pods on this node will be evicted in 5 min; capacity drops on a busy cluster.",
  },
  description: "Node Ready depends on kubelet posting a heartbeat that includes a healthy PLEG state. If the container runtime hangs, PLEG stalls, kubelet stops heart-beating, and node-controller marks the node NotReady.",
  original_event: `NAME            STATUS     ROLES    AGE   VERSION
ip-10-4-12-7    NotReady   <none>   13d   v1.29.2
Conditions:
  Type            Status  Reason                       Message
  Ready           False   KubeletNotReady              PLEG is not healthy: pleg was last seen active 4m ago`,
  affected: [
    { kind: "Node", name: "ip-10-4-12-7", detail: "NotReady · 17 pods", action: "Restart containerd + kubelet; if no recovery, drain and replace.", severity: "critical" },
  ],
  aligned_tools: ["kubectl", "containerd", "crictl", "journalctl"],
  data_sources: ["kubelet", "containerd", "node-controller"],
  logs_sample: `kubelet[1842]: E PLEG: skipping pod sync, container runtime not ready: container runtime status check may not have completed yet
kubelet[1842]: I Skipping kubelet status update; PLEG not healthy
node-controller: Marking node ip-10-4-12-7 NotReady (Ready=False, KubeletNotReady)`,
  metrics_sample: `kube_node_status_condition{condition="Ready",status="false"}  1
kubelet_pleg_last_seen_seconds                                240
kubelet_running_pods                                          17`,
  response_actions: ["Restart containerd", "Restart kubelet", "Drain node", "Replace node"],
  next_steps: [
    { level: "L1", text: "ssh ip-10-4-12-7 && journalctl -u kubelet -n 100 — confirm PLEG stall." },
    { level: "L2", text: "systemctl restart containerd && systemctl restart kubelet (in that order)." },
    { level: "L3", text: "If recurrence > 1× per week, replace the node and open a bug against the runtime version." },
  ],
  k8s_concept: {
    concept: "Node heartbeats & PLEG",
    definition: "kubelet posts NodeStatus every 10s; the node-controller flips NotReady if no heartbeat arrives in 40s.",
    why_it_exists: "Cluster needs a fast, reliable signal to evict pods off broken nodes.",
    enterprise_impact: "Heartbeat storms (10k+ nodes) drove the move to NodeLease in Kubernetes 1.14 — without it, etcd dies.",
    beginner: "The node has stopped checking in. Kubernetes assumes it's broken and will move its work elsewhere soon.",
    engineer: "kubelet → PLEG → CRI runtime. If CRI hangs, PLEG stalls, kubelet refuses to post Ready=True, node-controller observes the absence and flips Ready=False after the 40s grace.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBELET, TOOL_CONTAINERD, TOOL_JOURNALCTL],
    learn_more: [
      { question: "What is PLEG?", answer: "Pod Lifecycle Event Generator — kubelet's loop that polls the runtime for pod state changes. If it stalls, kubelet treats itself as unhealthy." },
      { question: "When are pods evicted from a NotReady node?", answer: "Default tolerationSeconds for not-ready/unreachable is 300s. After 5 minutes, the eviction controller deletes pods so they reschedule elsewhere." },
    ],
  },
});

const INC_3005 = mk({
  id: "K8S-INC-3005",
  title: "containerd runtime crash — node loses every container (M3-INC-305)",
  severity: "critical",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "stg-use1",
  namespace: "platform",
  service: "ip-10-3-21-44",
  detected_at: iso(7),
  last_event_at: iso(2),
  failure_chain: "Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "containerd on ip-10-3-21-44 panicked and exited.",
    what: "Every container on the node terminated; kubelet reports CRI socket connection refused.",
    where: "stg-use1, namespace platform.",
    when: `${iso(7)} — panic 7 min ago, restarted twice.`,
    why: "Snapshotter ENOSPC — /var/lib/containerd disk filled with dangling image layers.",
    how: "journalctl -u containerd shows 'panic: failed to open snapshotter: no space left on device'.",
    severity_rationale: "CRITICAL — node effectively offline; restart loop until disk reclaimed.",
  },
  description: "kubelet talks to containerd through the CRI gRPC socket. When containerd dies, kubelet sees connection refused, marks itself NotReady, and all pods on the node are torn down.",
  original_event: `containerd[1842]: panic: failed to open snapshotter: no space left on device
systemd: containerd.service: Main process exited, code=exited, status=1/FAILURE
kubelet: GetContainerStatuses: rpc error: code = Unavailable desc = connection refused
crictl ps → FATA[0000] connect endpoint 'unix:///run/containerd/containerd.sock': connection refused`,
  affected: [
    { kind: "Node", name: "ip-10-3-21-44", detail: "containerd dead", action: "Free disk, restart containerd, then kubelet.", severity: "critical" },
  ],
  aligned_tools: ["containerd", "crictl", "kubectl", "journalctl"],
  data_sources: ["containerd", "kubelet", "systemd"],
  logs_sample: `containerd[1842]: panic: failed to open snapshotter: no space left on device
containerd[1842]: goroutine 1 [running]: github.com/containerd/containerd/snapshots/overlay.NewSnapshotter
kubelet: PLEG: container runtime is down`,
  metrics_sample: `node_filesystem_avail_bytes{mountpoint="/var/lib/containerd"}  0
container_runtime_crashes_total                                2`,
  response_actions: ["Free overlay disk", "Restart containerd", "Restart kubelet", "Replace node"],
  next_steps: [
    { level: "L1", text: "df -h /var/lib/containerd — confirm 100% used." },
    { level: "L2", text: "crictl rmi --prune to reclaim dangling images, then systemctl restart containerd kubelet." },
    { level: "L3", text: "Add a /var/lib/containerd disk-usage alert at 80% to prevent recurrence." },
  ],
  k8s_concept: {
    concept: "CRI runtime hierarchy: kubelet → containerd → runc → kernel",
    definition: "Kubernetes containers exist in a 4-layer stack. kubelet drives containerd via CRI gRPC, containerd shells out to runc, runc asks the kernel to create namespaces + cgroups.",
    why_it_exists: "Layered design lets each layer be swapped: dockershim removal, switching from runc to crun, plugging in Kata for VM-isolation.",
    enterprise_impact: "A bug in any layer takes down workloads. Most production outages bottom out at containerd or the kernel.",
    beginner: "The thing that actually starts containers (containerd) died, so all the containers on this server died with it.",
    engineer: "containerd's overlay snapshotter ran out of inodes/space, failed to open, panicked. kubelet→CRI socket returned connection refused, pod statuses became stale, node controller began eviction.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "cri",
    tools: [TOOL_CONTAINERD, TOOL_CRICTL, TOOL_JOURNALCTL],
    learn_more: [
      { question: "What is CRI?", answer: "Container Runtime Interface — gRPC API that kubelet uses to talk to any compliant runtime. Replaced the old Docker shim." },
      { question: "Why is runc separate from containerd?", answer: "runc implements the OCI runtime spec — just the per-container namespace+cgroup setup. containerd handles images, networking plugins, snapshots." },
      { question: "What does the kernel actually do?", answer: "Sets up namespaces (PID/NET/MNT/UTS/IPC/USER), applies cgroup limits, runs seccomp filters, then exec()s your binary." },
    ],
  },
});

const INC_3006 = mk({
  id: "K8S-INC-3006",
  title: "OOMKilled pod — container exceeded memory limit (M3-INC-306)",
  severity: "high",
  status: "in_progress",
  owner: "search-team",
  cluster: "prod-use1",
  namespace: "search",
  service: "search-api",
  detected_at: iso(11),
  last_event_at: iso(1),
  failure_chain: "Run → Observe",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "search-api Deployment — pod restarting with reason OOMKilled.",
    what: "JVM workload steadily climbs to memory.limit=512Mi, kernel oom-killer fires, kubelet records exit code 137.",
    where: "prod-use1, namespace search.",
    when: `${iso(11)} — 11 OOMKills in last 30 min.`,
    why: "JVM -Xmx=512m equals the cgroup limit; no headroom for Metaspace + native threads.",
    how: "dmesg: 'Memory cgroup out of memory: Killed process 18342 (java)'.",
    severity_rationale: "HIGH — p99 latency tripled; queue depth growing.",
  },
  description: "Linux kernel enforces memory.limits via cgroup memory.max. When a process exceeds it, the kernel OOM-killer terminates a victim in that cgroup. Kubernetes surfaces this as exit code 137 (= 128 + SIGKILL).",
  original_event: `kubectl describe pod search-api-7f-xkqz2
  Last State:     Terminated
    Reason:       OOMKilled
    Exit Code:    137
    Started:      ...
    Finished:     ...
  Restart Count:  11`,
  affected: [
    { kind: "Pod", name: "search-api-7f-xkqz2", detail: "OOMKilled · restarts=11", action: "Raise limit OR lower -Xmx.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "journalctl", "Prometheus", "Grafana"],
  data_sources: ["kubelet", "cgroup", "prom"],
  logs_sample: `kernel: Memory cgroup out of memory: Killed process 18342 (java) total-vm:1.2GB
kubelet: Container search-api in pod search-api-7f exited (137) reason=OOMKilled
search-api: <no app logs — process was SIGKILLed>`,
  metrics_sample: `container_memory_working_set_bytes{pod=~"search-api.*"}  peak=509Mi
container_oom_events_total{pod=~"search-api.*"}        11
container_spec_memory_limit_bytes                       512Mi`,
  response_actions: ["Raise memory.limit", "Lower JVM -Xmx", "Enable VPA", "Open Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl set resources deploy/search-api -c search-api --limits=memory=1Gi." },
    { level: "L2", text: "Patch JVM args: -Xmx=75% of limit, -XX:MaxRAMPercentage=75." },
    { level: "L3", text: "Enable VPA recommend-mode, hold for 1 week, then auto." },
  ],
  k8s_concept: {
    concept: "cgroups v2 memory.max & OOMKill",
    definition: "Kubernetes maps resources.limits.memory to the Linux cgroup memory.max. The kernel OOM-killer enforces it.",
    why_it_exists: "Limits provide isolation: one noisy pod can't starve its neighbours.",
    enterprise_impact: "Setting limit ≈ JVM heap is the #1 cause of mystery 137 exits in production.",
    beginner: "The container used more memory than it was allowed. Linux killed it on the spot.",
    engineer: "Kernel cgroup memory.max enforced; oom-killer selected the highest-RSS process; pod exit code 137 (SIGKILL). kubelet records Reason=OOMKilled and restarts per restartPolicy.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "kernel",
    tools: [TOOL_KUBECTL, TOOL_JOURNALCTL, TOOL_PROMETHEUS],
    learn_more: [
      { question: "What is the difference between requests and limits?", answer: "Requests = what the scheduler reserves. Limits = the kernel-enforced ceiling. Pod QoS class is derived from how they compare." },
      { question: "Why exit code 137?", answer: "137 = 128 + 9. Linux convention: 128 + signal number. SIGKILL is signal 9." },
      { question: "What is the QoS class?", answer: "Guaranteed (requests==limits on all containers), Burstable (some set), BestEffort (none set). Lower QoS pods are evicted first under pressure." },
    ],
  },
});

// =============================================================================
// CATEGORY 3 — NETWORKING
// =============================================================================

const INC_3007 = mk({
  id: "K8S-INC-3007",
  title: "Service unreachable — selector mismatch leaves zero endpoints (M3-INC-307)",
  severity: "high",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "stg-use1",
  namespace: "qa",
  service: "billing-api",
  detected_at: iso(20),
  last_event_at: iso(3),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "billing-api Service (ClusterIP).",
    what: "Service exists, ClusterIP is allocated, but EndpointSlice is empty → callers get connection refused.",
    where: "stg-use1, namespace qa.",
    when: `${iso(20)} — after a manifest refactor.`,
    why: "Service selector app=billing does not match new pod labels app=billing-api.",
    how: "kubectl get endpoints billing-api → <none>.",
    severity_rationale: "HIGH (staging) — release blocked, integration tests red.",
  },
  description: "A Service is a stable virtual IP + DNS name. The endpoints controller continuously reconciles its EndpointSlice from pods whose labels match the Service's selector. Mismatched labels = empty slice = no backends.",
  original_event: `$ kubectl get svc billing-api -n qa
NAME          TYPE        CLUSTER-IP      PORT(S)   AGE
billing-api   ClusterIP   10.96.142.31    8080/TCP  14h
$ kubectl get endpoints billing-api -n qa
NAME          ENDPOINTS   AGE
billing-api   <none>      14h
$ kubectl get pods -n qa -l app=billing
No resources found.`,
  affected: [
    { kind: "Service", name: "billing-api", detail: "0 endpoints", action: "Fix selector OR pod labels.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus"],
  data_sources: ["kube-apiserver", "endpoints-controller"],
  logs_sample: `endpoints-controller: Service qa/billing-api selector matched 0 pods
ingress-nginx: 502 upstream connect error or disconnect/reset before headers (no endpoints)`,
  metrics_sample: `kube_endpoint_address_available{endpoint="billing-api"}  0
http_502_total{service="billing-api"}                     417`,
  response_actions: ["Fix selector", "Re-apply manifest", "Test from cluster"],
  next_steps: [
    { level: "L1", text: "kubectl get pods -n qa --show-labels — confirm actual pod labels." },
    { level: "L2", text: "kubectl patch svc billing-api -n qa -p '{\"spec\":{\"selector\":{\"app\":\"billing-api\"}}}'." },
    { level: "L3", text: "Add a CI rule that fails the PR when a Service selector matches zero pods in the rendered manifests." },
  ],
  k8s_concept: {
    concept: "Service → EndpointSlice → kube-proxy",
    definition: "Services are an abstraction. The endpoints controller writes pod IPs into EndpointSlices; kube-proxy programs iptables/IPVS rules on every node to DNAT the ClusterIP to a backend pod.",
    why_it_exists: "Pod IPs come and go. Services give callers a stable target while the cluster shuffles backends.",
    enterprise_impact: "Selector typos are the most common cause of '502 upstream' incidents post-deploy.",
    beginner: "The phone number for billing exists, but nobody is at the other end of the line.",
    engineer: "Service selector evaluates to zero matching pods → endpoints controller produces an empty EndpointSlice → kube-proxy installs no DNAT rules → ClusterIP returns ICMP unreachable / TCP RST.",
    architecture_flow: NETWORKING_FLOW,
    failure_stage_id: "endpoints",
    tools: [TOOL_KUBECTL, TOOL_COREDNS],
    learn_more: [
      { question: "What is a Service?", answer: "Stable virtual IP and DNS name plus the rules that load-balance traffic across a dynamic set of pods." },
      { question: "What is an EndpointSlice?", answer: "Modern replacement for Endpoints. Holds chunks (≤100 by default) of pod IPs+ports backing a Service; scales better than the old monolithic Endpoints object." },
      { question: "What is kube-proxy doing?", answer: "Reads Services + EndpointSlices and writes iptables (or IPVS) rules so ClusterIP packets get DNAT'd to a real pod IP." },
    ],
  },
});

const INC_3008 = mk({
  id: "K8S-INC-3008",
  title: "CoreDNS failure — cluster DNS lookups timing out (M3-INC-308)",
  severity: "high",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "kube-system",
  service: "coredns",
  detected_at: iso(5),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "observe",
  failed_phases: ["run"],
  briefing: {
    who: "CoreDNS Deployment in kube-system — 2 replicas.",
    what: "1 replica CrashLoopBackOff (config error), 1 replica overloaded; cluster-wide DNS timeouts.",
    where: "prod-use1, kube-system.",
    when: `${iso(5)} — started after Corefile ConfigMap update.`,
    why: "Corefile referenced a forward plugin pointing to a removed upstream resolver.",
    how: "kubectl logs coredns shows 'plugin/forward: no upstreams configured'.",
    severity_rationale: "HIGH — any app that resolves service names will see intermittent failures.",
  },
  description: "Every pod's /etc/resolv.conf points at the kube-dns Service IP, which fronts CoreDNS pods. When CoreDNS is unhealthy, name resolution stalls — symptoms look like 'service down' even though backends are up.",
  original_event: `kubectl -n kube-system get pods -l k8s-app=kube-dns
NAME              READY   STATUS             RESTARTS   AGE
coredns-5d6-aaa   1/1     Running            0          14d
coredns-5d6-bbb   0/1     CrashLoopBackOff   7          5m

kubectl -n kube-system logs coredns-5d6-bbb
[FATAL] plugin/forward: no upstreams configured`,
  affected: [
    { kind: "Deployment", name: "coredns", detail: "1/2 replicas crashing", action: "Fix Corefile, redeploy.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus", "Grafana"],
  data_sources: ["coredns", "kube-apiserver"],
  logs_sample: `coredns: [ERROR] plugin/errors: 2 web.default.svc.cluster.local. A: read udp i/o timeout
coredns: [FATAL] plugin/forward: no upstreams configured
kubelet: Liveness probe failed: HTTP probe failed`,
  metrics_sample: `coredns_dns_request_duration_seconds_bucket{le="1"}  drop 99% → 12%
coredns_dns_responses_total{rcode="SERVFAIL"}        spike 47×`,
  response_actions: ["Roll back Corefile", "Scale CoreDNS to 4", "Restart pods", "Add NodeLocal DNSCache"],
  next_steps: [
    { level: "L1", text: "kubectl -n kube-system rollout undo deploy/coredns." },
    { level: "L2", text: "Validate Corefile in a test cluster before re-applying." },
    { level: "L3", text: "Deploy NodeLocal DNSCache to absorb pod DNS storms." },
  ],
  k8s_concept: {
    concept: "Cluster DNS & service discovery",
    definition: "CoreDNS serves DNS for service.namespace.svc.cluster.local records. Every pod's resolv.conf points at the kube-dns Service.",
    why_it_exists: "Pods need stable names for stateless backends; IP-based wiring would re-break on every redeploy.",
    enterprise_impact: "DNS failures cascade into 'random' app errors that look like backend bugs. NodeLocal DNSCache is now standard at scale.",
    beginner: "The cluster's address book is down. Apps can't look up where billing/search/db live.",
    engineer: "Corefile syntax error → CoreDNS pod crashes on startup → liveness fails → kubelet restarts → CrashLoopBackOff. Surviving replica overloads; conntrack table on nodes fills with half-open UDP/53.",
    architecture_flow: NETWORKING_FLOW,
    failure_stage_id: "coredns",
    tools: [TOOL_KUBECTL, TOOL_COREDNS, TOOL_PROMETHEUS],
    learn_more: [
      { question: "Why is DNS so often the root cause?", answer: "It's an in-cluster dependency for almost every workload. Any blip propagates instantly and silently." },
      { question: "What is NodeLocal DNSCache?", answer: "A DaemonSet that runs a CoreDNS instance on every node; pods talk to localhost, cutting DNS traffic to the central CoreDNS by 90%." },
    ],
  },
});

const INC_3009 = mk({
  id: "K8S-INC-3009",
  title: "Ingress 404 — path routing rule missing (M3-INC-309)",
  severity: "medium",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-euw1",
  namespace: "web",
  service: "shop-ingress",
  detected_at: iso(14),
  last_event_at: iso(1),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "shop-ingress (nginx ingress controller).",
    what: "/api/* returns 404 even though the api Service has healthy endpoints.",
    where: "prod-euw1, namespace web.",
    when: `${iso(14)} — after Helm chart upgrade.`,
    why: "Ingress spec lost the /api path block during a chart values refactor.",
    how: "kubectl get ingress shop-ingress -o yaml shows only a / path rule.",
    severity_rationale: "MEDIUM — frontend works, API features down.",
  },
  description: "Ingress controllers (nginx, traefik, ALB) read Ingress objects and translate them into L7 routing rules. A missing path rule = the controller doesn't know where to send the request.",
  original_event: `$ kubectl get ingress shop-ingress -n web -o yaml | grep -A6 paths
    paths:
    - path: /
      pathType: Prefix
      backend:
        service:
          name: web
          port: 8080`,
  affected: [
    { kind: "Service", name: "shop-ingress", detail: "/api path missing", action: "Add /api → api-svc rule.", severity: "medium" },
  ],
  aligned_tools: ["kubectl", "Helm", "Prometheus"],
  data_sources: ["ingress-nginx", "kube-apiserver"],
  logs_sample: `ingress-nginx: 10.0.0.5 - "GET /api/v1/products HTTP/1.1" 404
ingress-nginx: no host found for /api/* — using default backend`,
  metrics_sample: `nginx_ingress_controller_requests{status="404"}  spike 312×
nginx_ingress_controller_config_last_reload_successful  1`,
  response_actions: ["Add /api rule", "Helm rollback", "Test with curl"],
  next_steps: [
    { level: "L1", text: "kubectl edit ingress shop-ingress -n web — add the /api path." },
    { level: "L2", text: "helm rollback shop 1 to undo chart upgrade." },
    { level: "L3", text: "Pin chart values in Git; add e2e test for /api endpoint." },
  ],
  k8s_concept: {
    concept: "Ingress & L7 HTTP routing",
    definition: "Ingress is a declarative description of host/path → Service routing rules. An ingress controller (nginx, traefik, ALB) implements it.",
    why_it_exists: "ClusterIP is internal-only; LoadBalancer is one-per-Service. Ingress fronts many Services behind one IP.",
    enterprise_impact: "Misconfigured Ingress is the most common cause of 404/502 incidents after a chart upgrade.",
    beginner: "The router that points URLs to services lost its rule for /api, so the URL goes nowhere.",
    engineer: "Helm chart values diff dropped the /api spec.rules[].http.paths entry. The controller regenerated nginx.conf without an upstream block for /api, sending the request to the default backend (404).",
    architecture_flow: NETWORKING_FLOW,
    failure_stage_id: "ingress",
    tools: [TOOL_KUBECTL, TOOL_COREDNS],
    learn_more: [
      { question: "Ingress vs Service of type LoadBalancer?", answer: "LoadBalancer = one cloud LB per Service (L4). Ingress = one shared L7 router for many Services." },
      { question: "What is IngressClass?", answer: "Selector that pairs an Ingress object with a specific controller (nginx, traefik) so multiple controllers can coexist." },
    ],
  },
});

// =============================================================================
// CATEGORY 4 — OPERATIONS
// =============================================================================

const INC_3010 = mk({
  id: "K8S-INC-3010",
  title: "Readiness probe failing — rollout stuck at 2/6 (M3-INC-310)",
  severity: "high",
  status: "in_progress",
  owner: "orders-team",
  cluster: "prod-use1",
  namespace: "commerce",
  service: "orders-api",
  detected_at: iso(10),
  last_event_at: iso(1),
  failure_chain: "Deploy → Run",
  current_phase: "deploy",
  failed_phases: ["run"],
  briefing: {
    who: "orders-api Deployment v2.7.1 rollout.",
    what: "New pods come up but stay Ready=false because the readiness probe returns 503 for 90s while the migration runs.",
    where: "prod-use1, namespace commerce.",
    when: `${iso(10)} — 10 min ago.`,
    why: "readinessProbe.initialDelaySeconds=10, but in-pod DB migration takes ~90s.",
    how: "kubectl describe: Readiness probe failed: HTTP 503.",
    severity_rationale: "HIGH — rollout blocked; if maxUnavailable hits, capacity drops.",
  },
  description: "Readiness probes gate Service endpoints: a pod is added to the EndpointSlice only when Ready=true. They protect users from being sent to a not-yet-warm pod. Set incorrectly, they block legitimate rollouts.",
  original_event: `Conditions:
  Type            Status
  Ready           False
  ContainersReady False
Events:
  Warning  Unhealthy   kubelet  Readiness probe failed: HTTP probe failed with statuscode: 503`,
  affected: [
    { kind: "Pod", name: "orders-api-8d4-q11m", detail: "Ready=false · readiness 503", action: "Raise initialDelay OR add startupProbe.", severity: "high" },
    { kind: "Deployment", name: "orders-api", detail: "rollout 2/6 paused", action: "kubectl rollout pause/undo.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Helm", "Prometheus"],
  data_sources: ["kubelet", "argo", "prom"],
  logs_sample: `orders-api: running migration V37__add_index (84s)
kubelet: Readiness probe for pod orders-api-8d4-q11m failed: HTTP 503`,
  metrics_sample: `kube_deployment_status_replicas_unavailable{deployment="orders-api"}  4
deployment_rollout_seconds                                            660`,
  response_actions: ["Raise initialDelay", "Add startupProbe", "kubectl rollout pause"],
  next_steps: [
    { level: "L1", text: "Patch readinessProbe.initialDelaySeconds 10 → 120." },
    { level: "L2", text: "Add a startupProbe with failureThreshold=30 to protect slow boots." },
    { level: "L3", text: "Move long migrations to a pre-deploy Job and gate the Deployment on Job success." },
  ],
  k8s_concept: {
    concept: "Liveness, readiness & startup probes",
    definition: "Three independent health checks kubelet runs per container. Liveness restarts the container; readiness gates Service traffic; startup buys time during slow boot.",
    why_it_exists: "Lets the cluster route traffic only to healthy pods and self-heal dead ones without operator intervention.",
    enterprise_impact: "Too aggressive → endless restarts. Too lax → users sent to broken pods. The probe tuning is a real production skill.",
    beginner: "The new pods are still starting up, but Kubernetes is asking 'ready yet?' too early and counting them as broken.",
    engineer: "readinessProbe httpGet /healthz fails (503) until migration completes; pod stays out of EndpointSlice; rollout enforces maxUnavailable so it pauses instead of going below the threshold.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBECTL, TOOL_KUBELET, TOOL_PROMETHEUS],
    learn_more: [
      { question: "Liveness vs readiness?", answer: "Liveness failure → kubelet restarts the container. Readiness failure → kubelet pulls the pod out of the Service endpoints but does NOT restart it." },
      { question: "What is a startupProbe?", answer: "An optional probe that runs first; while it's running, liveness/readiness are paused. Designed for slow-boot apps." },
    ],
  },
});

const INC_3011 = mk({
  id: "K8S-INC-3011",
  title: "ResourceQuota exceeded — namespace blocked from creating pods (M3-INC-311)",
  severity: "medium",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "team-analytics",
  service: "spark-driver",
  detected_at: iso(18),
  last_event_at: iso(2),
  failure_chain: "Deploy",
  current_phase: "deploy",
  failed_phases: ["deploy"],
  briefing: {
    who: "team-analytics namespace.",
    what: "Pod creation fails with 'exceeded quota: compute-quota'.",
    where: "prod-use1, namespace team-analytics.",
    when: `${iso(18)} — after spark job spawned 60 executors.`,
    why: "Spark job requested 60Gi memory; namespace memory quota is 40Gi.",
    how: "kubectl describe rs spark-driver-...: 'pods quota exceeded: requested 60Gi, used 38Gi, limit 40Gi'.",
    severity_rationale: "MEDIUM — single namespace blocked; other tenants unaffected.",
  },
  description: "ResourceQuota objects enforce per-namespace caps on aggregate requests/limits. Multi-tenancy depends on them to prevent one team from starving others.",
  original_event: `Events:
  Warning  FailedCreate  replicaset-controller  Error creating: pods "spark-driver-..." is forbidden: exceeded quota: compute-quota, requested: requests.memory=60Gi, used: requests.memory=38Gi, limited: requests.memory=40Gi`,
  affected: [
    { kind: "Deployment", name: "spark-driver", detail: "blocked by ResourceQuota", action: "Lower request OR raise quota.", severity: "medium" },
  ],
  aligned_tools: ["kubectl", "Prometheus"],
  data_sources: ["kube-apiserver", "resourcequota-controller"],
  logs_sample: `kube-controller-manager: ResourceQuota team-analytics/compute-quota: used 38Gi/40Gi
kube-apiserver: pods is forbidden: exceeded quota: compute-quota`,
  metrics_sample: `kube_resourcequota{namespace="team-analytics",resource="requests.memory",type="used"}  38Gi
kube_resourcequota{namespace="team-analytics",resource="requests.memory",type="hard"}  40Gi`,
  response_actions: ["Raise quota", "Lower request", "Scale down other workloads"],
  next_steps: [
    { level: "L1", text: "kubectl describe quota -n team-analytics — read current usage." },
    { level: "L2", text: "kubectl edit quota compute-quota — bump requests.memory to 80Gi (with CFO approval)." },
    { level: "L3", text: "Add a chargeback / showback dashboard so teams self-manage." },
  ],
  k8s_concept: {
    concept: "Namespaces, ResourceQuota & multi-tenancy",
    definition: "Namespaces are virtual clusters inside a cluster. ResourceQuota caps the aggregate requests/limits of all objects in a namespace.",
    why_it_exists: "Stops one team's runaway job from starving every other tenant on a shared cluster.",
    enterprise_impact: "Without quotas, a single misconfigured job causes a cluster-wide capacity incident. With them, the blast radius is one namespace.",
    beginner: "Your team's bucket of cluster memory is full. New pods can't be created until you free some up or get a bigger bucket.",
    engineer: "Admission controller rejects POST /pods because sum of requests.memory across existing + new pods exceeds ResourceQuota.spec.hard. ReplicaSet retries with exponential backoff.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "api",
    tools: [TOOL_KUBECTL, TOOL_PROMETHEUS],
    learn_more: [
      { question: "What is a namespace?", answer: "A name-scoped partition of cluster objects (pods, services, secrets). RBAC, quotas, network policies are all namespace-scoped." },
      { question: "Quota vs LimitRange?", answer: "Quota = aggregate cap across the namespace. LimitRange = default + min/max per pod/container if the manifest omits them." },
    ],
  },
});

const INC_3012 = mk({
  id: "K8S-INC-3012",
  title: "Pod stuck Terminating — finalizer never released (M3-INC-312)",
  severity: "medium",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "data",
  service: "ingest-worker",
  detected_at: iso(25),
  last_event_at: iso(5),
  failure_chain: "Run → Recover",
  current_phase: "recover",
  failed_phases: ["run"],
  briefing: {
    who: "ingest-worker pod.",
    what: "Pod stuck in Terminating for 25+ minutes after kubectl delete.",
    where: "prod-use1, namespace data.",
    when: `${iso(25)} — delete issued 25 min ago.`,
    why: "Custom finalizer 'flink.apache.org/checkpoint' set; controller is offline so finalizer never clears.",
    how: "kubectl get pod -o yaml shows metadata.finalizers with deletionTimestamp set.",
    severity_rationale: "MEDIUM — capacity tied up; replacement pod blocked.",
  },
  description: "Kubernetes deletion is two-phase: deletionTimestamp is set, then each finalizer must be removed by its owning controller before the API server actually removes the object. A dead controller = stuck object.",
  original_event: `$ kubectl get pod ingest-worker -n data
NAME            READY   STATUS        RESTARTS   AGE
ingest-worker   1/1     Terminating   0          14h

$ kubectl get pod ingest-worker -n data -o yaml | grep -A3 finalizers
  finalizers:
  - flink.apache.org/checkpoint
  deletionTimestamp: "${new Date(Date.now() - 25 * 60_000).toISOString()}"`,
  affected: [
    { kind: "Pod", name: "ingest-worker", detail: "Terminating · finalizer pending", action: "Restore controller OR force-remove finalizer.", severity: "medium" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kube-apiserver"],
  logs_sample: `kubelet: SIGTERM sent to container; awaiting graceful shutdown
kubelet: container exited 0 — pod ready for API delete
kube-apiserver: pod ingest-worker has finalizers; not deleting`,
  metrics_sample: `kube_pod_deletion_timestamp{pod="ingest-worker"}  set
kube_pod_status_phase{phase="Running"}             1 (lingering)`,
  response_actions: ["Restore controller", "kubectl patch finalizers", "Force delete"],
  next_steps: [
    { level: "L1", text: "kubectl get deploy -n flink-system — confirm operator is missing/crashed." },
    { level: "L2", text: "If controller cannot be restored: kubectl patch pod ingest-worker -n data -p '{\"metadata\":{\"finalizers\":[]}}' --type=merge." },
    { level: "L3", text: "Use --grace-period=0 --force only as a last resort; it can leave external resources orphaned." },
  ],
  k8s_concept: {
    concept: "Graceful shutdown, finalizers & terminationGracePeriod",
    definition: "On delete: API sets deletionTimestamp → kubelet sends SIGTERM → waits up to terminationGracePeriodSeconds → SIGKILL → finalizers must clear before object is removed from etcd.",
    why_it_exists: "Lets apps drain connections cleanly and lets controllers run cleanup (deregister from LB, snapshot state) before the object disappears.",
    enterprise_impact: "Bad shutdown handling = dropped requests on every deploy. Stuck finalizers = phantom resources nobody can delete.",
    beginner: "Kubernetes asked the pod to leave nicely, but is waiting for a cleanup step that's not happening.",
    engineer: "deletionTimestamp present, finalizers list non-empty, owning controller absent → API server's garbage collector refuses to remove the object. Force-removing finalizers bypasses cleanup — dangerous.",
    architecture_flow: POD_LIFECYCLE_FLOW,
    failure_stage_id: "api",
    tools: [TOOL_KUBECTL, TOOL_KUBELET],
    learn_more: [
      { question: "What is terminationGracePeriodSeconds?", answer: "Default 30s. The grace window between SIGTERM and SIGKILL. Tune to match worst-case in-flight request duration." },
      { question: "What is a finalizer?", answer: "A string in metadata.finalizers that blocks object deletion until the named controller removes it. Used for cleanup hooks (volumes, LB targets, external resources)." },
      { question: "When is --force --grace-period=0 safe?", answer: "Almost never. It tells the API to delete without waiting for kubelet or finalizers. External resources (volumes, cloud LB targets) may leak." },
    ],
  },
});

// Export
export const M3_INCIDENTS: K8sIncidentWithConcept[] = [
  INC_3001, INC_3002, INC_3003,
  INC_3004, INC_3005, INC_3006,
  INC_3007, INC_3008, INC_3009,
  INC_3010, INC_3011, INC_3012,
];
