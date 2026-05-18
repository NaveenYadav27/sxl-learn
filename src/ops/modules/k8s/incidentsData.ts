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
  | "Docker Desktop"
  | "Helm"
  | "ArgoCD"
  | "Prometheus"
  | "Grafana"
  | "Trivy"
  | "Snyk"
  | "Falco"
  | "GHCR"
  | "containerd"
  | "runc"
  | "crictl"
  | "journalctl"
  | "BuildKit"
  | "GitHub Actions"
  | "Jenkins";

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
  // Optional deep-learning block (used by Module 1 & Module 2 incidents).
  learning?: {
    concept: string;
    meaning: string;
    enterprise_impact: string;
    fresher_view: string;
    engineer_view: string;
    commands_bash: string[];
    commands_powershell: string[];
    recovery: string[];
  };
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

  {
    id: "K8S-INC-1032",
    title: "Container exited (137) — runtime killed by host OOM",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "nginx-demo",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(45),
    last_event_at: iso(2),
    failure_chain: "Run → Observe",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Standalone Docker container nginx-demo on lab-docker-01.",
      what: "Container exited with code 137 — SIGKILL from the host OOM killer.",
      where: "Docker engine 24.0 on Ubuntu 22.04, no orchestrator.",
      when: `${iso(45)} — 45m ago.`,
      why: "Container has no --memory limit; a sibling test container consumed all host RAM and the kernel reaped the lowest-score process.",
      how: "docker inspect → State.ExitCode=137 OOMKilled=true; dmesg shows oom_reaper for cgroup /docker/...",
      severity_rationale: "MEDIUM — single-host lab impact; demonstrates why cgroups + memory limits matter before learning K8s.",
    },
    description:
      "A Docker container was killed by the host kernel because no memory limit was set. This is the canonical lesson for namespaces + cgroups before moving to K8s.",
    original_event: `$ docker inspect nginx-demo --format '{{.State.Status}} ({{.State.ExitCode}}) OOM={{.State.OOMKilled}}'
exited (137) OOM=true
$ dmesg | tail
[ 9842.117] Memory cgroup out of memory: Killed process 4711 (nginx)
[ 9842.118] oom_reaper: reaped process 4711 (nginx), now anon-rss:0kB`,
    affected: [
      { kind: "Container", name: "nginx-demo", detail: "exited (137) OOMKilled=true", action: "Re-run with --memory=256m.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "containerd"],
    data_sources: ["dockerd", "kernel-oom"],
    logs_sample: `dockerd: container 4f1a died (status 137)
kernel: Memory cgroup out of memory: Killed process (nginx)`,
    metrics_sample: `host_mem_available_bytes  near 0
container_oom_events_total{name="nginx-demo"}  1`,
    response_actions: ["Set --memory", "Set --memory-swap", "Add restart policy", "Inspect cgroup"],
    next_steps: [
      { level: "L1", text: "docker run --memory=256m --memory-swap=256m --restart=on-failure nginx" },
      { level: "L2", text: "Audit all containers on host for missing limits." },
      { level: "L3", text: "Move workload to K8s where requests/limits are first-class." },
    ],
    lab_slug: "k8s-container-lifecycle",
  },

  {
    id: "K8S-INC-1033",
    title: "Pull failed — registry rate-limited (Docker Hub 429)",
    severity: "low",
    status: "in_progress",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "alpine-base",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(20),
    last_event_at: iso(3),
    failure_chain: "Push → Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Anonymous Docker pulls from a shared lab IP.",
      what: "docker pull alpine:3.19 fails with 'toomanyrequests'.",
      where: "Docker Hub registry-1.docker.io.",
      when: `${iso(20)} — 20m ago.`,
      why: "Anonymous tier limit (100 pulls / 6h / IP) exhausted by class lab.",
      how: "docker pull log → 429 Too Many Requests; X-RateLimit-Remaining: 0.",
      severity_rationale: "LOW — workaround is to authenticate or mirror via GHCR/ECR.",
    },
    description:
      "The default container runtime cannot pull a base image because the upstream registry is rate-limiting unauthenticated requests.",
    original_event: `$ docker pull alpine:3.19
Error response from daemon: toomanyrequests: You have reached your pull rate limit.`,
    affected: [
      { kind: "Image", name: "alpine:3.19", detail: "pull blocked 429", action: "Authenticate or mirror.", severity: "low" },
    ],
    aligned_tools: ["Docker", "containerd", "GHCR"],
    data_sources: ["dockerd", "registry-audit"],
    logs_sample: `dockerd: pull alpine:3.19 -> 429 toomanyrequests
containerd: failed to resolve reference, retry in 60s`,
    metrics_sample: `registry_pull_failures_total{code="429"}  14`,
    response_actions: ["docker login", "Use GHCR mirror", "Cache base layers"],
    next_steps: [
      { level: "L1", text: "docker login — switch to authenticated pulls (200/6h)." },
      { level: "L2", text: "Mirror base images to GHCR or ECR pull-through cache." },
      { level: "L3", text: "Pin base images by digest to avoid repeated pulls." },
    ],
    lab_slug: "k8s-pull-run-inspect",
  },

  /* ============================================================
   * MODULE 1 — Containerization Fundamentals & Docker Architecture
   * Deep-learning incidents (cgroups, namespaces, runtime, security)
   * ============================================================ */

  {
    id: "K8S-INC-1034",
    title: "Docker daemon unreachable — Cannot connect to /var/run/docker.sock",
    severity: "high",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "dockerd",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(12),
    last_event_at: iso(1),
    failure_chain: "Run → Observe",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Every `docker` CLI call from user `student01` on lab-docker-01.",
      what: "`docker ps` returns 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock'.",
      where: "Host lab-docker-01, Docker Engine 24.0 on Ubuntu 22.04.",
      when: `${iso(12)} — first failure 12m ago.`,
      why: "The dockerd systemd unit crashed after a config typo in /etc/docker/daemon.json (invalid JSON).",
      how: "journalctl -u docker → 'unable to configure the Docker daemon: invalid character'.",
      severity_rationale: "HIGH — entire host cannot run containers until dockerd restarts cleanly.",
    },
    description:
      "The Docker client cannot talk to the daemon because dockerd is not running. Demonstrates the Docker client / server architecture: CLI is just a REST client over a Unix socket.",
    original_event: `$ docker ps
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
$ systemctl status docker
× docker.service - Docker Application Container Engine
     Active: failed (Result: exit-code)`,
    affected: [
      { kind: "Container", name: "dockerd", detail: "systemd unit failed", action: "Fix daemon.json and restart.", severity: "high" },
    ],
    aligned_tools: ["Docker", "Docker Desktop", "journalctl", "containerd"],
    data_sources: ["systemd", "dockerd", "journal"],
    logs_sample: `journalctl -u docker --since "15 min ago"
dockerd[2117]: failed to load daemon config: invalid character 'r' looking for beginning of object key string
systemd: docker.service: Failed with result 'exit-code'.`,
    metrics_sample: `dockerd_up 0
container_starts_total 0 (last 10m)`,
    response_actions: ["Validate daemon.json", "systemctl restart docker", "Tail journalctl", "Open Docker Desktop"],
    next_steps: [
      { level: "L1", text: "jq . /etc/docker/daemon.json — if it errors, fix the JSON." },
      { level: "L2", text: "sudo systemctl restart docker && systemctl status docker." },
      { level: "L3", text: "Add CI lint of daemon.json before push to managed hosts." },
    ],
    lab_slug: "k8s-docker-install-tour",
    learning: {
      concept: "Docker client/server architecture",
      meaning:
        "The `docker` command is a thin REST client. All real work happens inside `dockerd`, which talks to `containerd` → `runc`. If the daemon socket is gone, the CLI cannot do anything.",
      enterprise_impact:
        "On a build host or CI runner, a dead daemon stops every job. Production K8s nodes are insulated because kubelet talks to containerd directly — but lab and dev hosts feel it immediately.",
      fresher_view:
        "Docker has two parts: a command you type, and a background service. If the background service dies, your commands fail. Restart the service.",
      engineer_view:
        "dockerd parses /etc/docker/daemon.json at startup. A malformed key aborts boot before the UNIX socket /var/run/docker.sock is created. crictl can still talk to containerd directly, proving the runtime stack is layered.",
      commands_bash: [
        "systemctl status docker",
        "journalctl -u docker -n 100 --no-pager",
        "ls -l /var/run/docker.sock",
        "sudo systemctl restart docker",
        "crictl --runtime-endpoint unix:///run/containerd/containerd.sock ps",
      ],
      commands_powershell: [
        "Get-Service com.docker.service",
        "Restart-Service com.docker.service",
        "docker context ls",
        "docker info",
      ],
      recovery: [
        "Restore last-known-good /etc/docker/daemon.json from git.",
        "systemctl restart docker; verify `docker info` returns server info.",
        "Re-run failed jobs once `docker ps` works.",
      ],
    },
  },

  {
    id: "K8S-INC-1035",
    title: "Namespace quota exceeded — PID namespace exhausted",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "stress-worker",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(18),
    last_event_at: iso(2),
    failure_chain: "Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Container `stress-worker` running a fork-bomb test.",
      what: "Container hit its PID namespace cap (--pids-limit=200) and refuses new processes.",
      where: "lab-docker-01, Docker Engine 24.0.",
      when: `${iso(18)} — 18m ago.`,
      why: "Workload spawned > 200 processes inside its PID namespace; cgroup pids.max enforced the limit.",
      how: "docker stats shows PIDS=200/200; `fork: Resource temporarily unavailable` in container logs.",
      severity_rationale: "MEDIUM — single container affected; teaches namespace + cgroup isolation.",
    },
    description:
      "PID namespace isolation prevents a runaway container from exhausting the host process table. This incident proves the isolation worked.",
    original_event: `$ docker stats stress-worker --no-stream
NAME            CPU %   MEM %   PIDS
stress-worker   97.4%   14.0%   200
$ docker logs stress-worker | tail
sh: fork: Resource temporarily unavailable`,
    affected: [
      { kind: "Container", name: "stress-worker", detail: "pids.max reached (200/200)", action: "Raise --pids-limit or kill workload.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "containerd", "runc", "journalctl"],
    data_sources: ["dockerd", "cgroupfs", "kernel"],
    logs_sample: `containerd: cgroup pids: limit reached for /docker/4f1a...
runc: failed to exec: fork/exec: resource temporarily unavailable`,
    metrics_sample: `container_pids_current 200
container_pids_max     200`,
    response_actions: ["Raise --pids-limit", "Stop container", "Inspect cgroup"],
    next_steps: [
      { level: "L1", text: "docker update --pids-limit=400 stress-worker." },
      { level: "L2", text: "Audit images for fork-heavy entrypoints." },
      { level: "L3", text: "Set org-wide default --pids-limit in daemon.json." },
    ],
    lab_slug: "k8s-container-lifecycle",
    learning: {
      concept: "Linux namespaces + cgroup pids controller",
      meaning:
        "Each container gets its own PID namespace (its processes see only their own PIDs) and a cgroup pids.max ceiling. When the cgroup hits the cap, fork() returns EAGAIN.",
      enterprise_impact:
        "Without this isolation, one buggy workload would fork-bomb the entire node — a classic noisy-neighbor outage.",
      fresher_view:
        "Containers can only create so many processes. When they hit the limit, new processes fail until old ones exit.",
      engineer_view:
        "PID namespace isolates /proc visibility; cgroup v2 pids controller enforces pids.max. runc wires both at container create. The container's PID 1 never sees host PIDs.",
      commands_bash: [
        "docker stats stress-worker",
        "cat /sys/fs/cgroup/system.slice/docker-<id>.scope/pids.current",
        "nsenter -t <pid> -p ps aux",
        "docker update --pids-limit=400 stress-worker",
      ],
      commands_powershell: [
        "docker stats stress-worker",
        "docker update --pids-limit 400 stress-worker",
      ],
      recovery: [
        "Raise --pids-limit on the container or recreate with a sane cap.",
        "Patch the entrypoint to avoid uncontrolled fork loops.",
        "Add Prometheus alert on container_pids_current / max > 0.8.",
      ],
    },
  },

  {
    id: "K8S-INC-1036",
    title: "Overlay filesystem full — /var/lib/docker at 100%",
    severity: "high",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "dockerd",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(30),
    last_event_at: iso(2),
    failure_chain: "Build → Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "All containers on lab-docker-01.",
      what: "New container starts and image pulls fail with 'no space left on device' on the overlay2 storage driver.",
      where: "/var/lib/docker/overlay2 — 100% full.",
      when: `${iso(30)} — 30m ago.`,
      why: "Accumulated image layers + writable container layers + dangling build cache filled the partition.",
      how: "df -h /var/lib/docker → 100% used; docker system df shows 38 GB of unused images.",
      severity_rationale: "HIGH — host cannot start or build containers until disk is reclaimed.",
    },
    description:
      "The union/overlay filesystem ran out of space. Demonstrates how Docker layers stack as read-only image layers + a writable container layer on top.",
    original_event: `$ docker run nginx
docker: Error response from daemon: failed to register layer: write /var/lib/docker/overlay2/...: no space left on device.
$ df -h /var/lib/docker
/dev/nvme0n1p1   50G   50G    0G  100%`,
    affected: [
      { kind: "Container", name: "(host)", detail: "overlay2 dir 100% full", action: "docker system prune.", severity: "high" },
    ],
    aligned_tools: ["Docker", "containerd", "journalctl"],
    data_sources: ["dockerd", "kernel-fs"],
    logs_sample: `dockerd: failed to register layer: no space left on device
kernel: EXT4-fs warning (device nvme0n1p1): ext4_dx_add_entry:2453: Directory index full!`,
    metrics_sample: `node_filesystem_avail_bytes{mountpoint="/var/lib/docker"} 0
docker_image_count 412 (unused 287)`,
    response_actions: ["docker system prune -af", "Move overlay to bigger volume", "Set log-driver rotation"],
    next_steps: [
      { level: "L1", text: "docker system prune -af --volumes (reclaim dangling images/volumes)." },
      { level: "L2", text: "Configure daemon.json log-opts max-size=10m max-file=3." },
      { level: "L3", text: "Move /var/lib/docker to a dedicated 200 GB volume." },
    ],
    lab_slug: "k8s-container-lifecycle",
    learning: {
      concept: "overlayfs + writable container layer",
      meaning:
        "Docker stacks image layers read-only under a thin writable container layer using overlayfs. When the underlying disk fills up, the whole stack stops working.",
      enterprise_impact:
        "Build agents and K8s nodes that run many short-lived containers fill /var/lib/docker quickly without log rotation and prune jobs.",
      fresher_view:
        "Docker keeps every image you've ever pulled. If the disk fills, nothing new can start.",
      engineer_view:
        "overlay2 driver maintains lowerdir (image layers) + upperdir (container changes) + merged view. Writes copy-up files from lower to upper. Unused image layers persist until `docker image prune`.",
      commands_bash: [
        "df -h /var/lib/docker",
        "docker system df",
        "docker system prune -af --volumes",
        "ls /var/lib/docker/overlay2 | wc -l",
      ],
      commands_powershell: [
        "docker system df",
        "docker system prune -af --volumes",
      ],
      recovery: [
        "Prune dangling images, stopped containers, unused volumes.",
        "Add log rotation (max-size, max-file) to daemon.json.",
        "Provision more disk or move /var/lib/docker to a separate volume.",
      ],
    },
  },

  {
    id: "K8S-INC-1037",
    title: "Detached container exited silently — no restart policy",
    severity: "low",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "worker-batch",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(60),
    last_event_at: iso(5),
    failure_chain: "Run → Observe",
    current_phase: "observe",
    failed_phases: ["run"],
    briefing: {
      who: "Container `worker-batch` started with `docker run -d`.",
      what: "Container exited with code 0 after 12s; nothing surfaced to the user.",
      where: "lab-docker-01.",
      when: `${iso(60)} — 60m ago.`,
      why: "Foreground job finished and the container had no restart policy.",
      how: "`docker ps -a` shows status Exited (0); `docker logs` shows the job completed.",
      severity_rationale: "LOW — by design, but teaches the difference between foreground and detached mode.",
    },
    description:
      "Detached containers do not stream logs to the user terminal. Without a restart policy or a long-running PID 1, they exit silently when their command completes.",
    original_event: `$ docker run -d --name worker-batch worker:1.0 ./run.sh
8a1c...
$ docker ps     # nothing
$ docker ps -a
CONTAINER ID   IMAGE        STATUS                     NAMES
8a1c...        worker:1.0   Exited (0) 5 minutes ago   worker-batch`,
    affected: [
      { kind: "Container", name: "worker-batch", detail: "Exited (0) — no restart", action: "Add --restart=on-failure or run a supervisor.", severity: "low" },
    ],
    aligned_tools: ["Docker", "containerd", "journalctl"],
    data_sources: ["dockerd"],
    logs_sample: `docker logs worker-batch
[run.sh] processed 1200 records in 12.3s
[run.sh] done.`,
    metrics_sample: `container_state_exited{name="worker-batch"} 1`,
    response_actions: ["Re-run with --restart", "Move to Compose", "Move to K8s Job"],
    next_steps: [
      { level: "L1", text: "docker run --restart=on-failure:5 ..." },
      { level: "L2", text: "Wrap in a docker-compose service with restart: unless-stopped." },
      { level: "L3", text: "Migrate to a Kubernetes Job / CronJob for retries + observability." },
    ],
    lab_slug: "k8s-container-lifecycle",
    learning: {
      concept: "Foreground vs detached mode + restart policies",
      meaning:
        "`-d` runs detached — Docker only prints the container ID. When the foreground process (PID 1) exits, the container exits with it. Restart policies tell Docker what to do next.",
      enterprise_impact:
        "Misunderstood lifecycle = 'why did my worker just disappear?' tickets. Production batch jobs belong on a supervisor (Compose, K8s Job).",
      fresher_view:
        "If you run a container in the background, it stops when its main program finishes. Use logs to see why.",
      engineer_view:
        "Container lifetime == lifetime of PID 1. Restart policies: no | on-failure[:N] | always | unless-stopped. Detached containers stream stdout to the json-file log driver; use `docker logs -f` to follow.",
      commands_bash: [
        "docker ps -a",
        "docker logs -f worker-batch",
        "docker inspect worker-batch --format '{{.State.ExitCode}}'",
        "docker run --restart=on-failure:5 -d worker:1.0",
      ],
      commands_powershell: [
        "docker ps -a",
        "docker logs worker-batch",
        "docker run --restart=on-failure:5 -d worker:1.0",
      ],
      recovery: [
        "Re-run with an explicit restart policy.",
        "Move the workload to Compose or a K8s Job for retries + history.",
      ],
    },
  },

  {
    id: "K8S-INC-1038",
    title: "containerd crash — runtime hierarchy broken",
    severity: "critical",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "containerd",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(7),
    last_event_at: iso(1),
    failure_chain: "Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "containerd on lab-docker-01 (and by extension every container managed by Docker / kubelet).",
      what: "containerd crashed; all `docker run` and `crictl run` calls now hang or fail.",
      where: "lab-docker-01 host.",
      when: `${iso(7)} — 7m ago.`,
      why: "containerd shim crashed after an OOM in the host caused the runc binary to be killed mid-exec.",
      how: "journalctl -u containerd shows 'shim disconnected'; runc state returns no such file.",
      severity_rationale: "CRITICAL — Docker depends on containerd which depends on runc. The whole runtime is down.",
    },
    description:
      "Demonstrates the runtime hierarchy: Docker CLI → dockerd → containerd → runc. Killing any link breaks everything above it.",
    original_event: `$ docker run -d nginx
docker: Error response from daemon: failed to start shim: fork/exec /usr/bin/containerd-shim-runc-v2: no such file or directory.
$ systemctl status containerd
× containerd.service
     Active: failed`,
    affected: [
      { kind: "Container", name: "(all)", detail: "runtime down", action: "Restart containerd, then dockerd.", severity: "critical" },
    ],
    aligned_tools: ["Docker", "containerd", "runc", "crictl", "journalctl"],
    data_sources: ["systemd", "containerd", "kernel"],
    logs_sample: `containerd: shim disconnected id=4f1a... error="exit status 1"
containerd: failed to handle exit event for "4f1a"
dockerd: failed to start container: error during connect`,
    metrics_sample: `containerd_up 0
container_runtime_errors_total 47 (last 5m)`,
    response_actions: ["systemctl restart containerd", "crictl info", "systemctl restart docker"],
    next_steps: [
      { level: "L1", text: "systemctl restart containerd && systemctl restart docker." },
      { level: "L2", text: "Verify with `crictl info` and `docker info`." },
      { level: "L3", text: "Investigate the kernel OOM that killed runc — add memory headroom to the host." },
    ],
    lab_slug: "k8s-docker-install-tour",
    learning: {
      concept: "Container runtime hierarchy (Docker → containerd → runc)",
      meaning:
        "Docker no longer runs containers itself — it delegates to containerd, which delegates to runc. K8s skips Docker entirely and talks to containerd via the CRI socket.",
      enterprise_impact:
        "If containerd dies on a K8s node, kubelet marks it NotReady and the scheduler evacuates pods. The 2020 dockershim deprecation made this layer the new contract.",
      fresher_view:
        "Docker is actually three programs stacked on top of each other. If the middle one breaks, nothing works.",
      engineer_view:
        "containerd-shim-runc-v2 is the per-container supervisor process. dockerd talks over the containerd GRPC API at /run/containerd/containerd.sock. CRI plugin presents the same API to kubelet.",
      commands_bash: [
        "systemctl status containerd",
        "ctr --namespace moby containers list",
        "crictl ps",
        "ls /run/containerd/",
        "journalctl -u containerd -n 200 --no-pager",
      ],
      commands_powershell: [
        "Get-Service containerd",
        "Restart-Service containerd",
      ],
      recovery: [
        "Restart containerd, then docker.",
        "Verify with crictl info + docker info.",
        "Root-cause why the shim died (OOM, panic, upgrade).",
      ],
    },
  },

  {
    id: "K8S-INC-1039",
    title: "Noisy-neighbor — single container hogging host CPU",
    severity: "medium",
    status: "in_progress",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "bench-worker",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(25),
    last_event_at: iso(2),
    failure_chain: "Run → Observe",
    current_phase: "observe",
    failed_phases: ["run"],
    briefing: {
      who: "Container `bench-worker` and every other container sharing the host.",
      what: "bench-worker is consuming 780% CPU on an 8-core host with no `--cpus` limit; sibling containers see 30% throughput drop.",
      where: "lab-docker-01.",
      when: `${iso(25)} — 25m ago.`,
      why: "CPU cgroup is unrestricted; the kernel CFS scheduler shares fairly but a hot loop saturates all cores.",
      how: "`docker stats` shows CPU 780%; sibling p95 latency doubled at the same timestamp.",
      severity_rationale: "MEDIUM — noisy-neighbor pattern; classic teaching moment for CPU cgroups and resource limits.",
    },
    description:
      "Without CPU limits, one container can starve every other workload on the host. Docker uses the cpu cgroup (cpu.shares + cpu.cfs_quota) to enforce fairness.",
    original_event: `$ docker stats --no-stream
NAME            CPU %   MEM USAGE / LIMIT
bench-worker    782.4%  120MiB / 7.7GiB
api-svc         12.0%   180MiB / 512MiB  (p95 ↑)`,
    affected: [
      { kind: "Container", name: "bench-worker", detail: "no --cpus set", action: "Apply --cpus=2.", severity: "medium" },
      { kind: "Container", name: "api-svc",      detail: "latency p95 doubled", action: "Re-test after limit applied.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "containerd", "Prometheus", "Grafana"],
    data_sources: ["dockerd", "cAdvisor", "prom"],
    logs_sample: `cadvisor: container_cpu_usage_seconds_total{name="bench-worker"} steep slope`,
    metrics_sample: `container_cpu_usage_seconds_total{name="bench-worker"}  ↑↑
container_cpu_cfs_throttled_seconds_total{name="api-svc"}  rising`,
    response_actions: ["docker update --cpus=2", "Set --cpu-shares", "Move to K8s with requests/limits"],
    next_steps: [
      { level: "L1", text: "docker update --cpus=2 bench-worker." },
      { level: "L2", text: "Add CPU limits to every container in compose / Helm values." },
      { level: "L3", text: "Migrate to K8s where CPU requests and limits are enforced per pod." },
    ],
    lab_slug: "k8s-pull-run-inspect",
    learning: {
      concept: "CPU cgroups (cpu.shares / cpu.cfs_quota)",
      meaning:
        "The cpu cgroup gives the kernel CFS scheduler quotas and weights per container. Without them, every container competes equally for every core.",
      enterprise_impact:
        "Multi-tenant nodes need limits or one workload silently degrades the SLOs of its neighbors — a textbook noisy-neighbor incident.",
      fresher_view:
        "If one container has no CPU limit, it can use all the host's CPU and slow down everything else.",
      engineer_view:
        "cgroup v2: cpu.max=quota period (e.g. 200000 100000 = 2 cores). cpu.weight controls share when uncapped. Throttling shows up as container_cpu_cfs_throttled_seconds_total.",
      commands_bash: [
        "docker stats --no-stream",
        "docker update --cpus=2 bench-worker",
        "cat /sys/fs/cgroup/system.slice/docker-<id>.scope/cpu.max",
      ],
      commands_powershell: [
        "docker stats --no-stream",
        "docker update --cpus 2 bench-worker",
      ],
      recovery: [
        "Apply --cpus to the offender immediately.",
        "Standardise resource limits in compose / Helm.",
        "Add CFS throttling alert in Prometheus.",
      ],
    },
  },

  {
    id: "K8S-INC-1040",
    title: "seccomp blocked syscall — keyctl denied",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "java-app",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(14),
    last_event_at: iso(1),
    failure_chain: "Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Container `java-app` using a JDK that calls keyctl().",
      what: "Container fails to start; strace shows EPERM on the keyctl syscall.",
      where: "Docker default seccomp profile on lab-docker-01.",
      when: `${iso(14)} — 14m ago.`,
      why: "Default seccomp profile blocks ~50 syscalls including keyctl(); JDK 21 calls it during init.",
      how: "auditd / falco logs show seccomp=killed action=ERRNO syscall=250.",
      severity_rationale: "MEDIUM — teaches Linux syscall filtering; easy unblock with a custom profile.",
    },
    description:
      "Docker's default seccomp profile is a syscall allow-list. Some workloads need additional syscalls and fail until the profile is adjusted.",
    original_event: `$ docker run java-app
java.lang.UnsatisfiedLinkError: ... keyctl: Operation not permitted (errno 1)
Exited (1)`,
    affected: [
      { kind: "Container", name: "java-app", detail: "seccomp EPERM on keyctl", action: "Apply custom seccomp profile.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "containerd", "runc", "Falco", "journalctl"],
    data_sources: ["dockerd", "auditd", "falco"],
    logs_sample: `auditd: type=SECCOMP arch=c000003e syscall=250 (keyctl) comp=killed
falco: container=java-app violated rule "Seccomp blocked syscall"`,
    metrics_sample: `seccomp_violations_total{container="java-app"} 3`,
    response_actions: ["Apply seccomp=unconfined (lab only)", "Author custom profile", "File issue with JDK base image"],
    next_steps: [
      { level: "L1", text: "Test with --security-opt seccomp=unconfined (DO NOT use in prod)." },
      { level: "L2", text: "Author custom profile allowing keyctl + apply via --security-opt seccomp=./profile.json." },
      { level: "L3", text: "Switch base image to one that pre-ships a compatible profile." },
    ],
    lab_slug: "k8s-container-lifecycle",
    learning: {
      concept: "seccomp syscall filtering",
      meaning:
        "Docker installs a seccomp BPF filter on every new container, blocking dangerous syscalls. Workloads that need a blocked syscall fail with EPERM.",
      enterprise_impact:
        "Runtime security teams own seccomp profiles. Tightening profiles reduces blast radius of CVEs like Dirty Pipe / runc escapes.",
      fresher_view:
        "Docker only lets containers make certain low-level calls to the kernel. If your app needs a blocked one, it crashes.",
      engineer_view:
        "Default profile lives in /usr/share/docker/seccomp/default.json (~700 lines). BPF compiled by runc and attached pre-exec. K8s exposes the same via seccompProfile in PodSecurityContext.",
      commands_bash: [
        "docker run --security-opt seccomp=unconfined ...",
        "strace -f -e seccomp ...",
        "ausearch -m SECCOMP",
      ],
      commands_powershell: [
        "docker run --security-opt seccomp=unconfined ...",
      ],
      recovery: [
        "Identify the blocked syscall via auditd / strace.",
        "Author a custom profile that allows it.",
        "Roll out via Docker --security-opt or K8s seccompProfile.",
      ],
    },
  },

  {
    id: "K8S-INC-1041",
    title: "Port binding conflict — 0.0.0.0:8080 already in use",
    severity: "low",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "web-app",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(9),
    last_event_at: iso(1),
    failure_chain: "Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Container `web-app` started with `-p 8080:80`.",
      what: "docker run fails: 'address already in use' on host port 8080.",
      where: "lab-docker-01.",
      when: `${iso(9)} — 9m ago.`,
      why: "Another container (api-svc) already publishes 0.0.0.0:8080 → container:8080.",
      how: "`docker ps --filter publish=8080` shows the existing binding.",
      severity_rationale: "LOW — config issue; teaches Docker bridge networking and -p mapping.",
    },
    description:
      "Docker -p creates an iptables DNAT rule from host:port → container:port via the docker0 bridge. Two containers cannot publish the same host port.",
    original_event: `$ docker run -d -p 8080:80 web-app
docker: Error response from daemon: driver failed programming external connectivity on endpoint web-app:
Bind for 0.0.0.0:8080 failed: port is already allocated.`,
    affected: [
      { kind: "Container", name: "web-app", detail: "host port 8080 already bound", action: "Choose another host port.", severity: "low" },
    ],
    aligned_tools: ["Docker", "containerd", "journalctl"],
    data_sources: ["dockerd", "iptables", "netstat"],
    logs_sample: `dockerd: failed to allocate port 8080: address already in use
ss -ltnp | grep 8080  -> docker-proxy LISTEN`,
    metrics_sample: `docker_port_bind_errors_total 4`,
    response_actions: ["Pick another host port", "Use a reverse proxy", "Move to K8s Service"],
    next_steps: [
      { level: "L1", text: "docker run -p 8081:80 web-app." },
      { level: "L2", text: "Front containers with an Nginx reverse proxy on :80." },
      { level: "L3", text: "Migrate to K8s Services where port collisions are scoped to the cluster network." },
    ],
    lab_slug: "k8s-pull-run-inspect",
    learning: {
      concept: "Docker bridge networking + port publishing",
      meaning:
        "`-p host:container` creates an iptables DNAT rule from the host to the container's IP on the docker0 bridge. The host port must be free.",
      enterprise_impact:
        "On dev hosts and CI agents, port collisions are a daily frustration. Production K8s replaces this with Services + LoadBalancers.",
      fresher_view:
        "Two programs can't listen on the same port at the same time, even if one of them is in a container.",
      engineer_view:
        "docker-proxy or iptables DNAT (depending on userland-proxy setting) forwards traffic. The container itself listens on its own network namespace inside the bridge subnet (172.17.0.0/16 by default).",
      commands_bash: [
        "docker ps --filter publish=8080",
        "ss -ltnp | grep 8080",
        "iptables -t nat -L DOCKER",
        "docker run -p 8081:80 web-app",
      ],
      commands_powershell: [
        "docker ps --filter publish=8080",
        "Get-NetTCPConnection -LocalPort 8080",
      ],
      recovery: [
        "Pick another host port or stop the conflicting container.",
        "Introduce a reverse proxy or move to K8s for cluster-scoped networking.",
      ],
    },
  },

  {
    id: "K8S-INC-1042",
    title: "Docker socket permission denied — non-root user",
    severity: "low",
    status: "open",
    owner: "platform-oncall",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "dockerd",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    detected_at: iso(5),
    last_event_at: iso(1),
    failure_chain: "Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "User `student01` running `docker ps` on lab-docker-01.",
      what: "Got 'permission denied while trying to connect to /var/run/docker.sock'.",
      where: "lab-docker-01.",
      when: `${iso(5)} — 5m ago.`,
      why: "User is not in the `docker` Unix group; the socket is owned by root:docker mode 0660.",
      how: "ls -l /var/run/docker.sock confirms; id student01 shows no docker group.",
      severity_rationale: "LOW — by design; teaches Docker daemon = root-equivalent access.",
    },
    description:
      "The Docker socket is effectively root access. Granting access via the `docker` group is convenient but a documented security trade-off.",
    original_event: `$ docker ps
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock.`,
    affected: [
      { kind: "Container", name: "(client)", detail: "user denied", action: "Add user to docker group OR use rootless Docker.", severity: "low" },
    ],
    aligned_tools: ["Docker", "Docker Desktop", "journalctl"],
    data_sources: ["dockerd"],
    logs_sample: `dockerd: client connect failed: permission denied (socket=docker.sock uid=1001)`,
    metrics_sample: `docker_client_auth_failures_total 12`,
    response_actions: ["usermod -aG docker", "Switch to rootless Docker", "Use sudo"],
    next_steps: [
      { level: "L1", text: "sudo usermod -aG docker student01 && newgrp docker." },
      { level: "L2", text: "Consider rootless Docker for shared hosts." },
      { level: "L3", text: "On K8s nodes, do not give human users docker socket access — use kubectl + RBAC." },
    ],
    lab_slug: "k8s-docker-install-tour",
    learning: {
      concept: "Docker socket = root-equivalent",
      meaning:
        "Anyone who can talk to /var/run/docker.sock can launch a privileged container that mounts the host root filesystem. The docker group is, effectively, the root group.",
      enterprise_impact:
        "Auditors flag docker group membership. Rootless Docker and sudo wrappers exist precisely because of this risk.",
      fresher_view:
        "By default you need to be root (or in the docker group) to use Docker. There's a good security reason.",
      engineer_view:
        "The socket is a Unix domain socket with mode 0660 owned by root:docker. Daemon trusts every connection equally — there is no per-user auth.",
      commands_bash: [
        "ls -l /var/run/docker.sock",
        "id",
        "sudo usermod -aG docker $USER",
        "newgrp docker",
      ],
      commands_powershell: [
        "Get-LocalGroupMember docker-users",
        "Add-LocalGroupMember docker-users -Member $env:USERNAME",
      ],
      recovery: [
        "Add the user to the docker group, or use sudo.",
        "Long term: evaluate rootless Docker or restrict to a CI service account.",
      ],
    },
  },

  /* ============================================================
   * MODULE 2 — Building Docker Images & Containerized Apps
   * Deep-learning incidents (build, registry, security, images)
   * ============================================================ */

  {
    id: "K8S-INC-1043",
    title: "Image bloat — payments-api grew from 210MB to 1.4GB",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "ci-runner",
    namespace: "ci",
    service: "payments-api (build)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(40),
    last_event_at: iso(3),
    failure_chain: "Build → Push → Deploy",
    current_phase: "build",
    failed_phases: ["build"],
    briefing: {
      who: "CI image build for payments-api:1.43.0.",
      what: "Image grew 6.6× to 1.4 GB after a refactor; rollouts now take 3× longer.",
      where: "ghcr.io/shadowx/payments-api.",
      when: `${iso(40)} — 40m ago.`,
      why: "Dev added the full JDK + maven cache + node_modules into the final image (no multi-stage).",
      how: "`docker history` shows three RUN layers > 300 MB each.",
      severity_rationale: "MEDIUM — production pulls slowed; demonstrates multi-stage build value.",
    },
    description:
      "Single-stage Dockerfile shipped build-time toolchain to production. Teaches multi-stage builds and minimal base images.",
    original_event: `$ docker images ghcr.io/shadowx/payments-api
REPOSITORY                          TAG     SIZE
ghcr.io/shadowx/payments-api        1.42.0  214MB
ghcr.io/shadowx/payments-api        1.43.0  1.39GB`,
    affected: [
      { kind: "Image", name: "ghcr.io/shadowx/payments-api:1.43.0", detail: "1.4GB · slow pulls", action: "Rewrite as multi-stage.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "BuildKit", "GHCR", "GitHub Actions"],
    data_sources: ["buildkit", "registry-audit"],
    logs_sample: `docker history payments-api:1.43.0
RUN mvn package                                     412MB
RUN apt-get install -y openjdk-21-jdk maven git    387MB
COPY . /src                                          92MB`,
    metrics_sample: `image_size_bytes{tag="1.43.0"} 1.39e9
deploy_rollout_seconds{service="payments-api"} 410 (was 140)`,
    response_actions: ["Rewrite multi-stage", "Switch to distroless", "Add image-size CI gate"],
    next_steps: [
      { level: "L1", text: "Move build into a builder stage; FROM eclipse-temurin:21-jre for the final stage." },
      { level: "L2", text: "Add `.dockerignore` to exclude .git, target, node_modules from context." },
      { level: "L3", text: "Add a CI gate that fails when image size grows > 20%." },
    ],
    lab_slug: "k8s-write-dockerfile",
    learning: {
      concept: "Multi-stage builds + minimal base images",
      meaning:
        "Multi-stage builds keep heavy build toolchains (JDK, maven, gcc) in a builder stage and copy only the runtime artifact into a slim final image.",
      enterprise_impact:
        "Image size directly drives pull time, registry cost, attack surface and cold-start latency. Multi-stage is the single biggest lever.",
      fresher_view:
        "Don't ship the tools you used to build your app — only ship the app.",
      engineer_view:
        "BuildKit runs stages in parallel where possible. Final image inherits only the COPY --from=builder layers. distroless removes shell + package manager entirely.",
      commands_bash: [
        "docker history ghcr.io/shadowx/payments-api:1.43.0",
        "docker image inspect ghcr.io/shadowx/payments-api:1.43.0 --format '{{.Size}}'",
        "docker build --target runtime -t app:slim .",
        "dive ghcr.io/shadowx/payments-api:1.43.0",
      ],
      commands_powershell: [
        "docker history ghcr.io/shadowx/payments-api:1.43.0",
        "docker image inspect ghcr.io/shadowx/payments-api:1.43.0",
      ],
      recovery: [
        "Refactor Dockerfile to two stages: builder + runtime.",
        "Add .dockerignore.",
        "Pin a slim or distroless base image.",
      ],
    },
  },

  {
    id: "K8S-INC-1044",
    title: "Secret leaked into image layer — AWS key found by Trivy",
    severity: "high",
    status: "in_progress",
    owner: "appsec-team",
    cluster: "ci-runner",
    namespace: "ci",
    service: "data-loader (build)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(28),
    last_event_at: iso(2),
    failure_chain: "Build → Scan",
    current_phase: "scan",
    failed_phases: ["scan"],
    briefing: {
      who: "Trivy scan of ghcr.io/shadowx/data-loader:0.9.4.",
      what: "Long-lived AWS access key embedded in layer 3 (COPY ./.env).",
      where: "Image already pushed to GHCR (public visibility).",
      when: `${iso(28)} — 28m ago.`,
      why: "Developer ran `COPY . /app` without a `.dockerignore`; .env containing AKIA… was baked in.",
      how: "trivy image --scanners secret found AWS access key id pattern in /app/.env.",
      severity_rationale: "HIGH — key must be rotated immediately; image must be purged from registry.",
    },
    description:
      "Image layers are immutable — deleting the file in a later layer does not remove it from history. Any secret COPYed in is leaked.",
    original_event: `$ trivy image --scanners secret ghcr.io/shadowx/data-loader:0.9.4
HIGH: AWS Access Key ID
  file: /app/.env
  layer: sha256:abc123...
  ruleID: aws-access-key-id`,
    affected: [
      { kind: "Image", name: "ghcr.io/shadowx/data-loader:0.9.4", detail: "AWS key in layer 3", action: "Rotate key, delete image, scrub history.", severity: "critical" },
    ],
    aligned_tools: ["Trivy", "Snyk", "Docker", "GHCR", "GitHub Actions"],
    data_sources: ["trivy", "registry-audit"],
    logs_sample: `trivy: secret detected: AWS Access Key ID  layer=sha256:abc123
gh-actions: build pushed image to ghcr.io/shadowx/data-loader:0.9.4 by user dev42`,
    metrics_sample: `trivy_secret_findings_total{severity="HIGH"} 1`,
    cves: [
      { id: "SECRET-AWS-001", cvss: 9.1, title: "Hard-coded AWS access key in image layer" },
    ],
    response_actions: ["Rotate AWS key", "Delete image tag", "Add .dockerignore", "Enforce secret scanner in CI"],
    next_steps: [
      { level: "L1", text: "Rotate the AWS key immediately." },
      { level: "L2", text: "ghcr delete tag 0.9.4; rebuild with .dockerignore + BuildKit secret mount." },
      { level: "L3", text: "Gate CI on trivy --exit-code 1 --scanners secret." },
    ],
    lab_slug: "k8s-write-dockerfile",
    learning: {
      concept: "Image layer immutability + secrets",
      meaning:
        "Once a file is committed to a layer, it lives there forever — even if a later layer deletes it. Secrets baked into any layer are exfiltrable.",
      enterprise_impact:
        "Public registries are continuously crawled by attackers. A leaked key in a public image is compromised within minutes.",
      fresher_view:
        "Never put passwords or keys in your Dockerfile. They stay in the image forever.",
      engineer_view:
        "Use BuildKit's --mount=type=secret to mount secrets into a RUN step without persisting them. Use .dockerignore to keep .env / .git out of the build context.",
      commands_bash: [
        "trivy image --scanners secret ghcr.io/shadowx/data-loader:0.9.4",
        "docker history --no-trunc ghcr.io/shadowx/data-loader:0.9.4",
        "DOCKER_BUILDKIT=1 docker build --secret id=aws,src=$HOME/.aws/credentials .",
      ],
      commands_powershell: [
        "trivy image --scanners secret ghcr.io/shadowx/data-loader:0.9.4",
        "docker history ghcr.io/shadowx/data-loader:0.9.4",
      ],
      recovery: [
        "Rotate the credential at the source.",
        "Delete and re-tag the image; force pull on all clusters.",
        "Wire trivy / Snyk secret scan into CI gate.",
      ],
    },
  },

  {
    id: "K8S-INC-1045",
    title: "Trivy HIGH CVE — vulnerable base image (xz-utils backdoor)",
    severity: "high",
    status: "open",
    owner: "appsec-team",
    cluster: "ci-runner",
    namespace: "ci",
    service: "billing-api (scan)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(50),
    last_event_at: iso(4),
    failure_chain: "Build → Scan → Push",
    current_phase: "scan",
    failed_phases: ["scan"],
    briefing: {
      who: "Trivy scan of ghcr.io/shadowx/billing-api:2.4.0.",
      what: "CVE-2024-3094 (xz-utils backdoor, CVSS 9.8) in base image debian:bookworm-slim.",
      where: "CI scan gate; push blocked.",
      when: `${iso(50)} — 50m ago.`,
      why: "Base image not rebased since March 2024; vulnerable xz package still present.",
      how: "trivy image --severity HIGH,CRITICAL returned 1 critical, 3 high.",
      severity_rationale: "HIGH — supply-chain critical; do not push image until base is updated.",
    },
    description:
      "Base images age. Trivy detects known CVEs and Snyk surfaces upgrade paths. Pipeline gates on HIGH/CRITICAL to keep vulnerable workloads out of production.",
    original_event: `$ trivy image --severity HIGH,CRITICAL ghcr.io/shadowx/billing-api:2.4.0
CVE-2024-3094  CRITICAL  xz-utils  5.6.0  -> 5.6.2
CVE-2024-21338 HIGH      libkernel 5.15   -> 5.15.146
Total: 4 vulnerabilities (HIGH: 3, CRITICAL: 1)`,
    affected: [
      { kind: "Image", name: "ghcr.io/shadowx/billing-api:2.4.0", detail: "1 CRITICAL, 3 HIGH", action: "Rebase, rebuild, rescan.", severity: "high" },
    ],
    aligned_tools: ["Trivy", "Snyk", "Docker", "GHCR", "GitHub Actions"],
    data_sources: ["trivy", "snyk", "actions-runner"],
    logs_sample: `trivy: 4 vulnerabilities found (HIGH:3 CRITICAL:1) in debian:bookworm-slim
actions: scan-job failed exit 1`,
    metrics_sample: `trivy_findings_total{sev="CRITICAL"} 1
trivy_findings_total{sev="HIGH"}     3`,
    cves: [
      { id: "CVE-2024-3094",  cvss: 9.8, title: "xz-utils backdoor (supply-chain)" },
      { id: "CVE-2024-21338", cvss: 7.8, title: "Linux kernel info-leak" },
    ],
    response_actions: ["Bump base image digest", "Re-run scan", "Pin distroless"],
    next_steps: [
      { level: "L1", text: "FROM debian:bookworm-slim@sha256:<latest patched digest>." },
      { level: "L2", text: "Re-run trivy; ensure 0 HIGH/CRITICAL before push." },
      { level: "L3", text: "Migrate to distroless or chainguard base for shrinking CVE surface." },
    ],
    lab_slug: "k8s-build-tag-image",
    learning: {
      concept: "CVE scanning + base image lifecycle",
      meaning:
        "Every base image inherits the CVEs of the packages it ships. CI scanners (Trivy, Snyk) match installed package versions against the NVD and gate the pipeline.",
      enterprise_impact:
        "Audit + compliance teams report on HIGH/CRITICAL findings. Unscanned images cannot enter production in most enterprises.",
      fresher_view:
        "Old base images have known security holes. The scanner blocks them.",
      engineer_view:
        "Pin by digest (sha256:…), not tag. Track upstream advisories. Distroless / chainguard remove package managers entirely, shrinking the CVE surface.",
      commands_bash: [
        "trivy image --severity HIGH,CRITICAL ghcr.io/shadowx/billing-api:2.4.0",
        "snyk container test ghcr.io/shadowx/billing-api:2.4.0",
        "docker pull debian:bookworm-slim && docker image inspect debian:bookworm-slim --format '{{.RepoDigests}}'",
      ],
      commands_powershell: [
        "trivy image ghcr.io/shadowx/billing-api:2.4.0",
        "snyk container test ghcr.io/shadowx/billing-api:2.4.0",
      ],
      recovery: [
        "Bump base image to patched digest.",
        "Rebuild + rescan + push.",
        "Track upstream CVE feeds (GitHub advisory, Debian DSA).",
      ],
    },
  },

  {
    id: "K8S-INC-1046",
    title: "Build cache invalidated — every build is 4× slower",
    severity: "low",
    status: "open",
    owner: "platform-oncall",
    cluster: "ci-runner",
    namespace: "ci",
    service: "frontend-web (build)",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(55),
    last_event_at: iso(5),
    failure_chain: "Code → Build",
    current_phase: "build",
    failed_phases: ["build"],
    briefing: {
      who: "frontend-web CI build.",
      what: "Build time jumped from 90s to 360s on every commit.",
      where: "ci-runner, BuildKit.",
      when: `${iso(55)} — since the Dockerfile refactor 1h ago.`,
      why: "Developer moved `COPY . /app` above `COPY package.json && RUN npm install`, invalidating the install layer on every code change.",
      how: "BuildKit logs show CACHED on 0/12 steps after refactor; previously 9/12.",
      severity_rationale: "LOW — developer-experience regression; teaches layer caching + ordering.",
    },
    description:
      "Docker rebuilds every layer from the first instruction whose inputs changed. Bad COPY ordering invalidates the expensive `npm install` layer on every commit.",
    original_event: `#3 [2/8] COPY . /app
#3 DONE 0.4s
#4 [3/8] RUN npm install
#4  ... 287s`,
    affected: [
      { kind: "Image", name: "frontend-web:edge", detail: "no cache hits", action: "Re-order Dockerfile (deps first).", severity: "low" },
    ],
    aligned_tools: ["Docker", "BuildKit", "GitHub Actions"],
    data_sources: ["buildkit", "actions-runner"],
    logs_sample: `BuildKit: cache miss at COPY . /app
BuildKit: rebuilding RUN npm install (287.4s)`,
    metrics_sample: `ci_build_duration_seconds{repo="frontend-web"} 360 (was 90)
ci_cache_hit_ratio{repo="frontend-web"} 0.0 (was 0.75)`,
    response_actions: ["Re-order Dockerfile", "Add cache mount", "Use buildx --cache-from"],
    next_steps: [
      { level: "L1", text: "Move COPY package.json + RUN npm ci ABOVE COPY . /app." },
      { level: "L2", text: "Add RUN --mount=type=cache,target=/root/.npm npm ci." },
      { level: "L3", text: "Use buildx --cache-from=type=registry for cross-runner cache." },
    ],
    lab_slug: "k8s-build-tag-image",
    learning: {
      concept: "Build cache + layer ordering",
      meaning:
        "Docker hashes each instruction's inputs. The first instruction whose hash changes invalidates every layer below it. Put rarely-changing things (deps) above frequently-changing things (source).",
      enterprise_impact:
        "Cache hit ratio drives CI cost and developer feedback time. A 4× build regression burns engineering hours daily.",
      fresher_view:
        "Put things that change often at the bottom of the Dockerfile.",
      engineer_view:
        "BuildKit content-addresses layers. --mount=type=cache persists dep cache across builds without bloating the image. Remote cache (--cache-from) shares cache between runners.",
      commands_bash: [
        "DOCKER_BUILDKIT=1 docker build --progress=plain .",
        "docker buildx build --cache-from=type=registry,ref=ghcr.io/shadowx/cache:frontend .",
        "docker history frontend-web:edge",
      ],
      commands_powershell: [
        "$env:DOCKER_BUILDKIT=1; docker build .",
      ],
      recovery: [
        "Reorder Dockerfile: deps → source.",
        "Add cache mounts for package managers.",
        "Enable remote BuildKit cache.",
      ],
    },
  },

  {
    id: "K8S-INC-1047",
    title: "Wrong ENTRYPOINT — container exited 127 (command not found)",
    severity: "medium",
    status: "open",
    owner: "checkout-team",
    cluster: "lab-docker-01",
    namespace: "docker-host",
    service: "checkout-worker",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(11),
    last_event_at: iso(1),
    failure_chain: "Build → Run",
    current_phase: "run",
    failed_phases: ["run"],
    briefing: {
      who: "Container checkout-worker started from image checkout-worker:1.7.",
      what: "Container exits immediately with code 127.",
      where: "lab-docker-01.",
      when: `${iso(11)} — 11m ago.`,
      why: "Dockerfile used `CMD start.sh` (shell form, no path) instead of `ENTRYPOINT [\"/app/start.sh\"]`; PATH does not include /app.",
      how: "`docker logs` shows `/bin/sh: 1: start.sh: not found`.",
      severity_rationale: "MEDIUM — release blocked; teaches ENTRYPOINT vs CMD vs shell/exec form.",
    },
    description:
      "ENTRYPOINT and CMD have shell form and exec form. Shell form goes through /bin/sh -c and is subject to PATH; exec form runs the binary directly.",
    original_event: `$ docker run checkout-worker:1.7
/bin/sh: 1: start.sh: not found
Exited (127)`,
    affected: [
      { kind: "Image", name: "checkout-worker:1.7", detail: "exit 127", action: "Use exec form ENTRYPOINT.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "BuildKit", "GHCR"],
    data_sources: ["dockerd"],
    logs_sample: `dockerd: container exited with 127
sh: 1: start.sh: not found`,
    metrics_sample: `container_state_exited{name="checkout-worker"} 1`,
    response_actions: ["Patch Dockerfile", "Rebuild + retag", "Re-deploy"],
    next_steps: [
      { level: "L1", text: 'Change to ENTRYPOINT ["/app/start.sh"] and WORKDIR /app.' },
      { level: "L2", text: "chmod +x /app/start.sh during build." },
      { level: "L3", text: "Add a CI test that runs the image once and asserts exit 0." },
    ],
    lab_slug: "k8s-write-dockerfile",
    learning: {
      concept: "ENTRYPOINT vs CMD (shell vs exec form)",
      meaning:
        "ENTRYPOINT is the always-run executable; CMD is its default args, overridable from `docker run`. Exec form (JSON array) runs the binary directly; shell form wraps it in /bin/sh -c.",
      enterprise_impact:
        "Wrong form = container exits 127/126 on every node. Production rollouts CrashLoop instantly.",
      fresher_view:
        "Always use the JSON array form so Docker runs your program directly.",
      engineer_view:
        "Exec form is PID 1, receives signals, behaves predictably. Shell form spawns /bin/sh which absorbs SIGTERM (graceful shutdown breaks). Distroless images often lack /bin/sh so shell form is impossible.",
      commands_bash: [
        "docker inspect checkout-worker:1.7 --format '{{.Config.Entrypoint}} {{.Config.Cmd}}'",
        "docker run --entrypoint sh checkout-worker:1.7 -c 'ls -la /app'",
        "docker history checkout-worker:1.7",
      ],
      commands_powershell: [
        "docker inspect checkout-worker:1.7 | Select-String -Pattern Entrypoint,Cmd",
      ],
      recovery: [
        "Patch Dockerfile to exec-form ENTRYPOINT.",
        "Add CI smoke test that runs the image.",
      ],
    },
  },

  {
    id: "K8S-INC-1048",
    title: ":latest tag drift — production running yesterday's build",
    severity: "medium",
    status: "open",
    owner: "platform-oncall",
    cluster: "prod-use1",
    namespace: "payments",
    service: "payments-api",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    detected_at: iso(75),
    last_event_at: iso(6),
    failure_chain: "Push → Deploy → Run",
    current_phase: "run",
    failed_phases: ["deploy"],
    briefing: {
      who: "payments-api Deployment using image ghcr.io/shadowx/payments-api:latest.",
      what: "Half the pods run yesterday's image and half run today's after a node restart pulled :latest fresh.",
      where: "prod-use1.",
      when: `${iso(75)} — drift visible 75m ago after a node replaced.`,
      why: "imagePullPolicy=IfNotPresent + mutable :latest tag = nodes hold stale image; new nodes pull fresh.",
      how: "`kubectl describe pod` shows two different image SHAs across replicas.",
      severity_rationale: "MEDIUM — version skew can corrupt data or surface intermittent bugs.",
    },
    description:
      "Mutable tags (:latest, :main) break the K8s contract that 'desired state' is unambiguous. Pin by immutable tag or digest.",
    original_event: `$ kubectl get pods -n payments -o json | jq -r '.items[].status.containerStatuses[].imageID' | sort -u
docker-pullable://ghcr.io/shadowx/payments-api@sha256:8a1c...
docker-pullable://ghcr.io/shadowx/payments-api@sha256:f2b3...`,
    affected: [
      { kind: "Deployment", name: "payments-api", detail: "two image SHAs in flight", action: "Switch to immutable tag or digest.", severity: "medium" },
    ],
    aligned_tools: ["Docker", "GHCR", "kubectl", "ArgoCD"],
    data_sources: ["kubelet", "registry-audit"],
    logs_sample: `kubelet: image ghcr.io/shadowx/payments-api:latest already present on node, skipping pull
kubelet (new node): pulled ghcr.io/shadowx/payments-api:latest sha256:f2b3...`,
    metrics_sample: `kube_pod_container_info{image="...@sha256:8a1c..."} 2
kube_pod_container_info{image="...@sha256:f2b3..."} 1`,
    response_actions: ["Pin to 1.42.0", "Pin to digest", "Force pull", "Re-deploy"],
    next_steps: [
      { level: "L1", text: "Change deployment image to ghcr.io/shadowx/payments-api:1.42.0." },
      { level: "L2", text: "kubectl rollout restart deployment/payments-api -n payments." },
      { level: "L3", text: "Org policy: ban :latest in production manifests via OPA/Conftest." },
    ],
    lab_slug: "k8s-push-to-registry",
    learning: {
      concept: "Immutable tags + semantic versioning",
      meaning:
        ":latest is a moving pointer. Two clusters (or two nodes) can resolve it to different digests at different times.",
      enterprise_impact:
        "Causes invisible version skew, broken rollbacks, and 'works on my machine' bugs at the cluster scale.",
      fresher_view:
        "Never use :latest in production. Always pin to a specific version.",
      engineer_view:
        "Pin by tag for humans (1.42.0) and by sha256 digest for machines. imagePullPolicy=Always + immutable tag is the safe default.",
      commands_bash: [
        "kubectl get pods -n payments -o json | jq -r '.items[].status.containerStatuses[].imageID' | sort -u",
        "docker pull ghcr.io/shadowx/payments-api:1.42.0",
        "docker image inspect ghcr.io/shadowx/payments-api:1.42.0 --format '{{.RepoDigests}}'",
      ],
      commands_powershell: [
        "kubectl get pods -n payments -o json | ConvertFrom-Json",
        "docker image inspect ghcr.io/shadowx/payments-api:1.42.0",
      ],
      recovery: [
        "Pin to an immutable tag or digest.",
        "Restart the deployment to converge all pods.",
        "Enforce policy via OPA / admission controller.",
      ],
    },
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
  "k8s-container-lifecycle": "K8S-INC-1032",
  "k8s-pull-run-inspect": "K8S-INC-1033",
  "k8s-docker-install-tour": "K8S-INC-1034",
  "k8s-write-dockerfile": "K8S-INC-1043",
};

// Curriculum module index — used by the list page filter.
export const K8S_MODULES: { code: K8sModuleCode; title: string }[] = [
  { code: "K8S-M1", title: "M1 · Containerization Fundamentals & Docker Architecture" },
  { code: "K8S-M2", title: "M2 · Building Docker Images & Containerized Apps" },
  { code: "K8S-M3", title: "M3 · Kubernetes Fundamentals & Pod Architecture" },
  { code: "K8S-M4", title: "M4 · Deployments & Service Exposure" },
  { code: "K8S-M5", title: "M5 · Monitoring, Troubleshooting & Capstone Prep" },
];

