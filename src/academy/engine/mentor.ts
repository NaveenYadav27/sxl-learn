/**
 * AI SOC Mentor — a deterministic, local, context-aware mentor (no network calls).
 * It reads the current lesson, objective, scenario, the learner's actions, mistakes and hint usage.
 */
import type { LabActionEvent, LabObjective, Lesson, MentorMode, Scenario } from "../types";
import { SOC_TERMS } from "../data/dictionary";
import { MITRE_TECHNIQUES, MITRE_TACTICS } from "../data/mitre";
import { COMMAND_DOCS } from "./splEngine";
import { describeExpected } from "./matcher";

export interface MentorContext {
  lesson?: Lesson;
  scenario?: Scenario;
  objective?: LabObjective;
  objectiveIndex?: number;
  totalObjectives?: number;
  done: string[];
  hintLevel: number;               // hints already revealed for the current objective
  actions: LabActionEvent[];
  mistakes: number;
  hintsUsed: number;
  challengeCount?: number;
}

export interface MentorReply { mode: MentorMode; text: string; revealHint?: boolean; hintLevel?: number }

export const HINT_LABELS = ["Concept", "Investigative direction", "Field / query guidance", "Worked example", "Answer"];

export const MODE_META: Record<MentorMode, { label: string; blurb: string }> = {
  explain: { label: "Explain", blurb: "Explain a term, command or this step" },
  hint: { label: "Hint", blurb: "Next progressive hint (5 levels)" },
  investigate: { label: "Investigate with me", blurb: "Talk through the next pivot" },
  challenge: { label: "Challenge", blurb: "Test my reasoning" },
  review: { label: "Review", blurb: "Feedback on what I've done" },
};

export function classifyIntent(q: string): MentorMode {
  const s = q.toLowerCase();
  if (/\b(hint|stuck|help me|what do i do|clue|lost)\b/.test(s)) return "hint";
  if (/\b(next|investigate|where should|pivot|what now|walk me)\b/.test(s)) return "investigate";
  if (/\b(review|how am i|feedback|how did i|score)\b/.test(s)) return "review";
  if (/\b(quiz|challenge|test me|ask me)\b/.test(s)) return "challenge";
  return "explain";
}

function findTermMatch(q: string) {
  const s = ` ${q.toLowerCase()} `;
  let best: { score: number; text: string } | null = null;
  for (const t of SOC_TERMS) {
    const names = [t.id.replace(/-/g, " "), t.term.toLowerCase().replace(/\s*\(.*\)/, ""), ...(t.term.match(/\(([^)]+)\)/)?.[1] ? [t.term.match(/\(([^)]+)\)/)![1].toLowerCase()] : [])];
    for (const n of names) {
      if (n.length < 2) continue;
      const re = new RegExp(`[^a-z0-9]${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?[^a-z0-9]`);
      if (re.test(s)) {
        const score = n.length;
        if (!best || score > best.score)
          best = { score, text: `**[[${t.id}|${t.term}]]** — ${t.full}\n\nThink of it like this: ${t.analogy}\n\nIn a SOC: ${t.example}` };
      }
    }
  }
  for (const t of MITRE_TECHNIQUES) {
    if (s.includes(t.id.toLowerCase()) || s.includes(` ${t.name.toLowerCase()} `)) {
      const tac = t.tacticIds.map((id) => MITRE_TACTICS.find((x) => x.id === id)?.name).filter(Boolean).join(", ");
      return `**${t.id} · ${t.name}** (tactic: ${tac}) — ${t.description}\n\nExample: ${t.example}\nWhere you'd see it: ${t.logSources.join(", ")}.\nDetection idea: ${t.detectionIdea}`;
    }
  }
  const cmd = Object.values(COMMAND_DOCS).find((c) => new RegExp(`(\\||\\b)${c.name}\\b`).test(q.toLowerCase()) && /spl|command|search|\||\bwhat\b|how/.test(q.toLowerCase()));
  if (cmd && (!best || best.score < 5)) return `**SPL · ${cmd.name}** — ${cmd.purpose}\n\nSyntax: \`${cmd.syntax}\`\nExample: \`${cmd.example}\`\nTip: ${cmd.tip}`;
  return best?.text ?? null;
}

function recent(actions: LabActionEvent[], n = 4): string {
  if (!actions.length) return "You haven't taken any actions in this lab yet.";
  return "Your last moves: " + actions.slice(-n).map((a) => a.detail).join(" → ") + ".";
}

function untouchedLead(ctx: MentorContext): string | null {
  const s = ctx.scenario; if (!s) return null;
  const blob = ctx.actions.map((a) => `${a.action} ${a.value ?? ""} ${a.detail}`).join(" ").toLowerCase();
  const lead = s.entities.find((e) => ["attacker", "compromised", "suspicious"].includes(e.role) && !blob.includes(e.value.toLowerCase()));
  return lead ? `One lead you haven't touched yet is the ${lead.type} **${lead.value}**. Ask: what did it do, and when?` : null;
}

