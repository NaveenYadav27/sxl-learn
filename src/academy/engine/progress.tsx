/**
 * Academy progress — persisted in localStorage per learner (or "guest").
 * Mastery per skill is derived from lesson state, never accumulated, so replays can't double count.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AcademyState, CapstoneReport, Lesson, LessonProgress, ReadinessKey, RubricLine } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { lessonObjectives, PASS_MARK, SKILLS } from "./curriculum";

export const STORAGE_PREFIX = "sxl-soc-academy-v1";

export function emptyState(): AcademyState {
  return { version: 1, lessons: {}, dictionaryViewed: [], mentorQuestions: 0, capstone: { report: null, grade: null, rubric: [] } };
}

export function emptyLesson(): LessonProgress {
  return {
    status: "in_progress", tabsSeen: [], objectivesDone: [], objectiveHintLevel: {}, assessmentScore: null,
    assessmentAttempts: 0, assessmentAnswers: {}, hintsUsed: 0, deepHintsUsed: 0, labAttempts: 0, mistakes: 0,
    reflections: {}, startedAt: Date.now(),
  };
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export function lessonStatus(p: LessonProgress | undefined): LessonStatus {
  if (!p) return "not_started";
  return p.status === "completed" ? "completed" : "in_progress";
}

export function labComplete(lesson: Lesson, p: LessonProgress | undefined): boolean {
  if (!p) return false;
  return lessonObjectives(lesson).every((o) => p.objectivesDone.includes(o.id));
}

export function assessmentPassed(p: LessonProgress | undefined): boolean {
  return (p?.assessmentScore ?? 0) >= PASS_MARK;
}

export function canComplete(lesson: Lesson, p: LessonProgress | undefined): boolean {
  return labComplete(lesson, p) && assessmentPassed(p);
}

/** Objective credit: full marks without hints, −15% per hint level, never below 25%. */
export function objectiveCredit(hintLevel: number): number {
  return Math.max(0.25, 1 - 0.15 * hintLevel);
}

export interface Mastery { key: ReadinessKey; label: string; earned: number; possible: number; pct: number }

export function computeMastery(lessons: Lesson[], state: AcademyState): { skills: Mastery[]; readiness: number } {
  const acc = Object.fromEntries(SKILLS.map((s) => [s.key, { earned: 0, possible: 0 }])) as Record<ReadinessKey, { earned: number; possible: number }>;
  for (const l of lessons) {
    const p = state.lessons[l.id];
    for (const o of lessonObjectives(l)) {
      const a = acc[o.skill] ?? acc.foundations;
      a.possible += 1;
      if (p?.objectivesDone.includes(o.id)) a.earned += objectiveCredit(p.objectiveHintLevel[o.id] ?? 0);
    }
    for (const q of l.assessment) {
      const a = acc[q.skill] ?? acc.foundations;
      a.possible += 1;
      if (p?.assessmentAnswers[q.id]) a.earned += 1;
    }
  }
  for (const r of state.capstone.rubric) {
    const a = acc[r.skill]; if (!a) continue;
    a.possible += 1; a.earned += r.max ? r.score / r.max : 0;
  }
  const skills = SKILLS.map((s) => {
    const { earned, possible } = acc[s.key];
    return { key: s.key, label: s.label, earned, possible, pct: possible ? Math.round((earned / possible) * 100) : 0 };
  });
  const readiness = Math.round(skills.reduce((x, s) => x + s.pct, 0) / skills.length);
  return { skills, readiness };
}

function load(key: string, isUser = false): AcademyState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (isUser) {
        const guestRaw = localStorage.getItem(`${STORAGE_PREFIX}:guest`);
        if (guestRaw) {
          const parsedGuest = JSON.parse(guestRaw) as AcademyState;
          if (parsedGuest?.version === 1 && Object.keys(parsedGuest.lessons || {}).length > 0) {
            return { ...emptyState(), ...parsedGuest };
          }
        }
      }
      return emptyState();
    }
    const parsed = JSON.parse(raw) as AcademyState;
    if (parsed?.version !== 1) return emptyState();
    // forward-fill fields added after the first release
    for (const id of Object.keys(parsed.lessons)) parsed.lessons[id] = { ...emptyLesson(), ...parsed.lessons[id] };
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

interface Ctx {
  state: AcademyState;
  lesson: (id: string) => LessonProgress | undefined;
  startLesson: (id: string) => void;
  markStepSeen: (id: string, step: string) => void;
  completeObjective: (id: string, objectiveId: string) => void;
  revealHint: (id: string, objectiveId: string) => number;
  recordMistake: (id: string) => void;
  recordLabAttempt: (id: string) => void;
  submitAssessment: (id: string, answers: Record<string, boolean>) => number;
  saveReflection: (id: string, promptId: string, text: string) => void;
  completeLesson: (lesson: Lesson) => boolean;
  resetLesson: (id: string) => void;
  resetLab: (id: string) => void;
  viewTerm: (termId: string) => void;
  countMentorQuestion: () => void;
  saveCapstone: (report: CapstoneReport, rubric: RubricLine[]) => void;
  resetAll: () => void;
}

