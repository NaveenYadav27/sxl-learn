## Goal

Bring the K8s ops module up to the same visual/analytical depth as the SOC notable detail (analyst briefing, affected assets, attack/phase chain, cross-tool enrichment, vulnerabilities, response actions) — but framed in K8s/DevOps terms (lab tools, deployment phases, container incidents). Wire it into K8s labs so each lab links to a matching ops incident.

No SOC/ITSM/SRE/Cloud files are touched. Only new K8s files + minimal additions to App routes and the K8s ops sidebar.

## What gets built

### 1. K8s Incident data model (new)
`src/ops/modules/k8s/incidentsData.ts` — 8 curated K8s incidents covering the labs:
- `K8S-INC-1024` ImagePullBackOff — payments-api (registry auth)
- `K8S-INC-1025` CrashLoopBackOff — checkout-svc (bad env var)
- `K8S-INC-1026` OOMKilled — search-api (mem limit too low)
- `K8S-INC-1027` Pending pod — node pressure / unschedulable
- `K8S-INC-1028` Rolling update stuck — readiness probe failing
- `K8S-INC-1029` Service unreachable — ClusterIP selector mismatch
- `K8S-INC-1030` Image build failed (Docker) — Dockerfile RUN error
- `K8S-INC-1031` Registry push denied — RBAC on GHCR

Each incident carries:
- 5W1H briefing (Who/What/Where/When/Why/How + severity rationale)
- Description, affected assets (pod, deployment, node, image)
- Original event (kubectl describe / docker build excerpt)
- Phase chain (10 K8s/DevOps stages: Plan → Code → Build → Scan → Push → Deploy → Schedule → Run → Observe → Recover) with the current stage highlighted
- Cross-tool enrichment: aligned tools (kubectl, Docker, Helm, ArgoCD, Prometheus, Grafana, Trivy, Falco) with tab content for Logs / Metrics / Vulnerabilities / Response
- Relevant CVEs (Trivy-style) for image-related incidents
- Next steps (L1/L2/L3) and response actions (rollback, restart, scale, re-pull)
- Linked lab slug so "Open Lab" jumps back into the simulator

### 2. K8s Incidents UI (new)
- `src/ops/modules/k8s/IncidentsList.tsx` — list with live feed strip + timeline bar + filter chips, modeled after the second screenshot
- `src/ops/modules/k8s/IncidentDetail.tsx` — full detail page modeled after the first screenshot: yellow analyst briefing card, description, affected assets cards, original event block, phase pipeline, cross-tool enrichment tabs (Logs / Metrics / Vulnerabilities / Response), response action row
- Reuses existing `SectionCard`, `PageHeader`, `OpsTabs`, `ActivityTimeline`, `AssigneeChip`, `SeverityBadge`

### 3. Routes + sidebar wiring
- `src/App.tsx` — add two routes under `/ops`: `/ops/k8s-incidents` and `/ops/k8s-incidents/:id`
- `src/ops/layout/navConfig.ts` — add "K8s Incidents" link under the existing Kubernetes section

### 4. Lab → incident bridge
- `src/ops/lib/learnerEvents.ts` already emits incidents to localStorage. Extend with a tiny `K8S_LAB_TO_INCIDENT` map so when a K8s lab in `LabSimulator` triggers an event, it links to the right `K8S-INC-xxxx` detail page.
- On the K8s lab page (`src/pages/Lab.tsx` and `src/pages/LabSimulator.tsx`), add a small "View in Ops Console →" button when a lab has a mapped incident. Anonymous trial users keep access (already wired in OpsLayout).

### 5. No regressions
- Only new files in `src/ops/modules/k8s/` + 2 small additions to `App.tsx` and `navConfig.ts`
- Lab.tsx / LabSimulator.tsx get one additional render block guarded by `slug.startsWith("k8s-")`
- SOC, ITSM, SRE, Cloud, DevOps, CCNA, CSA, ITSM, Pen200, CDL files: untouched

## Out of scope
- No DB changes — incidents are static seed data like the existing notables/clusters
- No new auth changes — existing K8s trial access continues to work
- Not rewriting existing K8s Clusters/Workloads/Pods/Containers pages (they stay as-is)
