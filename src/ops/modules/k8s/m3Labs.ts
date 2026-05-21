// Interactive 10-step labs for the 12 Module 3 incidents (K8S-INC-3001..3012).
// Reuses the same scripted-console shape the IncidentLabConsole already renders.
// Pure seed data — no shell, no network.

import type { IncidentLab, LabStep, LabStage, LabShell, LabDifficulty } from "./incidentLabs";
import type { AlignedTool } from "./incidentsData";

const s = (
  id: string,
  phase: LabStage,
  tool: AlignedTool,
  shell: LabShell,
  title: string,
  why: string,
  command: string,
  expected_output: string,
  success_check: string,
  hint: string,
): LabStep => ({ id, phase, tool, shell, title, why, command, expected_output, success_check, hint });

interface M3Spec {
  objective: string;
  difficulty: LabDifficulty;
  minutes: number;
  concept: string;
  primary_tool: AlignedTool;
  // 8 of the 10 steps are scenario-specific; first (plan) and last (recover) are templated.
  steps: {
    observe: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    inspect: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    events:  { cmd: string; out: string; check: string; hint: string };
    runtime: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    rootcause: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    fix:     { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    verify:  { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
    metric:  { cmd: string; out: string; check: string; hint: string };
  };
}

function lab(spec: M3Spec): IncidentLab {
  const T = spec.primary_tool;
  return {
    objective: spec.objective,
    prerequisites: ["kubectl context = lab-cluster", "RBAC: cluster-admin (lab-only)"],
    estimated_minutes: spec.minutes,
    difficulty: spec.difficulty,
    steps: [
      s("s1", "plan", T, "bash",
        "Read the alert & form a hypothesis",
        `Concept under test: ${spec.concept}. State the hypothesis before running anything.`,
        "echo 'Hypothesis: ' && date -u",
        `Hypothesis:\n${new Date().toUTCString()}`,
        "hypothesis stated",
        "Triage = hypothesis-driven. Writing it down stops you chasing the wrong thread."),
      s("s2", "observe", T, "kubectl",
        "Reproduce / see the symptom",
        "Run the exact command from the alert so you anchor on the same signal on-call did.",
        spec.steps.observe.cmd, spec.steps.observe.out, spec.steps.observe.check, spec.steps.observe.hint),
      s("s3", "triage", spec.steps.inspect.tool, spec.steps.inspect.shell,
        "Inspect the failing object",
        "Drop one layer below the symptom — read the resource itself.",
        spec.steps.inspect.cmd, spec.steps.inspect.out, spec.steps.inspect.check, spec.steps.inspect.hint),
      s("s4", "observe", "kubectl", "kubectl",
        "Read the Events stream",
        "Events are how Kubernetes narrates failure. Hidden by `get`; revealed by `describe` or `get events`.",
        spec.steps.events.cmd, spec.steps.events.out, spec.steps.events.check, spec.steps.events.hint),
      s("s5", "triage", spec.steps.runtime.tool, spec.steps.runtime.shell,
        "Drop to the runtime layer",
        "When user-space looks ambiguous, prove it at the kubelet / containerd / kernel layer.",
        spec.steps.runtime.cmd, spec.steps.runtime.out, spec.steps.runtime.check, spec.steps.runtime.hint),
      s("s6", "triage", spec.steps.rootcause.tool, spec.steps.rootcause.shell,
        "Identify root cause",
        "Connect the symptom to the broken mechanism (scheduler predicate / probe / quota / finalizer).",
        spec.steps.rootcause.cmd, spec.steps.rootcause.out, spec.steps.rootcause.check, spec.steps.rootcause.hint),
      s("s7", "fix", spec.steps.fix.tool, spec.steps.fix.shell,
        "Apply the minimum fix",
        "Smallest possible change that resolves the failure — anything bigger is a refactor.",
        spec.steps.fix.cmd, spec.steps.fix.out, spec.steps.fix.check, spec.steps.fix.hint),
      s("s8", "verify", spec.steps.verify.tool, spec.steps.verify.shell,
        "Verify recovery",
        "Don't trust 'looks OK' — read the metric or status that originally fired.",
        spec.steps.verify.cmd, spec.steps.verify.out, spec.steps.verify.check, spec.steps.verify.hint),
      s("s9", "observe", "Prometheus", "bash",
        "Confirm the alert clears",
        "Backend metric is the SRE-developer contract. It must show green.",
        spec.steps.metric.cmd, spec.steps.metric.out, spec.steps.metric.check, spec.steps.metric.hint),
      s("s10", "recover", "GitHub Actions", "bash",
        "Land a regression guard",
        "Bake the failure into CI / OPA / kube-linter so the next person never gets paged for this.",
        "echo '- name: regression\n  run: ./tests/regression.sh' >> .github/workflows/ci.yml",
        `(appended)`,
        "CI guard added",
        "Postmortems without preventive controls don't count."),
    ],
  };
}

// =============================================================================

const LAB_3001 = lab({
  objective: "Resolve a Pending pod caused by oversized memory.requests by right-sizing the workload.",
  difficulty: "intermediate", minutes: 16, concept: "Scheduler predicates", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n orders get pods -l app=orders-api",
      out: `NAME                       READY   STATUS    RESTARTS   AGE\norders-api-7d4f-xkqz2      0/1     Pending   0          12m\norders-api-7d4f-pmnq8      0/1     Pending   0          12m`,
      check: "Pending visible", hint: "Pending = scheduler hasn't picked a node yet." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n orders describe pod orders-api-7d4f-xkqz2 | sed -n '/Events/,$p'",
      out: `Events:\n  Type     Reason             Age   From               Message\n  Warning  FailedScheduling   12m   default-scheduler  0/11 nodes available: 9 Insufficient memory, 2 node(s) had untolerated taint`,
      check: "Insufficient memory", hint: "Scheduler tells you the exact predicate that failed per node category." },
    events: {
      cmd: "kubectl get events -A --field-selector reason=FailedScheduling --sort-by=.lastTimestamp | tail -5",
      out: `orders   2m   Warning   FailedScheduling   pod/orders-api-7d4f-xkqz2   0/11 nodes available: 9 Insufficient memory`,
      check: "event listed", hint: "Always sort events — most recent at the bottom." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl describe node ip-10-4-12-7 | grep -A6 Allocated",
      out: `Allocated resources:\n  Resource         Requests       Limits\n  cpu              3500m (87%)    7000m (175%)\n  memory           6.8Gi (95%)    13Gi (181%)`,
      check: "memory > 90%", hint: "Allocated.requests is what scheduler subtracts from allocatable." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n orders get deploy orders-api -o jsonpath='{.spec.template.spec.containers[*].resources}'",
      out: `{"requests":{"memory":"4Gi","cpu":"500m"},"limits":{"memory":"4Gi","cpu":"1"}}`,
      check: "requests.memory=4Gi", hint: "4Gi request > 1Gi free on every Ready node = no candidates." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n orders set resources deploy/orders-api --requests=memory=1.5Gi,cpu=250m --limits=memory=2Gi,cpu=1",
      out: `deployment.apps/orders-api resource requirements updated`,
      check: "deployment updated", hint: "Set requests to p95 actual usage; limits add ~30% headroom." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n orders get pods -l app=orders-api -w | head -4",
      out: `orders-api-9f8c-aaaa   0/1   ContainerCreating   0   3s\norders-api-9f8c-aaaa   1/1   Running             0   12s`,
      check: "Running visible", hint: "ContainerCreating → Running within ~15s on healthy nodes." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_pod_status_phase{phase=\"Pending\",namespace=\"orders\"}'",
      out: `(no rows)`, check: "no rows", hint: "Empty result = no Pending pods left." },
  },
});

const LAB_3002 = lab({
  objective: "Diagnose a CrashLoopBackOff using --previous logs and restore the missing Secret.",
  difficulty: "beginner", minutes: 12, concept: "Pod lifecycle & restart backoff", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n checkout get pods -l app=checkout-svc",
      out: `NAME                    READY   STATUS             RESTARTS   AGE\ncheckout-svc-7f-xkqz2   0/1     CrashLoopBackOff   11 (44s)   6m`,
      check: "CrashLoopBackOff", hint: "CLBO = the container has crashed repeatedly and kubelet is waiting." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n checkout logs checkout-svc-7f-xkqz2 --previous --tail=10",
      out: `panic: dial tcp: lookup db.checkout.svc.cluster.local on 10.96.0.10:53: no such host\ngoroutine 1 [running]: main.main() /src/main.go:42`,
      check: "panic visible", hint: "--previous reads the last failed container; the running attempt may have no logs yet." },
    events: {
      cmd: "kubectl -n checkout describe pod checkout-svc-7f-xkqz2 | sed -n '/Events/,$p' | head -10",
      out: `Events:\n  Warning  BackOff   30s  kubelet  Back-off restarting failed container`,
      check: "BackOff event", hint: "kubelet documents every restart attempt with a BackOff event." },
    runtime: { tool: "crictl", shell: "crictl",
      cmd: "crictl ps -a --name checkout-svc",
      out: `CONTAINER ID  IMAGE                          STATE   NAME\nabc1234abcd   ghcr.io/acme/checkout:3.2.1   Exited  checkout-svc`,
      check: "State=Exited", hint: "crictl shows the same exit at the runtime level — kubelet isn't lying." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n checkout get secret db-credentials -o name 2>&1",
      out: `Error from server (NotFound): secrets "db-credentials" not found`,
      check: "NotFound", hint: "App's envFrom referenced a Secret that doesn't exist in this namespace." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n checkout create secret generic db-credentials --from-literal=DATABASE_URL=postgres://checkout:hunter2@db:5432/checkout",
      out: `secret/db-credentials created`,
      check: "secret created", hint: "Real fix: sync from your secret store (Vault, ESO). Literal value is lab-only." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n checkout delete pod -l app=checkout-svc && kubectl -n checkout wait --for=condition=Ready pod -l app=checkout-svc --timeout=60s",
      out: `pod "checkout-svc-7f-xkqz2" deleted\npod/checkout-svc-9d-abcde condition met`,
      check: "Ready condition met", hint: "Delete to bypass kubelet's 5-min CrashLoopBackOff cooldown." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_pod_container_status_waiting_reason{reason=\"CrashLoopBackOff\",namespace=\"checkout\"}'",
      out: `(no rows)`, check: "no rows", hint: "No CLBO reason = pod is happy." },
  },
});

