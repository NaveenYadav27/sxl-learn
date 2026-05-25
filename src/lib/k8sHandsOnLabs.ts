/**
 * Kubernetes Hands-On Labs — enterprise lab catalog for Module 3.
 * Single source of truth for the in-app lab pages, the Module 3 lab section,
 * and the downloadable PDF / Markdown workbook generated under
 * /public/resources/labs/.
 */

export type LabLevel = "Beginner" | "Engineer" | "Enterprise";
export type LabCategory =
  | "Beginner"
  | "Runtime"
  | "Core"
  | "Networking"
  | "Troubleshooting"
  | "Investigation"
  | "Enterprise"
  | "Windows";

export interface LabStep {
  title: string;
  command: string;
  explanation: string;
  expectedOutput: string;
  internals: string;
}

export interface LabQuestion {
  q: string;
  a: string;
}

export interface HandsOnLab {
  id: string;                // e.g. "K8S-LAB-01"
  slug: string;              // URL slug
  number: number;            // 1..12
  title: string;
  category: LabCategory;
  level: LabLevel;
  durationMin: number;
  focus: string[];
  objective: string;
  conceptsCovered: string[];
  prerequisites: string[];
  architecture: { ascii: string; narrative: string };
  steps: LabStep[];
  commonErrors: { error: string; cause: string; fix: string }[];
  troubleshooting: string[];
  enterpriseRelevance: string;
  validation: string[];
  relatedIncidents: string[];      // ops incident IDs
  relatedGuideSections: string[];  // chapter titles in K8s resource pack
  questions: {
    beginner: LabQuestion[];
    intermediate: LabQuestion[];
    advanced: LabQuestion[];
    scenario: LabQuestion[];
    viva: LabQuestion[];
  };
}

/* ----------------------------- LAB CATALOG ----------------------------- */

