// Kubernetes & Docker Foundation (K8S-FDN) — full module explanations.
// One ModuleExplanation per slug declared in src/lib/curriculumK8s.ts:
//   - k8s-tool-tour                       (1-hour tool tour)
//   - k8s-containerization-fundamentals   (Module 1)
//   - k8s-docker-images                   (Module 2)
//   - k8s-fundamentals                    (Module 3)
//   - k8s-deployments-services            (Module 4)
//   - k8s-monitoring-troubleshooting      (Module 5)

import type { ModuleExplanation } from "./moduleExplanations";

/* ------------------------------------------------------------------ */
/* 0. Tool tour                                                        */
/* ------------------------------------------------------------------ */
const toolTour: ModuleExplanation = {
  moduleSlug: "k8s-tool-tour",
  tagline: "Meet the five commands every container engineer runs daily — in 60 minutes.",
  overview:
    "A 60-minute hands-on tour of the five commands that make up the daily life of any DevOps or platform engineer working with containers: docker run, docker build, kubectl get, kubectl apply and kubectl expose. By the end you'll have built an image, pushed it, deployed it to Kubernetes and reached it from outside the cluster.",
  whyItMatters:
    "Most engineers fail their first container task not for lack of theory but because they don't know which command to type. Owning these five verbs is the fastest way to look competent in your first DevOps interview or on your first on-call shift.",
  what: {
    heading: "What is the container tool tour?",
    body:
      "Five 10-minute stops, each one command, each one artefact. You'll touch the Docker daemon, a public registry, the Kubernetes API and a Service endpoint — the full container delivery chain in one hour.",
    bullets: [
      "docker run — start a container from an image.",
      "docker build — package an app from a Dockerfile.",
      "kubectl get / describe — read your cluster state.",
      "kubectl apply -f deployment.yaml — declarative deploys.",
      "kubectl expose — reach the app from outside the cluster.",
    ],
  },
  why: {
    heading: "Why start with a tour?",
    body:
      "Containers and Kubernetes have hundreds of commands, but 80% of daily work uses the same handful. Learning them first gives every later concept (probes, ingress, RBAC) a place to land.",
  },
  who: {
    heading: "Who runs these commands?",
    body:
      "Backend developers building images, DevOps engineers deploying them, SREs debugging them, and platform engineers operating the clusters they run on. CKAD / CKA / K8S-FDN candidates are tested on every one of them.",
    bullets: [
      "Developer — docker build / docker run on the laptop.",
      "DevOps / CI — docker build + docker push in the pipeline.",
      "Platform / SRE — kubectl apply, kubectl rollout, kubectl logs.",
      "On-call — kubectl get pods, kubectl describe, kubectl exec.",
    ],
  },
  when: {
    heading: "When do you use this tour?",
    body:
      "Run this on day one of K8S-FDN prep, before your first DevOps interview, or as a 60-minute warm-up before tackling the deeper modules (image hygiene, deployments, troubleshooting).",
  },
  where: {
    heading: "Where do these tools live?",
    body:
      "The Docker CLI talks to a local Docker daemon (or Docker Desktop). kubectl talks to a Kubernetes API server — local (kind, minikube, k3d, Docker Desktop K8s) or managed (AKS, EKS, GKE). Both are just CLIs over HTTPS APIs.",
  },
  how: {
    heading: "How is the hour structured?",
    body:
      "Five 10-minute stops + a 10-minute wrap. Each stop has one objective (start one container, build one image, deploy one Pod, expose one Service), so you finish with five concrete artefacts you can screenshot for your portfolio.",
    bullets: [
      "0–10m — docker run nginx and inspect the container.",
      "10–20m — Write a 5-line Dockerfile and docker build it.",
      "20–30m — kubectl get nodes / pods / deployments — the cluster tour.",
      "30–40m — kubectl apply -f a Deployment manifest.",
      "40–55m — kubectl expose and curl the Service.",
      "55–60m — Wrap-up cheatsheet & next steps.",
    ],
  },
  conceptDeepDives: [
    {
      id: "container",
      name: "Container",
      oneLine: "An isolated, runnable instance of an image — a process with its own filesystem, network and PID namespaces.",
      formal:
        "A container is an OS-level virtualisation primitive that uses Linux namespaces (mnt, pid, net, uts, ipc, user) and cgroups to isolate a process group from the host while sharing the host kernel.",
      plainEnglish:
        "A container is a process pretending it has its own machine — its own files, its own network, its own process list — but really it's just a normal process on the host kernel.",
      analogy:
        "A container is to a VM what a hotel room is to a house: same building (kernel), private room (namespaces), shared utilities (CPU, RAM via cgroups).",
      howItWorks:
        "The container runtime (containerd / runc) unpacks an image's layers into a writable filesystem, creates the namespaces and cgroups, then exec()s the entrypoint inside them.",
      microsoftMapping:
        "Azure Container Instances, AKS Pods, Docker Desktop on Windows/macOS (Linux containers via a small VM).",
      whenToUse:
        "Whenever you want fast startup, dense packing and reproducible runtime — microservices, batch jobs, CI runners, dev environments.",
      whenNotToUse:
        "Don't containerise stateful databases without persistent volumes, and don't try to run a different OS kernel (Windows containers on Linux host or vice-versa).",
      commonMistake:
        "Treating a container as a VM and SSH-ing into it. Containers are ephemeral processes — rebuild the image, don't patch the running container.",
      examAngle:
        "Expect questions distinguishing containers from VMs (shared kernel vs hypervisor) and from images (running vs at rest).",
    },
    {
      id: "image",
      name: "Image",
      oneLine: "A read-only, layered blueprint that the runtime turns into a container.",
      formal:
        "An OCI image is a tarball of stacked filesystem layers plus a JSON config describing the entrypoint, env, exposed ports and metadata. It is content-addressed by SHA256 digest.",
      plainEnglish:
        "An image is the recipe; the container is the cake. Same recipe → identical cake on every machine.",
      analogy:
        "Images are like Git commits: immutable, hashed, layered on parents, pushed/pulled from a remote.",
      howItWorks:
        "docker build reads a Dockerfile, executes each instruction in a temporary container and snapshots the result as a new layer. Layers are cached and shared across images by digest.",
      microsoftMapping:
        "Azure Container Registry (ACR), Docker Hub, GHCR, ECR, GCR — all OCI-compliant.",
      whenToUse:
        "Always — every container needs an image. Build small, single-purpose images per service.",
      commonMistake:
        "Tagging everything :latest. You lose the ability to roll back and you can't tell which build is in production.",
      examAngle:
        "Know the difference between an image, a tag and a digest, and that tags are mutable but digests are not.",
    },
    {
      id: "pod",
      name: "Pod",
      oneLine: "The smallest deployable unit in Kubernetes — one or more containers sharing network and storage.",
      formal:
        "A Pod is a Kubernetes object representing a group of co-scheduled containers that share a Linux network namespace (one IP, one port space) and can share volumes.",
      plainEnglish:
        "A Pod is a wrapper Kubernetes puts around your container so it can schedule, network and restart it consistently.",
      analogy:
        "If a container is a process, a Pod is the apartment that process lives in: one address, sometimes shared with a roommate (sidecar).",
      howItWorks:
        "The scheduler picks a node; kubelet on that node calls the container runtime to start the Pod's containers; kube-proxy & CNI wire its IP into the cluster network.",
      microsoftMapping:
        "Pods run on AKS node pools (Linux or Windows). One Pod = one entry in `kubectl get pods`.",
      whenToUse:
        "You almost never create raw Pods — you create Deployments / StatefulSets / DaemonSets / Jobs that produce Pods.",
      whenNotToUse:
        "Don't put two unrelated apps in one Pod. Sidecars are for tightly-coupled helpers (log shippers, proxies), not for co-tenancy.",
      commonMistake:
        "Treating Pods as long-lived. Pods are cattle, not pets — they get rescheduled, IPs change, names change.",
      examAngle:
        "Expect questions on Pod lifecycle (Pending → Running → Succeeded/Failed) and on which controller produces which Pod kind.",
    },
    {
      id: "deployment",
      name: "Deployment",
      oneLine: "A controller that keeps N identical Pods running and supports rolling updates.",
      formal:
        "A Deployment is a Kubernetes object that owns a ReplicaSet, which owns Pods. It declares desired replicas, the Pod template and the update strategy (RollingUpdate or Recreate).",
      plainEnglish:
        "Tell Kubernetes 'I want 3 of this thing'. The Deployment makes sure 3 are always running and lets you upgrade them safely.",
      analogy:
        "A Deployment is a thermostat: you set 'desired = 3 Pods'; if one dies, the controller spins another to match the setting.",
      howItWorks:
        "On apply, the deployment-controller creates a new ReplicaSet, scales it up and the old one down according to maxSurge / maxUnavailable.",
      microsoftMapping:
        "Default workload object on AKS for stateless apps; revisions are visible via `kubectl rollout history`.",
      whenToUse:
        "Stateless services, web APIs, workers — anything where any replica can serve any request.",
      whenNotToUse:
        "Use StatefulSet for stable identities (databases), DaemonSet for one-per-node agents, Job/CronJob for batch.",
      commonMistake:
        "Editing Pods directly instead of the Deployment — your changes get reverted by the controller.",
      examAngle:
        "Know the controller chain Deployment → ReplicaSet → Pod, and the rolling-update strategy fields.",
    },
    {
      id: "service",
      name: "Service",
      oneLine: "A stable virtual IP and DNS name that load-balances to a set of Pods.",
      formal:
        "A Service is a Kubernetes object that defines a logical set of Pods (selector) and a policy by which to reach them — ClusterIP, NodePort, LoadBalancer or ExternalName.",
      plainEnglish:
        "Pods come and go; their IPs change. A Service is the front door whose address never changes.",
      analogy:
        "Like a phone switchboard number: callers always dial the same number; the switchboard routes them to whichever agent is available.",
      howItWorks:
        "kube-proxy programs iptables / IPVS rules on every node so traffic to the Service IP is DNAT'd to one of the matching Pod IPs.",
      microsoftMapping:
        "ClusterIP for in-cluster traffic; LoadBalancer auto-provisions an Azure Load Balancer on AKS; Ingress for HTTP routing.",
      whenToUse:
        "Whenever anything needs to reach your Pods reliably — other Pods, ingress controllers, or external clients.",
      commonMistake:
        "Confusing Service types: NodePort exposes on every node's IP; LoadBalancer adds a cloud LB on top; ClusterIP is internal only.",
      examAngle:
        "Expect drag-and-drop questions matching Service types to access patterns (internal, node-port, cloud-lb, DNS alias).",
    },
  ],
  comparisons: [
    {
      title: "docker vs kubectl — which CLI for which job?",
      columns: ["Task", "docker", "kubectl"],
      rows: [
        ["Build an image from a Dockerfile", "✅ docker build", "❌ not its job"],
        ["Run a container on my laptop", "✅ docker run", "Possible (kubectl run) but rare"],
        ["Deploy 3 replicas across a cluster", "❌", "✅ kubectl apply -f deploy.yaml"],
        ["Expose a workload to the LAN", "docker run -p", "kubectl expose / Service"],
        ["See logs of a running workload", "docker logs", "kubectl logs"],
      ],
      bottomLine: "docker for images and single containers; kubectl for cluster workloads.",
    },
  ],
  realExamples: [
    {
      title: "From Dockerfile to live Service in under 5 minutes",
      scenario:
        "You have a 5-line Node app. You write a 4-line Dockerfile, docker build -t web:1 ., kubectl apply -f deployment.yaml (3 replicas), then kubectl expose deploy/web --port 80 --type LoadBalancer.",
      outcome:
        "kubectl get svc shows an external IP; curl http://<ip> returns your app's response. You've used every command in the tool tour exactly once.",
    },
  ],
  keyTerms: [
    { term: "OCI", definition: "Open Container Initiative — the standard for image and runtime specs.", example: "containerd, runc and Docker all implement OCI" },
    { term: "Registry", definition: "A server that stores and distributes container images.", example: "Docker Hub, ACR, GHCR, ECR" },
    { term: "Manifest", definition: "A YAML file describing the desired state of a Kubernetes object.", example: "deployment.yaml, service.yaml" },
    { term: "Namespace (K8s)", definition: "A virtual cluster used to scope names and apply quotas.", example: "kubectl get pods -n kube-system" },
    { term: "Selector", definition: "A label query that links a Service / Deployment to its Pods.", example: "selector: { app: web }" },
  ],
  commonPitfalls: [
    "Using :latest tags — impossible to reproduce or roll back.",
    "Running kubectl run for production — always use declarative manifests.",
    "Forgetting to expose containerPort in the Pod spec when creating a Service.",
    "Editing live resources with kubectl edit instead of updating the YAML in Git.",
  ],
  faqs: [
    { q: "Do I need Docker if I'm only deploying to Kubernetes?", a: "You need a way to build images. Docker is the most common, but buildah, kaniko or BuildKit work too. The runtime in modern clusters is containerd, not Docker." },
    { q: "Is kubectl run still recommended?", a: "Only for one-off debugging Pods. Use kubectl apply with manifests for anything that should survive." },
    { q: "Why use Services instead of Pod IPs directly?", a: "Pod IPs change on every restart. Services give you a stable virtual IP and DNS name." },
  ],
  selfCheck: [
    {
      question: "Which command builds an image from a Dockerfile?",
      options: ["docker run", "docker build", "kubectl apply", "kubectl build"],
      correctIndex: 1,
      explanation: "docker build reads a Dockerfile and produces an OCI image. kubectl never builds images.",
    },
    {
      question: "You need a stable address for 3 replica Pods. What do you create?",
      options: ["Another Pod", "A Service", "A ConfigMap", "A Namespace"],
      correctIndex: 1,
      explanation: "A Service provides a stable virtual IP / DNS name and load-balances across the matching Pods.",
    },
  ],
  examTips: [
    "If a question asks how to ship code to a cluster declaratively → kubectl apply -f.",
    "If it asks for the smallest deployable unit in K8s → Pod.",
    "If it asks for stable network identity → Service (and which type).",
    "If it asks what shares a kernel with the host → containers (vs VMs).",
  ],
  furtherReading: [
    { label: "Docker — Get Started", url: "https://docs.docker.com/get-started/" },
    { label: "Kubernetes — Concepts", url: "https://kubernetes.io/docs/concepts/" },
    { label: "OCI Image Spec", url: "https://github.com/opencontainers/image-spec" },
  ],
};

