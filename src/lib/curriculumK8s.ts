// Kubernetes & Docker (Containerization & Orchestration) — Foundation track
// Built from the supplied 16h / 5-module TOC for DevOps & Platform Engineers.
// Mirrors the SC-900 / CSA shape so all course-aware UI works unchanged.

import type { DayPlan, ModuleNote } from "./curriculum";

/* ---------- Per-module notes ---------- */
export const k8sModuleNotes: ModuleNote[] = [
  {
    moduleSlug: "k8s-containerization-fundamentals",
    domain: "concepts",
    title: "Module 1 — Containerization Fundamentals & Docker Architecture",
    code: "K8S-M1",
    theoryMinutes: 70,
    labBudgetMinutes: 110,
    topics: [
      "Evolution of deployment models — bare metal → VMs → containers",
      "Containerization principles: portability, isolation, scalability",
      "Docker architecture: Engine, daemon, images, containers, registries",
      "Container runtime (containerd, runc) and the OCI standard",
      "Container lifecycle: create → start → pause → stop → remove",
    ],
    labSlugs: [
      "k8s-docker-install-tour",
      "k8s-pull-run-inspect",
      "k8s-container-lifecycle",
    ],
  },
  {
    moduleSlug: "k8s-docker-images",
    domain: "security",
    title: "Module 2 — Building Docker Images & Containerized Apps",
    code: "K8S-M2",
    theoryMinutes: 65,
    labBudgetMinutes: 115,
    topics: [
      "Image architecture & layered union filesystem",
      "Dockerfile syntax — FROM, COPY, RUN, EXPOSE, CMD, ENTRYPOINT",
      "docker build, image tagging and semantic versioning",
      "Container registries (Docker Hub, GHCR, ACR/ECR/GCR) and push/pull flow",
      "Best practices: multi-stage builds, .dockerignore, small base images",
    ],
    labSlugs: [
      "k8s-write-dockerfile",
      "k8s-build-tag-image",
      "k8s-push-to-registry",
    ],
  },
  {
    moduleSlug: "k8s-fundamentals",
    domain: "iam",
    title: "Module 3 — Kubernetes Fundamentals & Pod Architecture",
    code: "K8S-M3",
    theoryMinutes: 70,
    labBudgetMinutes: 110,
    topics: [
      "Kubernetes architecture — control plane (API, scheduler, controller-mgr, etcd) and worker nodes (kubelet, kube-proxy)",
      "Core objects: Pods, ReplicaSets, Deployments, Services, Namespaces",
      "Pod lifecycle, readiness/liveness probes, restart policies",
      "Cluster networking model (CNI), DNS and service discovery",
      "kubectl essentials: get / describe / logs / exec / apply / delete",
    ],
    labSlugs: [
      "k8s-cluster-tour",
      "k8s-deploy-first-pod",
      "k8s-scale-replicas",
    ],
  },
  {
    moduleSlug: "k8s-deployments-services",
    domain: "entra",
    title: "Module 4 — Deployments & Service Exposure",
    code: "K8S-M4",
    theoryMinutes: 65,
    labBudgetMinutes: 115,
    topics: [
      "Deployments, ReplicaSets and rolling updates",
      "Service objects: ClusterIP, NodePort, LoadBalancer, ExternalName",
      "Internal load balancing and kube-proxy iptables/IPVS modes",
      "Service discovery via cluster DNS (svc.namespace.svc.cluster.local)",
      "External access patterns — Ingress, port-forward and LoadBalancer",
    ],
    labSlugs: [
      "k8s-author-deployment-yaml",
      "k8s-expose-service",
      "k8s-rolling-update",
    ],
  },
  {
    moduleSlug: "k8s-monitoring-troubleshooting",
    domain: "compliance",
    title: "Module 5 — Monitoring, Troubleshooting & Capstone Prep",
    code: "K8S-M5",
    theoryMinutes: 80,
    labBudgetMinutes: 160,
    topics: [
      "Cluster observability: kubectl top, metrics-server, Prometheus/Grafana",
      "Logs & events: kubectl logs, kubectl describe, kubectl get events",
      "Common failure modes: ImagePullBackOff, CrashLoopBackOff, Pending pods",
      "Debugging workflow: describe → logs → exec → events → manifest review",
      "Production readiness: resource limits, probes, restart policies, image hygiene",
    ],
    labSlugs: [
      "k8s-inspect-cluster",
      "k8s-debug-crashloop",
      "k8s-capstone-deploy",
    ],
  },
  {
    moduleSlug: null,
    domain: "exam",
    title: "Capstone — Containerized Application Deployment",
    theoryMinutes: 30,
    labBudgetMinutes: 90,
    topics: [
      "Build a Docker image for a sample application",
      "Push image to a container registry",
      "Deploy to Kubernetes with a multi-replica Deployment",
      "Expose the application via a Service endpoint",
      "Validate, monitor and document the running architecture",
    ],
    labSlugs: ["k8s-capstone-deploy"],
  },
];