export function mentorRespond(ctx: MentorContext, mode: MentorMode, question = ""): MentorReply {
  const obj = ctx.objective;
  const step = ctx.objectiveIndex !== undefined && ctx.totalObjectives ? `Step ${ctx.objectiveIndex + 1} of ${ctx.totalObjectives}` : "";

  if (mode === "hint") {
    if (!obj) return { mode, text: ctx.lesson && ctx.totalObjectives && ctx.done.length >= ctx.totalObjectives ? "Every lab objective is done — no hints needed. Head to the Assessment step." : "Open the Hands-on Lab step first, then ask me for a hint about the current objective." };
    if (ctx.hintLevel >= 5) return { mode, text: `You've seen all 5 hints for "${obj.title}". The last one is the answer — ${obj.hints[4]}\n\nTry it, then tell me what you saw in the results.`, hintLevel: 5 };
    const level = ctx.hintLevel + 1;
    const lead = level <= 2 ? "\n\nTry it before asking for the next hint — each hint lowers this objective's mastery credit a little." : level === 4 ? "\n\nOne more hint will give the full answer." : "";
    return { mode, text: `**Hint ${level}/5 · ${HINT_LABELS[level - 1]}** — ${obj.hints[level - 1]}${lead}`, revealHint: true, hintLevel: level };
  }

  if (mode === "explain") {
    const match = question.trim() ? findTermMatch(question) : null;
    if (match) return { mode, text: match };
    if (obj) return { mode, text: `${step ? `**${step}: ${obj.title}.** ` : ""}${obj.instruction}\n\n**Why analysts do this:** ${obj.why}${obj.termRefs?.length ? `\n\nKey terms: ${obj.termRefs.map((t) => `[[${t}]]`).join(", ")}` : ""}` };
    if (ctx.lesson) return { mode, text: ctx.lesson.mentorBriefing };
    return { mode, text: "Ask me about any SOC term (\"what is a notable?\"), an SPL command (\"what does stats do?\") or an ATT&CK technique (\"explain T1110\")." };
  }

  if (mode === "investigate") {
    const parts: string[] = [];
    if (ctx.scenario) parts.push(`We're working **${ctx.scenario.name}** — "${ctx.scenario.tagline}"`);
    parts.push(recent(ctx.actions));
    if (obj) {
      parts.push(`${step ? `${step}: ` : ""}**${obj.title}.** The goal is to ${describeExpected(obj.action)}. Before you click, say out loud what you expect to find and why it matters: ${obj.why}`);
    } else if (ctx.totalObjectives) parts.push("All objectives are complete — write down your conclusion as if you were handing over to the next shift.");
    const lead = untouchedLead(ctx); if (lead) parts.push(lead);
    if (ctx.mistakes >= 3) parts.push(`You've had ${ctx.mistakes} wrong attempts — slow down and re-read the evidence fields (user, src_ip, host, action) before choosing.`);
    return { mode, text: parts.join("\n\n") };
  }

  if (mode === "challenge") {
    const qs = [...(ctx.lesson?.challenges ?? [])];
    if (ctx.scenario) {
      qs.push(`What single piece of evidence would prove that ${ctx.scenario.patientZero.entity} is where this started — and what would change your mind?`);
      const benign = ctx.scenario.entities.find((e) => e.role === "benign");
      if (benign) qs.push(`${benign.value} also shows up in the data. Is it part of the attack? Defend your answer using fields, not feelings.`);
    }
    if (!qs.length) return { mode, text: "Challenge: explain the difference between an alert and an incident in one sentence, with an example." };
    const q = qs[(ctx.challengeCount ?? 0) % qs.length];
    return { mode, text: `**Challenge:** ${q}\n\nType your reasoning below — I'll review it with you.` };
  }

  // review
  const total = ctx.totalObjectives ?? 0;
  const lines: string[] = [];
  if (total) lines.push(`Objectives: **${ctx.done.length}/${total}** complete. Hints used: **${ctx.hintsUsed}**. Wrong attempts: **${ctx.mistakes}**.`);
  lines.push(recent(ctx.actions, 6));
  const strengths: string[] = []; const improve: string[] = [];
  if (ctx.hintsUsed === 0 && ctx.done.length > 0) strengths.push("you're solving objectives without hints — real independence");
  if (ctx.mistakes === 0 && ctx.done.length > 1) strengths.push("no wrong guesses so far, which suggests you're reading the evidence carefully");
  if (ctx.actions.some((a) => a.action === "run-spl")) strengths.push("you're validating with searches instead of trusting the alert title");
  if (ctx.hintsUsed > Math.max(2, ctx.done.length * 2)) improve.push("you lean on hints a lot — on the next objective, try to stop at hint 2 (direction) and work the rest out");
  if (ctx.mistakes >= 3) improve.push("several wrong attempts — before each choice, write down the field that proves it");
  if (question.trim().length > 20) {
    const kw = (ctx.scenario?.entities ?? []).filter((e) => question.toLowerCase().includes(e.value.toLowerCase()));
    if (kw.length) strengths.push(`your answer cites concrete entities (${kw.map((k) => k.value).join(", ")}) — exactly how a good ticket reads`);
    else improve.push("your answer doesn't name any concrete host, user or IP — always anchor reasoning in evidence");
  }
  if (strengths.length) lines.push(`**Going well:** ${strengths.join("; ")}.`);
  if (improve.length) lines.push(`**To improve:** ${improve.join("; ")}.`);
  if (!strengths.length && !improve.length) lines.push("Take a few actions in the lab and I'll give you specific feedback.");
  return { mode: "review", text: lines.join("\n\n") };
}
