# M1/M2 Incidents → Interactive Step-by-Step Labs

Turn every Module 1 & Module 2 K8s incident into a full, console-driven lab inside the existing Ops Console — no new pages, no UI redesign. Each incident becomes a scripted walkthrough taking the student from **Plan → Build → Deploy → Observe → Triage → Fix → Verify → Postmortem**, with an interactive terminal that streams real expected output for every command.

## Scope guardrails

- Only files under `src/ops/modules/k8s/**` + one new component `IncidentLabConsole.tsx`.
- Reuse `SectionCard`, `OpsTabs`, `SeverityBadge`, `K8S_PHASES`, `TOOL_CATALOG`, `HoverTerm`.
- No changes to other courses, no DB, no routes, no auth.
- Existing incident list / dashboards untouched.

## 1. Data model — extend each M1/M2 incident with a `lab` block

Add to `K8sIncident` interface in `incidentsData.ts`:

```ts
lab?: {
  objective: string;             // what the student will prove
  prerequisites: string[];       // "Docker installed", "lab-docker-01 reachable"
  estimated_minutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: LabStep[];              // 8–12 steps per incident
};

type LabStep = {
  id: string;                    // "s1"
  phase: K8sPhaseId;             // plan|code|build|test|deploy|run|observe|triage|fix|recover
  tool: AlignedTool;             // which tool the student is using
  title: string;                 // "Reproduce the OOM"
  why: string;                   // teaching note
  command: string;               // exact CLI to run
  shell: "bash" | "powershell" | "kubectl" | "docker" | "crictl";
  expected_output: string;       // multi-line block streamed by the console
  success_check: string;         // "exit code 137 visible"
  hint: string;                  // shown on Reveal
  concept_ref?: string;          // HoverTerm key
};
```

Populate **all 20 M1/M2 incidents** with a 10-step lab each, covering the full lifecycle:

| Phase | Typical step |
|-------|--------------|
| plan | Read the alert, identify the failing component |
| code/build | Inspect Dockerfile / manifest |
| deploy | `docker run` / `kubectl apply` to reproduce |
| run | Watch container behavior with `docker stats` / `kubectl get pods -w` |
| observe | Pull metrics (Prometheus / `docker stats`) and logs (`journalctl`, `kubectl logs`) |
| triage | Inspect cgroups / namespaces / events / image layers |
| fix | Apply the corrective command (`docker update`, edit Dockerfile, push v2) |
| verify | Re-run health check |
| recover | Document runbook entry |
| postmortem | One-line learning takeaway |

Every step's `expected_output` is a realistic block (real kernel/docker/k8s formatting) so the console feels live.

## 2. New component — `IncidentLabConsole.tsx`

A compact, dark, terminal-style panel rendered **inside the existing IncidentDetail page** (new tab "Lab"). No layout changes elsewhere.

Features:
- **Step list (left, 30%)** — numbered, phase chip, tool icon, status (pending / current / done). Click to jump.
- **Terminal (right, 70%)** — monospace, shows the command at the prompt, a "Run" button. On click, the expected_output streams line-by-line (10ms/line) into the scrollback, then prints a green ✓ success_check line. "Reveal hint" button shows hint inline.
- **Top bar** — objective, difficulty pill, ETA, progress bar (`x / n` steps), Reset button.
- **Bottom bar** — "Why this step matters" (the `why` text) + tool descriptor pulled from `TOOL_CATALOG` + hover-term links to glossary.
- **Phase rail** — horizontal strip of all 10 `K8S_PHASES`; current step's phase glows.
- State held in component (no persistence). Reset re-arms all steps.

Visual: pure semantic ops tokens (`--ops-bg`, `--ops-panel`, `--ops-accent`, `--ops-success`). Already-imported CSS variables; no new tailwind colors.

## 3. Wire into `IncidentDetail.tsx`

- Add a fifth tab to the existing `OpsTabs`: `intel | logs | metrics | vuln | response` → **add `lab`** (label "Interactive Lab", icon `Terminal`). Only enabled when `n.lab` is present (so only M1/M2 incidents).
- Tab body renders `<IncidentLabConsole lab={n.lab} incidentId={n.id} />`.
- No other layout changes; existing Runtime Explanation / Real Commands cards stay in their current tabs.

## 4. Tool catalog touch-up

In `toolStack.ts`, ensure every tool referenced by lab steps has `command_example` and `why_it_matters` so the console bottom bar can render them. Add any missing one-liners — no new tools beyond those already added (Docker, containerd, runc, crictl, journalctl, kubectl, Helm, BuildKit, Trivy, Snyk, GitHub Actions, Jenkins, Prometheus, Grafana).

## 5. Glossary

Reuse existing `DOCKER_HOVER_TERMS`. Add 4 missing keys used by new lab steps: `pids-max`, `eagain`, `entrypoint`, `multistage`.

## Files touched

**Edit**
- `src/ops/modules/k8s/incidentsData.ts` — add `lab` field on type + 20 lab blocks (10 steps each).
- `src/ops/modules/k8s/IncidentDetail.tsx` — add "Lab" tab.
- `src/ops/modules/k8s/toolStack.ts` — fill missing `command_example` / `why_it_matters`.
- `src/lib/dockerHoverTerms.ts` — 4 new terms.

**Create**
- `src/ops/modules/k8s/IncidentLabConsole.tsx` — interactive console component.

## Out of scope

- M3 / M4 / M5 labs.
- Other courses (SOC, ITSM, SRE, Cloud, DevOps, CCNA, CSA, Pen200, CDL, Splunk).
- Persistence, scoring, backend, auth, new routes, sidebar/topbar changes.
- Real shell execution — the console is a deterministic scripted player.

## Out-the-door experience

Student opens any M1 or M2 incident → clicks **Interactive Lab** tab → sees a 10-step scripted run through Plan → Recover with a real-looking terminal, per-step "why", tool reference, and hover-term glossary. By the end of M1 + M2 (20 labs) they have walked the full Docker + container-runtime lifecycle hands-on.