/* ------------------------------------------------------------------ */
/* 1. Module 1 — Containerization Fundamentals & Docker Architecture   */
/* ------------------------------------------------------------------ */
const m1: ModuleExplanation = {
  moduleSlug: "k8s-containerization-fundamentals",
  tagline: "Why containers replaced VMs, and how Docker's engine actually starts a process in a box.",
  overview:
    "This module builds the mental model every container engineer needs: the evolution from bare-metal → VM → container, the Linux primitives (namespaces + cgroups) that make isolation possible, and the architecture of the Docker daemon, runtime and registry. By the end you can describe what happens between `docker run` and a running process on the host.",
  whyItMatters:
    "Without this foundation, every Kubernetes concept (Pods, probes, networking, security contexts) is magic. With it, you can read failure modes correctly: 'this is a runtime issue', 'this is a kernel feature gap', 'this is a registry auth problem'.",
  what: {
    heading: "What is containerization?",
    body:
      "Containerization is OS-level virtualisation: many isolated user-space instances sharing one host kernel. Docker is the most popular toolchain that builds, ships and runs OCI-compliant containers.",
    bullets: [
      "Bare metal → VMs → containers — three deployment generations.",
      "Linux primitives: namespaces (isolation) + cgroups (resource limits).",
      "OCI standard — image-spec + runtime-spec — vendor neutrality.",
      "Docker Engine = dockerd + containerd + runc + CLI.",
      "Container lifecycle: create → start → pause → stop → remove.",
    ],
  },
  why: {
    heading: "Why containers won",
    body:
      "Containers boot in milliseconds, are 10-100× denser than VMs, and ship the entire dependency tree as one immutable artefact. They removed the 'works on my machine' class of bugs and made microservices economically viable.",
  },
  who: {
    heading: "Who needs to know this?",
    body:
      "Every developer building images, every SRE running them, every security engineer reviewing them. Hiring managers expect L1 DevOps candidates to explain namespaces vs cgroups vs hypervisors fluently.",
  },
  when: {
    heading: "When do you reach for containers?",
    body:
      "Microservices, CI runners, batch jobs, dev environments, edge workloads. Anywhere you'd previously use a VM for a single app, a container is faster and cheaper.",
  },
  where: {
    heading: "Where does Docker live?",
    body:
      "The daemon (dockerd) runs on Linux hosts directly, or inside a small Linux VM on Docker Desktop for Windows/macOS. The CLI talks to it over a Unix socket or TCP.",
  },
  how: {
    heading: "How does `docker run nginx` actually work?",
    body:
      "CLI sends a REST call to dockerd → dockerd asks containerd → containerd pulls the image from the configured registry → unpacks the layers into an overlay filesystem → calls runc → runc creates namespaces + cgroups → exec()s the entrypoint inside them.",
    bullets: [
      "1. CLI → dockerd over /var/run/docker.sock.",
      "2. dockerd → containerd (gRPC).",
      "3. containerd pulls image layers from registry.",
      "4. Snapshotter assembles a writable rootfs (overlayfs).",
      "5. runc creates namespaces + cgroups and execs the process.",
    ],
  },
  conceptDeepDives: [
    {
      id: "namespaces",
      name: "Linux namespaces",
      oneLine: "Kernel feature that gives a process its own isolated view of system resources.",
      formal:
        "Namespaces partition kernel resources so that one set of processes sees one set of resources while another set sees a different set. The relevant namespaces are mnt, pid, net, uts, ipc, user and cgroup.",
      plainEnglish:
        "Namespaces are how the kernel lies to a process: 'you're PID 1, you have your own network card, your own hostname'.",
      analogy:
        "Like giving each tenant their own apartment number, mailbox and door key inside one building.",
      howItWorks:
        "When runc starts a container, it calls clone() with the relevant CLONE_NEW* flags. The new process sees only resources inside those namespaces.",
      microsoftMapping: "Same Linux primitives are used by AKS node pools and by Linux containers on Docker Desktop.",
      whenToUse: "Always — every container uses namespaces; you rarely interact with them directly.",
      commonMistake: "Confusing Linux namespaces with Kubernetes namespaces — completely different concepts.",
      examAngle: "Know the six namespaces and which kind of isolation each provides (PID = processes, NET = network, etc.).",
    },
    {
      id: "cgroups",
      name: "Control groups (cgroups)",
      oneLine: "Kernel feature that limits and accounts for a process group's resource usage.",
      formal:
        "cgroups (v1 / v2) organise processes hierarchically and apply controllers (cpu, memory, io, pids) that limit, prioritise and measure consumption.",
      plainEnglish:
        "cgroups are how the kernel says 'this container can use at most 0.5 CPU and 256 MB RAM'.",
      analogy:
        "Like the breaker box in a building: each apartment has a fuse that trips if it draws too much power.",
      howItWorks: "runc writes the requested limits into /sys/fs/cgroup files; the kernel enforces them.",
      microsoftMapping: "AKS uses cgroup v2 on recent nodes; resource requests/limits in Pod specs map directly to cgroup controllers.",
      whenToUse: "Always set Pod resource requests + limits in production — otherwise one container can starve a whole node.",
      commonMistake: "Setting limits without requests, or limits much smaller than the JVM heap, causing OOMKilled.",
      examAngle: "Know the difference between requests (scheduling) and limits (enforcement) and that limits map to cgroups.",
    },
    {
      id: "oci",
      name: "Open Container Initiative (OCI)",
      oneLine: "The vendor-neutral standard for container image and runtime formats.",
      formal:
        "OCI defines two specs: image-spec (how images are layered, addressed and described) and runtime-spec (how a runtime configures and starts a container).",
      plainEnglish: "OCI is what lets a Docker-built image run on containerd, CRI-O or Podman without modification.",
      analogy: "OCI is to containers what HTTP is to web servers — one protocol, many implementations.",
      howItWorks: "Build tools emit an OCI image; runtimes (runc, crun) consume an OCI bundle and start the process.",
      microsoftMapping: "ACR stores OCI artifacts; AKS clusters use containerd, an OCI-compliant runtime.",
      whenToUse: "Always — there is no non-OCI container ecosystem worth using in 2026.",
      commonMistake: "Assuming 'Docker image' is a separate format. Modern Docker images ARE OCI images.",
      examAngle: "Know that the runtime in modern Kubernetes clusters is containerd (CRI-compliant), not Docker.",
    },
    {
      id: "container-vs-vm",
      name: "Container vs Virtual Machine",
      oneLine: "Containers share the host kernel; VMs run their own.",
      formal:
        "A VM is a hardware-virtualised guest OS managed by a hypervisor; a container is a process group on the host kernel isolated by namespaces and cgroups.",
      plainEnglish: "VM = a whole computer pretending to be hardware. Container = a process pretending to be a computer.",
      analogy: "VMs are houses (full plumbing each); containers are apartments (shared plumbing, private rooms).",
      howItWorks: "Hypervisor (Hyper-V, KVM, ESXi) virtualises CPU/MMU/devices for VMs; the host kernel + namespaces do it for containers.",
      microsoftMapping: "Azure VMs vs ACI/AKS Pods. AKS itself is a managed control plane on top of VMs that run containers.",
      whenToUse: "Containers for app workloads; VMs when you need a different kernel, strong isolation or full OS access.",
      whenNotToUse: "Don't run a desktop OS in a container or a single short-lived web request in a full VM.",
      commonMistake: "Comparing container startup time to VM boot time without noting that VMs can run many containers themselves.",
      examAngle: "A diagram-style question: label hypervisor, guest OS, host kernel, container runtime, container.",
    },
    {
      id: "docker-engine",
      name: "Docker Engine architecture",
      oneLine: "A CLI, a daemon, a runtime supervisor (containerd) and a low-level runtime (runc).",
      formal:
        "Docker Engine is composed of: the docker CLI, the dockerd REST API daemon, containerd (image + container lifecycle supervisor), and runc (the OCI runtime that actually starts processes).",
      plainEnglish: "When you type docker run, four programs hand the request down a chain to the kernel.",
      analogy: "Like a restaurant: waiter (CLI) → manager (dockerd) → head chef (containerd) → line cook (runc) → kitchen (kernel).",
      howItWorks: "CLI → dockerd (HTTP) → containerd (gRPC) → runc (exec). containerd manages images & snapshots; runc handles namespaces & cgroups.",
      microsoftMapping: "AKS skips dockerd entirely — kubelet talks to containerd directly via the CRI.",
      whenToUse: "Use Docker on the developer laptop. In clusters, kubelet + containerd is the modern path.",
      commonMistake: "Believing 'Kubernetes deprecated Docker' means images stopped working. Only the dockershim was removed; OCI images still run.",
      examAngle: "Know which component does what and which one Kubernetes 1.24+ removed (dockershim).",
    },
  ],
  comparisons: [
    {
      title: "Container vs VM",
      columns: ["Aspect", "Container", "VM"],
      rows: [
        ["Kernel", "Shared with host", "Own guest kernel"],
        ["Boot time", "Milliseconds", "Tens of seconds"],
        ["Image size", "Tens to hundreds of MB", "GBs"],
        ["Density per host", "Hundreds", "Tens"],
        ["Isolation strength", "Process-level", "Hardware-level"],
        ["Best for", "Microservices, CI, batch", "Multi-tenant, mixed OS, kernel mods"],
      ],
      bottomLine: "Containers for apps, VMs for kernels. Often you run containers inside VMs (every cloud cluster does).",
    },
  ],
  realExamples: [
    {
      title: "Tracing `docker run alpine echo hi`",
      scenario: "A new engineer types docker run alpine echo hi and sees 'hi' print in 200 ms.",
      outcome:
        "Behind the scenes: dockerd received the REST call, containerd pulled alpine (~5 MB) from Docker Hub, snapshotter assembled an overlayfs rootfs, runc created namespaces+cgroups and execed /bin/echo. The process exited; container was reaped.",
    },
  ],
  keyTerms: [
    { term: "Hypervisor", definition: "Software that creates and runs VMs by virtualising hardware.", example: "KVM, Hyper-V, ESXi" },
    { term: "Runtime", definition: "Component that starts and supervises containers from an OCI bundle.", example: "runc, crun, containerd" },
    { term: "Image layer", definition: "An immutable filesystem diff stacked to form an image.", example: "A Dockerfile RUN instruction creates one layer" },
    { term: "Registry", definition: "Server that stores and distributes images.", example: "Docker Hub, ACR" },
    { term: "Daemon", definition: "Background service that exposes the Docker API.", example: "dockerd" },
  ],
  commonPitfalls: [
    "Confusing 'Docker' (the toolchain) with 'containers' (the kernel feature).",
    "Thinking containers provide hardware-level isolation — they don't.",
    "Running dockerd on production Kubernetes nodes (use containerd directly).",
    "Setting CPU/memory limits below what the app needs and getting throttled or OOMKilled.",
  ],
  faqs: [
    { q: "Did Kubernetes really 'drop Docker'?", a: "It dropped the dockershim. OCI images built by Docker still run perfectly on containerd-based clusters." },
    { q: "Are containers secure enough for multi-tenant workloads?", a: "By default no — they share a kernel. Add gVisor, Kata Containers or VM-per-Pod isolation for hostile multi-tenancy." },
    { q: "Why is the alpine image so small?", a: "It uses musl libc and BusyBox instead of glibc + GNU coreutils, totalling ~5 MB." },
  ],
  selfCheck: [
    {
      question: "Which kernel feature enforces a container's CPU and memory limits?",
      options: ["Namespaces", "cgroups", "SELinux", "iptables"],
      correctIndex: 1,
      explanation: "cgroups limit and account for resource usage; namespaces handle visibility/isolation.",
    },
    {
      question: "Which component actually starts the container process inside namespaces?",
      options: ["dockerd", "containerd", "runc", "kubectl"],
      correctIndex: 2,
      explanation: "runc is the OCI low-level runtime that creates namespaces+cgroups and execs the entrypoint.",
    },
  ],
  examTips: [
    "If asked which Linux feature isolates processes → namespaces.",
    "If asked which limits resources → cgroups.",
    "If asked the modern Kubernetes runtime → containerd (CRI-compliant), not Docker.",
    "If asked what OCI standardises → image format + runtime behaviour.",
  ],
  furtherReading: [
    { label: "Docker — Architecture overview", url: "https://docs.docker.com/get-started/overview/" },
    { label: "OCI specs", url: "https://opencontainers.org/" },
    { label: "Linux namespaces (man 7)", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html" },
  ],
};

/* ------------------------------------------------------------------ */
/* 2. Module 2 — Building Docker Images & Containerized Apps           */
/* ------------------------------------------------------------------ */
const m2: ModuleExplanation = {
  moduleSlug: "k8s-docker-images",
  tagline: "Author Dockerfiles that build small, reproducible, registry-ready images.",
  overview:
    "This module turns you from someone who runs other people's images into someone who ships their own. You'll learn the layered image model, the Dockerfile instruction set, multi-stage builds for tiny final images, semantic tagging and the push/pull flow with registries (Docker Hub, GHCR, ACR, ECR, GCR).",
  whyItMatters:
    "Image quality determines everything downstream — pull time, attack surface, cold-start latency, cost. A 50 MB image deploys in 2 seconds; a 2 GB image breaks rolling updates and bloats every cluster node.",
  what: {
    heading: "What is image building?",
    body:
      "Image building is the act of compiling a Dockerfile (a series of instructions) into a stack of immutable layers, then tagging the result and pushing it to a registry where any cluster can pull it.",
    bullets: [
      "Layered union filesystem — each Dockerfile instruction = one layer.",
      "Dockerfile instructions: FROM, COPY, RUN, EXPOSE, CMD, ENTRYPOINT.",
      "docker build → docker tag → docker push → docker pull.",
      "Registries: Docker Hub, GHCR, ACR, ECR, GCR.",
      "Best practices: multi-stage, .dockerignore, small base images, pinned versions.",
    ],
  },
  why: {
    heading: "Why image hygiene matters",
    body:
      "Bloated images slow every deployment, waste registry storage, increase the CVE surface and break autoscaling (cold starts dominate). Tiny, pinned, multi-stage images are the single highest-leverage thing a DevOps engineer can ship.",
  },
  who: {
    heading: "Who builds images?",
    body:
      "Developers build them locally; CI builds them on every commit; platform engineers define the base images everyone else inherits from. Security teams scan them for CVEs.",
  },
  when: {
    heading: "When do you rebuild?",
    body:
      "Every code change (in CI) and on every base-image security update. Tag with the commit SHA; promote that exact digest through dev → staging → prod.",
  },
  where: {
    heading: "Where do images live?",
    body:
      "Built locally or in CI, stored in a registry (Docker Hub for public, ACR/ECR/GCR for private cloud, GHCR for GitHub-native), pulled by the runtime on every node that schedules a Pod with that image.",
  },
  how: {
    heading: "How does a build work?",
    body:
      "BuildKit (or the legacy builder) reads the Dockerfile top-to-bottom. Each instruction runs in an intermediate container; the resulting filesystem diff is committed as a new layer. Layers are content-addressed — identical inputs produce identical hashes, enabling caching.",
    bullets: [
      "FROM pulls the base image.",
      "COPY / ADD copies build context into the image.",
      "RUN executes a shell command and snapshots the result.",
      "CMD / ENTRYPOINT set the default process.",
      "Final image = ordered list of layer digests + config JSON.",
    ],
  },
  conceptDeepDives: [
    {
      id: "dockerfile",
      name: "Dockerfile",
      oneLine: "A text file of instructions used to assemble an image deterministically.",
      formal: "A Dockerfile is a build script using a domain-specific instruction set (FROM, RUN, COPY, ARG, ENV, EXPOSE, CMD, ENTRYPOINT, HEALTHCHECK, USER, WORKDIR, VOLUME).",
      plainEnglish: "A recipe: start from this base, copy in my code, run these commands, tell the runtime which process to start.",
      analogy: "A Dockerfile is to an image what a Makefile is to a binary.",
      howItWorks: "Each instruction creates a new layer; ARG/ENV control build- and run-time variables; HEALTHCHECK lets the runtime know when the container is ready.",
      microsoftMapping: "ACR Tasks can build Dockerfiles in the cloud; GitHub Actions + docker/build-push-action is the GHCR equivalent.",
      whenToUse: "Always — even simple images benefit from a Dockerfile in source control.",
      commonMistake: "Putting RUN apt-get update and RUN apt-get install on separate lines — the cached update gets stale.",
      examAngle: "Know the difference between CMD (default args, overridable) and ENTRYPOINT (the actual binary).",
    },
    {
      id: "layers",
      name: "Image layers & union FS",
      oneLine: "Stacked filesystem diffs that combine into a single readable rootfs.",
      formal: "An image is an ordered list of read-only layers. The runtime mounts them via a union filesystem (overlayfs) plus a writable upper layer for the running container.",
      plainEnglish: "Each Dockerfile line adds a transparency over the previous ones; you see the combined picture.",
      analogy: "Like Photoshop layers — each adds something; you flatten only at runtime.",
      howItWorks: "Build commits diffs as tarballs hashed by content (SHA256). Identical layers across images are stored once and shared.",
      microsoftMapping: "ACR de-duplicates layers, so pushing a new tag of a small change only uploads the changed layer.",
      whenToUse: "Always; structure Dockerfiles so the most-changing layers (your code) come last to maximise cache hits.",
      commonMistake: "Putting COPY . . near the top of the Dockerfile — invalidates every later layer on every code change.",
      examAngle: "Expect a question on cache invalidation order.",
    },
    {
      id: "multi-stage",
      name: "Multi-stage builds",
      oneLine: "Use multiple FROM blocks to compile in a fat image but ship from a tiny final image.",
      formal: "A multi-stage Dockerfile has multiple FROM ... AS <name> stages; later stages COPY --from=<name> only the required artefacts, discarding compilers, source and intermediate dependencies.",
      plainEnglish: "Build in a workshop full of tools; ship only the finished product in a clean box.",
      analogy: "Like cooking in a busy kitchen but plating only the dish.",
      howItWorks: "Each stage produces its own image; only the final stage is tagged. The build cache still benefits earlier stages.",
      microsoftMapping: "Recommended for all .NET / Go / Node / Java images on AKS — final stage on alpine, distroless or chiseled .NET.",
      whenToUse: "Any compiled language or anything with build-time dependencies (npm install, mvn package).",
      whenNotToUse: "Pure interpreted scripts with no install step — single stage is fine.",
      commonMistake: "Forgetting --from in the final COPY, ending up with the build stage as the final image.",
      examAngle: "Know the COPY --from=<stage> syntax and that only the last stage is what gets tagged.",
    },
    {
      id: "tags-digests",
      name: "Tags vs digests",
      oneLine: "Tags are mutable human-readable pointers; digests are immutable SHA256 hashes of the image.",
      formal: "An image reference is repo[:tag][@digest]. The same tag can point to different digests over time; a digest always points to the same bytes.",
      plainEnglish: "Tags are like Git branch names; digests are like Git commit SHAs.",
      analogy: "':latest' is 'main'; '@sha256:abc…' is a specific commit.",
      howItWorks: "Push uploads layers + a manifest; the registry returns a digest. Tags are mappings the registry can rewrite.",
      microsoftMapping: "Always pin production deployments to digests in AKS to avoid drift; ACR supports content-trust signing too.",
      whenToUse: "Use semantic tags (1.4.2) for humans; use digests for production manifests.",
      commonMistake: "Pinning prod to :latest — non-reproducible, can change under you mid-rolling-update.",
      examAngle: "Know that two tags can resolve to the same digest, and that digests are immutable.",
    },
    {
      id: "registry",
      name: "Container registry",
      oneLine: "A server that stores OCI images and serves them to runtimes by digest or tag.",
      formal: "A registry implements the OCI Distribution Spec (HTTPS API for blob upload/download and manifest CRUD), with optional auth, scanning, signing and replication.",
      plainEnglish: "Like npm or PyPI, but for container images.",
      analogy: "GitHub for images.",
      howItWorks: "docker push uploads layers as content-addressed blobs and a manifest tying them together; docker pull does the reverse.",
      microsoftMapping: "Azure Container Registry (ACR) — supports geo-replication, Tasks (build in cloud), Trivy/Defender scanning, content trust.",
      whenToUse: "Always; even single-developer projects benefit from a private registry for reproducible deploys.",
      commonMistake: "Pulling from Docker Hub anonymously in CI — hits rate limits during outages.",
      examAngle: "Know the difference between public Docker Hub and private cloud registries (auth, scanning, geo-replication).",
    },
  ],
  comparisons: [
    {
      title: "Single-stage vs multi-stage build",
      columns: ["Aspect", "Single-stage", "Multi-stage"],
      rows: [
        ["Final image size", "Often 800 MB+", "Often 30-150 MB"],
        ["Includes compilers / dev deps", "Yes", "No"],
        ["Attack surface", "Large", "Minimal"],
        ["Build cache complexity", "Simple", "Slightly higher"],
        ["Recommended for production", "❌", "✅"],
      ],
      bottomLine: "Use multi-stage for any compiled or installable language; single-stage only for trivial scripts.",
    },
    {
      title: "CMD vs ENTRYPOINT",
      columns: ["Behaviour", "CMD", "ENTRYPOINT"],
      rows: [
        ["Purpose", "Default arguments", "The actual binary to run"],
        ["Overridden by docker run args", "Yes", "Only with --entrypoint"],
        ["Typical pattern", "CMD [\"--help\"]", "ENTRYPOINT [\"app\"]"],
      ],
      bottomLine: "ENTRYPOINT for the binary, CMD for its default args.",
    },
  ],
  realExamples: [
    {
      title: "Slimming a Node API from 1.1 GB to 80 MB",
      scenario: "A team ships a Node.js API with a single-stage Dockerfile from node:20 — final image is 1.1 GB.",
      outcome: "Switching to a multi-stage build (node:20 → install + build, then node:20-alpine → copy dist + node_modules) drops the image to 80 MB. Pull time on AKS falls from 18 s to 2 s, eliminating cold-start SLOs.",
    },
  ],
  keyTerms: [
    { term: "Build context", definition: "The directory sent to the daemon as the build input.", example: "docker build -t web ." },
    { term: ".dockerignore", definition: "List of paths excluded from the build context.", example: "node_modules, .git, dist" },
    { term: "BuildKit", definition: "The modern, parallel, cache-aware Docker builder.", example: "DOCKER_BUILDKIT=1 docker build ." },
    { term: "Layer cache", definition: "Reuse of unchanged layers across builds.", example: "Unchanged COPY package.json layer is reused" },
    { term: "Distroless", definition: "Minimal base images with no shell or package manager.", example: "gcr.io/distroless/static" },
  ],
  commonPitfalls: [
    "COPY . . near the top of a Dockerfile — destroys cache on every code change.",
    "RUN apt-get install without --no-install-recommends + cleanup — bloats layers.",
    "Hard-coding secrets in ENV — they end up readable in image history.",
    "Using :latest in production manifests.",
    "Skipping .dockerignore — sending node_modules and .git into every build.",
  ],
  faqs: [
    { q: "Do I need Docker Desktop to build images?", a: "No. BuildKit, buildah, kaniko and ACR Tasks all work without it. Desktop is convenient for laptops." },
    { q: "Why are alpine images sometimes problematic?", a: "Alpine uses musl libc, which can break glibc-only binaries (some Python wheels, some Java native libs). Use distroless or slim variants when in doubt." },
    { q: "Is :latest ever OK?", a: "For local dev or 'try this out' demos. Never for production deployments." },
  ],
  selfCheck: [
    {
      question: "Which Dockerfile pattern produces the smallest production image for a Go binary?",
      options: ["FROM golang:1.22 with go build", "Multi-stage: golang:1.22 → distroless/static", "Single-stage from ubuntu:22.04", "FROM alpine and apk add go"],
      correctIndex: 1,
      explanation: "Compile in golang:1.22, then COPY only the static binary into distroless/static — final image is a few MB and has no shell or libc footprint.",
    },
    {
      question: "What's the safest way to pin an image in production?",
      options: ["repo:latest", "repo:1.x", "repo@sha256:<digest>", "repo:stable"],
      correctIndex: 2,
      explanation: "Digests are immutable; tags can be moved by the publisher. Pin to digest for reproducible deploys.",
    },
  ],
  examTips: [
    "Order Dockerfile instructions least-changing → most-changing for cache wins.",
    "Use multi-stage for any compiled language.",
    "Pin to digest in production manifests.",
    "Add .dockerignore on day one of every project.",
  ],
  furtherReading: [
    { label: "Dockerfile reference", url: "https://docs.docker.com/engine/reference/builder/" },
    { label: "Best practices for writing Dockerfiles", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/" },
    { label: "Distroless images", url: "https://github.com/GoogleContainerTools/distroless" },
  ],
};

/* ------------------------------------------------------------------ */
/* 3. Module 3 — Kubernetes Fundamentals & Pod Architecture            */
/* ------------------------------------------------------------------ */
const m3: ModuleExplanation = {
  moduleSlug: "k8s-fundamentals",
  tagline: "From a single container on your laptop to a self-healing Pod on a real cluster.",
  overview:
    "This module introduces the Kubernetes architecture (control plane + worker nodes), the core API objects (Pod, ReplicaSet, Deployment, Service, Namespace) and the kubectl workflow. By the end you can describe what every component does and run get / describe / logs / exec / apply fluently.",
  whyItMatters:
    "Kubernetes is the de-facto orchestrator for containerised workloads in 2026. Understanding the control plane vs node split is what lets you debug 'why is my Pod Pending?' in minutes instead of hours.",
  what: {
    heading: "What is Kubernetes?",
    body:
      "Kubernetes (K8s) is an open-source platform for automating deployment, scaling and management of containerised applications across a cluster of machines. It exposes a declarative REST API and a controller-driven reconciliation loop that keeps actual state == desired state.",
    bullets: [
      "Control plane: API server, scheduler, controller-manager, etcd, cloud-controller-manager.",
      "Worker nodes: kubelet, kube-proxy, container runtime (containerd).",
      "Core objects: Pod, ReplicaSet, Deployment, Service, Namespace, ConfigMap, Secret.",
      "Pod lifecycle phases: Pending → Running → Succeeded/Failed; probes (liveness, readiness, startup).",
      "kubectl essentials: get, describe, logs, exec, apply, delete, port-forward.",
    ],
  },
  why: {
    heading: "Why Kubernetes won the orchestration war",
    body:
      "Declarative API, pluggable everything (CNI, CSI, CRI), strong community, and every major cloud offers a managed control plane (AKS, EKS, GKE). It's the lingua franca of modern infrastructure.",
  },
  who: {
    heading: "Who interacts with Kubernetes?",
    body:
      "Developers via kubectl + manifests; SREs via kubectl + observability; platform engineers via cluster lifecycle tooling; security via RBAC, network policies and admission controllers.",
  },
  when: {
    heading: "When do you reach for Kubernetes?",
    body:
      "When you have multiple services that need scaling, self-healing, rolling updates, service discovery and consistent deployment across environments. For a single container on a single VM, Kubernetes is overkill.",
  },
  where: {
    heading: "Where does Kubernetes run?",
    body:
      "Anywhere there's Linux: managed clouds (AKS, EKS, GKE), on-prem (OpenShift, Rancher, vanilla kubeadm), edge (k3s), or local dev (kind, minikube, Docker Desktop).",
  },
  how: {
    heading: "How does `kubectl apply` flow through the cluster?",
    body:
      "kubectl POSTs the manifest to the API server → API server validates and writes to etcd → controllers (deployment-controller, replicaset-controller) notice the change and create child objects → scheduler assigns Pods to nodes → kubelet on each node tells containerd to start containers → kube-proxy programs networking → readiness probes flip Pods to Ready.",
    bullets: [
      "1. kubectl → kube-apiserver (REST + auth + admission).",
      "2. apiserver → etcd (persist desired state).",
      "3. Controllers reconcile (Deployment → ReplicaSet → Pod).",
      "4. Scheduler binds Pods to nodes.",
      "5. kubelet pulls images and starts containers via containerd.",
      "6. kube-proxy + CNI wire networking; probes mark Pods Ready.",
    ],
  },
  conceptDeepDives: [
    {
      id: "control-plane",
      name: "Control plane",
      oneLine: "The brain of the cluster: API, state store, schedulers, controllers.",
      formal: "Components: kube-apiserver (REST front door), etcd (key-value store of cluster state), kube-scheduler (Pod → node), kube-controller-manager (built-in controllers), cloud-controller-manager (cloud LBs / disks / nodes).",
      plainEnglish: "Five processes that decide what should run where, and remember it.",
      analogy: "Like an air-traffic control tower: receives flight plans (apiserver), keeps the schedule (etcd), assigns runways (scheduler), enforces rules (controllers).",
      howItWorks: "Everything goes through the apiserver; controllers watch resources and act; etcd is the single source of truth.",
      microsoftMapping: "AKS hides and runs the control plane for you; you only manage worker node pools.",
      whenToUse: "Always — even a single-node cluster has a control plane.",
      commonMistake: "Trying to mutate cluster state by editing etcd directly. Never do this.",
      examAngle: "Memorise the five control-plane components and which one stores state (etcd).",
    },
    {
      id: "worker-node",
      name: "Worker node",
      oneLine: "A machine (VM or bare metal) that runs Pods.",
      formal: "Each node runs: kubelet (talks to apiserver, supervises Pods), kube-proxy (Service networking), and a container runtime (containerd).",
      plainEnglish: "A node is a worker that says 'tell me which Pods to run and I'll keep them running'.",
      analogy: "Like a factory floor: kubelet is the foreman, kube-proxy is the conveyor belt, containerd is the machinery.",
      howItWorks: "kubelet polls the apiserver for Pods bound to its node, asks containerd to start them, runs probes, reports status back.",
      microsoftMapping: "AKS node pools — you can have multiple pools (Linux/Windows, GPU, spot, system).",
      whenToUse: "Add nodes to scale capacity; use multiple pools to separate workloads.",
      commonMistake: "Running workloads on system pools — keep system pools for kube-system and add user pools for apps.",
      examAngle: "Know which components live on every node (kubelet, kube-proxy, runtime).",
    },
    {
      id: "pod-lifecycle",
      name: "Pod lifecycle & probes",
      oneLine: "Pods move through phases (Pending, Running, Succeeded, Failed) gated by probes.",
      formal: "Phases: Pending → ContainerCreating → Running → Succeeded/Failed/Unknown. Probes: startupProbe (slow boot), readinessProbe (accept traffic), livenessProbe (restart if dead).",
      plainEnglish: "Pods are not just 'on' or 'off' — they have a journey, and you tell K8s how to know they're truly ready.",
      analogy: "Like a new hire: pending paperwork → onboarding → ready for tickets → if unresponsive, send to medical (restart).",
      howItWorks: "kubelet runs probe commands or HTTP/TCP checks at the configured cadence; readiness gates traffic from Services; liveness triggers restart.",
      microsoftMapping: "Same on AKS; combine with Pod Disruption Budgets to keep N replicas available during voluntary disruptions.",
      whenToUse: "Always set readiness probes for any Pod that serves traffic. Liveness only when you have a clear 'process is wedged' signal.",
      commonMistake: "Setting an aggressive liveness probe on a slow-booting app — endless CrashLoopBackOff. Use startupProbe instead.",
      examAngle: "Know the three probe types and which one controls Service endpoints (readiness).",
    },
    {
      id: "namespace",
      name: "Namespace (Kubernetes)",
      oneLine: "A virtual cluster used to scope resource names and apply quotas / RBAC.",
      formal: "Namespaces partition the cluster's namespace for objects (Pods, Services, ConfigMaps, etc.) but not for cluster-scoped objects (Nodes, PersistentVolumes, ClusterRoles).",
      plainEnglish: "Like folders on a shared drive — names only need to be unique within a folder.",
      analogy: "Like email aliases: you can have 'web' in dev and 'web' in prod without collision.",
      howItWorks: "Most kubectl commands accept -n <ns>; default namespace is 'default'; system components live in kube-system.",
      microsoftMapping: "Standard practice on AKS to give each team / app its own namespace and set ResourceQuotas + LimitRanges.",
      whenToUse: "Anywhere you need logical separation: per team, per environment, per app.",
      whenNotToUse: "Don't rely on namespaces for hard security isolation — use separate clusters or VM-per-Pod runtimes for that.",
      commonMistake: "Forgetting -n and operating in the default namespace by accident in production.",
      examAngle: "Know that Linux namespaces ≠ Kubernetes namespaces.",
    },
    {
      id: "kubectl",
      name: "kubectl",
      oneLine: "The CLI that talks to the Kubernetes API.",
      formal: "kubectl reads a kubeconfig (cluster + user + context), authenticates, and sends REST calls to the apiserver. Verbs: get, describe, logs, exec, apply, delete, edit, port-forward, rollout.",
      plainEnglish: "Your remote control for any cluster.",
      analogy: "Like git for clusters — the same CLI works against any Kubernetes API.",
      howItWorks: "kubectl loads ~/.kube/config, picks the active context, and issues authenticated HTTPS calls.",
      microsoftMapping: "az aks get-credentials writes the AKS context into your kubeconfig.",
      whenToUse: "Always — even if you use Helm or Argo CD, kubectl is your debugger.",
      commonMistake: "Editing live resources with kubectl edit instead of changing the YAML in Git (configuration drift).",
      examAngle: "Know the top-five verbs (get, describe, logs, exec, apply) and what each shows.",
    },
  ],
  comparisons: [
    {
      title: "Pod vs Container vs Deployment",
      columns: ["Concept", "Scope", "You usually create"],
      rows: [
        ["Container", "One running process", "Indirectly, via a Pod"],
        ["Pod", "1+ containers sharing network/storage", "Indirectly, via a Deployment"],
        ["Deployment", "Desired N Pods + rolling-update policy", "Directly, in YAML"],
      ],
      bottomLine: "You write Deployments; K8s creates ReplicaSets; ReplicaSets create Pods; Pods run containers.",
    },
  ],
  realExamples: [
    {
      title: "Why is my Pod Pending?",
      scenario: "kubectl get pods shows web-7d… as Pending for 2 minutes.",
      outcome: "kubectl describe pod web-7d… reveals 'FailedScheduling: 0/3 nodes available: 3 Insufficient cpu'. Fix: lower CPU requests or scale the cluster. The describe + events workflow is the heart of K8s troubleshooting.",
    },
  ],
  keyTerms: [
    { term: "Manifest", definition: "YAML file describing a Kubernetes object's desired state.", example: "deployment.yaml" },
    { term: "Selector", definition: "Label query linking Services / Deployments to Pods.", example: "selector: { app: web }" },
    { term: "Annotation", definition: "Non-identifying metadata for tools.", example: "kubectl.kubernetes.io/last-applied-configuration" },
    { term: "kubeconfig", definition: "Local file holding cluster + user + context info.", example: "~/.kube/config" },
    { term: "Reconciliation loop", definition: "Controller pattern: observe → diff → act → repeat.", example: "deployment-controller maintains replicas == desired" },
  ],
  commonPitfalls: [
    "Skipping readiness probes — Services send traffic to Pods that aren't ready.",
    "Setting liveness probes too aggressively, causing restart loops.",
    "Hardcoding the default namespace — surprises in prod.",
    "Mutating live resources with kubectl edit, causing drift from Git.",
    "Using kubectl run for production workloads.",
  ],
  faqs: [
    { q: "Pod or container — what do I create?", a: "Neither directly. Create a Deployment (or StatefulSet/Job) and let it manage Pods which run containers." },
    { q: "Why is etcd so important?", a: "It's the single source of truth for the entire cluster state. Lose etcd, lose the cluster." },
    { q: "Is kubectl the only way to talk to K8s?", a: "No — every CLI/UI/SDK ultimately hits the same REST API. kubectl just happens to be the canonical client." },
  ],
  selfCheck: [
    {
      question: "Which control-plane component stores cluster state?",
      options: ["kube-scheduler", "kube-apiserver", "etcd", "kubelet"],
      correctIndex: 2,
      explanation: "etcd is the consistent key-value store; the apiserver is the only component that writes to it.",
    },
    {
      question: "Which probe controls whether a Pod receives Service traffic?",
      options: ["livenessProbe", "readinessProbe", "startupProbe", "healthProbe"],
      correctIndex: 1,
      explanation: "readinessProbe gates Service endpoints; liveness restarts the container; startup delays the others during slow boots.",
    },
  ],
  examTips: [
    "Memorise the control-plane components — apiserver, etcd, scheduler, controller-manager, cloud-controller-manager.",
    "Memorise the per-node components — kubelet, kube-proxy, container runtime.",
    "When asked which component does X, the answer is almost always one of those eight.",
    "Pod lifecycle phases: Pending, Running, Succeeded, Failed, Unknown.",
  ],
  furtherReading: [
    { label: "Kubernetes — Components", url: "https://kubernetes.io/docs/concepts/overview/components/" },
    { label: "Pod lifecycle", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" },
    { label: "kubectl cheat sheet", url: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/" },
  ],
};

/* ------------------------------------------------------------------ */
/* 4. Module 4 — Deployments & Service Exposure                        */
/* ------------------------------------------------------------------ */
const m4: ModuleExplanation = {
  moduleSlug: "k8s-deployments-services",
  tagline: "Scale workloads safely with Deployments and reach them through ClusterIP, NodePort, LoadBalancer and Ingress.",
  overview:
    "This module covers the two objects that turn 'a Pod is running' into 'a real application': Deployments (replicas + rolling updates) and Services (stable IPs + load balancing). You'll author manifests, expose workloads inside and outside the cluster, and run a zero-downtime rolling update.",
  whyItMatters:
    "Deployments and Services are the workhorses of every production cluster. If you can't write a Deployment manifest, expose it via a Service, and roll it forward and back without dropping connections, you can't ship.",
  what: {
    heading: "What are Deployments and Services?",
    body:
      "A Deployment declares desired replicas and update policy for stateless Pods. A Service gives those Pods a stable virtual IP and load-balances traffic across them. Together they make a fleet of cattle look like one durable endpoint.",
    bullets: [
      "Deployment → ReplicaSet → Pods controller chain.",
      "Rolling updates: maxSurge / maxUnavailable, rollout history, kubectl rollout undo.",
      "Service types: ClusterIP, NodePort, LoadBalancer, ExternalName.",
      "kube-proxy iptables vs IPVS modes.",
      "Cluster DNS: <svc>.<ns>.svc.cluster.local.",
      "External access patterns: Ingress, port-forward, LoadBalancer.",
    ],
  },
  why: {
    heading: "Why these two objects matter most",
    body:
      "90% of day-to-day cluster work is 'change the image tag in a Deployment' and 'expose this through a Service'. Mastering rolling updates and Service types eliminates the most common production outages (stuck rollouts, wrong Service type, DNS confusion).",
  },
  who: {
    heading: "Who owns Deployments and Services?",
    body:
      "Application teams own Deployment + Service manifests for their services. Platform teams own cluster-wide Services (Ingress controller, DNS, monitoring) and the Ingress / cloud-LB integration.",
  },
  when: {
    heading: "When to use which Service type?",
    body:
      "ClusterIP for internal-only (Pod-to-Pod). NodePort for quick external testing or on-prem with a hardware LB. LoadBalancer when the cloud should provision a public IP. ExternalName for DNS aliases to external services. Ingress for HTTP routing across many Services on one IP.",
  },
  where: {
    heading: "Where does Service routing actually happen?",
    body:
      "On every node, kube-proxy programs iptables (or IPVS) so that traffic to the Service's virtual IP is DNAT'd to one of the matching Pod IPs. Cluster DNS (CoreDNS) gives each Service a name.",
  },
  how: {
    heading: "How does a rolling update actually run?",
    body:
      "kubectl set image (or kubectl apply) updates the Deployment's Pod template. The deployment-controller creates a new ReplicaSet and scales it up by maxSurge while scaling the old one down by maxUnavailable, gated by readiness probes, until the new one is at full size and the old one is at zero.",
    bullets: [
      "1. Apply new manifest → Deployment template hash changes.",
      "2. New ReplicaSet created, scaled up gradually.",
      "3. Readiness probe must pass before old Pods are removed.",
      "4. kubectl rollout status / undo to monitor or revert.",
      "5. Old ReplicaSet kept (revisionHistoryLimit) for fast rollback.",
    ],
  },
  conceptDeepDives: [
    {
      id: "deployment-strategy",
      name: "Rolling update strategy",
      oneLine: "Replace Pods gradually, controlled by maxSurge and maxUnavailable.",
      formal: "spec.strategy.type can be RollingUpdate (default) or Recreate. RollingUpdate uses maxSurge (extra Pods above desired) and maxUnavailable (Pods that may be down) to control the rollout pace.",
      plainEnglish: "Bring up the new version one or two Pods at a time; never let too many be down at once.",
      analogy: "Like swapping seats on a moving bus, one passenger at a time.",
      howItWorks: "Default is 25% surge / 25% unavailable. Tighten for critical apps (1 surge / 0 unavailable) — slower but safer.",
      microsoftMapping: "Same on AKS; combine with PodDisruptionBudgets to also survive node drains during cluster upgrades.",
      whenToUse: "RollingUpdate for stateless services (default). Recreate for apps that can't run two versions concurrently.",
      commonMistake: "Setting maxUnavailable: 100% — equivalent to Recreate but harder to debug.",
      examAngle: "Know that readiness probes gate the rollout — a Pod with a failing readiness probe blocks progress.",
    },
    {
      id: "service-types",
      name: "Service types",
      oneLine: "ClusterIP, NodePort, LoadBalancer, ExternalName — each adds a new access surface.",
      formal: "ClusterIP gives an internal VIP; NodePort opens a port on every node; LoadBalancer asks the cloud for a public LB; ExternalName is a DNS CNAME.",
      plainEnglish: "Each type is a layer on top of the previous: internal → node-port → cloud LB.",
      analogy: "ClusterIP is the office intercom; NodePort opens a side door on every floor; LoadBalancer is the building's main entrance with a doorman.",
      howItWorks: "kube-proxy programs the routing tables; the cloud-controller-manager reconciles LoadBalancer Services with the cloud provider API.",
      microsoftMapping: "On AKS, LoadBalancer provisions an Azure Standard Load Balancer; Ingress + AGIC integrates with App Gateway.",
      whenToUse: "ClusterIP by default; LoadBalancer for one-off public TCP/UDP; Ingress for HTTP(S) with many hosts/paths.",
      commonMistake: "Creating a LoadBalancer per service when an Ingress + one LB would consolidate cost and certs.",
      examAngle: "Match Service type to scenario — internal microservice (ClusterIP), TCP game server (LoadBalancer), HTTP routing (Ingress).",
    },
    {
      id: "kube-proxy",
      name: "kube-proxy",
      oneLine: "The per-node component that turns Service IPs into real Pod traffic.",
      formal: "kube-proxy watches Services and EndpointSlices and programs the node's iptables (default) or IPVS rules so that packets to a Service IP are DNAT'd to one of the backing Pod IPs.",
      plainEnglish: "Without kube-proxy, Service IPs would just be unreachable virtual IPs.",
      analogy: "Like a router with a constantly-updated NAT table.",
      howItWorks: "iptables mode uses random/round-robin DNAT rules; IPVS mode uses kernel-level L4 LB and scales better with thousands of Services.",
      microsoftMapping: "AKS uses kube-proxy by default; some advanced configs (Cilium) replace it entirely with eBPF.",
      whenToUse: "Always present; switch to IPVS for clusters with many thousands of Services.",
      commonMistake: "Blaming Service-discovery problems on kube-proxy when it's actually CoreDNS.",
      examAngle: "Know that kube-proxy implements Service IPs and that CoreDNS implements Service DNS.",
    },
    {
      id: "cluster-dns",
      name: "Cluster DNS",
      oneLine: "CoreDNS resolves <svc>.<ns>.svc.cluster.local to a Service IP.",
      formal: "CoreDNS runs as a Deployment in kube-system; every Pod's /etc/resolv.conf points to it; the cluster DNS policy controls search domains.",
      plainEnglish: "Inside the cluster, you call services by name, not IP.",
      analogy: "Like an internal corporate phone book.",
      howItWorks: "CoreDNS watches the Services API and answers A / SRV records based on the live Service IPs.",
      microsoftMapping: "AKS uses CoreDNS; you can add custom domains via the configmap.",
      whenToUse: "Always — Pod-to-Pod calls should use Service DNS names, never raw IPs.",
      commonMistake: "Hardcoding ClusterIPs in app config — they change when the Service is recreated.",
      examAngle: "Memorise the FQDN format: <svc>.<ns>.svc.cluster.local.",
    },
    {
      id: "ingress",
      name: "Ingress",
      oneLine: "An L7 router that exposes many HTTP(S) Services through one external IP.",
      formal: "Ingress is an API object describing host/path → Service rules. An Ingress controller (NGINX, Traefik, AGIC, ALB) reads the Ingress objects and configures a real reverse proxy.",
      plainEnglish: "One door for many apps, with TLS termination and path routing.",
      analogy: "Like the receptionist at a multi-tenant office building who routes you to the right floor.",
      howItWorks: "Apply an Ingress object → controller updates its NGINX/proxy config → traffic to the LB IP is routed to the right Service based on Host/path.",
      microsoftMapping: "AGIC (Application Gateway Ingress Controller) on AKS; NGINX Ingress is the open-source default.",
      whenToUse: "Whenever you have more than one HTTP service that should share a public IP and certs.",
      whenNotToUse: "Non-HTTP traffic — use a LoadBalancer or Gateway API instead.",
      commonMistake: "Forgetting to install an Ingress controller — Ingress objects without a controller do nothing.",
      examAngle: "Know that an Ingress object is inert without a matching controller.",
    },
  ],
  comparisons: [
    {
      title: "Service types — pick by access pattern",
      columns: ["Need", "Use"],
      rows: [
        ["Pod-to-Pod inside the cluster", "ClusterIP"],
        ["Quick external test, on-prem with hardware LB", "NodePort"],
        ["Public TCP/UDP endpoint with cloud LB", "LoadBalancer"],
        ["DNS alias to an external host", "ExternalName"],
        ["Many HTTP(S) apps behind one IP + certs", "Ingress (+ ClusterIP Services)"],
      ],
      bottomLine: "Default to ClusterIP. Add LoadBalancer only when you actually need a cloud LB. Use Ingress for HTTP fan-out.",
    },
    {
      title: "Rolling update vs Recreate",
      columns: ["Aspect", "RollingUpdate", "Recreate"],
      rows: [
        ["Downtime", "Zero (if probes are correct)", "Yes — all Pods stopped, then new ones started"],
        ["Two versions concurrently", "Yes (briefly)", "No"],
        ["Use case", "Stateless web/API", "Schema-incompatible upgrades"],
      ],
      bottomLine: "RollingUpdate by default; Recreate only when concurrent versions would corrupt state.",
    },
  ],
  realExamples: [
    {
      title: "Zero-downtime rollout from v1 to v2",
      scenario: "A 6-replica Deployment runs web:v1. You change the image to web:v2 and apply.",
      outcome: "Deployment-controller creates a new ReplicaSet for v2, scales it from 0 → 6 while the old one shrinks 6 → 0, gated by readiness probes. kubectl rollout status confirms success in ~30 s. kubectl rollout undo would revert to v1 instantly.",
    },
    {
      title: "Internal vs external exposure",
      scenario: "Your auth-service should only be reachable by other Pods, but your api-gateway should be public.",
      outcome: "auth-service uses Service type ClusterIP (internal only). api-gateway uses an Ingress backed by an Ingress controller exposed through a single LoadBalancer IP, with TLS termination at the controller.",
    },
  ],
  keyTerms: [
    { term: "Endpoints / EndpointSlice", definition: "The list of Pod IPs backing a Service.", example: "kubectl get endpointslice -l kubernetes.io/service-name=web" },
    { term: "Selector", definition: "Label query that links a Service to its Pods.", example: "selector: { app: web }" },
    { term: "Headless Service", definition: "A Service with clusterIP: None that returns Pod IPs directly.", example: "Used by StatefulSets for stable Pod DNS" },
    { term: "Session affinity", definition: "Sticky routing of a client to the same Pod.", example: "sessionAffinity: ClientIP" },
    { term: "PodDisruptionBudget", definition: "Minimum healthy Pods during voluntary disruptions.", example: "minAvailable: 2" },
  ],
  commonPitfalls: [
    "Wrong Service selector → 0 endpoints → 'connection refused'.",
    "Skipping readiness probes — rollouts complete with broken Pods receiving traffic.",
    "Creating a LoadBalancer per service instead of using Ingress.",
    "Hardcoding ClusterIPs (or NodePorts) in clients instead of DNS names.",
    "Setting maxUnavailable too high and causing user-visible blips.",
  ],
  faqs: [
    { q: "Can a Pod talk to itself via the Service?", a: "Yes — kube-proxy's hairpin mode supports it; sometimes you need hairpinMode set on the kubelet." },
    { q: "What's the difference between Ingress and Gateway API?", a: "Gateway API is the modern, more expressive successor to Ingress. New projects on K8s 1.26+ should consider it." },
    { q: "Does a LoadBalancer Service still need a ClusterIP?", a: "Yes — LoadBalancer is a superset; it adds a NodePort and a cloud LB on top of the underlying ClusterIP." },
  ],
  selfCheck: [
    {
      question: "Which Service type provides only an internal cluster IP?",
      options: ["NodePort", "LoadBalancer", "ClusterIP", "Ingress"],
      correctIndex: 2,
      explanation: "ClusterIP is internal-only; NodePort opens node ports; LoadBalancer adds a cloud LB; Ingress is L7 routing.",
    },
    {
      question: "Which spec field controls how aggressively a rolling update progresses?",
      options: ["spec.replicas", "spec.strategy.rollingUpdate", "spec.selector", "spec.template"],
      correctIndex: 1,
      explanation: "maxSurge / maxUnavailable inside spec.strategy.rollingUpdate control the rollout pace.",
    },
  ],
  examTips: [
    "Map Service type to access pattern in your head: internal → ClusterIP, public TCP/UDP → LoadBalancer, HTTP fan-out → Ingress.",
    "Rolling-update knobs: maxSurge (over) + maxUnavailable (under).",
    "Readiness probes gate Services AND rollouts.",
    "Pod-to-Pod calls always use DNS names (svc.ns.svc.cluster.local), never IPs.",
  ],
  furtherReading: [
    { label: "Deployments", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" },
    { label: "Services", url: "https://kubernetes.io/docs/concepts/services-networking/service/" },
    { label: "Ingress", url: "https://kubernetes.io/docs/concepts/services-networking/ingress/" },
  ],
};

/* ------------------------------------------------------------------ */
/* 5. Module 5 — Monitoring, Troubleshooting & Capstone Prep           */
/* ------------------------------------------------------------------ */
const m5: ModuleExplanation = {
  moduleSlug: "k8s-monitoring-troubleshooting",
  tagline: "Read the cluster, recognise the failure, fix it — the daily life of an SRE on Kubernetes.",
  overview:
    "This module makes you a confident first-responder. You'll learn the core observability surface (metrics-server, kubectl top, Prometheus/Grafana), the log/event triage flow (logs → describe → events → manifest review), and the canonical failure modes (ImagePullBackOff, CrashLoopBackOff, Pending, OOMKilled). You'll finish ready for the capstone: build, push, deploy, expose and debug a real app.",
  whyItMatters:
    "Production clusters fail in a small number of recognisable ways. A junior engineer who can name the failure (CrashLoopBackOff vs ImagePullBackOff vs Pending) and run the right kubectl command in the right order will outperform someone with twice the theory but no debugging muscle memory.",
  what: {
    heading: "What does cluster observability cover?",
    body:
      "Three pillars: metrics (Prometheus, metrics-server, kubectl top), logs (kubectl logs, Loki, Azure Monitor), and events (kubectl describe, kubectl get events). Plus the production-readiness checklist: requests/limits, probes, restart policy, image hygiene.",
    bullets: [
      "kubectl top nodes / pods (needs metrics-server).",
      "Prometheus + Grafana for time-series metrics & dashboards.",
      "kubectl logs / kubectl logs --previous for crashed containers.",
      "kubectl describe & kubectl get events for the timeline.",
      "Top failures: ImagePullBackOff, CrashLoopBackOff, Pending, OOMKilled, Evicted.",
      "Production readiness: requests + limits, probes, image pinning, PDBs.",
    ],
  },
  why: {
    heading: "Why a fixed triage flow beats heroics",
    body:
      "Cluster issues are diverse but the diagnostic path is short. A drilled flow (describe → events → logs → manifest) catches 90% of incidents without paging anyone. Heroics are how juniors spend an afternoon on a typo'd image tag.",
  },
  who: {
    heading: "Who runs the triage flow?",
    body:
      "On-call SREs and platform engineers first; application owners second (they own their app's logs and probes). Security engineers join when a finding looks malicious (sudden image change, exec into container).",
  },
  when: {
    heading: "When do you reach for which tool?",
    body:
      "kubectl describe + events first (cheap, always available). kubectl logs second. Prometheus / Grafana for trends. Distributed tracing (OpenTelemetry, Jaeger) for cross-service latency. APM for in-app code paths.",
  },
  where: {
    heading: "Where do logs and metrics live?",
    body:
      "Container stdout/stderr is captured by the container runtime and surfaced via kubectl logs. metrics-server provides short-lived in-cluster metrics; Prometheus provides long-term storage; Azure Monitor / CloudWatch / Stackdriver provide managed alternatives on managed clusters.",
  },
  how: {
    heading: "How do you triage a failing Pod?",
    body:
      "1) kubectl get pods → spot the bad status. 2) kubectl describe pod <name> → read the Events section first. 3) kubectl logs <name> (or --previous if it crashed). 4) Compare against the manifest in Git. 5) Fix the manifest, re-apply, watch the rollout.",
    bullets: [
      "1. get pods → identify status.",
      "2. describe pod → events section.",
      "3. logs (--previous if needed).",
      "4. exec in for a live look (last resort).",
      "5. fix manifest → apply → rollout status.",
    ],
  },
  conceptDeepDives: [
    {
      id: "imagepullbackoff",
      name: "ImagePullBackOff",
      oneLine: "kubelet can't pull the image — wrong name, wrong tag, or no auth.",
      formal: "Pod stays in Waiting with reason ImagePullBackOff (after ErrImagePull). The kubelet retries with exponential backoff.",
      plainEnglish: "K8s says 'I can't even download your image, let alone run it'.",
      analogy: "Like trying to install an app from a Play Store URL that 404s.",
      howItWorks: "Runtime calls the registry; gets 404 / 401 / 403 / network error; kubelet schedules a backoff retry.",
      microsoftMapping: "On AKS, common causes: typo in tag, ACR not attached to AKS, missing imagePullSecret for non-attached registries.",
      whenToUse: "Diagnose with kubectl describe pod — the Events section names the exact image and error.",
      commonMistake: "Re-creating the Pod over and over instead of fixing the image reference or auth.",
      examAngle: "Know that ImagePullBackOff is a registry / auth / typo problem, not a runtime problem.",
    },
    {
      id: "crashloopbackoff",
      name: "CrashLoopBackOff",
      oneLine: "Container starts, exits non-zero, kubelet restarts it, repeat with growing backoff.",
      formal: "Pod is Running but the container's restart count climbs; status reason CrashLoopBackOff; kubelet uses exponential backoff up to 5 minutes between attempts.",
      plainEnglish: "Your image runs and crashes immediately; K8s keeps restarting it slower and slower.",
      analogy: "Like a car that starts, stalls, restarts, stalls — and the mechanic waits longer between turns of the key.",
      howItWorks: "kubelet keeps the Pod object, runs the container, observes exit, schedules next start.",
      microsoftMapping: "Inspect with kubectl logs <pod> --previous to see the dying container's last words.",
      whenToUse: "Whenever you see CrashLoopBackOff: --previous logs first, then check ENV / configmap / secret / probe config.",
      commonMistake: "Aggressive liveness probe killing a slow-booting app — use startupProbe instead.",
      examAngle: "Know the --previous flag and the most common causes (bad config, missing env, wrong command, failed liveness).",
    },
    {
      id: "pending",
      name: "Pending Pods",
      oneLine: "Scheduler can't place the Pod — usually resources or nodeSelector / taints.",
      formal: "Phase: Pending. describe shows Events like 'FailedScheduling: 0/N nodes available'. The scheduler couldn't find a node satisfying CPU/memory requests, nodeSelector, affinity rules or tolerations.",
      plainEnglish: "K8s wants to run your Pod but no node can house it.",
      analogy: "Like a hotel with the right amenities but no rooms big enough.",
      howItWorks: "scheduler iterates feasible nodes; if none, it requeues the Pod and emits an event.",
      microsoftMapping: "On AKS: enable cluster-autoscaler so missing capacity adds nodes automatically. Watch for spot evictions on spot pools.",
      whenToUse: "kubectl describe pod → read the FailedScheduling event for the exact reason (cpu, memory, taints, selectors).",
      commonMistake: "Setting unrealistic requests (e.g., 4 CPUs requested on 2-CPU nodes) — guarantees Pending forever.",
      examAngle: "Know which fields make a Pod schedulable: requests, nodeSelector, tolerations, affinity.",
    },
    {
      id: "oomkilled",
      name: "OOMKilled",
      oneLine: "Container exceeded memory limit; kernel OOM-killer terminated it.",
      formal: "Container terminates with exit code 137 and reason OOMKilled. Caused by exceeding spec.resources.limits.memory or, rarely, the node running out of memory entirely.",
      plainEnglish: "Your container asked for more RAM than it was allowed; the kernel killed it.",
      analogy: "Like a tenant who plugged in too many appliances and tripped the breaker.",
      howItWorks: "cgroup memory controller enforces the limit; on excess, kernel sends SIGKILL.",
      microsoftMapping: "Same on AKS; tune limits and use Vertical Pod Autoscaler in recommend mode to size correctly.",
      whenToUse: "Whenever a Pod's restart reason is OOMKilled — raise the limit OR profile the app for leaks.",
      commonMistake: "Setting a JVM heap larger than the container memory limit — every GC = OOMKilled.",
      examAngle: "Recognise exit code 137 + OOMKilled as the memory-limit signature.",
    },
    {
      id: "metrics-and-events",
      name: "Metrics, logs and events together",
      oneLine: "Three signals — pick the right one for the question.",
      formal: "Metrics show 'how much / how often' (Prometheus, kubectl top). Logs show 'what the app said' (kubectl logs). Events show 'what the cluster did' (kubectl describe / get events).",
      plainEnglish: "Metrics for trends, logs for stories, events for the cluster's own narration.",
      analogy: "Metrics = thermostat history; logs = diary entries; events = security-camera log.",
      howItWorks: "metrics-server scrapes kubelets; Prometheus scrapes /metrics endpoints; logs come from container stdout via the runtime; events are first-class API objects with TTL.",
      microsoftMapping: "AKS integrates with Azure Monitor for containers (Container Insights), which unifies all three.",
      whenToUse: "Always start with describe + events for incidents; Prometheus for trends; logs for code-path detail.",
      commonMistake: "Going straight to logs without reading events — events often pinpoint the real problem in one line.",
      examAngle: "Know which command surfaces which signal (top → metrics, logs → app logs, describe → events).",
    },
  ],
  comparisons: [
    {
      title: "Pod failure mode → first command",
      columns: ["Symptom", "First command", "Likely cause"],
      rows: [
        ["ImagePullBackOff", "kubectl describe pod", "Typo / missing auth / wrong registry"],
        ["CrashLoopBackOff", "kubectl logs <pod> --previous", "Bad config / missing env / failed probe"],
        ["Pending", "kubectl describe pod (Events)", "Insufficient CPU/memory / taints / nodeSelector"],
        ["OOMKilled (137)", "kubectl describe pod + tune limits", "Memory limit too low / leak"],
        ["Evicted", "kubectl describe pod + check node pressure", "Node disk/memory pressure"],
      ],
      bottomLine: "Status name → command → cause. Memorise this row for every on-call shift.",
    },
  ],
  realExamples: [
    {
      title: "The 'broken deploy' interview question",
      scenario: "Interviewer: 'A user says the app is down. kubectl get pods shows 1 of 3 replicas in CrashLoopBackOff. What do you do?'",
      outcome: "1) kubectl describe pod <name> — read events. 2) kubectl logs <name> --previous — see exit reason (e.g., 'env DB_URL missing'). 3) kubectl get cm/secret in the namespace — confirm the missing key. 4) Fix manifest, re-apply, kubectl rollout status. 5) Postmortem note: missing readiness probe would have caught this earlier.",
    },
    {
      title: "Production-ready Pod checklist",
      scenario: "Reviewing a new team's first deployment manifest before merge.",
      outcome: "Required: resources.requests + resources.limits, readinessProbe, livenessProbe (or justified absence), pinned image (digest or semver, never :latest), no privileged containers, a PodDisruptionBudget if replicas > 1, labels for ownership.",
    },
  ],
  keyTerms: [
    { term: "metrics-server", definition: "Lightweight in-cluster source of CPU/memory metrics for kubectl top and HPA.", example: "kubectl top pod" },
    { term: "Prometheus", definition: "Time-series DB that scrapes /metrics endpoints.", example: "Used with Grafana for dashboards" },
    { term: "Loki", definition: "Log aggregation system designed to pair with Prometheus & Grafana.", example: "Promtail → Loki → Grafana" },
    { term: "OpenTelemetry", definition: "Vendor-neutral standard for traces, metrics and logs.", example: "OTel collector → Tempo / Jaeger" },
    { term: "Container Insights", definition: "Azure Monitor's K8s observability solution for AKS.", example: "Pre-built dashboards + log analytics" },
    { term: "Exit code 137", definition: "128 + SIGKILL — usually OOM-killed.", example: "Tune memory limit or fix leak" },
  ],
  commonPitfalls: [
    "Going to logs before describe — missing the event that explains everything.",
    "Forgetting kubectl logs --previous when a container is in CrashLoopBackOff.",
    "Using kubectl exec to 'fix' a Pod instead of fixing the manifest.",
    "Setting limits without requests (or vice versa).",
    "No readiness probes → traffic to broken Pods.",
    "Untagged or :latest images in production — non-debuggable.",
  ],
  faqs: [
    { q: "Why does my Pod restart count climb but it shows Running?", a: "The current container instance is running, but the container has restarted N times. Check kubectl describe and kubectl logs --previous for crashes." },
    { q: "Should every container have a liveness probe?", a: "Only if you have a clear 'process is wedged' signal. Otherwise readiness alone is safer — bad liveness probes cause more outages than they prevent." },
    { q: "Why is kubectl top empty?", a: "metrics-server isn't installed or running. kubectl get deploy -n kube-system metrics-server to confirm." },
  ],
  selfCheck: [
    {
      question: "A Pod shows CrashLoopBackOff. Which command shows the dying container's last log?",
      options: ["kubectl logs <pod>", "kubectl logs <pod> --previous", "kubectl describe pod <pod>", "kubectl get events"],
      correctIndex: 1,
      explanation: "--previous reads the logs of the previous (terminated) container instance, which is what crashed.",
    },
    {
      question: "Exit code 137 with reason OOMKilled means…",
      options: ["The image was missing", "The container exceeded its memory limit", "The probe failed", "The node was drained"],
      correctIndex: 1,
      explanation: "137 = 128 + SIGKILL; combined with reason OOMKilled it's the memory cgroup terminating the container.",
    },
    {
      question: "kubectl top pod returns 'metrics not available'. What's missing?",
      options: ["Prometheus", "metrics-server", "Loki", "Grafana"],
      correctIndex: 1,
      explanation: "kubectl top reads from the metrics.k8s.io API served by metrics-server; without it the command has no data source.",
    },
  ],
  examTips: [
    "Triage flow: get → describe (events) → logs → manifest. In that order.",
    "Match symptom to first command (see comparison table).",
    "OOMKilled = exit code 137. Memorise it.",
    "metrics-server powers kubectl top + HPA; Prometheus is for long-term metrics.",
  ],
  furtherReading: [
    { label: "Debug Pods", url: "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/" },
    { label: "Resource management for Pods", url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" },
    { label: "Kubernetes events", url: "https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/" },
  ],
};

/* ------------------------------------------------------------------ */
/* Registry + lookup                                                   */
/* ------------------------------------------------------------------ */
const k8sExplanations: Record<string, ModuleExplanation> = {
  [toolTour.moduleSlug]: toolTour,
  [m1.moduleSlug]: m1,
  [m2.moduleSlug]: m2,
  [m3.moduleSlug]: m3,
  [m4.moduleSlug]: m4,
  [m5.moduleSlug]: m5,
};

export function getK8sModuleExplanation(slug: string): ModuleExplanation | undefined {
  return k8sExplanations[slug];
}
