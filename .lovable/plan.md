## Goal

Add a comprehensive **Kubernetes Hands-On Labs** system inside Module 3 of the existing ShadowXLab K8s course — 12 enterprise labs spanning Beginner → Enterprise → Windows, each with the full 16-section structure you specified, and each downloadable as PDF + Markdown. No existing UI gets redesigned; this is purely additive inside the current Module 3 view.

## What gets built

### 1. Lab content data layer (`src/lib/k8sHandsOnLabs.ts`)

A single typed catalog of 12 labs, each shaped as:

```text
{
  id, slug, title, category, level (Beginner|Engineer|Enterprise),
  durationMin, focus[], 
  objective, conceptsCovered[], prerequisites[],
  architecture: { ascii, narrative },
  steps: [{ command, explanation, expectedOutput, internals }],
  commonErrors[], troubleshooting[], enterpriseRelevance,
  validation[], relatedIncidents[], relatedGuideSections[],
  questions: { beginner[], intermediate[], advanced[], scenario[], viva[] },
  downloads: { pdf, markdown }
}
```

The 12 labs:
1. Install Kubernetes on Ubuntu (kubeadm)
2. Troubleshooting Fundamentals (SRE workflow)
3. Lifecycle & Architecture (API → kubelet → containerd → runc)
4. Pods & Deployments (self-healing, rollback)
5. Services & Networking (ClusterIP/NodePort/DNS)
6. Flannel & CNI
7. Resource Management (requests/limits/OOMKilled)
8. Storage (PV/PVC/StorageClass)
9. Security (RBAC/Secrets/NetworkPolicy)
10. Monitoring (Prometheus/Grafana/Loki)
11. Windows Worker Node
12. Enterprise Incident Investigation

### 2. UI components (inside Module 3, additive)

- `src/ops/modules/k8s/HandsOnLabsSection.tsx` — collapsible section rendered inside the existing Module 3 view, with category filter chips (Beginner / Runtime / Core / Networking / Troubleshooting / Investigation / Enterprise / Windows) and a level filter (Beginner / Engineer / Enterprise).
- `src/ops/modules/k8s/LabCard.tsx` — card per lab: title, level badge, duration, focus tags, "Open Lab" + "Download PDF" + "Download MD" buttons.
- `src/pages/K8sLabDetail.tsx` — full lab page route `/k8s/labs/:slug` rendering all 16 sections with:
  - copy-to-clipboard on every command
  - expected-output console panels
  - hover-explanations on key terms (reuses existing `HoverTerm` / `K8sTerm`)
  - mode toggle: Beginner / Engineer / Enterprise (filters depth of internals + questions shown)
  - inline architecture ASCII diagrams styled as terminal blocks
  - "Related incidents" cross-links to existing `IncidentDetail`
  - "Related guide sections" cross-links to existing K8s Resource Center PDFs
  - Questions accordion with all 5 question types

### 3. Downloadable resources

A Python generation script (`/tmp/build_labs.py`) produces, per lab:
- `public/resources/labs/lab-{n}-{slug}.pdf` (reportlab, enterprise-navy theme matching existing PDFs)
- `public/resources/labs/lab-{n}-{slug}.md`
Plus a combined `public/resources/labs/Kubernetes_HandsOn_Labs_Workbook.pdf` (all 12 labs in one workbook).

The catalog references these paths so the download buttons just link to `/resources/labs/...`.

### 4. Integration points (minimal, additive)

- `src/App.tsx` — add route `/k8s/labs/:slug` → `K8sLabDetail`.
- `src/pages/Module.tsx` — when current module is `k8s-fundamentals` (Module 3), render `<HandsOnLabsSection />` below existing content. No removal, no restyle.
- `src/lib/k8sResources.ts` — add the new workbook to `K8S_RESOURCES` so it appears in the existing Resource Center.
- `src/ops/modules/k8s/RelatedGuideSections.tsx` — extend `INCIDENT_GUIDE_LINKS` so existing incidents link back to the matching new labs.

## What does NOT change

- No edits to operational UI shell, sidebar, topbar, ops layout.
- No removal of any existing incident, module, lab simulator, or page.
- No theme/design-token changes.
- Existing `M3` incidents, simulators, and Resource Center remain exactly as they are — the new labs section sits alongside them.

## Technical notes

- Lab content authored in TypeScript so the same source feeds both the in-app pages and the PDF/MD generator (the script reads via a tiny `tsx` shim or a JSON dump generated at build-time from the TS source).
- PDFs use the same reportlab styling as the existing K8s guide pack for visual consistency.
- All command blocks use the existing `K8sTerminalSimulator`-style monospace panel styling (`bg-[hsl(var(--ops-panel))]`, mono font) — no new design tokens introduced.
- Mode toggle is local component state; no backend/schema changes.
- No database migrations required.

## Deliverables

- 1 catalog file, 2 new components, 1 new page, 1 generation script
- 12 PDF + 12 MD lab files + 1 combined workbook PDF under `public/resources/labs/`
- 4 surgical edits to existing files (App.tsx route, Module.tsx mount, k8sResources.ts entry, RelatedGuideSections.tsx mapping)

Shall I proceed?