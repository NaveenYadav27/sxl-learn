/** Per-lesson runtime: action log, objective matching, mistakes, hints and mentor transcript. */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { LabActionEvent, LabObjective, Lesson, MentorMessage, Scenario } from "../types";
import { getScenario } from "../data/scenarios";
import { actionMatches, type EmittedAction } from "../engine/matcher";
import { lessonObjectives } from "../engine/curriculum";
import { useAcademy } from "../engine/progress";

export interface LabEmit extends EmittedAction { detail: string }

export interface LessonRuntime {
  lesson: Lesson;
  scenario?: Scenario;
  objectives: LabObjective[];
  done: string[];
  current?: LabObjective;
  currentIndex: number;
  actions: LabActionEvent[];
  messages: MentorMessage[];
  setMessages: (fn: (m: MentorMessage[]) => MentorMessage[]) => void;
  emit: (e: LabEmit) => void;
  mistake: (detail: string) => void;
  hintLevel: (objectiveId?: string) => number;
  revealHint: (objectiveId?: string) => number;
  challengeCount: number;
  bumpChallenge: () => void;
  clearActions: () => void;
}

const RuntimeCtx = createContext<LessonRuntime | null>(null);

export function LessonRuntimeProvider({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  const academy = useAcademy();
  const progress = academy.lesson(lesson.id);
  const objectives = useMemo(() => lessonObjectives(lesson), [lesson]);
  const scenario = getScenario(lesson.lab.scenarioId ?? lesson.scenarioId);
  const done = progress?.objectivesDone ?? [];
  const doneRef = useRef(done); doneRef.current = done;
  const currentIndex = objectives.findIndex((o) => !done.includes(o.id));
  const current = currentIndex >= 0 ? objectives[currentIndex] : undefined;
  const [actions, setActions] = useState<LabActionEvent[]>([]);
  const [messages, setMessagesState] = useState<MentorMessage[]>([]);
  const [challengeCount, setChallengeCount] = useState(0);

  const emit = useCallback((e: LabEmit) => {
    setActions((a) => [...a.slice(-199), { action: e.action, value: e.value, view: e.view, detail: e.detail, at: Date.now() }]);
    for (const o of objectives) {
      if (doneRef.current.includes(o.id)) continue;
      if (actionMatches(e, o.action)) {
        doneRef.current = [...doneRef.current, o.id];
        academy.completeObjective(lesson.id, o.id);
        toast.success(`Objective complete: ${o.title}`);
      }
    }
  }, [objectives, academy, lesson.id]);

  const mistake = useCallback((detail: string) => {
    academy.recordMistake(lesson.id);
    setActions((a) => [...a.slice(-199), { action: "mistake", detail: `✗ ${detail}`, at: Date.now() }]);
  }, [academy, lesson.id]);

  const hintLevel = useCallback((oid?: string) => {
    const id = oid ?? current?.id; if (!id) return 0;
    return progress?.objectiveHintLevel[id] ?? 0;
  }, [progress, current]);

  const revealHint = useCallback((oid?: string) => {
    const id = oid ?? current?.id; if (!id) return 0;
    return academy.revealHint(lesson.id, id);
  }, [academy, lesson.id, current]);

  const value: LessonRuntime = {
    lesson, scenario, objectives, done, current, currentIndex, actions, messages,
    setMessages: (fn) => setMessagesState(fn),
    emit, mistake, hintLevel, revealHint, challengeCount,
    bumpChallenge: () => setChallengeCount((c) => c + 1),
    clearActions: () => setActions([]),
  };
  return <RuntimeCtx.Provider value={value}>{children}</RuntimeCtx.Provider>;
}

export function useLessonRuntime(): LessonRuntime {
  const r = useContext(RuntimeCtx);
  if (!r) throw new Error("useLessonRuntime must be used inside LessonRuntimeProvider");
  return r;
}

export function useLessonRuntimeOptional(): LessonRuntime | null {
  return useContext(RuntimeCtx);
}