const LAB_3003 = lab({
  objective: "Restore image pulls from a private registry by re-issuing the imagePullSecret.",
  difficulty: "intermediate", minutes: 14, concept: "imagePullSecrets & CRI pull", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n payments get pods -l app=fraud-engine",
      out: `NAME                    READY   STATUS              RESTARTS   AGE\nfraud-engine-7c-xkqz2   0/1     ImagePullBackOff    0          9m`,
      check: "ImagePullBackOff", hint: "IPBO = the registry refused at least one pull attempt." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n payments describe pod fraud-engine-7c-xkqz2 | grep -A2 Failed",
      out: `  Warning  Failed   1m  kubelet  Failed to pull image "ghcr.io/acme/fraud:2.4.0": unauthorized`,
      check: "unauthorized", hint: "Distinguishes 401 (auth) from 404 (typo) from 429 (rate limit)." },
    events: {
      cmd: "kubectl -n payments get events --field-selector reason=Failed --sort-by=.lastTimestamp | tail -3",
      out: `1m  Warning  Failed  pod/fraud-engine-7c-xkqz2  Error: ImagePullBackOff`,
      check: "Failed event", hint: "Events corroborate the describe output." },
    runtime: { tool: "crictl", shell: "crictl",
      cmd: "crictl pull ghcr.io/acme/fraud:2.4.0",
      out: `FATA[0001] pulling image: rpc error: code = Unknown desc = unauthorized`,
      check: "unauthorized at CRI", hint: "Reproducing at the CRI level proves it's not a kubelet bug." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n payments get secret ghcr-pull -o jsonpath='{.data..dockerconfigjson}' | base64 -d | jq .auths",
      out: `{\n  "ghcr.io": { "auth": "Z2hzX0V4cElyZWQ=" }\n}`,
      check: "auth string present", hint: "Decoded auth string = base64(username:token). Token is expired." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n payments create secret docker-registry ghcr-pull --docker-server=ghcr.io --docker-username=acme-bot --docker-password=$GHCR_PAT --dry-run=client -o yaml | kubectl apply -f -",
      out: `secret/ghcr-pull configured`,
      check: "secret configured", hint: "PAT must have read:packages. Verify the scope in GitHub UI." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n payments delete pod -l app=fraud-engine && kubectl -n payments wait --for=condition=Ready pod -l app=fraud-engine --timeout=90s",
      out: `pod "fraud-engine-7c-xkqz2" deleted\npod/fraud-engine-9d-abcde condition met`,
      check: "Ready", hint: "Delete bypasses kubelet's image-pull backoff timer." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'sum(kube_pod_container_status_waiting_reason{reason=\"ImagePullBackOff\"})'",
      out: `0`, check: "= 0", hint: "Zero IPBO pods cluster-wide." },
  },
});

