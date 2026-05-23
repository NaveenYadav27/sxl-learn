/**
 * K8sTerminalSimulator — interactive shell used by all Kubernetes & Docker labs.
 *
 * Mimics a DevOps workstation with both `docker` and `kubectl` available.
 * Validates lab steps using the same expected_action contract as the other
 * simulators:
 *
 *   { type: "command", contains: "docker build" }   // user must run a command containing this string
 *   { type: "command", equals:   "kubectl get pods" }  // exact match
 *   { type: "any" }                                  // free exploration — auto-completes
 *
 * Recognised tools: docker (run, build, pull, push, ps, images, logs, exec,
 * tag, rm, rmi, stop, start, inspect), kubectl (get, describe, apply, create,
 * delete, expose, scale, logs, exec, top, rollout, port-forward), kind, helm,
 * plus shell basics (ls, cat, pwd, whoami, clear, echo, cd).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Container, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface Action {
  type?: string;
  contains?: string;
  equals?: string;
  value?: string;
  [key: string]: any;
}

interface Props {
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
}

type Line = { kind: "prompt" | "stdout" | "ok" | "err" | "info"; text: string };
type OS = "linux" | "windows";

const PROMPTS: Record<OS, string> = {
  linux: "devops@shadowx:~/lab$ ",
  windows: "PS C:\\Users\\devops\\lab> ",
};

// ------------------------------------------------------------------
// Realistic command output snippets
// ------------------------------------------------------------------
function runCommand(cmd: string): Line[] {
  const c = cmd.trim();
  const lc = c.toLowerCase();
  const out: Line[] = [];
  const push = (text: string, kind: Line["kind"] = "stdout") => out.push({ kind, text });

  if (!c) return out;
  if (lc === "clear") return [];

  // ---------- shell basics ----------
  if (lc === "whoami") return [{ kind: "stdout", text: "devops" }];
  if (lc === "pwd") return [{ kind: "stdout", text: "/home/devops/lab" }];
  if (lc.startsWith("echo ")) return [{ kind: "stdout", text: c.slice(5) }];
  if (lc === "ls" || lc.startsWith("ls ")) {
    push("Dockerfile      app.py        deployment.yaml   service.yaml");
    push("README.md       requirements.txt");
    return out;
  }
  if (lc.startsWith("cat dockerfile")) {
    push("FROM python:3.11-slim");
    push("WORKDIR /app");
    push("COPY requirements.txt .");
    push("RUN pip install --no-cache-dir -r requirements.txt");
    push("COPY . .");
    push("EXPOSE 8080");
    push('CMD ["python", "app.py"]');
    return out;
  }
  if (lc.startsWith("cat deployment.yaml")) {
    push("apiVersion: apps/v1");
    push("kind: Deployment");
    push("metadata:");
    push("  name: shadowx-app");
    push("spec:");
    push("  replicas: 3");
    push("  selector:");
    push("    matchLabels: { app: shadowx-app }");
    push("  template:");
    push("    metadata: { labels: { app: shadowx-app } }");
    push("    spec:");
    push("      containers:");
    push("      - name: shadowx-app");
    push("        image: shadowx/app:1.0");
    push("        ports: [{ containerPort: 8080 }]");
    return out;
  }
  if (lc.startsWith("cat service.yaml")) {
    push("apiVersion: v1");
    push("kind: Service");
    push("metadata: { name: shadowx-app }");
    push("spec:");
    push("  type: LoadBalancer");
    push("  selector: { app: shadowx-app }");
    push("  ports: [{ port: 80, targetPort: 8080 }]");
    return out;
  }

  // ---------- docker ----------
  if (lc === "docker" || lc === "docker --help") {
    push("Usage: docker [OPTIONS] COMMAND");
    push("Common: run, build, pull, push, ps, images, logs, exec, stop, rm, rmi, tag, inspect");
    return out;
  }
  if (lc.startsWith("docker version") || lc === "docker -v") {
    push("Docker version 25.0.3, build 4debf41");
    push("API version: 1.44");
    push("OS/Arch: linux/amd64");
    return out;
  }
  if (lc.startsWith("docker pull")) {
    const img = c.split(/\s+/)[2] || "nginx:latest";
    push(`Using default tag: latest`, "info");
    push(`latest: Pulling from library/${img.split(":")[0]}`);
    push("a2abf6c4d29d: Pull complete");
    push("a9edb18cadd1: Pull complete");
    push("589b7251471a: Pull complete");
    push(`Digest: sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31`);
    push(`Status: Downloaded newer image for ${img}`, "ok");
    return out;
  }
  if (lc.startsWith("docker run")) {
    const id = "9f3a2e1b4c7d";
    if (lc.includes("-d") || lc.includes("--detach")) {
      push(id);
      push(`Container ${id} started in detached mode.`, "ok");
    } else {
      push("Hello from the container!");
      push("Listening on 0.0.0.0:8080 (simulated)", "info");
      push(`Container exited (0).`);
    }
    return out;
  }
  if (lc.startsWith("docker build")) {
    push("[+] Building 12.4s (10/10) FINISHED");
    push(" => [internal] load build definition from Dockerfile");
    push(" => [internal] load .dockerignore");
    push(" => [1/5] FROM docker.io/library/python:3.11-slim");
    push(" => [2/5] WORKDIR /app");
    push(" => [3/5] COPY requirements.txt .");
    push(" => [4/5] RUN pip install --no-cache-dir -r requirements.txt");
    push(" => [5/5] COPY . .");
    push(" => exporting to image");
    push(" => => writing image sha256:b1a4e90c...");
    push(" => => naming to docker.io/shadowx/app:1.0", "ok");
    return out;
  }
  if (lc.startsWith("docker tag")) {
    push("Tag created.", "ok");
    return out;
  }
  if (lc.startsWith("docker push")) {
    const img = c.split(/\s+/)[2] || "shadowx/app:1.0";
    push(`The push refers to repository [docker.io/${img.split(":")[0]}]`);
    push("a1b2c3d4e5f6: Pushed");
    push("9f8e7d6c5b4a: Pushed");
    push("base layer: Layer already exists");
    push(`${img.split(":")[1] || "latest"}: digest: sha256:7f8e... size: 1573`, "ok");
    return out;
  }
  if (lc.startsWith("docker images") || lc === "docker image ls") {
    push("REPOSITORY          TAG       IMAGE ID       CREATED        SIZE");
    push("shadowx/app         1.0       b1a4e90c2f31   2 minutes ago  142MB");
    push("python              3.11-sl…  9c1f4a8e5d22   2 weeks ago    122MB");
    push("nginx               latest    605c77e624dd   3 weeks ago    141MB");
    return out;
  }
  if (lc.startsWith("docker ps")) {
    push("CONTAINER ID   IMAGE             COMMAND          STATUS         PORTS                 NAMES");
    push("9f3a2e1b4c7d   shadowx/app:1.0   \"python app.py\"  Up 2 minutes   0.0.0.0:8080->8080/tcp app");
    if (lc.includes("-a")) {
      push("3a7e1f2b8c9d   nginx:latest      \"/docker-entry…\" Exited (0) 1h  -                     ngx");
    }
    return out;
  }
  if (lc.startsWith("docker logs")) {
    push("[2026-04-29 16:42:01] Starting shadowx-app v1.0");
    push("[2026-04-29 16:42:01] Listening on 0.0.0.0:8080");
    push("[2026-04-29 16:42:14] GET /health 200 — 4ms");
    push("[2026-04-29 16:42:18] GET /api/users 200 — 18ms");
    return out;
  }
  if (lc.startsWith("docker exec")) {
    push("Connected to container — type `exit` to leave (simulated).", "info");
    push("# whoami");
    push("root");
    return out;
  }
  if (lc.startsWith("docker stop") || lc.startsWith("docker kill")) {
    const id = c.split(/\s+/)[2] || "9f3a2e1b4c7d";
    push(id);
    push("Container stopped.", "ok");
    return out;
  }
  if (lc.startsWith("docker rm")) {
    push("Container removed.", "ok");
    return out;
  }
  if (lc.startsWith("docker rmi")) {
    push("Untagged: shadowx/app:1.0");
    push("Deleted: sha256:b1a4e90c2f31...", "ok");
    return out;
  }
  if (lc.startsWith("docker inspect")) {
    push("[ {");
    push('   "Id": "9f3a2e1b4c7d...",');
    push('   "State": { "Status": "running", "Running": true, "Pid": 4821 },');
    push('   "Config": { "Image": "shadowx/app:1.0", "ExposedPorts": { "8080/tcp": {} } },');
    push('   "NetworkSettings": { "IPAddress": "172.17.0.2" }');
    push("} ]");
    return out;
  }
  if (lc.startsWith("docker login")) {
    push("Authenticating with existing credentials...");
    push("Login Succeeded", "ok");
    return out;
  }

  // ---------- kubectl ----------
  if (lc === "kubectl" || lc === "kubectl --help") {
    push("kubectl controls the Kubernetes cluster manager.");
    push("Common: get, describe, apply, create, delete, expose, scale, logs, exec, top, rollout");
    return out;
  }
  if (lc.startsWith("kubectl version")) {
    push("Client Version: v1.29.2");
    push("Server Version: v1.29.0 (kind v0.22.0)");
    return out;
  }
  if (lc.startsWith("kubectl cluster-info")) {
    push("Kubernetes control plane is running at https://127.0.0.1:6443", "ok");
    push("CoreDNS is running at https://127.0.0.1:6443/api/v1/.../proxy");
    return out;
  }
  if (lc.startsWith("kubectl get nodes")) {
    push("NAME                       STATUS   ROLES           AGE   VERSION");
    push("kind-control-plane         Ready    control-plane   1h    v1.29.0");
    push("kind-worker                Ready    <none>          1h    v1.29.0");
    push("kind-worker2               Ready    <none>          1h    v1.29.0");
    return out;
  }
  if (lc.startsWith("kubectl get pods") || lc.startsWith("kubectl get po")) {
    push("NAME                            READY   STATUS    RESTARTS   AGE");
    push("shadowx-app-7d4f9c8b6c-2k4lm   1/1     Running   0          5m");
    push("shadowx-app-7d4f9c8b6c-9xq7p   1/1     Running   0          5m");
    push("shadowx-app-7d4f9c8b6c-lw3jt   1/1     Running   0          5m");
    return out;
  }
  if (lc.startsWith("kubectl get deploy")) {
    push("NAME           READY   UP-TO-DATE   AVAILABLE   AGE");
    push("shadowx-app    3/3     3            3           5m");
    return out;
  }
  if (lc.startsWith("kubectl get svc") || lc.startsWith("kubectl get service")) {
    push("NAME           TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE");
    push("kubernetes     ClusterIP      10.96.0.1       <none>          443/TCP        1h");
    push("shadowx-app    LoadBalancer   10.96.142.31    172.18.255.200  80:31180/TCP   2m");
    return out;
  }
  if (lc.startsWith("kubectl get ns") || lc.startsWith("kubectl get namespaces")) {
    push("NAME              STATUS   AGE");
    push("default           Active   1h");
    push("kube-system       Active   1h");
    push("kube-public       Active   1h");
    push("kube-node-lease   Active   1h");
    return out;
  }
  if (lc.startsWith("kubectl get all")) {
    push("NAME                              READY   STATUS    RESTARTS   AGE");
    push("pod/shadowx-app-7d4f9c8b6c-2k4lm  1/1     Running   0          5m");
    push("pod/shadowx-app-7d4f9c8b6c-9xq7p  1/1     Running   0          5m");
    push("pod/shadowx-app-7d4f9c8b6c-lw3jt  1/1     Running   0          5m");
    push("");
    push("NAME                  TYPE         CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE");
    push("service/shadowx-app   LoadBalancer 10.96.142.31  172.18.255.2  80/TCP    2m");
    push("");
    push("NAME                          READY   UP-TO-DATE   AVAILABLE   AGE");
    push("deployment.apps/shadowx-app   3/3     3            3           5m");
    return out;
  }
  if (lc.startsWith("kubectl describe pod")) {
    push("Name:         shadowx-app-7d4f9c8b6c-2k4lm");
    push("Namespace:    default");
    push("Node:         kind-worker/172.18.0.3");
    push("Status:       Running");
    push("Containers:");
    push("  shadowx-app:");
    push("    Image:    shadowx/app:1.0");
    push("    Ports:    8080/TCP");
    push("    State:    Running   Started: 5m ago");
    push("    Ready:    True");
    push("Events:");
    push("  Type    Reason     Age   From      Message");
    push("  Normal  Scheduled  5m    default-scheduler  Successfully assigned");
    push("  Normal  Pulled     5m    kubelet            Container image already present");
    push("  Normal  Started    5m    kubelet            Started container", "ok");
    return out;
  }
  if (lc.startsWith("kubectl describe deploy")) {
    push("Name:                shadowx-app");
    push("Replicas:            3 desired | 3 updated | 3 total | 3 available | 0 unavailable");
    push("StrategyType:        RollingUpdate");
    push("RollingUpdateStrategy: 25% max unavailable, 25% max surge");
    push("Pod Template:");
    push("  Containers: shadowx-app   Image: shadowx/app:1.0   Port: 8080/TCP");
    return out;
  }
  if (lc.startsWith("kubectl logs")) {
    push("[2026-04-29 16:42:01] Starting shadowx-app v1.0");
    push("[2026-04-29 16:42:01] Listening on 0.0.0.0:8080");
    push("[2026-04-29 16:42:14] GET /health 200 — 3ms");
    push("[2026-04-29 16:43:02] GET /api/users 200 — 21ms");
    return out;
  }
  if (lc.startsWith("kubectl apply")) {
    if (lc.includes("deployment")) {
      push("deployment.apps/shadowx-app created", "ok");
    } else if (lc.includes("service")) {
      push("service/shadowx-app created", "ok");
    } else {
      push("deployment.apps/shadowx-app created", "ok");
      push("service/shadowx-app created", "ok");
    }
    return out;
  }
  if (lc.startsWith("kubectl create deploy")) {
    push("deployment.apps/shadowx-app created", "ok");
    return out;
  }
  if (lc.startsWith("kubectl expose")) {
    push("service/shadowx-app exposed", "ok");
    push("Service is reachable via cluster DNS: shadowx-app.default.svc.cluster.local", "info");
    return out;
  }
  if (lc.startsWith("kubectl scale")) {
    const replicas = (c.match(/--replicas[= ](\d+)/) || [])[1] || "5";
    push(`deployment.apps/shadowx-app scaled to ${replicas} replicas`, "ok");
    return out;
  }
  if (lc.startsWith("kubectl rollout")) {
    push("deployment \"shadowx-app\" successfully rolled out", "ok");
    return out;
  }
  if (lc.startsWith("kubectl exec")) {
    push("Defaulted container \"shadowx-app\" out of: shadowx-app", "info");
    push("# (interactive shell — simulated)");
    push("# whoami");
    push("root");
    return out;
  }
  if (lc.startsWith("kubectl top")) {
    push("NAME                            CPU(cores)   MEMORY(bytes)");
    push("shadowx-app-7d4f9c8b6c-2k4lm   12m          48Mi");
    push("shadowx-app-7d4f9c8b6c-9xq7p   9m           45Mi");
    push("shadowx-app-7d4f9c8b6c-lw3jt   11m          47Mi");
    return out;
  }
  if (lc.startsWith("kubectl get events")) {
    push("LAST SEEN   TYPE     REASON          OBJECT                          MESSAGE");
    push("5m          Normal   Scheduled       pod/shadowx-app-7d4f9c8b6c-2k4lm  Successfully assigned");
    push("5m          Normal   Pulled          pod/shadowx-app-7d4f9c8b6c-2k4lm  Container image already present");
    push("5m          Normal   Started         pod/shadowx-app-7d4f9c8b6c-2k4lm  Started container");
    push("3m          Warning  Unhealthy       pod/shadowx-app-7d4f9c8b6c-9xq7p  Readiness probe failed");
    return out;
  }
  if (lc.startsWith("kubectl delete")) {
    push("deployment.apps \"shadowx-app\" deleted", "ok");
    return out;
  }
  if (lc.startsWith("kubectl port-forward")) {
    push("Forwarding from 127.0.0.1:8080 -> 8080");
    push("Forwarding from [::1]:8080 -> 8080");
    push("(Ctrl+C to stop — simulated)", "info");
    return out;
  }

  // ---------- kubectl — troubleshooting (M3) ----------
  if (lc.startsWith("kubectl describe node")) {
    push("Name:               kind-worker");
    push("Roles:              <none>");
    push("Labels:             kubernetes.io/os=linux,node-role.kubernetes.io/worker=");
    push("Taints:             <none>");
    push("Conditions:");
    push("  Type             Status  Reason");
    push("  MemoryPressure   False   KubeletHasSufficientMemory");
    push("  DiskPressure     False   KubeletHasNoDiskPressure");
    push("  PIDPressure      False   KubeletHasSufficientPID");
    push("  Ready            True    KubeletReady", "ok");
    push("Capacity:           cpu: 4, memory: 8024Mi, pods: 110");
    push("Allocatable:        cpu: 3800m, memory: 7240Mi, pods: 110");
    push("System Info:        OS Image: Ubuntu 22.04, kernel 5.15.0, containerd://1.7.2");
    push("Non-terminated Pods: 8 (cpu req 480m / 12%, mem req 1.2Gi / 17%)");
    return out;
  }
  if (lc.startsWith("kubectl top node")) {
    push("NAME                  CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%");
    push("kind-control-plane    142m         3%     1145Mi          14%");
    push("kind-worker           89m          2%     842Mi           10%");
    push("kind-worker2          112m         2%     915Mi           11%");
    return out;
  }
  if (lc.startsWith("kubectl drain")) {
    const node = c.split(/\s+/)[2] || "kind-worker";
    push(`node/${node} cordoned`, "ok");
    push("evicting pod default/shadowx-app-7d4f9c8b6c-2k4lm");
    push("evicting pod default/shadowx-app-7d4f9c8b6c-9xq7p");
    push("pod/shadowx-app-7d4f9c8b6c-2k4lm evicted");
    push("pod/shadowx-app-7d4f9c8b6c-9xq7p evicted");
    push(`node/${node} drained — safe for maintenance.`, "ok");
    return out;
  }
  if (lc.startsWith("kubectl cordon")) {
    push(`node/${c.split(/\s+/)[2] || "kind-worker"} cordoned`, "ok");
    push("New pods will not be scheduled to this node.", "info");
    return out;
  }
  if (lc.startsWith("kubectl uncordon")) {
    push(`node/${c.split(/\s+/)[2] || "kind-worker"} uncordoned`, "ok");
    return out;
  }
  if (lc.startsWith("kubectl taint")) {
    push("node/kind-worker tainted", "ok");
    return out;
  }
  if (lc.includes("--sort-by") && lc.startsWith("kubectl get events")) {
    push("LAST SEEN   TYPE      REASON              OBJECT                          MESSAGE");
    push("12m         Warning   FailedScheduling    pod/orders-7f9c-2kx     0/3 nodes available: 3 Insufficient memory");
    push("8m          Warning   Unhealthy           pod/shadowx-app-9xq7p   Readiness probe failed: HTTP 500");
    push("4m          Warning   BackOff             pod/payments-5d8-lwz    Back-off restarting failed container");
    push("2m          Normal    Scheduled           pod/shadowx-app-2k4lm   Successfully assigned");
    return out;
  }
  if (lc.startsWith("kubectl get pv") || lc.startsWith("kubectl get persistentvolume")) {
    push("NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM             STORAGECLASS");
    push("pvc-9a1   10Gi       RWO            Delete           Bound     default/data-0    standard");
    return out;
  }
  if (lc.startsWith("kubectl get pvc")) {
    push("NAME       STATUS    VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS");
    push("data-0     Bound     pvc-9a1   10Gi       RWO            standard");
    return out;
  }

  // ---------- Linux host troubleshooting ----------
  if (lc.startsWith("systemctl status kubelet")) {
    push("● kubelet.service - kubelet: The Kubernetes Node Agent");
    push("   Loaded: loaded (/lib/systemd/system/kubelet.service; enabled)");
    push("   Active: active (running) since Mon 2026-05-23 09:14:02 UTC; 4h ago", "ok");
    push("   Main PID: 1842 (kubelet)");
    push("   Memory: 128.4M");
    push("   CGroup: /system.slice/kubelet.service");
    return out;
  }
  if (lc.startsWith("systemctl status containerd")) {
    push("● containerd.service - containerd container runtime");
    push("   Active: active (running) since Mon 2026-05-23 09:13:55 UTC; 4h ago", "ok");
    push("   Main PID: 1721 (containerd)");
    return out;
  }
  if (lc.startsWith("journalctl -u kubelet") || lc.startsWith("journalctl -u containerd")) {
    push("-- Logs begin at Mon 2026-05-23 09:13:14 UTC --");
    push("May 23 09:14:02 kind-worker kubelet[1842]: I node_status_updater.go: Updating node status");
    push("May 23 09:14:12 kind-worker kubelet[1842]: I kubelet.go: Started kubelet");
    push("May 23 13:01:44 kind-worker kubelet[1842]: W PLEG: container start delayed");
    push("May 23 13:02:08 kind-worker kubelet[1842]: E pod_workers.go: Error syncing pod, will retry", "err");
    return out;
  }
  if (lc.startsWith("journalctl -k") || lc.includes("dmesg")) {
    push("[12345.678] Memory cgroup out of memory: Killed process 18342 (python) total-vm:412M, anon-rss:312M", "err");
    push("[12346.012] oom_reaper: reaped process 18342 (python)");
    return out;
  }
  if (lc.startsWith("crictl ps")) {
    push("CONTAINER     IMAGE              CREATED        STATE     NAME            ATTEMPT   POD ID");
    push("abc123def     shadowx/app:1.0    4 minutes ago  Running   shadowx-app     0         pod987");
    push("9f8e7d6c5b    coredns/coredns    4 hours ago    Running   coredns         0         pod123");
    return out;
  }
  if (lc.startsWith("crictl images")) {
    push("IMAGE                 TAG       IMAGE ID       SIZE");
    push("shadowx/app           1.0       b1a4e90c2f31   142MB");
    push("registry.k8s.io/pause 3.9       e6f181c8d5d6   744kB");
    return out;
  }
  if (lc.startsWith("swapon") || lc === "free -h") {
    push("              total        used        free      shared");
    push("Mem:           7.8Gi       1.2Gi       5.4Gi       0Mi");
    push("Swap:             0B          0B          0B");
    push("Swap is OFF — Kubernetes is happy.", "ok");
    return out;
  }
  if (lc.startsWith("swapoff")) {
    push("Swap disabled. (kubelet now compatible)", "ok");
    return out;
  }
  if (lc.startsWith("iptables -t nat -l kube-services")) {
    push("Chain KUBE-SERVICES (2 references)");
    push(" pkts bytes target                     prot opt in   out   source       destination");
    push("    0     0 KUBE-SVC-NPX46M4PTMTKRN6Y  tcp  --  *    *     0.0.0.0/0    10.96.0.1     /* default/kubernetes:https */ tcp dpt:443");
    push("    0     0 KUBE-SVC-ERIFXISQEP7F7OF4  udp  --  *    *     0.0.0.0/0    10.96.0.10    /* kube-system/kube-dns:dns */ udp dpt:53");
    return out;
  }
  if (lc.startsWith("ip a") || lc.startsWith("ip addr") || lc.startsWith("ifconfig")) {
    push("1: lo: <LOOPBACK,UP> mtu 65536");
    push("    inet 127.0.0.1/8 scope host lo");
    push("2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500");
    push("    inet 172.18.0.3/16 brd 172.18.255.255 scope global eth0");
    push("3: cni0: <BROADCAST,MULTICAST,UP> mtu 1450");
    push("    inet 10.244.1.1/24 brd 10.244.1.255 scope global cni0");
    return out;
  }
  if (lc.startsWith("nslookup")) {
    push("Server:         10.96.0.10");
    push("Address:        10.96.0.10:53");
    push("Name:           kubernetes.default.svc.cluster.local");
    push("Address:        10.96.0.1", "ok");
    return out;
  }

  // ---------- Windows PowerShell troubleshooting ----------
  if (lc.startsWith("get-service kubelet") || lc.startsWith("get-service")) {
    push("Status   Name               DisplayName");
    push("------   ----               -----------");
    push("Running  kubelet            kubelet: The Kubernetes Node Agent", "ok");
    push("Running  containerd         containerd container runtime");
    push("Running  hns                Host Network Service");
    return out;
  }
  if (lc === "ipconfig" || lc.startsWith("ipconfig")) {
    push("Windows IP Configuration");
    push("");
    push("Ethernet adapter vEthernet (Ethernet):");
    push("   IPv4 Address. . . . . . . . . . . : 172.18.0.4");
    push("   Subnet Mask . . . . . . . . . . . : 255.255.0.0");
    push("Ethernet adapter vEthernet (HNS Internal NIC):");
    push("   IPv4 Address. . . . . . . . . . . : 10.244.2.1");
    return out;
  }
  if (lc.startsWith("get-netadapter")) {
    push("Name          InterfaceDescription          Status    LinkSpeed");
    push("----          --------------------          ------    ---------");
    push("Ethernet      Microsoft Hyper-V Network     Up        10 Gbps");
    push("vEthernet     Hyper-V Virtual Ethernet      Up        10 Gbps");
    return out;
  }
  if (lc.startsWith("get-windowsfeature") || lc.includes("containers")) {
    push("Display Name                  Name              Install State");
    push("------------                  ----              -------------");
    push("[X] Containers                Containers        Installed", "ok");
    push("[X] Hyper-V                   Hyper-V           Installed", "ok");
    return out;
  }

  // ---------- kind / minikube / helm ----------
  if (lc.startsWith("kind create cluster")) {
    push("Creating cluster \"kind\" ...");
    push(" ✓ Ensuring node image (kindest/node:v1.29.0)");
    push(" ✓ Preparing nodes");
    push(" ✓ Writing configuration");
    push(" ✓ Starting control-plane");
    push(" ✓ Installing CNI");
    push(" ✓ Installing StorageClass");
    push("Set kubectl context to \"kind-kind\"", "ok");
    return out;
  }
  if (lc.startsWith("minikube start")) {
    push("😄  minikube v1.32.0 on Linux");
    push("✨  Automatically selected the docker driver");
    push("🔥  Creating docker container ...");
    push("🐳  Preparing Kubernetes v1.29.0 on Docker");
    push("🏄  Done! kubectl is now configured to use \"minikube\"", "ok");
    return out;
  }
  if (lc.startsWith("helm")) {
    push("(helm — simulated) command accepted.", "info");
    return out;
  }

  // ---------- fallback ----------
  push(`${os === "windows" ? "PS> " : "bash: "}command not found (simulated): ${c.split(" ")[0]}`, "err");
  push("Tip: this terminal recognises docker, kubectl, kind, minikube, helm,", "info");
  push("     plus M3 troubleshooting: kubectl describe node | top node | drain | cordon | taint,", "info");
  push("     systemctl status kubelet, journalctl -u kubelet, crictl ps, swapon, iptables,", "info");
  push("     and Windows: Get-Service kubelet, ipconfig, Get-NetAdapter, Get-WindowsFeature.", "info");
  return out;
}

