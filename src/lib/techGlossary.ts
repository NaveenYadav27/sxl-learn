// Cross-course tech glossary used by <SmartText> to auto-link tech terms
// to a hover definition. Keep entries short — the popover displays them.

import { DOCKER_HOVER_TERMS, type HoverTerm } from "@/lib/dockerHoverTerms";

export type GlossaryEntry = HoverTerm & { aliases?: string[] };

export const TECH_GLOSSARY: Record<string, GlossaryEntry> = {
  // ---- Kubernetes core ----
  pod: {
    term: "Pod",
    quick: "Smallest deployable unit in Kubernetes — one or more containers sharing network & storage.",
    definition: "A Pod groups tightly-coupled containers that always run on the same node and share a network namespace.",
    production: "Always run Pods through a Deployment / StatefulSet — never apply bare Pods.",
    aliases: ["pods"],
  },
  deployment: {
    term: "Deployment",
    quick: "K8s controller that manages a replicated, rolling-updated set of Pods.",
    definition: "Wraps a ReplicaSet with declarative rolling updates and rollbacks.",
    aliases: ["deployments"],
  },
  replicaset: {
    term: "ReplicaSet",
    quick: "Controller that keeps N copies of a Pod running.",
    aliases: ["replicasets", "replica set"],
  },
  service: {
    term: "Service",
    quick: "Stable virtual IP + DNS name in front of a set of Pods.",
    bullets: [{ label: "Types", items: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"] }],
    aliases: ["services", "k8s service"],
  },
  ingress: {
    term: "Ingress",
    quick: "L7 HTTP routing into the cluster — host + path → Service.",
  },
  configmap: {
    term: "ConfigMap",
    quick: "Non-secret configuration injected as env vars or files.",
    aliases: ["configmaps"],
  },
  secret: {
    term: "Secret",
    quick: "Base64-encoded sensitive data (passwords, tokens, certs).",
    security: "Use external secret managers (Vault / Cloud KMS) for production.",
    aliases: ["secrets"],
  },
  namespace: DOCKER_HOVER_TERMS.namespace,
  node: {
    term: "Node",
    quick: "A worker machine (VM or physical) running the kubelet and Pods.",
    aliases: ["nodes", "worker node"],
  },
  kubelet: {
    term: "kubelet",
    quick: "Per-node agent that talks to the API server and runs containers.",
  },
  "kube-proxy": {
    term: "kube-proxy",
    quick: "Per-node network proxy implementing Service IPs via iptables/IPVS.",
  },
  etcd: {
    term: "etcd",
    quick: "Distributed key-value store — the source of truth for cluster state.",
  },
  scheduler: {
    term: "kube-scheduler",
    quick: "Picks the best node for each new Pod based on resources and constraints.",
  },
  cni: {
    term: "CNI",
    quick: "Container Network Interface — pluggable pod networking (Calico, Cilium, Flannel).",
  },
  csi: {
    term: "CSI",
    quick: "Container Storage Interface — pluggable storage drivers.",
  },
  helm: {
    term: "Helm",
    quick: "Kubernetes package manager — templated charts, releases, rollbacks.",
  },
  kubectl: {
    term: "kubectl",
    quick: "CLI to talk to the Kubernetes API server.",
  },
  yaml: {
    term: "YAML",
    quick: "Human-readable config format used for all Kubernetes manifests.",
  },
  manifest: {
    term: "Manifest",
    quick: "A YAML/JSON file describing desired state of one or more K8s objects.",
    aliases: ["manifests"],
  },
  "control plane": {
    term: "Control plane",
    quick: "API server + scheduler + controller-manager + etcd — the brain of the cluster.",
  },
  "api server": {
    term: "API server",
    quick: "The single front-door REST API to the cluster — kubectl, controllers and kubelets all talk to it.",
  },
  "rolling update": {
    term: "Rolling update",
    quick: "Zero-downtime deploy: gradually replace old Pods with new ones.",
  },
  "liveness probe": {
    term: "Liveness probe",
    quick: "Health check — kills the container if it stops responding.",
  },
  "readiness probe": {
    term: "Readiness probe",
    quick: "Marks the Pod as not-ready so Service traffic skips it.",
  },
  "imagepullbackoff": {
    term: "ImagePullBackOff",
    quick: "Pod can't pull its image — wrong name, tag, or missing registry credentials.",
  },
  "crashloopbackoff": {
    term: "CrashLoopBackOff",
    quick: "Container repeatedly exits — kubelet backs off restart attempts.",
  },

  // ---- Containers (re-exported from dockerHoverTerms via spread) ----
  container: DOCKER_HOVER_TERMS.container,
  image: DOCKER_HOVER_TERMS.image,
  layer: DOCKER_HOVER_TERMS.layer,
  registry: DOCKER_HOVER_TERMS.registry,
  dockerfile: {
    term: "Dockerfile",
    quick: "Text recipe describing how to build an image (FROM, RUN, COPY, CMD…).",
  },
  cgroup: DOCKER_HOVER_TERMS.cgroup,
  containerd: DOCKER_HOVER_TERMS.containerd,
  runc: DOCKER_HOVER_TERMS.runc,
  oci: DOCKER_HOVER_TERMS.oci,
  capabilities: DOCKER_HOVER_TERMS.capabilities,
  seccomp: DOCKER_HOVER_TERMS.seccomp,
  overlayfs: DOCKER_HOVER_TERMS.overlayfs,
  "multi-stage": DOCKER_HOVER_TERMS["multi-stage"],

  // ---- Cloud / platforms ----
  eks: { term: "EKS", quick: "Amazon Elastic Kubernetes Service — AWS managed K8s." },
  aks: { term: "AKS", quick: "Azure Kubernetes Service — Microsoft managed K8s." },
  gke: { term: "GKE", quick: "Google Kubernetes Engine — GCP managed K8s." },
  openshift: { term: "OpenShift", quick: "Red Hat's enterprise Kubernetes distribution." },
  iam: {
    term: "IAM",
    quick: "Identity & Access Management — who can do what on which resource.",
  },
  rbac: {
    term: "RBAC",
    quick: "Role-Based Access Control — bind Roles/ClusterRoles to users or service accounts.",
  },
  "service account": {
    term: "ServiceAccount",
    quick: "An identity for processes running inside Pods (used for API access).",
  },

  // ---- Networking ----
  dns: { term: "DNS", quick: "Domain Name System — resolves names to IPs (CoreDNS in K8s)." },
  tls: { term: "TLS", quick: "Transport Layer Security — encrypts traffic; cert + private key required." },
  http: { term: "HTTP", quick: "Stateless request/response protocol of the web." },
  https: { term: "HTTPS", quick: "HTTP over TLS — encrypted and authenticated." },
  tcp: { term: "TCP", quick: "Reliable, connection-oriented transport protocol." },
  udp: { term: "UDP", quick: "Connectionless datagram protocol — fast, no delivery guarantee." },
  vpc: { term: "VPC", quick: "Virtual Private Cloud — your isolated network in a cloud provider." },
  subnet: { term: "Subnet", quick: "A slice of an IP range bound to one availability zone." },
  loadbalancer: {
    term: "Load balancer",
    quick: "Distributes incoming traffic across many backends.",
    aliases: ["load balancer", "load-balancer"],
  },
  nat: { term: "NAT", quick: "Network Address Translation — rewrites packet IPs at a boundary." },
  vlan: { term: "VLAN", quick: "Virtual LAN — logical L2 segmentation over physical switches." },
  cidr: { term: "CIDR", quick: "IP block notation, e.g. 10.0.0.0/16 — prefix length sets the size." },

  // ---- DevOps / SRE ----
  cicd: {
    term: "CI/CD",
    quick: "Continuous Integration & Delivery — automated build → test → deploy pipeline.",
    aliases: ["ci/cd", "ci-cd"],
  },
  pipeline: {
    term: "Pipeline",
    quick: "An ordered set of automated stages (build, test, deploy).",
    aliases: ["pipelines"],
  },
  artifact: {
    term: "Artifact",
    quick: "A built binary, image, or package produced by a pipeline.",
    aliases: ["artifacts"],
  },
  sre: { term: "SRE", quick: "Site Reliability Engineering — software discipline applied to operations." },
  sla: { term: "SLA", quick: "Service Level Agreement — contractual reliability promise to a customer." },
  slo: { term: "SLO", quick: "Service Level Objective — internal target, e.g. 99.9% availability." },
  sli: { term: "SLI", quick: "Service Level Indicator — actual measured metric (latency, error rate)." },
  mttr: { term: "MTTR", quick: "Mean Time To Recover — average time to restore service after an incident." },
  mtbf: { term: "MTBF", quick: "Mean Time Between Failures — reliability measure." },
  "error budget": {
    term: "Error budget",
    quick: "How much unreliability you can spend before halting feature releases.",
  },
  "blue-green": {
    term: "Blue/Green",
    quick: "Two identical environments — flip traffic from blue → green to deploy with instant rollback.",
  },
  canary: {
    term: "Canary release",
    quick: "Send a small % of traffic to the new version, ramp up if healthy.",
  },
  iac: { term: "IaC", quick: "Infrastructure as Code — Terraform, Pulumi, CloudFormation, Bicep." },
  terraform: { term: "Terraform", quick: "HashiCorp's declarative IaC tool." },
  ansible: { term: "Ansible", quick: "Agentless config management & automation tool." },
  git: { term: "Git", quick: "Distributed version control — branches, commits, merges, pulls." },
  gitops: { term: "GitOps", quick: "Git is the source of truth for infra; agents reconcile clusters to it." },

  // ---- Observability ----
  prometheus: { term: "Prometheus", quick: "Pull-based metrics database, the de-facto K8s metrics tool." },
  grafana: { term: "Grafana", quick: "Dashboards & alerting on top of Prometheus / Loki / many sources." },
  loki: { term: "Loki", quick: "Log aggregation system — like Prometheus but for logs." },
  jaeger: { term: "Jaeger", quick: "Distributed tracing — follow a request across services." },
  opentelemetry: { term: "OpenTelemetry", quick: "Vendor-neutral SDK for traces, metrics & logs.", aliases: ["otel"] },
  splunk: { term: "Splunk", quick: "Indexes machine data for search, dashboards and alerting." },

  // ---- Security ----
  cve: { term: "CVE", quick: "Common Vulnerabilities and Exposures — public ID for a known security flaw." },
  cvss: { term: "CVSS", quick: "Common Vulnerability Scoring System (0–10) — severity score for a CVE." },
  mfa: { term: "MFA", quick: "Multi-Factor Authentication — something-you-know + something-you-have." },
  oauth: { term: "OAuth", quick: "Delegated authorization protocol — issues access tokens to apps." },
  oidc: { term: "OIDC", quick: "OpenID Connect — authentication layer on top of OAuth 2.0." },
  saml: { term: "SAML", quick: "XML-based federated SSO standard, common in enterprises." },
  jwt: { term: "JWT", quick: "JSON Web Token — signed, base64-encoded claims passed in headers." },
  zerotrust: { term: "Zero Trust", quick: "Never trust, always verify — no implicit network trust.", aliases: ["zero trust", "zero-trust"] },
  siem: { term: "SIEM", quick: "Security Information & Event Management — central security log analytics." },
  soar: { term: "SOAR", quick: "Security Orchestration, Automation & Response — automate playbooks." },
  edr: { term: "EDR", quick: "Endpoint Detection & Response — agent-based endpoint security." },
  xdr: { term: "XDR", quick: "Extended Detection & Response — EDR + network + identity correlation." },
  soc: { term: "SOC", quick: "Security Operations Center — 24/7 team monitoring alerts & incidents." },

  // ---- ITSM ----
  itil: { term: "ITIL", quick: "IT Infrastructure Library — best-practice framework for IT service management." },
  itsm: { term: "ITSM", quick: "IT Service Management — process discipline for delivering IT services." },
  incident: { term: "Incident", quick: "Unplanned interruption to a service — restore as fast as possible.", aliases: ["incidents"] },
  problem: { term: "Problem", quick: "Underlying root cause of one or more incidents.", aliases: ["problems"] },
  change: { term: "Change", quick: "Any addition, modification or removal of a service or component.", aliases: ["changes"] },
  cmdb: { term: "CMDB", quick: "Configuration Management Database — inventory of all services & dependencies." },
  ci: { term: "CI", quick: "Configuration Item — a single managed asset in the CMDB." },
  servicenow: { term: "ServiceNow", quick: "Leading enterprise ITSM / workflow platform." },

  // ---- Misc ----
  api: { term: "API", quick: "Application Programming Interface — contract between two systems.", aliases: ["apis"] },
  rest: { term: "REST", quick: "HTTP-based API style using verbs (GET/POST/PUT/DELETE) on resources." },
  graphql: { term: "GraphQL", quick: "Query language for APIs — clients ask for exactly the fields they need." },
  webhook: { term: "Webhook", quick: "HTTP callback — service A POSTs an event to a URL on service B.", aliases: ["webhooks"] },
  microservice: { term: "Microservice", quick: "Small, independently deployable service with one bounded context.", aliases: ["microservices"] },
  monolith: { term: "Monolith", quick: "Single deployable unit containing all features.", aliases: ["monolithic"] },
};

// Build a flat lookup: alias-or-key (lowercase) → entry
const LOOKUP: Map<string, GlossaryEntry> = (() => {
  const m = new Map<string, GlossaryEntry>();
  for (const [k, v] of Object.entries(TECH_GLOSSARY)) {
    m.set(k.toLowerCase(), v);
    v.aliases?.forEach((a) => m.set(a.toLowerCase(), v));
  }
  // Also fold in any docker-only terms not already mapped
  for (const [k, v] of Object.entries(DOCKER_HOVER_TERMS)) {
    if (!m.has(k.toLowerCase())) m.set(k.toLowerCase(), v as GlossaryEntry);
  }
  return m;
})();

export function findGlossaryTerm(key: string): GlossaryEntry | undefined {
  if (!key) return undefined;
  return LOOKUP.get(key.toLowerCase());
}

// Sorted list of all match-keys (longest first) for greedy regex matching.
export const GLOSSARY_KEYS_SORTED: string[] = Array.from(LOOKUP.keys()).sort(
  (a, b) => b.length - a.length,
);