const LAB_3004 = lab({
  objective: "Recover a NotReady node by restarting containerd then kubelet (in that order).",
  difficulty: "advanced", minutes: 18, concept: "Node heartbeat & PLEG", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl get nodes",
      out: `NAME            STATUS     ROLES    AGE   VERSION\nip-10-4-12-7    NotReady   <none>   13d   v1.29.2\nip-10-4-12-8    Ready      <none>   13d   v1.29.2`,
      check: "NotReady", hint: "NotReady = kubelet stopped heart-beating ≥ 40s ago." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl describe node ip-10-4-12-7 | grep -A4 Conditions",
      out: `Conditions:\n  Type            Status  Reason             Message\n  Ready           False   KubeletNotReady    PLEG is not healthy: pleg was last seen active 4m ago`,
      check: "PLEG not healthy", hint: "PLEG stall = runtime is hung, not kubelet itself." },
    events: {
      cmd: "kubectl get events -A --field-selector involvedObject.name=ip-10-4-12-7 --sort-by=.lastTimestamp | tail -3",
      out: `4m  Normal  NodeNotReady   Node ip-10-4-12-7 status is now: NodeNotReady`,
      check: "NodeNotReady event", hint: "node-controller writes one Event per condition flip." },
    runtime: { tool: "journalctl", shell: "bash",
      cmd: "ssh ip-10-4-12-7 sudo journalctl -u kubelet -n 30 --no-pager",
      out: `kubelet[1842]: E PLEG: skipping pod sync, container runtime not ready: container runtime status check may not have completed yet`,
      check: "PLEG error in journal", hint: "If kubelet logs are silent, kubelet itself crashed — different bug." },
    rootcause: { tool: "containerd", shell: "bash",
      cmd: "ssh ip-10-4-12-7 sudo systemctl status containerd",
      out: `* containerd.service - containerd container runtime\n     Active: failed (Result: exit-code) since ${new Date(Date.now() - 4 * 60_000).toUTCString()}`,
      check: "containerd failed", hint: "kubelet was right — runtime is dead." },
    fix: { tool: "containerd", shell: "bash",
      cmd: "ssh ip-10-4-12-7 'sudo systemctl restart containerd && sudo systemctl restart kubelet'",
      out: `(no output)`, check: "both restarted", hint: "containerd FIRST, then kubelet — kubelet caches the CRI socket on startup." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl get node ip-10-4-12-7 -o jsonpath='{.status.conditions[?(@.type==\"Ready\")].status}'",
      out: `True`, check: "Ready=True", hint: "Should flip within 30s of kubelet posting its first heartbeat." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_node_status_condition{condition=\"Ready\",status=\"false\"}'",
      out: `(no rows)`, check: "no rows", hint: "Zero NotReady nodes cluster-wide." },
  },
});

