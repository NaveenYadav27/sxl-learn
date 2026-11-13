import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourse";
import { Clock, CheckCircle2, XCircle, Trophy, AlertTriangle, ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  lab_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  module_title?: string;
  module_slug?: string;
};

type Phase = "intro" | "running" | "review";

const QUESTION_COUNT = 50;
const DURATION_MIN = 60;
const PASS_PCT = 70;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Exam() {
  const { user } = useAuth();
  const { course } = useCourse();
  const [phase, setPhase] = useState<Phase>("intro");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [pool, setPool] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_MIN * 60);
  const [loading, setLoading] = useState(true);
  const submittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("lab_questions")
        .select("id, lab_id, question, options, correct_index, explanation, lab:labs(module:modules(title, slug))");
      if (error) { setLoading(false); return; }
      const flat: Question[] = (data ?? []).map((q: any) => ({
        id: q.id,
        lab_id: q.lab_id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correct_index: q.correct_index,
        explanation: q.explanation,
        module_title: q.lab?.module?.title,
        module_slug: q.lab?.module?.slug,
      }));
      setAllQuestions(flat);
      setLoading(false);
    })();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!submittedRef.current) submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  function start() {
    const sample = shuffle(allQuestions).slice(0, Math.min(QUESTION_COUNT, allQuestions.length));
    setPool(sample);
    setAnswers({});
    setFlagged(new Set());
    setIdx(0);
    setSecondsLeft(DURATION_MIN * 60);
    submittedRef.current = false;
    setPhase("running");
  }

  function select(qid: string, optIdx: number) {
    setAnswers((prev) => ({ ...prev, [qid]: optIdx }));
  }

  function toggleFlag(qid: string) {
    setFlagged((prev) => {
      const n = new Set(prev);
      if (n.has(qid)) {
        n.delete(qid);
      } else {
        n.add(qid);
      }
      return n;
    });
  }

  const correctCount = useMemo(
    () => pool.reduce((s, q) => s + (answers[q.id] === q.correct_index ? 1 : 0), 0),
    [pool, answers]
  );
  const scorePct = pool.length ? Math.round((correctCount / pool.length) * 100) : 0;
  const passed = scorePct >= PASS_PCT;

  function submit() {
    submittedRef.current = true;
    setPhase("review");
  }

  // Per-module breakdown for review
  const moduleBreakdown = useMemo(() => {
    if (phase !== "review") return [];
    const map = new Map<string, { title: string; total: number; correct: number }>();
    pool.forEach((q) => {
      const key = q.module_slug ?? "unknown";
      const entry = map.get(key) ?? { title: q.module_title ?? "Other", total: 0, correct: 0 };
      entry.total += 1;
      if (answers[q.id] === q.correct_index) entry.correct += 1;
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [phase, pool, answers]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft <= 5 * 60;

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[{ label: "Practice Exam" }]} />}
      title={course.examTitle}
    >
      <div className="container py-6 max-w-4xl">
        {loading ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Loading question bank…</CardContent></Card>
        ) : phase === "intro" ? (
          <IntroCard count={Math.min(QUESTION_COUNT, allQuestions.length)} available={allQuestions.length} onStart={start} signedIn={!!user} title={course.examTitle} bullets={course.examIntroBullets} />
        ) : phase === "running" ? (
          <RunningExam
            pool={pool}
            idx={idx}
            setIdx={setIdx}
            answers={answers}
            flagged={flagged}
            select={select}
            toggleFlag={toggleFlag}
            mm={mm}
            ss={ss}
            lowTime={lowTime}
            onSubmit={submit}
          />
        ) : (
          <ReviewScreen
            pool={pool}
            answers={answers}
            scorePct={scorePct}
            correctCount={correctCount}
            passed={passed}
            moduleBreakdown={moduleBreakdown}
            secondsUsed={DURATION_MIN * 60 - secondsLeft}
            onRetake={() => setPhase("intro")}
          />
        )}
      </div>
    </AppLayout>
  );
}

