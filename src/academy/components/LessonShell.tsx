import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen, Layers, PlayCircle, Terminal, Bot,
  Award, MessageSquare, CheckCircle2, ChevronLeft, ChevronRight,
  RotateCcw, Sparkles, AlertTriangle, Shield, Check, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { LessonStep, AssessmentQuestion, ReflectionPrompt } from "../types";
import { useLessonRuntime } from "./runtime";
import { useAcademy } from "../engine/progress";
import { ConceptBlockView } from "./ConceptBlocks";
import { RichText, TermChip } from "./RichText";
import { ObjectivesPanel } from "./ObjectivesPanel";
import { MentorPanel } from "./MentorPanel";
import { TERMS_BY_ID } from "../data/dictionary";
import { PASS_MARK } from "../engine/curriculum";

// Labs
import { ConsoleLab } from "../labs/ConsoleLab";
import { LogAnalysisLab } from "../labs/LogAnalysisLab";
import { SplTrainer } from "../labs/SplTrainer";
import { InvestigationLab } from "../labs/InvestigationLab";
import { InvestigationWorkspace, emptyCase } from "../labs/InvestigationWorkspace";
import { RiskLab } from "../labs/RiskLab";
import { MitreLab } from "../labs/MitreLab";
import { IrLab } from "../labs/IrLab";