const LAB_3005 = lab({
  objective: "Diagnose a containerd crash via journalctl, reclaim disk, and bring the runtime back.",
  difficulty: "advanced", minutes: 22, concept: "kubelet → containerd → runc hierarchy", primary_tool: "containerd",
  steps: {
    observe: { tool: "crictl", shell: "crictl",
      cmd: "ssh ip-10-3-21-44 sudo crictl ps",
      out: `FATA[0000] connect endpoint 'unix:///run/containerd/containerd.sock': connection refused`,
      check: "connection refused", hint: "crictl can't reach the runtime socket = containerd is down." },
    inspect: { tool: "containerd", shell: "bash",
      cmd: "ssh ip-10-3-21-44 sudo systemctl status containerd",
      out: `* containerd.service\n     Active: failed (Result: exit-code) — Main process exited, code=exited, status=1/FAILURE`,
      check: "Active: failed", hint: "systemctl tells you whether the runtime is alive in one line." },
    events: {
      cmd: "kubectl get events -A | grep ip-10-3-21-44 | tail -3",
      out: `7m  Normal  NodeNotReady   Node ip-10-3-21-44 status is now: NodeNotReady`,
      check: "NodeNotReady", hint: "Runtime death cascades into a Node condition flip." },
    runtime: { tool: "journalctl", shell: "bash",
      cmd: "ssh ip-10-3-21-44 sudo journalctl -u containerd -n 15 --no-pager",
      out: `containerd[1842]: panic: failed to open snapshotter: no space left on device\nsystemd: containerd.service: Main process exited, code=exited, status=1`,
      check: "panic + ENOSPC", hint: "Always look for panic/ENOSPC/OOM in runtime logs first." },
    rootcause: { tool: "containerd", shell: "bash",
      cmd: "ssh ip-10-3-21-44 sudo df -h /var/lib/containerd",
      out: `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        50G   50G    0  100% /var/lib/containerd`,
      check: "Use% = 100", hint: "Snapshotter ENOSPC is almost always /var/lib/containerd full." },
    fix: { tool: "containerd", shell: "bash",
      cmd: "ssh ip-10-3-21-44 'sudo crictl rmi --prune && sudo systemctl restart containerd kubelet'",
      out: `Removed image sha256:9f2c… (1.4GB)\nRemoved image sha256:abcd… (820MB)\n(no output from systemctl)`,
      check: "images removed + units restarted", hint: "crictl rmi --prune deletes only unreferenced images — safe." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl get node ip-10-3-21-44",
      out: `NAME            STATUS   ROLES    AGE   VERSION\nip-10-3-21-44   Ready    <none>   13d   v1.29.2`,
      check: "Ready", hint: "Node should rejoin within 30-60s." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'node_filesystem_avail_bytes{mountpoint=\"/var/lib/containerd\"} > 5*1024*1024*1024'",
      out: `1`, check: "≥ 5GiB free", hint: "Always leave > 10% headroom on runtime disks." },
  },
});

