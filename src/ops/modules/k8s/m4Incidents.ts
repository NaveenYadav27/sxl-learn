// Module 4 — Deployments & Service Exposure
// 12 incidents spanning rollouts, services, ingress, autoscaling, traffic.
// Mirrors the m3Incidents.ts structure: each incident ships a full K8sIncident
// payload PLUS a `k8s_concept` block (architecture flow + tool cards + learn-more).

import type { K8sIncident } from "./incidentsData";
import type { K8sConcept, K8sArchNode, K8sToolCard, K8sIncidentWithConcept } from "./m3Incidents";

const iso = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();

// =============================================================================
// SHARED ARCHITECTURE FLOWS
// =============================================================================

// Deployment / ReplicaSet / Rollout flow — used by rollout & scaling incidents.
const ROLLOUT_FLOW: K8sArchNode[] = [
  {
    id: "kubectl",
    label: "kubectl apply",
    def: "Client submits the new Deployment spec to the API server.",
    responsibility: "Send the desired-state YAML; receive the server-side merged result.",
    failure_impact: "Apply fails up-front with a validation error; no rollout starts.",
    commands: ["kubectl apply -f deploy.yaml", "kubectl diff -f deploy.yaml"],
  },
  {
    id: "deployment",
    label: "Deployment controller",
    def: "Owns the rollout strategy: creates new ReplicaSet, scales old one down.",
    responsibility: "Honour maxSurge/maxUnavailable; mark rollout Progressing / Complete / Failed.",
    failure_impact: "Rollout stalls or marks ProgressDeadlineExceeded.",
    commands: ["kubectl rollout status deploy/<name>", "kubectl describe deploy/<name>"],
  },
  {
    id: "replicaset",
    label: "ReplicaSet",
    def: "Lower-level controller that keeps N pods alive for one PodTemplate revision.",
    responsibility: "Create / delete pods to match desired count for its revision.",
    failure_impact: "Replicas stuck below desired; old RS hangs around with running pods.",
    commands: ["kubectl get rs -l app=<name>", "kubectl describe rs <name>-<hash>"],
  },
  {
    id: "scheduler",
    label: "kube-scheduler",
    def: "Picks a Node for every new Pod produced by the new ReplicaSet.",
    responsibility: "Filter + score nodes; bind Pod to chosen Node.",
    failure_impact: "Pods stay Pending; rollout never finishes.",
    commands: ["kubectl get events --field-selector reason=FailedScheduling"],
  },
  {
    id: "kubelet",
    label: "kubelet",
    def: "Starts the container, runs readiness/liveness probes, reports status.",
    responsibility: "Pull image, drive probes, report Ready=true so Deployment can progress.",
    failure_impact: "Probe failures leave pods NotReady → Deployment never marks Available.",
    commands: ["kubectl describe pod <pod>", "journalctl -u kubelet -n 100"],
  },
  {
    id: "service",
    label: "Service / Endpoints",
    def: "Endpoints controller watches Ready pods that match the Service selector.",
    responsibility: "Add Ready pod IPs to the EndpointSlice so traffic can reach them.",
    failure_impact: "Empty EndpointSlice → Service returns connection refused / 503.",
    commands: ["kubectl get endpointslices -l kubernetes.io/service-name=<svc>"],
  },
];

// L4/L7 traffic flow — used by Service / Ingress / DNS / LB incidents.
const TRAFFIC_FLOW: K8sArchNode[] = [
  {
    id: "client",
    label: "Client",
    def: "External browser or in-cluster pod that initiates the request.",
    responsibility: "Resolve the hostname, open a TCP/TLS connection.",
    failure_impact: "User-visible timeout / connection refused / TLS error.",
    commands: ["curl -sv https://<host>/", "openssl s_client -connect <host>:443"],
  },
  {
    id: "dns",
    label: "DNS",
    def: "External DNS or CoreDNS resolves the hostname to an LB / service IP.",
    responsibility: "Return an A/AAAA/CNAME record pointing at the LB or ClusterIP.",
    failure_impact: "NXDOMAIN or wrong IP → request never reaches the cluster.",
    commands: ["dig +short <host>", "kubectl run -it --rm dns --image=busybox -- nslookup <svc>"],
  },
  {
    id: "lb",
    label: "Cloud LoadBalancer",
    def: "Cloud provider NLB/ALB created by the cloud-controller-manager for Service type=LoadBalancer.",
    responsibility: "Accept public traffic and forward to NodePorts or target-group pods.",
    failure_impact: "EXTERNAL-IP stays <pending>; health checks fail → 504.",
    commands: ["kubectl get svc <svc>", "kubectl describe svc <svc>"],
  },
  {
    id: "ingress",
    label: "Ingress controller",
    def: "L7 router (nginx, traefik, ALB) that maps host/path → backend Service.",
    responsibility: "TLS termination, host/path routing, rate limiting, header rewrites.",
    failure_impact: "502/503/504 to the client even when backend pods are healthy.",
    commands: ["kubectl get ingress -A", "kubectl logs -n ingress-nginx deploy/ingress-nginx-controller"],
  },
  {
    id: "service",
    label: "Service (ClusterIP)",
    def: "Stable VIP + DNS name backed by the set of Ready pod endpoints.",
    responsibility: "Load-balance traffic across pods that match its label selector.",
    failure_impact: "Service exists but no endpoints → connection refused inside the cluster.",
    commands: ["kubectl get svc", "kubectl get endpoints <svc>"],
  },
  {
    id: "endpoints",
    label: "EndpointSlice",
    def: "List of pod IPs+ports currently backing a Service.",
    responsibility: "Reconciled by the endpoints controller from selector + Ready pods.",
    failure_impact: "Empty slice when selector mismatches or no pods Ready.",
    commands: ["kubectl get endpointslice -l kubernetes.io/service-name=<svc>"],
  },
  {
    id: "kubeproxy",
    label: "kube-proxy",
    def: "Per-node agent that programs iptables / IPVS rules for Service VIPs.",
    responsibility: "DNAT ClusterIP → pod IP; maintain conntrack entries.",
    failure_impact: "Service VIP unreachable from nodes (silent blackhole).",
    commands: ["iptables -t nat -L KUBE-SERVICES -n | head"],
  },
  {
    id: "pod",
    label: "Pod",
    def: "The workload actually serving the request.",
    responsibility: "Accept connections, return responses, pass readiness probes.",
    failure_impact: "Readiness false → pod removed from endpoints → 503.",
    commands: ["kubectl logs <pod>", "kubectl exec -it <pod> -- curl localhost:<port>/healthz"],
  },
];

// HPA / autoscaling flow.
const HPA_FLOW: K8sArchNode[] = [
  { id: "metrics-server", label: "metrics-server", def: "Aggregates kubelet cAdvisor metrics; serves metrics.k8s.io.", responsibility: "Provide pod/node CPU & memory snapshots every 15s.", failure_impact: "HPA shows <unknown> for current metric; no scaling decisions.", commands: ["kubectl top pod", "kubectl get apiservice v1beta1.metrics.k8s.io"] },
  { id: "hpa", label: "HorizontalPodAutoscaler", def: "Controller that compares current vs target metric and adjusts replicas.", responsibility: "Compute desiredReplicas = ceil(current/target × currentReplicas).", failure_impact: "Replicas don't move; alerts on saturation never resolve.", commands: ["kubectl get hpa", "kubectl describe hpa <name>"] },
  { id: "deployment", label: "Deployment", def: "Workload that owns the replicas the HPA scales.", responsibility: "Accept replica changes from the HPA and propagate to RS.", failure_impact: "If replicas field is managed elsewhere (Argo), HPA fights it.", commands: ["kubectl get deploy <name>"] },
  { id: "replicaset", label: "ReplicaSet", def: "Creates new pods to match the new replica count.", responsibility: "Spin up new pods when HPA scales up.", failure_impact: "Resource quota or scheduler issues block new replicas.", commands: ["kubectl get rs"] },
  { id: "pod", label: "Pod", def: "Workload that produces the load metric.", responsibility: "Serve traffic and emit CPU/memory.", failure_impact: "If pods can't start, HPA loops without effect.", commands: ["kubectl get pods -w"] },
];

// =============================================================================
// SHARED TOOL CARDS (Module 4 specific subset)
// =============================================================================

const TOOL_KUBECTL: K8sToolCard = {
  name: "kubectl",
  category: "cli",
  definition: "Primary CLI for the Kubernetes API server. Drives every rollout, scale, and traffic command.",
  why_engineers_use_it: "Read state (get/describe/rollout), mutate state (apply/scale/patch), and shell in (exec).",
  beginner_view: "kubectl is your remote control for everything in the cluster — including rollouts and services.",
  advanced_view: "rollout status/undo/restart are Deployment-controller-aware; --record annotates revisions.",
  commands: [
    { cmd: "kubectl rollout status deploy/<name>", expected: "Waiting for deployment \"<name>\" rollout to finish: 1 out of 3 new replicas have been updated..." },
    { cmd: "kubectl get endpoints <svc>", expected: "NAME    ENDPOINTS                AGE\nweb     10.4.2.7:8080,10.4.3.4:8080   12d" },
    { cmd: "kubectl describe ingress <name>", expected: "Rules:\n  Host         Path  Backends\n  shop.acme    /     web:80 (10.4.2.7:8080,...)" },
  ],
  enterprise_usage: "Wrapped by every CI/CD pipeline; the rollout subcommands gate prod deploys.",
  related_incidents: ["K8S-INC-4001", "K8S-INC-4002", "K8S-INC-4003"],
};

