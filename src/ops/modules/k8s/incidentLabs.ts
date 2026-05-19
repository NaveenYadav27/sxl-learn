// Interactive step-by-step labs for every Module 1 & Module 2 K8s incident.
// Each lab is a scripted Plan → Code → Build → ... → Recover walkthrough that
// the IncidentLabConsole plays in a terminal-style panel. Pure seed data —
// no network, no shell — so it's safe to import anywhere.

import type { AlignedTool } from "./incidentsData";

export type LabShell = "bash" | "powershell" | "kubectl" | "docker" | "crictl";
export type LabDifficulty = "beginner" | "intermediate" | "advanced";
// Lab stages map to the 10 DevOps phases but add `triage`, `fix`, `verify`
// for the explicit incident-response steps a student walks through.
export type LabStage =
  | "plan" | "code" | "build" | "scan" | "push"
  | "deploy" | "schedule" | "run" | "observe"
  | "triage" | "fix" | "verify" | "recover";

export interface LabStep {
  id: string;
  phase: LabStage;
  tool: AlignedTool;
  shell: LabShell;
  title: string;
  why: string;
  command: string;
  expected_output: string;
  success_check: string;
  hint: string;
}

export interface IncidentLab {
  objective: string;
  prerequisites: string[];
  estimated_minutes: number;
  difficulty: LabDifficulty;
  steps: LabStep[];
}

// Compact builder so each lab declaration stays readable.
const s = (
  id: string,
  phase: K8sPhaseId,
  tool: AlignedTool,
  shell: LabShell,
  title: string,
  why: string,
  command: string,
  expected_output: string,
  success_check: string,
  hint: string,
): LabStep => ({ id, phase, tool, shell, title, why, command, expected_output, success_check, hint });

// ============================================================================
// MODULE 1 — Containerization Fundamentals & Docker Architecture
// ============================================================================

const LAB_1032: IncidentLab = {
  objective:
    "Reproduce a host-side OOM kill on a Docker container, prove that cgroups v2 enforced memory.max, and apply a permanent limit.",
  prerequisites: ["Docker Engine ≥ 24", "Linux host with cgroups v2", "Root on lab-docker-01"],
  estimated_minutes: 18,
  difficulty: "intermediate",
  steps: [
    s("s1", "plan", "kubectl", "bash",
      "Read the host-side OOM alert",
      "Triage always starts at the alert: identify host, container, and exit code (137 = SIGKILL by oom-killer).",
      "cat /var/log/shadowxlab/alerts/K8S-INC-1032.json | jq '.subject,.host,.exit_code'",
      `"Container exited 137 — host OOM killer fired"
"lab-docker-01"
137`,
      "exit_code == 137",
      "137 = 128 + 9 (SIGKILL). Always rule out OOM before debugging app logic."),
    s("s2", "code", "Docker", "bash",
      "Inspect the offending Dockerfile",
      "Confirm the workload has no explicit memory limit declared — host defaults will apply.",
      "cat /opt/lab/loadgen/Dockerfile",
      `FROM python:3.12-slim
COPY app.py /app.py
CMD ["python","/app.py"]`,
      "no --memory flag in CMD",
      "Dockerfiles cannot set runtime memory limits — that's a `docker run -m` or K8s `resources.limits` concern."),
    s("s3", "build", "Docker", "docker",
      "Build the image",
      "Reproduce the deploy artifact exactly as CI does so the bug is faithful.",
      "docker build -t loadgen:lab .",
      `[+] Building 4.2s (7/7) FINISHED
 => exporting to image
 => => writing image sha256:9b1c…
 => => naming to docker.io/library/loadgen:lab`,
      "image tagged loadgen:lab",
      "Always reproduce in a clean tag (`:lab`) so you don't poison `:latest`."),
    s("s4", "deploy", "Docker", "docker",
      "Run the container with a 64 MiB cap",
      "Forcing memory.max=64M makes the OOM deterministic and observable.",
      "docker run -d --name loadgen --memory=64m --memory-swap=64m loadgen:lab",
      `9b1c4f7e2a8d1c…`,
      "container ID printed",
      "--memory-swap=--memory disables swap, so OOM fires fast and clearly."),
    s("s5", "run", "Docker", "docker",
      "Watch memory grow in real time",
      "`docker stats` reads cgroup memory.current — proves where the kernel sees the workload.",
      "docker stats loadgen --no-stream",
      `CONTAINER ID   NAME      CPU %   MEM USAGE / LIMIT   MEM %
9b1c4f7e2a8d   loadgen   42.1%   62.4MiB / 64MiB     97.50%`,
      "MEM % > 90",
      "If MEM% sits at 100% with no error, the kill is imminent."),
    s("s6", "observe", "journalctl", "bash",
      "Read the kernel OOM record",
      "Kernel oom-killer writes a dmesg/journal line — this is the authoritative record.",
      "journalctl -k --since '2 min ago' | grep -i oom",
      `kernel: oom-kill:constraint=CONSTRAINT_MEMCG,task=python,pid=18342
kernel: Memory cgroup out of memory: Killed process 18342 (python) total-vm:128MB`,
      "CONSTRAINT_MEMCG visible",
      "CONSTRAINT_MEMCG = a cgroup hit its limit, not the host. Critical distinction."),
    s("s7", "triage", "Docker", "docker",
      "Inspect the container's exit state",
      "Confirm exit code 137 and OOMKilled=true in Docker's view.",
      "docker inspect loadgen --format '{{.State.ExitCode}} {{.State.OOMKilled}}'",
      `137 true`,
      "OOMKilled=true",
      "If OOMKilled=false but exit=137 — process was killed by something else (operator, systemd, livenessProbe)."),
    s("s8", "fix", "Docker", "docker",
      "Re-run with a realistic limit",
      "Bump the cap and re-launch — proving the fix without changing app code.",
      "docker rm -f loadgen && docker run -d --name loadgen --memory=256m loadgen:lab",
      `loadgen
3c8af2…`,
      "new container ID returned",
      "256m is empirical — derive from `docker stats` peak in a 5-min soak."),
    s("s9", "verify", "Docker", "docker",
      "Validate steady state",
      "After 60 s the container should be RUNNING with mem well under the new cap.",
      "sleep 60 && docker ps --filter name=loadgen --format 'table {{.Names}}\t{{.Status}}'",
      `NAMES     STATUS
loadgen   Up 1 minute`,
      "STATUS = Up …",
      "If status flips to Restarting, raise the limit again or profile the workload."),
    s("s10", "recover", "kubectl", "bash",
      "Codify the fix as a runbook entry",
      "Permanent fix in the platform repo — next time the alert fires, the runbook is one click away.",
      "echo 'loadgen:lab → --memory=256m' >> /opt/runbooks/K8S-INC-1032.md",
      `(no output — file appended)`,
      "runbook updated",
      "Every triage that doesn't end in a runbook update is wasted work."),
  ],
};

