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
import { PortalSimulator } from "@/components/simulators/PortalSimulator";
import { ServiceNowSimulator } from "@/components/simulators/ServiceNowSimulator";
import { KaliTerminalSimulator } from "@/components/simulators/KaliTerminalSimulator";
import { K8sTerminalSimulator } from "@/components/simulators/K8sTerminalSimulator";
import { GcpConsoleSimulator } from "@/components/simulators/GcpConsoleSimulator";
import { CiscoIosSimulator } from "@/components/simulators/CiscoIosSimulator";
import { SocToolSimulator, type SocTool } from "@/components/simulators/SocToolSimulator";

// Map simulator string → SOC-tool key (CSA program). Returns null if not a SOC tool.
const SOC_TOOLS: Record<string, SocTool> = {
  splunk: "splunk", qradar: "qradar", elastic: "elastic", kibana: "elastic",
  misp: "misp", thehive: "thehive", wireshark: "wireshark",
  suricata: "suricata", zeek: "suricata",
};
function socToolFor(sim?: string | null): SocTool | null {
  return sim ? (SOC_TOOLS[sim] ?? null) : null;
}
const SOC_TOOL_DOC_LABEL: Record<SocTool, string> = {
  splunk: "Splunk Docs", qradar: "IBM QRadar Docs", elastic: "Elastic Docs",
  misp: "MISP Book", thehive: "TheHive Docs",
  wireshark: "Wireshark Docs", suricata: "Suricata Docs",
};
import { TenantCheckPanel } from "@/components/simulators/TenantCheckPanel";
import { QuizPanel } from "@/components/QuizPanel";
import { LabCompletionModal } from "@/components/LabCompletionModal";
import { PdiDeepLink } from "@/components/PdiDeepLink";
import { awardBadgesForUser } from "@/lib/badges";
import {
  CheckCircle2, Circle, ChevronRight, Clock, Target, Sparkles, Trophy, ArrowLeft, Lightbulb, ExternalLink, BookOpen, Maximize2,
} from "lucide-react";
import { toast } from "sonner";

import { ProgramGate } from "@/components/ProgramGate";
import { getProgramForModuleSlug, type ProgramCode } from "@/lib/programMap";