const TOOL_DEPLOYMENT: K8sToolCard = {
  name: "Deployment controller",
  category: "control_plane",
  definition: "Control-plane controller that manages rolling updates by creating ReplicaSets.",
  why_engineers_use_it: "Owns maxSurge/maxUnavailable and ProgressDeadlineSeconds — the knobs of every safe rollout.",
  beginner_view: "It rolls out a new version a few pods at a time, keeping the old version alive until the new one is healthy.",
  advanced_view: "Strategy=RollingUpdate uses maxSurge (extra pods above desired) and maxUnavailable (pods allowed down). A rollout is Progressing until all new-RS pods are Available.",
  commands: [
    { cmd: "kubectl get deploy <name> -o jsonpath='{.spec.strategy}'", expected: '{"rollingUpdate":{"maxSurge":"25%","maxUnavailable":"25%"},"type":"RollingUpdate"}' },
    { cmd: "kubectl rollout history deploy/<name>", expected: "REVISION  CHANGE-CAUSE\n3         kubectl set image deployment/<name> web=acme/web:1.4.2\n4         kubectl set image deployment/<name> web=acme/web:1.5.0" },
    { cmd: "kubectl rollout undo deploy/<name>", expected: "deployment.apps/<name> rolled back" },
  ],
  enterprise_usage: "Every blue/green or canary tool (Argo Rollouts, Flagger) wraps the Deployment controller's primitives.",
  related_incidents: ["K8S-INC-4001", "K8S-INC-4002", "K8S-INC-4012"],
};

const TOOL_SERVICE: K8sToolCard = {
  name: "Service / EndpointSlice",
  category: "networking",
  definition: "Service exposes a stable VIP+DNS name; EndpointSlices list the Ready pod IPs behind it.",
  why_engineers_use_it: "Whenever traffic 'should be routed' but isn't, EndpointSlice is the ground truth.",
  beginner_view: "Service = a phone number that never changes. EndpointSlice = the list of people that answer it right now.",
  advanced_view: "endpoint-controller watches Service.spec.selector + Ready pods. Selector mismatch ⇒ empty slice ⇒ connection refused.",
  commands: [
    { cmd: "kubectl get svc <svc> -o jsonpath='{.spec.selector}'", expected: '{"app":"web","version":"v2"}' },
    { cmd: "kubectl get endpointslice -l kubernetes.io/service-name=<svc>", expected: "NAME      ADDRESSTYPE   PORTS   ENDPOINTS   AGE\nweb-abc   IPv4          8080    <none>      12d" },
    { cmd: "kubectl get pods --show-labels -l app=web", expected: "NAME    READY  STATUS   LABELS\nweb-x   1/1    Running  app=web,version=v1" },
  ],
  enterprise_usage: "First place SREs look when a service is 'up' but traffic 502s.",
  related_incidents: ["K8S-INC-4003", "K8S-INC-4004"],
};

const TOOL_INGRESS: K8sToolCard = {
  name: "Ingress controller (nginx)",
  category: "networking",
  definition: "L7 reverse proxy (deployed as a Deployment + Service type=LoadBalancer) that maps host/path → Service.",
  why_engineers_use_it: "Read its logs/config to diagnose 502/503/504 between LB and Service.",
  beginner_view: "Ingress is the receptionist that decides which Service should answer a request based on the URL.",
  advanced_view: "ingress-nginx watches Ingress objects, regenerates nginx.conf, and reloads. backend errors show in its logs with upstream IP.",
  commands: [
    { cmd: "kubectl get ingress <name> -o wide", expected: "NAME   CLASS   HOSTS         ADDRESS         PORTS    AGE\nshop   nginx   shop.acme.com  a1b2.elb.amazonaws.com  80,443   30d" },
    { cmd: "kubectl -n ingress-nginx logs deploy/ingress-nginx-controller --tail=20", expected: "10.0.0.1 - - [..] \"GET / HTTP/1.1\" 502 0 ... upstream: 10.4.2.7:8080" },
    { cmd: "kubectl -n ingress-nginx exec deploy/ingress-nginx-controller -- cat /etc/nginx/nginx.conf | head -40", expected: "upstream upstream_balancer { ... }" },
  ],
  enterprise_usage: "Standard ingress in EKS/AKS/GKE; ALB ingress in AWS-native shops.",
  related_incidents: ["K8S-INC-4005", "K8S-INC-4011"],
};

const TOOL_HPA: K8sToolCard = {
  name: "HorizontalPodAutoscaler",
  category: "control_plane",
  definition: "Controller that scales Deployment replicas based on metric targets (CPU, memory, custom).",
  why_engineers_use_it: "Diagnose 'replicas not growing under load' — HPA describe explains why.",
  beginner_view: "HPA watches a metric and adds/removes pods to keep it close to a target.",
  advanced_view: "desiredReplicas = ceil(currentReplicas × currentMetric / targetMetric). Behaviour stanza (v2) controls scale-up/down windows.",
  commands: [
    { cmd: "kubectl get hpa <name>", expected: "NAME   REFERENCE         TARGETS         MINPODS  MAXPODS  REPLICAS\nweb    Deployment/web    <unknown>/70%   2         20        2" },
    { cmd: "kubectl describe hpa <name>", expected: "Conditions:\n  Type           Status  Reason\n  AbleToScale    True    SucceededRescale\n  ScalingActive  False   FailedGetResourceMetric" },
    { cmd: "kubectl top pod -l app=web", expected: "Error from server (ServiceUnavailable): the server is currently unable to handle the request" },
  ],
  enterprise_usage: "Default scaler; KEDA layers event-driven scaling on top for queues/streams.",
  related_incidents: ["K8S-INC-4006"],
};

const TOOL_CLOUD_LB: K8sToolCard = {
  name: "cloud-controller-manager",
  category: "control_plane",
  definition: "Provider-aware controller that reconciles Service type=LoadBalancer into a real cloud LB.",
  why_engineers_use_it: "Diagnose 'EXTERNAL-IP <pending>' — its logs show the provider API error.",
  beginner_view: "When you ask Kubernetes for a public load balancer, this component talks to AWS/Azure/GCP to create one.",
  advanced_view: "On EKS, lives in kube-system as aws-cloud-controller-manager. Failures: IAM denied, no public subnet tag, ELB quota.",
  commands: [
    { cmd: "kubectl get svc <svc>", expected: "NAME   TYPE          CLUSTER-IP    EXTERNAL-IP   PORT(S)\nweb    LoadBalancer  10.96.0.42    <pending>     80:31234/TCP" },
    { cmd: "kubectl -n kube-system logs deploy/aws-cloud-controller-manager --tail=30", expected: "E ensureLoadBalancer: AccessDenied: User: arn:aws:iam::... is not authorized to perform: elasticloadbalancing:CreateLoadBalancer" },
  ],
  enterprise_usage: "Every prod cluster relies on this for ingress; misconfigured IAM is the #1 cause of stuck LBs.",
  related_incidents: ["K8S-INC-4007"],
};

const TOOL_KUBELET: K8sToolCard = {
  name: "kubelet",
  category: "runtime",
  definition: "Per-node agent that runs probes and reports pod Ready status to the API server.",
  why_engineers_use_it: "Probe-driven rollouts depend entirely on what kubelet reports.",
  beginner_view: "kubelet is the worker on each server that actually tells Kubernetes if your app is healthy.",
  advanced_view: "Runs readiness/liveness/startup probes per spec; updates pod.status.conditions[type=Ready] which the endpoints controller observes.",
  commands: [
    { cmd: "kubectl describe pod <pod> | sed -n '/Conditions/,/IP:/p'", expected: "Conditions:\n  Type           Status\n  Ready          False" },
    { cmd: "kubectl logs <pod>", expected: "starting on :8080..." },
    { cmd: "kubectl exec <pod> -- curl -sf localhost:8080/healthz", expected: "ok" },
  ],
  enterprise_usage: "Probe definitions are part of every prod chart; bad probes cause silent traffic loss.",
  related_incidents: ["K8S-INC-4002", "K8S-INC-4008"],
};

const TOOL_PROMETHEUS: K8sToolCard = {
  name: "Prometheus",
  category: "observability",
  definition: "Pull-based metrics database; powers HPA-style alerts and rollout dashboards.",
  why_engineers_use_it: "Confirm rollout success/failure with metrics, not just kubectl output.",
  beginner_view: "Prometheus is the cluster's heartbeat monitor — it records every number over time.",
  advanced_view: "kube-state-metrics exports Deployment/Service state; node-exporter for hosts. PromQL drives the SLO burn-rate alerts.",
  commands: [
    { cmd: "promtool query instant http://prom:9090 'kube_deployment_status_replicas_unavailable{deployment=\"web\"}'", expected: "{namespace=\"shop\"}  0" },
    { cmd: "promtool query instant http://prom:9090 'rate(nginx_ingress_controller_requests{status=~\"5..\"}[5m])'", expected: "{ingress=\"shop\"}  0.02" },
  ],
  enterprise_usage: "De-facto K8s metrics stack; powers Grafana dashboards and SLO alerts.",
  related_incidents: ["K8S-INC-4005", "K8S-INC-4006", "K8S-INC-4012"],
};

