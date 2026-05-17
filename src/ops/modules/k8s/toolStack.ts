// Tool stack catalog used by every K8s incident detail page.
// Each tool is mapped to its role in the DevOps cycle and to the K8s
// curriculum module where the learner first meets it.

import type { AlignedTool, K8sPhaseId } from "./incidentsData";

export interface ToolDescriptor {
  tool: AlignedTool;
  category: "Build" | "Registry" | "Orchestrator" | "Delivery" | "Observability" | "Security" | "Runtime";
  module: "K8S-M1" | "K8S-M2" | "K8S-M3" | "K8S-M4" | "K8S-M5";
  module_title: string;
  phases: K8sPhaseId[];
  purpose: string;
  commands: string[];
  why_it_matters: string;
}

export const TOOL_CATALOG: Record<AlignedTool, ToolDescriptor> = {
  Docker: {
    tool: "Docker",
    category: "Build",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    phases: ["code", "build"],
    purpose:
      "Authors the container image from a Dockerfile. Builds reproducible, immutable layers and produces an OCI artifact that any runtime can run.",
    commands: ["docker build -t app:1.0 .", "docker tag", "docker push", "docker inspect"],
    why_it_matters:
      "Every K8s workload begins life as a Docker image. A bad RUN line or missing apt-get update breaks the entire pipeline before deployment ever starts.",
  },
  containerd: {
    tool: "containerd",
    category: "Runtime",
    module: "K8S-M1",
    module_title: "M1 · Containerization Fundamentals & Docker Architecture",
    phases: ["run"],
    purpose:
      "The CRI runtime kubelet uses to pull images and start containers. It talks to runc, manages snapshots and reports container state back to kubelet.",
    commands: ["crictl ps", "crictl images", "crictl logs", "journalctl -u containerd"],
    why_it_matters:
      "When kubelet reports ImagePullBackOff or container fails to start, the root cause is almost always visible in containerd / crictl, not in kubectl alone.",
  },
  GHCR: {
    tool: "GHCR",
    category: "Registry",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    phases: ["push"],
    purpose:
      "GitHub Container Registry stores tagged images. Authentication uses a PAT or GITHUB_TOKEN with read:packages / write:packages scopes.",
    commands: ["docker login ghcr.io", "docker push ghcr.io/org/app:tag"],
    why_it_matters:
      "Push failures (401 / denied) break the release before deploy. ImagePullSecrets in K8s must align with the registry's auth model.",
  },
  Trivy: {
    tool: "Trivy",
    category: "Security",
    module: "K8S-M2",
    module_title: "M2 · Building Docker Images & Containerized Apps",
    phases: ["scan"],
    purpose:
      "Scans images and IaC for CVEs and misconfigurations before they reach the registry. Plugs into CI as a gate between build and push.",
    commands: ["trivy image app:1.0", "trivy config ./infra", "trivy fs ."],
    why_it_matters:
      "A scanned image with no HIGH/CRITICAL CVEs is the shift-left checkpoint that keeps vulnerable workloads out of production clusters.",
  },
  kubectl: {
    tool: "kubectl",
    category: "Orchestrator",
    module: "K8S-M3",
    module_title: "M3 · Kubernetes Fundamentals & Pod Architecture",
    phases: ["deploy", "schedule", "run", "observe", "recover"],
    purpose:
      "The primary CLI against the Kubernetes API. Apply manifests, inspect objects, read events and logs, exec into pods, undo rollouts.",
    commands: [
      "kubectl apply -f deploy.yaml",
      "kubectl describe pod <name>",
      "kubectl logs <pod> --previous",
      "kubectl rollout undo deployment/<name>",
    ],
    why_it_matters:
      "Almost every K8s incident is first triaged with describe → logs → events → manifest. kubectl is the universal first responder.",
  },
  Helm: {
    tool: "Helm",
    category: "Delivery",
    module: "K8S-M4",
    module_title: "M4 · Deployments & Service Exposure",
    phases: ["deploy"],
    purpose:
      "Packages and versions a set of K8s manifests as a chart with values. Supports upgrade, rollback and templating across environments.",
    commands: ["helm upgrade --install app ./chart", "helm rollback app 1", "helm history app"],
    why_it_matters:
      "Helm gives every release a numbered revision so a bad rollout (CrashLoop, OOM, readiness) can be rolled back in a single command.",
  },
  ArgoCD: {
    tool: "ArgoCD",
    category: "Delivery",
    module: "K8S-M4",
    module_title: "M4 · Deployments & Service Exposure",
    phases: ["deploy"],
    purpose:
      "GitOps controller that reconciles a Git manifest source with the cluster. Detects drift, syncs changes, exposes rollout health.",
    commands: ["argocd app sync <app>", "argocd app history <app>", "argocd app rollback <app>"],
    why_it_matters:
      "When kubelet reports a failure, ArgoCD tells you which Git commit introduced the manifest that produced it.",
  },
  Prometheus: {
    tool: "Prometheus",
    category: "Observability",
    module: "K8S-M5",
    module_title: "M5 · Monitoring, Troubleshooting & Capstone Prep",
    phases: ["observe"],
    purpose:
      "Time-series database that scrapes cluster, node, container and app metrics through exporters and kube-state-metrics.",
    commands: [
      'kube_pod_container_status_restarts_total{pod=~"app.*"}',
      'container_memory_working_set_bytes',
      'rate(http_requests_total[5m])',
    ],
    why_it_matters:
      "Restarts, OOM events, latency spikes and SLO burn are all PromQL queries — the quantitative signal behind every K8s alert.",
  },
  Grafana: {
    tool: "Grafana",
    category: "Observability",
    module: "K8S-M5",
    module_title: "M5 · Monitoring, Troubleshooting & Capstone Prep",
    phases: ["observe"],
    purpose:
      "Dashboards on top of Prometheus / Loki. Cluster, namespace, workload, pod and SLO boards used during incident triage.",
    commands: ["Cluster overview", "Workload board", "SLO burn rate", "Logs (Loki)"],
    why_it_matters:
      "The first place an on-call engineer looks after a page — visual confirmation of which workload, which pod, which time window.",
  },
  Falco: {
    tool: "Falco",
    category: "Security",
    module: "K8S-M5",
    module_title: "M5 · Monitoring, Troubleshooting & Capstone Prep",
    phases: ["run", "observe"],
    purpose:
      "Runtime security detector. Watches syscalls inside containers for suspicious behaviour (shells in containers, unexpected writes).",
    commands: ["falco rules list", "kubectl logs -n falco daemonset/falco"],
    why_it_matters:
      "Catches post-exploit behaviour the CI scanner missed — the last line of defence at the run stage.",
  },
};

