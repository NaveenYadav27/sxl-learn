// Hover-glossary dictionary for Module 1 & 2 (Docker / Containerization).
// Used by <HoverTerm> to show a quick tooltip + an expanded panel.

export type HoverTerm = {
  term: string;
  quick: string;
  definition?: string;
  bullets?: { label: string; items: string[] }[];
  production?: string;
  security?: string;
  commonIssue?: string;
};

export const DOCKER_HOVER_TERMS: Record<string, HoverTerm> = {
  namespace: {
    term: "Namespace",
    quick: "Linux kernel isolation mechanism.",
    definition: "Provides isolated views of system resources to a process group.",
    bullets: [
      { label: "Isolates", items: ["process IDs", "networking", "hostname", "filesystem mounts", "user IDs", "IPC"] },
    ],
    production: "Allows multiple applications to run on the same host safely.",
    security: "Prevents one workload from observing another's processes or network.",
    commonIssue: "Improper isolation — sharing the host PID or network namespace breaks containment.",
  },
  cgroup: {
    term: "cgroup",
    quick: "Linux resource management mechanism.",
    definition: "Limits and accounts for the resource usage of a process group.",
    bullets: [{ label: "Controls", items: ["CPU", "Memory", "Disk I/O", "PID limits"] }],
    production: "Prevents one application from consuming all host resources.",
    commonIssue: "OOMKilled containers — memory limit set below the actual working set.",
  },
  containerd: {
    term: "containerd",
    quick: "Container lifecycle runtime.",
    definition: "High-level runtime that supervises images and containers.",
    bullets: [{ label: "Responsible for", items: ["pulling images", "creating containers", "snapshot management", "runtime supervision"] }],
    production: "Used directly by Kubernetes (kubelet → CRI → containerd → runc).",
  },
  runc: {
    term: "runc",
    quick: "OCI low-level container runtime.",
    definition: "Creates Linux namespaces and cgroups, then exec()s the container process.",
    production: "The component that actually 'starts' a container on the kernel.",
  },
  overlayfs: {
    term: "overlayfs",
    quick: "Layered union filesystem.",
    definition: "Stacks read-only image layers under a writable container layer.",
    bullets: [{ label: "Benefits", items: ["faster startup", "smaller images", "efficient storage", "shared base layers"] }],
  },
  "docker-engine": {
    term: "Docker Engine",
    quick: "The full Docker product: CLI + dockerd + containerd + runc.",
    definition: "End-to-end toolchain that builds, ships and runs OCI containers.",
  },
  dockerd: {
    term: "dockerd",
    quick: "The Docker daemon — REST API over /var/run/docker.sock.",
  },
  oci: {
    term: "OCI",
    quick: "Open Container Initiative — the vendor-neutral image + runtime standard.",
    definition: "Defines image-spec (how images are layered) and runtime-spec (how runtimes start them).",
  },
  capabilities: {
    term: "Capabilities",
    quick: "Fine-grained slices of root privileges.",
    definition: "Linux capabilities split root into ~40 distinct privileges (NET_ADMIN, SYS_ADMIN, …) so a container can drop what it doesn't need.",
    security: "Run as non-root and drop ALL capabilities by default.",
  },
  seccomp: {
    term: "seccomp",
    quick: "Syscall filter — restricts which kernel calls a container may make.",
    security: "Default Docker profile blocks ~50 dangerous syscalls.",
  },

  // ---- Module 2 ----
  FROM: {
    term: "FROM",
    quick: "Base image for this build.",
    definition: "First instruction in a Dockerfile — every subsequent layer stacks on top.",
    commonIssue: "Using :latest pins nothing; rebuilds drift over time.",
  },
  COPY: {
    term: "COPY",
    quick: "Copy files from build context into the image.",
    commonIssue: "COPY . . before .dockerignore is set — leaks .git and node_modules.",
  },
  RUN: {
    term: "RUN",
    quick: "Execute a shell command at build time and snapshot the result.",
    commonIssue: "Multiple RUN apt-get lines = stale cache + bloated layers. Combine with && and clean apt lists.",
  },
  CMD: {
    term: "CMD",
    quick: "Default command/args — overridable from `docker run`.",
  },
  ENTRYPOINT: {
    term: "ENTRYPOINT",
    quick: "The actual binary the container always runs.",
    definition: "ENTRYPOINT = the executable; CMD = its default arguments.",
  },
  EXPOSE: {
    term: "EXPOSE",
    quick: "Documents the port the app listens on (does NOT publish it).",
  },
  WORKDIR: {
    term: "WORKDIR",
    quick: "Sets the working directory for subsequent instructions.",
  },
  "docker-hub": {
    term: "Docker Hub",
    quick: "Default public registry for OCI images.",
  },
  registry: {
    term: "Registry",
    quick: "Server that stores and distributes container images.",
    bullets: [{ label: "Common registries", items: ["Docker Hub", "GHCR (GitHub)", "ACR (Azure)", "ECR (AWS)", "GCR (Google)"] }],
  },
  layer: {
    term: "Layer",
    quick: "An immutable filesystem diff — one Dockerfile instruction = one layer.",
    bullets: [{ label: "Why it matters", items: ["cached → fast rebuilds", "shared across images", "content-addressed by sha256"] }],
  },
  "multi-stage": {
    term: "Multi-stage Build",
    quick: "Multiple FROM stages — final image only ships the runtime artefacts.",
    production: "The single highest-leverage way to shrink images: build with full toolchain, ship with distroless/alpine.",
  },
  image: {
    term: "Image",
    quick: "Read-only layered blueprint a runtime turns into a container.",
  },
  container: {
    term: "Container",
    quick: "A running process with its own namespaces, cgroups and rootfs.",
  },
  "bridge-network": {
    term: "Bridge network",
    quick: "Default Docker network — a virtual L2 switch on the host.",
    definition: "Each container gets a veth pair; outbound traffic is NAT'd via iptables.",
  },
};

export function findHoverTerm(key: string): HoverTerm | undefined {
  if (!key) return undefined;
  return DOCKER_HOVER_TERMS[key] ?? DOCKER_HOVER_TERMS[key.toLowerCase()];
}
