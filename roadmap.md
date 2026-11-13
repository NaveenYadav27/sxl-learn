# Roadmap — ShadowXLab SXL-Learn

## Completed Core Enhancements

### 1. SOC Academy — 10-Hour SOC Analyst Learning Simulator
Lives at `/ops/academy/*` inside the ops shell. Educational Splunk ES-style simulator with deterministic attack scenarios.

#### Completed
- [x] Types, SOC dictionary (50+ terms), and MITRE ATT&CK reference subset
- [x] 9 deterministic scenarios (`src/academy/data/scenarios/*`)
- [x] Engines: SPL query engine (`splEngine.ts`), action matcher (`matcher.ts`), progress/readiness tracker (`progress.tsx`), contextual AI mentor (`mentor.ts`)
- [x] SplunkEsSimulator: `onAction`, `scenario`, `showObjectiveHint`, scenario-driven views, MITRE view, Explain panel
- [x] Components: `TermChip`/`RichText`, `ConceptBlocks`, `LessonShell` (8-step learning journey, objectives gate, progressive hints ladder, replay/reset), `MentorPanel`, `ObjectivesPanel`
- [x] Labs: `ConsoleLab`, `TriageBoard`, `LogAnalysisLab`, `SplTrainer`, `InvestigationLab`, `InvestigationWorkspace`, `RiskLab`, `MitreLab`, `IrLab`
- [x] Lessons 1–10 complete content (`src/academy/data/lessons/*`)
- [x] Pages & Routing:
  - `/ops/academy` — Curriculum Overview & 10 Skills Readiness Radar
  - `/ops/academy/lesson/:id` — Interactive Lesson Shell with 8-step learning journey
  - `/ops/academy/labs` — Labs Catalog (10 Simulators)
  - `/ops/academy/dictionary` — Searchable SOC Dictionary with term-to-lab practice links
  - `/ops/academy/mentor` — Dedicated Contextual AI SOC Mentor (5 guided modes)
  - `/ops/academy/mitre` — Interactive MITRE ATT&CK Enterprise Matrix Navigator
  - `/ops/academy/progress` — Readiness Scorecard across 10 competency dimensions
- [x] Navigation: Integrated SOC Academy into `src/ops/layout/navConfig.ts`
- [x] Automated Unit & Integration Tests: SPL engine queries, action matcher, progress scoring, and hint penalty math (`src/test/*`)

### 2. Homepage & Brand Experience
- [x] Updated hero presentation with refined headline, CTAs, and enterprise cybersecurity styling
- [x] Integrated brand philosophy: **EMPOWER • ILLUMINATE • UPHOLD • DEFEND** in `Logo.tsx` and public pages
- [x] Flagship Cybersecurity Learning Pathway: **CYBERSECURITY FUNDAMENTALS → SOC ANALYST → CEH / ETHICAL HACKING**
- [x] Removed public-facing ₹199 price tags and promotional pricing strips across homepage and program pages (`SocProgram`, `ItsmProgram`, `Pen200Program`, `CsaProgram`, `K8sProgram`, `CdlProgram`, `CcnaProgram`)
- [x] Fixed erroneous hardcoded reset toast on mount in `Progress.tsx`
- [x] Cleaned up React hook order in `K8sLabDetail.tsx` and `AdminContent.tsx`

### 3. Kubernetes & Cloud Native Labs
- [x] 16 comprehensive hands-on lab guides with downloadable PDFs and Markdown (`public/resources/labs/*`)
- [x] Master Kubernetes Hands-On Labs Workbook PDF available in Resource Center

## Next Priorities (Queued)
- [ ] Sync Academy progress to Supabase backend for signed-in learners (cross-device persistence)
- [ ] Add interactive packet tracer simulation for CCNA networking modules
- [ ] Expand Active Directory and Kerberos attack simulation scenarios in PEN-200
