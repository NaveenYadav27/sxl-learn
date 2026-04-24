import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TutorPanel } from "@/components/TutorPanel";
import { EntraSimulator } from "@/components/simulators/EntraSimulator";
import {
  CheckCircle2, Circle, ChevronRight, Clock, Target, Sparkles, Trophy, ArrowLeft, Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

export default function Lab() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [stepProgress, setStepProgress] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !user) return;
    (async () => {
      // 1. Lab + steps
      const { data: l } = await supabase.from("labs").select("*").eq("slug", slug).maybeSingle();
      if (!l) { toast.error("Lab not found"); navigate("/catalog"); return; }
      const { data: s } = await supabase.from("lab_steps").select("*").eq("lab_id", l.id).order("step_number");
      setLab(l); setSteps(s ?? []);

      // 2. Attempt — find existing in-progress or create
      const { data: existing } = await supabase
        .from("lab_attempts")
        .select("*")
        .eq("user_id", user.id).eq("lab_id", l.id)
        .in("status", ["in_progress", "completed"])
        .order("started_at", { ascending: false })
        .limit(1).maybeSingle();
      let att = existing;
      if (!att) {
        const { data: created } = await supabase
          .from("lab_attempts")
          .insert({ user_id: user.id, lab_id: l.id })
          .select().single();
        att = created;
      }
      setAttempt(att);

      // 3. Step progress
      const { data: sp } = await supabase.from("step_progress").select("*").eq("attempt_id", att!.id);
      const map: Record<string, boolean> = {};
      (sp ?? []).forEach((p: any) => { map[p.step_id] = p.completed; });
      setStepProgress(map);

      // 4. Resume at first incomplete step
      const firstIncomplete = (s ?? []).findIndex((st: any) => !map[st.id]);
      setCurrentIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
      setLoading(false);
    })();
  }, [slug, user, navigate]);

  const currentStep = steps[currentIdx];
  const completedCount = Object.values(stepProgress).filter(Boolean).length;
  const pct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  async function markStepDone() {
    if (!currentStep || !attempt || stepProgress[currentStep.id]) return;
    setStepProgress((m) => ({ ...m, [currentStep.id]: true }));

    // upsert step_progress
    await supabase.from("step_progress").upsert({
      attempt_id: attempt.id,
      step_id: currentStep.id,
      completed: true,
      completed_at: new Date().toISOString(),
      attempts: 1,
    }, { onConflict: "attempt_id,step_id" });

    // bump attempt score
    const newScore = (attempt.score ?? 0) + (currentStep.points ?? 10);
    await supabase.from("lab_attempts").update({ score: newScore }).eq("id", attempt.id);
    setAttempt((a: any) => ({ ...a, score: newScore }));

    toast.success(`+${currentStep.points} points`, { icon: <Sparkles className="h-4 w-4 text-primary" /> });

    // auto-advance after a moment
    setTimeout(() => {
      if (currentIdx < steps.length - 1) {
        setCurrentIdx((i) => i + 1);
        setShowHint(false);
      } else {
        completeLab();
      }
    }, 800);
  }

  async function completeLab() {
    if (!attempt) return;
    await supabase.from("lab_attempts").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", attempt.id);
    setAttempt((a: any) => ({ ...a, status: "completed" }));
    toast.success("Lab complete! 🎉");

    // first-lab badge
    if (user) {
      const { data: badge } = await supabase.from("badges").select("id").eq("slug", "first-lab").maybeSingle();
      if (badge) {
        await supabase.from("user_badges").insert({ user_id: user.id, badge_id: badge.id }).select();
      }
    }
  }

  if (loading || !lab) {
    return (
      <AppLayout title="Loading lab…">
        <div className="container py-6 space-y-4">
          <Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  const isComplete = attempt?.status === "completed";

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb items={[
          { label: "Catalog", to: "/catalog" },
          { label: lab.title },
        ]}/>
      }
      title={lab.title}
      actions={
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{lab.duration_min} min</Badge>
          <Badge variant="outline"><Trophy className="h-3 w-3 mr-1" />{attempt?.score ?? 0} pts</Badge>
        </div>
      }
    >
      {/* Lab body: 3 columns — steps | simulator | tutor */}
      <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[280px_1fr_360px] overflow-hidden">
        {/* LEFT: scenario + step list */}
        <aside className="border-r border-border bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Scenario</div>
            <p className="text-xs text-foreground/80 leading-relaxed">{lab.scenario}</p>
            <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Objective</div>
            <p className="text-xs text-muted-foreground">{lab.objective}</p>
          </div>
          <div className="px-4 py-3 border-b border-border">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{completedCount}/{steps.length}</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
          <ScrollArea className="flex-1">
            <ol className="p-2 space-y-1">
              {steps.map((s, i) => {
                const done = stepProgress[s.id];
                const active = i === currentIdx;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => { setCurrentIdx(i); setShowHint(false); }}
                      className={`w-full text-left rounded p-2 flex gap-2 items-start text-xs transition-colors
                        ${active ? "bg-primary-soft border border-primary/40" : "hover:bg-muted"}`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            : <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <div className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                          Step {s.step_number}. {s.title}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </ScrollArea>
          <div className="p-3 border-t border-border">
            <Link to="/catalog">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ArrowLeft className="h-3 w-3 mr-2" /> Back to catalog
              </Button>
            </Link>
          </div>
        </aside>

        {/* CENTER: instructions + simulator */}
        <main className="overflow-auto bg-background">
          <div className="p-6 space-y-4 max-w-5xl">
            {isComplete ? (
              <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-portal">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold">Lab complete!</h2>
                  <p className="opacity-85 mt-1">You earned {attempt?.score} points across {steps.length} steps.</p>
                  <div className="flex justify-center gap-2 mt-5">
                    <Link to="/catalog"><Button variant="secondary">Next lab</Button></Link>
                    <Link to="/dashboard"><Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">Dashboard</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Step {currentStep.step_number} of {steps.length}</div>
                      <h2 className="text-lg font-semibold">{currentStep.title}</h2>
                    </div>
                    <Badge variant="secondary"><Target className="h-3 w-3 mr-1" />{currentStep.points} pts</Badge>
                  </div>
                  <p className="text-sm text-foreground/85 whitespace-pre-wrap">{currentStep.instructions}</p>
                  {showHint && currentStep.hint && (
                    <div className="mt-3 flex gap-2 text-xs bg-warning/10 border border-warning/30 rounded p-2">
                      <Lightbulb className="h-4 w-4 text-warning shrink-0" />
                      <span>{currentStep.hint}</span>
                    </div>
                  )}
                  {!showHint && currentStep.hint && (
                    <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="mt-2">
                      <Lightbulb className="h-3 w-3 mr-1" /> Show hint
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* The simulator itself */}
            {!isComplete && lab.simulator === "entra" && (
              <EntraSimulator
                expectedAction={currentStep.expected_action}
                onValidate={(ok) => { if (ok) markStepDone(); }}
              />
            )}

            {!isComplete && lab.simulator !== "entra" && (
              <Card className="shadow-card border-dashed">
                <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                  The {lab.simulator} simulator is coming in the next phase. For now, click below to mark this step done and continue exploring.
                  <div className="mt-4">
                    <Button onClick={markStepDone}>Mark step done <ChevronRight className="h-3 w-3 ml-1" /></Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* RIGHT: AI tutor */}
        <TutorPanel
          attemptId={attempt?.id}
          labContext={`Lab: ${lab.title}\nObjective: ${lab.objective}\nCurrent step ${currentStep?.step_number}/${steps.length}: ${currentStep?.title}\nInstructions: ${currentStep?.instructions}`}
          initialPrompt={`👋 I'm your Twin Tutor. I'll help you complete **${lab.title}** without spoiling the answers. What's tripping you up?`}
        />
      </div>
    </AppLayout>
  );
}