const m = (slug: string) =>
  k8sModuleNotes.find((x) =>
    slug === "capstone" ? x.domain === "exam" && x.moduleSlug === null : x.moduleSlug === slug,
  )!;

/* ---------- 5-day plan (≈ 3h / day, 4h on capstone day) ----------
 * Note: full K8s & Docker content is ~21h. The 2h-cadence format
 * cannot fit a complete module per session, so this 5-day plan keeps
 * each module intact at ≈3h. For a strict 2h/day cadence, run each
 * module across two consecutive 2h sessions (Theory day + Lab day). */
export const k8sFiveDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Containerization & Docker Architecture (≈ 3h)",
    description:
      "Why containers exist, how Docker is built, and your first hands-on with the docker CLI and runtime.",
    modules: [m("k8s-containerization-fundamentals")],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Building Docker Images (≈ 3h)",
    description:
      "Author Dockerfiles, build optimised images, tag them and push to a registry.",
    modules: [m("k8s-docker-images")],
  },
  {
    id: "day3",
    label: "Day 3",
    subtitle: "Kubernetes Fundamentals & Pods (≈ 3h)",
    description:
      "Meet the control plane, deploy your first Pod, and learn the kubectl workflow.",
    modules: [m("k8s-fundamentals")],
  },
  {
    id: "day4",
    label: "Day 4",
    subtitle: "Deployments & Services (≈ 3h)",
    description:
      "Scale workloads with Deployments and expose them through ClusterIP / NodePort / LoadBalancer Services.",
    modules: [m("k8s-deployments-services")],
  },
  {
    id: "day5",
    label: "Day 5",
    subtitle: "Monitoring, Troubleshooting & Capstone (≈ 6h)",
    description:
      "Debug pods, read logs and events, then ship the capstone: a multi-replica containerized app exposed through a Service.",
    modules: [m("k8s-monitoring-troubleshooting"), m("capstone")],
  },
];

/* ---------- 2-day intensive (≈ 9h × 2 — extended days) ----------
 * Full K8s & Docker content is ~18h, so the 2-day format runs long.
 * Recommended only for week-long workshops; otherwise pick the 5-day
 * cadence. */
export const k8sTwoDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "Docker → Images → Kubernetes basics (≈ 9h — extended day)",
    description: "Containerization fundamentals, Dockerfile authoring and your first Kubernetes Pod.",
    modules: [
      m("k8s-containerization-fundamentals"),
      m("k8s-docker-images"),
      m("k8s-fundamentals"),
    ],
  },
  {
    id: "day2",
    label: "Day 2",
    subtitle: "Deployments → Troubleshoot → Capstone (≈ 9h — extended day)",
    description: "Deployments, Services, debugging and the capstone deployment.",
    modules: [
      m("k8s-deployments-services"),
      m("k8s-monitoring-troubleshooting"),
      m("capstone"),
    ],
  },
];

/* ---------- 1-day bootcamp (condensed highlights — full curriculum is ~21h) ---------- */
export const k8sOneDayPlan: DayPlan[] = [
  {
    id: "day1",
    label: "Day 1",
    subtitle: "K8s & Docker full bootcamp (≈ 18h — extended day)",
    description: "Compressed walkthrough of all five modules in a single 8-hour day. Lab time is heavily trimmed — book the 5-day cadence for full hands-on coverage.",
    modules: k8sModuleNotes,
  },
];

/* ---------- 1-hour container tool tour ---------- */
const k8sToolTourModule: ModuleNote = {
  moduleSlug: "k8s-tool-tour",
  domain: "security",
  title: "Container tool tour — 5 essentials in 60 minutes",
  code: "K8S-T1",
  theoryMinutes: 10,
  labBudgetMinutes: 50,
  topics: [
    "1. docker run — your first container",
    "2. docker build — package an app from a Dockerfile",
    "3. kubectl get / describe — read your cluster",
    "4. kubectl apply -f deployment.yaml — declarative deploys",
    "5. kubectl expose — reach the app from outside the cluster",
  ],
  labSlugs: [
    "k8s-pull-run-inspect",
    "k8s-build-tag-image",
    "k8s-cluster-tour",
    "k8s-author-deployment-yaml",
    "k8s-expose-service",
  ],
};

export const k8sOneHourPlan: DayPlan[] = [
  {
    id: "session1",
    label: "Session",
    subtitle: "Container tool tour — 5 essentials in 1h",
    description:
      "Hands-on 60-minute walkthrough of the five commands every DevOps engineer runs daily: docker run, docker build, kubectl get, kubectl apply and kubectl expose.",
    modules: [k8sToolTourModule],
  },
];
