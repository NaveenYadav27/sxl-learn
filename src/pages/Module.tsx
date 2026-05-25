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
import { HoverGlossary } from "@/components/HoverGlossary";
import { SmartText } from "@/components/SmartText";
import { RuntimeVisualizations } from "@/components/RuntimeVisualizations";
import { ConceptDiagram } from "@/components/ConceptDiagram";
import { type DomainKey } from "@/lib/curriculum";
import { getModuleExplanation } from "@/lib/moduleExplanations";
import { getItsmModuleExplanation } from "@/lib/moduleExplanationsItsm";
import { getPen200ModuleExplanation } from "@/lib/moduleExplanationsPen200";
import { getCsaModuleExplanation } from "@/lib/moduleExplanationsCsa";
import { getK8sModuleExplanation } from "@/lib/moduleExplanationsK8s";
import { getCdlModuleExplanation } from "@/lib/moduleExplanationsCdl";
import { getCcnaModuleExplanation } from "@/lib/moduleExplanationsCcna";
import { getSplunkesModuleExplanation } from "@/lib/moduleExplanationsSplunkes";
import { useCourse } from "@/hooks/useCourse";
import { COURSE_LIST } from "@/lib/courses";
import { courseCodeToProgram } from "@/lib/programMap";
import { ProgramGate } from "@/components/ProgramGate";
import { ListChecks as ProcessIcon, Workflow, Database, GitBranch } from "lucide-react";

type DomainStyle = { icon: any; bar: string; soft: string; chip: string; label: string };