const LAB_1033: IncidentLab = {
  objective: "Diagnose `docker` CLI failing because dockerd is dead, repair daemon.json, and restart the engine.",
  prerequisites: ["Root on lab-docker-01", "Docker Engine installed"],
  estimated_minutes: 15,
  difficulty: "beginner",
  steps: [
    s("s1", "plan", "Docker", "bash", "Confirm the symptom",
      "Reproduce the failing CLI call so the failure mode is unambiguous.",
      "docker ps",
      `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`,
      "socket error printed",
      "The CLI is a thin REST client — `docker ps` proves the server is gone, not the client."),
    s("s2", "observe", "Docker", "bash", "Check the unit",
      "systemd is the source of truth for dockerd liveness.",
      "systemctl status docker",
      `× docker.service - Docker Application Container Engine
   Active: failed (Result: exit-code) since … 30s ago`,
      "Active: failed",
      "Failed unit + Result=exit-code → daemon crashed at startup, not after."),
    s("s3", "observe", "journalctl", "bash", "Read the journal",
      "journalctl carries dockerd's stderr; the actual JSON parse error lives here.",
      "journalctl -u docker -n 20 --no-pager",
      `dockerd[2117]: failed to load daemon config: invalid character 'r' looking for beginning of object key string
systemd: docker.service: Failed with result 'exit-code'.`,
      "JSON parse error printed",
      "‘invalid character’ always points to daemon.json — JSON syntax."),
    s("s4", "triage", "Docker", "bash", "Inspect daemon.json",
      "Look for the trailing comma / unquoted key that the kernel parser barfed on.",
      "cat /etc/docker/daemon.json",
      `{
  "log-driver": "json-file",
  registry-mirrors: ["https://mirror.local"]
}`,
      "unquoted key visible",
      "JSON keys must be quoted. ‘registry-mirrors’ here is bare → parse failure."),
    s("s5", "code", "Docker", "bash", "Validate fixed JSON with jq",
      "Always lint daemon.json before restart — saves a second outage.",
      "echo '{\"log-driver\":\"json-file\",\"registry-mirrors\":[\"https://mirror.local\"]}' | jq .",
      `{
  "log-driver": "json-file",
  "registry-mirrors": ["https://mirror.local"]
}`,
      "jq prints valid JSON",
      "jq returns exit 0 only when the input parses cleanly."),
    s("s6", "fix", "Docker", "bash", "Replace the file",
      "Atomic write so dockerd never sees a half-written file.",
      "sudo tee /etc/docker/daemon.json <<<'{\"log-driver\":\"json-file\",\"registry-mirrors\":[\"https://mirror.local\"]}'",
      `{"log-driver":"json-file","registry-mirrors":["https://mirror.local"]}`,
      "file written",
      "Use `tee` not `>` when sudo is needed; redirection happens as your user."),
    s("s7", "fix", "Docker", "bash", "Restart the daemon",
      "Bring dockerd back. systemd will create /var/run/docker.sock on success.",
      "sudo systemctl restart docker && systemctl is-active docker",
      `active`,
      "is-active == active",
      "If still failed → journalctl again. Don't loop restart blindly."),
    s("s8", "verify", "Docker", "bash", "Prove the CLI works",
      "docker info round-trips through the socket → end-to-end health check.",
      "docker info --format '{{.ServerVersion}} ({{.OperatingSystem}})'",
      `24.0.7 (Ubuntu 22.04)`,
      "version string returned",
      "If you see ‘Cannot connect’ again — socket perms (group docker)."),
    s("s9", "observe", "crictl", "crictl", "Confirm containerd was untouched",
      "Proves the runtime stack is layered: dockerd died, containerd kept running.",
      "crictl --runtime-endpoint unix:///run/containerd/containerd.sock ps -a | head",
      `CONTAINER     IMAGE         CREATED        STATE
6df1e2a…      pause:3.9     2 hours ago    Running`,
      "containerd lists containers",
      "Kubernetes nodes use containerd directly — they survive dockerd outages."),
    s("s10", "recover", "GitHub Actions", "bash", "Add a CI guard",
      "Lint daemon.json in CI to prevent regression of this exact incident.",
      "echo 'jq . /etc/docker/daemon.json' >> .github/workflows/lint-host.sh",
      `(appended)`,
      "guard added",
      "Every postmortem ships a test that would have caught it."),
  ],
};

