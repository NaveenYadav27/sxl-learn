/**
 * Per-lab page: renders all 16 sections for a single hands-on lab.
 * Route: /k8s/labs/:slug. Read-only — driven entirely by K8S_HANDS_ON_LABS.
 */
import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Clock,
  Download,
  FileText,
  Copy,
  Check,
  Target,
  ListChecks,
  ScrollText,
  AlertTriangle,
  Wrench,
  Building2,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { getLab, labMdPath, labPdfPath, type LabLevel } from "@/lib/k8sHandsOnLabs";
import { useToast } from "@/hooks/use-toast";

const LEVEL_STYLE: Record<LabLevel, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  Engineer: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  Enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/40",
};

type Mode = "Beginner" | "Engineer" | "Enterprise";

function CommandBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ description: "Command copied" });
    } catch {
      toast({ description: "Copy failed", variant: "destructive" });
    }
  };
  return (
    <div className="relative group">
      <pre className="text-[12px] leading-relaxed font-mono bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-md p-3 overflow-x-auto whitespace-pre">
{code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[10px] rounded-sm border border-zinc-700 bg-zinc-900 px-1.5 py-1 text-zinc-200 hover:bg-zinc-800 transition-opacity"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function K8sLabDetail() {
  const { slug } = useParams<{ slug: string }>();
  const lab = slug ? getLab(slug) : undefined;
  const [mode, setMode] = useState<Mode>("Engineer");

  const visibleQuestions = useMemo(() => {
    if (!lab) return null;
    const q = lab.questions;
    if (mode === "Beginner") return { beginner: q.beginner, intermediate: [], advanced: [], scenario: [], viva: q.viva };
    if (mode === "Enterprise") return q;
    return { ...q, advanced: q.advanced };
  }, [lab, mode]);

  if (!lab || !visibleQuestions) return <Navigate to="/k8s" replace />;

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Kubernetes program", to: "/k8s" },
            { label: "Module 3", to: "/module/k8s-fundamentals" },
            { label: `Lab ${String(lab.number).padStart(2, "0")}` },
          ]}
        />
      }
      title={lab.title}
    >
      <div className="container max-w-5xl py-6 space-y-6">
        {/* Hero */}
        <Card className="border-0 shadow-portal overflow-hidden">
          <div className="h-1.5 bg-primary" />
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px]">{lab.id}</Badge>
                  <Badge variant="outline" className="text-[10px]">{lab.category}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${LEVEL_STYLE[lab.level]}`}>
                    {lab.level}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {lab.durationMin} min
                  </span>
                </div>
                <h1 className="text-2xl font-bold">{lab.title}</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-3xl">{lab.objective}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-1.5">
                  <a
                    href={labMdPath(lab)}
                    download
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    <FileText className="h-3 w-3" /> Markdown
                  </a>
                  <a
                    href={labPdfPath(lab)}
                    download
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </a>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-muted-foreground">Mode:</span>
                  {(["Beginner", "Engineer", "Enterprise"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`rounded-full border px-2 py-0.5 ${
                        mode === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lab.focus.map((f) => (
                <span
                  key={f}
                  className="text-[10px] rounded-sm border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Concepts + prereqs */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Target className="h-4 w-4" /> Concepts covered
              </div>
              <ul className="text-sm list-disc list-inside space-y-1 text-foreground/85">
                {lab.conceptsCovered.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <ListChecks className="h-4 w-4" /> Prerequisites
              </div>
              <ul className="text-sm list-disc list-inside space-y-1 text-foreground/85">
                {lab.prerequisites.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Architecture */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <ScrollText className="h-4 w-4" /> Architecture
            </div>
            <p className="text-sm text-foreground/85">{lab.architecture.narrative}</p>
            <pre className="text-[12px] leading-relaxed font-mono bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-md p-3 overflow-x-auto whitespace-pre">
{lab.architecture.ascii}
            </pre>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Wrench className="h-4 w-4" /> Lab steps
            </div>
            <ol className="space-y-5">
              {lab.steps.map((s, i) => (
                <li key={i} className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-mono rounded-sm bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-sm font-semibold">{s.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7">{s.explanation}</p>
                  <div className="pl-7">
                    <CommandBlock code={s.command} />
                  </div>
                  <div className="pl-7 grid md:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-sm border border-border bg-muted/30 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Expected output
                      </div>
                      <div className="font-mono text-[11px] whitespace-pre-wrap text-foreground/90">{s.expectedOutput}</div>
                    </div>
                    {mode !== "Beginner" && (
                      <div className="rounded-sm border border-sky-500/30 bg-sky-500/5 p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-400 mb-1">
                          What happens internally
                        </div>
                        <div className="text-[11px] text-foreground/85">{s.internals}</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Errors + troubleshooting */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Common errors
              </div>
              <ul className="text-xs space-y-2">
                {lab.commonErrors.map((e, i) => (
                  <li key={i} className="rounded-sm border border-border bg-card p-2">
                    <div className="font-semibold text-foreground">{e.error}</div>
                    <div className="text-muted-foreground"><span className="font-medium text-foreground/80">Cause:</span> {e.cause}</div>
                    <div className="text-muted-foreground"><span className="font-medium text-foreground/80">Fix:</span> {e.fix}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Wrench className="h-4 w-4" /> Troubleshooting
              </div>
              <ul className="text-xs list-disc list-inside space-y-1 text-foreground/85">
                {lab.troubleshooting.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise relevance + validation */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Building2 className="h-4 w-4" /> Enterprise relevance
              </div>
              <p className="text-sm text-foreground/85">{lab.enterpriseRelevance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Validation steps
              </div>
              <ul className="text-xs list-disc list-inside space-y-1 text-foreground/85">
                {lab.validation.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Related incidents + guide */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="h-4 w-4" /> Related incidents &amp; guide sections
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Related incidents</div>
                <ul className="space-y-1">
                  {lab.relatedIncidents.map((id) => (
                    <li key={id}>
                      <Link
                        to={`/ops/k8s-incidents/${id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {id} <ExternalLink className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Related guide sections</div>
                <ul className="space-y-1 text-foreground/85">
                  {lab.relatedGuideSections.map((c) => <li key={c}>• {c}</li>)}
                </ul>
                <Link
                  to="/k8s/resources"
                  className="inline-flex items-center gap-1 text-primary hover:underline mt-2 text-[11px]"
                >
                  Resource Center <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardContent className="pt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <HelpCircle className="h-4 w-4" /> Questions ({mode} mode)
            </div>
            <Accordion type="multiple" className="w-full">
              {(
                [
                  ["beginner", "Beginner", visibleQuestions.beginner],
                  ["intermediate", "Intermediate", visibleQuestions.intermediate],
                  ["advanced", "Advanced", visibleQuestions.advanced],
                  ["scenario", "Scenario", visibleQuestions.scenario],
                  ["viva", "Viva", visibleQuestions.viva],
                ] as const
              ).map(([key, label, list]) =>
                list.length === 0 ? null : (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="text-sm">{label} ({list.length})</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 text-sm">
                        {list.map((q, i) => (
                          <li key={i} className="rounded-sm border border-border bg-card p-3">
                            <div className="font-semibold text-foreground">Q. {q.q}</div>
                            <div className="text-foreground/85 mt-1">A. {q.a}</div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link to="/module/k8s-fundamentals">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Module 3
            </Button>
          </Link>
          <Link to="/k8s/resources">
            <Button variant="outline" size="sm" className="gap-1">
              Resource Center <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