const sc900DomainMeta: Record<DomainKey, DomainStyle> = {
  concepts:   { icon: Sparkles,   bar: "bg-gradient-concepts",   soft: "bg-domain-concepts/5",   chip: "bg-domain-concepts/15 text-domain-concepts border-domain-concepts/30",     label: "Concepts" },
  iam:        { icon: Users,      bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Identity & Access" },
  entra:      { icon: Building2,  bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Entra" },
  security:   { icon: Shield,     bar: "bg-gradient-security",   soft: "bg-domain-security/5",   chip: "bg-domain-security/15 text-domain-security border-domain-security/30",     label: "Security" },
  compliance: { icon: Gavel,      bar: "bg-gradient-compliance", soft: "bg-domain-compliance/5", chip: "bg-domain-compliance/15 text-domain-compliance border-domain-compliance/30", label: "Compliance" },
  exam:       { icon: GraduationCap, bar: "bg-gradient-hero",   soft: "bg-primary/5",           chip: "bg-primary/15 text-primary border-primary/30",                              label: "Exam" },
};

// CIS-ITSM reuses the same domain slugs but the labels/icons must reflect ITSM processes
const itsmDomainMeta: Record<DomainKey, DomainStyle> = {
  concepts:   { icon: Building2,     bar: "bg-gradient-concepts",   soft: "bg-domain-concepts/5",   chip: "bg-domain-concepts/15 text-domain-concepts border-domain-concepts/30",     label: "Foundations" },
  iam:        { icon: ProcessIcon,   bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Incident" },
  entra:      { icon: Workflow,      bar: "bg-gradient-entra",      soft: "bg-domain-entra/5",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              label: "Problem & Knowledge" },
  security:   { icon: GitBranch,     bar: "bg-gradient-security",   soft: "bg-domain-security/5",   chip: "bg-domain-security/15 text-domain-security border-domain-security/30",     label: "Change & Release" },
  compliance: { icon: Database,      bar: "bg-gradient-compliance", soft: "bg-domain-compliance/5", chip: "bg-domain-compliance/15 text-domain-compliance border-domain-compliance/30", label: "Catalog & CMDB" },
  exam:       { icon: GraduationCap, bar: "bg-gradient-hero",       soft: "bg-primary/5",           chip: "bg-primary/15 text-primary border-primary/30",                              label: "Exam" },
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

export default function Module() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { course } = useCourse();
  const moduleNotes = course.modules;
  const domainMeta = course.code === "cis-itsm" ? itsmDomainMeta : sc900DomainMeta;
  const moduleOrder = moduleNotes.filter((m) => m.moduleSlug !== null).map((m) => m.moduleSlug!) as string[];
  const [labs, setLabs] = useState<Lab[]>([]);
  const [progress, setProgress] = useState<Record<string, string>>({});

  // Look up the curriculum note + explanation in the active course first; if
  // not found (e.g. user navigated here from a different course's catalog and
  // then switched courses), fall back to the other course so we still render
  // useful content instead of "Module not found".
  const note = useMemo(() => {
    const inActive = moduleNotes.find((m) => m.moduleSlug === slug);
    if (inActive) return inActive;
    // Fallback: search every registered course for a matching slug
    for (const c of COURSE_LIST) {
      const found = c.modules.find((m) => m.moduleSlug === slug);
      if (found) return found;
      // Also search plan-only modules (e.g. the 1-hour tool tour, which is
      // not in the main `modules` list but lives inside plans.oneHour)
      const planLists = [c.plans.oneHour, c.plans.oneDay, c.plans.twoDay, c.plans.fiveDay, c.plans.thirtyDay];
      for (const plan of planLists) {
        if (!plan) continue;
        for (const day of plan) {
          const m2 = day.modules.find((mm) => mm.moduleSlug === slug);
          if (m2) return m2;
        }
      }
    }
    return undefined;
  }, [slug, moduleNotes]);
  const explanation = useMemo(
    () =>
      slug
        ? (course.code === "pen-200"
            ? getPen200ModuleExplanation(slug) ?? getModuleExplanation(slug)
            : course.code === "cis-itsm"
              ? getItsmModuleExplanation(slug) ?? getModuleExplanation(slug)
              : course.code === "csa"
                ? getCsaModuleExplanation(slug) ?? getModuleExplanation(slug)
                : course.code === "k8s"
                  ? getK8sModuleExplanation(slug) ?? getModuleExplanation(slug)
                  : course.code === "cdl"
                    ? getCdlModuleExplanation(slug) ?? getModuleExplanation(slug)
                    : course.code === "ccna"
                      ? getCcnaModuleExplanation(slug) ?? getModuleExplanation(slug)
                      : getModuleExplanation(slug) ?? getItsmModuleExplanation(slug) ?? getPen200ModuleExplanation(slug) ?? getCsaModuleExplanation(slug) ?? getK8sModuleExplanation(slug) ?? getCdlModuleExplanation(slug) ?? getCcnaModuleExplanation(slug))
        : undefined,
    [slug, course.code],
  );

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
  if (!note) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Module" }]} />} title="Module not found">
        <div className="container py-10 max-w-3xl">
          <Card><CardContent className="pt-6 text-sm text-muted-foreground">
            We couldn't find this module. <Link className="text-primary underline" to="/catalog">Back to catalog</Link>.
          </CardContent></Card>
        </div>
      </AppLayout>
    );
  }
  if (!explanation) {
    // Synthetic plan-only module (e.g. CSA 30-day daily blocks, 1-hour intro
    // sessions). These don't ship a rich explanation doc — render the note's
    // topics + lab list so the page is still useful instead of empty.
    const fallbackMeta = domainMeta[note.domain];
    const FIcon = fallbackMeta.icon;
    return (
      <AppLayout
        breadcrumb={<Breadcrumb items={[
          { label: "Course Catalog", to: "/catalog" },
          { label: note.title.replace(/^Day \d+ — /, "").replace(/^Block \d+ — /, "") },
        ]} />}
        title={note.title}
      >
        <div className="container py-6 space-y-6 max-w-4xl">
          <Card className="border-0 shadow-portal overflow-hidden">
            <div className={`h-1.5 ${fallbackMeta.bar}`} />
            <CardContent className={`pt-6 ${fallbackMeta.soft}`}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg grid place-items-center ${fallbackMeta.bar} text-primary-foreground shrink-0`}>
                  <FIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className={fallbackMeta.chip}>{fallbackMeta.label}</Badge>
                  {note.code && <Badge variant="outline" className="ml-2 text-[10px]">{note.code}</Badge>}
                  <h1 className="text-2xl font-bold mt-2">{note.title}</h1>
                  <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />{fmtMin(note.theoryMinutes)} theory</span>
                    <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" />{fmtMin(note.labBudgetMinutes)} labs</span>
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/70"><Clock className="h-3 w-3" />{fmtMin(note.theoryMinutes + note.labBudgetMinutes)} total</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
                <BookOpen className="h-3 w-3" /> What you'll cover
              </div>
              <ul className="space-y-2 text-sm">
                {note.topics.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${fallbackMeta.bar}`} />
                    <span className="text-foreground/85">{t}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {labs.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <FlaskConical className="h-3 w-3" /> Hands-on labs ({labs.length})
                </div>
                <ul className="space-y-2">
                  {labs.map((lab) => (
                    <li key={lab.id}>
                      <a href={`/lab/${lab.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{lab.title}</div>
                          {lab.objective && <div className="text-xs text-muted-foreground truncate">{lab.objective}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] capitalize">{lab.difficulty}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{fmtMin(lab.duration_min)}</Badge>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Link to="/catalog"><Button variant="outline" size="sm" className="gap-1"><ArrowLeft className="h-3 w-3" /> Back to catalog</Button></Link>
          </div>
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

  const program = courseCodeToProgram[course.code];

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[
        { label: "Course Catalog", to: "/catalog" },
        { label: note.title.replace(/^Module \d+ — /, "") },
      ]} />}
      title={note.title}
    >
      <ProgramGate program={program} moduleSlug={slug}>
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

        {/* Module 1 & 2 enhancements: hover-glossary chips + (M1 only) runtime visualizations */}
        {(slug === "k8s-containerization-fundamentals" || slug === "k8s-docker-images") && (
          <HoverGlossary moduleSlug={slug} />
        )}
        {slug === "k8s-containerization-fundamentals" && <RuntimeVisualizations />}

        {/* Kubernetes Resource Center promo — surfaced on every K8s module */}
        {slug?.startsWith("k8s-") && (
          <Card className="shadow-card border-shadowx-azure/40 bg-gradient-to-br from-shadowx-azure/10 to-transparent">
            <CardContent className="pt-5 pb-5 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">
                  Kubernetes Resource Center
                </div>
                <div className="font-semibold">7 downloadable PDFs — master guide, labs, troubleshooting, Windows, interview prep</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Beginner → Engineer → Enterprise. Cross-linked from every incident page.
                </div>
              </div>
              <a href="/k8s/resources">
                <Button className="gap-2 bg-shadowx-gold text-black hover:bg-shadowx-gold/90">
                  Open Resource Center
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Concept Labs — every concept as its own interactive lab */}
        <Card className="shadow-card border-primary/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Concept Labs</h3>
              <Badge variant="outline" className="text-[10px]">Each concept as a lab</Badge>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {explanation.conceptDeepDives.length} labs
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Every concept in this module is available as a standalone interactive lab. Each opens in a new tab.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explanation.conceptDeepDives.map((c, i) => (
                <a
                  key={c.id}
                  href={`/concept-lab/${slug}/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-border rounded-md overflow-hidden hover:border-primary/60 hover:shadow-md transition-all bg-background"
                >
                  <ConceptDiagram conceptName={c.name} conceptId={c.id} />
                  <div className="p-3 flex items-start gap-2 border-t border-border">
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">L{i + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold group-hover:text-primary">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{c.oneLine}</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-2 mt-3">
              <a href="/term-labs" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  Browse all term labs <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
              <a href={`/module-lab/${slug}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="default" className="h-8 text-xs gap-1">
                  Run full module as one lab <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Concept deep dives — every term fully self-explained */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Concept deep dives</h3>
              <Badge variant="outline" className="ml-auto">{explanation.conceptDeepDives.length} concepts</Badge>
              <a href={`/module-lab/${slug}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                  Run full module as one lab <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Click any concept for a full explanation — or open it as its own concept lab in a new tab.</p>
            <Accordion type="single" collapsible className="space-y-2">
              {explanation.conceptDeepDives.map((c) => (
                <AccordionItem key={c.id} value={c.id} className="border border-border rounded-md px-3">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left flex-1">
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.oneLine}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3 text-sm">
                    <div className="flex justify-end -mt-1">
                      <a href={`/concept-lab/${slug}/${c.id}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                          Open as concept lab <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                    <DDRow label="Formal definition" value={c.formal} />
                    <DDRow label="Plain English" value={c.plainEnglish} />
                    <DDRow label="Analogy" value={c.analogy} />
                    <DDRow label="How it works" value={c.howItWorks} />
                    <DDRow label="Microsoft mapping" value={c.microsoftMapping} />
                    <DDRow label="When to use" value={c.whenToUse} />
                    {c.whenNotToUse && <DDRow label="When NOT to use" value={c.whenNotToUse} />}
                    <DDRow label="Common mistake" value={c.commonMistake} tone="warning" />
                    <DDRow label="Exam angle" value={c.examAngle} tone="primary" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Comparison tables */}
        {explanation.comparisons.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Side-by-side comparisons</h3>
              </div>
              <div className="space-y-5">
                {explanation.comparisons.map((cmp, i) => (
                  <div key={i} className="rounded-md border border-border overflow-hidden">
                    <div className={`px-3 py-2 ${meta.soft} border-b border-border text-sm font-semibold`}>{cmp.title}</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {cmp.columns.map((c, j) => (
                            <TableHead key={j} className={j === 0 ? "w-[28%]" : ""}>{c}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cmp.rows.map((row, ri) => (
                          <TableRow key={ri}>
                            {row.map((cell, ci) => (
                              <TableCell key={ci} className={ci === 0 ? "font-medium" : "text-foreground/85"}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="px-3 py-2 bg-primary/5 border-t border-border text-xs">
                      <span className="font-semibold text-primary">Bottom line: </span>{cmp.bottomLine}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                      <a href={`/lab/${lab.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1 h-7">
                          {status === "completed" ? "Review" : status === "in_progress" ? "Resume" : "Start"}
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Glossary (key terms with examples) + Exam tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Glossary</h3>
                <Badge variant="outline" className="ml-auto text-[10px]">{explanation.keyTerms.length} terms</Badge>
              </div>
              <dl className="space-y-3">
                {explanation.keyTerms.map((t, i) => (
                  <div key={i} className="border-l-2 border-border pl-3">
                    <dt className="text-sm font-semibold">{t.term}</dt>
                    <dd className="text-xs text-muted-foreground leading-relaxed">{t.definition}</dd>
                    {t.example && <dd className="text-[11px] text-foreground/70 mt-0.5"><span className="font-semibold">e.g. </span>{t.example}</dd>}
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-warning">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-warning" />
                <h3 className="text-base font-semibold">{course.shortName} exam tips</h3>
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

        {/* Common pitfalls */}
        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-base font-semibold">Common pitfalls (don't fall for these)</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {explanation.commonPitfalls.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-foreground/85 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircleQuestion className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Frequently asked questions</h3>
              <Badge variant="outline" className="ml-auto text-[10px]">Answered for you</Badge>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {explanation.faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-md px-3">
                  <AccordionTrigger className="hover:no-underline py-2.5 text-sm font-medium text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/85 leading-relaxed pb-3">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Self check */}
        <Card className="shadow-card border-l-4 border-l-success">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h3 className="text-base font-semibold">Self-check (prove you understood)</h3>
            </div>
            <div className="space-y-4">
              {explanation.selfCheck.map((q, i) => (
                <SelfCheckQuestion key={i} index={i + 1} q={q} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Further reading */}
        {explanation.furtherReading.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Further reading ({
                  course.code === "cis-itsm" ? "ServiceNow Docs"
                    : course.code === "pen-200" ? "OffSec & Kali Docs"
                    : course.code === "k8s" ? "Kubernetes & Docker Docs"
                    : course.code === "csa" ? "Microsoft Learn & EC-Council"
                    : course.code === "cdl" ? "Google Cloud Docs"
                    : "Microsoft Learn"
                })</h3>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {explanation.furtherReading.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors">
                      <ExternalLink className="h-3 w-3 text-primary shrink-0" />
                      <span className="truncate">{r.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

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
      </ProgramGate>
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

function DDRow({ label, value, tone }: { label: string; value: string; tone?: "warning" | "primary" }) {
  const toneClass =
    tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-muted-foreground";
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-wide font-semibold mb-0.5 ${toneClass}`}>{label}</div>
      <SmartText text={value} className="text-sm leading-relaxed text-foreground/85 block" />
    </div>
  );
}

function SelfCheckQuestion({ index, q }: { index: number; q: { question: string; options: string[]; correctIndex: number; explanation: string } }) {
  const [picked, setPicked] = useState<number | null>(null);
  const isCorrect = picked === q.correctIndex;
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-sm font-medium mb-2"><span className="text-muted-foreground">Q{index}. </span>{q.question}</div>
      <div className="space-y-1.5">
        {q.options.map((opt, i) => {
          const selected = picked === i;
          const showCorrect = picked !== null && i === q.correctIndex;
          const showWrong = selected && i !== q.correctIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              disabled={picked !== null}
              className={`w-full text-left text-sm px-3 py-1.5 rounded border transition-colors ${
                showCorrect ? "border-success bg-success/10 text-success" :
                showWrong ? "border-destructive bg-destructive/10 text-destructive" :
                selected ? "border-primary" : "border-border hover:bg-muted"
              }`}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-2 text-xs leading-relaxed rounded-md p-2 ${isCorrect ? "bg-success/5 text-foreground/90" : "bg-warning/5 text-foreground/90"}`}>
          <span className={`font-semibold ${isCorrect ? "text-success" : "text-warning"}`}>{isCorrect ? "Correct. " : "Not quite. "}</span>
          {q.explanation}
        </div>
      )}
    </div>
  );
}
