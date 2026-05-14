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
  Terminal, Cpu, Network, Zap, Gauge, FlaskConical,
} from "lucide-react";
import { findGlossaryTerm, GLOSSARY_KEYS_SORTED } from "@/lib/techGlossary";
import { ConceptDiagram } from "@/components/ConceptDiagram";
import { SmartText } from "@/components/SmartText";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1", "us-west-2", "eu-central-1"];
const CLUSTERS = ["prod-eks-01", "prod-aks-eu", "stage-gke-02", "prod-eks-02", "prod-ocp-04"];

export default function TermLab() {
  const { termKey } = useParams<{ termKey: string }>();
  const entry = useMemo(() => (termKey ? findGlossaryTerm(termKey) : undefined), [termKey]);

  const sections = useMemo(() => {
    if (!entry) return [];
    const out: { key: string; label: string; value: string; icon: any; tone: string }[] = [
      { key: "quick", label: "Quick definition", value: entry.quick, icon: Zap, tone: "primary" },
    ];
    if (entry.definition) out.push({ key: "definition", label: "Formal definition", value: entry.definition, icon: BookOpen, tone: "default" });
    if (entry.production) out.push({ key: "production", label: "Production relevance", value: entry.production, icon: Building2, tone: "primary" });
    if (entry.security)   out.push({ key: "security",   label: "Security impact",      value: entry.security, icon: ShieldCheck, tone: "success" });
    if (entry.commonIssue) out.push({ key: "commonIssue", label: "Common production issue", value: entry.commonIssue, icon: AlertTriangle, tone: "warning" });
    return out;
  }, [entry]);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  if (!entry || !termKey) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Term Labs", to: "/term-labs" }, { label: "Not found" }]} />} title="Term not found">
        <div className="p-6 text-sm text-muted-foreground">
          Term not in glossary. <Link to="/term-labs" className="text-primary underline">Browse all term labs</Link>
        </div>
      </AppLayout>
    );
  }

  const total = sections.length;
  const pct = total === 0 ? 0 : Math.round(((step + 1) / total) * 100);
  const current = sections[step];

  // Mock telemetry
  const h = hash(termKey);
  const cluster = CLUSTERS[h % CLUSTERS.length];
  const region = REGIONS[(h >> 3) % REGIONS.length];
  const incId = `INC${100000 + (h % 9000)}`;
  const sla = 99.5 + ((h % 50) / 100);
  const nodes = 6 + (h % 18);
  const pods = 40 + (h % 220);
  const rps = 1200 + (h % 8800);

  // Suggest next 3 related terms (deterministic)
  const all = GLOSSARY_KEYS_SORTED.filter((k) => k !== termKey.toLowerCase());
  const related = [0, 1, 2].map((i) => all[(h + i * 7) % all.length]);

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb items={[
          { label: "Catalog", to: "/catalog" },
          { label: "Term Labs", to: "/term-labs" },
          { label: entry.term },
        ]} />
      }
      title={`${entry.term} — Term Lab`}
    >
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Telemetry header */}
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
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" /> SLA {sla.toFixed(2)}%</span>
            <span className="ml-auto text-muted-foreground">Ref: {incId}</span>
          </div>

          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-[10px]">TERM LAB</Badge>
              <Badge variant="secondary" className="text-[10px]">{termKey}</Badge>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                Step {Math.min(step + 1, total)} / {total}
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold">{entry.term}</h1>
            <p className="text-sm text-muted-foreground mt-1">{entry.quick}</p>
            <Progress value={pct} className="h-1.5 mt-3" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <Kpi icon={Cpu} label="Nodes" value={String(nodes)} />
              <Kpi icon={Network} label="Active pods" value={String(pods)} />
              <Kpi icon={Activity} label="Req / sec" value={rps.toLocaleString()} />
              <Kpi icon={Gauge} label="Error budget" value={`${(100 - sla).toFixed(2)}%`} />
            </div>
          </CardContent>
        </Card>

        {/* Visual diagram */}
        <div className="animate-fade-in">
          <ConceptDiagram conceptName={entry.term} conceptId={termKey} />
        </div>

        {!done && current && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {sections.map((s, i) => {
                const active = i === step, passed = i < step;
                return (
                  <button
                    key={s.key}
                    onClick={() => setStep(i)}
                    className={`text-[10px] px-2 py-1 rounded border transition ${
                      active ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/40 font-semibold" :
                      passed ? "bg-success/5 text-success border-success/30" :
                      "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {passed ? "✓ " : ""}{i + 1}. {s.label}
                  </button>
                );
              })}
            </div>

            <Card className="shadow-card border-2 border-primary/30">
              <div className="bg-primary/5 px-4 py-2 border-b border-primary/30 flex items-center gap-2">
                <current.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{current.label}</span>
                <Badge variant="outline" className="text-[10px] ml-auto h-5">PANEL {step + 1}</Badge>
              </div>
              <CardContent className="pt-4 space-y-3">
                <SmartText text={current.value} className="text-base leading-relaxed text-foreground block" />

                {/* Bullets */}
                {step === 0 && entry.bullets && entry.bullets.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-2 pt-2">
                    {entry.bullets.map((b, i) => (
                      <div key={i} className="rounded-md border border-border bg-muted/20 p-3">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">{b.label}</div>
                        <ul className="space-y-1">
                          {b.items.map((it) => (
                            <li key={it} className="flex gap-2 text-sm text-foreground/85">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Terminal preview */}
                {current.key === "production" && (
                  <div className="rounded-md border border-border bg-black/90 text-green-400 font-mono text-[11px] overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border-b border-green-500/20">
                      <span className="h-2 w-2 rounded-full bg-red-500/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                      <span className="h-2 w-2 rounded-full bg-green-500/70" />
                      <span className="ml-2 text-green-300/70">ops@{cluster}:~$</span>
                    </div>
                    <div className="px-3 py-2 space-y-0.5">
                      <div><span className="text-green-300/60">$</span> kubectl describe {termKey.toLowerCase()} -n prod | head</div>
                      <div className="text-green-300/70">  Status: Healthy   Age: 4d12h</div>
                      <div><span className="text-green-300/60">$</span> tail -f /var/log/{termKey.toLowerCase()}.log</div>
                      <div className="text-green-300/70">  [INFO]  reconcile ok · 38ms</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                    <ArrowLeft className="h-3 w-3 mr-1" /> Previous
                  </Button>
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
              <span className="font-semibold text-success uppercase tracking-wide">Term lab signed off</span>
              <span className="ml-auto text-muted-foreground">Ref {incId}</span>
            </div>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                You've completed the term lab for <span className="font-semibold text-foreground">{entry.term}</span>.
              </p>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">Related term labs</div>
              <div className="flex flex-wrap gap-2">
                {related.map((k) => {
                  const e = findGlossaryTerm(k);
                  if (!e) return null;
                  return (
                    <Link key={k} to={`/term-lab/${encodeURIComponent(k)}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        {e.term} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  );
                })}
                <Link to="/term-labs">
                  <Button size="sm" variant="default" className="h-7 text-xs">
                    <FlaskConical className="h-3 w-3 mr-1" /> All term labs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-border rounded-md bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-base font-semibold mt-0.5 font-mono">{value}</div>
    </div>
  );
}