const LAB_3006 = lab({
  objective: "Stop OOMKills by raising the memory limit AND aligning the JVM heap.",
  difficulty: "intermediate", minutes: 14, concept: "cgroups memory.max & QoS", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n search get pods -l app=search-api",
      out: `NAME                READY  STATUS    RESTARTS   AGE\nsearch-api-7f-abc   1/1    Running   11 (44s)   30m`,
      check: "RESTARTS=11", hint: "High restart count on a 'Running' pod = something is killing it." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n search describe pod search-api-7f-abc | grep -A4 'Last State'",
      out: `    Last State:     Terminated\n      Reason:       OOMKilled\n      Exit Code:    137`,
      check: "Reason=OOMKilled", hint: "Exit 137 + Reason=OOMKilled = the cgroup OOM-killer fired." },
    events: {
      cmd: "kubectl -n search get events --sort-by=.lastTimestamp | tail -3",
      out: `1m  Warning  OOMKilling  pod/search-api-7f-abc  Memory cgroup out of memory`,
      check: "OOMKilling event", hint: "kubelet emits OOMKilling for every cgroup kill." },
    runtime: { tool: "journalctl", shell: "bash",
      cmd: "ssh $(kubectl get pod search-api-7f-abc -o jsonpath={.spec.nodeName}) sudo dmesg --since '5 min ago' | grep -i oom",
      out: `kernel: Memory cgroup out of memory: Killed process 18342 (java) total-vm:1.2GB`,
      check: "memcg OOM in dmesg", hint: "Kernel is the authoritative source — kubelet just reports what dmesg said." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n search get deploy search-api -o jsonpath='{.spec.template.spec.containers[0].resources}'",
      out: `{"requests":{"memory":"512Mi"},"limits":{"memory":"512Mi"}}`,
      check: "limit=512Mi", hint: "JVM -Xmx=512m + cgroup limit=512Mi leaves no room for Metaspace / native." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n search set resources deploy/search-api --limits=memory=1Gi --requests=memory=768Mi && kubectl -n search set env deploy/search-api JAVA_OPTS='-XX:MaxRAMPercentage=75'",
      out: `deployment.apps/search-api resource requirements updated\ndeployment.apps/search-api env updated`,
      check: "limit=1Gi + MaxRAMPercentage", hint: "Let the JVM compute its heap as a % of the cgroup limit instead of hard-coding -Xmx." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n search rollout status deploy/search-api && kubectl -n search top pod -l app=search-api",
      out: `deployment "search-api" successfully rolled out\nNAME               CPU(cores)  MEMORY(bytes)\nsearch-api-9d-abc  120m        612Mi`,
      check: "memory < limit", hint: "Steady-state RSS should sit ≥ 25% below the limit." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'increase(container_oom_events_total{pod=~\"search-api.*\"}[10m])'",
      out: `0`, check: "= 0", hint: "Zero OOM events in the last 10 minutes." },
  },
});

const LAB_3007 = lab({
  objective: "Restore a Service that has zero endpoints by aligning the selector with pod labels.",
  difficulty: "beginner", minutes: 10, concept: "Service selectors & EndpointSlice", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa get svc billing-api && kubectl -n qa get endpoints billing-api",
      out: `NAME          TYPE        CLUSTER-IP      PORT(S)   AGE\nbilling-api   ClusterIP   10.96.142.31    8080/TCP  14h\nNAME          ENDPOINTS   AGE\nbilling-api   <none>      14h`,
      check: "<none> endpoints", hint: "Service exists, zero backends — classic selector mismatch." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa get svc billing-api -o jsonpath='{.spec.selector}'",
      out: `{"app":"billing"}`, check: "selector=app:billing", hint: "Capture the exact selector for the next step." },
    events: {
      cmd: "kubectl -n qa get pods --show-labels | head -3",
      out: `NAME                     READY   STATUS    RESTARTS   AGE   LABELS\nbilling-api-7c98f-abcd   1/1     Running   0          14h   app=billing-api`,
      check: "pod label != selector", hint: "Pod label is app=billing-api, selector is app=billing — off by one." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa get endpointslice -l kubernetes.io/service-name=billing-api -o jsonpath='{.items[*].endpoints}'",
      out: ``, check: "empty array", hint: "EndpointSlice empty confirms the selector matches zero pods." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa get pods -l app=billing -o name | wc -l",
      out: `0`, check: "0 matches", hint: "Confirms the selector matches no pods at all." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa patch svc billing-api -p '{\"spec\":{\"selector\":{\"app\":\"billing-api\"}}}'",
      out: `service/billing-api patched`,
      check: "patched", hint: "Pick whichever side is canonical — the pod label or the selector — and align the other." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n qa get endpoints billing-api",
      out: `NAME          ENDPOINTS         AGE\nbilling-api   10.244.1.5:8080   14h`,
      check: "endpoint IP listed", hint: "If still <none>, double-check pod readiness — only Ready pods land in endpoints." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_endpoint_address_available{endpoint=\"billing-api\"}'",
      out: `1`, check: "≥ 1", hint: "At least one address available = Service is reachable." },
  },
});

