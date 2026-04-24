/**
 * QuizPanel — renders the lab's MCQs after the learner finishes all steps.
 * Persists each response to question_responses and reports back when
 * the quiz is fully answered (so Lab.tsx can mark the attempt complete).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Brain, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question_number: number;
  question: string;
  options: string[] | any;
  correct_index: number;
  explanation: string | null;
  points: number;
}

interface Props {
  labId: string;
  attemptId: string;
  onComplete: (score: number, total: number) => void;
}

export function QuizPanel({ labId, attemptId, onComplete }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lab_questions")
        .select("*")
        .eq("lab_id", labId)
        .order("question_number");
      const normalised = (data ?? []).map((q: any) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));
      setQuestions(normalised as Question[]);
    })();
  }, [labId]);

  async function pick(q: Question, idx: number) {
    if (revealed[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: idx }));
    setRevealed((r) => ({ ...r, [q.id]: true }));
    const correct = idx === q.correct_index;
    await supabase.from("question_responses").upsert(
      {
        attempt_id: attemptId,
        question_id: q.id,
        selected_index: idx,
        is_correct: correct,
      },
      { onConflict: "attempt_id,question_id" }
    );
    if (correct) toast.success(`+${q.points} pts`);
  }

  async function submit() {
    const earned = questions.reduce(
      (s, q) => s + (answers[q.id] === q.correct_index ? q.points : 0),
      0
    );
    setScore(earned);
    setSubmitted(true);
    onComplete(earned, questions.reduce((s, q) => s + q.points, 0));
  }

  if (questions.length === 0) {
    return (
      <Card className="shadow-card border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground text-center">
          No quiz authored for this lab.
        </CardContent>
      </Card>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="space-y-3">
      <Card className="bg-primary-soft border-primary/30">
        <CardContent className="pt-5 pb-4 flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">Knowledge check</h3>
            <p className="text-xs text-muted-foreground">
              Answer {questions.length} questions ({totalPoints} pts) to complete the lab.
            </p>
          </div>
        </CardContent>
      </Card>

      {questions.map((q, qi) => {
        const picked = answers[q.id];
        const isRevealed = revealed[q.id];
        return (
          <Card key={q.id} className="shadow-card">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">{qi + 1}</Badge>
                <div className="font-medium text-sm">{q.question}</div>
              </div>
              <div className="grid gap-2">
                {(q.options as string[]).map((opt, i) => {
                  const isPicked = picked === i;
                  const isCorrect = i === q.correct_index;
                  let cls = "border-border hover:bg-muted/50";
                  if (isRevealed) {
                    if (isCorrect) cls = "border-success bg-success/10";
                    else if (isPicked) cls = "border-destructive bg-destructive/10";
                    else cls = "border-border opacity-60";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => pick(q, i)}
                      disabled={isRevealed}
                      className={`text-left text-sm border rounded px-3 py-2 transition-colors flex items-center justify-between gap-2 ${cls}`}
                    >
                      <span>{opt}</span>
                      {isRevealed && isCorrect && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                      {isRevealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {isRevealed && q.explanation && (
                <div className="text-xs bg-muted/50 border border-border rounded p-2 text-muted-foreground">
                  <strong className="text-foreground">Why:</strong> {q.explanation}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!submitted ? (
        <Button onClick={submit} disabled={!allAnswered} className="w-full">
          Submit quiz & complete lab
        </Button>
      ) : (
        <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-portal">
          <CardContent className="pt-5 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Quiz score: {score} / {totalPoints}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
