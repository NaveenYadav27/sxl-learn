// Curated Kubernetes glossary used by <K8sTerm>.
// Each entry supports beginner + technical + analogy + Linux/Windows differences
// + SOC relevance + related commands + interview-style questions.
//
// Keep keys lowercase, no spaces. Aliases are matched case-insensitively.

export type K8sGlossaryEntry = {
  term: string;
  category: "control-plane" | "node" | "workload" | "networking" | "storage" | "security" | "cli" | "runtime";
  simple: string;        // beginner / 1-sentence
  technical: string;     // engineer / accurate
  analogy?: string;      // real-world analogy
  linux?: string;        // Linux specifics
  windows?: string;      // Windows specifics (or note if not applicable)
  soc?: string;          // SOC / security relevance
  commands?: string[];   // common commands
  failures?: string[];   // common failure modes
  aliases?: string[];    // alt names that should also match
};

export const K8S_GLOSSARY: Record<string, K8sGlossaryEntry> = {
  pod: {
    term: "Pod",
    category: "workload",
    simple: "The smallest unit you can deploy in Kubernetes — one or more containers that share a network and storage.",
    technical: "A Pod is a co-scheduled group of containers that share a Linux network namespace (so they reach each other on localhost), share volumes, and are always placed on the same node. Pods are mortal — controllers (Deployment, StatefulSet) recreate them.",
    analogy: "A Pod is like a single apartment: one or more roommates (containers) sharing the same address (IP) and kitchen (volumes).",
    linux: "Implemented with Linux namespaces (net, pid, mnt, uts, ipc) and cgroups for resource limits.",
    windows: "Windows pods use HCS (Host Compute Service) job objects and Windows Server containers. Same Pod abstraction, but each pod can only run Windows OR Linux containers — never mixed.",
    soc: "A privileged pod with `hostNetwork: true` or `hostPID: true` is a SOC red flag — it bypasses the isolation boundary. Falco rules detect new shells inside pods.",
    commands: ["kubectl get pods -A -o wide", "kubectl describe pod <name>", "kubectl logs <pod> -c <container>", "kubectl exec -it <pod> -- sh"],
    failures: ["Pending", "ImagePullBackOff", "CrashLoopBackOff", "OOMKilled (137)", "Error"],
  },
  deployment: {
    term: "Deployment",
    category: "workload",
    simple: "Tells Kubernetes 'I want N copies of this Pod, always running'. Handles rolling updates and rollbacks.",
    technical: "A Deployment manages a ReplicaSet, which in turn manages identical Pods. Rolling updates create a new ReplicaSet and gradually shift replicas from old → new with maxSurge / maxUnavailable budgets.",
    analogy: "A franchise manager: 'I always want 5 stores open. If one burns down, build another. If we rebrand, swap them out one at a time.'",
    linux: "No OS-specific behaviour — same on Linux and Windows nodes.",
    windows: "Use `nodeSelector: kubernetes.io/os: windows` to schedule a Windows Deployment onto Windows worker nodes.",
    soc: "An attacker who edits a Deployment can pin a malicious image cluster-wide. Audit `update` on apps/v1/deployments and gate via OPA / Kyverno.",
    commands: ["kubectl get deploy", "kubectl rollout status deploy/<name>", "kubectl rollout undo deploy/<name>", "kubectl scale deploy/<name> --replicas=5"],
    failures: ["ProgressDeadlineExceeded", "MinimumReplicasUnavailable", "image pull errors stop rollout"],
  },
  replicaset: {
    term: "ReplicaSet",
    category: "workload",
    simple: "Keeps a fixed number of identical Pods running. Usually created for you by a Deployment.",
    technical: "Reconciliation loop that watches its label selector and creates/deletes Pods until the count matches `spec.replicas`. Owned by the Deployment that created it.",
    analogy: "A thermostat that keeps pod count at a target.",
    soc: "If you see a ReplicaSet you did not deploy, an attacker may be using it for persistence. Audit ownerReferences.",
    commands: ["kubectl get rs", "kubectl describe rs <name>"],
  },
  service: {
    term: "Service",
    category: "networking",
    simple: "A stable name and IP for a set of Pods, so callers don't break when pods restart.",
    technical: "Cluster-internal load balancer. Selector picks Pods → EndpointSlice tracks ready IPs → kube-proxy programs iptables/IPVS rules → ClusterIP DNATs to a pod IP. Types: ClusterIP (default), NodePort, LoadBalancer, ExternalName.",
    analogy: "A reception desk number: callers dial reception, reception forwards to whichever staff member is in.",
    linux: "kube-proxy on Linux uses iptables (default) or IPVS for higher throughput.",
    windows: "kube-proxy on Windows uses HNS (Host Networking Service) policies — VFP rules instead of iptables.",
    soc: "ExternalName services can point to attacker-controlled hosts (CNAME smuggling). LoadBalancer services exposed to the internet need NetworkPolicies + WAF.",
    commands: ["kubectl get svc", "kubectl get endpointslice", "kubectl describe svc <name>"],
    failures: ["empty endpoints (selector mismatch)", "wrong targetPort", "DNS resolution failure"],
  },
  ingress: {
    term: "Ingress",
    category: "networking",
    simple: "An HTTP/HTTPS router that maps `host + path` → Service.",
    technical: "An Ingress resource is configuration; an Ingress controller (nginx, traefik, ALB, Istio Gateway) reads it and programs the L7 proxy. Handles TLS termination, host/path routing, and (with annotations) rate limiting and auth.",
    analogy: "The street address + apartment number that the postman uses to find the right Service door.",
    soc: "Path traversal bugs in ingress configs can leak `/.git` or `/admin`. Monitor ingress logs for 401/403 spikes.",
    commands: ["kubectl get ingress -A", "kubectl describe ingress <name>"],
  },
  namespace: {
    term: "Namespace",
    category: "control-plane",
    simple: "A folder inside the cluster. Used to separate teams, environments, or apps.",
    technical: "Logical partition for most namespaced resources (Pods, Services, Deployments, RBAC). Provides scoping for names, RBAC roles, NetworkPolicies, and ResourceQuotas. Nodes, PVs, ClusterRoles are cluster-scoped (no namespace).",
    soc: "A namespace boundary is NOT a strong security boundary by default — a pod with the right RBAC can read across namespaces. Use NetworkPolicies + PSA / Kyverno + RBAC together.",
    commands: ["kubectl get ns", "kubectl create ns <name>", "kubectl -n <ns> get all"],
  },
  kubelet: {
    term: "kubelet",
    category: "node",
    simple: "The Kubernetes agent that runs on every node and actually starts your containers.",
    technical: "Daemon on each node that watches the API for Pods bound to its node, drives the CRI runtime (containerd/cri-o) to pull images and run containers, runs liveness/readiness probes, and posts NodeStatus heartbeats every 10s.",
    analogy: "The foreman on each construction site, reading blueprints from HQ and telling crews what to build.",
    linux: "Runs as a systemd unit (`systemctl status kubelet`). Config at /var/lib/kubelet/config.yaml.",
    windows: "Runs as a Windows service. Check with `Get-Service kubelet` in PowerShell. Config at C:\\var\\lib\\kubelet\\config.yaml.",
    soc: "kubelet's `/exec` and `/run` endpoints on :10250 can be abused if anonymous auth is enabled — a classic privilege escalation path.",
    commands: ["systemctl status kubelet", "journalctl -u kubelet -n 100", "curl -sk https://localhost:10250/healthz", "Get-Service kubelet (Windows)"],
    failures: ["Node NotReady", "kubelet not started", "certificate expired", "swap enabled"],
  },
  "kube-apiserver": {
    term: "kube-apiserver",
    category: "control-plane",
    simple: "The front door of Kubernetes. Every command and component talks to it.",
    technical: "REST API server that does authn → authz → admission → validation → persists to etcd. Exposes watch streams that every controller and kubelet subscribes to. The only component that talks to etcd directly.",
    analogy: "The reception + security desk of a building: nothing happens without going through it.",
    soc: "Enable audit logging (`--audit-policy-file`) and forward to SIEM. Look for `exec` and `portforward` verbs from unusual service accounts.",
    commands: ["kubectl get --raw=/healthz", "kubectl get componentstatuses", "kubectl get apiservices"],
    aliases: ["apiserver", "api server", "api-server"],
  },
  "kube-scheduler": {
    term: "kube-scheduler",
    category: "control-plane",
    simple: "Decides which Node a new Pod should run on.",
    technical: "Two phases: Filter (predicates — capacity, taints/tolerations, nodeSelector, affinity, topology spread) then Score (rank surviving nodes). Binds the Pod to a Node via API call.",
    analogy: "A maître d' seating diners — checks who can seat the party, then picks the best table.",
    soc: "A misconfigured scheduler extender or a malicious priority class can force workloads onto specific nodes for sniffing.",
    commands: ["kubectl get events --field-selector reason=FailedScheduling -A", "kubectl describe pod <pod> | grep -A5 Events"],
    failures: ["Pending — Insufficient memory/cpu", "untolerated taint", "no nodes match nodeSelector"],
    aliases: ["scheduler"],
  },
  "controller-manager": {
    term: "kube-controller-manager",
    category: "control-plane",
    simple: "Runs all the background loops that keep the cluster matching the desired state.",
    technical: "Bundles many controllers (Node, Endpoint, ReplicaSet, ServiceAccount, Job, ...). Each runs a reconciliation loop: read desired state → read actual state → take an action to converge.",
    aliases: ["controller manager", "kcm"],
  },
  etcd: {
    term: "etcd",
    category: "control-plane",
    simple: "The cluster's database. Stores every Kubernetes object.",
    technical: "Distributed key-value store using Raft consensus. Every change goes through the API server → etcd. Lose etcd → lose the cluster state. Always run an odd number of members (3 or 5) and back it up.",
    analogy: "The cluster's filing cabinet — every record lives here.",
    soc: "Anyone with read access to etcd can read every Secret in plaintext (unless encryption at rest is enabled). High-value SIEM target.",
    commands: ["ETCDCTL_API=3 etcdctl endpoint health", "etcdctl snapshot save backup.db"],
    failures: ["disk full", "quorum lost", "certificate expired"],
  },
  "kube-proxy": {
    term: "kube-proxy",
    category: "networking",
    simple: "Programs each node's networking so Service IPs reach the right Pod.",
    technical: "Watches Services and EndpointSlices; on Linux nodes installs iptables (default) or IPVS rules that DNAT ClusterIP:port → pod IP:port. Maintains conntrack entries.",
    linux: "iptables mode is default; IPVS for >5k services. `iptables -t nat -L KUBE-SERVICES -n`",
    windows: "Uses HNS (Host Networking Service) and VFP policies instead of iptables.",
    soc: "kube-proxy bugs can leave stale iptables rules — confirm before assuming a Service is unreachable from the network.",
    commands: ["kubectl -n kube-system get ds kube-proxy", "iptables -t nat -L KUBE-SERVICES -n | head"],
  },
  coredns: {
    term: "CoreDNS",
    category: "networking",
    simple: "The cluster's DNS server. Turns service names into IPs.",
    technical: "Plugin-chained DNS server running as a Deployment in kube-system. The kubernetes plugin watches Services/EndpointSlices and serves A/AAAA/SRV records for `<svc>.<ns>.svc.cluster.local`.",
    soc: "DNS exfiltration through CoreDNS is real — monitor for unusually long TXT queries. Lock down the Corefile with `loop` and `errors` plugins.",
    commands: ["kubectl -n kube-system get pods -l k8s-app=kube-dns", "kubectl run -it --rm dns --image=busybox -- nslookup kubernetes.default"],
  },
  cni: {
    term: "CNI",
    category: "networking",
    simple: "The plugin that gives each Pod an IP and connects pods across nodes.",
    technical: "Container Network Interface — the contract kubelet uses to ask a plugin (Calico, Cilium, Flannel, Weave) to wire up a pod's network. The plugin allocates an IP from the pod CIDR and installs routes / VXLAN tunnels.",
    linux: "Plugins live in /opt/cni/bin; configs in /etc/cni/net.d. Calico uses BGP or IP-in-IP; Cilium uses eBPF.",
    windows: "Windows uses different CNI plugins (e.g. win-bridge, win-overlay, Calico for Windows). Hybrid clusters need overlay networking.",
    soc: "Cilium provides L3/L4/L7 NetworkPolicy enforcement and Hubble for flow visibility — gold standard for SOC visibility in K8s.",
    failures: ["pod stuck ContainerCreating — NetworkPlugin not ready", "no route between pods on different nodes"],
  },
  containerd: {
    term: "containerd",
    category: "runtime",
    simple: "The runtime that actually starts your containers on each node.",
    technical: "CRI-compatible runtime that kubelet talks to over gRPC at /run/containerd/containerd.sock. Pulls images, manages snapshots (overlayfs), and launches a runc shim per container.",
    linux: "Default runtime since Kubernetes 1.24 (dockershim removed). Inspect with `crictl ps`.",
    windows: "containerd on Windows uses HCS shims to launch Windows Server containers.",
    soc: "Falco monitors syscalls coming from containerd-shim processes. Image pull telemetry should go to your SIEM.",
    commands: ["systemctl status containerd", "crictl ps", "crictl images"],
    aliases: ["cri", "container runtime"],
  },
  runc: {
    term: "runc",
    category: "runtime",
    simple: "The low-level program that creates the Linux container.",
    technical: "OCI runtime that calls unshare/clone with the right namespace flags, sets up cgroups v2, applies seccomp/AppArmor, and execs the container process.",
    linux: "Only relevant on Linux nodes. Vulnerability CVE-2024-21626 (runc leaky fd) showed why patch hygiene matters.",
    soc: "Container breakouts almost always involve runc + a kernel bug. Track CVE feeds and pin runc versions.",
  },
  kubectl: {
    term: "kubectl",
    category: "cli",
    simple: "The command-line tool you use to talk to a Kubernetes cluster.",
    technical: "Reads kubeconfig (~/.kube/config), turns subcommands into REST calls to the API server. `-v=8` shows every HTTP request/response.",
    linux: "Single binary; install via package manager or curl from dl.k8s.io.",
    windows: "Same binary, `kubectl.exe`. Install via `choco install kubernetes-cli` or `winget install Kubernetes.kubectl`.",
    soc: "Audit-log every `exec`, `portforward`, and `attach` — these are interactive access into pods.",
    commands: ["kubectl get / describe / logs / exec / apply / delete", "kubectl explain <resource>", "kubectl config get-contexts"],
  },
  kubeadm: {
    term: "kubeadm",
    category: "cli",
    simple: "The tool that bootstraps a real Kubernetes cluster.",
    technical: "Generates certificates, writes static pod manifests for control-plane components, configures kubelet, and prints the `kubeadm join` token for workers.",
    linux: "`kubeadm init` on the control-plane node, `kubeadm join` on each worker.",
    windows: "Windows nodes join an existing Linux-controlled cluster via `kubeadm join` (Windows cannot run the control plane).",
    commands: ["kubeadm init --pod-network-cidr=10.244.0.0/16", "kubeadm token create --print-join-command", "kubeadm certs renew all"],
  },
  configmap: {
    term: "ConfigMap",
    category: "workload",
    simple: "A bag of non-secret config key/value pairs, mountable into Pods.",
    technical: "Stored in etcd; can be consumed as env vars, command-line args, or files mounted from a volume. Atomic updates when mounted as a volume (within kubelet sync period).",
    soc: "ConfigMaps should NEVER contain credentials — use Secrets. Scan repos for ConfigMaps with `password:` keys.",
    commands: ["kubectl create configmap app-cfg --from-file=./config/", "kubectl describe cm <name>"],
  },
  secret: {
    term: "Secret",
    category: "security",
    simple: "Like a ConfigMap, but for sensitive data — passwords, tokens, TLS certs.",
    technical: "Base64-encoded (NOT encrypted) by default. Enable encryption at rest with `--encryption-provider-config`. Better: use external KMS via Secrets Store CSI Driver / ESO.",
    soc: "Anyone with `get secrets` in a namespace can read every credential in it — audit RBAC carefully. ServiceAccount tokens are auto-mounted unless you opt out.",
    commands: ["kubectl get secret <name> -o jsonpath='{.data.password}' | base64 -d", "kubectl create secret generic db --from-literal=password=..."],
  },
  pv: {
    term: "PersistentVolume",
    category: "storage",
    simple: "A piece of storage in the cluster (a disk, NFS share, cloud volume).",
    technical: "Cluster-scoped resource representing a real storage backend. Bound to a PVC. Lifecycle independent of any pod.",
    aliases: ["persistentvolume"],
  },
  pvc: {
    term: "PersistentVolumeClaim",
    category: "storage",
    simple: "A request for storage. 'I need 10Gi of disk.'",
    technical: "Namespaced resource that asks for storage of a given size/StorageClass. Bound to a PV; mounted into pods via `volumes.persistentVolumeClaim.claimName`.",
    failures: ["Pending — no StorageClass / no matching PV / quota exceeded"],
    aliases: ["persistentvolumeclaim"],
  },
  taint: {
    term: "Taint",
    category: "node",
    simple: "A 'do not schedule here' mark on a Node.",
    technical: "Key=Value:Effect on a Node. Effects: NoSchedule (block new pods), PreferNoSchedule (avoid), NoExecute (evict). Pods need a matching Toleration to land on a tainted node.",
    analogy: "A 'wet paint — do not touch' sign on a room. Only people with the right pass (toleration) can enter.",
    commands: ["kubectl taint nodes <node> key=value:NoSchedule", "kubectl describe node <node> | grep -i taint"],
  },
  toleration: {
    term: "Toleration",
    category: "workload",
    simple: "A pod's permission to land on a tainted Node.",
    technical: "Pod spec field that matches a Taint's key/value/effect. Allows but does not require scheduling onto the tainted node — use with nodeSelector / affinity to actually steer.",
  },
  daemonset: {
    term: "DaemonSet",
    category: "workload",
    simple: "Runs exactly one copy of a Pod on every Node (or a selected subset).",
    technical: "Used for node agents: log shippers (fluent-bit), CNI plugins, monitoring (node-exporter), security (Falco). Adds/removes pods as nodes join/leave.",
    commands: ["kubectl get ds -A"],
  },
  statefulset: {
    term: "StatefulSet",
    category: "workload",
    simple: "Like a Deployment but for apps that need stable names and storage (databases).",
    technical: "Pods get ordered, predictable names (web-0, web-1) and stable network identities via a headless Service. Each pod gets its own PVC via `volumeClaimTemplates`.",
  },
};

// Build a lookup table including aliases (lowercased).
const LOOKUP: Record<string, K8sGlossaryEntry> = (() => {
  const m: Record<string, K8sGlossaryEntry> = {};
  for (const [key, entry] of Object.entries(K8S_GLOSSARY)) {
    m[key.toLowerCase()] = entry;
    m[entry.term.toLowerCase()] = entry;
    for (const a of entry.aliases ?? []) m[a.toLowerCase()] = entry;
  }
  return m;
})();

export function lookupK8sTerm(term: string): K8sGlossaryEntry | undefined {
  return LOOKUP[term.trim().toLowerCase()];
}