const LAB_3008 = lab({
  objective: "Roll back a broken CoreDNS Corefile and restore cluster DNS.",
  difficulty: "intermediate", minutes: 12, concept: "CoreDNS & cluster service discovery", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n kube-system get pods -l k8s-app=kube-dns",
      out: `NAME              READY   STATUS             RESTARTS   AGE\ncoredns-5d6-aaa   1/1     Running            0          14d\ncoredns-5d6-bbb   0/1     CrashLoopBackOff   7          5m`,
      check: "1 CLBO", hint: "Even one bad CoreDNS pod halves cluster DNS capacity." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n kube-system logs coredns-5d6-bbb --tail=5",
      out: `[FATAL] plugin/forward: no upstreams configured`,
      check: "FATAL plugin", hint: "FATAL on startup = Corefile syntax / plugin error." },
    events: {
      cmd: "kubectl -n kube-system get events --field-selector involvedObject.name=coredns-5d6-bbb | tail -3",
      out: `2m  Warning  Unhealthy  pod/coredns-5d6-bbb  Liveness probe failed: HTTP probe failed`,
      check: "Liveness failed", hint: "Liveness restarts the container, accelerating the crash loop." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl run -it --rm dns-test --image=busybox --restart=Never -- nslookup kubernetes.default 2>&1 | head -6",
      out: `Server:    10.96.0.10\nAddress:   10.96.0.10:53\n\n** server can't find kubernetes.default: SERVFAIL`,
      check: "SERVFAIL", hint: "Reproducing from a sidecar pod proves the cluster sees it too." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n kube-system get cm coredns -o jsonpath='{.data.Corefile}' | grep -A2 forward",
      out: `        forward .\n        cache 30`, check: "forward has no upstream", hint: "`forward .` needs at least one upstream resolver like /etc/resolv.conf." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n kube-system rollout undo deploy/coredns",
      out: `deployment.apps/coredns rolled back`,
      check: "rolled back", hint: "Roll back first, fix the Corefile properly in Git afterwards." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl run -it --rm dns-test --image=busybox --restart=Never -- nslookup kubernetes.default 2>&1 | head -4",
      out: `Server:    10.96.0.10\nName:      kubernetes.default.svc.cluster.local\nAddress:   10.96.0.1`,
      check: "Address line", hint: "Successful resolution = CoreDNS healthy." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'rate(coredns_dns_responses_total{rcode=\"SERVFAIL\"}[5m])'",
      out: `0`, check: "= 0", hint: "Zero SERVFAILs in last 5 min = green." },
  },
});

const LAB_3009 = lab({
  objective: "Restore /api routing by adding the missing Ingress path rule.",
  difficulty: "beginner", minutes: 10, concept: "Ingress L7 routing", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "curl -sI https://shop.acme.com/api/v1/products | head -1",
      out: `HTTP/2 404`, check: "404", hint: "404 on a known path = ingress doesn't know about it." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n web get ingress shop-ingress -o jsonpath='{.spec.rules[0].http.paths[*].path}'",
      out: `/`, check: "only / path", hint: "Only / is configured — /api was lost." },
    events: {
      cmd: "kubectl -n ingress-nginx logs deploy/ingress-nginx-controller --tail=5 | grep 404",
      out: `2024/05/21 10:14:22 "GET /api/v1/products" 404 — no upstream`,
      check: "404 in nginx log", hint: "Controller logs corroborate the missing rule." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n web get svc api-svc -o jsonpath='{.spec.clusterIP}{\":\"}{.spec.ports[0].port}'",
      out: `10.96.55.7:8080`, check: "Service exists", hint: "Confirm the upstream Service is healthy before fixing the ingress." },
    rootcause: { tool: "Helm", shell: "bash",
      cmd: "helm -n web get values shop | grep -A3 ingress",
      out: `ingress:\n  paths:\n  - /`,
      check: "values missing /api", hint: "Helm values dropped /api during the upgrade." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n web patch ingress shop-ingress --type=json -p '[{\"op\":\"add\",\"path\":\"/spec/rules/0/http/paths/-\",\"value\":{\"path\":\"/api\",\"pathType\":\"Prefix\",\"backend\":{\"service\":{\"name\":\"api-svc\",\"port\":{\"number\":8080}}}}}]'",
      out: `ingress.networking.k8s.io/shop-ingress patched`,
      check: "patched", hint: "Fix Helm values in Git after the hotfix so it survives the next upgrade." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "curl -sI https://shop.acme.com/api/v1/products | head -1",
      out: `HTTP/2 200`, check: "200", hint: "If still 404, controller may need a config reload — check logs." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'rate(nginx_ingress_controller_requests{status=\"404\",path=~\"/api.*\"}[1m])'",
      out: `0`, check: "= 0", hint: "Zero 404s on /api = routing works." },
  },
});