const LAB_1034: IncidentLab = {
  objective: "Hit the PID namespace cap on a container, observe EAGAIN, and raise pids.max.",
  prerequisites: ["lab-docker-01", "stress-ng image"],
  estimated_minutes: 14,
  difficulty: "intermediate",
  steps: [
    s("s1", "plan", "Docker", "docker", "Launch the stress worker",
      "Reproduce by forking ~300 procs inside a container capped at 200.",
      "docker run -d --name stress-worker --pids-limit=200 alpine sh -c 'while :; do sleep 60 & done'",
      `4f1a8b2c9d…`,
      "container ID printed",
      "--pids-limit caps the cgroup pids controller."),
    s("s2", "run", "Docker", "docker", "Watch the PID count climb",
      "docker stats reads cgroup pids.current — direct view of the limit.",
      "docker stats stress-worker --no-stream --format '{{.PIDs}}'",
      `200`,
      "PIDs == 200",
      "Once at cap, every fork() returns EAGAIN."),
    s("s3", "observe", "Docker", "docker", "Read the container logs",
      "The application sees fork failures as ‘Resource temporarily unavailable’.",
      "docker logs stress-worker 2>&1 | tail -3",
      `sh: fork: Resource temporarily unavailable
sh: fork: Resource temporarily unavailable
sh: fork: Resource temporarily unavailable`,
      "EAGAIN visible",
      "EAGAIN at fork() = pids cgroup or RLIMIT_NPROC."),
    s("s4", "triage", "runc", "bash", "Inspect the cgroup directly",
      "Go below Docker to the kernel — read pids.current vs pids.max.",
      "cat /sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' stress-worker).scope/pids.{current,max}",
      `200
200`,
      "current == max",
      "On cgroup v1, path is /sys/fs/cgroup/pids/docker/<id>/."),
    s("s5", "observe", "journalctl", "bash", "Confirm no kernel pressure",
      "Rule out a global PID exhaustion before changing limits.",
      "cat /proc/sys/kernel/pid_max && cat /proc/loadavg",
      `4194304
0.42 0.31 0.20 2/247 18900`,
      "pid_max ≫ container limit",
      "If pid_max is the bottleneck, the fix is sysctl, not --pids-limit."),
    s("s6", "fix", "Docker", "docker", "Raise the cap live",
      "`docker update` writes the new cgroup limit without restart.",
      "docker update --pids-limit=400 stress-worker",
      `stress-worker`,
      "container name echoed",
      "Use --pids-limit=-1 for unlimited (rarely a good idea)."),
    s("s7", "verify", "Docker", "docker", "Confirm new ceiling",
      "Re-read pids.max — proves the runtime accepted the change.",
      "cat /sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' stress-worker).scope/pids.max",
      `400`,
      "pids.max == 400",
      "If still 200, your container uses a different cgroup driver — restart engine."),
    s("s8", "observe", "Docker", "docker", "Watch fork errors stop",
      "Log line cadence drops to zero — the smoking gun goes silent.",
      "docker logs --since 30s stress-worker | grep -c fork",
      `0`,
      "0 new fork errors",
      "Always validate by the *absence* of the error, not by ‘looks OK’."),
    s("s9", "code", "Docker", "bash", "Bake limit into daemon defaults",
      "Set a sane org-wide default so new containers inherit safety.",
      "jq '. \"default-ulimits\".nproc={\"Hard\":1024,\"Soft\":1024}' /etc/docker/daemon.json",
      `{
  "default-ulimits": {"nproc": {"Hard":1024,"Soft":1024}}
}`,
      "JSON updated",
      "ulimits and --pids-limit are independent layers; set both."),
    s("s10", "recover", "Prometheus", "bash", "Alert on pids saturation",
      "Add a rule so we see this *before* an app fails to fork.",
      "echo 'ALERT PidsSaturated IF container_pids_current/container_pids_limit>0.9 FOR 5m' >> alerts.rules",
      `(rule appended)`,
      "alert rule added",
      "0.9 leaves headroom; 1.0 fires only at total failure."),
  ],
};

const LAB_1035: IncidentLab = LAB_1034;

interface GenSpec {
  objective: string;
  difficulty: LabDifficulty;
  minutes: number;
  symptom: { cmd: string; out: string; check: string; hint: string };
  inspect: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
  rootcause: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
  fix: { cmd: string; out: string; check: string; hint: string; tool: AlignedTool; shell: LabShell };
  verify: { cmd: string; out: string; check: string; hint: string };
  concept: string;
  tool_chain: AlignedTool[];
}

function genLab(spec: GenSpec): IncidentLab {
  const T = spec.tool_chain;
  return {
    objective: spec.objective,
    prerequisites: ["lab-docker-01 reachable", "Docker Engine ≥ 24"],
    estimated_minutes: spec.minutes,
    difficulty: spec.difficulty,
    steps: [
      s("s1", "plan", T[0] ?? "Docker", "bash",
        "Read the incident & form a hypothesis",
        `Concept under test: ${spec.concept}. Restate in your own words before touching anything.`,
        "echo 'Hypothesis: ' && cat /etc/motd | head -1",
        `Hypothesis:
ShadowXLab — lab-docker-01`,
        "hypothesis stated",
        "Write the hypothesis before running commands — it shapes what you look for."),
      s("s2", "observe", T[0] ?? "Docker", "docker",
        "Reproduce the symptom",
        "Run the exact command from the alert. Reproduction proves the bug is real and bounded.",
        spec.symptom.cmd, spec.symptom.out, spec.symptom.check, spec.symptom.hint),
      s("s3", "triage", spec.inspect.tool, spec.inspect.shell,
        "Inspect the failing object",
        "Drop a layer below the symptom — look at the resource's actual state.",
        spec.inspect.cmd, spec.inspect.out, spec.inspect.check, spec.inspect.hint),
      s("s4", "observe", "journalctl", "bash",
        "Pull host-side evidence",
        "Runtime daemons log to the systemd journal — corroborate the user-space symptom.",
        "journalctl --since '5 min ago' -u docker -u containerd | tail -10",
        `dockerd: container event: …
containerd: handling stream: …`,
        "log lines returned",
        "If journalctl is empty, your timeframe is wrong — widen to 15 min."),
      s("s5", "triage", spec.rootcause.tool, spec.rootcause.shell,
        "Identify root cause",
        "Connect the symptom to the underlying mechanism (cgroup / namespace / image / registry).",
        spec.rootcause.cmd, spec.rootcause.out, spec.rootcause.check, spec.rootcause.hint),
      s("s6", "code", T[Math.min(1, T.length - 1)] ?? "Docker", "bash",
        "Plan the fix in code",
        "Pre-write the corrective change so the cluster spends minimum time degraded.",
        "cat /opt/lab/fixes/proposed.diff",
        `--- before
+++ after
- run with default limits
+ run with explicit --memory and --pids-limit`,
        "diff displayed",
        "Treat the fix as a PR even on a single host."),
      s("s7", "fix", spec.fix.tool, spec.fix.shell,
        "Apply the fix",
        "Smallest possible change that resolves the failure. Anything bigger is a refactor.",
        spec.fix.cmd, spec.fix.out, spec.fix.check, spec.fix.hint),
      s("s8", "run", T[T.length - 1] ?? "Docker", "docker",
        "Verify in real time",
        "Watch the workload come back. Don't trust ‘looks OK’ — read the metric.",
        spec.verify.cmd, spec.verify.out, spec.verify.check, spec.verify.hint),
      s("s9", "observe", "Prometheus", "bash",
        "Confirm the metric clears",
        "Backend metric is the contract between SRE and developer — it must show green.",
        "promtool query instant http://prom:9090 'ALERTS{alertname=~\".*\",alertstate=\"firing\"}'",
        `(no rows)`,
        "no firing alerts",
        "‘No rows’ is the right answer here — alerts have cleared."),
      s("s10", "recover", "GitHub Actions", "bash",
        "Land a regression test",
        "Bake the failure into CI so the next person doesn't get paged for the same thing.",
        "echo '- name: regression\n  run: ./tests/regression.sh' >> .github/workflows/ci.yml",
        `(appended)`,
        "CI step added",
        "Postmortems without tests don't count."),
    ],
  };
}

