import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowRight, ArrowLeft, BookOpen, Clock, FlaskConical, Sparkles, Users,
  Building2, Shield, Gavel, Lightbulb, Target, HelpCircle, MapPin, CalendarClock,
  Wrench, GraduationCap, ListChecks, ScrollText, Award, AlertTriangle, MessageCircleQuestion,
  CheckCircle2, XCircle, BookMarked, ExternalLink, Layers,
} from "lucide-react";
import { moduleNotes, type DomainKey } from "@/lib/curriculum";
import { getModuleExplanation } from "@/lib/moduleExplanations";

const domainMeta: Record<DomainKey, { icon: any; bar: string; soft: string; chip: string; label: string }> = {
  concepts:   { icon: Sparkles,   bar: "bg-gradient-concepts",   soft: "bg-domain-concepts/5",   chip: "bg-domain-concepts/15 text-domain-concepts border-domain-concepts/30",     label: "Concepts" },
  iam:        { icon: Users,      bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Identity & Access" },
  entra:      { icon: Building2,  bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Entra" },
  security:   { icon: Shield,     bar: "bg-gradient-security",   soft: "bg-domain-security/5",   chip: "bg-domain-security/15 text-domain-security border-domain-security/30",     label: "Security" },
  compliance: { icon: Gavel,      bar: "bg-gradient-compliance", soft: "bg-domain-compliance/5", chip: "bg-domain-compliance/15 text-domain-compliance border-domain-compliance/30", label: "Compliance" },
  exam:       { icon: GraduationCap, bar: "bg-gradient-hero",   soft: "bg-primary/5",           chip: "bg-primary/15 text-primary border-primary/30",                              label: "Exam" },
};

type Lab = {
  id: string; slug: string; title: string; objective: string | null;
  difficulty: string; duration_min: number; simulator: string;
};

const fmtMin = (min: number) => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60); const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const moduleOrder = moduleNotes.filter((m) => m.moduleSlug !== null).map((m) => m.moduleSlug!) as string[];

export default function Module() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [progress, setProgress] = useState<Record<string, string>>({});

  const note = useMemo(() => moduleNotes.find((m) => m.moduleSlug === slug), [slug]);
  const explanation = useMemo(() => (slug ? getModuleExplanation(slug) : undefined), [slug]);

  useEffect(() => {
    if (!note) return;
    (async () => {
      const { data } = await supabase
        .from("labs")
        .select("id,slug,title,objective,difficulty,duration_min,simulator")
        .in("slug", note.labSlugs)
        .eq("is_published", true);
      // Re-order to match curriculum sequence
      const map = new Map((data ?? []).map((l: any) => [l.slug, l as Lab]));
      const ordered = note.labSlugs.map((s) => map.get(s)).filter(Boolean) as Lab[];
      setLabs(ordered);

      if (user && ordered.length) {
        const { data: att } = await supabase
          .from("lab_attempts")
          .select("lab_id, status")
          .eq("user_id", user.id)
          .in("lab_id", ordered.map((l) => l.id));
        const pmap: Record<string, string> = {};
        (att ?? []).forEach((a: any) => { pmap[a.lab_id] = a.status; });
        setProgress(pmap);
      }
    })();
  }, [note, user]);

  if (!slug) return <Navigate to="/catalog" replace />;
  if (!note || !explanation) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Module" }]} />} title="Module not found">
        <div className="container py-10 max-w-3xl">
          <Card><CardContent className="pt-6 text-sm text-muted-foreground">
            We couldn't find an explanation for this module. <Link className="text-primary underline" to="/catalog">Back to catalog</Link>.
          </CardContent></Card>
        </div>
      </AppLayout>
    );
  }

  const meta = domainMeta[note.domain];
  const Icon = meta.icon;

  // Prev / next nav across modules
  const idx = moduleOrder.indexOf(slug);
  const prevSlug = idx > 0 ? moduleOrder[idx - 1] : null;
  const nextSlug = idx >= 0 && idx < moduleOrder.length - 1 ? moduleOrder[idx + 1] : null;
  const prevNote = prevSlug ? moduleNotes.find((m) => m.moduleSlug === prevSlug) : null;
  const nextNote = nextSlug ? moduleNotes.find((m) => m.moduleSlug === nextSlug) : null;

  const totalMin = note.theoryMinutes + note.labBudgetMinutes;
  const completedLabs = labs.filter((l) => progress[l.id] === "completed").length;

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[
        { label: "Course Catalog", to: "/catalog" },
        { label: note.title.replace(/^Module \d+ — /, "") },
      ]} />}
      title={note.title}
    >
      <div className="container py-6 space-y-6 max-w-5xl">
        {/* Hero */}
        <Card className="border-0 shadow-portal overflow-hidden">
          <div className={`h-1.5 ${meta.bar}`} />
          <CardContent className={`pt-6 ${meta.soft}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-lg grid place-items-center ${meta.bar} text-primary-foreground shrink-0`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <Badge variant="outline" className={meta.chip}>{meta.label}</Badge>
                  {note.code && <Badge variant="outline" className="ml-2 text-[10px]">{note.code}</Badge>}
                  <h1 className="text-2xl font-bold mt-2">{note.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{explanation.tagline}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <Stat icon={BookOpen} label="Theory" value={fmtMin(note.theoryMinutes)} />
                <Stat icon={FlaskConical} label="Labs" value={fmtMin(note.labBudgetMinutes)} />
                <Stat icon={Clock} label="Total" value={fmtMin(totalMin)} />
                <Stat icon={ListChecks} label="Done" value={`${completedLabs}/${labs.length || note.labSlugs.length}`} />
              </div>
            </div>
            <p className="text-sm leading-relaxed mt-5 max-w-3xl">{explanation.overview}</p>
          </CardContent>
        </Card>

        {/* Why it matters callout */}
        <Card className="border-l-4 border-l-primary shadow-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Why this module matters</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{explanation.whyItMatters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5W1H tabs */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <Tabs defaultValue="what">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="what" className="gap-1.5"><HelpCircle className="h-3.5 w-3.5" />What</TabsTrigger>
                <TabsTrigger value="why" className="gap-1.5"><Target className="h-3.5 w-3.5" />Why</TabsTrigger>
                <TabsTrigger value="who" className="gap-1.5"><Users className="h-3.5 w-3.5" />Who</TabsTrigger>
                <TabsTrigger value="when" className="gap-1.5"><CalendarClock className="h-3.5 w-3.5" />When</TabsTrigger>
                <TabsTrigger value="where" className="gap-1.5"><MapPin className="h-3.5 w-3.5" />Where</TabsTrigger>
                <TabsTrigger value="how" className="gap-1.5"><Wrench className="h-3.5 w-3.5" />How</TabsTrigger>
              </TabsList>

              {(["what","why","who","when","where","how"] as const).map((k) => {
                const sec = explanation[k];
                return (
                  <TabsContent key={k} value={k} className="pt-4">
                    <h3 className="text-base font-semibold mb-2">{sec.heading}</h3>
                    <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{sec.body}</p>
                    {sec.bullets && (
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {sec.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2">
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${meta.bar}`} />
                            <span className="text-foreground/85">{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Theory topics from curriculum (TOC bullets) */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Theory topics covered</h3>
              <Badge variant="outline" className="ml-auto">{note.topics.length} topics · {fmtMin(note.theoryMinutes)}</Badge>
            </div>
            <ol className="space-y-2 text-sm">
              {note.topics.map((t, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className={`h-6 w-6 rounded ${meta.bar} text-primary-foreground text-[11px] font-semibold grid place-items-center shrink-0`}>{i+1}</span>
                  <span className="text-foreground/90 pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Real examples */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <ScrollText className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Real-world examples</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {explanation.realExamples.map((ex, i) => (
                <div key={i} className="rounded-lg border border-border p-4 bg-card">
                  <div className="text-sm font-semibold mb-1.5">{ex.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2"><span className="font-semibold text-foreground/80">Scenario: </span>{ex.scenario}</p>
                  <p className="text-xs text-foreground/85 leading-relaxed"><span className="font-semibold text-success">Outcome: </span>{ex.outcome}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hands-on labs */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Hands-on labs</h3>
              <Badge variant="outline" className="ml-auto">{labs.length} labs · {fmtMin(note.labBudgetMinutes)}</Badge>
            </div>
            {labs.length === 0 ? (
              <div className="text-xs text-muted-foreground py-3">Loading labs…</div>
            ) : (
              <ul className="space-y-2">
                {labs.map((lab, idx) => {
                  const status = progress[lab.id];
                  return (
                    <li key={lab.id} className="rounded-md border border-border p-3 hover:shadow-card transition-shadow flex items-start gap-3">
                      <div className={`h-8 w-8 rounded grid place-items-center ${meta.bar} text-primary-foreground text-xs font-semibold shrink-0`}>{idx+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug">{lab.title}</div>
                        {lab.objective && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lab.objective}</p>}
                        <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                          <Badge variant="outline" className="capitalize text-[10px]">{lab.difficulty}</Badge>
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lab.duration_min}m</span>
                          {status === "completed" && <Badge className="bg-success text-success-foreground text-[10px]">✓ Completed</Badge>}
                          {status === "in_progress" && <Badge variant="outline" className="text-[10px]">In progress</Badge>}
                        </div>
                      </div>
                      <Link to={`/lab/${lab.slug}`}>
                        <Button size="sm" className="gap-1 h-7">
                          {status === "completed" ? "Review" : status === "in_progress" ? "Resume" : "Start"}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Key terms + Exam tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Key terms</h3>
              </div>
              <dl className="space-y-2.5">
                {explanation.keyTerms.map((t, i) => (
                  <div key={i}>
                    <dt className="text-sm font-semibold">{t.term}</dt>
                    <dd className="text-xs text-muted-foreground leading-relaxed">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-warning">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-warning" />
                <h3 className="text-base font-semibold">SC-900 exam tips</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {explanation.examTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-warning shrink-0">★</span>
                    <span className="text-foreground/85 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Prev / next nav */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {prevNote ? (
            <Link to={`/module/${prevNote.moduleSlug}`} className="flex-1">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="text-left">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Previous</span>
                  <span className="block text-sm font-medium truncate">{prevNote.title.replace(/^Module \d+ — /, "")}</span>
                </span>
              </Button>
            </Link>
          ) : <div className="flex-1" />}

          <Link to="/catalog">
            <Button variant="ghost" size="sm">All modules</Button>
          </Link>

          {nextNote ? (
            <Link to={`/module/${nextNote.moduleSlug}`} className="flex-1">
              <Button variant="outline" className="w-full justify-end gap-2 h-auto py-3">
                <span className="text-right">
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">Next</span>
                  <span className="block text-sm font-medium truncate">{nextNote.title.replace(/^Module \d+ — /, "")}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            </Link>
          ) : <div className="flex-1" />}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 min-w-[80px]">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <div className="text-sm font-bold leading-tight mt-0.5">{value}</div>
    </div>
  );
}
