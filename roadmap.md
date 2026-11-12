# Roadmap

## SOC Academy — 10-hour SOC Analyst learning simulator (in progress)
Lives at /ops/academy/* inside the existing ops shell. Educational Splunk ES-style simulator (not real Splunk).

### Done
- [x] Types, dictionary, MITRE subset
- [x] 9 deterministic scenarios (`src/academy/data/scenarios/*`)

### Now
- [ ] Engines: SPL engine, action matcher, progress/readiness (10 skills, localStorage), contextual mentor (5 modes, 5-level hints)
- [ ] SplunkEsSimulator: optional `onAction`, `scenario`, `showObjectiveHint`; scenario-driven views; MITRE view; Explain panel (non-breaking)
- [ ] Components: TermChip/TermText, ConceptBlocks, LessonShell (7 steps, gate, replay/reset), MentorPanel, Assessment, Reflection
- [ ] Labs: console, triage board, log analysis, SPL trainer, investigation workspace, risk, MITRE, IR decisions, capstone
- [ ] Lessons 1–10 content
- [ ] Pages + nav: Learn, Labs, SOC Console, Investigate, Threat Intel, MITRE, AI Mentor, Assessment, Progress, Dictionary
- [ ] Tests (SPL engine, readiness) + Playwright pass

## Homepage visual redesign (queued — from uploaded brief)
- [ ] Apply the "SHADOWXLAB WEBSITE — VISUAL REDESIGN" brief to the existing homepage: new hero headline/CTAs, flagship learning pathway section, remove price strip and pricing references; keep all programs, routes, buttons and forms working

## Later
- [ ] Sync Academy progress to the backend for signed-in learners (cross-device)
