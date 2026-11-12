/**
 * SOC Academy — shared types for the 10-hour SOC Analyst learning simulator.
 * The Academy wraps the existing SplunkEsSimulator with a lesson engine:
 * CONCEPT → DEFINITIONS → VISUAL → DEMO → LAB → AI MENTOR → ASSESSMENT → REFLECTION.
 */

/* ---------------- Simulator action contract (mirrors SplunkEsSimulator) ---------------- */
export interface ExpectedAction {
  type?: string;            // navigate | click | select | run-spl | any
  to?: string;
  target?: string;
  value?: string;
  contains?: string;
  equals?: string;
  [key: string]: unknown;
}

/* ---------------- Dictionary ---------------- */
export type TermCategory =
  | "foundations" | "data" | "spl" | "detection" | "triage"
  | "risk" | "intel" | "mitre" | "response";

export interface SocTerm {
  id: string;
  term: string;
  category: TermCategory;
  short: string;        // one-liner
  full: string;         // 2–3 sentence explanation
  analogy: string;      // beginner-friendly analogy
  example: string;      // concrete SOC example
  related: string[];    // other term ids
}

/* ---------------- MITRE ---------------- */
export interface MitreTactic {
  id: string;           // TA0001
  name: string;
  question: string;     // "How did they get in?"
  order: number;
}

export interface MitreTechnique {
  id: string;           // T1110.001
  name: string;
  tacticIds: string[];
  description: string;
  example: string;
  logSources: string[];
  detectionIdea: string;
}

/* ---------------- Scenario engine ---------------- */
export type ScenarioId =
  | "brute-force" | "phish-powershell" | "c2-beacon" | "dns-tunnel"
  | "priv-esc" | "lateral-move" | "ransomware" | "insider-exfil" | "capstone-apt";

export interface SimEvent {
  id: string;
  time: string;                                // "2026-05-07 09:12:04"
  epoch: number;
  index: string;                               // wineventlog | sysmon | firewall | dns | proxy | edr | linux_secure | cloud
  sourcetype: string;
  host: string;
  fields: Record<string, string | number>;
  raw: string;
  mitre?: string[];                            // technique ids
  risk?: { object: string; objectType: "user" | "system"; score: number; rule: string };
}

export type EntityRole = "attacker" | "victim" | "compromised" | "suspicious" | "asset" | "benign";

export interface ScenarioEntity {
  type: "user" | "host" | "ip" | "domain" | "hash" | "process";
  value: string;
  role: EntityRole;
  note: string;
}

export interface ScenarioNotable {
  id: string;                                  // ACAD-NOT-xxxx
  title: string;
  urgency: "critical" | "high" | "medium" | "low";
  rule: string;
  entity: string;
  description: string;
  eventIds: string[];
  recommendedActions: string[];
}

export interface IntelHit {
  indicator: string;
  type: "ip" | "domain" | "hash" | "url";
  threat: string;
  source: string;
  confidence: number;                          // 0-100
  eventIds: string[];
}

export interface TimelinePhase {
  phase: string;                               // human label
  tacticId: string;                            // MITRE tactic
  summary: string;
  eventIds: string[];
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  attackStory: string[];                       // ordered narrative for review / mentor
  events: SimEvent[];
  notables: ScenarioNotable[];
  intel: IntelHit[];
  entities: ScenarioEntity[];
  mitreMap: { techniqueId: string; evidence: string; eventIds: string[] }[];
  timeline: TimelinePhase[];
  patientZero: { entity: string; explanation: string };
}

/* ---------------- SPL engine ---------------- */
export interface SplResult {
  columns: string[];
  rows: (string | number)[][];
  eventCount: number;                          // rows matched by base search
  explanations: { command: string; text: string }[];
  error?: string;
  warning?: string;
}

export interface SplExercise {
  id: string;
  title: string;
  task: string;
  starter?: string;
  solution: string;
  hints: string[];                             // progressive
  explanation: string;                         // shown after success
  validate: {
    mustContain?: string[];                    // substrings required in the SPL
    minRows?: number;
    maxRows?: number;
    mustProduceCols?: string[];
  };
}

/* ---------------- Lesson engine ---------------- */
export type ConceptBlock =
  | { kind: "p"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "flow"; title?: string; steps: string[] }
  | { kind: "grid"; title?: string; items: { title: string; text: string }[] }
  | { kind: "table"; title?: string; cols: string[]; rows: string[][] }
  | { kind: "callout"; tone: "info" | "tip" | "warn"; title: string; text: string }
  | { kind: "layers"; title: string; lanes: { label: string; items: string[] }[] }
  | { kind: "code"; title?: string; code: string; explain?: string[] }
  | { kind: "funnel"; title?: string; stages: { label: string; value: string; note?: string }[] }
  | { kind: "timeline"; title?: string; items: { time: string; label: string; tone?: "info" | "warn" | "danger" | "ok" }[] }
  | { kind: "compare"; title?: string; left: { title: string; points: string[] }; right: { title: string; points: string[] } }
  | { kind: "stats"; title?: string; items: { label: string; value: string; note?: string }[] };

