// Curated K8s/Docker ops incidents that mirror the SOC notable detail shape
// (analyst 5W1H briefing, affected assets, phase chain, cross-tool enrichment).
// Pure seed data — no DB, no SDK calls — safe to import anywhere.

export type K8sIncidentSeverity = "low" | "medium" | "high" | "critical";
export type K8sIncidentStatus = "open" | "in_progress" | "resolved";

export type K8sPhaseId =
  | "plan"
  | "code"
  | "build"
  | "scan"
  | "push"
  | "deploy"
  | "schedule"
  | "run"
  | "observe"
  | "recover";

export const K8S_PHASES: { id: K8sPhaseId; label: string; hint: string }[] = [
  { id: "plan",     label: "Plan",     hint: "Ticket / change request" },
  { id: "code",     label: "Code",     hint: "Dockerfile / manifests" },
  { id: "build",    label: "Build",    hint: "docker build" },
  { id: "scan",     label: "Scan",     hint: "Trivy / Snyk" },
  { id: "push",     label: "Push",     hint: "Registry push" },
  { id: "deploy",   label: "Deploy",   hint: "kubectl apply / Helm" },
  { id: "schedule", label: "Schedule", hint: "kube-scheduler" },
  { id: "run",      label: "Run",      hint: "kubelet / container" },
  { id: "observe",  label: "Observe",  hint: "Prometheus / logs" },
  { id: "recover",  label: "Recover",  hint: "Rollback / hotfix" },
];

export type AlignedTool =
  | "kubectl"
  | "Docker"
  | "Helm"
  | "ArgoCD"
  | "Prometheus"
  | "Grafana"
  | "Trivy"
  | "Falco"
  | "GHCR"
  | "containerd";

export interface AffectedAsset {
  kind: "Pod" | "Deployment" | "Node" | "Image" | "Service" | "Container";
  name: string;
  detail: string;
  action: string;
  severity: K8sIncidentSeverity;
}

export interface CveRow {
  id: string;
  cvss: number;
  title: string;
}

export type K8sModuleCode = "K8S-M1" | "K8S-M2" | "K8S-M3" | "K8S-M4" | "K8S-M5";

export interface K8sIncident {
  id: string;
  title: string;
  severity: K8sIncidentSeverity;
  status: K8sIncidentStatus;
  owner: string;
  cluster: string;
  namespace: string;
  service: string;

  // Curriculum alignment — every incident maps to one K8s module.
  module: K8sModuleCode;
  module_title: string;

  detected_at: string;            // ISO
  last_event_at: string;          // ISO
  failure_chain: string;          // "Build -> Push -> Deploy"
  current_phase: K8sPhaseId;
  failed_phases: K8sPhaseId[];

  // Optional per-incident overrides for any of the 10 DevOps phases.
  phase_walkthrough?: Partial<Record<K8sPhaseId, string>>;

  // 5W1H briefing
  briefing: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
    severity_rationale: string;
  };

  description: string;
  original_event: string;         // multi-line raw block (kubectl/docker)

  affected: AffectedAsset[];
  aligned_tools: AlignedTool[];
  data_sources: string[];         // small chips (D1..D7-style)

  // Tabs
  logs_sample: string;
  metrics_sample: string;         // multi-line "ascii dashboard"
  cves?: CveRow[];                // image / scan incidents
  response_actions: string[];     // chip-like buttons

  // L1/L2/L3 playbook
  next_steps: { level: "L1" | "L2" | "L3"; text: string }[];

  // Lab cross-link
  lab_slug?: string;
}

const iso = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();

