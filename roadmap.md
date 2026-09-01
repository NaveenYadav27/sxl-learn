# Roadmap

## SOC Academy — 10-hour SOC Analyst learning simulator (in progress)

### Done
- [x] `src/academy/types.ts` — full type system: lesson engine (CONCEPT→…→REFLECTION), scenario engine, SPL engine, mentor, progress/readiness scoring
- [x] `src/academy/data/dictionary.ts` — 60+ SOC terms with analogies/examples, categorized, `[[term-id]]` inline-ref convention
- [x] `src/academy/data/mitre.ts` — 13 tactics + 25 techniques with log sources & detection ideas

### Next (in order)
- [ ] `src/academy/data/scenarios.ts` — 9 deterministic scenarios (brute-force, phish-powershell, c2-beacon, dns-tunnel, priv-esc, lateral-move, ransomware, insider-exfil, capstone-apt); each: events + notables + intel + entities + mitreMap + timeline + patientZero
- [ ] `src/academy/engine/splEngine.ts` — deterministic SPL over scenario events (search filters, stats/table/sort/dedup/where/top/head/fields/rename/eval) + per-command explanations
- [ ] `src/academy/engine/matcher.ts` — ExpectedAction matcher mirroring SplunkEsSimulator `matches()` semantics for non-simulator labs
- [ ] `src/academy/engine/progress.tsx` — AcademyProgressProvider, localStorage key `sxl-soc-academy-v1`, readiness weights: detection 20 / investigation 25 / evidence 15 / mitre 10 / severity 10 / containment 10 / reporting 5 / independence 5
- [ ] `src/academy/engine/mentor.ts` — 5 modes (explain/hint/investigate/challenge/review), 5-level progressive hints from LabObjective.hints, keyword match over dictionary
- [ ] `SplunkEsSimulator.tsx` — non-breaking: optional `onAction` prop + educational SPL command-breakdown panel in SearchView
- [ ] Components: TermChip (popover from dictionary), LessonShell (8 tabs + gate), ConceptBlocks renderer, DemoTab (guided steps), LabTab (kind-switch: console|spl|investigation|risk|mitre|ir|capstone), MentorPanel, AssessmentTab, ReflectionTab
- [ ] Special labs: SplTrainer, InvestigationWorkspace (Overview/Timeline/Events/Entities/Risk/MITRE/Intel/Evidence/Notes/Mentor), RiskSimulatorLab, MitreMatrixLab, IrDecisionLab (branching, ransomware), CapstoneLab (report + rubric)
- [ ] `src/academy/data/lessons/lesson01..10.ts` + index — L1 SOC Foundations (console tour), L2 Logs & Events (spl basics), L3 SPL Fundamentals (spl), L4 Detection Engineering (console: correlation-searches), L5 Triage (console: incident-review), L6 Investigation & Hunting (investigation ws, c2-beacon), L7 RBA (risk lab), L8 MITRE (matrix lab, lateral-move), L9 IR (ir lab, ransomware), L10 Capstone (capstone-apt)
- [ ] Pages: AcademyLayout (top-nav: Learn/Labs/Console/Investigate/Threat Intel/MITRE/Mentor/Assessment/Progress), LearnPage, LessonPage, LabsPage, ConsolePage (free-play simulator), InvestigatePage, ThreatIntelPage, MitrePage, MentorPage, AssessmentPage, ProgressPage (SOC readiness dashboard)
- [ ] Routes in `App.tsx` under `/academy/*`; ops sidebar link in `navConfig.ts` (Security group, "SOC Academy" badge "10h")
- [ ] Verify: end-to-end Playwright pass through lesson flow + responsive desktop check

### Design notes
- Reuse standard tokens (bg-card, border-border, text-shadowx-gold, primary-soft) to match the simulator's dark enterprise look; no hardcoded colors
- Console-kind labs drive the existing simulator via its unchanged `expectedAction`/`onValidate` contract, one objective at a time
- All mentor/AI behavior is simulated locally — no backend calls
