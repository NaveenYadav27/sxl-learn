/**
 * LabSimulator — full-page simulator view, opened in a new tab from the lab page.
 *
 * Renders ONLY the simulator chrome (no sidebar, no tutor, no step list) so the
 * learner can spread the terminal / portal across their full screen. Step
 * navigation is condensed into a top bar with prev/next + step title + hint.
 *
 * Route: /lab/:slug/sim   (also accepts ?step=<n> to jump to a specific step)
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EntraSimulator } from "@/components/simulators/EntraSimulator";
import { PortalSimulator } from "@/components/simulators/PortalSimulator";
import { ServiceNowSimulator } from "@/components/simulators/ServiceNowSimulator";
import { KaliTerminalSimulator } from "@/components/simulators/KaliTerminalSimulator";
import { K8sTerminalSimulator } from "@/components/simulators/K8sTerminalSimulator";
import { GcpConsoleSimulator } from "@/components/simulators/GcpConsoleSimulator";
import { SocToolSimulator, type SocTool } from "@/components/simulators/SocToolSimulator";

const SOC_TOOLS: Record<string, SocTool> = {
  splunk: "splunk", qradar: "qradar", elastic: "elastic", kibana: "elastic",
  misp: "misp", thehive: "thehive", wireshark: "wireshark",
  suricata: "suricata", zeek: "suricata",
};
import { TenantCheckPanel } from "@/components/simulators/TenantCheckPanel";
import {
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, Target, Lightbulb, Maximize2,
} from "lucide-react";
import { toast } from "sonner";

export default function LabSimulator() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [lab, setLab] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [attempt, setAttempt] = useState<any>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const stepParam = parseInt(params.get("step") ?? "0", 10);
  const [idx, setIdx] = useState(Number.isFinite(stepParam) ? stepParam : 0);

  useEffect(() => {
    if (!slug || !user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: l } = await supabase.from("labs").select("*").eq("slug", slug).maybeSingle();
      if (!l) { toast.error("Lab not found"); return; }
      const { data: s } = await supabase.from("lab_steps").select("*").eq("lab_id", l.id).order("step_number");
      setLab(l); setSteps(s ?? []);

      const { data: existing } = await supabase
        .from("lab_attempts").select("*")
        .eq("user_id", user.id).eq("lab_id", l.id)
        .in("status", ["in_progress", "completed"])
        .order("started_at", { ascending: false }).limit(1).maybeSingle();
      let att = existing;
      if (!att) {
        const { data: created } = await supabase.from("lab_attempts")
          .insert({ user_id: user.id, lab_id: l.id }).select().single();
        att = created;
      }
      setAttempt(att);
      const { data: sp } = await supabase.from("step_progress").select("*").eq("attempt_id", att!.id);
      const m: Record<string, boolean> = {};
      (sp ?? []).forEach((p: any) => { m[p.step_id] = p.completed; });
      setDone(m);
      setLoading(false);

      // Realtime: keep this tab in sync if the user marks steps in the other tab.
      channel = supabase
        .channel(`step_progress:${att!.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "step_progress", filter: `attempt_id=eq.${att!.id}` },
          (payload: any) => {
            const row = payload.new ?? payload.old;
            if (!row) return;
            setDone((prev) => ({ ...prev, [row.step_id]: !!row.completed }));
          },
        )
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [slug, user]);

  const currentStep = steps[idx];

  const goto = (n: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, n));
    setIdx(clamped); setShowHint(false);
    setParams({ step: String(clamped) }, { replace: true });
  };

  async function markStepDone() {
    if (!currentStep || !attempt || done[currentStep.id]) return;
    setDone((m) => ({ ...m, [currentStep.id]: true }));
    await supabase.from("step_progress").upsert({
      attempt_id: attempt.id, step_id: currentStep.id,
      completed: true, completed_at: new Date().toISOString(), attempts: 1,
    }, { onConflict: "attempt_id,step_id" });
    const newScore = (attempt.score ?? 0) + (currentStep.points ?? 10);
    await supabase.from("lab_attempts").update({ score: newScore }).eq("id", attempt.id);
    setAttempt((a: any) => ({ ...a, score: newScore }));
    toast.success(`+${currentStep.points} points`);
    setTimeout(() => { if (idx < steps.length - 1) goto(idx + 1); }, 700);
  }

  // IMPORTANT: hooks must run on every render — keep useMemo above any early return.
  const simulator = useMemo(() => {
    if (!currentStep || !lab) return null;
    const ea = currentStep.expected_action ?? {};
    if (ea?.type === "tenant_check") {
      return <TenantCheckPanel check={ea.check} params={ea.params ?? {}} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (lab.simulator === "entra" && lab.slug === "mfa-conditional-access") {
      return <EntraSimulator expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (lab.simulator === "kali-terminal" || lab.simulator === "kali") {
      return <KaliTerminalSimulator expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (lab.simulator === "k8s-terminal" || lab.simulator === "k8s") {
      return <K8sTerminalSimulator expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (lab.simulator === "gcp-console" || lab.simulator === "gcp") {
      return <GcpConsoleSimulator expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (SOC_TOOLS[lab.simulator]) {
      return <SocToolSimulator tool={SOC_TOOLS[lab.simulator]} expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (lab.simulator === "servicenow") {
      return <ServiceNowSimulator expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    if (["defender", "purview", "sentinel", "entra", "generic"].includes(lab?.simulator)) {
      return <PortalSimulator simulator={lab.simulator} expectedAction={currentStep.expected_action} onValidate={(ok) => { if (ok) markStepDone(); }} />;
    }
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No simulator registered for this lab type.
        <div className="mt-4">
          <Button onClick={markStepDone}>Mark step done</Button>
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep?.id, lab?.simulator, lab?.slug]);

  if (authLoading) {
    return <div className="min-h-screen p-8"><Skeleton className="h-12 w-1/3" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (loading || !lab) {
    return (
      <div className="min-h-screen p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[70vh] w-full" />
      </div>
    );
  }

  const completedCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Top bar — compact lab navigation */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2 shadow-card">
        <Link to={`/lab/${slug}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to lab
          </Button>
        </Link>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Maximize2 className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground truncate max-w-[40ch]">{lab.title}</h1>
          <Badge variant="outline" className="text-[10px]">Full-screen simulator</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {completedCount}/{steps.length} steps
          </Badge>
          <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => goto(idx - 1)}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" disabled={idx >= steps.length - 1} onClick={() => goto(idx + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Step instruction strip */}
      {currentStep && (
        <div className="border-b border-border bg-muted/30 px-4 py-2">
          <div className="flex items-start gap-3">
            <Badge variant="secondary" className="shrink-0 mt-0.5">
              <Target className="h-3 w-3 mr-1" /> Step {currentStep.step_number}/{steps.length}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">
                {currentStep.title}
                {done[currentStep.id] && <CheckCircle2 className="inline h-4 w-4 ml-2 text-success" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{currentStep.instructions}</p>
              {showHint && currentStep.hint && (
                <div className="mt-1.5 text-xs text-warning flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{currentStep.hint}</span>
                </div>
              )}
            </div>
            {currentStep.hint && !showHint && (
              <Button size="sm" variant="ghost" onClick={() => setShowHint(true)}>
                <Lightbulb className="h-3 w-3 mr-1" /> Hint
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Full-screen simulator */}
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto h-full max-w-[1600px]">{simulator}</div>
      </main>
    </div>
  );
}