const LAB_3010 = lab({
  objective: "Unblock a rolling update by adding a startupProbe and tuning readiness.",
  difficulty: "intermediate", minutes: 15, concept: "Liveness, readiness, startup probes", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce rollout status deploy/orders-api --timeout=10s",
      out: `Waiting for deployment "orders-api" rollout to finish: 2 of 6 updated replicas are available...\nerror: timed out`,
      check: "rollout stuck", hint: "rollout status with a tight timeout is the cheapest way to detect a stall." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce get pods -l app=orders-api -o wide",
      out: `NAME                  READY   STATUS    RESTARTS   AGE\norders-api-8d4-q11m   0/1     Running   0          3m`,
      check: "READY 0/1", hint: "Running but not Ready = readiness probe failing." },
    events: {
      cmd: "kubectl -n commerce describe pod orders-api-8d4-q11m | grep -A2 Readiness",
      out: `  Warning  Unhealthy   kubelet  Readiness probe failed: HTTP probe failed with statuscode: 503`,
      check: "Readiness 503", hint: "kubelet documents every probe failure as an event." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce logs orders-api-8d4-q11m --tail=3",
      out: `[migrations] running V37__add_index ... (84s elapsed)\n[migrations] still working ...`,
      check: "migration running", hint: "App is alive but not yet serving traffic." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce get deploy orders-api -o jsonpath='{.spec.template.spec.containers[0].readinessProbe}'",
      out: `{"httpGet":{"path":"/healthz","port":8080},"initialDelaySeconds":10,"periodSeconds":5}`,
      check: "initialDelay=10", hint: "Migration takes 90s — probe starts checking at 10s. Failure inevitable." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce patch deploy orders-api --type=json -p '[{\"op\":\"add\",\"path\":\"/spec/template/spec/containers/0/startupProbe\",\"value\":{\"httpGet\":{\"path\":\"/healthz\",\"port\":8080},\"failureThreshold\":30,\"periodSeconds\":5}}]'",
      out: `deployment.apps/orders-api patched`,
      check: "patched", hint: "startupProbe pauses liveness+readiness for up to 150s — exactly what a slow migration needs." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n commerce rollout status deploy/orders-api --timeout=180s",
      out: `Waiting for deployment "orders-api" rollout to finish: 4 of 6 updated...\ndeployment "orders-api" successfully rolled out`,
      check: "successfully rolled out", hint: "All replicas Ready and old RS scaled to zero." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_deployment_status_replicas_unavailable{deployment=\"orders-api\"}'",
      out: `0`, check: "= 0", hint: "Zero unavailable replicas = rollout complete." },
  },
});

