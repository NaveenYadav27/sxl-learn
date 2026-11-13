import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, ChevronLeft, CheckCircle2, RotateCcw,
  Award, AlertTriangle, Shield, BookOpen, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LESSONS } from "../data/lessons";
import { useAcademy, computeMastery, emptyLesson } from "../engine/progress";
import { SKILLS, PASS_MARK } from "../engine/curriculum";

export function AcademyProgress() {
  const academy = useAcademy();
  const state = academy.state;

  const { skills, readiness } = useMemo(() => {
    return computeMastery(LESSONS, state);
  }, [state]);

  const completedCount = LESSONS.filter((l) => state.lessons[l.id]?.status === "completed").length;
  const inProgressCount = LESSONS.filter((l) => state.lessons[l.id]?.status === "in_progress").length;

  const handleResetAll = () => {
    localStorage.removeItem("sxl-soc-academy-v1");
    toast.success("Academy Progress Cleared");
    window.location.reload();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/ops/academy" className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Academy
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-semibold">Readiness & Progress</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" /> SOC Analyst Readiness Report
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Deterministic competency evaluation derived from lab actions, progressive hint usage, quiz assessments, and investigative reflection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Academy Progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all simulator actions, objectives completed, hint counts, quiz scores, and reflection notes across all 10 lessons. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link to="/ops/academy">
            <Button size="sm" className="text-xs font-semibold">
              Curriculum View
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card p-5">
          <div className="text-xs font-mono uppercase text-muted-foreground">Overall Readiness</div>
          <div className="text-3xl font-display font-bold text-shadowx-gradient mt-2">
            {readiness}%
          </div>
          <Progress value={readiness} className="h-1.5 mt-3" />
          <div className="text-[11px] text-muted-foreground mt-2">
            Weighted across 10 skill dimensions
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="text-xs font-mono uppercase text-muted-foreground">Lessons Completed</div>
          <div className="text-3xl font-display font-bold text-foreground mt-2">
            {completedCount} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-3">
            {inProgressCount} currently in progress
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="text-xs font-mono uppercase text-muted-foreground">Mentor Interactions</div>
          <div className="text-3xl font-display font-bold text-foreground mt-2">
            {state.mentorQuestions}
          </div>
          <div className="text-[11px] text-muted-foreground mt-3">
            Questions, hints, and reviews
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="text-xs font-mono uppercase text-muted-foreground">Dictionary Viewed</div>
          <div className="text-3xl font-display font-bold text-foreground mt-2">
            {state.dictionaryViewed.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-3">
            Terms inspected via popovers
          </div>
        </Card>
      </div>

      {/* 10 Operational Skills Breakdown */}
      <Card className="border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display font-semibold text-lg">10 Core Operational Competency Dimensions</h2>
          <span className="text-xs text-muted-foreground">Threshold for readiness: 70%+</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {skills.map((s) => (
            <div key={s.key} className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{s.label}</h3>
                  <div className="text-[11px] text-muted-foreground">{SKILLS.find((x) => x.key === s.key)?.blurb}</div>
                </div>
                <div className="text-right">
                  <span className={`font-display font-bold text-base ${s.pct >= PASS_MARK ? "text-success" : s.pct > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {s.pct}%
                  </span>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {Math.round(s.earned * 10) / 10} / {s.possible} pts
                  </div>
                </div>
              </div>
              <Progress value={s.pct} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Lesson-by-Lesson Scorecard Table */}
      <Card className="border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Curriculum Progress Scorecard</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-mono text-[11px] text-left">
                <th className="py-2.5 px-3">Lesson</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Objectives Done</th>
                <th className="py-2.5 px-3">Quiz Score</th>
                <th className="py-2.5 px-3">Hints Used</th>
                <th className="py-2.5 px-3">Mistakes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {LESSONS.map((l) => {
                const p = state.lessons[l.id];
                const isComplete = p?.status === "completed";
                const totalObjs = l.lab.objectives.length || (l.lab.splExercises?.length ?? 0);
                const doneObjs = p?.objectivesDone.length ?? 0;
                const score = p?.assessmentScore;

                return (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-medium">
                      <span className="font-mono text-muted-foreground mr-2">L{String(l.number).padStart(2, "0")}</span>
                      {l.title}
                    </td>
                    <td className="py-3 px-3">
                      {isComplete ? (
                        <Badge className="bg-success text-success-foreground text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Complete
                        </Badge>
                      ) : p?.status === "in_progress" ? (
                        <Badge variant="default" className="text-[10px]">In Progress</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">Not Started</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {doneObjs} / {totalObjs}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {score !== null && score !== undefined ? (
                        <span className={score >= PASS_MARK ? "text-success font-semibold" : "text-destructive font-semibold"}>
                          {score}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {p?.hintsUsed ?? 0}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {p?.mistakes ?? 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/ops/academy/lesson/${l.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          {isComplete ? "Review" : "Launch"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
