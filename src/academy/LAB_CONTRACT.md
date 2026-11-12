# SOC Academy — lab action contract

Every lab component emits actions `{ action, value?, view? }`. An objective's `action: ExpectedAction`
is satisfied when an emitted action matches (`src/academy/engine/matcher.ts`):

- `{ type: "navigate", to }`        → action "navigate" and view === to
- `{ type: "click", target }`       → action === `click:${target}` (exact)
- `{ type: "select", target, value? }` → action === `select:${target}`; if value contains "=" it must match exactly
  (case-insensitive), otherwise substring match
- `{ type: "run-spl", contains? }`  → action "run-spl", SPL contains substring (case-insensitive)

Hints: every objective has exactly 5 hints, progressive:
1 concept → 2 investigative direction → 3 field / query guidance → 4 worked example → 5 the answer.
Never put the answer in hints 1–3.

## Lab kinds and the actions they emit

### console — the educational Splunk ES-style simulator (`SplunkEsSimulator` with `scenario`)
Views (navigate.to): search, dashboards, security-posture, incident-review, risk-analysis, investigation,
glass-tables, correlation-searches, assets-identities, threat-intel, mitre-attack
Clicks: open-notable:<NOTABLE_ID> (scenario notable ids e.g. ACAD-NOT-2001), assign-to-me,
change-status:in-progress, set-disposition:true-positive | set-disposition:false-positive | set-disposition:benign,
add-comment, add-to-investigation, run-adaptive-response, suppress-notable, resolve-notable,
pivot-risk:<risk object>, open-correlation:<rule name>, tune-rule, add-attack-mapping, enable-rule,
lookup-intel:<indicator>, open-asset:<entity value>, open-technique:<technique id>
Selects: status-filter (value new|in progress|pending|resolved|all), time-range
run-spl: SPL run from Search & Reporting (executed against scenario events)
Optional `lab.triageAlerts` adds a triage board → emits `select:triage` value `<alertId>=<priority>` and
`click:triage-all-correct` once every alert is classified correctly.

### logs — raw-event analysis (`lab.logEventIds`, `lab.logQuestions`)
Emits `select:log-answer` value `<questionId>=<answer>` (answer = option text, event id, or ids joined by ",")
only when the answer is correct. Objective ids should equal question ids.

### spl — SPL trainer (`lab.splExercises`)
Each exercise is graded like an objective (objectives are derived automatically, skill "spl" unless
the lesson's objectives override). Emits `run-spl` and `click:spl-exercise-pass:<exerciseId>`.

### investigation / capstone — Investigation Workspace
Tabs (navigate.to): overview, timeline, events, entities, risk, mitre, intel, evidence, notes
Clicks: open-event:<eventId>, add-evidence:<eventId>, lookup-intel:<indicator>, add-note, escalate
Selects: tag-entity value `<entity>=<role>` (attacker|victim|compromised|suspicious|benign|asset),
patient-zero value `<entity>`, map-technique value `<techniqueId>`, severity value critical|high|medium|low
run-spl: search box in the Events tab
Capstone only: `click:submit-report` (report graded by rubric).

### risk — Risk-Based Alerting lab (`lab.riskThreshold`)
Clicks: play-replay, open-risk-object:<object>, create-risk-notable:<object>, toggle-mode:alerts, toggle-mode:rba
Selects: threshold value `<number>`, risk-verdict value `<object>=<investigate|monitor|ignore>`

### mitre — ATT&CK mapping lab
Clicks: open-tactic:<TA id>, open-technique:<T id>, lookup-intel:<indicator>, view-coverage
Selects: map-event value `<eventId>=<techniqueId>` (emitted for every attempt; wrong = mistake)

### ir — incident response decision lab (`lab.irNodes`)
Selects: ir-decision value `<nodeId>=<optionId>` (every attempt). Click: ir-complete after the last node.

## Derive event ids from scenario exports, never hard-code them
```ts
import { LATERAL_MOVE } from "../scenarios";
const lsassId = LATERAL_MOVE.mitreMap.find((m) => m.techniqueId === "T1003.001")!.eventIds[0];
```