const LAB_1036 = genLab({
  objective: "Reclaim space on a host whose overlay2 storage is full and re-deploy a container.",
  difficulty: "intermediate", minutes: 16,
  concept: "overlay2 graph driver + writable container layer",
  tool_chain: ["Docker", "containerd"],
  symptom: { cmd: "docker run --rm alpine echo hi",
    out: `docker: Error response from daemon: write /var/lib/docker/overlay2/.../diff: no space left on device.`,
    check: "ENOSPC error", hint: "ENOSPC always means df -h /var/lib/docker." },
  inspect: { tool: "Docker", shell: "bash", cmd: "df -h /var/lib/docker && docker system df",
    out: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   49G   0    100% /var/lib/docker
TYPE          TOTAL  ACTIVE  SIZE   RECLAIMABLE
Images        87     14      24GB   18GB`,
    check: "Use% 100", hint: "RECLAIMABLE column tells you exactly how much `system prune` will free." },
  rootcause: { tool: "Docker", shell: "docker", cmd: "docker images --format '{{.Size}}\t{{.Repository}}' | sort -h | tail -5",
    out: `1.4GB   legacy/builder
980MB   abandoned-stage
820MB   <none>
640MB   <none>
410MB   nginx`,
    check: "dangling images visible", hint: "<none>:<none> are dangling layers — safe to prune." },
  fix: { tool: "Docker", shell: "docker", cmd: "docker system prune -af --volumes",
    out: `Total reclaimed space: 18.2GB`,
    check: "≥10GB reclaimed", hint: "--volumes is destructive; confirm no stateful data first." },
  verify: { cmd: "docker run --rm alpine echo ok",
    out: `ok`, check: "container runs", hint: "If still ENOSPC, check inodes (`df -i`)." },
});

const LAB_1037 = genLab({
  objective: "Find a detached container that exited silently and turn on a restart policy.",
  difficulty: "beginner", minutes: 10,
  concept: "fg vs `-d`, restart policies",
  tool_chain: ["Docker"],
  symptom: { cmd: "docker ps", out: `CONTAINER ID   IMAGE   STATUS
(empty)`, check: "no containers running", hint: "`docker ps` only shows running — use `-a` for everything." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker ps -a --filter name=worker",
    out: `CONTAINER ID   IMAGE       STATUS                       NAMES
8a1cf2…        worker:1.0  Exited (1) 3 minutes ago     worker`,
    check: "Exited (1)", hint: "Exit code is the first clue — 1 = generic app error, 137 = OOM, 143 = SIGTERM." },
  rootcause: { tool: "Docker", shell: "docker", cmd: "docker logs --tail 5 worker",
    out: `Traceback (most recent call last):
  File "/app.py", line 1, in <module>
    import redis
ModuleNotFoundError: No module named 'redis'`,
    check: "import error visible", hint: "Always read logs of the *previous* run after a crash." },
  fix: { tool: "Docker", shell: "docker", cmd: "docker run -d --name worker --restart=on-failure:3 worker:1.0",
    out: `2bf91c…`, check: "container ID printed", hint: "on-failure:3 retries 3 times then gives up." },
  verify: { cmd: "docker inspect worker --format '{{.HostConfig.RestartPolicy.Name}}'",
    out: `on-failure`, check: "policy = on-failure", hint: "Verify the policy is actually set — typos silently default to ‘no’." },
});

const LAB_1038 = genLab({
  objective: "Recover a node whose containerd was killed, restart it cleanly and prove kubelet reconnects.",
  difficulty: "advanced", minutes: 22,
  concept: "Docker → containerd → runc layered runtime",
  tool_chain: ["containerd", "crictl", "kubectl"],
  symptom: { cmd: "kubectl get nodes",
    out: `NAME            STATUS     ROLES    AGE   VERSION
lab-node-01     NotReady   <none>   3d    v1.29.2`,
    check: "NotReady visible", hint: "NotReady means kubelet → API works, but kubelet → runtime doesn't." },
  inspect: { tool: "crictl", shell: "crictl", cmd: "crictl --runtime-endpoint unix:///run/containerd/containerd.sock ps",
    out: `FATA[0000] connect endpoint 'unix:///run/containerd/containerd.sock': connection refused`,
    check: "connection refused", hint: "If crictl can't connect either, containerd is down, not kubelet." },
  rootcause: { tool: "journalctl", shell: "bash", cmd: "journalctl -u containerd -n 20 --no-pager",
    out: `containerd[1842]: panic: failed to open snapshotter: no space left on device
systemd: containerd.service: Main process exited, code=exited, status=1`,
    check: "panic logged", hint: "Snapshotter ENOSPC → same overlay disk issue surfaced at a different layer." },
  fix: { tool: "containerd", shell: "bash", cmd: "sudo systemctl restart containerd && sudo systemctl restart kubelet",
    out: `(no output)`, check: "both units active", hint: "Always restart kubelet after containerd; kubelet caches CRI socket." },
  verify: { cmd: "kubectl get nodes lab-node-01",
    out: `NAME          STATUS   ROLES    AGE   VERSION
lab-node-01   Ready    <none>   3d    v1.29.2`,
    check: "Ready", hint: "Ready ≈ within 40 s of kubelet restart." },
});

const LAB_1039 = genLab({
  objective: "Bound a noisy-neighbour container's CPU usage with cpu.shares and cpu.cfs_quota.",
  difficulty: "intermediate", minutes: 14,
  concept: "CPU cgroups (shares vs quota)",
  tool_chain: ["Docker", "runc"],
  symptom: { cmd: "docker stats --no-stream",
    out: `NAME      CPU %
hog       398.2%
api       2.1%
worker    1.4%`,
    check: "one container > 300%", hint: "Anything > 100% means it's using more than one core." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker inspect hog --format '{{.HostConfig.CpuShares}} {{.HostConfig.NanoCpus}}'",
    out: `0 0`, check: "no caps set", hint: "0 means default — every container competes equally." },
  rootcause: { tool: "runc", shell: "bash", cmd: "cat /sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' hog).scope/cpu.max",
    out: `max 100000`, check: "cpu.max = max", hint: "‘max’ = no quota; quota is enforced as `<quota> <period>`." },
  fix: { tool: "Docker", shell: "docker", cmd: "docker update --cpus=1.5 hog",
    out: `hog`, check: "container name echoed", hint: "--cpus=1.5 → cpu.max becomes ‘150000 100000’." },
  verify: { cmd: "docker stats --no-stream hog",
    out: `NAME   CPU %
hog    148.7%`, check: "CPU < 200%", hint: "Should hover just under the cap; 150% is the ceiling here." },
});

const LAB_1040 = genLab({
  objective: "Trace a seccomp-blocked syscall and grant the minimum capability the workload needs.",
  difficulty: "advanced", minutes: 20,
  concept: "Linux seccomp filtering",
  tool_chain: ["Docker", "runc", "journalctl"],
  symptom: { cmd: "docker run --rm tracee:lab",
    out: `tracee: clone3() failed: Operation not permitted`,
    check: "EPERM at clone3", hint: "EPERM at a syscall = seccomp or capability denial, not RBAC." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker inspect tracee --format '{{.HostConfig.SecurityOpt}}'",
    out: `[seccomp=/etc/docker/seccomp-default.json]`, check: "seccomp profile loaded", hint: "Default profile blocks ~44 syscalls including clone3 on old kernels." },
  rootcause: { tool: "journalctl", shell: "bash", cmd: "journalctl -k --since '2 min ago' | grep -i seccomp",
    out: `kernel: audit: type=1326 syscall=435 comp=2 (clone3) action=errno`,
    check: "audit line for clone3", hint: "syscall=435 → clone3 on x86_64; map via `ausyscall`." },
  fix: { tool: "Docker", shell: "docker", cmd: "docker run --rm --security-opt seccomp=unconfined tracee:lab",
    out: `tracee: started`, check: "starts cleanly", hint: "unconfined is for *diagnosis* only — write a narrow profile for prod." },
  verify: { cmd: "docker run --rm --security-opt seccomp=/etc/docker/seccomp-clone3.json tracee:lab",
    out: `tracee: started`, check: "narrow profile works", hint: "Patched profile adds only clone3 to the allow list." },
});

const LAB_1041 = genLab({
  objective: "Resolve a bind() EADDRINUSE caused by two containers fighting for host port 8080.",
  difficulty: "beginner", minutes: 8,
  concept: "Docker bridge network + host port publishing",
  tool_chain: ["Docker"],
  symptom: { cmd: "docker run -d -p 8080:80 nginx",
    out: `docker: Error response from daemon: driver failed programming external connectivity on endpoint: Bind for 0.0.0.0:8080 failed: port is already allocated.`,
    check: "port already allocated", hint: "Means the host port — not the container port — is taken." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker ps --format '{{.Ports}}\t{{.Names}}' | grep 8080",
    out: `0.0.0.0:8080->80/tcp   web-old`, check: "web-old holds 8080", hint: "Use `ss -tlnp` if Docker isn't the holder." },
  rootcause: { tool: "Docker", shell: "bash", cmd: "ss -tlnp 'sport = :8080'",
    out: `State    Recv-Q Send-Q Local Address:Port  Peer  Process
LISTEN   0      4096   0.0.0.0:8080         *     users:(("docker-proxy",pid=2741,fd=4))`,
    check: "docker-proxy on 8080", hint: "docker-proxy is the userland NAT helper; killing it leaks state — stop the container instead." },
  fix: { tool: "Docker", shell: "docker", cmd: "docker rm -f web-old && docker run -d -p 8080:80 --name web nginx",
    out: `web-old
9b…`, check: "new container ID", hint: "Or publish on a different host port (`-p 8081:80`)." },
  verify: { cmd: "curl -sI http://localhost:8080 | head -1",
    out: `HTTP/1.1 200 OK`, check: "200 OK", hint: "If 502/504, container is up but app is dead." },
});

const LAB_1042 = genLab({
  objective: "Add the lab user to the docker group safely without granting root through a sudo shim.",
  difficulty: "beginner", minutes: 7,
  concept: "Docker socket permissions",
  tool_chain: ["Docker"],
  symptom: { cmd: "docker ps",
    out: `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock`,
    check: "permission denied", hint: "Daemon is alive — your user just isn't in the docker group." },
  inspect: { tool: "Docker", shell: "bash", cmd: "ls -l /var/run/docker.sock && id",
    out: `srw-rw---- 1 root docker 0 May 19 12:00 /var/run/docker.sock
uid=1001(student) gid=1001(student) groups=1001(student)`,
    check: "group ≠ docker", hint: "Socket is mode 660 root:docker — only root or docker group can read/write." },
  rootcause: { tool: "Docker", shell: "bash", cmd: "getent group docker",
    out: `docker:x:998:`, check: "no members listed", hint: "Empty member list confirms no one's in the group yet." },
  fix: { tool: "Docker", shell: "bash", cmd: "sudo usermod -aG docker student && newgrp docker",
    out: `(no output — re-login)`, check: "group added", hint: "Membership in docker group is effectively root; treat it like sudo." },
  verify: { cmd: "docker ps",
    out: `CONTAINER ID   IMAGE   COMMAND   STATUS   PORTS   NAMES`, check: "no error", hint: "Empty list with header is success — daemon answered." },
});

// ============================================================================
// MODULE 2 — Building Docker Images
// ============================================================================

const LAB_1024 = genLab({
  objective: "Fix an ImagePullBackOff against GHCR by issuing a valid imagePullSecret and re-deploying.",
  difficulty: "intermediate", minutes: 18,
  concept: "Registry auth & imagePullSecrets",
  tool_chain: ["kubectl", "GHCR", "Docker"],
  symptom: { cmd: "kubectl -n payments get pods",
    out: `NAME                 READY   STATUS              RESTARTS   AGE
payments-api-7f…     0/1     ImagePullBackOff    0          3m`,
    check: "ImagePullBackOff", hint: "ImagePullBackOff = the kubelet tried, registry refused — usually auth or tag." },
  inspect: { tool: "kubectl", shell: "kubectl", cmd: "kubectl -n payments describe pod payments-api-7f…",
    out: `Events:
  Warning  Failed  kubelet  Failed to pull image "ghcr.io/acme/payments-api:1.4.2": unauthorized`,
    check: "‘unauthorized’ in events", hint: "Events are the ground truth — kubectl get hides them." },
  rootcause: { tool: "kubectl", shell: "kubectl", cmd: "kubectl -n payments get secret ghcr-creds -o jsonpath='{.data..dockerconfigjson}' | base64 -d | jq .auths",
    out: `{
  "ghcr.io": { "auth": "Z2hzX0V4cElyZWQ=" }
}`, check: "auth string present", hint: "Decoded base64 here would show username:token — token is expired." },
  fix: { tool: "kubectl", shell: "kubectl", cmd: "kubectl -n payments create secret docker-registry ghcr-creds --docker-server=ghcr.io --docker-username=acme-bot --docker-password=$GHCR_PAT --dry-run=client -o yaml | kubectl apply -f -",
    out: `secret/ghcr-creds configured`, check: "secret reconfigured", hint: "PAT must have `read:packages`; check token scopes in GitHub UI." },
  verify: { cmd: "kubectl -n payments rollout status deploy/payments-api --timeout=60s",
    out: `deployment "payments-api" successfully rolled out`, check: "rollout success", hint: "If still backoff, delete the failing pod to bypass kubelet's pull backoff timer." },
});

const LAB_1030 = genLab({
  objective: "Resolve `apt-get` exit 100 in a Docker build by combining update+install in one RUN.",
  difficulty: "beginner", minutes: 10,
  concept: "Docker build cache & apt layer pitfalls",
  tool_chain: ["Docker", "BuildKit"],
  symptom: { cmd: "docker build -t app:lab .",
    out: `E: Unable to locate package curl
The command '/bin/sh -c apt-get install -y curl' returned a non-zero code: 100`,
    check: "exit code 100", hint: "100 from apt = package index missing or stale." },
  inspect: { tool: "Docker", shell: "bash", cmd: "sed -n '1,10p' Dockerfile",
    out: `FROM debian:12
RUN apt-get update
RUN apt-get install -y curl`,
    check: "update + install in separate RUNs", hint: "Cached `apt-get update` layer ≠ cached `apt-get install` layer." },
  rootcause: { tool: "Docker", shell: "bash", cmd: "docker history app:lab --no-trunc | head -5",
    out: `IMAGE   CREATED        CREATED BY                          SIZE
<base>  2 weeks ago    RUN apt-get update                  44MB
        2 weeks ago    RUN apt-get install -y curl         (failed)`,
    check: "stale update layer", hint: "BuildKit reused a 2-week-old apt index → mirrors moved → install fails." },
  fix: { tool: "Docker", shell: "bash", cmd: "sed -i 's|^RUN apt-get update$|RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*|' Dockerfile && grep RUN Dockerfile",
    out: `RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*`,
    check: "single RUN", hint: "And delete /var/lib/apt/lists/* to keep image small." },
  verify: { cmd: "docker build -t app:lab .",
    out: `Successfully tagged app:lab`, check: "build succeeds", hint: "Use `--no-cache` once to be sure cache wasn't masking it." },
});

const LAB_1031 = genLab({
  objective: "Trim a 1.4 GB image to ~120 MB with a multi-stage build.",
  difficulty: "intermediate", minutes: 16,
  concept: "Multi-stage builds & distroless runtime",
  tool_chain: ["Docker", "BuildKit"],
  symptom: { cmd: "docker images bloat-api",
    out: `REPOSITORY   TAG   SIZE
bloat-api    1.0   1.4GB`,
    check: "size > 1 GB", hint: "Most Node/Python apps should be < 200 MB." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker history bloat-api:1.0 --format 'table {{.Size}}\t{{.CreatedBy}}'",
    out: `SIZE     CREATED BY
820MB    RUN apt-get install -y build-essential
260MB    COPY ./node_modules /app/node_modules
210MB    FROM node:20`,
    check: "build-essential in final layer", hint: "Build-time deps should not ship to runtime." },
  rootcause: { tool: "Docker", shell: "bash", cmd: "cat Dockerfile",
    out: `FROM node:20
RUN apt-get install -y build-essential
COPY . /app
RUN npm install
CMD ["node","/app/index.js"]`,
    check: "single stage", hint: "One FROM = every build artifact stays in the runtime image." },
  fix: { tool: "Docker", shell: "bash", cmd: "cat > Dockerfile <<'EOF'\nFROM node:20 AS build\nWORKDIR /app\nCOPY . .\nRUN npm ci --omit=dev\n\nFROM gcr.io/distroless/nodejs20\nCOPY --from=build /app /app\nCMD [\"/app/index.js\"]\nEOF",
    out: `(written)`, check: "two FROMs", hint: "distroless has no shell — perfect for runtime, painful to debug live." },
  verify: { cmd: "docker build -t bloat-api:2.0 . && docker images bloat-api:2.0",
    out: `REPOSITORY   TAG   SIZE
bloat-api    2.0   118MB`, check: "size < 200 MB", hint: "Smaller image = faster pull, faster scale, smaller attack surface." },
});

const LAB_1043 = genLab({
  objective: "Recover from a registry push denied with `denied: write_package` by fixing PAT scopes.",
  difficulty: "beginner", minutes: 9,
  concept: "GHCR write:packages scope",
  tool_chain: ["Docker", "GHCR", "GitHub Actions"],
  symptom: { cmd: "docker push ghcr.io/acme/api:1.0",
    out: `denied: permission_denied: write_package`,
    check: "denied returned", hint: "denied → token authenticated but lacks scope." },
  inspect: { tool: "GHCR", shell: "bash", cmd: "gh auth status",
    out: `Token scopes: read:packages, repo`, check: "no write:packages", hint: "Read alone is enough for pulls — pushes need write:packages." },
  rootcause: { tool: "GitHub Actions", shell: "bash", cmd: "cat .github/workflows/publish.yml | grep permissions -A2",
    out: `permissions:
  contents: read
  packages: read`, check: "packages: read", hint: "Workflow tokens inherit the lowest of repo and workflow scopes." },
  fix: { tool: "GitHub Actions", shell: "bash", cmd: "sed -i 's|packages: read|packages: write|' .github/workflows/publish.yml && grep packages .github/workflows/publish.yml",
    out: `  packages: write`, check: "packages: write", hint: "Bump only the scope you need; ‘write-all’ is a security smell." },
  verify: { cmd: "docker push ghcr.io/acme/api:1.0",
    out: `1.0: digest: sha256:7c… size: 2412`, check: "digest printed", hint: "Digest line confirms the layer was accepted." },
});

const LAB_1044 = genLab({
  objective: "Detect and purge a secret accidentally baked into an image layer.",
  difficulty: "advanced", minutes: 20,
  concept: "Image layers are immutable — secrets leak forever",
  tool_chain: ["Trivy", "Docker", "GHCR"],
  symptom: { cmd: "trivy image --scanners secret leaky:1.0",
    out: `CRITICAL: GitHub Personal Access Token
Layer: sha256:9f2c…
File: /app/.env`,
    check: "CRITICAL secret", hint: "Trivy --scanners secret is the right tool here." },
  inspect: { tool: "Docker", shell: "docker", cmd: "docker history leaky:1.0 | grep .env",
    out: `9f2c…  3 minutes ago  COPY . /app   4.2kB`, check: ".env layer found", hint: "‘COPY .’ pulled the .env from the build context." },
  rootcause: { tool: "Docker", shell: "bash", cmd: "cat .dockerignore 2>/dev/null || echo MISSING",
    out: `MISSING`, check: "MISSING", hint: ".dockerignore is your first secret-protection control." },
  fix: { tool: "Docker", shell: "bash", cmd: "echo -e '.env\n*.pem\nnode_modules' > .dockerignore && docker build -t leaky:1.1 .",
    out: `Successfully tagged leaky:1.1`, check: "image rebuilt", hint: "Old tag is still on the registry — rotate the leaked credential too." },
  verify: { cmd: "trivy image --scanners secret leaky:1.1",
    out: `OK: no secrets found`, check: "no secrets", hint: "Also revoke the PAT in GitHub UI — assume it's compromised." },
});

const LAB_1045 = genLab({
  objective: "Triage a Trivy HIGH CVE on a base image and rebuild against a patched tag.",
  difficulty: "intermediate", minutes: 15,
  concept: "Base image hygiene & CVE shift-left",
  tool_chain: ["Trivy", "Docker"],
  symptom: { cmd: "trivy image --severity HIGH,CRITICAL app:1.0",
    out: `app:1.0 (debian 11.7)
=========================
Total: 3 (HIGH: 3, CRITICAL: 0)
CVE-2024-1234  openssl  3.0.7  3.0.13  HIGH`,
    check: "3 HIGH CVEs", hint: "Pin to debian:12 (bookworm) — 11 is old-stable, patches lag." },
  inspect: { tool: "Docker", shell: "bash", cmd: "grep '^FROM' Dockerfile",
    out: `FROM debian:11`, check: "old base", hint: "Base age is the #1 predictor of CVE count." },
  rootcause: { tool: "Trivy", shell: "bash", cmd: "trivy image --severity HIGH --format table app:1.0 | grep openssl",
    out: `CVE-2024-1234  openssl  3.0.7  3.0.13  HIGH  X509 chain validation bypass`, check: "openssl CVE", hint: "Fixed version 3.0.13 ships in debian:12." },
  fix: { tool: "Docker", shell: "bash", cmd: "sed -i 's|^FROM debian:11|FROM debian:12|' Dockerfile && docker build -t app:1.1 .",
    out: `Successfully tagged app:1.1`, check: "rebuilt on debian:12", hint: "Test app boot — major base bumps can break glibc-linked binaries." },
  verify: { cmd: "trivy image --severity HIGH,CRITICAL app:1.1",
    out: `Total: 0 (HIGH: 0, CRITICAL: 0)`, check: "0 HIGH/CRIT", hint: "Aim for 0 HIGH in production images." },
});

const LAB_1046 = genLab({
  objective: "Restore cache hits on a Dockerfile whose COPY order invalidates everything.",
  difficulty: "intermediate", minutes: 12,
  concept: "Docker build cache invalidation rules",
  tool_chain: ["Docker", "BuildKit"],
  symptom: { cmd: "DOCKER_BUILDKIT=1 docker build -t app:lab .",
    out: `#7 [3/5] RUN npm install
#7 sha256:… 38.4s CACHE MISS`, check: "CACHE MISS on install", hint: "Cache miss on install means a step *above* it changed." },
  inspect: { tool: "Docker", shell: "bash", cmd: "cat Dockerfile",
    out: `FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node","index.js"]`, check: "COPY . . before npm install", hint: "COPY . . changes on every source edit → invalidates cache." },
  rootcause: { tool: "BuildKit", shell: "bash", cmd: "docker buildx build --progress=plain --no-cache-filter=npm . 2>&1 | grep CACHED | wc -l",
    out: `0`, check: "0 cached steps", hint: "BuildKit can show per-step cache decisions with --progress=plain." },
  fix: { tool: "Docker", shell: "bash", cmd: "cat > Dockerfile <<'EOF'\nFROM node:20\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD [\"node\",\"index.js\"]\nEOF",
    out: `(written)`, check: "package.json copied first", hint: "Order layers least-likely-to-change to most-likely-to-change." },
  verify: { cmd: "DOCKER_BUILDKIT=1 docker build -t app:lab . 2>&1 | grep -c CACHED",
    out: `4`, check: "≥ 3 CACHED steps", hint: "If still all CACHE MISS, prune builder: `docker buildx prune`." },
});

const LAB_1047 = genLab({
  objective: "Diagnose `exec format error` / exit 127 from a wrong ENTRYPOINT and pick the right form.",
  difficulty: "beginner", minutes: 8,
  concept: "ENTRYPOINT exec form vs shell form",
  tool_chain: ["Docker"],
  symptom: { cmd: "docker run --rm app:bad",
    out: `/bin/sh: 1: exec: my-app --port=8080: not found
exit 127`, check: "exit 127", hint: "127 = command not found by shell." },
  inspect: { tool: "Docker", shell: "bash", cmd: "grep -i entrypoint Dockerfile",
    out: `ENTRYPOINT "my-app --port=8080"`, check: "string entrypoint", hint: "String form is wrapped in `sh -c` — variable parsing differs." },
  rootcause: { tool: "Docker", shell: "docker", cmd: "docker inspect app:bad --format '{{json .Config.Entrypoint}}'",
    out: `["/bin/sh","-c","my-app --port=8080"]`, check: "/bin/sh -c wrap", hint: "sh searches $PATH; if `my-app` lives in /opt/app, sh won't find it." },
  fix: { tool: "Docker", shell: "bash", cmd: "sed -i 's|^ENTRYPOINT.*|ENTRYPOINT [\"/opt/app/my-app\",\"--port=8080\"]|' Dockerfile && docker build -t app:good .",
    out: `Successfully tagged app:good`, check: "rebuilt", hint: "Exec form (JSON array) is the production default." },
  verify: { cmd: "docker run --rm app:good --help | head -1",
    out: `my-app 1.0 — usage: …`, check: "help banner prints", hint: "If still 127, the binary path is wrong — check `RUN ls /opt/app`." },
});

const LAB_1048 = genLab({
  objective: "Survive a Docker Hub 429 (rate-limited) by switching CI to an authenticated pull or a mirror.",
  difficulty: "intermediate", minutes: 12,
  concept: "Docker Hub anonymous pull limits",
  tool_chain: ["Docker", "GitHub Actions", "GHCR"],
  symptom: { cmd: "docker pull library/nginx:alpine",
    out: `Error response from daemon: toomanyrequests: You have reached your pull rate limit. https://www.docker.com/increase-rate-limits`,
    check: "toomanyrequests", hint: "Anonymous = 100 pulls/6h/IP; CI runners share NAT IPs and burn through fast." },
  inspect: { tool: "Docker", shell: "bash", cmd: "curl -s 'https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/nginx:pull' | jq -r .token | head -c40",
    out: `eyJhbGciOiJSUzI1NiIs…`, check: "token returned", hint: "Anonymous tokens are throttled per source IP." },
  rootcause: { tool: "GitHub Actions", shell: "bash", cmd: "grep -i 'docker' .github/workflows/ci.yml | grep -v login",
    out: `      - uses: docker/build-push-action@v6
        with:
          push: true`, check: "no docker/login-action", hint: "If you never log in, every pull is anonymous." },
  fix: { tool: "GitHub Actions", shell: "bash", cmd: "echo '      - uses: docker/login-action@v3\n        with:\n          username: ${{ secrets.DOCKERHUB_USER }}\n          password: ${{ secrets.DOCKERHUB_TOKEN }}' >> .github/workflows/ci.yml",
    out: `(appended)`, check: "login step added", hint: "Even free accounts get 200 pulls/6h — 2× anonymous." },
  verify: { cmd: "docker pull library/nginx:alpine",
    out: `alpine: Pulling from library/nginx
Digest: sha256:7c…
Status: Downloaded newer image for nginx:alpine`, check: "pull succeeds", hint: "For high-volume CI, mirror via GHCR or ECR pull-through." },
});

const LAB_1035_REAL: IncidentLab = LAB_1034;

export const INCIDENT_LABS: Record<string, IncidentLab> = {
  "K8S-INC-1032": LAB_1032,
  "K8S-INC-1033": LAB_1033,
  "K8S-INC-1034": LAB_1034,
  "K8S-INC-1035": LAB_1035_REAL,
  "K8S-INC-1036": LAB_1036,
  "K8S-INC-1037": LAB_1037,
  "K8S-INC-1038": LAB_1038,
  "K8S-INC-1039": LAB_1039,
  "K8S-INC-1040": LAB_1040,
  "K8S-INC-1041": LAB_1041,
  "K8S-INC-1042": LAB_1042,
  "K8S-INC-1024": LAB_1024,
  "K8S-INC-1030": LAB_1030,
  "K8S-INC-1031": LAB_1031,
  "K8S-INC-1043": LAB_1043,
  "K8S-INC-1044": LAB_1044,
  "K8S-INC-1045": LAB_1045,
  "K8S-INC-1046": LAB_1046,
  "K8S-INC-1047": LAB_1047,
  "K8S-INC-1048": LAB_1048,
};

export function getIncidentLab(id: string): IncidentLab | undefined {
  return INCIDENT_LABS[id];
}

void LAB_1035;
