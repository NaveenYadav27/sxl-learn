import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Terminal, BookOpen, CheckCircle2, Clock,
  ArrowRight, Award, Bot, Grid3x3, BarChart3, AlertTriangle, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LESSONS } from "../data/lessons";
import { useAcademy, computeMastery } from "../engine/progress";
import { SKILLS } from "../engine/curriculum";

export function AcademyOverview() {
  const academy = useAcademy();
  const state = academy.state;

  const { skills, readiness } = useMemo(() => {
    return computeMastery(LESSONS, state);
  }, [state]);

  const completedLessons = LESSONS.filter((l) => state.lessons[l.id]?.status === "completed").length;
  const inProgressLessons = LESSONS.filter((l) => state.lessons[l.id]?.status === "in_progress").length;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Academy Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-card/90 via-primary/5 to-card/90 p-8 shadow-elevated relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary">
              <Shield className="h-3.5 w-3.5" /> Educational Splunk ES Simulator & Curriculum
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              SOC Analyst Academy
            </h1>
            <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
              A 10-hour, hands-on learning simulator for Blue Team defenders. Move through 10 deterministic incident scenarios, practice raw log decoding, run real SPL searches, triage correlated notables in an educational Splunk ES environment, and map adversary actions to MITRE ATT&CK.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>10 Hours Structured Curriculum</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Terminal className="h-4 w-4 text-primary" />
                <span>10 Hands-on Simulators</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bot className="h-4 w-4 text-primary" />
                <span>Contextual AI SOC Mentor</span>
              </div>
            </div>
          </div>

          {/* Readiness gauge */}
          <Card className="border-border bg-card/80 p-5 shrink-0 min-w-[260px] text-center">
            <div className="text-xs uppercase font-mono tracking-wider text-muted-foreground mb-1">
              Overall SOC Readiness
            </div>
            <div className="font-display text-4xl font-bold text-shadowx-gradient my-1">
              {readiness}%
            </div>
            <Progress value={readiness} className="h-2 my-3" />
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{completedLessons} of 10 Completed</span>
              <span>{inProgressLessons} In Progress</span>
            </div>
            <Link to="/ops/academy/progress" className="block mt-4">
              <Button size="sm" variant="outline" className="w-full text-xs">
                View Readiness Breakdown
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Quick Nav Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/ops/academy/labs">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <Terminal className="h-4 w-4 text-primary mx-auto mb-1.5" />
            <div className="text-xs font-semibold">Labs Center</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">10 Interactive Labs</div>
          </Card>
        </Link>
        <Link to="/ops/academy/dictionary">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <BookOpen className="h-4 w-4 text-primary mx-auto mb-1.5" />
            <div className="text-xs font-semibold">SOC Dictionary</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">50+ Technical Terms</div>
          </Card>
        </Link>
        <Link to="/ops/academy/mitre">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <Grid3x3 className="h-4 w-4 text-primary mx-auto mb-1.5" />
            <div className="text-xs font-semibold">MITRE ATT&CK</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Matrix & Coverage</div>
          </Card>
        </Link>
        <Link to="/ops/academy/mentor">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <Bot className="h-4 w-4 text-primary mx-auto mb-1.5" />
            <div className="text-xs font-semibold">AI SOC Mentor</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">5 Guided Modes</div>
          </Card>
        </Link>
        <Link to="/ops/academy/progress">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1.5" />
            <div className="text-xs font-semibold">Readiness Report</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">10 Core Dimensions</div>
          </Card>
        </Link>
        <Link to="/ops/splunk-live">
          <Card className="border-border hover:border-primary/50 transition-colors p-3.5 text-center bg-card">
            <AlertTriangle className="h-4 w-4 text-warning mx-auto mb-1.5" />
            <div className="text-xs font-semibold">Splunk Live</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Console Gateway</div>
          </Card>
        </Link>
      </div>

      {/* 10 Readiness Skills Strip */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-muted-foreground">
            SOC Operational Skills Radar
          </h2>
          <span className="text-xs text-muted-foreground">Scored on deterministic lab validation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {skills.map((s) => (
            <div key={s.key} className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold truncate">{s.label}</span>
                <span className="font-mono text-primary font-bold">{s.pct}%</span>
              </div>
              <Progress value={s.pct} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Lessons Curriculum List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">10-Hour Learning Curriculum</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Follow the structured 10-lesson progression from foundational triage to advanced APT incident capstone.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {LESSONS.map((l) => {
            const prog = state.lessons[l.id];
            const isComplete = prog?.status === "completed";
            const isStarted = prog?.status === "in_progress";
            const doneCount = prog?.objectivesDone.length ?? 0;
            const score = prog?.assessmentScore;

            return (
              <Card
                key={l.id}
                className={`border-border transition-all hover:border-primary/40 bg-card overflow-hidden ${
                  isComplete ? "border-success/40 bg-success/5" : ""
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary font-mono font-bold grid place-items-center shrink-0 text-sm">
                      {String(l.number).padStart(2, "0")}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-semibold text-base">{l.title}</h3>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {l.durationMin} min
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                          Lab: {l.lab.kind}
                        </Badge>
                        {isComplete && (
                          <Badge className="bg-success text-success-foreground text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        )}
                        {!isComplete && isStarted && (
                          <Badge variant="default" className="text-[10px]">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {l.tagline}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                        <span>Objectives: {doneCount} done</span>
                        {score !== null && score !== undefined && (
                          <span>Quiz Score: <strong className={score >= 70 ? "text-success" : "text-destructive"}>{score}%</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link to={`/ops/academy/lesson/${l.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs font-semibold">
                        {isComplete ? "Review Lesson" : isStarted ? "Resume Lesson" : "Start Lesson"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