export default function Lab() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lab, setLab] = useState<any>(null);
  const [moduleSlug, setModuleSlug] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [stepProgress, setStepProgress] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [nextLab, setNextLab] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    if (!slug || !user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      // 1. Lab + steps
      const { data: l } = await supabase.from("labs").select("*").eq("slug", slug).maybeSingle();
      if (!l) { toast.error("Lab not found"); navigate("/catalog"); return; }
      const { data: s } = await supabase.from("lab_steps").select("*").eq("lab_id", l.id).order("step_number");
      setLab(l); setSteps(s ?? []);

      // Resolve module slug for access gating
      if (l.module_id) {
        const { data: m } = await supabase.from("modules").select("slug").eq("id", l.module_id).maybeSingle();
        setModuleSlug(m?.slug ?? null);
      }

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

      // 5. Realtime: pick up step completions from the full-screen tab.
      channel = supabase
        .channel(`step_progress_lab:${att!.id}:${Math.random().toString(36).slice(2, 8)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "step_progress", filter: `attempt_id=eq.${att!.id}` },
          (payload: any) => {
            const row = payload.new ?? payload.old;
            if (!row) return;
            setStepProgress((prev) => ({ ...prev, [row.step_id]: !!row.completed }));
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "lab_attempts", filter: `id=eq.${att!.id}` },
          (payload: any) => {
            if (payload.new) setAttempt((a: any) => ({ ...a, ...payload.new }));
          },
        )
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
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

    // auto-advance after a moment (do NOT auto-complete; quiz is the gate)
    setTimeout(() => {
      if (currentIdx < steps.length - 1) {
        setCurrentIdx((i) => i + 1);
        setShowHint(false);
      }
    }, 800);
  }

  async function completeLab() {
    if (!attempt || !user) return;
    await supabase.from("lab_attempts").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", attempt.id);
    setAttempt((a: any) => ({ ...a, status: "completed", completed_at: new Date().toISOString() }));

    // Award badges (idempotent — handles first-lab, module mastery, sc900-ready, etc.)
    const awarded = await awardBadgesForUser(user.id);
    setNewBadges(awarded);

    // Find next lab in same module by sort_order
    if (lab) {
      const { data: siblings } = await supabase
        .from("labs")
        .select("slug, title, sort_order")
        .eq("module_id", lab.module_id)
        .eq("is_published", true)
        .order("sort_order");
      const idx = (siblings ?? []).findIndex((s) => s.slug === lab.slug);
      const next = idx >= 0 ? siblings?.[idx + 1] : null;
      if (next) setNextLab({ slug: next.slug, title: next.title });
    }

    setCompletionOpen(true);
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
  const program: ProgramCode | null = moduleSlug ? getProgramForModuleSlug(moduleSlug) : null;

  const body = (
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
          <a
            href={`/lab/${lab.slug}/sim?step=${currentIdx}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open simulator in a new tab (full screen)"
          >
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <Maximize2 className="h-3 w-3" /> Full screen
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
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
            {lab.ms_learn_url && (
              <a
                href={lab.ms_learn_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/40 hover:bg-muted px-2.5 py-2 text-xs transition-colors group"
                aria-label={`Open the official reference for ${lab.title} in a new tab`}
              >
                <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-foreground">
                    {lab.simulator === "servicenow" ? "ServiceNow Docs"
                      : (lab.simulator === "kali-terminal" || lab.simulator === "kali") ? "OffSec / Kali Docs"
                      : (lab.simulator === "k8s-terminal" || lab.simulator === "k8s") ? "Kubernetes / Docker Docs"
                      : (lab.simulator === "gcp-console" || lab.simulator === "gcp") ? "Google Cloud Docs"
                      : socToolFor(lab.simulator) ? SOC_TOOL_DOC_LABEL[socToolFor(lab.simulator)!]
                      : "Microsoft Learn module"}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">Official free reference</span>
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
              </a>
            )}
            {lab.simulator === "servicenow" && (
              <div className="mt-2">
                <PdiDeepLink labSlug={lab.slug} />
              </div>
            )}
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
              <Card className="hero-surface border-0">
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full grid place-items-center bg-warning/15 text-warning shadow-glow-gold mb-3">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Lab complete!</h2>
                  <p className="text-muted-foreground mt-1">You earned {attempt?.score} points across {steps.length} steps.</p>
                  <div className="flex justify-center gap-2 mt-5">
                    <Link to="/catalog"><Button>Next lab</Button></Link>
                    <Link to="/dashboard"><Button variant="outline">Dashboard</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ) : !currentStep ? (
              <Card className="shadow-card border-dashed">
                <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                  Step content for this lab is being authored. Check back soon — or try the
                  {" "}<Link to="/lab/mfa-conditional-access" className="text-primary underline">MFA + Conditional Access lab</Link>{" "}
                  which is fully interactive.
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

            {/* Simulator OR Quiz (after all steps complete) */}
            {!isComplete && (() => {
              const allStepsDone = steps.length > 0 && steps.every((st) => stepProgress[st.id]);
              if (allStepsDone) {
                return (
                  <QuizPanel
                    labId={lab.id}
                    attemptId={attempt!.id}
                    onComplete={() => completeLab()}
                  />
                );
              }
              if (!currentStep) return null;
              const ea = currentStep.expected_action ?? {};
              // NEW: live-tenant DB validator
              if (ea?.type === "tenant_check") {
                return (
                  <TenantCheckPanel
                    check={ea.check}
                    params={ea.params ?? {}}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // Original bespoke Entra blade simulator (legacy CA-flow lab)
              if (lab.simulator === "entra" && lab.slug === "mfa-conditional-access") {
                return (
                  <EntraSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // Kali terminal — PEN-200 / OSCP+ labs
              if (lab.simulator === "kali-terminal" || lab.simulator === "kali") {
                return (
                  <KaliTerminalSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // K8s + Docker terminal — K8S-FDN labs
              if (lab.simulator === "k8s-terminal" || lab.simulator === "k8s") {
                return (
                  <K8sTerminalSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // Google Cloud Console — CDL labs
              if (lab.simulator === "gcp-console" || lab.simulator === "gcp") {
                return (
                  <GcpConsoleSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // Cisco IOS console — CCNA labs
              if (lab.simulator === "cisco-ios" || lab.simulator === "ios" || lab.simulator === "ccna") {
                return (
                  <CiscoIosSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              // SOC tool simulators — CSA labs (Splunk, QRadar, Elastic, MISP, TheHive, Wireshark, Suricata)
              {
                const socTool = socToolFor(lab.simulator);
                if (socTool) {
                  return (
                    <SocToolSimulator
                      tool={socTool}
                      expectedAction={currentStep.expected_action}
                      onValidate={(ok) => { if (ok) markStepDone(); }}
                    />
                  );
                }
              }
              // ServiceNow / Now Platform — CIS-ITSM labs
              if (lab.simulator === "servicenow") {
                return (
                  <ServiceNowSimulator
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              if (["defender", "purview", "sentinel", "entra", "generic"].includes(lab.simulator)) {
                return (
                  <PortalSimulator
                    simulator={lab.simulator}
                    expectedAction={currentStep.expected_action}
                    onValidate={(ok) => { if (ok) markStepDone(); }}
                  />
                );
              }
              return (
                <Card className="shadow-card border-dashed">
                  <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                    Click below to mark this step done.
                    <div className="mt-4">
                      <Button onClick={markStepDone}>Mark step done <ChevronRight className="h-3 w-3 ml-1" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </main>

        {/* RIGHT: AI tutor */}
        <TutorPanel
          attemptId={attempt?.id}
          labContext={`Lab: ${lab.title}\nObjective: ${lab.objective}\nCurrent step ${currentStep?.step_number}/${steps.length}: ${currentStep?.title}\nInstructions: ${currentStep?.instructions}`}
          initialPrompt={`👋 I'm your Twin Tutor. I'll help you complete **${lab.title}** without spoiling the answers. What's tripping you up?`}
        />
      </div>

      <LabCompletionModal
        open={completionOpen}
        onClose={() => setCompletionOpen(false)}
        labTitle={lab.title}
        score={attempt?.score ?? 0}
        totalSteps={steps.length}
        durationSec={
          attempt?.completed_at && attempt?.started_at
            ? Math.round((new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()) / 1000)
            : (lab.duration_min ?? 15) * 60
        }
        newBadges={newBadges}
        nextLabSlug={nextLab?.slug}
        nextLabTitle={nextLab?.title}
      />
    </AppLayout>
  );

  if (!program) return body;
  return <ProgramGate program={program} moduleSlug={moduleSlug ?? undefined}>{body}</ProgramGate>;
}