export const K8S_INCIDENTS: K8sIncident[] = [
  {
    id: "K8S-INC-1024",
    title: "ImagePullBackOff — payments-api cannot pull from GHCR",
    severity: "high",
    status: "open",
    owner: "platform-oncall",
    cluster: "prod-use1",
    namespace: "payments",
    service: "payments-api",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(8),
    last_event_at: iso(1),
    failure_chain: "Push → Deploy → Schedule → Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Deployment payments-api (replica 3/3) on cluster prod-use1.",
      what: "All pods stuck in ImagePullBackOff after a routine deploy of ghcr.io/shadowx/payments-api:1.42.0.",
      where: "Namespace payments, node group ng-app-prod, image registry ghcr.io.",
      when: `${iso(8)} — first event 8 minutes ago, still firing.`,
      why: "Registry returns 401 unauthorized — the imagePullSecret ghcr-pull was rotated but the new secret was not applied to the payments namespace.",
      how: "Correlation: ArgoCD sync at 07:51 → kubelet pull error 401 at 07:52 → ReplicaSet stalled at 3 desired / 0 available.",
      severity_rationale: "HIGH — production checkout traffic served by stale 1.41.6 pods; new pods cannot start so an autoscale event would cause an outage.",
    },
    description:
      "Three new payments-api pods cannot pull image ghcr.io/shadowx/payments-api:1.42.0. The rollout is paused at 0/3 ready. Existing 1.41.6 pods continue to serve traffic.",
    original_event: `Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  8m    default-scheduler  Successfully assigned payments/payments-api-7c9f-xkqz2 to ip-10-4-12-7
  Normal   Pulling    8m    kubelet            Pulling image "ghcr.io/shadowx/payments-api:1.42.0"
  Warning  Failed     7m    kubelet            Failed to pull image: rpc error: code = Unknown desc = failed to pull and unpack image: failed to resolve reference "ghcr.io/shadowx/payments-api:1.42.0": unexpected status from HEAD request: 401 Unauthorized
  Warning  Failed     7m    kubelet            Error: ErrImagePull
  Normal   BackOff    1m    kubelet            Back-off pulling image "ghcr.io/shadowx/payments-api:1.42.0"
  Warning  Failed     1m    kubelet            Error: ImagePullBackOff`,
    affected: [
      { kind: "Pod",        name: "payments-api-7c9f-xkqz2", detail: "ImagePullBackOff · restarts=0 · age=8m", action: "Delete pod after secret fix.",        severity: "high" },
      { kind: "Deployment", name: "payments-api",             detail: "desired=3 · available=0 (new RS)",      action: "Rollback to 1.41.6 if blocker.",      severity: "critical" },
      { kind: "Image",      name: "ghcr.io/shadowx/payments-api:1.42.0", detail: "Registry 401 unauthorized", action: "Verify imagePullSecret rotation.", severity: "high" },
    ],
    aligned_tools: ["kubectl", "Docker", "ArgoCD", "GHCR", "containerd", "Prometheus", "Grafana"],
    data_sources: ["kubelet", "argo", "ghcr", "prom"],
    logs_sample: `kubelet[2114]: E pod="payments/payments-api-7c9f-xkqz2" image="ghcr.io/shadowx/payments-api:1.42.0" status=401
containerd: failed to resolve reference: unexpected status: 401 Unauthorized
argocd-application-controller: sync ok, but kubelet reports ImagePullBackOff (3/3 pods)`,
    metrics_sample: `kube_pod_status_phase{phase="Running",deployment="payments-api"}  0
kube_pod_status_phase{phase="Pending",deployment="payments-api"}  3
container_image_pull_errors_total{reason="401"}                  17
payments_api_http_requests_per_min                              4,120 (served by old RS)`,
    response_actions: ["Rollback to 1.41.6", "Apply new ghcr-pull secret", "Delete failing pods", "Open in ArgoCD"],
    next_steps: [
      { level: "L1", text: "Verify imagePullSecret 'ghcr-pull' exists in namespace 'payments'." },
      { level: "L2", text: "Rotate token in GHCR and patch secret via sealed-secrets." },
      { level: "L3", text: "If checkout SLO drops, kubectl rollout undo deployment/payments-api -n payments." },
    ],
    lab_slug: "k8s-push-to-registry",
  },

  {
    id: "K8S-INC-1025",
    title: "CrashLoopBackOff — checkout-svc bad DATABASE_URL",
    severity: "high",
    status: "in_progress",
    owner: "checkout-team",
    cluster: "prod-use1",
    namespace: "commerce",
    service: "checkout-svc",
    module: "K8S-M5",
    module_title: "M5 · Monitoring, Troubleshooting & Capstone Prep",
    detected_at: iso(22),
    last_event_at: iso(2),
    failure_chain: "Deploy → Run → Observe",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "checkout-svc Deployment, replicas 4, owner checkout-team.",
      what: "All pods crash within 5s of start (exit 1) after a config map change.",
      where: "Namespace commerce on prod-use1 cluster.",
      when: `${iso(22)} — 22m ago, 14 restarts per pod.`,
      why: "ConfigMap checkout-config v17 introduced DATABASE_URL with a missing port (postgres://db//checkout).",
      how: "kubectl logs prev → java.net.URISyntaxException → CrashLoopBackOff after 5 restarts.",
      severity_rationale: "HIGH — checkout API returns 503; cart conversion dropping. Mitigation by rolling back the config.",
    },
    description:
      "ConfigMap update introduced a malformed DATABASE_URL. Pods start, crash on JDBC URI parse, and are restarted by the kubelet in an exponential backoff loop.",
    original_event: `kubectl logs checkout-svc-6f7-h2k4r --previous
Caused by: java.net.URISyntaxException: Expected port number at index 18: postgres://db//checkout
	at com.shadowx.cart.Config.dataSource(Config.java:74)
Exiting with status 1
State:          Waiting
  Reason:       CrashLoopBackOff
Last State:     Terminated
  Reason:       Error
  Exit Code:    1
  Restart Count: 14`,
    affected: [
      { kind: "Pod",        name: "checkout-svc-6f7-h2k4r", detail: "CrashLoopBackOff · restarts=14",   action: "Wait for rollback.",                  severity: "high" },
      { kind: "Deployment", name: "checkout-svc",            detail: "desired=4 · ready=0",              action: "kubectl rollout undo.",               severity: "critical" },
      { kind: "Service",    name: "checkout-svc",            detail: "0/4 endpoints — ClusterIP",        action: "Ingress returns 503 upstream.",       severity: "high" },
    ],
    aligned_tools: ["kubectl", "Helm", "Prometheus", "Grafana", "ArgoCD"],
    data_sources: ["kubelet", "configmap", "prom"],
    logs_sample: `2026-05-17T07:42:01Z checkout-svc INIT loading config from /etc/config/checkout.yaml
2026-05-17T07:42:01Z checkout-svc FATAL java.net.URISyntaxException: Expected port number at index 18
2026-05-17T07:42:01Z kubelet  Back-off restarting failed container (5/5)`,
    metrics_sample: `kube_pod_container_status_restarts_total{pod=~"checkout-svc.*"}  14
container_last_seen_terminated{reason="Error"}                  4
http_5xx_total{service="checkout-svc"}                          1,883 / 5m`,
    response_actions: ["Rollback ConfigMap", "kubectl rollout undo", "Pause Helm release", "Page checkout-team"],
    next_steps: [
      { level: "L1", text: "kubectl rollout undo deployment/checkout-svc -n commerce." },
      { level: "L2", text: "Revert ConfigMap checkout-config to revision 16 (git revert)." },
      { level: "L3", text: "Add a config-validation init container before next release." },
    ],
    lab_slug: "k8s-debug-crashloop",
  },

  {
    id: "K8S-INC-1026",
    title: "OOMKilled — search-api memory limit too low",
    severity: "medium",
    status: "open",
    owner: "search-team",
    cluster: "prod-euw1",
    namespace: "commerce",
    service: "search-api",
    module: "K8S-M5",
    module_title: "M5 · Monitoring, Troubleshooting & Capstone Prep",
    detected_at: iso(35),
    last_event_at: iso(3),
    failure_chain: "Run → Observe",
    current_phase: "observe",
    failed_phases: ["run"],
    briefing: {
      who: "search-api Deployment (replicas 6).",
      what: "Pods OOMKilled every ~8 minutes under normal traffic.",
      where: "prod-euw1, namespace commerce.",
      when: `${iso(35)} — recurring since 35m.`,
      why: "Container memory limit (256Mi) is below the JVM heap reservation (-Xmx512m).",
      how: "kubectl describe pod → Last State Terminated Reason OOMKilled; cgroup memory.peak exceeded limit.",
      severity_rationale: "MEDIUM — replicas restart but tail-latency SLO breached; raise the limit or shrink heap.",
    },
    description:
      "search-api pods are repeatedly OOMKilled because the JVM heap is sized larger than the cgroup memory limit.",
    original_event: `Containers:
  search-api:
    Limits:        cpu: 1, memory: 256Mi
    Requests:      cpu: 500m, memory: 256Mi
    Last State:    Terminated
      Reason:      OOMKilled
      Exit Code:   137
      Started:     8m ago
      Finished:    3m ago
    Restart Count: 11`,
    affected: [
      { kind: "Container",  name: "search-api",       detail: "OOMKilled — exit 137 (mem 256Mi)", action: "Raise limit to 1Gi or shrink heap.", severity: "high" },
      { kind: "Deployment", name: "search-api",       detail: "rolling restarts every ~8m",       action: "Patch resources.limits.memory.",     severity: "medium" },
    ],
    aligned_tools: ["kubectl", "Prometheus", "Grafana"],
    data_sources: ["kubelet", "cAdvisor", "prom"],
    logs_sample: `kernel: Memory cgroup out of memory: Killed process 17 (java) total-vm:2148728kB, anon-rss:262144kB
kubelet: container search-api OOMKilled, restart count 11`,
    metrics_sample: `container_memory_working_set_bytes{pod=~"search-api.*"} peak=257.9Mi
container_oom_events_total{pod=~"search-api.*"}        11
search_api_p99_latency_ms                             842 (SLO 400)`,
    response_actions: ["Increase memory limit", "Shrink -Xmx", "Enable VPA", "Open Grafana board"],
    next_steps: [
      { level: "L1", text: "kubectl set resources deploy/search-api -c search-api --limits=memory=1Gi." },
      { level: "L2", text: "Lower JVM -Xmx to 75% of new limit." },
      { level: "L3", text: "Enable VPA in 'Auto' mode for search-api." },
    ],
    lab_slug: "k8s-debug-crashloop",
  },

  {
    id: "K8S-INC-1027",
    title: "Pending pods — node group at memory pressure",
    severity: "medium",
    status: "in_progress",
    owner: "platform-oncall",
    cluster: "prod-euw1",
    namespace: "platform",
    service: "ingress-nginx",
    module: "K8S-M3",
    module_title: "M3 · Kubernetes Fundamentals & Pod Architecture",
    detected_at: iso(15),
    last_event_at: iso(2),
    failure_chain: "Deploy → Schedule",
    current_phase: "schedule",
    failed_phases: ["schedule"],
    briefing: {
      who: "ingress-nginx DaemonSet expansion.",
      what: "2 of 6 new pods stuck in Pending — kube-scheduler reports insufficient memory.",
      where: "prod-euw1, node group ng-system, 1 node NotReady.",
      when: `${iso(15)} — 15m ago.`,
      why: "1 node entered MemoryPressure; cluster autoscaler scaling but capped at 12 nodes.",
      how: "kubectl describe pod → 0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint NotReady.",
      severity_rationale: "MEDIUM — service still up via 4 ready pods, but at edge of capacity; raise cap.",
    },
    description: "Cluster autoscaler hit max-nodes ceiling; pending pods cannot be scheduled until the cap is raised or a node recovers.",
    original_event: `Events:
  Warning  FailedScheduling   5m   default-scheduler  0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint {node.kubernetes.io/not-ready}`,
    affected: [
      { kind: "Pod",  name: "ingress-nginx-pq2v9", detail: "Pending · 0 nodes available", action: "Raise autoscaler max.",   severity: "medium" },
      { kind: "Node", name: "ip-10-3-21-44",       detail: "NotReady · MemoryPressure",   action: "Drain + replace.",        severity: "high" },
    ],
    aligned_tools: ["kubectl", "Prometheus", "Grafana"],
    data_sources: ["kube-scheduler", "autoscaler", "prom"],
    logs_sample: `cluster-autoscaler: max node group size reached: 12/12 for ng-system
kube-scheduler: pod platform/ingress-nginx-pq2v9 cannot be scheduled`,
    metrics_sample: `kube_node_status_condition{condition="MemoryPressure",status="true"}  1
kube_pod_status_phase{phase="Pending"}                                 2
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes (avg)     0.04`,
    response_actions: ["Raise autoscaler max", "Drain bad node", "Cordon + replace", "Page platform"],
    next_steps: [
      { level: "L1", text: "Bump autoscaler max nodes for ng-system from 12 → 16." },
      { level: "L2", text: "Cordon and drain ip-10-3-21-44." },
      { level: "L3", text: "Investigate workload consuming memory on bad node." },
    ],
    lab_slug: "k8s-scale-replicas",
  },

  {
    id: "K8S-INC-1028",
    title: "Rolling update stuck — readiness probe failing",
    severity: "high",
    status: "in_progress",
    owner: "orders-team",
    cluster: "prod-use1",
    namespace: "commerce",
    service: "orders-api",
    module: "K8S-M4",
    module_title: "M4 · Deployments & Service Exposure",
    detected_at: iso(11),
    last_event_at: iso(1),
    failure_chain: "Deploy → Run → Observe",
    current_phase: "deploy",
    failed_phases: ["run"],
    briefing: {
      who: "orders-api Deployment v2.7.1 rollout.",
      what: "Rolling update paused at 2/6 — new pods Ready=false because readiness probe /healthz returns 503.",
      where: "prod-use1, namespace commerce.",
      when: `${iso(11)} — 11m ago.`,
      why: "v2.7.1 introduced a startup DB migration that takes ~90s, but readiness probe initialDelaySeconds is only 10s.",
      how: "kubectl describe → Readiness probe failed: HTTP 503; rollout maxUnavailable holding traffic on v2.7.0.",
      severity_rationale: "HIGH — new release blocked; if maxUnavailable is reached, capacity drops.",
    },
    description: "Readiness probe runs before the in-pod migration completes, marking pods NotReady and blocking the rollout.",
    original_event: `Readiness probe failed: HTTP probe failed with statuscode: 503
Conditions:
  Type            Status
  Ready           False
  ContainersReady False
NEW   2  Ready   READY  DESIRED  6  AVAILABLE  4`,
    affected: [
      { kind: "Pod",        name: "orders-api-8d4-q11m", detail: "Ready=false · readiness 503",  action: "Wait or raise initialDelay.", severity: "high" },
      { kind: "Deployment", name: "orders-api",          detail: "rollout 2/6 paused",            action: "kubectl rollout pause/undo.", severity: "high" },
    ],
    aligned_tools: ["kubectl", "Helm", "Prometheus", "Grafana", "ArgoCD"],
    data_sources: ["kubelet", "argo", "prom"],
    logs_sample: `orders-api: running migration V37__add_index ... (84s)
kubelet: Readiness probe for pod orders-api-8d4-q11m failed: HTTP 503`,
    metrics_sample: `kube_deployment_status_replicas_unavailable{deployment="orders-api"}  2
http_503_total{service="orders-api"}                                  0 (held back by readiness)
deployment_rollout_seconds                                            660`,
    response_actions: ["Raise readiness initialDelay", "kubectl rollout pause", "kubectl rollout undo", "Open Helm release"],
    next_steps: [
      { level: "L1", text: "Patch readinessProbe.initialDelaySeconds from 10 → 120." },
      { level: "L2", text: "If migration > 5m, move it to a Job and gate the deployment on Job success." },
      { level: "L3", text: "Add startupProbe for slow-starting containers." },
    ],
    lab_slug: "k8s-rolling-update",
  },

  {
    id: "K8S-INC-1029",
    title: "Service unreachable — ClusterIP selector mismatch",
    severity: "medium",
    status: "resolved",
    owner: "platform-oncall",
    cluster: "stg-use1",
    namespace: "qa",
    service: "billing-api",
    module: "K8S-M4",
    module_title: "M4 · Deployments & Service Exposure",
    detected_at: iso(180),
    last_event_at: iso(120),
    failure_chain: "Deploy → Run",
    current_phase: "recover",
    failed_phases: ["run"],
    briefing: {
      who: "billing-api Service of type ClusterIP.",
      what: "Service had 0 endpoints — calls to billing-api.qa.svc returned connection refused.",
      where: "stg-use1, namespace qa.",
      when: `${iso(180)} — 3h ago. Resolved 2h ago.`,
      why: "Service selector app=billing did not match new pod labels app=billing-api.",
      how: "kubectl get endpoints billing-api -n qa → <none>; selector audit found the typo.",
      severity_rationale: "MEDIUM (staging only) — caught in QA before promotion.",
    },
    description: "Service selector did not match the new pod label set after a manifest refactor, leaving the Service with zero endpoints.",
    original_event: `$ kubectl get endpoints billing-api -n qa
NAME          ENDPOINTS   AGE
billing-api   <none>      14h
$ kubectl get pod -n qa -l app=billing
No resources found.
$ kubectl get pod -n qa -l app=billing-api
NAME                     READY   STATUS    RESTARTS   AGE
billing-api-7c98f-...    1/1     Running   0          14h`,
    affected: [
      { kind: "Service", name: "billing-api", detail: "0 endpoints — ClusterIP",   action: "Fix selector.",  severity: "high" },
      { kind: "Pod",     name: "billing-api-7c98f-",  detail: "Running but not selected", action: "No action needed.", severity: "low" },
    ],
    aligned_tools: ["kubectl", "Prometheus"],
    data_sources: ["kube-apiserver", "endpoints-controller"],
    logs_sample: `endpoints-controller: Service qa/billing-api has 0 ready endpoints
ingress: 502 upstream connect error — no endpoints for billing-api`,
    metrics_sample: `kube_endpoint_address_available{namespace="qa",endpoint="billing-api"}  0
http_502_total{service="billing-api"}                                    417`,
    response_actions: ["Fix selector", "Apply manifest", "Re-test"],
    next_steps: [
      { level: "L1", text: "kubectl patch svc billing-api -p '{\"spec\":{\"selector\":{\"app\":\"billing-api\"}}}'." },
      { level: "L2", text: "Add a CI check that warns when selector matches 0 pods." },
      { level: "L3", text: "Use Kustomize/Helm to template label and selector from the same value." },
    ],
    lab_slug: "k8s-expose-service",
  },

  {
    id: "K8S-INC-1030",
    title: "Docker build failed — RUN apt-get exit 100",
    severity: "high",
    status: "open",
    owner: "platform-oncall",
    cluster: "ci-runner",
    namespace: "ci",
    service: "payments-api (build)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(6),
    last_event_at: iso(1),
    failure_chain: "Code → Build",
    current_phase: "build",
    failed_phases: ["build"],
    briefing: {
      who: "GitHub Actions runner building ghcr.io/shadowx/payments-api:1.42.1.",
      what: "docker build failed at step RUN apt-get install -y libpq-dev (exit 100).",
      where: "CI runner ci-runner-3, runner image ubuntu-22.04.",
      when: `${iso(6)} — 6m ago, blocking 4 downstream jobs.`,
      why: "Base image apt cache is stale; libpq-dev no longer in current package index until apt-get update is rerun.",
      how: "docker build log → 'Unable to locate package libpq-dev'; missing 'apt-get update &&' on the RUN line.",
      severity_rationale: "HIGH — release pipeline blocked. Fix is a one-line Dockerfile patch.",
    },
    description:
      "A Docker build step fails with apt error 100 because the RUN line installs packages without first refreshing the apt index in the same layer.",
    original_event: `Step 4/12 : RUN apt-get install -y libpq-dev curl
 ---> Running in 7f1d8a2c10aa
Reading package lists... Done
Building dependency tree... Done
E: Unable to locate package libpq-dev
The command '/bin/sh -c apt-get install -y libpq-dev curl' returned a non-zero code: 100`,
    affected: [
      { kind: "Image",     name: "ghcr.io/shadowx/payments-api:1.42.1", detail: "build failed at step 4/12", action: "Patch Dockerfile RUN line.", severity: "high" },
      { kind: "Container", name: "buildkit-7f1d8a2c10aa",                detail: "exited (100)",              action: "Auto-cleaned.",              severity: "low" },
    ],
    aligned_tools: ["Docker", "GHCR", "Trivy"],
    data_sources: ["buildkit", "actions-runner"],
    logs_sample: `#0 0.612 Reading package lists...
#0 0.901 E: Unable to locate package libpq-dev
buildx: failed to solve: process "/bin/sh -c apt-get install ..." did not complete successfully: exit code: 100`,
    metrics_sample: `ci_build_failures_total{repo="payments-api"}  3 (today)
ci_build_duration_seconds{step="apt"}        14.2`,
    cves: [
      { id: "CVE-2024-21338", cvss: 7.8, title: "Windows Kernel Elevation of Privilege (base image)" },
      { id: "CVE-2024-3094",  cvss: 9.8, title: "xz-utils backdoor (Trivy scan finding)" },
    ],
    response_actions: ["Patch Dockerfile", "Re-run build", "Pin base image", "Open in CI"],
    next_steps: [
      { level: "L1", text: "Replace RUN with: RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev curl && rm -rf /var/lib/apt/lists/*." },
      { level: "L2", text: "Pin the base image digest (FROM ubuntu:22.04@sha256:...)." },
      { level: "L3", text: "Move to a slim/distroless base to remove apt entirely." },
    ],
    lab_slug: "k8s-build-tag-image",
  },

  {
    id: "K8S-INC-1031",
    title: "Registry push denied — GHCR token missing write:packages",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "ci-runner",
    namespace: "ci",
    service: "payments-api (push)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(4),
    last_event_at: iso(1),
    failure_chain: "Build → Push",
    current_phase: "push",
    failed_phases: ["push"],
    briefing: {
      who: "GitHub Actions runner pushing to ghcr.io/shadowx/payments-api.",
      what: "docker push returned 'denied: permission_denied: write_package'.",
      where: "GHCR org shadowx, package payments-api.",
      when: `${iso(4)} — 4m ago.`,
      why: "Rotated PAT lacks the write:packages scope.",
      how: "Push log → 401 → docker login output → token scopes show only read:packages.",
      severity_rationale: "MEDIUM — fix is a token re-scope; no production impact yet.",
    },
    description:
      "Authentication to GHCR succeeded but the token cannot publish images. The image was built successfully but never reached the registry.",
    original_event: `The push refers to repository [ghcr.io/shadowx/payments-api]
0c4b...: Preparing
denied: permission_denied: write_package
::error::Process completed with exit code 1.`,
    affected: [
      { kind: "Image", name: "ghcr.io/shadowx/payments-api:1.42.1", detail: "built but not pushed", action: "Re-issue token with write:packages.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "GHCR"],
    data_sources: ["actions-runner", "ghcr-audit"],
    logs_sample: `docker push ghcr.io/shadowx/payments-api:1.42.1
denied: permission_denied: write_package`,
    metrics_sample: `ci_push_failures_total{registry="ghcr"}  6 (today)`,
    response_actions: ["Re-issue PAT", "Update Actions secret", "Retry workflow"],
    next_steps: [
      { level: "L1", text: "Issue PAT with scopes: read:packages, write:packages, repo." },
      { level: "L2", text: "Update GitHub Actions secret GHCR_TOKEN." },
      { level: "L3", text: "Re-run failed workflow." },
    ],
    lab_slug: "k8s-push-to-registry",
  },
];

export function findK8sIncident(id: string) {
  return K8S_INCIDENTS.find((i) => i.id === id);
}

// Map a lab slug to its primary ops incident (used by Lab pages to deep-link).
export const K8S_LAB_TO_INCIDENT: Record<string, string> = {
  "k8s-push-to-registry": "K8S-INC-1024",
  "k8s-debug-crashloop": "K8S-INC-1025",
  "k8s-scale-replicas": "K8S-INC-1027",
  "k8s-rolling-update": "K8S-INC-1028",
  "k8s-expose-service": "K8S-INC-1029",
  "k8s-build-tag-image": "K8S-INC-1030",
};
