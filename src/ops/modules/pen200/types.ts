// PEN-200 / OSCP+ ops module — shared types.
// Mirrors the K8s incident shape (5W1H briefing, phase chain, aligned tools)
// but the lifecycle is the Cyber Kill Chain instead of the DevOps cycle, and
// the tools come from the Kali offensive stack.

export type PentestSeverity = "low" | "medium" | "high" | "critical";
export type PentestStatus = "open" | "in_progress" | "resolved";

// 10 attacker phases, drawn from Lockheed Kill Chain + MITRE ATT&CK tactics.
// We keep 10 so the visual rail matches the K8s "DevOps cycle" feel.
export type PentestPhaseId =
  | "scope"
  | "recon"
  | "weaponize"
  | "deliver"
  | "exploit"
  | "install"
  | "c2"
  | "action"
  | "cleanup"
  | "report";

export const PENTEST_PHASES: { id: PentestPhaseId; label: string; hint: string }[] = [
  { id: "scope",     label: "Scope",     hint: "Rules of engagement" },
  { id: "recon",     label: "Recon",     hint: "Nmap / OSINT / subdomains" },
  { id: "weaponize", label: "Weaponize", hint: "Payload / exploit prep" },
  { id: "deliver",   label: "Deliver",   hint: "Phish / upload / inject" },
  { id: "exploit",   label: "Exploit",   hint: "Vulnerability triggered" },
  { id: "install",   label: "Install",   hint: "Foothold / webshell" },
  { id: "c2",        label: "C2",        hint: "Command & control" },
  { id: "action",    label: "Action",    hint: "Loot / pivot / privesc" },
  { id: "cleanup",   label: "Cleanup",   hint: "Artifacts / persistence" },
  { id: "report",    label: "Report",    hint: "Finding + remediation" },
];

export type AttackTool =
  | "nmap"
  | "gobuster"
  | "ffuf"
  | "burp"
  | "sqlmap"
  | "hydra"
  | "hashcat"
  | "john"
  | "msfconsole"
  | "msfvenom"
  | "searchsploit"
  | "smbclient"
  | "enum4linux"
  | "wpscan"
  | "nikto"
  | "amass"
  | "subfinder"
  | "dig"
  | "curl"
  | "openvas"
  | "responder"
  | "ntlmrelayx"
  | "evil-winrm"
  | "kali-shell"
  | "report-template";

export type PenModuleCode =
  | "PEN-M1" // Intro to cyber / mindset
  | "PEN-M2" // Report writing
  | "PEN-M3" // Information gathering
  | "PEN-M5" // Web app intro
  | "PEN-M6" // Common web attacks
  | "PEN-M7"; // SQL injection

export const PEN_MODULES: { code: PenModuleCode; title: string }[] = [
  { code: "PEN-M1", title: "M1 · Intro to Cybersecurity & Pentester Mindset" },
  { code: "PEN-M2", title: "M2 · Pentest Report Writing" },
  { code: "PEN-M3", title: "M3 · Information Gathering (Recon)" },
  { code: "PEN-M5", title: "M5 · Intro to Web Applications" },
  { code: "PEN-M6", title: "M6 · Common Web Attacks" },
  { code: "PEN-M7", title: "M7 · SQL Injection" },
];

export interface AffectedTarget {
  kind: "Host" | "URL" | "Service" | "Domain" | "Account" | "Database" | "Endpoint";
  name: string;
  detail: string;
  action: string;
  severity: PentestSeverity;
}

export interface CveRow {
  id: string;
  cvss: number;
  title: string;
}

/* -------- Concept panel (kill-chain flow + tool cards) -------- */

export interface KillChainNode {
  id: string;
  label: string;
  def: string;
  attacker_goal: string;     // what the attacker achieves here
  defender_signal: string;   // what defenders should see
  tools: string[];           // tools commonly used at this stage
}

export interface AttackToolCard {
  name: string;
  category: "recon" | "exploit" | "post_ex" | "cracking" | "reporting" | "auxiliary";
  definition: string;
  why_pentesters_use_it: string;
  beginner_view: string;
  advanced_view: string;
  commands: { cmd: string; expected: string }[];
  oscp_relevance: string;
  related_incidents: string[];
}

export interface PentestConcept {
  concept: string;
  definition: string;
  why_it_exists: string;
  blue_team_view: string;        // how defenders detect / prevent
  beginner: string;
  engineer: string;              // experienced pentester view
  kill_chain_flow: KillChainNode[];
  active_stage_id: string;       // node currently being executed in this incident
  tools: AttackToolCard[];
  learn_more: { question: string; answer: string }[];
}

/* -------- Lab playbook -------- */

export type LabShell = "kali" | "bash" | "burp" | "msfconsole" | "powershell" | "browser";
export type LabDifficulty = "beginner" | "intermediate" | "advanced";
export type LabStage =
  | "scope" | "recon" | "weaponize" | "deliver" | "exploit"
  | "install" | "c2" | "action" | "cleanup" | "report"
  | "triage" | "verify";

export interface LabStep {
  id: string;
  phase: LabStage;
  tool: AttackTool;
  shell: LabShell;
  title: string;
  why: string;
  command: string;
  expected_output: string;
  success_check: string;
  hint: string;
}

export interface PentestLab {
  objective: string;
  prerequisites: string[];
  estimated_minutes: number;
  difficulty: LabDifficulty;
  steps: LabStep[];
}

/* -------- The incident itself -------- */

export interface PentestIncident {
  id: string;                     // PEN-INC-XXXX
  title: string;
  severity: PentestSeverity;
  status: PentestStatus;
  owner: string;
  engagement: string;             // e.g. "ACME-2026-Q2"
  target_scope: string;           // e.g. "10.10.10.0/24"
  target: string;                 // primary target hostname / URL

  module: PenModuleCode;
  module_title: string;

  detected_at: string;            // ISO — when finding was first surfaced
  last_event_at: string;          // ISO — last lab artefact captured
  kill_chain: string;             // "Recon → Exploit → Action"
  current_phase: PentestPhaseId;
  reached_phases: PentestPhaseId[]; // phases the attacker has actually executed

  phase_walkthrough?: Partial<Record<PentestPhaseId, string>>;

  briefing: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
    severity_rationale: string;
  };

  description: string;
  original_event: string;         // raw tool output that triggered the finding

  affected: AffectedTarget[];
  aligned_tools: AttackTool[];
  data_sources: string[];

  logs_sample: string;
  metrics_sample: string;         // ASCII "engagement dashboard"
  cves?: CveRow[];
  response_actions: string[];

  next_steps: { level: "L1" | "L2" | "L3"; text: string }[];

  // Cross-link to existing pen200 lab in src/lib/curriculumPen200.ts
  lab_slug?: string;

  // Kill-chain concept payload (rendered by PentestConceptPanel)
  concept?: PentestConcept;
}