export const K8S_HANDS_ON_LABS: HandsOnLab[] = [
  /* ============ LAB 1 — Install Kubernetes on Ubuntu ============ */
  {
    id: "K8S-LAB-01",
    slug: "install-kubernetes-ubuntu-kubeadm",
    number: 1,
    title: "Install Kubernetes on Ubuntu with kubeadm",
    category: "Beginner",
    level: "Beginner",
    durationMin: 90,
    focus: ["kubeadm", "kubelet", "kubectl", "containerd", "Flannel", "control plane", "worker node"],
    objective:
      "Stand up a single-node Kubernetes cluster on Ubuntu using kubeadm, containerd and Flannel, then deploy a Pod that proves the cluster works end-to-end.",
    conceptsCovered: [
      "Why swap must be disabled for the kubelet",
      "Kernel modules and sysctl required by CNI",
      "Container runtime (containerd) vs Docker Engine",
      "What kubeadm, kubelet and kubectl each actually do",
      "PodCIDR and overlay networking (Flannel)",
    ],
    prerequisites: [
      "Ubuntu 22.04 LTS with sudo",
      "2 vCPU, 2 GB RAM, 20 GB disk minimum",
      "Outbound internet to registry.k8s.io and ghcr.io",
    ],
    architecture: {
      ascii: `+--------------------------- Control Plane ---------------------------+
|  kube-apiserver  <->  etcd  <->  controller-mgr  <->  scheduler     |
+----------------------------|----------------------------------------+
                             v
                          kubelet  <- talks to ->  containerd -> runc
                             |                          |
                             +--- CNI (Flannel) ---> Pod network 10.244.0.0/16`,
      narrative:
        "kubeadm bootstraps the static pods of the control plane on the host. The kubelet on every node speaks to containerd (the CRI), which uses runc to start Linux containers. Flannel runs as a DaemonSet and programs an overlay so every Pod gets a routable IP from 10.244.0.0/16.",
    },
    steps: [
      {
        title: "Update Ubuntu and disable swap",
        command: "sudo apt-get update && sudo apt-get -y upgrade\nsudo swapoff -a\nsudo sed -i '/ swap / s/^/#/' /etc/fstab",
        explanation: "Kubelet refuses to start when swap is on because the scheduler's memory accounting becomes incorrect once pages can be paged out.",
        expectedOutput: "swap entries commented in /etc/fstab; `free -h` shows Swap: 0B",
        internals: "Cgroups v1/v2 memory limits assume RSS == working set. With swap enabled, OOMKill decisions become non-deterministic.",
      },
      {
        title: "Load kernel modules and sysctl for CNI",
        command:
`cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay && sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sudo sysctl --system`,
        explanation: "br_netfilter lets iptables see bridged traffic so Service/Pod NAT rules apply. ip_forward enables Linux to route between Pod networks.",
        expectedOutput: "`lsmod | grep br_netfilter` shows the module loaded.",
        internals: "kube-proxy programs iptables/IPVS rules on the host. Without bridge-nf-call-iptables those rules are skipped for bridged pod traffic and Services break silently.",
      },
      {
        title: "Install containerd and configure systemd cgroup driver",
        command:
`sudo apt-get -y install containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd && sudo systemctl enable containerd`,
        explanation: "Kubelet and containerd MUST agree on the cgroup driver. Kubernetes ≥1.22 defaults to systemd; mismatches cause subtle pod restarts.",
        expectedOutput: "`sudo systemctl status containerd` → active (running).",
        internals: "containerd exposes the CRI socket at /run/containerd/containerd.sock. kubelet calls CRI RPCs (RunPodSandbox, CreateContainer) which containerd implements via runc.",
      },
      {
        title: "Install kubeadm, kubelet and kubectl",
        command:
`sudo apt-get install -y apt-transport-https ca-certificates curl gpg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | \\
  sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | \\
  sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl`,
        explanation: "kubeadm bootstraps the cluster, kubelet is the node agent, kubectl is the CLI. Pinning prevents an `apt upgrade` from breaking the control plane.",
        expectedOutput: "`kubeadm version` and `kubectl version --client` print v1.30.x.",
        internals: "kubelet runs as a systemd unit (/etc/systemd/system/kubelet.service). It will crash-loop until kubeadm writes /var/lib/kubelet/config.yaml during init.",
      },
      {
        title: "Initialize the control plane",
        command: "sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --cri-socket=unix:///run/containerd/containerd.sock",
        explanation: "kubeadm creates the CA, writes static pod manifests for api-server/etcd/controller-mgr/scheduler, and uploads cluster config.",
        expectedOutput: "Ends with `Your Kubernetes control-plane has initialized successfully!` and a `kubeadm join` command. SAVE IT.",
        internals: "Static pods come from /etc/kubernetes/manifests/. Kubelet watches that directory and starts the pods directly — they're not scheduled.",
      },
      {
        title: "Configure kubectl access",
        command:
`mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes`,
        explanation: "admin.conf holds the client cert for the cluster-admin user. Copy it to ~/.kube/config so kubectl can authenticate.",
        expectedOutput: "Node shows `NotReady` — expected until a CNI is installed.",
        internals: "kubectl reads context, cluster and user blocks from ~/.kube/config and signs each request with the client cert listed in `users[].user.client-certificate-data`.",
      },
      {
        title: "Install Flannel CNI",
        command: "kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml",
        explanation: "Flannel programs an overlay (VXLAN) that allocates a /24 of the PodCIDR to every node and routes Pod-to-Pod traffic across nodes.",
        expectedOutput: "`kubectl -n kube-flannel get pods` shows kube-flannel-ds Running on the node.",
        internals: "Flannel writes /run/flannel/subnet.env and a CNI conflist under /etc/cni/net.d. Without that conflist, kubelet's PLEG can't set Pods to Ready.",
      },
      {
        title: "Verify node and CoreDNS",
        command: "kubectl get nodes\nkubectl -n kube-system get pods",
        explanation: "Node should turn Ready within ~60s. CoreDNS pods leave ContainerCreating once the CNI is healthy.",
        expectedOutput: "Node STATUS=Ready, coredns-* pods Running 1/1.",
        internals: "CoreDNS stays in ContainerCreating until kubelet can attach it to the Pod network. That requires a working CNI binary AND a populated /etc/cni/net.d/.",
      },
      {
        title: "Allow workloads on the control plane (single-node lab)",
        command: "kubectl taint nodes --all node-role.kubernetes.io/control-plane-",
        explanation: "By default the control plane is tainted NoSchedule. For a single-node lab we untaint it.",
        expectedOutput: "`taint \"node-role.kubernetes.io/control-plane\" removed`",
        internals: "Taints repel pods unless they carry a matching toleration. Removing the taint lets the scheduler place workload pods on this node.",
      },
      {
        title: "Deploy a first Pod and prove it works",
        command:
`kubectl run web --image=nginx --port=80
kubectl get pod web -o wide
kubectl exec web -- curl -s localhost | head -5`,
        explanation: "Runs an nginx Pod, shows its assigned PodIP, then proves the container actually serves traffic.",
        expectedOutput: "Pod Running 1/1, IP from 10.244.0.0/16, curl returns `<!DOCTYPE html>`.",
        internals: "kubelet pulled the image via containerd → CRI ImagePull, created a sandbox (pause container) for the network namespace, then the nginx container joined it.",
      },
    ],
    commonErrors: [
      { error: "Node stuck NotReady", cause: "CNI not installed or /etc/cni/net.d empty", fix: "Apply Flannel/Calico, then `journalctl -u kubelet | tail`" },
      { error: "CoreDNS ContainerCreating", cause: "CNI not ready yet", fix: "Wait for kube-flannel-ds Running, then `kubectl -n kube-system rollout restart deploy coredns`" },
      { error: "Flannel CrashLoopBackOff", cause: "PodCIDR mismatch with `--pod-network-cidr`", fix: "Re-init cluster with the correct CIDR, or patch flannel ConfigMap" },
      { error: "x509 certificate signed by unknown authority", cause: "Stale ~/.kube/config from a previous cluster", fix: "Re-copy /etc/kubernetes/admin.conf and `chown` it" },
      { error: "Pending Pods on a fresh control plane", cause: "Control-plane taint still present", fix: "Untaint or add `tolerations` to the Pod spec" },
    ],
    troubleshooting: [
      "Investigate the kubelet first: `sudo journalctl -u kubelet -f`",
      "Inspect runtime: `sudo crictl ps`, `sudo crictl logs <id>`",
      "Look at CNI: `ls /etc/cni/net.d/`, `cat /run/flannel/subnet.env`",
      "Validate API health: `kubectl get --raw=/readyz?verbose`",
    ],
    enterpriseRelevance:
      "kubeadm is still the reference bootstrap path for on-prem and air-gapped enterprise clusters. Understanding the swap/cgroup/CNI triad makes you the engineer who recovers a stuck cluster at 2am instead of the one who pages someone else.",
    validation: [
      "`kubectl get nodes` shows Ready",
      "`kubectl get pods -A` shows no CrashLoopBackOff",
      "An nginx Pod gets a 10.244.x.x IP and responds to curl",
    ],
    relatedIncidents: ["K8S-INC-3002"],
    relatedGuideSections: ["Control plane & worker components", "Pod lifecycle & probes"],
    questions: {
      beginner: [
        { q: "Why must swap be disabled before kubelet starts?", a: "Kubelet's memory accounting assumes pages are never paged out; swap makes OOMKill decisions non-deterministic." },
        { q: "What is the difference between kubeadm and kubelet?", a: "kubeadm is a one-shot bootstrapper that creates the cluster. kubelet is the long-running node agent that talks to the API server and the runtime." },
      ],
      intermediate: [
        { q: "Why does `--pod-network-cidr=10.244.0.0/16` matter for Flannel?", a: "Flannel's default config expects that exact CIDR. A mismatch causes Flannel CrashLoopBackOff and Pods that never get an IP." },
      ],
      advanced: [
        { q: "Where do control-plane components actually run after `kubeadm init`?", a: "As static pods, manifests in /etc/kubernetes/manifests/, started directly by kubelet without going through the scheduler." },
      ],
      scenario: [
        { q: "After `kubeadm init` your node is Ready but CoreDNS is stuck ContainerCreating. Where do you look?", a: "/etc/cni/net.d for an empty directory, then the CNI pod's logs. CoreDNS can't get a Pod IP without a working CNI." },
      ],
      viva: [
        { q: "Walk me from `kubectl run web --image=nginx` to a running container.", a: "kubectl → API server → etcd → scheduler binds Pod → kubelet on node → CRI RunPodSandbox → CNI assigns IP → CRI CreateContainer → containerd → runc → Linux namespaces/cgroups." },
      ],
    },
  },

  /* ============ LAB 2 — Troubleshooting Fundamentals ============ */
  {
    id: "K8S-LAB-02",
    slug: "troubleshooting-fundamentals-sre",
    number: 2,
    title: "Troubleshooting Kubernetes Like an SRE",
    category: "Troubleshooting",
    level: "Engineer",
    durationMin: 75,
    focus: ["kubectl get", "describe", "logs", "events", "journalctl", "investigation methodology"],
    objective:
      "Master the canonical SRE investigation workflow: get → describe → logs → events → runtime — and apply it to six recurring failure modes.",
    conceptsCovered: [
      "Why describe almost always beats logs as a first step",
      "How Events are TTL'd and where they live",
      "Difference between application logs (stdout) and kubelet logs (journald)",
      "Cluster-wide vs namespaced views",
    ],
    prerequisites: ["A working cluster from Lab 1", "kubectl context set to that cluster"],
    architecture: {
      ascii: `kubectl get   ->  what state is the object in?
     |
     v
kubectl describe -> events + conditions + last-state
     |
     v
kubectl logs (-p) -> what did the container say (or its previous incarnation)?
     |
     v
kubectl get events -> what did the cluster say around the same time?
     |
     v
journalctl -u kubelet / crictl ps -> node-level reality check`,
      narrative:
        "Each step narrows the search space. Don't skip describe — it folds events, status conditions and last-termination state into one screen.",
    },
    steps: [
      {
        title: "Create a deliberately broken Pod",
        command:
`kubectl run badimg --image=nginx:doesnotexist
kubectl get pod badimg`,
        explanation: "Reproduces an ImagePullBackOff in a controlled way so you can practice the workflow.",
        expectedOutput: "STATUS=ImagePullBackOff or ErrImagePull within ~30s.",
        internals: "kubelet asks containerd to pull the image. containerd retries with exponential backoff and reports failure back through the CRI status.",
      },
      {
        title: "Step 1 — describe",
        command: "kubectl describe pod badimg | tail -20",
        explanation: "The Events section at the bottom shows the registry error verbatim.",
        expectedOutput: "`Failed to pull image \"nginx:doesnotexist\": ... manifest unknown`",
        internals: "Events are stored as Event objects in the same namespace with a default TTL of 1h.",
      },
      {
        title: "Step 2 — fix and verify",
        command:
`kubectl set image pod/badimg badimg=nginx:1.27
kubectl get pod badimg -w`,
        explanation: "Pods are largely immutable, but image is one of the few fields you can patch in place.",
        expectedOutput: "Status goes ContainerCreating → Running.",
        internals: "kubelet sees the spec diff, re-asks containerd to pull, restarts the container.",
      },
      {
        title: "Reproduce CrashLoopBackOff",
        command: "kubectl run crasher --image=busybox --restart=Never -- /bin/sh -c 'exit 1'",
        explanation: "Forces a guaranteed crash so you can inspect previous-container logs.",
        expectedOutput: "RESTARTS climbs, STATUS becomes CrashLoopBackOff.",
        internals: "kubelet applies an exponential backoff (10s, 20s, 40s …) up to 5 minutes between restart attempts.",
      },
      {
        title: "Step 3 — logs of the previous container",
        command: "kubectl logs crasher -p",
        explanation: "Without -p you'll get the current (not-yet-restarted) container; with -p you get the one that just died.",
        expectedOutput: "(empty in this trivial case — but in real apps you'd see the stack trace)",
        internals: "Logs are pulled from /var/log/containers/* via the CRI log endpoint.",
      },
      {
        title: "Step 4 — cluster events",
        command: "kubectl get events --sort-by=.lastTimestamp | tail -15",
        explanation: "Gives you a cross-object timeline; invaluable when something cascades.",
        expectedOutput: "BackOff events for the crasher Pod, plus any unrelated cluster events.",
        internals: "kubectl get events is just `kubectl get -o wide events.v1.events.k8s.io`.",
      },
      {
        title: "Step 5 — node-level reality check",
        command: "sudo journalctl -u kubelet --since '5 min ago' | tail -30\nsudo crictl ps",
        explanation: "When the API tells you everything is fine but pods still misbehave, drop down to the kubelet and the runtime.",
        expectedOutput: "kubelet log entries about backing off, crictl shows the container states.",
        internals: "journald is the only place you'll see why kubelet itself failed (e.g. invalid kubeconfig, cgroup driver mismatch).",
      },
    ],
    commonErrors: [
      { error: "kubectl logs returns nothing", cause: "Container restarted; you need the previous instance", fix: "Add `-p` / `--previous`" },
      { error: "describe shows no Events", cause: "Events older than 1h; TTL'd out", fix: "Increase --event-ttl on the API server or use kube-state-metrics + persistent store" },
      { error: "`crictl: command not found`", cause: "Not installed on the node", fix: "`sudo apt install cri-tools` or use `nerdctl` against containerd directly" },
    ],
    troubleshooting: [
      "Always start with describe; logs without context is guessing",
      "If the API server is slow, hit `--raw=/healthz` to confirm it's the API and not your kubectl",
      "When something is namespace-scoped, never forget `-n`",
    ],
    enterpriseRelevance:
      "Senior SREs are not the people who know the most YAML — they're the ones who follow the same investigation loop every single time under pressure.",
    validation: [
      "You can recover a broken Pod without restarting the cluster",
      "You can tell whether a failure is application, scheduler, runtime or network in <5 min",
    ],
    relatedIncidents: ["K8S-INC-3001", "K8S-INC-3003"],
    relatedGuideSections: ["Troubleshooting methodology", "CrashLoopBackOff", "ImagePullBackOff"],
    questions: {
      beginner: [
        { q: "What's the first command you run when a Pod is unhealthy?", a: "kubectl describe pod <name> — events + conditions in one place." },
      ],
      intermediate: [
        { q: "Why does `kubectl logs` return empty for a crashlooping pod?", a: "Because the current container hasn't produced output yet; use `-p` for the previous instance." },
      ],
      advanced: [
        { q: "How would you correlate a Pod's failure with what the kubelet was doing?", a: "Take the Pod event timestamp, then `journalctl -u kubelet --since '<ts-30s>' --until '<ts+30s>'`." },
      ],
      scenario: [
        { q: "A pod shows Running 1/1 but the app is returning 503s to clients. Where do you look?", a: "Service endpoints (selector mismatch), readiness probe (passing but app broken), then app logs." },
      ],
      viva: [
        { q: "Walk through your five-step kubectl investigation loop.", a: "get → describe → logs (-p) → get events → kubelet/crictl on the node." },
      ],
    },
  },

  /* ============ LAB 3 — Lifecycle & Architecture ============ */
  {
    id: "K8S-LAB-03",
    slug: "lifecycle-architecture-internals",
    number: 3,
    title: "Kubernetes Internal Workflow — From kubectl to runc",
    category: "Runtime",
    level: "Engineer",
    durationMin: 60,
    focus: ["api-server", "scheduler", "kubelet", "containerd", "runc", "reconciliation"],
    objective:
      "Trace a single `kubectl apply` through every control-plane and node component until a Linux process is running.",
    conceptsCovered: [
      "Desired state vs actual state (the reconciliation loop)",
      "How the scheduler ranks nodes",
      "How kubelet uses the CRI to talk to containerd",
      "Where namespaces and cgroups actually get created",
    ],
    prerequisites: ["A cluster from Lab 1"],
    architecture: {
      ascii: `kubectl apply -f deploy.yaml
       |
       v
+----+-----+    watch    +-----------+    watch     +---------+
| API srv  |<----------- | scheduler |<-----------  | kubelet |
|  + etcd  |             +-----------+              +----+----+
+----+-----+                                              |
       ^                                                  v
       |                                              containerd
   controller-                                            |
   manager                                                v
                                                        runc
                                                          |
                                                  Linux namespaces
                                                  + cgroups`,
      narrative:
        "Every component just watches the API server and reacts. There's no central coordinator — only loops converging the actual state onto the desired state stored in etcd.",
    },
    steps: [
      {
        title: "Apply a Deployment and watch events in another terminal",
        command:
`kubectl create deployment trace --image=nginx --replicas=1
# in another terminal:
kubectl get events --watch`,
        explanation: "You'll see Scheduled → Pulling → Pulled → Created → Started in order.",
        expectedOutput: "Five events within ~5s on a warm node.",
        internals: "Each event is emitted by a different component: scheduler, kubelet, then runtime.",
      },
      {
        title: "Inspect the scheduling decision",
        command: "kubectl describe pod -l app=trace | grep -A2 Scheduled",
        explanation: "Shows which node was picked and which scheduler made the call.",
        expectedOutput: "`Successfully assigned default/trace-... to <node>` by default-scheduler.",
        internals: "Scheduler runs predicates (filter) then priorities (score). Final winner is bound via a Pod Bind subresource update.",
      },
      {
        title: "See the container on the node",
        command: "sudo crictl ps | grep nginx",
        explanation: "Proves the abstraction: there's just a Linux process under all the YAML.",
        expectedOutput: "A container with state Running.",
        internals: "crictl talks the same CRI protocol kubelet uses.",
      },
      {
        title: "Inspect the cgroup",
        command: "sudo systemd-cgls | head -30",
        explanation: "The Pod gets a cgroup slice; the container is a unit inside it.",
        expectedOutput: "A `kubepods.slice/...` hierarchy.",
        internals: "cgroups enforce CPU/memory limits; without them `limits:` in the Pod spec would be advisory.",
      },
      {
        title: "Watch self-healing in real time",
        command: "kubectl delete pod -l app=trace\nkubectl get pods -l app=trace -w",
        explanation: "Deleting the Pod doesn't kill the workload — the ReplicaSet observes a missing Pod and asks the API for a new one.",
        expectedOutput: "New Pod created within ~2s.",
        internals: "ReplicaSet controller watches Pods matching its selector and posts a new Pod when count < replicas.",
      },
    ],
    commonErrors: [
      { error: "Pod stays Pending forever", cause: "No node matches the requests/tolerations", fix: "`kubectl describe` → Events reveal which predicate failed" },
      { error: "Pod created twice after `kubectl delete`", cause: "User deleted the Pod but a Deployment owns the ReplicaSet", fix: "Expected behavior — delete the Deployment, not the Pod" },
    ],
    troubleshooting: [
      "If the scheduler is silent, check it's running: `kubectl -n kube-system get pods | grep scheduler`",
      "If pods never start, watch the runtime: `sudo crictl events`",
    ],
    enterpriseRelevance:
      "Understanding the loop is what makes you trust Kubernetes in production: there is no magic, only convergent controllers.",
    validation: [
      "You can name every component that touches a Pod from kubectl to runc",
      "You can predict whether a manual `kubectl delete pod` will respawn or not",
    ],
    relatedIncidents: ["K8S-INC-3004"],
    relatedGuideSections: ["Control plane & worker components", "Pod lifecycle & probes"],
    questions: {
      beginner: [
        { q: "What does the scheduler actually do?", a: "Picks a node for an unbound Pod and writes a Binding back to the API." },
      ],
      intermediate: [
        { q: "What ties a container back to its Pod on the node?", a: "The sandbox (pause) container shares its network/IPC namespaces with all app containers in the Pod." },
      ],
      advanced: [
        { q: "Why is reconciliation eventually consistent?", a: "Controllers act on watched events with retries; partial failures heal on the next sync rather than being transactional." },
      ],
      scenario: [
        { q: "etcd disk fills up. What's the first symptom you'll see?", a: "API server starts returning 500s on writes; reads may still work briefly." },
      ],
      viva: [
        { q: "Where do static pods come from?", a: "Files in /etc/kubernetes/manifests/, watched directly by kubelet, not scheduled." },
      ],
    },
  },

  /* ============ LAB 4 — Pods & Deployments ============ */
  {
    id: "K8S-LAB-04",
    slug: "pods-deployments-rollouts",
    number: 4,
    title: "Pods, Deployments & Self-Healing Rollouts",
    category: "Core",
    level: "Beginner",
    durationMin: 60,
    focus: ["Pods", "ReplicaSets", "Deployments", "scaling", "rolling updates", "rollback"],
    objective:
      "Author a Deployment, scale it, roll out a new image, roll back when it breaks, and watch self-healing in action.",
    conceptsCovered: ["Why you almost never create raw Pods in production", "Rolling update strategy parameters", "How rollback uses the ReplicaSet history"],
    prerequisites: ["A cluster from Lab 1"],
    architecture: {
      ascii: `Deployment (desired: 3, image: v1)
   |
   v
 ReplicaSet  --owns-->  Pod  Pod  Pod
   |
 (on update)
   v
 New ReplicaSet (v2)  --owns-->  Pod  Pod  Pod
   |
 Old ReplicaSet scaled to 0 (kept for rollback)`,
      narrative:
        "Deployments don't manage Pods directly — they manage ReplicaSets and orchestrate the gradual switch between two of them.",
    },
    steps: [
      {
        title: "Create the Deployment",
        command:
`cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata: {name: web}
spec:
  replicas: 3
  selector: {matchLabels: {app: web}}
  template:
    metadata: {labels: {app: web}}
    spec:
      containers:
      - name: web
        image: nginx:1.25
        ports: [{containerPort: 80}]
EOF`,
        explanation: "Three replicas of nginx 1.25.",
        expectedOutput: "deployment.apps/web created; 3 pods Running within ~10s.",
        internals: "Deployment controller creates a ReplicaSet, which creates 3 Pods.",
      },
      {
        title: "Scale up",
        command: "kubectl scale deploy/web --replicas=5\nkubectl get pods -l app=web",
        explanation: "Edits the ReplicaSet's `replicas` field. Two new Pods get scheduled.",
        expectedOutput: "5/5 ready within ~10s.",
        internals: "ReplicaSet controller posts new Pods until count == desired.",
      },
      {
        title: "Rolling update",
        command:
`kubectl set image deploy/web web=nginx:1.27
kubectl rollout status deploy/web`,
        explanation: "Replaces Pods gradually using maxSurge=25%, maxUnavailable=25% defaults.",
        expectedOutput: "`deployment \"web\" successfully rolled out`",
        internals: "A NEW ReplicaSet is created at desired=1, then scaled up while the old is scaled down — never both at full capacity unless surge allows it.",
      },
      {
        title: "Break it on purpose and roll back",
        command:
`kubectl set image deploy/web web=nginx:doesnotexist
kubectl rollout status deploy/web --timeout=30s || true
kubectl rollout undo deploy/web
kubectl rollout status deploy/web`,
        explanation: "Bad image → rollout stalls. `rollout undo` switches traffic back to the previous ReplicaSet.",
        expectedOutput: "After undo: rollout succeeds.",
        internals: "Deployment keeps `revisionHistoryLimit` ReplicaSets at replicas=0 specifically for this.",
      },
      {
        title: "Watch self-healing",
        command: "POD=$(kubectl get pod -l app=web -o name | head -1)\nkubectl delete $POD\nkubectl get pods -l app=web -w",
        explanation: "Deleting a managed Pod produces an immediate replacement.",
        expectedOutput: "A new Pod with a different suffix appears within ~2s.",
        internals: "ReplicaSet controller sees count<desired and POSTs a new Pod.",
      },
    ],
    commonErrors: [
      { error: "selector mismatch on a manual edit", cause: "Edited template labels but not the selector (or vice-versa)", fix: "Selectors are immutable on Deployments — delete and recreate" },
      { error: "Rollout stuck with maxUnavailable=0", cause: "No spare capacity to start new Pods", fix: "Raise maxSurge or add a node" },
    ],
    troubleshooting: [
      "`kubectl rollout history deploy/web` shows every revision",
      "`kubectl rollout undo deploy/web --to-revision=2` jumps to a specific revision",
    ],
    enterpriseRelevance:
      "Rolling updates + rollback are the cheapest production safety net you can buy. Every deploy should be undoable in one command.",
    validation: [
      "You can update an image without downtime",
      "You can roll back a bad deploy in under 30 seconds",
    ],
    relatedIncidents: ["K8S-INC-3001"],
    relatedGuideSections: ["Pod lifecycle & probes"],
    questions: {
      beginner: [{ q: "Why prefer Deployments over raw Pods?", a: "Self-healing, scaling, and rollouts." }],
      intermediate: [{ q: "What does maxUnavailable control?", a: "How many Pods can be down at once during a rollout." }],
      advanced: [{ q: "Why are Deployment selectors immutable?", a: "Changing them would orphan the existing ReplicaSet's Pods, risking double-running or no-running states." }],
      scenario: [{ q: "A rollout is wedged. Old pods are gone, new pods Pending. What broke?", a: "Likely a scheduling constraint introduced in the new spec (resources, affinity, node selector)." }],
      viva: [{ q: "What chain owns a Pod created by a Deployment?", a: "Deployment → ReplicaSet → Pod, tracked via ownerReferences." }],
    },
  },

  /* ============ LAB 5 — Services & Networking ============ */
  {
    id: "K8S-LAB-05",
    slug: "services-networking-clusterip-nodeport",
    number: 5,
    title: "Services, Selectors, Endpoints & DNS",
    category: "Networking",
    level: "Engineer",
    durationMin: 60,
    focus: ["Service", "ClusterIP", "NodePort", "kube-proxy", "CoreDNS", "Endpoints"],
    objective:
      "Expose a Deployment via ClusterIP and NodePort, prove service discovery works through CoreDNS, and debug a deliberately-broken selector.",
    conceptsCovered: ["How Endpoints objects bind Services to Pods", "ClusterIP vs NodePort vs LoadBalancer", "DNS records created per Service"],
    prerequisites: ["Lab 4 deployment `web` running"],
    architecture: {
      ascii: `Client
   |
   v
Service (ClusterIP 10.96.x.x)
   |
   v   (kube-proxy iptables/IPVS rules)
   v
Endpoints  -->  Pod  Pod  Pod  (by label selector)`,
      narrative:
        "A Service is a virtual IP. kube-proxy programs DNAT rules on every node so requests to ClusterIP land on a real Pod IP.",
    },
    steps: [
      {
        title: "Create a ClusterIP service",
        command: "kubectl expose deploy/web --port=80 --target-port=80 --name=web-svc\nkubectl get svc web-svc",
        explanation: "Creates a stable virtual IP that load-balances across all Pods with matching labels.",
        expectedOutput: "ClusterIP assigned from 10.96.0.0/12 range.",
        internals: "Endpoints controller writes the Pod IPs into an Endpoints object with the same name as the Service.",
      },
      {
        title: "Inspect Endpoints",
        command: "kubectl get endpoints web-svc",
        explanation: "Endpoints == the actual targets behind the virtual IP.",
        expectedOutput: "Comma-separated list of PodIP:80.",
        internals: "If this list is empty your selector is wrong or no Pod is ready.",
      },
      {
        title: "Service discovery via DNS",
        command: "kubectl run probe --rm -it --image=busybox -- sh -c 'nslookup web-svc.default.svc.cluster.local; wget -qO- web-svc'",
        explanation: "DNS resolves the service name to its ClusterIP; HTTP returns the nginx welcome page.",
        expectedOutput: "Address: 10.96.x.x, then `<!DOCTYPE html>`.",
        internals: "CoreDNS holds a zone for cluster.local and answers from the in-memory Service/Endpoints cache.",
      },
      {
        title: "Promote to NodePort",
        command: "kubectl patch svc web-svc -p '{\"spec\":{\"type\":\"NodePort\"}}'\nkubectl get svc web-svc",
        explanation: "Allocates a port in 30000-32767 on every node forwarding to the Service.",
        expectedOutput: "PORT(S) shows `80:3xxxx/TCP`.",
        internals: "kube-proxy adds an extra iptables rule chain for the node port.",
      },
      {
        title: "Break the selector on purpose",
        command:
`kubectl patch svc web-svc -p '{\"spec\":{\"selector\":{\"app\":\"wrong\"}}}'
kubectl get endpoints web-svc`,
        explanation: "Empty Endpoints == 503 / Connection refused from clients. Classic outage.",
        expectedOutput: "Endpoints list becomes <none>.",
        internals: "Endpoints controller can find no Pod matching the new selector.",
      },
      {
        title: "Fix it",
        command: "kubectl patch svc web-svc -p '{\"spec\":{\"selector\":{\"app\":\"web\"}}}'",
        explanation: "Restoring the right selector immediately repopulates Endpoints.",
        expectedOutput: "Endpoints list filled again.",
        internals: "No Pod restart needed — only the Service object changed.",
      },
    ],
    commonErrors: [
      { error: "503 from a healthy Pod", cause: "Selector mismatch → empty Endpoints", fix: "kubectl get endpoints <svc>" },
      { error: "DNS lookup times out", cause: "CoreDNS down or NetworkPolicy blocking egress to kube-dns", fix: "Check coredns pods and any default-deny NetworkPolicy" },
    ],
    troubleshooting: ["Endpoints empty → selector or readiness", "Endpoints full but no connectivity → kube-proxy or CNI", "DNS slow → CoreDNS HPA + ndots:5"],
    enterpriseRelevance:
      "Service mesh, Ingress and LoadBalancer all sit on top of these primitives. Get them wrong and everything downstream is unreliable.",
    validation: ["You can reach a Pod by service DNS name", "You can detect a selector mismatch in <30s using `kubectl get endpoints`"],
    relatedIncidents: ["K8S-INC-3003"],
    relatedGuideSections: ["Networking & Service types", "Service unreachable"],
    questions: {
      beginner: [{ q: "What's the DNS name of a Service called `web-svc` in namespace `default`?", a: "web-svc.default.svc.cluster.local" }],
      intermediate: [{ q: "What populates the Endpoints object?", a: "The endpoints controller, based on the Service selector + Pod readiness." }],
      advanced: [{ q: "Why use IPVS over iptables for kube-proxy?", a: "O(1) rule lookup at large scale vs O(n) for iptables." }],
      scenario: [{ q: "All clients report 503 but Pods are Running. First check?", a: "`kubectl get endpoints <svc>` — if empty, look at selector/readiness." }],
      viva: [{ q: "Difference between Service and Ingress?", a: "Service = L4 in-cluster VIP. Ingress = L7 HTTP router, usually exposed via a single LoadBalancer." }],
    },
  },

  /* ============ LAB 6 — Flannel & CNI ============ */
  {
    id: "K8S-LAB-06",
    slug: "flannel-cni-pod-networking",
    number: 6,
    title: "Flannel, CNI & Pod Networking",
    category: "Networking",
    level: "Engineer",
    durationMin: 60,
    focus: ["CNI", "Flannel", "PodCIDR", "overlay", "VXLAN"],
    objective:
      "Understand what CNI actually does, inspect Flannel's pod, routes and config files, and recover from PodCIDR mismatch.",
    conceptsCovered: ["The CNI spec (ADD/DEL/CHECK)", "VXLAN overlay basics", "Per-node /24 subnet from the cluster PodCIDR"],
    prerequisites: ["A cluster from Lab 1 with Flannel"],
    architecture: {
      ascii: `Pod A (node1, 10.244.1.5)  <-- VXLAN -->  Pod B (node2, 10.244.2.7)
   |
 cni0 bridge
   |
 veth pair  --  Pod netns`,
      narrative:
        "Flannel gives every node a /24 from the PodCIDR, plumbs a cni0 bridge, and tunnels off-node traffic via VXLAN over UDP/8472.",
    },
    steps: [
      {
        title: "Inspect Flannel pods",
        command: "kubectl -n kube-flannel get pods -o wide",
        explanation: "One kube-flannel-ds Pod per node.",
        expectedOutput: "All Running 1/1.",
        internals: "Flannel runs as a DaemonSet so every node — including new ones added via kubeadm join — automatically gets a Flannel agent.",
      },
      {
        title: "Inspect node subnet allocation",
        command: "cat /run/flannel/subnet.env",
        explanation: "Shows which /24 this node owns.",
        expectedOutput: "FLANNEL_SUBNET=10.244.0.1/24 (on the control plane).",
        internals: "Flannel allocates a subnet for the node via the node's spec.podCIDR field.",
      },
      {
        title: "Inspect the CNI config drop",
        command: "ls /etc/cni/net.d/\ncat /etc/cni/net.d/10-flannel.conflist",
        explanation: "Without this file kubelet refuses to mark Pods Ready.",
        expectedOutput: "JSON with plugins: [flannel, portmap].",
        internals: "kubelet picks the alphabetically first conflist as the active CNI.",
      },
      {
        title: "Trace pod-to-pod traffic",
        command:
`kubectl run a --image=busybox --command -- sleep 3600
kubectl run b --image=busybox --command -- sleep 3600
kubectl get pods -o wide
A_IP=$(kubectl get pod a -o jsonpath='{.status.podIP}')
kubectl exec b -- ping -c 3 $A_IP`,
        explanation: "Proves Pod-to-Pod connectivity across the CNI.",
        expectedOutput: "3 successful ICMP replies.",
        internals: "Same node → goes through cni0 bridge. Different nodes → goes through VXLAN tunnel.",
      },
      {
        title: "Simulate a PodCIDR mismatch (don't run on production!)",
        command: "kubectl -n kube-flannel edit configmap kube-flannel-cfg # change Network to 10.99.0.0/16",
        explanation: "Demonstrates the failure mode. Then revert.",
        expectedOutput: "Flannel pods CrashLoopBackOff with `Network CIDR mismatch`.",
        internals: "Flannel's agent compares the ConfigMap to the node's podCIDR field. A mismatch is fatal.",
      },
    ],
    commonErrors: [
      { error: "Flannel CrashLoopBackOff", cause: "PodCIDR vs ConfigMap mismatch", fix: "Revert ConfigMap, or re-init the cluster with the matching `--pod-network-cidr`" },
      { error: "CoreDNS stuck ContainerCreating", cause: "CNI config not written yet", fix: "Wait or `rollout restart` after CNI is healthy" },
    ],
    troubleshooting: ["`ip route` on the node should list the per-node subnets via flannel.1", "`bridge link show` shows the cni0 bridge"],
    enterpriseRelevance: "Almost every cluster outage that 'feels like networking' is actually CNI. Knowing where /etc/cni/net.d/ and /run/flannel/ live saves hours.",
    validation: ["Pods can ping each other across nodes", "You can articulate what `subnet.env` is for"],
    relatedIncidents: ["K8S-INC-3003"],
    relatedGuideSections: ["Networking & Service types", "CNI failure"],
    questions: {
      beginner: [{ q: "What does CNI stand for?", a: "Container Network Interface." }],
      intermediate: [{ q: "Why does every node need its own /24?", a: "So Pod IPs are unique and routable without coordination." }],
      advanced: [{ q: "Why VXLAN over plain IP routing?", a: "VXLAN works across L2 boundaries without needing the underlay to learn Pod CIDRs." }],
      scenario: [{ q: "New node joins, pods on it can't reach pods elsewhere. First check?", a: "Flannel pod on the new node, then VXLAN UDP/8472 on the underlay firewall." }],
      viva: [{ q: "What does the kubelet check before marking a Pod Ready w.r.t. CNI?", a: "That CNI ADD succeeded and an IP was returned for the sandbox." }],
    },
  },

  /* ============ LAB 7 — Resource Management ============ */
  {
    id: "K8S-LAB-07",
    slug: "resources-requests-limits-oomkilled",
    number: 7,
    title: "Resources, Requests, Limits & OOMKilled",
    category: "Core",
    level: "Engineer",
    durationMin: 45,
    focus: ["requests", "limits", "cgroups", "OOMKilled", "node allocatable"],
    objective: "Configure resource requests/limits, observe scheduler decisions, and reproduce/recover from OOMKilled.",
    conceptsCovered: ["Difference between requests and limits", "How requests influence scheduling", "How limits become cgroup constraints"],
    prerequisites: ["A cluster from Lab 1"],
    architecture: {
      ascii: `requests  ->  scheduler reservation (fit decision)
limits    ->  cgroup hard cap (CPU throttle / OOMKill)`,
      narrative:
        "Requests are the contract with the scheduler. Limits are the contract with the kernel.",
    },
    steps: [
      {
        title: "Deploy a pod with explicit resources",
        command:
`cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata: {name: capped}
spec:
  containers:
  - name: app
    image: polinux/stress
    resources:
      requests: {memory: "64Mi", cpu: "100m"}
      limits:   {memory: "128Mi", cpu: "200m"}
    command: ["stress","--vm","1","--vm-bytes","250M","--vm-hang","1"]
EOF`,
        explanation: "Asks for 64Mi but tries to use 250Mi → guaranteed OOMKill.",
        expectedOutput: "STATUS goes Running → OOMKilled within ~10s.",
        internals: "Kernel OOM killer fires when the memory cgroup is over limit; kubelet reports OOMKilled in the Pod status.",
      },
      {
        title: "Inspect the killed container",
        command: "kubectl describe pod capped | grep -A2 'Last State'",
        explanation: "Shows Reason=OOMKilled and the exit code (137).",
        expectedOutput: "Reason: OOMKilled, Exit Code: 137.",
        internals: "Exit code 137 = 128 + SIGKILL(9).",
      },
      {
        title: "Right-size and re-deploy",
        command: "kubectl patch pod capped --type='json' -p='[{\"op\":\"replace\",\"path\":\"/spec/containers/0/resources/limits/memory\",\"value\":\"512Mi\"}]' 2>/dev/null || \\\nkubectl delete pod capped && \\\nkubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata: {name: capped}\nspec:\n  containers:\n  - name: app\n    image: polinux/stress\n    resources:\n      requests: {memory: \"256Mi\", cpu: \"100m\"}\n      limits:   {memory: \"512Mi\", cpu: \"200m\"}\n    command: [\"stress\",\"--vm\",\"1\",\"--vm-bytes\",\"250M\",\"--vm-hang\",\"1\"]\nEOF",
        explanation: "Pods are mostly immutable; recreate with a higher limit.",
        expectedOutput: "Pod stays Running.",
        internals: "Pod resources are immutable today; in-place resize is alpha behind a feature gate.",
      },
      {
        title: "Inspect node allocatable",
        command: "kubectl describe node | grep -A5 Allocatable",
        explanation: "Shows what the scheduler thinks is available after system-reserved and kube-reserved.",
        expectedOutput: "CPU/memory values lower than total — that's expected.",
        internals: "Allocatable = capacity - kubeReserved - systemReserved - evictionThresholds.",
      },
    ],
    commonErrors: [
      { error: "OOMKilled in a loop", cause: "Limit too low for the actual working set", fix: "Profile, then raise limit (or fix the leak)" },
      { error: "Pod won't schedule", cause: "requests > node allocatable", fix: "Lower requests, or add a node" },
    ],
    troubleshooting: ["`kubectl top pod` to see usage if metrics-server is installed", "`dmesg | grep -i oom` on the node confirms kernel OOM"],
    enterpriseRelevance: "Mis-set limits cause the majority of mystery production restarts. Every workload spec needs explicit requests and limits.",
    validation: ["You can reproduce OOMKilled and recover from it", "You can read `Allocatable` and predict whether a Pod will fit"],
    relatedIncidents: ["K8S-INC-3001"],
    relatedGuideSections: ["Pod lifecycle & probes", "OOMKilled"],
    questions: {
      beginner: [{ q: "What's exit code 137?", a: "128 + SIGKILL(9) — the kernel OOM killer." }],
      intermediate: [{ q: "Why doesn't setting only limits help the scheduler?", a: "The scheduler only looks at requests." }],
      advanced: [{ q: "What's the difference between system-reserved and kube-reserved?", a: "system-reserved is for the OS (sshd etc.); kube-reserved is for kubelet/runtime/cni." }],
      scenario: [{ q: "A new microservice OOMs every few hours. Approach?", a: "Add usage metrics → compute p95 working set → set limit ~1.5x p95, then iterate." }],
      viva: [{ q: "What QoS class does a Pod get if requests==limits?", a: "Guaranteed." }],
    },
  },

  /* ============ LAB 8 — Storage ============ */
  {
    id: "K8S-LAB-08",
    slug: "storage-pv-pvc-storageclass",
    number: 8,
    title: "Persistent Storage — PV, PVC & StorageClass",
    category: "Core",
    level: "Engineer",
    durationMin: 45,
    focus: ["PersistentVolume", "PersistentVolumeClaim", "StorageClass", "dynamic provisioning"],
    objective: "Provision storage dynamically with a StorageClass, attach it to a Pod, and prove the data survives Pod deletion.",
    conceptsCovered: ["The PV/PVC binding loop", "Reclaim policies (Retain vs Delete)", "Access modes (RWO/ROX/RWX)"],
    prerequisites: ["A cluster with a default StorageClass (kind/minikube ship one; bare kubeadm needs local-path-provisioner)"],
    architecture: {
      ascii: `Pod  ->  PVC (claim spec: 1Gi, RWO)
            |
            v
      (binder controller)
            |
            v
         PV   --(CSI)-->  actual disk / NFS / cloud volume`,
      narrative:
        "PVCs are the consumer-facing API. PVs are the supply. A StorageClass automates the supply by calling a CSI driver.",
    },
    steps: [
      {
        title: "Install local-path-provisioner (if no default class)",
        command: "kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml\nkubectl patch storageclass local-path -p '{\"metadata\":{\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"true\"}}}'",
        explanation: "Gives the cluster a default StorageClass backed by local disk.",
        expectedOutput: "storageclass.storage.k8s.io/local-path created.",
        internals: "The provisioner watches PVCs and creates a hostPath PV on demand.",
      },
      {
        title: "Create a PVC and a Pod that uses it",
        command:
`cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: data}
spec:
  accessModes: [ReadWriteOnce]
  resources: {requests: {storage: 1Gi}}
---
apiVersion: v1
kind: Pod
metadata: {name: writer}
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh","-c","echo hello > /data/file; sleep 3600"]
    volumeMounts: [{mountPath: /data, name: vol}]
  volumes:
  - name: vol
    persistentVolumeClaim: {claimName: data}
EOF`,
        explanation: "PVC requests 1Gi. The provisioner creates a matching PV. Pod mounts it at /data.",
        expectedOutput: "PVC STATUS=Bound, Pod Running.",
        internals: "PV/PVC binding is atomic; once bound a PVC can only mount that PV.",
      },
      {
        title: "Prove persistence",
        command:
`kubectl exec writer -- cat /data/file
kubectl delete pod writer
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: {name: reader}
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh","-c","cat /data/file && sleep 3600"]
    volumeMounts: [{mountPath: /data, name: vol}]
  volumes:
  - name: vol
    persistentVolumeClaim: {claimName: data}
EOF
kubectl logs reader`,
        explanation: "Deleting the Pod doesn't delete the PVC or its data.",
        expectedOutput: "`hello` printed by the second Pod.",
        internals: "Reclaim policy on dynamically-provisioned PVs defaults to Delete — but only triggers when the PVC itself is deleted.",
      },
    ],
    commonErrors: [
      { error: "PVC stuck Pending", cause: "No StorageClass / no PV matches", fix: "kubectl describe pvc to see the binder error" },
      { error: "Pod can't mount volume", cause: "RWO PV already bound elsewhere, or node mismatch", fix: "Check PV claimRef and topology constraints" },
    ],
    troubleshooting: ["`kubectl get pv,pvc -A`", "Check the provisioner pod's logs"],
    enterpriseRelevance: "Stateful workloads live or die by correct PVC sizing and reclaim policy. Wrong reclaim = data loss.",
    validation: ["Data outlives the Pod that wrote it", "You can name the three access modes"],
    relatedIncidents: ["K8S-INC-3004"],
    relatedGuideSections: ["Storage / PV / PVC / CSI", "PVC Pending"],
    questions: {
      beginner: [{ q: "What does a PVC do?", a: "Requests storage matching a size + access mode." }],
      intermediate: [{ q: "When does Reclaim=Delete actually delete?", a: "When the PVC is deleted; deleting the Pod alone does not trigger it." }],
      advanced: [{ q: "Why is RWX rare on block storage?", a: "Block devices generally don't support multi-writer; you need a network filesystem." }],
      scenario: [{ q: "PVC stuck Pending forever. What's the most likely cause?", a: "No StorageClass or no provisioner — kubectl describe pvc shows the binder error." }],
      viva: [{ q: "Why prefer StorageClass over manually creating PVs?", a: "Dynamic provisioning — scales with demand, no manual ops." }],
    },
  },

  /* ============ LAB 9 — Security Fundamentals ============ */
  {
    id: "K8S-LAB-09",
    slug: "security-rbac-secrets-networkpolicy",
    number: 9,
    title: "RBAC, Secrets, ServiceAccounts & NetworkPolicies",
    category: "Enterprise",
    level: "Enterprise",
    durationMin: 60,
    focus: ["RBAC", "Roles", "RoleBindings", "Secrets", "ServiceAccounts", "NetworkPolicy"],
    objective: "Lock down a namespace with least-privilege RBAC, mount a Secret safely, and apply a default-deny NetworkPolicy.",
    conceptsCovered: ["Role vs ClusterRole", "ServiceAccount tokens", "Why Secrets aren't really 'secret' by default", "Default-deny network posture"],
    prerequisites: ["A cluster from Lab 1"],
    architecture: {
      ascii: `Subject (User/SA/Group)  --(RoleBinding)-->  Role  --(rules)-->  Resources`,
      narrative:
        "RBAC is just three objects: Role describes *what*, RoleBinding describes *who*, ServiceAccount provides the identity.",
    },
    steps: [
      {
        title: "Create a namespace and a junior SRE ServiceAccount",
        command:
`kubectl create namespace ops
kubectl -n ops create serviceaccount sre-junior`,
        explanation: "Identity for our least-privilege actor.",
        expectedOutput: "namespace/ops and serviceaccount/sre-junior created.",
        internals: "Every namespace also gets a default ServiceAccount automatically.",
      },
      {
        title: "Define a read-only Role",
        command:
`cat <<EOF | kubectl -n ops apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: {name: read-only}
rules:
- apiGroups: [""]
  resources: ["pods","pods/log","events"]
  verbs: ["get","list","watch"]
EOF
kubectl -n ops create rolebinding sre-junior-read --role=read-only --serviceaccount=ops:sre-junior`,
        explanation: "Lets sre-junior read pods/logs/events in `ops` only.",
        expectedOutput: "role and rolebinding created.",
        internals: "RBAC is additive and namespaced unless a ClusterRole/ClusterRoleBinding is used.",
      },
      {
        title: "Test as the ServiceAccount",
        command:
`kubectl -n ops auth can-i list pods --as=system:serviceaccount:ops:sre-junior
kubectl -n ops auth can-i delete pods --as=system:serviceaccount:ops:sre-junior`,
        explanation: "auth can-i is the fastest way to verify RBAC.",
        expectedOutput: "yes / no.",
        internals: "API server simulates the RBAC check with the requested identity.",
      },
      {
        title: "Create and mount a Secret",
        command:
`kubectl -n ops create secret generic db --from-literal=password=s3cret
kubectl -n ops run app --image=busybox --restart=Never -- sh -c 'echo $DB_PASS; sleep 3600' --overrides='{
  "spec": {
    "containers": [{
      "name":"app","image":"busybox",
      "command":["sh","-c","echo $DB_PASS; sleep 3600"],
      "env":[{"name":"DB_PASS","valueFrom":{"secretKeyRef":{"name":"db","key":"password"}}}]
    }]
  }
}'
kubectl -n ops logs app`,
        explanation: "Secret is injected via env. Logs show the value — proving the mount, but also why Secrets need RBAC + encryption-at-rest.",
        expectedOutput: "`s3cret`",
        internals: "Secrets are base64-encoded, not encrypted, by default. Enable EncryptionConfiguration on the API server for real protection.",
      },
      {
        title: "Apply default-deny ingress and re-allow only what's needed",
        command:
`cat <<EOF | kubectl -n ops apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: default-deny-ingress}
spec:
  podSelector: {}
  policyTypes: [Ingress]
EOF`,
        explanation: "All inbound traffic to Pods in `ops` is now blocked unless explicitly allowed.",
        expectedOutput: "networkpolicy.networking.k8s.io/default-deny-ingress created.",
        internals: "Requires a CNI that enforces NetworkPolicy (Calico/Cilium). Flannel needs the kube-router or canal variant.",
      },
    ],
    commonErrors: [
      { error: "NetworkPolicy has no effect", cause: "CNI doesn't enforce them (e.g. vanilla Flannel)", fix: "Use Calico/Cilium or add kube-router" },
      { error: "Forbidden errors even after RoleBinding", cause: "Wrong namespace or wrong subject kind", fix: "auth can-i --as=... pinpoints it" },
    ],
    troubleshooting: ["`kubectl auth can-i --list -n ops --as=...` enumerates effective rights", "`kubectl get rolebinding,clusterrolebinding -A | grep <sa>`"],
    enterpriseRelevance: "RBAC + NetworkPolicy + encrypted Secrets is the minimum bar for a compliant cluster (SOC2, ISO27001, PCI).",
    validation: ["sre-junior can read but not write", "Default-deny NetworkPolicy is active in `ops`"],
    relatedIncidents: ["K8S-INC-3005"],
    relatedGuideSections: ["RBAC & PodSecurityAdmission"],
    questions: {
      beginner: [{ q: "What is a ServiceAccount for?", a: "An identity for in-cluster workloads to authenticate to the API." }],
      intermediate: [{ q: "Difference between Role and ClusterRole?", a: "Role is namespaced; ClusterRole is cluster-wide or used for non-namespaced resources." }],
      advanced: [{ q: "Why do default Secrets not satisfy compliance?", a: "They're only base64 in etcd unless EncryptionConfiguration is enabled." }],
      scenario: [{ q: "A pod is exfiltrating data. How do you block egress immediately?", a: "NetworkPolicy with Egress type and an empty allow list, scoped to the pod's labels." }],
      viva: [{ q: "Walk through `kubectl auth can-i`.", a: "Sends a SubjectAccessReview to the API server with the supplied user; returns the RBAC decision." }],
    },
  },

  /* ============ LAB 10 — Monitoring & Observability ============ */
  {
    id: "K8S-LAB-10",
    slug: "monitoring-prometheus-grafana-loki",
    number: 10,
    title: "Monitoring & Observability — Prometheus, Grafana, Loki",
    category: "Enterprise",
    level: "Enterprise",
    durationMin: 75,
    focus: ["Prometheus", "Grafana", "Loki", "metrics-server", "alerting"],
    objective: "Install the kube-prometheus-stack, visualize cluster metrics in Grafana, ship logs to Loki, and write a basic PromQL alert.",
    conceptsCovered: ["Pull-based metrics vs push", "Service discovery via ServiceMonitor", "Log labels vs full-text indexing"],
    prerequisites: ["A cluster from Lab 1", "Helm 3 installed"],
    architecture: {
      ascii: `Pods --(/metrics)--> Prometheus  ---->  Grafana
            (kubelet/cadvisor)
Pods --(stdout)--->  Promtail  ---->  Loki  ---->  Grafana`,
      narrative:
        "Prometheus scrapes; Loki indexes labels not log lines (cheaper); Grafana stitches both into a single dashboard.",
    },
    steps: [
      {
        title: "Install kube-prometheus-stack",
        command:
`helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace`,
        explanation: "One chart ships Prometheus, Grafana, Alertmanager, node-exporter and a pile of dashboards.",
        expectedOutput: "All pods Running 1/1 in `monitoring` within ~2 min.",
        internals: "ServiceMonitor CRDs are how Prometheus discovers what to scrape inside the cluster.",
      },
      {
        title: "Open Grafana",
        command: "kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80\n# in browser: http://localhost:3000 (admin / prom-operator)",
        explanation: "Default admin password is `prom-operator` for the chart.",
        expectedOutput: "Grafana UI loads with prebuilt 'Kubernetes / Compute Resources' dashboards.",
        internals: "Port-forward tunnels via the API server; no LoadBalancer needed for the lab.",
      },
      {
        title: "Install Loki and Promtail",
        command: "helm install loki prometheus-community/loki-stack -n monitoring",
        explanation: "Promtail (DaemonSet) ships /var/log/containers/* to Loki; Grafana already discovers Loki via the same release.",
        expectedOutput: "loki-* pods Running.",
        internals: "Promtail tails container log files and adds Pod labels as Loki labels.",
      },
      {
        title: "Write a PromQL alert",
        command:
`cat <<EOF | kubectl -n monitoring apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata: {name: pod-restarts, labels: {release: monitoring}}
spec:
  groups:
  - name: pods
    rules:
    - alert: PodRestartingTooMuch
      expr: rate(kube_pod_container_status_restarts_total[5m]) > 0.1
      for: 5m
      labels: {severity: warning}
      annotations: {summary: "Pod {{ \\$labels.pod }} restarting"}
EOF`,
        explanation: "Fires when any pod restarts more than 6×/hour for 5 minutes.",
        expectedOutput: "prometheusrule.monitoring.coreos.com/pod-restarts created.",
        internals: "The Prometheus Operator reloads Prometheus when PrometheusRule CRs change.",
      },
    ],
    commonErrors: [
      { error: "No data in Grafana", cause: "ServiceMonitors filtered by `release` label mismatch", fix: "Add `labels: {release: monitoring}` to your ServiceMonitor" },
      { error: "Loki disk fills fast", cause: "Default retention too long for log volume", fix: "Tune `limits_config.retention_period`" },
    ],
    troubleshooting: ["`kubectl -n monitoring get servicemonitor`", "Prometheus → Status → Targets to see who's being scraped"],
    enterpriseRelevance: "You cannot run Kubernetes blind. The stack above is the lingua franca; nearly every SRE job description assumes it.",
    validation: ["You can see CPU/memory per Pod in Grafana", "You can query logs by Pod label in Loki", "You wrote one alert"],
    relatedIncidents: ["K8S-INC-3001", "K8S-INC-3004"],
    relatedGuideSections: ["Observability stack"],
    questions: {
      beginner: [{ q: "Why pull instead of push for metrics?", a: "Easier service discovery and built-in liveness signal." }],
      intermediate: [{ q: "What's a ServiceMonitor?", a: "A CRD the Prometheus Operator turns into a scrape config." }],
      advanced: [{ q: "Why does Loki index labels not log content?", a: "Drastically lower storage and cost; you grep within the time-bounded label stream." }],
      scenario: [{ q: "Prometheus disk fills every weekend. What do you tune?", a: "Retention, scrape interval, drop noisy series with relabel rules." }],
      viva: [{ q: "Difference between recording and alerting rules?", a: "Recording precomputes a series; alerting fires when an expr stays true for `for`." }],
    },
  },

  /* ============ LAB 11 — Windows Worker Node ============ */
  {
    id: "K8S-LAB-11",
    slug: "windows-worker-node",
    number: 11,
    title: "Hybrid Cluster — Joining a Windows Worker Node",
    category: "Windows",
    level: "Enterprise",
    durationMin: 90,
    focus: ["Windows Kubernetes", "kubelet.exe", "HNS", "containerd-windows", "hybrid scheduling"],
    objective: "Add a Windows Server 2022 node to a Linux control plane, schedule an IIS Pod on it, and debug HNS networking.",
    conceptsCovered: ["Why Windows nodes need their own CNI (Calico-Windows or Flannel host-gw)", "OS-based nodeSelectors and tolerations", "HNS endpoints vs Linux veth pairs"],
    prerequisites: ["Lab 1 cluster", "Windows Server 2022 VM with 4 vCPU / 8 GB RAM, joined to the same L2/L3 as the Linux node"],
    architecture: {
      ascii: `Linux control plane (kubeadm)
        |
        +--- Linux worker (kubelet + containerd + Flannel)
        |
        +--- Windows worker (kubelet.exe + containerd-windows + HNS overlay)
                                    |
                                    v
                            IIS Pod (mcr.microsoft.com/windows/servercore/iis)`,
      narrative:
        "Same control plane, two node OS families. The scheduler uses kubernetes.io/os labels and nodeSelectors to keep Linux Pods on Linux nodes and Windows Pods on Windows nodes.",
    },
    steps: [
      {
        title: "Prepare the Windows node",
        command:
`# On the Windows node (PowerShell as admin):
Install-WindowsFeature -Name Containers
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart
Restart-Computer`,
        explanation: "Containers + Hyper-V are required for containerd-windows and HNS.",
        expectedOutput: "Server reboots, features enabled.",
        internals: "HNS (Host Network Service) is the Windows equivalent of cni0 + iptables. It's a Hyper-V virtual switch.",
      },
      {
        title: "Install containerd, kubelet.exe, kubectl.exe",
        command:
`# PowerShell:
curl.exe -LO https://github.com/containerd/containerd/releases/download/v1.7.13/containerd-1.7.13-windows-amd64.tar.gz
tar -xvf containerd-1.7.13-windows-amd64.tar.gz -C $env:ProgramFiles\\containerd
& $env:ProgramFiles\\containerd\\bin\\containerd.exe --register-service
Start-Service containerd
# install kubelet & kubectl via SIG-Windows scripts:
curl.exe -LO https://raw.githubusercontent.com/kubernetes-sigs/sig-windows-tools/master/PrepareNode.ps1
.\\PrepareNode.ps1 -KubernetesVersion v1.30.0`,
        explanation: "PrepareNode.ps1 installs the kubelet service, kubectl, and Calico/Flannel binaries.",
        expectedOutput: "Service `kubelet` registered and Running.",
        internals: "kubelet.exe behaves like Linux kubelet but talks to containerd via the Windows named-pipe CRI socket.",
      },
      {
        title: "Join the node",
        command:
"# Re-run `kubeadm token create --print-join-command` on the LINUX control plane,\n# then on Windows in an elevated shell:\nkubeadm.exe join <CP_IP>:6443 --token <t> --discovery-token-ca-cert-hash sha256:<h>",
        explanation: "Same join command as Linux, just kubeadm.exe.",
        expectedOutput: "`This node has joined the cluster`",
        internals: "TLS bootstrap is identical; only the kubelet binary differs.",
      },
      {
        title: "Verify and schedule an IIS pod",
        command:
`kubectl get nodes -o wide
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata: {name: iis}
spec:
  replicas: 1
  selector: {matchLabels: {app: iis}}
  template:
    metadata: {labels: {app: iis}}
    spec:
      nodeSelector: {kubernetes.io/os: windows}
      tolerations:
      - {key: "os", operator: "Equal", value: "windows", effect: "NoSchedule"}
      containers:
      - name: iis
        image: mcr.microsoft.com/windows/servercore/iis:windowsservercore-ltsc2022
        ports: [{containerPort: 80}]
EOF
kubectl get pods -o wide -l app=iis`,
        explanation: "nodeSelector pins the Pod to Windows. The IIS image is ~5 GB so the first pull is slow.",
        expectedOutput: "Pod Running on the Windows node within ~10 min on first pull.",
        internals: "Windows containers are NOT lightweight — image layers are huge because each carries a chunk of the Windows base image.",
      },
    ],
    commonErrors: [
      { error: "Windows node NotReady", cause: "CNI (Calico/Flannel-Windows) not installed", fix: "Run sig-windows install-cni.ps1" },
      { error: "Pod stuck ContainerCreating on Windows", cause: "HNS endpoint creation failed", fix: "Restart-Service hns; check `Get-HnsNetwork`" },
      { error: "ImagePullBackOff for `mcr.microsoft.com/windows/...`", cause: "Pulled to a Linux node by accident", fix: "Add nodeSelector kubernetes.io/os=windows" },
    ],
    troubleshooting: ["`Get-HnsNetwork`, `Get-HnsEndpoint`", "Windows event log: kubelet writes to Application", "`crictl --runtime-endpoint npipe:////./pipe/containerd-containerd ps`"],
    enterpriseRelevance: "Mixed Linux/Windows clusters are common in enterprises with .NET Framework legacy. Modernization rarely deletes Windows workloads — it just orchestrates them.",
    validation: ["A Windows Pod runs alongside Linux Pods in the same cluster", "You can reach the IIS Pod's PodIP from a Linux Pod"],
    relatedIncidents: ["K8S-INC-3002"],
    relatedGuideSections: ["Linux ↔ Windows hybrid", "Join Windows node"],
    questions: {
      beginner: [{ q: "What label distinguishes a Windows node?", a: "kubernetes.io/os=windows" }],
      intermediate: [{ q: "Why is the IIS image multi-GB?", a: "It bundles the Windows Server Core base image — there's no shared host kernel." }],
      advanced: [{ q: "What does HNS do?", a: "Provides the virtual switch and endpoints that map to Pod network namespaces on Windows." }],
      scenario: [{ q: "All Windows pods go NotReady at once. First check?", a: "Get-Service hns on each Windows node, then the Windows CNI pod." }],
      viva: [{ q: "Can a Pod contain both a Linux and a Windows container?", a: "No — a Pod runs on a single node, which has a single OS." }],
    },
  },

  /* ============ LAB 12 — Enterprise Incident Investigation ============ */
  {
    id: "K8S-LAB-12",
    slug: "enterprise-incident-investigation",
    number: 12,
    title: "Enterprise Incident Investigation Capstone",
    category: "Investigation",
    level: "Enterprise",
    durationMin: 120,
    focus: ["P1 incident response", "root cause", "recovery", "postmortem", "blast radius"],
    objective: "Run an end-to-end P1 investigation: alert → triage → root cause → recovery → validation → postmortem note.",
    conceptsCovered: ["Investigation playbooks", "Blast radius reasoning", "Recovery vs root cause (fix forward vs rollback)", "Communicating during a live incident"],
    prerequisites: ["All previous labs"],
    architecture: {
      ascii: `ALERT  ->  Triage  ->  Hypothesis  ->  Test  ->  Recover  ->  Validate  ->  Postmortem
            (5-min)  (15-min)         (loop)        (act)      (prove)      (next day)`,
      narrative:
        "Real incidents are not a single command. They're a loop you exit only when metrics, logs and customer reports all agree the issue is gone.",
    },
    steps: [
      {
        title: "Pick an incident from the ops console",
        command: "# Open /ops/k8s-incidents in the ShadowXLab app.",
        explanation: "Choose any K8S-INC-30xx. We'll walk through K8S-INC-3001 (CrashLoopBackOff cascade).",
        expectedOutput: "Incident detail page open.",
        internals: "Incidents in the lab are deterministic — symptoms map 1:1 to a known root cause.",
      },
      {
        title: "Triage (5 minutes)",
        command:
`kubectl get pods -A --field-selector=status.phase!=Running | head
kubectl top pods -A | sort -k4 -h | tail
kubectl get events -A --sort-by=.lastTimestamp | tail -20`,
        explanation: "Three commands that give you the cluster-wide pulse.",
        expectedOutput: "List of unhealthy pods + top consumers + recent events.",
        internals: "These are the closest equivalents to `dmesg`, `top` and `journalctl -f` for a cluster.",
      },
      {
        title: "Form a hypothesis",
        command: "# Document in the incident ticket: 'Suspect probe regression after image bump'.",
        explanation: "A written hypothesis stops you flailing.",
        expectedOutput: "Hypothesis in the ticket.",
        internals: "Postmortems judge investigations on the *quality* of the hypothesis tree, not the time-to-fix.",
      },
      {
        title: "Test and recover",
        command:
`kubectl rollout history deploy/<svc>
kubectl rollout undo deploy/<svc>
kubectl rollout status deploy/<svc>`,
        explanation: "Rollback is the cheapest test: if the previous revision works, the new one introduced the regression.",
        expectedOutput: "Service back to healthy.",
        internals: "Always recover first, root-cause second. Customers don't care about the why.",
      },
      {
        title: "Validate",
        command:
`# Re-run the triage commands; confirm SLI dashboards back to green.
kubectl get pods -A --field-selector=status.phase!=Running | wc -l`,
        explanation: "Validation = 'metrics agree AND no new errors AND a synthetic transaction succeeds'.",
        expectedOutput: "Unhealthy pod count returns to baseline; Grafana SLI ≥ target.",
        internals: "Without explicit validation, you'll be paged again in 10 minutes.",
      },
      {
        title: "Write the postmortem",
        command: "# Use the template: Timeline | Impact | Root cause | What went well | What didn't | Action items.",
        explanation: "Action items must be specific, owned and dated. Otherwise the incident repeats.",
        expectedOutput: "Document attached to the incident ticket.",
        internals: "Blameless postmortems are mandatory in mature SRE orgs; they convert outage cost into learning value.",
      },
    ],
    commonErrors: [
      { error: "Tunnel vision", cause: "Chasing the first hypothesis past the point of evidence", fix: "Time-box hypotheses to 15 minutes; if no progress, regroup" },
      { error: "Root-cause before recovery", cause: "Engineer's instinct", fix: "Stop the bleeding first" },
    ],
    troubleshooting: ["Always have a written hypothesis", "Always have an explicit recovery action", "Always validate before declaring resolution"],
    enterpriseRelevance: "This loop is the difference between a senior SRE and a button-pusher. It scales from a 1-pod misconfig to a multi-region outage.",
    validation: [
      "Service restored to baseline SLI",
      "Postmortem published within 24h",
      "At least one preventive action item filed",
    ],
    relatedIncidents: ["K8S-INC-3001", "K8S-INC-3002", "K8S-INC-3003", "K8S-INC-3004", "K8S-INC-3005"],
    relatedGuideSections: ["Troubleshooting methodology", "Enterprise patterns"],
    questions: {
      beginner: [{ q: "What's the first goal of an incident response?", a: "Stop customer impact (recover), not find root cause." }],
      intermediate: [{ q: "Why time-box hypotheses?", a: "Avoid tunnel vision; force re-evaluation against fresh evidence." }],
      advanced: [{ q: "Why are blameless postmortems more valuable than blame ones?", a: "They surface systemic issues; blame just hides them." }],
      scenario: [{ q: "30% of pods OOMKill after a deploy. You can't reach the dev who pushed it. Action?", a: "Rollback the deploy; root-cause and contact dev after restoration." }],
      viva: [{ q: "Walk me through your last (or hypothetical) P1.", a: "Use the loop: triage → hypothesis → test → recover → validate → postmortem." }],
    },
  },
];

/* ----------------------------- Helpers ----------------------------- */

export const LAB_CATEGORIES: LabCategory[] = [
  "Beginner",
  "Runtime",
  "Core",
  "Networking",
  "Troubleshooting",
  "Investigation",
  "Enterprise",
  "Windows",
];

export function getLab(slug: string) {
  return K8S_HANDS_ON_LABS.find((l) => l.slug === slug);
}

export function labPdfPath(lab: HandsOnLab) {
  return `/resources/labs/lab-${String(lab.number).padStart(2, "0")}-${lab.slug}.pdf`;
}
export function labMdPath(lab: HandsOnLab) {
  return `/resources/labs/lab-${String(lab.number).padStart(2, "0")}-${lab.slug}.md`;
}
export const LABS_WORKBOOK_PATH = "/resources/labs/Kubernetes_HandsOn_Labs_Workbook.pdf";
