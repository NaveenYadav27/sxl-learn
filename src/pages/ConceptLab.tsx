import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Activity, Server, Globe,
  ShieldCheck, AlertTriangle, BookOpen, Lightbulb, Cog, Building2, Target,
  XCircle, GraduationCap, Terminal, Cpu, Network, Zap, Clock, Gauge,
} from "lucide-react";
import { getAnyModuleExplanation } from "@/lib/getAnyExplanation";
import { SmartText } from "@/components/SmartText";

type Tone = "default" | "warning" | "primary" | "success" | "danger";
type Section = { key: string; label: string; value: string; icon: any; tone: Tone };

const SECTION_META: Record<string, { icon: any; tone: Tone }> = {
  oneLine:           { icon: Zap,           tone: "primary" },
  formal:            { icon: BookOpen,      tone: "default" },
  plainEnglish:      { icon: Lightbulb,     tone: "default" },
  analogy:           { icon: Lightbulb,     tone: "default" },
  howItWorks:        { icon: Cog,           tone: "primary" },
  microsoftMapping:  { icon: Building2,     tone: "default" },
  whenToUse:         { icon: Target,        tone: "success" },
  whenNotToUse:      { icon: XCircle,       tone: "danger" },
  commonMistake:     { icon: AlertTriangle, tone: "warning" },
  examAngle:         { icon: GraduationCap, tone: "primary" },
};

// stable hash → deterministic mock telemetry per concept
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1", "us-west-2", "eu-central-1"];
const CLUSTERS = ["prod-eks-01", "prod-aks-eu", "stage-gke-02", "prod-eks-02", "prod-ocp-04"];
const ENVS = ["Production", "Staging", "Pre-Prod"];

function toneClasses(tone: Tone) {
  switch (tone) {
    case "primary": return { border: "border-primary/40", bg: "bg-primary/5", text: "text-primary", chip: "bg-primary/10 text-primary border-primary/30" };
    case "warning": return { border: "border-warning/40", bg: "bg-warning/5", text: "text-warning", chip: "bg-warning/10 text-warning border-warning/30" };
    case "danger":  return { border: "border-destructive/40", bg: "bg-destructive/5", text: "text-destructive", chip: "bg-destructive/10 text-destructive border-destructive/30" };
    case "success": return { border: "border-success/40", bg: "bg-success/5", text: "text-success", chip: "bg-success/10 text-success border-success/30" };
    default:        return { border: "border-border", bg: "bg-muted/30", text: "text-foreground", chip: "bg-muted text-muted-foreground border-border" };
  }
}