// Default explanation for every DevOps phase. Used as a fallback when an
// incident does not override a particular phase.
export const PHASE_DEFAULTS: Record<K8sPhaseId, string> = {
  plan:
    "Ticket / change request opened in ITSM. Engineer scopes the work, links the Git issue and gets CAB approval if needed.",
  code:
    "Application and infra-as-code authored: Dockerfile, K8s manifests, Helm values, ArgoCD Application. Reviewed via pull request.",
  build:
    "CI runner executes docker build, producing an immutable OCI image with deterministic layers from the Dockerfile.",
  scan:
    "Trivy scans the image for CVEs and misconfigurations. The pipeline gates on HIGH/CRITICAL findings before push.",
  push:
    "Image is tagged and pushed to the registry (GHCR / ECR / ACR). RBAC and PAT scopes must allow write:packages.",
  deploy:
    "kubectl apply / Helm upgrade / ArgoCD sync writes the new manifest to the K8s API server, updating the desired state.",
  schedule:
    "kube-scheduler binds the new pod to a node based on requests, taints, tolerations and node affinity.",
  run:
    "kubelet asks containerd to pull the image and start the container. Probes run; restarts happen on failure.",
  observe:
    "Prometheus scrapes metrics, Loki collects logs, Grafana dashboards surface health. SLO burn-rate alerts fire on degradation.",
  recover:
    "Rollback via kubectl rollout undo / Helm rollback / ArgoCD rollback. Post-incident review feeds back into Plan.",
};