export function LessonShell() {
  const rt = useLessonRuntime();
  const academy = useAcademy();
  const [params, setParams] = useSearchParams();
  const initialStep = (params.get("step") as LessonStep) || "concept";

  const [activeTab, setActiveTab] = useState<LessonStep>(initialStep);
  const [demoStepIdx, setDemoStepIdx] = useState(0);

  // Assessment local state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reflection local state
  const [reflections, setReflections] = useState<Record<string, string>>({});

  const lesson = rt.lesson;
  const progress = academy.lesson(lesson.id);

  // Sync tab with URL
  useEffect(() => {
    const s = params.get("step") as LessonStep;
    if (s && s !== activeTab) {
      setActiveTab(s);
    }
  }, [params]);

  const handleTabChange = (step: string) => {
    const s = step as LessonStep;
    setActiveTab(s);
    setParams({ step: s }, { replace: true });
    academy.markStepSeen(lesson.id, s);
  };

  // Assessment scoring
  const calculateScore = () => {
    let correct = 0;
    lesson.assessment.forEach((q) => {
      if (quizAnswers[q.id] === q.answer) correct += 1;
    });
    return Math.round((correct / lesson.assessment.length) * 100);
  };

  const handleQuizSubmit = () => {
    const score = calculateScore();
    setQuizSubmitted(true);
    academy.submitAssessment(lesson.id, score, quizAnswers);
    if (score >= PASS_MARK) {
      toast.success(`Assessment Passed! Score: ${score}%`);
    } else {
      toast.error(`Score: ${score}% (Pass mark is ${PASS_MARK}%). Review concepts and try again.`);
    }
  };

  const handleReflectionSave = (promptId: string, text: string) => {
    setReflections((prev) => ({ ...prev, [promptId]: text }));
    academy.saveReflection(lesson.id, promptId, text);
    toast.success("Reflection saved");
  };

  // Render the appropriate lab based on lesson.lab.kind
  const renderLabComponent = () => {
    switch (lesson.lab.kind) {
      case "console":
        return <ConsoleLab />;
      case "logs":
        return <LogAnalysisLab />;
      case "spl":
        return <SplTrainer />;
      case "investigation":
        return <InvestigationLab />;
      case "risk":
        return <RiskLab />;
      case "mitre":
        return <MitreLab />;
      case "ir":
        return <IrLab />;
      case "capstone":
        return (
          <InvestigationWorkspace
            scenario={rt.scenario!}
            emit={rt.emit}
            mistake={rt.mistake}
            caseState={emptyCase()}
            setCase={() => {}}
            mentorSlot={<MentorPanel />}
          />
        );
      default:
        return <ConsoleLab />;
    }
  };

  const isLabDone = rt.objectives.length > 0 && rt.done.length >= rt.objectives.length;
  const isAssessmentPassed = (progress?.assessmentScore ?? 0) >= PASS_MARK;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top sticky navigation bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/ops/academy" className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 font-mono">
              <ChevronLeft className="h-4 w-4" /> Curriculum
            </Link>
            <div className="h-4 w-px bg-border" />
            <Badge variant="outline" className="font-mono text-xs">
              Lesson {String(lesson.number).padStart(2, "0")}
            </Badge>
            <h1 className="font-display font-semibold text-sm sm:text-base tracking-tight truncate max-w-md">
              {lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {progress?.status === "completed" ? (
              <Badge className="bg-success text-success-foreground gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            ) : isLabDone && isAssessmentPassed ? (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs gap-1 h-8"
                onClick={() => {
                  academy.completeLesson(lesson.id);
                  toast.success("Lesson Marked Complete!");
                }}
              >
                <Check className="h-3.5 w-3.5" /> Mark Completed
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs font-mono">
                {rt.done.length}/{rt.objectives.length} Objectives
              </Badge>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 text-xs text-muted-foreground"
              onClick={() => {
                academy.resetLab(lesson.id);
                rt.clearActions();
                toast.info("Lab progress reset");
              }}
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          </div>
        </div>

        {/* Lesson Step Tabs */}
        <div className="mt-3 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-muted/50 p-1 h-auto flex flex-nowrap">
              <TabsTrigger value="concept" className="gap-1.5 text-xs py-1.5 px-3">
                <BookOpen className="h-3.5 w-3.5" /> 1. Concept
              </TabsTrigger>
              <TabsTrigger value="definitions" className="gap-1.5 text-xs py-1.5 px-3">
                <Sparkles className="h-3.5 w-3.5" /> 2. Vocabulary
              </TabsTrigger>
              <TabsTrigger value="visual" className="gap-1.5 text-xs py-1.5 px-3">
                <Layers className="h-3.5 w-3.5" /> 3. Architecture
              </TabsTrigger>
              <TabsTrigger value="demo" className="gap-1.5 text-xs py-1.5 px-3">
                <PlayCircle className="h-3.5 w-3.5" /> 4. Walkthrough
              </TabsTrigger>
              <TabsTrigger value="lab" className="gap-1.5 text-xs py-1.5 px-3 relative font-semibold text-primary">
                <Terminal className="h-3.5 w-3.5" /> 5. Hands-on Lab
                {isLabDone && <CheckCircle2 className="h-3 w-3 text-success ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="mentor" className="gap-1.5 text-xs py-1.5 px-3">
                <Bot className="h-3.5 w-3.5" /> 6. AI Mentor
              </TabsTrigger>
              <TabsTrigger value="assessment" className="gap-1.5 text-xs py-1.5 px-3">
                <Award className="h-3.5 w-3.5" /> 7. Assessment
                {isAssessmentPassed && <CheckCircle2 className="h-3 w-3 text-success ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="reflection" className="gap-1.5 text-xs py-1.5 px-3">
                <MessageSquare className="h-3.5 w-3.5" /> 8. Reflection
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 container py-6 max-w-7xl">
        {/* 1. CONCEPT TAB */}
        {activeTab === "concept" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header intro card */}
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <div className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                Lesson {lesson.number} · {lesson.durationMin} Minutes
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">{lesson.title}</h2>
              <p className="mt-2 text-foreground/80 leading-relaxed text-sm">{lesson.tagline}</p>

              {/* Learning objectives list */}
              <div className="mt-6 pt-5 border-t border-border">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Lesson Objectives
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs">
                  {lesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-foreground/90">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Render ConceptBlocks */}
            <div className="space-y-6">
              {lesson.concept.map((block, i) => (
                <ConceptBlockView key={i} block={block} />
              ))}
            </div>

            {/* Next step footer */}
            <div className="pt-6 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Up next: Key technical vocabulary</span>
              <Button size="sm" onClick={() => handleTabChange("definitions")} className="gap-1 text-xs">
                Continue to Vocabulary <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 2. DEFINITIONS TAB */}
        {activeTab === "definitions" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Key Technical Terminology</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Every term introduced in this lesson is linked to real SOC operational workflows.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {lesson.heroTermIds.map((id) => {
                const term = TERMS_BY_ID[id];
                if (!term) return null;
                return (
                  <Card key={id} className="border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display font-semibold text-base text-primary">{term.term}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono">{term.category}</Badge>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed mb-3">{term.short}</p>
                    <div className="rounded bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1.5">
                      <div><strong className="text-foreground font-semibold">Analogy: </strong>{term.analogy}</div>
                      <div><strong className="text-foreground font-semibold">In the SOC: </strong>{term.example}</div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleTabChange("concept")} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Concept
              </Button>
              <Button size="sm" onClick={() => handleTabChange("visual")} className="gap-1 text-xs">
                Next: Architecture Diagrams <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 3. VISUAL TAB */}
        {activeTab === "visual" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Architectural & Process Diagrams</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Visualizing data flows, defense layers, and attack timelines.
              </p>
            </div>

            <div className="space-y-6">
              {lesson.visual.map((block, i) => (
                <ConceptBlockView key={i} block={block} />
              ))}
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleTabChange("definitions")} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Vocabulary
              </Button>
              <Button size="sm" onClick={() => handleTabChange("demo")} className="gap-1 text-xs">
                Next: Worked Example Walkthrough <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 4. DEMO TAB */}
        {activeTab === "demo" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Worked Example Walkthrough</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Follow an experienced analyst through the scenario before attempting the lab.
              </p>
            </div>

            {lesson.demo.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="text-xs font-mono uppercase text-primary">
                    Step {demoStepIdx + 1} of {lesson.demo.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={demoStepIdx === 0}
                      onClick={() => setDemoStepIdx((i) => Math.max(0, i - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={demoStepIdx === lesson.demo.length - 1}
                      onClick={() => setDemoStepIdx((i) => Math.min(lesson.demo.length - 1, i + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {lesson.demo[demoStepIdx] && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{lesson.demo[demoStepIdx].title}</h3>
                    <RichText text={lesson.demo[demoStepIdx].narration} className="text-sm leading-relaxed" />

                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 font-mono text-xs">
                      <div className="text-primary font-bold">
                        Interface Focus: {lesson.demo[demoStepIdx].screen.area} ({lesson.demo[demoStepIdx].screen.focus})
                      </div>
                      <ul className="space-y-1.5 text-foreground/80 list-disc list-inside">
                        {lesson.demo[demoStepIdx].screen.detail.map((d, di) => (
                          <li key={di}>{d}</li>
                        ))}
                      </ul>
                      {lesson.demo[demoStepIdx].screen.spl && (
                        <div className="rounded bg-black/60 p-2 text-shadowx-azure border border-border">
                          {lesson.demo[demoStepIdx].screen.spl}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-border flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleTabChange("visual")} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Architecture
              </Button>
              <Button size="sm" onClick={() => handleTabChange("lab")} className="gap-1 text-xs bg-primary text-primary-foreground font-semibold">
                Launch Hands-on Lab <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 5. LAB TAB */}
        {activeTab === "lab" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
              {/* Lab Simulator */}
              <div className="space-y-4 min-w-0">
                <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-base">Hands-on Simulator: {lesson.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Interact with the simulator to satisfy each lab objective on the right.
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    Mode: {lesson.lab.kind}
                  </Badge>
                </div>

                {renderLabComponent()}
              </div>

              {/* Lab Sidebars: Objectives & Mentor */}
              <div className="space-y-4 lg:sticky lg:top-24">
                <ObjectivesPanel />
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-primary" /> Need Guidance?
                  </div>
                  <MentorPanel compact />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleTabChange("demo")} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Demo
              </Button>
              <Button size="sm" onClick={() => handleTabChange("assessment")} className="gap-1 text-xs">
                Next: Knowledge Assessment <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 6. MENTOR TAB */}
        {activeTab === "mentor" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Contextual AI SOC Mentor</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ask questions about this lesson, request progressive hints, practice challenge questions, or review your investigation reasoning.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 min-h-[500px]">
              <MentorPanel />
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleTabChange("lab")} className="gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Back to Lab
              </Button>
              <Button size="sm" onClick={() => handleTabChange("assessment")} className="gap-1 text-xs">
                Next: Assessment <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 7. ASSESSMENT TAB */}
        {activeTab === "assessment" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Knowledge Assessment</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Pass mark: 70%. Answer all questions to validate conceptual and practical mastery.
                </p>
              </div>
              {progress?.assessmentScore !== null && (
                <Badge className={progress.assessmentScore >= PASS_MARK ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                  Score: {progress.assessmentScore}%
                </Badge>
              )}
            </div>

            <div className="space-y-5">
              {lesson.assessment.map((q, qIndex) => {
                const selected = quizAnswers[q.id];
                const isAnswered = selected !== undefined;
                const isCorrect = isAnswered && selected === q.answer;

                return (
                  <Card key={q.id} className="border-border bg-card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-sm">
                        <span className="font-mono text-primary mr-2">Q{qIndex + 1}.</span>
                        {q.prompt}
                      </div>
                      {quizSubmitted && (
                        isCorrect ? (
                          <Badge className="bg-success text-success-foreground shrink-0 text-[10px]">Correct</Badge>
                        ) : (
                          <Badge className="bg-destructive text-destructive-foreground shrink-0 text-[10px]">Incorrect</Badge>
                        )
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, optIndex) => {
                        const isThisSelected = selected === optIndex;
                        let optClass = "border border-border bg-card hover:bg-muted/50";
                        if (isThisSelected) {
                          optClass = "border-primary bg-primary/10 text-primary font-semibold";
                        }
                        if (quizSubmitted) {
                          if (optIndex === q.answer) {
                            optClass = "border-success bg-success/15 text-success font-semibold";
                          } else if (isThisSelected) {
                            optClass = "border-destructive bg-destructive/15 text-destructive";
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                            className={`w-full text-left p-3 rounded-lg text-xs transition-colors flex items-center justify-between ${optClass}`}
                          >
                            <span>{opt}</span>
                            {isThisSelected && <div className="h-2 w-2 rounded-full bg-primary shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="rounded bg-muted/40 p-3 text-xs text-muted-foreground mt-2 border border-border">
                        <strong className="text-foreground">Explanation: </strong>{q.explain}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              {quizSubmitted ? (
                <Button variant="outline" size="sm" onClick={() => setQuizSubmitted(false)} className="text-xs">
                  Retry Assessment
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < lesson.assessment.length}
                  className="bg-primary text-primary-foreground font-semibold text-xs"
                >
                  Submit Assessment
                </Button>
              )}

              <Button size="sm" onClick={() => handleTabChange("reflection")} className="gap-1 text-xs">
                Next: Reflection <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 8. REFLECTION TAB */}
        {activeTab === "reflection" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold">Investigative Reflection</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Reflect on your reasoning. Formulating defensible, evidence-backed conclusions separates great analysts from junior button-pushers.
              </p>
            </div>

            <div className="space-y-6">
              {lesson.reflection.map((ref, idx) => (
                <Card key={ref.id} className="border-border bg-card p-5 space-y-3">
                  <div className="font-medium text-sm">
                    <span className="font-mono text-primary mr-2">{idx + 1}.</span>
                    {ref.prompt}
                  </div>
                  <Textarea
                    placeholder={ref.placeholder}
                    rows={4}
                    defaultValue={progress?.reflections[ref.id] || reflections[ref.id] || ""}
                    onBlur={(e) => handleReflectionSave(ref.id, e.target.value)}
                    className="text-xs font-mono"
                  />
                  <div className="text-[11px] text-muted-foreground text-right">
                    Auto-saved to your personal Academy profile.
                  </div>
                </Card>
              ))}
            </div>

            {/* Final completion callout */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">Completed All 8 Steps?</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Ensure lab objectives are fulfilled and your assessment is submitted.
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/ops/academy">
                  <Button variant="outline" size="sm" className="text-xs">
                    Return to Curriculum
                  </Button>
                </Link>
                {lesson.number < 10 && (
                  <Link to={`/ops/academy/lesson/l${String(lesson.number + 1).padStart(2, "0")}`}>
                    <Button size="sm" className="gap-1 text-xs font-semibold">
                      Next Lesson <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