function IntroCard({ count, available, onStart, signedIn, title, bullets }: { count: number; available: number; onStart: () => void; signedIn: boolean; title: string; bullets: string[] }) {
  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-primary-soft text-primary grid place-items-center">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Simulated exam conditions — pass mark {PASS_PCT}%</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Questions" value={`${count}`} />
          <Stat label="Time limit" value={`${DURATION_MIN} min`} />
          <Stat label="Pass mark" value={`${PASS_PCT}%`} />
        </div>
        <div className="rounded-md border border-border bg-muted/40 p-4 text-sm space-y-2">
          <p className="font-medium">How it works</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        {available < QUESTION_COUNT && (
          <div className="flex items-start gap-2 rounded-md bg-warning/10 text-warning p-3 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Only {available} questions in the bank — exam will use all of them.</span>
          </div>
        )}
        <div className="flex justify-end">
          <Button size="lg" onClick={onStart} disabled={!signedIn || available === 0}>
            Start exam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RunningExam({
  pool, idx, setIdx, answers, flagged, select, toggleFlag, mm, ss, lowTime, onSubmit,
}: {
  pool: Question[]; idx: number; setIdx: (n: number) => void;
  answers: Record<string, number>; flagged: Set<string>;
  select: (qid: string, i: number) => void; toggleFlag: (qid: string) => void;
  mm: string; ss: string; lowTime: boolean; onSubmit: () => void;
}) {
  const q = pool[idx];
  if (!q) return null;
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / pool.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <Card>
        <CardContent className="py-3 flex flex-wrap items-center gap-4">
          <div className={cn("flex items-center gap-2 text-lg font-mono font-semibold", lowTime ? "text-destructive" : "text-foreground")}>
            <Clock className="h-4 w-4" />
            {mm}:{ss}
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{answered}/{pool.length} answered</span>
              <span>{flagged.size} flagged</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
          <Button size="sm" variant="default" onClick={onSubmit}>Submit exam</Button>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Question {idx + 1} of {pool.length}{q.module_title ? ` · ${q.module_title}` : ""}</div>
              <CardTitle className="text-base mt-1 leading-relaxed">{q.question}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleFlag(q.id)} className={cn("gap-1.5", flagged.has(q.id) && "text-warning")}>
              <Flag className="h-3.5 w-3.5" />
              {flagged.has(q.id) ? "Unflag" : "Flag"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt, i) => {
            const sel = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => select(q.id, i)}
                className={cn(
                  "w-full text-left text-sm rounded-md border px-3 py-2.5 transition-colors",
                  sel
                    ? "border-primary bg-primary-soft text-foreground"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <span className="inline-block w-5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Prev
        </Button>
        <div className="flex flex-wrap gap-1.5 max-w-2xl justify-center">
          {pool.map((qq, i) => {
            const isAnswered = answers[qq.id] !== undefined;
            const isFlag = flagged.has(qq.id);
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-7 w-7 text-[11px] rounded font-medium border transition-colors",
                  i === idx ? "ring-2 ring-primary border-primary" : "border-border",
                  isAnswered ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent",
                  isFlag && "ring-1 ring-warning"
                )}
                aria-label={`Go to question ${i + 1}${isAnswered ? " (answered)" : ""}${isFlag ? " (flagged)" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" disabled={idx === pool.length - 1} onClick={() => setIdx(idx + 1)}>
          Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ReviewScreen({
  pool, answers, scorePct, correctCount, passed, moduleBreakdown, secondsUsed, onRetake,
}: {
  pool: Question[]; answers: Record<string, number>;
  scorePct: number; correctCount: number; passed: boolean;
  moduleBreakdown: { title: string; total: number; correct: number }[];
  secondsUsed: number; onRetake: () => void;
}) {
  const mm = Math.floor(secondsUsed / 60);
  const ss = secondsUsed % 60;

  return (
    <div className="space-y-6">
      <Card className={cn("shadow-elevated overflow-hidden", passed ? "border-success/40" : "border-destructive/40")}>
        <div className={cn("h-1.5", passed ? "bg-success" : "bg-destructive")} />
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Result</div>
              <div className={cn("text-3xl font-bold", passed ? "text-success" : "text-destructive")}>
                {scorePct}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {correctCount} of {pool.length} correct · Completed in {mm}m {ss}s
              </div>
            </div>
            <div className="text-right">
              <Badge className={passed ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                {passed ? "PASSED" : "BELOW PASS MARK"}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Pass mark: {PASS_PCT}%</div>
            </div>
          </div>

          {moduleBreakdown.length > 0 && (
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {moduleBreakdown.map((m) => {
                const pct = Math.round((m.correct / m.total) * 100);
                return (
                  <div key={m.title} className="rounded-md border border-border p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate pr-2">{m.title}</span>
                      <span className="text-muted-foreground">{m.correct}/{m.total}</span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onRetake}>Retake exam</Button>
            <Link to="/catalog"><Button variant="outline">Back to catalog</Button></Link>
            <Link to="/progress"><Button variant="ghost">View progress</Button></Link>
          </div>
        </CardContent>
      </Card>

      {/* Per-question review */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Review answers</h3>
        <div className="space-y-3">
          {pool.map((q, i) => {
            const sel = answers[q.id];
            const correct = sel === q.correct_index;
            return (
              <Card key={q.id} className="shadow-card">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Question {i + 1}{q.module_title ? ` · ${q.module_title}` : ""}</div>
                      <div className="text-sm font-medium mt-0.5">{q.question}</div>
                    </div>
                  </div>
                  <div className="ml-6 space-y-1">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correct_index;
                      const isPicked = oi === sel;
                      return (
                        <div
                          key={oi}
                          className={cn(
                            "text-xs rounded px-2 py-1.5 border",
                            isCorrect && "border-success/50 bg-success/10",
                            !isCorrect && isPicked && "border-destructive/50 bg-destructive/10",
                            !isCorrect && !isPicked && "border-transparent text-muted-foreground"
                          )}
                        >
                          <span className="font-mono mr-2">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                          {isCorrect && <span className="ml-2 text-success font-medium">✓ correct</span>}
                          {!isCorrect && isPicked && <span className="ml-2 text-destructive font-medium">your answer</span>}
                        </div>
                      );
                    })}
                    {sel === undefined && (
                      <div className="text-xs italic text-muted-foreground">Not answered</div>
                    )}
                  </div>
                  {q.explanation && (
                    <div className="ml-6 text-xs bg-muted/40 border-l-2 border-primary/30 px-2 py-1.5 rounded-sm">
                      <span className="font-medium text-primary">Why:</span> {q.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-0.5">{value}</div>
    </div>
  );
}
