# ShadowXLab — K8s Foundations M1 & M2 Deep Learning Layer

Enhance the **existing** Ops Console (K8s Incidents, Docker inventory, Cluster dashboard, DevOps pipeline, cross-tool enrichment) into a deep operational learning experience for **Module 1 (Containerization Fundamentals & Docker Architecture)** and **Module 2 (Building Docker Images)** — without redesigning the UI or touching other courses.

## Scope guardrails
- Reuse existing components: `SectionCard`, `PageHeader`, `OpsTabs`, `SeverityBadge`, `ActivityTimeline`, `HoverTerm`, `DOCKER_HOVER_TERMS`, `K8S_PHASES`, `TOOL_CATALOG`.
- Only edit files under `src/ops/modules/k8s/**` plus `src/lib/dockerHoverTerms.ts` (extend), `src/components/HoverTerm.tsx` (only if a needed prop is missing).
- No changes to SOC / ITSM / SRE / Cloud / DevOps / CCNA / CSA / Pen200 / CDL / Splunk / Auth / DB.
- No new routes; uses existing `/ops/k8s-incidents`, `/ops/k8s-incidents/:id`, `/ops/k8s/containers`, `/ops/k8s/clusters`.

## Module-locked incident catalog (`incidentsData.ts`)
Replace the curated incident list so every incident maps to **M1** or **M2** exactly:

**M1 — Runtime / Architecture (10 incidents)**
1. Container exited 137 — OOMKilled (cgroups, host OOM killer)
2. Docker daemon unreachable (Engine / API / client-server)
3. Namespace quota exceeded (PID/user namespaces, multi-tenancy)
4. Overlay filesystem full (overlayfs, writable layer)
5. Detached container exited silently (fg vs -d, restart policy)
6. containerd restart failure (Docker → containerd → runc hierarchy)
7. Noisy-neighbor high CPU (CPU cgroups, cpu.shares)
8. seccomp blocked syscall (Linux syscall filtering)
9. Port-binding conflict (bridge net, -p host:container)
10. Docker socket permission denied (/var/run/docker.sock perms)

**M2 — Image build / registry / security (10 incidents)**
11. `apt-get` exit 100 in RUN layer
12. ImagePullBackOff — GHCR auth failed
13. Registry push denied (write:packages RBAC)
14. 1.4 GB image causing slow deploy (multi-stage missing)
15. Secret leaked into image layer (Trivy secret scan)
16. Trivy HIGH CVE in base image
17. Build cache invalidation (COPY order)
18. Wrong ENTRYPOINT — exit 127
19. Docker Hub rate limiting (429 toomanyrequests)
20. `:latest` tag drift in prod

Each incident object gains:
```ts
learning: {
  concept: string;          // "cgroups memory limits"
  meaning: string;          // plain-language explanation
  enterprise_impact: string;
  fresher_view: string;     // simple
  engineer_view: string;    // deep / kernel-level
  commands_bash: string[];
  commands_powershell: string[];
  next_steps: string[];
  recovery: string[];
}
```
Existing fields (`phase_walkthrough`, `tools`, `enrichment`, `module`, `affected_assets`) stay.

## Incident detail enhancements (`IncidentDetail.tsx`)
Add **inside the existing layout** (no redesign):
- **Analyst Briefing** (exists) — augment with `learning.meaning`.
- **Runtime Explanation** card — `fresher_view` / `engineer_view` toggle (simple tabs already available via `OpsTabs`).
- **Real Commands** card — Bash / PowerShell tabs using `OpsTabs`, copy-on-click.
- **Operational Impact + Recovery** card — bulleted lists.
- Wrap every technical term (containerd, runc, overlayfs, cgroup, namespace, seccomp, Dockerfile keywords) with existing `<HoverTerm termKey="…">` from `DOCKER_HOVER_TERMS`.

## Dashboard learning panels
Two new compact panels (reuse `SectionCard` + `KpiCard`) — no new pages:

**`ContainersList.tsx`** — append **"Runtime Learning Insights"** strip:
- Running / Exited / Paused / Restarting counts (already shown) + concept link
- Engine + containerd + runc health row
- Overlay storage usage bar
- Insight cards generated from current incidents (e.g. "Container exited 137 → cgroups memory limits")

**`ClustersList.tsx`** (only the K8s clusters page) — append **"Build Learning Insights"** strip:
- Image size trend, layer count, build success %, registry latency, CVE severity mix, cache hit ratio
- Insight cards (e.g. "Image grew 210MB→1.4GB → use multi-stage")

Both strips read from the M1/M2 incident catalog — no fake new data sources.

## Hover glossary extension (`dockerHoverTerms.ts`)
Add missing terms used by the new incidents: `oom-killer`, `cpu-shares`, `pid-namespace`, `docker-socket`, `bridge-port`, `restart-policy`, `image-pull-secret`, `dockerhub-ratelimit`, `latest-tag`, `build-cache`, `dockerignore`, `distroless`, `trivy`, `cve`, `buildkit`, `image-signing`, `ghcr-pat`, `ecr`, `acr`. Each entry follows the existing `HoverTerm` schema (quick, definition, production, security, commonIssue).

## DevOps phase + tool alignment
Already wired via `K8S_PHASES` + `TOOL_CATALOG`. Every new incident sets `phase_walkthrough` with the failing phase flagged FAILED/CURRENT, and `tools: AlignedTool[]` referencing the existing catalog. Extend `TOOL_CATALOG` only if a tool is missing (`Docker Desktop`, `crictl`, `journalctl`, `BuildKit`, `Snyk`, `GitHub Actions`, `Jenkins`).

## Files touched
**Edit**
- `src/ops/modules/k8s/incidentsData.ts` — replace catalog with 20 M1/M2 incidents + `learning` field on the interface
- `src/ops/modules/k8s/IncidentDetail.tsx` — add Runtime Explanation, Real Commands (Bash/PS), Impact+Recovery, hover-term wrapping
- `src/ops/modules/k8s/IncidentsList.tsx` — module filter already exists; add M1/M2 grouping headers
- `src/ops/modules/k8s/ContainersList.tsx` — append Runtime Learning Insights strip
- `src/ops/modules/k8s/ClustersList.tsx` — append Build Learning Insights strip
- `src/ops/modules/k8s/toolStack.ts` — add Docker Desktop, crictl, journalctl, BuildKit, Snyk, GitHub Actions, Jenkins
- `src/lib/dockerHoverTerms.ts` — add ~20 new terms

**No new routes, no new pages, no DB changes, no auth changes.**

## Out of scope
- No edits to other courses, SOC, ITSM, SRE, Cloud, DevOps modules, CCNA, CSA, Pen200, CDL, Splunk pages, Auth, sidebar/topbar, dashboards outside K8s.
- No M3/M4/M5 content changes.
- No new shadcn components or layout overhauls.