export default function ConceptLab() {
  const { moduleSlug, conceptId } = useParams<{ moduleSlug: string; conceptId: string }>();
  const explanation = useMemo(
    () => (moduleSlug ? getAnyModuleExplanation(moduleSlug) : undefined),
    [moduleSlug],
  );
  const concept = explanation?.conceptDeepDives.find((c) => c.id === conceptId);

  const sections: Section[] = useMemo(() => {
    if (!concept) return [];
    const raw: Array<[string, string, string]> = [
      ["oneLine", "One-liner", concept.oneLine],
      ["formal", "Formal definition", concept.formal],
      ["plainEnglish", "Plain English", concept.plainEnglish],
      ["analogy", "Analogy", concept.analogy],
      ["howItWorks", "How it works", concept.howItWorks],
      ["microsoftMapping", "Vendor / platform mapping", concept.microsoftMapping],
      ["whenToUse", "When to use (production fit)", concept.whenToUse],
    ];
    if (concept.whenNotToUse) raw.push(["whenNotToUse", "When NOT to use", concept.whenNotToUse]);
    raw.push(["commonMistake", "Common production mistake", concept.commonMistake]);
    raw.push(["examAngle", "Exam / interview angle", concept.examAngle]);
    return raw.map(([key, label, value]) => ({
      key, label, value,
      icon: SECTION_META[key]?.icon ?? BookOpen,
      tone: SECTION_META[key]?.tone ?? "default",
    }));
  }, [concept]);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const total = sections.length;
  const pct = total === 0 ? 0 : Math.round(((step + 1) / total) * 100);

  if (!explanation || !concept) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Concept" }]} />} title="Concept not found">
        <div className="p-6 text-sm text-muted-foreground">
          We couldn't find this concept.{" "}
          <Link to={moduleSlug ? `/module/${moduleSlug}` : "/catalog"} className="text-primary underline">Back to module</Link>
        </div>
      </AppLayout>
    );
  }

  // Deterministic mock telemetry
  const h = hash(concept.id + (moduleSlug ?? ""));
  const env = ENVS[h % ENVS.length];
  const cluster = CLUSTERS[h % CLUSTERS.length];
  const region = REGIONS[(h >> 3) % REGIONS.length];
  const incId = `INC${100000 + (h % 9000)}`;
  const sla = 99.5 + ((h % 50) / 100); // 99.50–99.99
  const nodes = 6 + (h % 18);
  const pods = 40 + (h % 220);
  const rps = 1200 + (h % 8800);

  const currentIdx = explanation.conceptDeepDives.findIndex((c) => c.id === conceptId);
  const prevConcept = currentIdx > 0 ? explanation.conceptDeepDives[currentIdx - 1] : null;
  const nextConcept = currentIdx >= 0 && currentIdx < explanation.conceptDeepDives.length - 1
    ? explanation.conceptDeepDives[currentIdx + 1] : null;

  const current = sections[step];
  const tc = toneClasses(current?.tone ?? "default");
  const Icon = current?.icon ?? BookOpen;

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb items={[
          { label: "Catalog", to: "/catalog" },
          { label: "Module", to: `/module/${moduleSlug}` },
          { label: concept.name },
        ]} />
      }
      title={`${concept.name} — Concept Lab`}
    >
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Header — operational telemetry strip */}
        <Card className="shadow-card border-primary/30 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 px-4 py-2 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="flex items-center gap-1 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE LAB
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1"><Server className="h-3 w-3" /> {cluster}</span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {region}</span>
            <span className="text-muted-foreground">·</span>
            <Badge variant="outline" className="text-[10px] h-4">{env}</Badge>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" /> SLA {sla.toFixed(2)}%</span>
            <span className="ml-auto text-muted-foreground">Ref: {incId}</span>
          </div>

          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px]">CONCEPT LAB</Badge>
              <Badge variant="secondary" className="text-[10px]">{moduleSlug}</Badge>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                Step {Math.min(step + 1, total)} / {total}
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold">{concept.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{concept.oneLine}</p>
            <Progress value={pct} className="h-1.5 mt-3" />

            {/* Industrial KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <KpiTile icon={Cpu}     label="Nodes"        value={String(nodes)} />
              <KpiTile icon={Network} label="Active pods"  value={String(pods)} />
              <KpiTile icon={Activity} label="Req / sec"   value={rps.toLocaleString()} />
              <KpiTile icon={Gauge}   label="Error budget" value={`${(100 - sla).toFixed(2)}%`} />
            </div>
          </CardContent>
        </Card>

        {!done && current && (
          <>
            {/* Step navigator chips */}
            <div className="flex flex-wrap gap-1.5">
              {sections.map((s, i) => {
                const active = i === step;
                const passed = i < step;
                const t = toneClasses(s.tone);
                return (
                  <button
                    key={s.key}
                    onClick={() => setStep(i)}
                    className={`text-[10px] px-2 py-1 rounded border transition ${
                      active ? `${t.chip} ring-1 ring-primary/40 font-semibold` :
                      passed ? "bg-success/5 text-success border-success/30" :
                      "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {passed ? "✓ " : ""}{i + 1}. {s.label}
                  </button>
                );
              })}
            </div>

            {/* Active panel */}
            <Card className={`shadow-card border-2 ${tc.border}`}>
              <div className={`${tc.bg} px-4 py-2 border-b ${tc.border} flex items-center gap-2`}>
                <Icon className={`h-4 w-4 ${tc.text}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${tc.text}`}>{current.label}</span>
                <Badge variant="outline" className="text-[10px] ml-auto h-5">PANEL {step + 1}</Badge>
              </div>
              <CardContent className="pt-4 space-y-3">
                {current.key === "howItWorks" ? (
                  <TerminalBlock text={current.value} cluster={cluster} />
                ) : current.key === "commonMistake" ? (
                  <IncidentBlock text={current.value} incId={incId} cluster={cluster} />
                ) : current.key === "analogy" ? (
                  <AnalogyBlock text={current.value} />
                ) : (
                  <SmartText text={current.value} className="text-base leading-relaxed text-foreground block" />
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                    <ArrowLeft className="h-3 w-3 mr-1" /> Previous
                  </Button>
                  <div className="text-[11px] text-muted-foreground hidden md:block">
                    <Clock className="inline h-3 w-3 mr-1" /> Auto-saved · {pct}% complete
                  </div>
                  {step < total - 1 ? (
                    <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                      Next panel <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setDone(true)}>
                      Sign off <CheckCircle2 className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {done && (
          <Card className="shadow-card border-success/40">
            <div className="bg-success/10 border-b border-success/30 px-4 py-2 flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-semibold text-success uppercase tracking-wide">Lab signed off</span>
              <span className="ml-auto text-muted-foreground">Ref {incId} · {cluster}</span>
            </div>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                You've worked through every angle of <span className="font-semibold text-foreground">{concept.name}</span>.
                Continue with the next concept or return to module overview.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {prevConcept && (
                  <Link to={`/concept-lab/${moduleSlug}/${prevConcept.id}`}>
                    <Button variant="outline" size="sm"><ArrowLeft className="h-3 w-3 mr-1" /> {prevConcept.name}</Button>
                  </Link>
                )}
                {nextConcept && (
                  <Link to={`/concept-lab/${moduleSlug}/${nextConcept.id}`}>
                    <Button size="sm">Next: {nextConcept.name} <ArrowRight className="h-3 w-3 ml-1" /></Button>
                  </Link>
                )}
                <Link to={`/module/${moduleSlug}`}>
                  <Button variant="outline" size="sm">Back to module</Button>
                </Link>
                <Link to={`/module-lab/${moduleSlug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">Run full module lab <ExternalLink className="h-3 w-3 ml-1" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function KpiTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-border rounded-md bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-base font-semibold mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function TerminalBlock({ text, cluster }: { text: string; cluster: string }) {
  return (
    <div className="space-y-2">
      <SmartText text={text} className="text-base leading-relaxed text-foreground block" />
      <div className="rounded-md border border-border bg-black/90 text-green-400 font-mono text-[11px] overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border-b border-green-500/20">
          <span className="h-2 w-2 rounded-full bg-red-500/70" />
          <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
          <span className="h-2 w-2 rounded-full bg-green-500/70" />
          <span className="ml-2 text-green-300/70">ops@{cluster}:~$</span>
        </div>
        <div className="px-3 py-2 space-y-0.5">
          <div><span className="text-green-300/60">$</span> kubectl describe -n prod | head</div>
          <div className="text-green-300/70">  Status: Running   Restarts: 0   Age: 4d12h</div>
          <div className="text-green-300/70">  Image: ghcr.io/acme/api:1.42.0</div>
          <div><span className="text-green-300/60">$</span> tail -f /var/log/runtime.log</div>
          <div className="text-green-300/70">  [INFO]  reconcile loop ok · 38ms</div>
          <div className="text-green-300/70">  [INFO]  health probe 200 · ready=true</div>
        </div>
      </div>
    </div>
  );
}

function IncidentBlock({ text, incId, cluster }: { text: string; incId: string; cluster: string }) {
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-warning font-semibold mb-1">
          <AlertTriangle className="h-3.5 w-3.5" /> Post-incident review · {incId}
        </div>
        <div className="text-[11px] text-muted-foreground mb-2">
          Cluster <span className="font-mono text-foreground">{cluster}</span> · Severity: <span className="text-warning">P2</span> · Detected via SRE on-call
        </div>
        <SmartText text={text} className="text-sm text-foreground leading-relaxed block" />
      </div>
      <div className="text-[11px] text-muted-foreground">
        <Terminal className="inline h-3 w-3 mr-1" /> Tip: avoiding this mistake protects your error budget and reduces MTTR.
      </div>
    </div>
  );
}

function AnalogyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 flex gap-3">
      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <SmartText text={text} className="text-base leading-relaxed text-foreground italic block" />
    </div>
  );
}