const LAB_3011 = lab({
  objective: "Diagnose a ResourceQuota block and bring the namespace back under its cap.",
  difficulty: "beginner", minutes: 10, concept: "Namespaces & ResourceQuota", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics get rs spark-driver -o jsonpath='{.status.conditions[*].message}'",
      out: `pods "spark-driver-..." is forbidden: exceeded quota: compute-quota, requested: requests.memory=60Gi, used: 38Gi, limited: 40Gi`,
      check: "exceeded quota", hint: "ReplicaSet status carries the admission rejection verbatim." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics describe quota compute-quota",
      out: `Name:            compute-quota\nResource         Used   Hard\nrequests.memory  38Gi   40Gi\nrequests.cpu     12     20`,
      check: "Used near Hard", hint: "Used/Hard tells you exactly how much headroom is left." },
    events: {
      cmd: "kubectl -n team-analytics get events --field-selector reason=FailedCreate | tail -3",
      out: `2m  Warning  FailedCreate  replicaset/spark-driver  Error creating: exceeded quota`,
      check: "FailedCreate", hint: "Every blocked admission appears here." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics top pod --containers --sort-by=memory | head -5",
      out: `POD                  NAME       CPU(cores)  MEMORY(bytes)\nspark-exec-abc       executor   500m        4.5Gi\nspark-exec-def       executor   500m        4.5Gi`,
      check: "executors using 4.5Gi each", hint: "Real consumption matters — drives the requests:limits decision." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics get pod -l job=spark -o jsonpath='{range .items[*]}{.metadata.name}{\" \"}{.spec.containers[0].resources.requests.memory}{\"\\n\"}{end}' | head -5",
      out: `spark-exec-abc 6Gi\nspark-exec-def 6Gi\nspark-exec-ghi 6Gi`,
      check: "requests=6Gi", hint: "Job spec asks 6Gi/executor; 60 executors = 360Gi > 40Gi quota." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics scale --replicas=20 deploy/spark-executor && kubectl -n team-analytics patch deploy spark-executor --type=json -p '[{\"op\":\"replace\",\"path\":\"/spec/template/spec/containers/0/resources/requests/memory\",\"value\":\"2Gi\"}]'",
      out: `deployment.apps/spark-executor scaled\ndeployment.apps/spark-executor patched`,
      check: "scaled + patched", hint: "Right-size requests against measured RSS; ask for a quota bump only when justified." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n team-analytics describe quota compute-quota | grep memory",
      out: `requests.memory  36Gi   40Gi`,
      check: "Used < Hard", hint: "Used now under Hard = new pods can be created." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'kube_resourcequota{namespace=\"team-analytics\",resource=\"requests.memory\",type=\"used\"} / kube_resourcequota{namespace=\"team-analytics\",resource=\"requests.memory\",type=\"hard\"}'",
      out: `0.9`, check: "< 1.0", hint: "Ratio < 0.9 is comfortable; > 0.95 = page someone." },
  },
});

const LAB_3012 = lab({
  objective: "Release a pod stuck Terminating by handling its finalizer safely.",
  difficulty: "advanced", minutes: 16, concept: "Graceful shutdown & finalizers", primary_tool: "kubectl",
  steps: {
    observe: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n data get pod ingest-worker",
      out: `NAME            READY   STATUS        RESTARTS   AGE\ningest-worker   1/1     Terminating   0          14h`,
      check: "Terminating", hint: "Terminating for > 5 min ≈ stuck — investigate finalizers." },
    inspect: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n data get pod ingest-worker -o jsonpath='{.metadata.finalizers}'",
      out: `["flink.apache.org/checkpoint"]`,
      check: "finalizer present", hint: "Each finalizer must be cleared by its owning controller." },
    events: {
      cmd: "kubectl -n data get events --field-selector involvedObject.name=ingest-worker | tail -3",
      out: `25m  Normal  Killing  pod/ingest-worker  Stopping container ingest-worker`,
      check: "Killing event 25m ago", hint: "kubelet did its part; the blocker is upstream of kubelet." },
    runtime: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n flink-system get deploy flink-operator",
      out: `Error from server (NotFound): deployments.apps \"flink-operator\" not found`,
      check: "operator missing", hint: "The controller that should remove the finalizer is gone." },
    rootcause: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n data get pod ingest-worker -o jsonpath='{.metadata.deletionTimestamp}'",
      out: `${new Date(Date.now() - 25 * 60_000).toISOString()}`,
      check: "deletionTimestamp set", hint: "deletionTimestamp present + finalizer present + controller missing = stuck." },
    fix: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n data patch pod ingest-worker -p '{\"metadata\":{\"finalizers\":[]}}' --type=merge",
      out: `pod/ingest-worker patched`,
      check: "patched", hint: "DANGER: bypasses cleanup. Only do this when the controller is truly gone — external resources may leak." },
    verify: { tool: "kubectl", shell: "kubectl",
      cmd: "kubectl -n data get pod ingest-worker 2>&1",
      out: `Error from server (NotFound): pods "ingest-worker" not found`,
      check: "NotFound", hint: "NotFound = object gone from etcd. Pod has finally been deleted." },
    metric: {
      cmd: "promtool query instant http://prom:9090 'count(kube_pod_deletion_timestamp{namespace=\"data\"} > 0 and time() - kube_pod_deletion_timestamp > 300)'",
      out: `0`, check: "= 0", hint: "No pods stuck Terminating for > 5 minutes in this namespace." },
  },
});

export const M3_LABS: Record<string, IncidentLab> = {
  "K8S-INC-3001": LAB_3001,
  "K8S-INC-3002": LAB_3002,
  "K8S-INC-3003": LAB_3003,
  "K8S-INC-3004": LAB_3004,
  "K8S-INC-3005": LAB_3005,
  "K8S-INC-3006": LAB_3006,
  "K8S-INC-3007": LAB_3007,
  "K8S-INC-3008": LAB_3008,
  "K8S-INC-3009": LAB_3009,
  "K8S-INC-3010": LAB_3010,
  "K8S-INC-3011": LAB_3011,
  "K8S-INC-3012": LAB_3012,
};