const TOOL_ARGO_ROLLOUTS: K8sToolCard = {
  name: "Argo Rollouts",
  category: "gitops",
  definition: "Drop-in Deployment replacement supporting canary, blue/green, and analysis-driven rollouts.",
  why_engineers_use_it: "Safer than vanilla rolling updates — automatic abort on metric regressions.",
  beginner_view: "Argo Rollouts gradually shifts traffic to the new version and auto-rolls back if metrics get worse.",
  advanced_view: "Rollout CR with steps[] (setWeight, pause, analysis). Integrates with ingress-nginx, ALB, Istio for traffic weighting.",
  commands: [
    { cmd: "kubectl argo rollouts get rollout web", expected: "Status:        Paused\nMessage:       CanaryPauseStep\nStrategy:      Canary\n  Step:        2/6\n  SetWeight:   20" },
    { cmd: "kubectl argo rollouts promote web", expected: "rollout 'web' promoted" },
    { cmd: "kubectl argo rollouts abort web", expected: "rollout 'web' aborted" },
  ],
  enterprise_usage: "Standard for progressive delivery in regulated orgs; integrates with Datadog/Prometheus for analysis runs.",
  related_incidents: ["K8S-INC-4012"],
};

const TOOL_CERTMANAGER: K8sToolCard = {
  name: "cert-manager",
  category: "control_plane",
  definition: "Controller that issues and renews TLS certificates from ACME / internal CAs into Secrets.",
  why_engineers_use_it: "TLS-expired incidents are usually a renewal failure — describe Certificate shows the cause.",
  beginner_view: "cert-manager talks to Let's Encrypt and keeps your HTTPS certificates fresh.",
  advanced_view: "Certificate → Order → Challenge (HTTP01/DNS01). Renewal kicks in at 2/3 of validity period.",
  commands: [
    { cmd: "kubectl get certificate -A", expected: "NAMESPACE  NAME       READY  SECRET    AGE\nshop       shop-tls   False  shop-tls  93d" },
    { cmd: "kubectl describe certificate shop-tls -n shop", expected: "Status:\n  Conditions:\n    Type: Ready  Status: False  Reason: Failed\n  Message: order failed: HTTP01 challenge propagation timeout" },
    { cmd: "kubectl -n cert-manager logs deploy/cert-manager --tail=30", expected: "E renewing certificate shop/shop-tls: presenting challenge: ..." },
  ],
  enterprise_usage: "Default TLS issuer in every prod K8s cluster.",
  related_incidents: ["K8S-INC-4011"],
};

// --------- Convenience builder ---------
type M4In = Omit<K8sIncident, "module" | "module_title" | "cves" | "phase_walkthrough"> & {
  k8s_concept: K8sConcept;
};

const mk = (x: M4In): K8sIncidentWithConcept => ({
  module: "K8S-M4",
  module_title: "M4 · Deployments & Service Exposure",
  ...x,
});

// =============================================================================
// CATEGORY 1 — ROLLOUTS
// =============================================================================

const INC_4001 = mk({
  id: "K8S-INC-4001",
  title: "Rollout stuck — ProgressDeadlineExceeded after image bump (M4-INC-401)",
  severity: "high",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "shop",
  service: "web",
  detected_at: iso(11),
  last_event_at: iso(1),
  failure_chain: "Deploy → Run",
  current_phase: "deploy",
  failed_phases: ["deploy"],
  briefing: {
    who: "web Deployment v1.5.0 — new ReplicaSet web-9d4f stuck at 1/3 Ready.",
    what: "Deployment marked ProgressDeadlineExceeded; old RS still serving 100% of traffic.",
    where: "prod-use1, namespace shop.",
    when: `${iso(11)} — kubectl apply 11 min ago, progressDeadline=600s expired 1 min ago.`,
    why: "New image starts but readiness probe fails (HTTP 500 on /healthz), so kubelet never marks pods Ready.",
    how: "kubectl rollout status returns 'deployment exceeded its progress deadline'.",
    severity_rationale: "HIGH — no customer impact yet (old RS healthy) but next deploy is blocked.",
  },
  description: "Deployment rolling update: 1 new pod surged in, probe failed, controller paused at maxUnavailable budget and waited until progressDeadlineSeconds elapsed.",
  original_event: `$ kubectl rollout status deploy/web -n shop
Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...
error: deployment "web" exceeded its progress deadline

$ kubectl get rs -n shop -l app=web
NAME           DESIRED  CURRENT  READY  AGE
web-7c8b       3        3        3      18d
web-9d4f       1        1        0      11m`,
  affected: [
    { kind: "Deployment", name: "web", detail: "ProgressDeadlineExceeded · 1/3 new ready", action: "Inspect probe + rollback if needed.", severity: "high" },
    { kind: "ReplicaSet", name: "web-9d4f", detail: "1 pod · 0 Ready", action: "Read probe failure events.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus", "Grafana"],
  data_sources: ["kube-controller-manager", "kubelet", "prom"],
  logs_sample: `kube-controller: deployment shop/web exceeded progress deadline 600s
kubelet: Readiness probe failed: HTTP probe failed with statuscode: 500
web-9d4f pod: ERROR /healthz: missing CONFIG_VERSION env`,
  metrics_sample: `kube_deployment_status_condition{deployment="web",condition="Progressing",status="false"}  1
kube_deployment_status_replicas_updated{deployment="web"}    1
kube_deployment_spec_replicas{deployment="web"}              3`,
  response_actions: ["Read probe events", "kubectl rollout undo", "Patch probe", "Open Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl describe rs web-9d4f -n shop — read Readiness probe failed events." },
    { level: "L2", text: "kubectl logs <new-pod> — confirm the 500 cause; if config bug, kubectl rollout undo deploy/web -n shop." },
    { level: "L3", text: "Fix manifest, re-apply with --record, raise progressDeadlineSeconds only if probe is legitimately slow (not as a workaround)." },
  ],
  k8s_concept: {
    concept: "Deployment rolling update & progress deadline",
    definition: "Deployment controller creates a new ReplicaSet, scales it up while scaling the old one down, governed by maxSurge / maxUnavailable. A rollout is Failed when no progress for progressDeadlineSeconds.",
    why_it_exists: "Lets you ship without downtime AND fails fast when a new revision is broken.",
    enterprise_impact: "A stuck rollout blocks every subsequent deploy and silently keeps the old code in prod.",
    beginner: "Kubernetes started rolling out v1.5.0 but the new pod isn't healthy, so it gave up and is waiting for you.",
    engineer: "Deployment.Progressing flipped to False with reason ProgressDeadlineExceeded; new RS holds 1 unavailable pod. Old RS is intact — rollback is safe.",
    architecture_flow: ROLLOUT_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBECTL, TOOL_DEPLOYMENT, TOOL_KUBELET],
    learn_more: [
      { question: "What is progressDeadlineSeconds?", answer: "Deployment spec field (default 600). Time without progress before the controller marks the rollout Failed." },
      { question: "What's maxSurge vs maxUnavailable?", answer: "maxSurge = extra pods allowed above desired during rollout. maxUnavailable = pods allowed unready. Together they bound disruption." },
      { question: "Does rollback re-pull the image?", answer: "Yes — kubectl rollout undo reverts the PodTemplate to the previous revision and creates new pods from that spec." },
    ],
  },
});

const INC_4002 = mk({
  id: "K8S-INC-4002",
  title: "Readiness probe failing — pods never become Ready (M4-INC-402)",
  severity: "critical",
  status: "open",
  owner: "checkout-team",
  cluster: "prod-use1",
  namespace: "checkout",
  service: "checkout-api",
  detected_at: iso(7),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "checkout-api Deployment v2.1.0 — 0 of 4 new pods Ready.",
    what: "kubelet logs readiness probe failed with 'connection refused' every 5s.",
    where: "prod-use1, namespace checkout.",
    when: `${iso(7)} — first failure 7 min ago, consistent ever since.`,
    why: "App listens on :3000 but readiness probe targets :8080 (default).",
    how: "kubectl describe pod shows 'Readiness probe failed: dial tcp 10.4.2.7:8080: connect: connection refused'.",
    severity_rationale: "CRITICAL — service has zero endpoints; checkout returns 503.",
  },
  description: "Probe port mismatch — pod listens on a different port than the probe checks. Pod is healthy; the probe lies.",
  original_event: `$ kubectl describe pod checkout-api-7c-xkqz2 -n checkout
Conditions:
  Type              Status
  Initialized       True
  Ready             False
  ContainersReady   False
Events:
  Warning  Unhealthy  3m (x40)  kubelet  Readiness probe failed: dial tcp 10.4.2.7:8080: connect: connection refused`,
  affected: [
    { kind: "Pod", name: "checkout-api-7c-xkqz2", detail: "Ready=False · probe refused", action: "Fix probe port or app listener.", severity: "critical" },
    { kind: "Service", name: "checkout-api", detail: "Endpoints empty (no Ready pods)", action: "Restore Ready=True.", severity: "critical" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kubelet", "kube-apiserver"],
  logs_sample: `checkout-api: listening on :3000
kubelet: Readiness probe failed: Get http://10.4.2.7:8080/healthz: dial tcp 10.4.2.7:8080: connect: connection refused
endpoints-controller: removed 10.4.2.7 from endpointslice checkout-api-abc`,
  metrics_sample: `kube_pod_status_ready{pod=~"checkout-api.*"}    0
kube_endpoint_address_available{service="checkout-api"}  0
nginx_ingress_controller_requests{status="503"}  rate +12/s`,
  response_actions: ["Fix probe port", "kubectl rollout undo", "Shell into pod", "Open Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl exec checkout-api-7c-xkqz2 -- curl -sf localhost:3000/healthz — confirm app is healthy on its real port." },
    { level: "L2", text: "kubectl edit deploy/checkout-api — change readinessProbe.httpGet.port from 8080 → 3000." },
    { level: "L3", text: "Add containerPort=3000 to spec.containers[].ports so probe and Service stay in sync via named ports." },
  ],
  k8s_concept: {
    concept: "Readiness probes & EndpointSlice gating",
    definition: "Readiness probe is what kubelet uses to set pod.status.conditions[Ready]. Only Ready pods are added to EndpointSlices.",
    why_it_exists: "Lets pods drain warmup time / wait for dependencies without serving 5xx to users.",
    enterprise_impact: "Wrong probe = invisible outage. Service looks healthy but no pod gets traffic.",
    beginner: "The probe is asking the wrong door if your app is alive — so Kubernetes thinks it's dead.",
    engineer: "kubelet hits probe.httpGet.port and any non-2xx/3xx response flips Ready=False. endpoint-controller removes the IP from EndpointSlice.",
    architecture_flow: ROLLOUT_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBECTL, TOOL_KUBELET, TOOL_SERVICE],
    learn_more: [
      { question: "Readiness vs liveness?", answer: "Readiness gates traffic. Liveness gates restarts. A failing liveness probe kills the pod; a failing readiness only removes it from endpoints." },
      { question: "What's initialDelaySeconds?", answer: "kubelet waits this long before starting the probe loop — used to give the app time to boot." },
      { question: "Why use named ports?", answer: "containerPort with a name lets Service.targetPort and probe.port reference the same name, so they can't drift." },
    ],
  },
});