// NOTE: `os` is read from the component scope when used in the fallback above.
// To keep runCommand pure we pass it in via closure — see component below.
let os: OS = "linux";

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------
function matches(cmd: string, action: Action): boolean {
  if (!action || action.type === "any") return true;
  const c = cmd.trim().toLowerCase();
  if (action.equals) return c === action.equals.toLowerCase();
  if (action.contains) return c.includes(action.contains.toLowerCase());
  if (action.value) return c.includes(action.value.toLowerCase());
  return false;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function K8sTerminalSimulator({ expectedAction, onValidate }: Props) {
  const [history, setHistory] = useState<Line[]>([
    { kind: "info", text: "ShadowX DevOps Lab — docker + kubectl ready. Type a command and press Enter." },
    { kind: "info", text: "Try: `docker ps`, `kubectl get pods`, `cat Dockerfile`. ↑/↓ for history." },
  ]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [pastIdx, setPastIdx] = useState<number>(-1);
  const [solved, setSolved] = useState(false);
  const [os, setOs] = useState<OS>("linux");
  const scrollRef = useRef<HTMLDivElement>(null);

  const expectedHint = useMemo(() => {
    if (!expectedAction) return "";
    if (expectedAction.equals) return `Run exactly: ${expectedAction.equals}`;
    if (expectedAction.contains) return `Run a command containing: ${expectedAction.contains}`;
    if (expectedAction.value) return `Try something containing: ${expectedAction.value}`;
    if (expectedAction.type === "any") return "Free exploration — any command will pass.";
    return "";
  }, [expectedAction]);

  useEffect(() => {
    setSolved(false);
  }, [expectedAction]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  function submit() {
    const c = input.trim();
    if (!c) return;
    const newLines: Line[] = [{ kind: "prompt", text: PROMPTS[os] + c }, ...runCommand(c)];
    setHistory((h) => [...h, ...newLines]);
    setPast((p) => [...p, c]);
    setPastIdx(-1);
    setInput("");
    if (!solved && matches(c, expectedAction)) {
      setSolved(true);
      setHistory((h) => [...h, { kind: "ok", text: "✔ Step objective met. Marking step complete…" }]);
      setTimeout(() => onValidate(true), 400);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); submit(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.length) return;
      const idx = pastIdx === -1 ? past.length - 1 : Math.max(0, pastIdx - 1);
      setPastIdx(idx); setInput(past[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pastIdx === -1) return;
      const idx = pastIdx + 1;
      if (idx >= past.length) { setPastIdx(-1); setInput(""); }
      else { setPastIdx(idx); setInput(past[idx]); }
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-card">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-[hsl(220_15%_10%)] text-foreground px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Container className="h-4 w-4 text-shadowx-azure" />
          <span className="font-semibold">{os === "windows" ? "PS C:\\Users\\devops" : "devops@shadowx"}</span>
          <span className="text-muted-foreground">— {os === "windows" ? "PowerShell · docker · kubectl" : "bash · docker · kubectl"}</span>
          {/* OS toggle — Windows / Linux tabs */}
          <div className="ml-3 inline-flex rounded border border-border overflow-hidden">
            {(["linux", "windows"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOs(o)}
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                  os === o
                    ? "bg-shadowx-azure/20 text-shadowx-azure"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expectedHint && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Terminal className="h-3 w-3" /> {expectedHint}
            </Badge>
          )}
          {solved && (
            <Badge className="bg-success/15 text-success border-success/30 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> Solved
            </Badge>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div ref={scrollRef as any} className="bg-[hsl(220_20%_7%)] text-[hsl(195_70%_80%)] font-mono text-[12.5px] leading-relaxed">
        <ScrollArea className="h-[360px]">
          <div className="px-4 py-3 space-y-0.5">
            {history.map((l, i) => (
              <pre key={i} className={
                l.kind === "prompt" ? "text-[hsl(45_90%_70%)] whitespace-pre-wrap"
                : l.kind === "ok" ? "text-[hsl(140_80%_70%)] whitespace-pre-wrap"
                : l.kind === "err" ? "text-[hsl(0_80%_70%)] whitespace-pre-wrap"
                : l.kind === "info" ? "text-[hsl(210_50%_70%)] whitespace-pre-wrap italic"
                : "text-[hsl(0_0%_88%)] whitespace-pre-wrap"
              }>{l.text}</pre>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 bg-[hsl(220_20%_7%)] px-3 py-2 border-t border-border">
        <span className="font-mono text-xs text-[hsl(45_90%_70%)] shrink-0">{os === "windows" ? ">" : "$"}</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{ color: "hsl(45 95% 75%)", caretColor: "hsl(45 95% 75%)" }}
          className="flex-1 bg-transparent border-0 outline-none font-mono text-sm placeholder:text-[hsl(210_30%_50%)]"
          placeholder={solved ? "Step solved — try another command or wait for the next step…" : "Type a command and press Enter (↑/↓ for history)"}
        />
        <Button size="sm" variant="secondary" onClick={submit} className="h-7 gap-1">
          <Sparkles className="h-3 w-3" /> Run
        </Button>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-card border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-warning" />
        <span>
          Safe simulation modelled on real Docker + Kubernetes output. No containers actually run and no
          packets leave your browser — but the commands, flags and output mirror a real DevOps workstation.
        </span>
      </div>
    </Card>
  );
}

export default K8sTerminalSimulator;