export interface DemoStep {
  id: string;
  title: string;
  narration: string;                           // supports [[term]] refs
  screen: {
    area: string;                              // e.g. "Incident Review"
    focus: string;                             // what the learner should look at
    detail: string[];                          // bullet observations
    spl?: string;
  };
}

export interface LabObjective {
  id: string;
  title: string;
  instruction: string;                         // supports [[term]] refs
  action: ExpectedAction;                      // matched against simulator / lab component actions
  hints: string[];                             // 5 levels: nudge → concept → where → how → exact
  why: string;                                 // why a real analyst does this
  skill: ReadinessKey;                         // which readiness dimension this objective trains
  termRefs?: string[];
}

export type LabKind = "console" | "spl" | "investigation" | "risk" | "mitre" | "ir" | "capstone";

export interface IrOption {
  id: string;
  label: string;
  correct: boolean;
  consequence: string;                         // what happens if chosen (shown after choosing)
}

export interface IrNode {
  id: string;
  phase: "identification" | "containment" | "eradication" | "recovery" | "lessons-learned";
  situation: string;                           // supports [[term]] refs
  question: string;
  options: IrOption[];
}

export interface LessonLab {
  kind: LabKind;
  scenarioId?: ScenarioId;
  intro: string;
  objectives: LabObjective[];
  splExercises?: SplExercise[];                // spl labs: each exercise is graded like an objective
  irNodes?: IrNode[];                          // ir labs: ordered decision points
  riskThreshold?: number;                      // risk labs: default risk-notable threshold
}

export type ReadinessKey =
  | "detection" | "investigation" | "evidence" | "mitre"
  | "severity" | "containment" | "reporting" | "independence";

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  skill: ReadinessKey;
}

export interface ReflectionPrompt {
  id: string;
  prompt: string;
  placeholder: string;
}

export interface Lesson {
  id: string;                                  // "l01"
  number: number;
  title: string;
  tagline: string;
  durationMin: number;
  scenarioId?: ScenarioId;
  heroTermIds: string[];                       // terms introduced in this lesson
  objectives: string[];                        // learning objectives (plain)
  concept: ConceptBlock[];
  demo: DemoStep[];
  lab: LessonLab;
  assessment: AssessmentQuestion[];
  reflection: ReflectionPrompt[];
  mentorBriefing: string;                      // what the mentor says when asked "explain this lesson"
  visual: ConceptBlock[];                      // VISUAL EXPLANATION tab — diagrams, flows, funnels
  challenges: string[];                        // Socratic questions the mentor asks in "challenge" mode
}

export type LessonStep =
  | "concept" | "definitions" | "visual" | "demo" | "lab" | "mentor" | "assessment" | "reflection";

/** One action emitted by the simulator or an Academy lab component. */
export interface LabActionEvent {
  action: string;                              // "navigate" | "click:<target>" | "select:<target>" | "run-spl"
  view?: string;
  value?: string;
  detail: string;
  at: number;
}

/* ---------------- Mentor ---------------- */
export type MentorMode = "explain" | "hint" | "investigate" | "challenge" | "review";

export interface MentorMessage {
  role: "mentor" | "learner";
  text: string;
  mode?: MentorMode;
  at: number;
}

/* ---------------- Progress ---------------- */
export interface LessonProgress {
  status: "in_progress" | "completed";
  tabsSeen: string[];
  objectivesDone: string[];                    // includes completed spl exercise ids
  objectiveHintLevel: Record<string, number>;  // highest hint level (0-5) revealed per objective
  assessmentScore: number | null;              // best score 0-100
  assessmentAttempts: number;
  assessmentAnswers: Record<string, boolean>;  // best-attempt correctness per question id
  hintsUsed: number;
  deepHintsUsed: number;                       // level >= 3
  reflections: Record<string, string>;
  startedAt: number;
  completedAt?: number;
}

export interface SkillSignal { earned: number; possible: number }

export interface RubricLine { label: string; score: number; max: number; note: string; skill: ReadinessKey }

export interface CapstoneReport {
  summary: string;
  patientZero: string;
  severity: "critical" | "high" | "medium" | "low" | "";
  techniques: string[];
  containment: string[];
  timelineNotes: string;
}

export interface AcademyState {
  version: 1;
  lessons: Record<string, LessonProgress>;
  dictionaryViewed: string[];
  mentorQuestions: number;
  capstone: { report: CapstoneReport | null; grade: number | null; rubric: RubricLine[]; submittedAt?: number };
}