const AcademyCtx = createContext<Ctx | null>(null);
export const AcademyCtxExport = AcademyCtx;

export function AcademyProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isUser = Boolean(user?.id);
  const key = `${STORAGE_PREFIX}:${user?.id ?? "guest"}`;
  const [state, setState] = useState<AcademyState>(() => load(key, isUser));

  useEffect(() => { setState(load(key, isUser)); }, [key, isUser]);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* storage full or blocked */ } }, [key, state]);

  const patchLesson = useCallback((id: string, fn: (p: LessonProgress) => LessonProgress) => {
    setState((s) => ({ ...s, lessons: { ...s.lessons, [id]: fn(s.lessons[id] ?? emptyLesson()) } }));
  }, []);

  const value = useMemo<Ctx>(() => ({
    state,
    lesson: (id) => state.lessons[id],
    startLesson: (id) => setState((s) => (s.lessons[id] ? s : { ...s, lessons: { ...s.lessons, [id]: emptyLesson() } })),
    markStepSeen: (id, step) => patchLesson(id, (p) => (p.tabsSeen.includes(step) ? p : { ...p, tabsSeen: [...p.tabsSeen, step] })),
    completeObjective: (id, oid) => patchLesson(id, (p) => (p.objectivesDone.includes(oid) ? p : { ...p, objectivesDone: [...p.objectivesDone, oid] })),
    revealHint: (id, oid) => {
      const cur = state.lessons[id]?.objectiveHintLevel[oid] ?? 0;
      const next = Math.min(5, cur + 1);
      patchLesson(id, (p) => {
        const c = p.objectiveHintLevel[oid] ?? 0;
        if (c >= 5) return p;
        const n = c + 1;
        return { ...p, objectiveHintLevel: { ...p.objectiveHintLevel, [oid]: n }, hintsUsed: p.hintsUsed + 1, deepHintsUsed: p.deepHintsUsed + (n >= 3 ? 1 : 0) };
      });
      return next;
    },
    recordMistake: (id) => patchLesson(id, (p) => ({ ...p, mistakes: p.mistakes + 1 })),
    recordLabAttempt: (id) => patchLesson(id, (p) => ({ ...p, labAttempts: p.labAttempts + 1 })),
    submitAssessment: (id, answers) => {
      const total = Object.keys(answers).length || 1;
      const score = Math.round((Object.values(answers).filter(Boolean).length / total) * 100);
      patchLesson(id, (p) => {
        const best = p.assessmentScore === null || score >= p.assessmentScore;
        return { ...p, assessmentAttempts: p.assessmentAttempts + 1, assessmentScore: best ? score : p.assessmentScore, assessmentAnswers: best ? answers : p.assessmentAnswers };
      });
      return score;
    },
    saveReflection: (id, pid, text) => patchLesson(id, (p) => ({ ...p, reflections: { ...p.reflections, [pid]: text } })),
    completeLesson: (lesson) => {
      const p = state.lessons[lesson.id];
      if (!canComplete(lesson, p)) return false;
      patchLesson(lesson.id, (x) => ({ ...x, status: "completed", completedAt: x.completedAt ?? Date.now() }));
      return true;
    },
    resetLesson: (id) => setState((s) => { const { [id]: _drop, ...rest } = s.lessons; return { ...s, lessons: rest }; }),
    resetLab: (id) => patchLesson(id, (p) => ({ ...p, objectivesDone: [], objectiveHintLevel: {}, labAttempts: p.labAttempts + 1 })),
    viewTerm: (tid) => setState((s) => (s.dictionaryViewed.includes(tid) ? s : { ...s, dictionaryViewed: [...s.dictionaryViewed, tid] })),
    countMentorQuestion: () => setState((s) => ({ ...s, mentorQuestions: s.mentorQuestions + 1 })),
    saveCapstone: (report, rubric) => setState((s) => ({
      ...s,
      capstone: { report, rubric, grade: Math.round((rubric.reduce((x, r) => x + r.score, 0) / Math.max(1, rubric.reduce((x, r) => x + r.max, 0))) * 100), submittedAt: Date.now() },
    })),
    resetAll: () => setState(emptyState()),
  }), [state, patchLesson]);

  return <AcademyCtx.Provider value={value}>{children}</AcademyCtx.Provider>;
}

export function useAcademy(): Ctx {
  const c = useContext(AcademyCtx);
  if (!c) throw new Error("useAcademy must be used inside AcademyProgressProvider");
  return c;
}

export { PASS_MARK };
