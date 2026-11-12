import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lesson, MentorMessage, MentorMode, Scenario } from "../types";
import { classifyIntent, MODE_META, mentorRespond, type MentorContext } from "../engine/mentor";
import { useAcademy } from "../engine/progress";
import { RichText } from "./RichText";
import { useLessonRuntimeOptional } from "./runtime";

const MODES: MentorMode[] = ["explain", "hint", "investigate", "challenge", "review"];

interface Props {
  compact?: boolean;
  /** Used when the panel is shown outside a lesson (AI Mentor page). */
  standalone?: { lesson?: Lesson; scenario?: Scenario };
}

/** Contextual SOC mentor — simulated locally; reads lesson, objective, scenario, actions, mistakes and hints. */
export function MentorPanel({ compact, standalone }: Props) {
  const rt = useLessonRuntimeOptional();
  const academy = useAcademy();
  const [localMsgs, setLocalMsgs] = useState<MentorMessage[]>([]);
  const [localChallenges, setLocalChallenges] = useState(0);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const messages = rt ? rt.messages : localMsgs;
  const setMessages = rt ? rt.setMessages : (fn: (m: MentorMessage[]) => MentorMessage[]) => setLocalMsgs(fn);
  const lesson = rt?.lesson ?? standalone?.lesson;
  const scenario = rt?.scenario ?? standalone?.scenario;
  const progress = lesson ? academy.lesson(lesson.id) : undefined;

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages, typing]);

  function context(): MentorContext {
    return {
      lesson, scenario,
      objective: rt?.current,
      objectiveIndex: rt && rt.currentIndex >= 0 ? rt.currentIndex : undefined,
      totalObjectives: rt?.objectives.length,
      done: rt?.done ?? [],
      hintLevel: rt ? rt.hintLevel() : 0,
      actions: rt?.actions ?? [],
      mistakes: progress?.mistakes ?? 0,
      hintsUsed: progress?.hintsUsed ?? 0,
      challengeCount: rt ? rt.challengeCount : localChallenges,
    };
  }

  function ask(mode: MentorMode, question = "") {
    const now = Date.now();
    const learnerText = question || `[${MODE_META[mode].label}]`;
    setMessages((m) => [...m, { role: "learner", text: learnerText, mode, at: now }]);
    academy.countMentorQuestion();
    const reply = mentorRespond(context(), mode, question);
    if (reply.revealHint) rt?.revealHint();
    if (mode === "challenge") { if (rt) rt.bumpChallenge(); else setLocalChallenges((c) => c + 1); }
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "mentor", text: reply.text, mode: reply.mode, at: Date.now() }]);
    }, 350);
  }

  function submit() {
    const q = input.trim(); if (!q) return;
    setInput("");
    const last = messages[messages.length - 1];
    // A free-text answer right after a challenge gets reviewed.
    const mode = last?.role === "mentor" && last.mode === "challenge" ? "review" : classifyIntent(q);
    ask(mode, q);
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15"><Bot className="h-4 w-4 text-primary" /></div>
        <div className="min-w-0">
          <div className="text-xs font-semibold">AI SOC Mentor <span className="font-normal text-muted-foreground">· simulated</span></div>
          <div className="truncate text-[10px] text-muted-foreground">
            {rt?.current ? `Watching: ${rt.current.title}` : lesson ? `Lesson ${lesson.number}: ${lesson.title}` : "Ask about any SOC term, SPL command or technique"}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border px-2 py-1.5">
        {MODES.map((m) => (
          <Button key={m} size="sm" variant="outline" className="h-7 px-2 text-[11px]" title={MODE_META[m].blurb} onClick={() => ask(m)}>
            {MODE_META[m].label}
          </Button>
        ))}
      </div>
      <ScrollArea className={compact ? "h-[260px]" : "h-[420px]"}>
        <div className="space-y-3 p-3 text-xs">
          {messages.length === 0 && (
            <div className="rounded-md bg-muted/50 p-3 text-muted-foreground">
              I know which lesson and objective you're on, what you've clicked, and how many hints you've used. Pick a mode above or ask a question — e.g. “what is a notable?”, “what does stats do?”, “where should I pivot next?”.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "learner" ? "justify-end" : ""}`}>
              {m.role === "mentor" && <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
              <div className={`max-w-[88%] rounded-lg px-3 py-2 ${m.role === "mentor" ? "bg-muted/60" : "bg-primary/15"}`}>
                <RichText text={m.text} />
              </div>
              {m.role === "learner" && <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          ))}
          {typing && <div className="flex items-center gap-2 text-muted-foreground"><Bot className="h-4 w-4 text-primary" /> thinking…</div>}
          <div ref={bottom} />
        </div>
      </ScrollArea>
      <form className="flex gap-1.5 border-t border-border p-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Input aria-label="Ask the mentor" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the mentor…" className="h-8 text-xs" />
        <Button size="sm" type="submit" className="h-8 px-2" aria-label="Send"><Send className="h-3.5 w-3.5" /></Button>
      </form>
    </div>
  );
}