const INC_4003 = mk({
  id: "K8S-INC-4003",
  title: "Service has no endpoints — selector mismatch (M4-INC-403)",
  severity: "high",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "shop",
  service: "web",
  detected_at: iso(9),
  last_event_at: iso(2),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "web Service in namespace shop — clients getting 'connection refused'.",
    what: "Service exists, ClusterIP assigned, but EndpointSlice is empty.",
    where: "prod-use1, namespace shop.",
    when: `${iso(9)} — broke after Helm upgrade changed pod labels.`,
    why: "Service.spec.selector = {app: web, version: v1}; pods now carry {app: web, version: v2}.",
    how: "kubectl get endpoints web → <none>; kubectl get pods --show-labels confirms label drift.",
    severity_rationale: "HIGH — entire service is unreachable.",
  },
  description: "Service selector is a pure label match. A one-character drift in pod labels yields zero endpoints and zero traffic — no error message anywhere.",
  original_event: `$ kubectl get svc web -n shop
NAME   TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
web    ClusterIP   10.96.0.42   <none>        80/TCP    47d

$ kubectl get endpoints web -n shop
NAME   ENDPOINTS   AGE
web    <none>      47d

$ kubectl get svc web -n shop -o jsonpath='{.spec.selector}'
{"app":"web","version":"v1"}
$ kubectl get pods -n shop --show-labels -l app=web
NAME      READY  STATUS   LABELS
web-x     1/1    Running  app=web,version=v2`,
  affected: [
    { kind: "Service", name: "web", detail: "Endpoints empty · selector mismatch", action: "Align selector or pod labels.", severity: "high" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kube-apiserver", "endpoints-controller"],
  logs_sample: `endpoints-controller: reconciling shop/web — 0 matching pods
ingress-nginx: upstream connect error for shop/web — no backends`,
  metrics_sample: `kube_endpoint_address_available{service="web"}     0
kube_pod_status_ready{namespace="shop",pod=~"web.*"}  1
nginx_ingress_controller_requests{status="503"}    rate +8/s`,
  response_actions: ["Patch selector", "Re-label pods", "kubectl rollout undo", "Notify owners"],
  next_steps: [
    { level: "L1", text: "kubectl get svc web -o yaml + kubectl get pods --show-labels — diff selector vs pod labels." },
    { level: "L2", text: "Decide: change the Service selector (kubectl patch svc web --type=merge -p '{\"spec\":{\"selector\":{\"app\":\"web\",\"version\":\"v2\"}}}') OR re-label pods." },
    { level: "L3", text: "Land a kube-linter rule that fails CI when a chart's Service selector doesn't match its Deployment template labels." },
  ],
  k8s_concept: {
    concept: "Service selector → EndpointSlice",
    definition: "endpoint-controller watches Service.spec.selector and the namespace's Ready pods; the intersection is written to an EndpointSlice every reconciliation.",
    why_it_exists: "Decouples 'which pods serve this' from 'how many there are' — pods come and go without touching the Service.",
    enterprise_impact: "Silent label drift = silent outage. There is no error event; you must compare YAML to YAML.",
    beginner: "The Service is looking for pods labeled v1, but your pods are now labeled v2 — so it finds nobody.",
    engineer: "Pure label set intersection. Selector is AND across keys. EndpointSlice reconciliation is non-event-emitting; only the empty slice is the signal.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "endpoints",
    tools: [TOOL_KUBECTL, TOOL_SERVICE],
    learn_more: [
      { question: "Why no error event?", answer: "endpoint-controller's job is to write the slice — an empty result is a valid result. There's nothing to complain about." },
      { question: "Can a Service have no selector?", answer: "Yes — you can manually create EndpointSlices (used for cross-cluster Services and external DBs)." },
      { question: "Why EndpointSlice instead of Endpoints?", answer: "Slices scale: large services produce many small objects so updates don't fan out giant watches." },
    ],
  },
});

const INC_4004 = mk({
  id: "K8S-INC-4004",
  title: "NodePort unreachable from outside — security-group / firewall (M4-INC-404)",
  severity: "high",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "demo",
  service: "marketing-site",
  detected_at: iso(18),
  last_event_at: iso(3),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "marketing-site Service type=NodePort on port 30080.",
    what: "curl http://<node-public-ip>:30080 from laptop hangs; from inside the cluster works.",
    where: "prod-use1, namespace demo.",
    when: `${iso(18)} — exposed 18 min ago for the demo.`,
    why: "Cluster SG only allows tcp/443; node port 30080 is closed at the cloud firewall.",
    how: "From inside the cluster: curl works. From outside: connection times out.",
    severity_rationale: "HIGH for the demo team; trivial root cause but recurring.",
  },
  description: "NodePort opens the port on the kubelet, but the cloud security group / VPC firewall must also allow it. Most managed clusters lock down the node group's SG by default.",
  original_event: `$ kubectl get svc marketing-site -n demo
NAME             TYPE       CLUSTER-IP   EXTERNAL-IP   PORT(S)         AGE
marketing-site   NodePort   10.96.0.55   <none>        80:30080/TCP    18m

# From a cluster pod
$ kubectl run -it --rm net --image=curlimages/curl -- curl -m5 http://marketing-site/
<html>...

# From outside
$ curl -m5 http://1.2.3.4:30080/
curl: (28) Connection timed out`,
  affected: [
    { kind: "Service", name: "marketing-site", detail: "NodePort 30080 closed at cloud firewall", action: "Open SG ingress or move to Ingress/LB.", severity: "high" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kube-apiserver", "cloud-vpc"],
  logs_sample: `kube-proxy: programmed iptables rule -A KUBE-NODEPORTS -p tcp --dport 30080 -j KUBE-SVC-<hash>
(no kubelet errors — connection never arrives)`,
  metrics_sample: `kube_service_spec_type{service="marketing-site"}  NodePort
node_network_receive_bytes_total (node port 30080)  0`,
  response_actions: ["Open SG", "Switch to Ingress", "Use port-forward", "Document policy"],
  next_steps: [
    { level: "L1", text: "From inside the cluster: kubectl run net --rm -it --image=curlimages/curl -- curl marketing-site — confirms Service works." },
    { level: "L2", text: "Cloud console: add inbound rule tcp/30080 from your CIDR to the node SG." },
    { level: "L3", text: "Better: don't expose NodePort externally — front it with an Ingress or Service type=LoadBalancer." },
  ],
  k8s_concept: {
    concept: "Service types: ClusterIP / NodePort / LoadBalancer",
    definition: "ClusterIP = in-cluster only. NodePort = opens a port on every node (default 30000-32767). LoadBalancer = NodePort + a cloud LB in front.",
    why_it_exists: "Layered exposure model: prove it works internally first, then choose how to expose externally.",
    enterprise_impact: "Mixing the layers (e.g. NodePort exposed direct to internet) breaks security posture and bypasses WAF.",
    beginner: "Kubernetes opened a door on the server, but the cloud's gate is still closed — you can't reach it from outside.",
    engineer: "kube-proxy programs iptables, but the underlying cloud SG/firewall is independent. Each layer must allow the traffic.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "lb",
    tools: [TOOL_KUBECTL, TOOL_SERVICE, TOOL_CLOUD_LB],
    learn_more: [
      { question: "Why is NodePort range 30000-32767?", answer: "Default range to avoid colliding with well-known and ephemeral ports. Configurable via --service-node-port-range on the API server." },
      { question: "Should NodePort be used in prod?", answer: "Rarely. Prefer Ingress for HTTP and LoadBalancer for L4. NodePort is great for dev/test/bare-metal." },
      { question: "What's externalTrafficPolicy?", answer: "Cluster (default) hides the client IP. Local preserves it but only routes to nodes that have a Ready pod." },
    ],
  },
});

const INC_4005 = mk({
  id: "K8S-INC-4005",
  title: "Ingress 502 — backend Service has Ready pods but upstream connect fails (M4-INC-405)",
  severity: "critical",
  status: "open",
  owner: "shop-team",
  cluster: "prod-use1",
  namespace: "shop",
  service: "shop-ingress",
  detected_at: iso(4),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "observe",
  failed_phases: ["run"],
  briefing: {
    who: "shop.acme.com via ingress-nginx.",
    what: "Customers getting 502 on every request; ingress logs show 'upstream connect error to 10.4.2.7:8080'.",
    where: "prod-use1, namespace shop.",
    when: `${iso(4)} — started 4 min ago after Service port change.`,
    why: "Service.spec.ports[0].targetPort changed from 8080 → 3000, but Ingress backend still references service port 8080 (old name).",
    how: "ingress-nginx config still has 'upstream_balancer { server 10.4.2.7:8080 }'.",
    severity_rationale: "CRITICAL — entire shop frontend is down, revenue impact.",
  },
  description: "Ingress → Service → Pod chain: a change to Service.targetPort without a matching change in pod containerPort breaks the path. Pods are Ready but listen on the wrong port for the new service.",
  original_event: `# Ingress logs
2026-05-27T12:01:14 [error] upstream prematurely closed connection
2026-05-27T12:01:14 [warn]  upstream server temporarily disabled while connecting to upstream, server: shop.acme.com, request: "GET / HTTP/1.1", upstream: "http://10.4.2.7:8080/"

# Service
$ kubectl get svc web -n shop -o yaml | grep -A4 ports:
  ports:
  - name: http
    port: 80
    targetPort: 3000    # was 8080`,
  affected: [
    { kind: "Ingress", name: "shop", detail: "Backend returning 502", action: "Align Service targetPort with pod containerPort.", severity: "critical" },
    { kind: "Service", name: "web", detail: "targetPort=3000 but pods listen on 8080", action: "Revert targetPort or update pod port.", severity: "critical" },
  ],
  aligned_tools: ["kubectl", "Prometheus"],
  data_sources: ["ingress-nginx", "kube-apiserver", "prom"],
  logs_sample: `ingress-nginx: connect() failed (111: Connection refused) while connecting to upstream
web pod (10.4.2.7): listening on :8080`,
  metrics_sample: `nginx_ingress_controller_requests{status="502"}  rate +25/s
kube_endpoint_address_available{service="web"}    3
kube_service_info{service="web",targetPort="3000"}  1`,
  response_actions: ["Revert Service", "Update container port", "kubectl rollout undo", "Notify customers"],
  next_steps: [
    { level: "L1", text: "kubectl -n ingress-nginx logs deploy/ingress-nginx-controller --tail=20 — confirm upstream connect refused." },
    { level: "L2", text: "kubectl get svc web -o yaml + kubectl exec <pod> -- ss -ltn — compare Service targetPort vs actual listening port." },
    { level: "L3", text: "kubectl patch svc web --type=merge -p '{\"spec\":{\"ports\":[{\"name\":\"http\",\"port\":80,\"targetPort\":8080}]}}' OR change pod containerPort." },
  ],
  k8s_concept: {
    concept: "Ingress → Service → targetPort → containerPort chain",
    definition: "Ingress points at a Service port (a logical name). The Service forwards to targetPort, which must match a containerPort the pod actually listens on.",
    why_it_exists: "Layers of indirection let you change port numbers without breaking clients — IF every layer stays consistent.",
    enterprise_impact: "A one-line targetPort drift produces a total outage with the most generic error in HTTP (502).",
    beginner: "Ingress is calling the front door (port 80), Service is forwarding to room 3000, but the app is sitting in room 8080.",
    engineer: "ingress-nginx writes upstream servers from EndpointSlice's port (resolved via Service.targetPort). targetPort is what the kube-proxy DNAT rule rewrites to.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "service",
    tools: [TOOL_KUBECTL, TOOL_INGRESS, TOOL_SERVICE, TOOL_PROMETHEUS],
    learn_more: [
      { question: "What's the difference between port and targetPort?", answer: "port = the Service's own port (what clients dial). targetPort = the pod port traffic is DNATed to. They can differ." },
      { question: "Why use named ports?", answer: "Named ports (e.g. http) let Service.targetPort and probe.port reference the name — pods can change number without breaking the chain." },
      { question: "Why 502 vs 503?", answer: "502 = ingress reached the backend but got an invalid/empty response. 503 = no backends available at all." },
    ],
  },
});

const INC_4006 = mk({
  id: "K8S-INC-4006",
  title: "HPA shows <unknown> — metrics-server not serving (M4-INC-406)",
  severity: "high",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "shop",
  service: "web",
  detected_at: iso(15),
  last_event_at: iso(1),
  failure_chain: "Run → Observe",
  current_phase: "observe",
  failed_phases: ["observe"],
  briefing: {
    who: "web HPA in namespace shop — CPU saturated but replicas stuck at minReplicas=2.",
    what: "kubectl get hpa shows TARGETS = <unknown>/70%; kubectl top pod returns ServiceUnavailable.",
    where: "prod-use1, namespace shop.",
    when: `${iso(15)} — degraded since metrics-server pod was OOMKilled 15 min ago.`,
    why: "metrics-server deployment is CrashLoopBackOff (memory limit too low after node scale-up).",
    how: "kubectl get apiservice v1beta1.metrics.k8s.io shows Available=False.",
    severity_rationale: "HIGH — autoscaling is blind, capacity won't grow with traffic spikes.",
  },
  description: "HPA depends on metrics.k8s.io served by metrics-server. When that aggregated API is down, HPA can't read current metrics and freezes replica count.",
  original_event: `$ kubectl get hpa web -n shop
NAME   REFERENCE         TARGETS         MINPODS  MAXPODS  REPLICAS  AGE
web    Deployment/web    <unknown>/70%   2         20        2         180d

$ kubectl get apiservice v1beta1.metrics.k8s.io
NAME                      SERVICE                       AVAILABLE   AGE
v1beta1.metrics.k8s.io    kube-system/metrics-server   False (FailedDiscoveryCheck)   180d

$ kubectl describe hpa web -n shop | grep -A2 ScalingActive
  Type            Status  Reason
  ScalingActive   False   FailedGetResourceMetric
  Message:        unable to get metrics for resource cpu: no metrics returned from resource metrics API`,
  affected: [
    { kind: "HPA", name: "web", detail: "<unknown> current metric · not scaling", action: "Restore metrics-server.", severity: "high" },
    { kind: "Deployment", name: "metrics-server", detail: "CrashLoopBackOff in kube-system", action: "Raise memory limit; restart.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus", "Grafana"],
  data_sources: ["metrics-server", "kube-apiserver", "prom"],
  logs_sample: `metrics-server: panic: runtime error: out of memory
kube-aggregator: failed calling webhook "metrics.k8s.io": no endpoints available
hpa-controller: failed to compute desired number of replicas`,
  metrics_sample: `up{job="metrics-server"}            0
kube_deployment_status_replicas{deployment="web"}   2   (stuck, capacity at 92% CPU)
container_cpu_usage_seconds_total (web pods)       saturated`,
  response_actions: ["Raise memory limit", "Restart metrics-server", "Manual scale", "Open Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl -n kube-system get pods -l k8s-app=metrics-server — confirm CrashLoop." },
    { level: "L2", text: "kubectl -n kube-system set resources deploy/metrics-server --limits=memory=400Mi --requests=memory=200Mi." },
    { level: "L3", text: "Manual: kubectl scale deploy/web -n shop --replicas=10 to relieve load while you fix metrics-server. HPA will resume control once it's back." },
  ],
  k8s_concept: {
    concept: "HorizontalPodAutoscaler & metrics-server",
    definition: "HPA queries metrics.k8s.io (CPU/mem) or custom.metrics.k8s.io for each managed Deployment, computes desiredReplicas, and PATCHes the Deployment.",
    why_it_exists: "Match capacity to demand without humans in the loop.",
    enterprise_impact: "Without metrics-server, HPA is blind. Spike traffic = 5xx until on-call manually scales.",
    beginner: "The autoscaler is supposed to read CPU usage, but the thing that reports CPU is broken — so it can't decide.",
    engineer: "HPA reads from the aggregated metrics API every 15s. metrics-server scrapes kubelet's /metrics/resource. Failure = ScalingActive=False, FailedGetResourceMetric.",
    architecture_flow: HPA_FLOW,
    failure_stage_id: "metrics-server",
    tools: [TOOL_KUBECTL, TOOL_HPA, TOOL_PROMETHEUS],
    learn_more: [
      { question: "Why not use Prometheus directly?", answer: "HPA can — via prometheus-adapter exposing custom.metrics.k8s.io. metrics-server just covers built-in CPU/memory." },
      { question: "What's the HPA control loop interval?", answer: "Default 15s (--horizontal-pod-autoscaler-sync-period). Scale-down stabilisation window is 5m by default." },
      { question: "Why is metrics-server OOMing?", answer: "Memory scales with cluster size (pod/node count). Big clusters need higher limits and more replicas." },
    ],
  },
});

const INC_4007 = mk({
  id: "K8S-INC-4007",
  title: "LoadBalancer stuck Pending — IAM denied (M4-INC-407)",
  severity: "high",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "edge",
  service: "edge-gateway",
  detected_at: iso(22),
  last_event_at: iso(4),
  failure_chain: "Deploy → Run",
  current_phase: "deploy",
  failed_phases: ["deploy"],
  briefing: {
    who: "edge-gateway Service type=LoadBalancer.",
    what: "EXTERNAL-IP has been <pending> for 22 minutes; cloud-controller-manager logs show AccessDenied.",
    where: "prod-use1 (EKS), namespace edge.",
    when: `${iso(22)} — applied 22 min ago after a new node group was added.`,
    why: "EKS cluster role lost elasticloadbalancing:CreateLoadBalancer due to a tightened IAM policy push.",
    how: "kubectl -n kube-system logs deploy/aws-cloud-controller-manager shows the IAM error.",
    severity_rationale: "HIGH — entire edge gateway can't be exposed.",
  },
  description: "Service type=LoadBalancer creates a real cloud LB via the cloud-controller-manager. When the cluster IAM role lacks the create-LB permissions, the reconcile loop fails silently with the EXTERNAL-IP frozen at <pending>.",
  original_event: `$ kubectl get svc edge-gateway -n edge
NAME           TYPE          CLUSTER-IP    EXTERNAL-IP   PORT(S)         AGE
edge-gateway   LoadBalancer  10.96.0.77    <pending>     443:31443/TCP   22m

$ kubectl -n kube-system logs deploy/aws-cloud-controller-manager --tail=10
E ensureLoadBalancer for service edge/edge-gateway:
  AccessDenied: User: arn:aws:sts::123:assumed-role/eks-cluster-role/cluster-xyz
  is not authorized to perform: elasticloadbalancing:CreateLoadBalancer`,
  affected: [
    { kind: "Service", name: "edge-gateway", detail: "Type=LoadBalancer · EXTERNAL-IP <pending>", action: "Fix IAM or workaround via existing LB.", severity: "high" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["cloud-controller-manager", "cloud-iam"],
  logs_sample: `aws-cloud-controller-manager: starting ensureLoadBalancer
aws-cloud-controller-manager: AccessDenied calling CreateLoadBalancer
service-controller: requeuing edge/edge-gateway after 30s`,
  metrics_sample: `kube_service_spec_type{service="edge-gateway"}=LoadBalancer
kube_service_status_load_balancer_ingress_count{service="edge-gateway"}  0`,
  response_actions: ["Restore IAM policy", "Use existing LB", "Switch to Ingress", "Open cloud console"],
  next_steps: [
    { level: "L1", text: "kubectl describe svc edge-gateway — confirm 'SyncLoadBalancerFailed' event." },
    { level: "L2", text: "Cloud team: restore elasticloadbalancing:* on the cluster role (or attach an explicit LB-provisioning role)." },
    { level: "L3", text: "Workaround until IAM lands: pre-create an NLB and point a Service type=ClusterIP behind a TargetGroupBinding (AWS Load Balancer Controller)." },
  ],
  k8s_concept: {
    concept: "cloud-controller-manager & Service type=LoadBalancer",
    definition: "cloud-controller-manager runs provider-specific controllers (LB, route, node) so the upstream Kubernetes code stays cloud-agnostic.",
    why_it_exists: "Lets Kubernetes natively integrate with each cloud's LB / IAM / VPC primitives without bloating the core.",
    enterprise_impact: "An IAM regression here = no new exposed services. Affects every new deploy that uses type=LoadBalancer.",
    beginner: "Kubernetes asked AWS for a load balancer, but AWS replied 'you're not allowed' — so nothing happens.",
    engineer: "Service-controller in CCM watches type=LoadBalancer services and calls EnsureLoadBalancer. Failures are surfaced as events but the service simply stays Pending.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "lb",
    tools: [TOOL_KUBECTL, TOOL_CLOUD_LB, TOOL_SERVICE],
    learn_more: [
      { question: "Why is CCM separate from kube-controller-manager?", answer: "To decouple cloud-specific code from the upstream K8s release cycle — each cloud ships its own CCM image." },
      { question: "What annotations matter for AWS LBs?", answer: "service.beta.kubernetes.io/aws-load-balancer-type (nlb/clb), -scheme, -subnets, -ssl-cert. Modern stacks prefer the AWS Load Balancer Controller + Ingress." },
      { question: "Can I see retries?", answer: "Yes — kubectl describe svc shows SyncLoadBalancerFailed events with full provider error message." },
    ],
  },
});

const INC_4008 = mk({
  id: "K8S-INC-4008",
  title: "ConfigMap update not propagating — pods still using old config (M4-INC-408)",
  severity: "medium",
  status: "open",
  owner: "checkout-team",
  cluster: "prod-use1",
  namespace: "checkout",
  service: "checkout-api",
  detected_at: iso(35),
  last_event_at: iso(10),
  failure_chain: "Deploy → Run",
  current_phase: "run",
  failed_phases: ["run"],
  briefing: {
    who: "checkout-api Deployment — env vars sourced from a ConfigMap.",
    what: "ConfigMap updated 35 min ago but pods still report old FEATURE_FLAG value.",
    where: "prod-use1, namespace checkout.",
    when: `${iso(35)} — kubectl apply on the ConfigMap 35 min ago.`,
    why: "envFrom injects the ConfigMap at pod start; values are NOT reloaded live. Without a rollout, pods keep the old env.",
    how: "kubectl exec <pod> -- env | grep FEATURE_FLAG → old value.",
    severity_rationale: "MEDIUM — feature flag stuck; no downtime but rollout looks 'broken'.",
  },
  description: "Common confusion: ConfigMaps mounted as volumes auto-update inside pods (with ~60s delay), but ConfigMaps consumed via envFrom/env do NOT — they snapshot at pod start.",
  original_event: `$ kubectl get cm checkout-config -n checkout -o jsonpath='{.data.FEATURE_FLAG}'
new

$ kubectl exec checkout-api-7c-xkqz2 -n checkout -- env | grep FEATURE_FLAG
FEATURE_FLAG=old

$ kubectl get deploy checkout-api -n checkout -o jsonpath='{.spec.template.spec.containers[0].envFrom}'
[{"configMapRef":{"name":"checkout-config"}}]`,
  affected: [
    { kind: "Deployment", name: "checkout-api", detail: "Pods still on old env values", action: "Trigger a rollout.", severity: "medium" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kubelet", "kube-apiserver"],
  logs_sample: `(no errors — pods are healthy, just on old config)`,
  metrics_sample: `kube_configmap_info{configmap="checkout-config"}     present
kube_pod_container_status_restarts_total           0
feature_flag_value{app="checkout-api"}             "old"`,
  response_actions: ["kubectl rollout restart", "Switch to volume mount", "Use checksum annotation", "Document policy"],
  next_steps: [
    { level: "L1", text: "kubectl rollout restart deploy/checkout-api -n checkout — picks up the new envFrom on next pod start." },
    { level: "L2", text: "Better: mount the ConfigMap as a volume and have the app re-read on SIGHUP or file watch — no rollout needed." },
    { level: "L3", text: "Add a 'config-checksum' annotation on the PodTemplate (Helm chart pattern) so a ConfigMap change forces a rollout automatically." },
  ],
  k8s_concept: {
    concept: "ConfigMap propagation: envFrom vs volume",
    definition: "envFrom/env injects ConfigMap values into the container env at pod creation. volumeMounts project values as files and kubelet refreshes them ~60s later.",
    why_it_exists: "envFrom is a 1:1 'compile-time' env injection. Volume projection is dynamic. Trade-off between simplicity and live reload.",
    enterprise_impact: "Teams shipping config changes assume live reload; without a rollout or checksum annotation, the change never lands.",
    beginner: "Environment variables only get set when the pod starts. Changing the ConfigMap doesn't restart the pod for you.",
    engineer: "envFrom is resolved during PodSpec admission and copied into the container env. Volume-mounted CMs are updated by kubelet via the config sync loop (default 60-120s).",
    architecture_flow: ROLLOUT_FLOW,
    failure_stage_id: "kubelet",
    tools: [TOOL_KUBECTL, TOOL_KUBELET, TOOL_DEPLOYMENT],
    learn_more: [
      { question: "How fast is volume-mounted ConfigMap propagation?", answer: "Up to kubelet --sync-frequency * 2 (default ~120s). Apps need to re-read the file (inotify or polling)." },
      { question: "What's the checksum annotation pattern?", answer: "Helm injects sha256sum(.Values.config) into the PodTemplate annotation. Any change rolls the Deployment automatically." },
      { question: "Can I edit a ConfigMap in-place?", answer: "Yes (kubectl edit), but for envFrom consumers it has no immediate effect — always rollout-restart after." },
    ],
  },
});

const INC_4009 = mk({
  id: "K8S-INC-4009",
  title: "PodDisruptionBudget blocks node drain — patching paused (M4-INC-409)",
  severity: "high",
  status: "in_progress",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "payments",
  service: "fraud-engine",
  detected_at: iso(40),
  last_event_at: iso(5),
  failure_chain: "Deploy → Recover",
  current_phase: "recover",
  failed_phases: ["deploy"],
  briefing: {
    who: "fraud-engine PDB minAvailable=2; only 2 replicas in cluster.",
    what: "kubectl drain ip-10-4-12-7 hangs; PDB doesn't allow any eviction.",
    where: "prod-use1, namespace payments.",
    when: `${iso(40)} — node patching window started 40 min ago, blocked since.`,
    why: "minAvailable=2 with replicas=2 means the controller cannot evict ANY pod and stay within budget.",
    how: "kubectl drain prints 'Cannot evict pod as it would violate the pod's disruption budget'.",
    severity_rationale: "HIGH — patch SLA breach risk if not resolved within the maintenance window.",
  },
  description: "PDB is enforced by the eviction API: every kubectl drain / surge evicts via /eviction subresource which the PDB controller validates against minAvailable / maxUnavailable.",
  original_event: `$ kubectl drain ip-10-4-12-7 --ignore-daemonsets
evicting pod payments/fraud-engine-7c-xkqz2
error when evicting pods/"fraud-engine-7c-xkqz2" -n "payments" (will retry after 5s):
  Cannot evict pod as it would violate the pod's disruption budget.

$ kubectl get pdb -n payments
NAME             MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE
fraud-engine     2               N/A               0                      120d

$ kubectl get deploy fraud-engine -n payments
NAME            READY   UP-TO-DATE   AVAILABLE   AGE
fraud-engine    2/2     2            2           400d`,
  affected: [
    { kind: "PodDisruptionBudget", name: "fraud-engine", detail: "minAvailable=2 with replicas=2 ⇒ 0 disruptions allowed", action: "Scale up before drain, or relax PDB.", severity: "high" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kube-controller-manager"],
  logs_sample: `kubectl-drain: pod payments/fraud-engine-... cannot be evicted (PDB)
disruption-controller: budget for payments/fraud-engine: current=2, desired=2, allowed=0`,
  metrics_sample: `kube_poddisruptionbudget_status_current_healthy{poddisruptionbudget="fraud-engine"}  2
kube_poddisruptionbudget_status_desired_healthy{poddisruptionbudget="fraud-engine"}  2
kube_poddisruptionbudget_status_pod_disruptions_allowed{poddisruptionbudget="fraud-engine"}  0`,
  response_actions: ["Scale up replicas", "Relax PDB", "Patch outside drain", "Notify owners"],
  next_steps: [
    { level: "L1", text: "kubectl scale deploy/fraud-engine -n payments --replicas=3 — now PDB allows one disruption." },
    { level: "L2", text: "Re-run kubectl drain ip-10-4-12-7 — eviction proceeds; pod re-scheduled to another node." },
    { level: "L3", text: "Long-term: change PDB to maxUnavailable=1 (better — scales with replica count) instead of minAvailable=2 (brittle absolute)." },
  ],
  k8s_concept: {
    concept: "PodDisruptionBudget & voluntary disruption",
    definition: "PDB caps how many pods of a workload can be voluntarily disrupted (drain, surge, HPA scale-down). Hardware failure (involuntary) is not gated.",
    why_it_exists: "Lets workload owners declare 'no fewer than N must be running' so cluster-ops doesn't accidentally take everything down during patching.",
    enterprise_impact: "Mis-configured PDBs are the #1 reason node patching stalls — and the #1 cause of operator hotfixes at 2am.",
    beginner: "You told Kubernetes 'always keep 2 of these running'. There are only 2. So it won't let you take one down — even to move it.",
    engineer: "Eviction API validates against PDB; if currentHealthy - 1 < minAvailable, the eviction is denied with 429 TooManyRequests.",
    architecture_flow: ROLLOUT_FLOW,
    failure_stage_id: "deployment",
    tools: [TOOL_KUBECTL, TOOL_DEPLOYMENT],
    learn_more: [
      { question: "Why prefer maxUnavailable over minAvailable?", answer: "maxUnavailable scales with replicas — '25%' stays sensible whether you have 4 or 40. minAvailable is absolute and breaks when you scale down." },
      { question: "Does PDB block kubectl delete pod?", answer: "No. kubectl delete uses delete (not eviction). PDB only gates the eviction API used by drain / Cluster Autoscaler / etc." },
      { question: "What is allowedDisruptions?", answer: "Computed field showing how many pods can be evicted right now without violating the budget. 0 = drain blocked." },
    ],
  },
});

const INC_4010 = mk({
  id: "K8S-INC-4010",
  title: "Session affinity broken — users randomly logged out (M4-INC-410)",
  severity: "high",
  status: "open",
  owner: "shop-team",
  cluster: "prod-use1",
  namespace: "shop",
  service: "cart-api",
  detected_at: iso(20),
  last_event_at: iso(2),
  failure_chain: "Run → Observe",
  current_phase: "observe",
  failed_phases: ["run"],
  briefing: {
    who: "cart-api Service in front of cart-api Deployment.",
    what: "Sessions cached in pod memory; users randomly thrown to a different pod and 'logged out'.",
    where: "prod-use1, namespace shop.",
    when: `${iso(20)} — started after the team moved from sticky-cookie ingress to ClusterIP-only.`,
    why: "Service.spec.sessionAffinity defaults to None — each connection is randomly DNATed to any backend pod.",
    how: "Set sessionAffinity=ClientIP, or move session state out of pod memory.",
    severity_rationale: "HIGH — every cart-impacted user complains; revenue impact.",
  },
  description: "Service sessionAffinity controls whether subsequent requests from the same client IP go to the same backend. With None, kube-proxy round-robins each TCP connection.",
  original_event: `$ kubectl get svc cart-api -n shop -o jsonpath='{.spec.sessionAffinity}'
None

$ for i in 1 2 3 4; do curl -s http://cart-api/whoami | head -c 80; echo; done
served_by=cart-api-7c-xkqz2
served_by=cart-api-7c-pmnq8
served_by=cart-api-7c-aaaa
served_by=cart-api-7c-xkqz2`,
  affected: [
    { kind: "Service", name: "cart-api", detail: "sessionAffinity=None · sessions thrash", action: "Enable sticky or externalise session state.", severity: "high" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["kube-proxy", "kube-apiserver"],
  logs_sample: `cart-api pod A: session 'abc' not found
cart-api pod B: session 'abc' refreshed
ingress-nginx: round-robin upstream (no sticky-cookie configured)`,
  metrics_sample: `cart_session_miss_total            rate +6/s
cart_session_hit_total              rate -6/s
ingress_nginx_upstream_balance      uniform across 4 pods`,
  response_actions: ["Enable ClientIP affinity", "Move sessions to Redis", "Re-enable sticky cookie", "Notify customers"],
  next_steps: [
    { level: "L1", text: "kubectl patch svc cart-api -n shop --type=merge -p '{\"spec\":{\"sessionAffinity\":\"ClientIP\"}}' — quick win; same client IP → same pod." },
    { level: "L2", text: "If behind NAT/CGNAT this masks all users to one IP — re-enable nginx sticky-cookie at the ingress layer." },
    { level: "L3", text: "Real fix: externalise session state to Redis/ElastiCache; pods become stateless and can be load-balanced freely." },
  ],
  k8s_concept: {
    concept: "Service sessionAffinity & sticky routing",
    definition: "Service.spec.sessionAffinity=ClientIP makes kube-proxy DNAT all traffic from one client IP to the same pod for sessionAffinityConfig.clientIP.timeoutSeconds.",
    why_it_exists: "Legacy stateful workloads (PHP session in pod memory) need stickiness. Modern apps externalise state.",
    enterprise_impact: "Mis-configured stickiness is invisible until your users start complaining about 'random logouts'.",
    beginner: "Without sticky, every request might land on a different copy of your app — copies don't share memory.",
    engineer: "kube-proxy uses conntrack to keep the affinity; expires after timeoutSeconds (default 10800s/3h). ClientIP-only — no header-based stickiness at L4.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "kubeproxy",
    tools: [TOOL_KUBECTL, TOOL_SERVICE, TOOL_INGRESS],
    learn_more: [
      { question: "What about cookie-based stickiness?", answer: "Only at L7 — handled by Ingress controllers (nginx sticky-cookie, ALB stickiness). Service.spec only does ClientIP." },
      { question: "Why is sessionAffinity bad with NAT?", answer: "All clients behind one NAT IP get pinned to one pod — load imbalance and SPOF." },
      { question: "Best practice for new apps?", answer: "Stateless pods + externalised session store. Stickiness is a workaround, not an architecture." },
    ],
  },
});

const INC_4011 = mk({
  id: "K8S-INC-4011",
  title: "Ingress TLS expired — cert-manager renewal stuck (M4-INC-411)",
  severity: "critical",
  status: "open",
  owner: "platform-oncall",
  cluster: "prod-use1",
  namespace: "shop",
  service: "shop-ingress",
  detected_at: iso(3),
  last_event_at: iso(0),
  failure_chain: "Run → Observe",
  current_phase: "observe",
  failed_phases: ["run"],
  briefing: {
    who: "shop.acme.com via ingress-nginx; cert managed by cert-manager.",
    what: "Browsers show 'NET::ERR_CERT_DATE_INVALID'; cert expired 3 min ago.",
    where: "prod-use1, namespace shop.",
    when: `${iso(3)} — expiry timestamp passed 3 min ago; renewal has been failing for 24h.`,
    why: "ACME HTTP01 challenge solver pods cannot reach the cluster from the public internet (subnet routing change).",
    how: "kubectl describe certificate shop-tls → Order Failed: HTTP01 challenge propagation timeout.",
    severity_rationale: "CRITICAL — entire shop frontend rejects HTTPS connections.",
  },
  description: "cert-manager creates Certificate → Order → Challenge. HTTP01 requires the public internet to reach a temporary path on the cluster. A subnet/SG change can silently break this without alerting until expiry.",
  original_event: `$ kubectl get certificate shop-tls -n shop
NAME       READY   SECRET     AGE
shop-tls   False   shop-tls   93d

$ kubectl describe certificate shop-tls -n shop | sed -n '/Status/,/Events/p'
Status:
  Conditions:
    Type:   Ready  Status: False  Reason: Failed
    Message: order has failed: HTTP01 challenge propagation: failed to perform self check GET request 'http://shop.acme.com/.well-known/acme-challenge/...': i/o timeout

$ openssl s_client -connect shop.acme.com:443 -servername shop.acme.com </dev/null 2>/dev/null | openssl x509 -noout -dates
notBefore=Feb 23 00:00:00 2026 GMT
notAfter=May 24 23:59:59 2026 GMT`,
  affected: [
    { kind: "Certificate", name: "shop-tls", detail: "READY=False · expired", action: "Restore ACME path or import new cert.", severity: "critical" },
    { kind: "Ingress", name: "shop", detail: "TLS rejected by browsers", action: "Hotfix cert + investigate subnet.", severity: "critical" },
  ],
  aligned_tools: ["kubectl"],
  data_sources: ["cert-manager", "ingress-nginx"],
  logs_sample: `cert-manager: presenting challenge for shop.acme.com (HTTP01)
cert-manager: self-check failed: i/o timeout
acme-http-solver pod: started on :8089 but no inbound requests`,
  metrics_sample: `certmanager_certificate_expiration_timestamp_seconds{name="shop-tls"}  <now>
certmanager_certificate_ready_status{name="shop-tls",condition="False"}  1
nginx_ingress_controller_ssl_expire_time_seconds                       <now>`,
  response_actions: ["Import emergency cert", "Switch to DNS01", "Restore subnet route", "Page exec on-call"],
  next_steps: [
    { level: "L1", text: "Emergency: import a manually issued cert into the existing Secret to restore HTTPS while you fix renewal." },
    { level: "L2", text: "kubectl -n cert-manager logs deploy/cert-manager — confirm HTTP01 self-check is the problem; verify path is reachable from the public internet." },
    { level: "L3", text: "Switch the ClusterIssuer to DNS01 (route53/cloudDNS) — no public ingress required, much more resilient." },
  ],
  k8s_concept: {
    concept: "cert-manager Certificate → Order → Challenge",
    definition: "cert-manager watches Certificate CRDs and creates Orders against an ACME issuer. Each Order spawns Challenges (HTTP01 or DNS01). On success it writes the Secret.",
    why_it_exists: "Auto-rotate TLS without humans; reduces expired-cert outages — when the renewal pipeline works.",
    enterprise_impact: "Silent renewal failure is the worst case — alerts only fire on expiry, when it's too late.",
    beginner: "Kubernetes was supposed to renew the HTTPS certificate, but the renewal process couldn't reach the internet to prove ownership.",
    engineer: "HTTP01 requires inbound :80 to the solver pod via the existing Ingress. DNS01 only needs DNS API access — safer for private clusters.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "ingress",
    tools: [TOOL_KUBECTL, TOOL_INGRESS, TOOL_CERTMANAGER],
    learn_more: [
      { question: "Why does HTTP01 fail more than DNS01?", answer: "HTTP01 depends on public reachability to your cluster on :80. Any firewall/route/SG change breaks it. DNS01 only needs DNS API." },
      { question: "How early should renewal happen?", answer: "cert-manager default = renew at 2/3 of validity (e.g. day 60 of a 90-day cert). Alert on renewalTime - 7d if Ready=False." },
      { question: "How to monitor expiry?", answer: "Alert on certmanager_certificate_expiration_timestamp_seconds < now+7d AND ready_status{condition='False'}." },
    ],
  },
});

const INC_4012 = mk({
  id: "K8S-INC-4012",
  title: "Canary rollout wrong weight — Argo Rollouts not honouring setWeight (M4-INC-412)",
  severity: "high",
  status: "in_progress",
  owner: "shop-team",
  cluster: "prod-use1",
  namespace: "shop",
  service: "web",
  detected_at: iso(8),
  last_event_at: iso(1),
  failure_chain: "Deploy → Observe",
  current_phase: "deploy",
  failed_phases: ["deploy"],
  briefing: {
    who: "web Rollout v3.0.0 — canary configured at 20% but receiving ~80% of traffic.",
    what: "Grafana shows canary error rate spiking 5x baseline; weight is wrong.",
    where: "prod-use1, namespace shop.",
    when: `${iso(8)} — canary stepped to setWeight=20 8 min ago.`,
    why: "Rollout spec references stableService=web-stable but the team also has a Service 'web' (no selector for stable/canary), so ingress-nginx sees them as one pool.",
    how: "kubectl argo rollouts get rollout web shows SetWeight=20, but ingress backend is the legacy 'web' Service routing 50/50 by replica count.",
    severity_rationale: "HIGH — partial outage; if error budget burns, automatic abort triggers.",
  },
  description: "Argo Rollouts canary requires two Services (stable + canary) AND an ingress integration (nginx/ALB/Istio) that can weight traffic. Misconfigured services collapse the canary to plain replica-based routing.",
  original_event: `$ kubectl argo rollouts get rollout web -n shop
Name:            web
Status:          ⏸ Paused
Message:         CanaryPauseStep
Strategy:        Canary
  Step:          2/6
  SetWeight:     20
  ActualWeight:  80    # <-- mismatch
Replicas:
  Desired:       10
  Current:       10  (stable 2, canary 8)`,
  affected: [
    { kind: "Rollout", name: "web", detail: "SetWeight=20 but ActualWeight=80", action: "Fix stable/canary Service split or abort.", severity: "high" },
  ],
  aligned_tools: ["kubectl", "Prometheus", "Grafana"],
  data_sources: ["argo-rollouts", "ingress-nginx", "prom"],
  logs_sample: `argo-rollouts: traffic routing: nginx — desired weight 20, actual 80
ingress-nginx: upstream balancer rebuilt for shop/web`,
  metrics_sample: `rollout_canary_weight{rollout="web"}     20
rollout_canary_traffic{rollout="web"}     80
http_request_error_rate{version="canary"} 5x baseline`,
  response_actions: ["Abort rollout", "Fix Service split", "Promote / rollback", "Open Grafana"],
  next_steps: [
    { level: "L1", text: "kubectl argo rollouts abort web -n shop — instantly route 100% to stable while you investigate." },
    { level: "L2", text: "Define web-stable and web-canary Services (each selecting the rollout's stableHash/canaryHash labels)." },
    { level: "L3", text: "Add an AnalysisTemplate that auto-aborts when error rate > 2x baseline — catches this class of bug before customers do." },
  ],
  k8s_concept: {
    concept: "Argo Rollouts canary + ingress traffic shaping",
    definition: "Argo Rollouts owns the Deployment-equivalent CR. setWeight steps push the desired % to the ingress integration, which programs the actual traffic split.",
    why_it_exists: "Vanilla Deployment rolling update can only do replica-based gradients; modern canaries need actual L7 traffic weighting + auto-abort on metrics.",
    enterprise_impact: "Progressive delivery is only safe if the weight actually matches reality — mismatch defeats the whole purpose.",
    beginner: "You told Kubernetes to send 20% of users to the new version, but because the routing setup is wrong, 80% are getting it instead.",
    engineer: "Rollout.spec.strategy.canary.trafficRouting.nginx requires stableIngress + matching annotations. Without it, ActualWeight degrades to currentCanaryPods / totalPods.",
    architecture_flow: TRAFFIC_FLOW,
    failure_stage_id: "ingress",
    tools: [TOOL_KUBECTL, TOOL_ARGO_ROLLOUTS, TOOL_INGRESS, TOOL_PROMETHEUS],
    learn_more: [
      { question: "What's the difference between canary and blue/green?", answer: "Canary = gradually shift % traffic to new. Blue/green = stand up full new version, switch all traffic in one cut. Canary is safer for regressions; blue/green is faster to roll back." },
      { question: "How does Argo Rollouts measure success?", answer: "AnalysisTemplate (PromQL query, web request, k6 run) gates each step. Failure auto-aborts and routes 100% back to stable." },
      { question: "Can I do this without Argo?", answer: "Yes — Flagger does the same on top of Istio/Linkerd/AppMesh. Vanilla Deployment + Service can only do replica-weighted." },
    ],
  },
});

// =============================================================================
// EXPORT
// =============================================================================

export const M4_INCIDENTS: K8sIncidentWithConcept[] = [
  INC_4001, INC_4002, INC_4003,
  INC_4004, INC_4005, INC_4006,
  INC_4007, INC_4008, INC_4009,
  INC_4010, INC_4011, INC_4012,
];

// Re-export so other consumers can import the type from one place if they wish.
export type { K8sIncidentWithConcept };

// Mark unused import as referenced for tree-shakers that complain.
void (null as unknown as K8sIncident);
