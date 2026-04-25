import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock, ArrowRight, Shield, Users, Gavel, BookOpen, Lock, ExternalLink, Search, X,
  Sparkles, Building2, ClipboardCheck, FlaskConical, Calendar, GraduationCap,
} from "lucide-react";
import { moduleNotes, oneDayPlan, twoDayPlan, fourDayPlan, type DomainKey, type ModuleNote, type DayPlan } from "@/lib/curriculum";

const simulatorIcon: Record<string, any> = {
  entra: Users, defender: Shield, purview: Gavel, sentinel: Lock, generic: BookOpen, tenant: Building2,
};
const simulatorLabel: Record<string, string> = {
  entra: "Microsoft Entra", defender: "Defender XDR", purview: "Microsoft Purview",
  sentinel: "Sentinel", generic: "Concepts", tenant: "Live Tenant",
};
const difficultyTone: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

const domainMeta: Record<DomainKey, { icon: any; bar: string; chip: string; soft: string; label: string }> = {
  concepts:   { icon: Sparkles,       bar: "bg-gradient-concepts",   chip: "bg-domain-concepts/15 text-domain-concepts border-domain-concepts/30",     soft: "bg-domain-concepts/5",   label: "Concepts" },
  iam:        { icon: Users,          bar: "bg-gradient-entra",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              soft: "bg-domain-entra/5",      label: "Identity & Access" },
  entra:      { icon: Building2,      bar: "bg-gradient-entra",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",              soft: "bg-domain-entra/5",      label: "Entra" },
  security:   { icon: Shield,         bar: "bg-gradient-security",   chip: "bg-domain-security/15 text-domain-security border-domain-security/30",     soft: "bg-domain-security/5",   label: "Security" },
  compliance: { icon: Gavel,          bar: "bg-gradient-compliance", chip: "bg-domain-compliance/15 text-domain-compliance border-domain-compliance/30", soft: "bg-domain-compliance/5", label: "Compliance" },
  exam:       { icon: ClipboardCheck, bar: "bg-gradient-hero",       chip: "bg-primary/15 text-primary border-primary/30",                              soft: "bg-primary/5",           label: "Exam Prep" },
};

type Lab = {
  id: string; slug: string; title: string; objective: string | null; scenario: string | null;
  difficulty: string; duration_min: number; simulator: string; ms_learn_url: string | null;
  module_id: string;
};

export default function Catalog() {
  const { user } = useAuth();
  const [labsBySlug, setLabsBySlug] = useState<Record<string, Lab>>({});
  const [progress, setProgress] = useState<Record<string, string>>({}); // labId → status
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [mode, setMode] = useState<"1day" | "2day">("1day");

  useEffect(() => {
    (async () => {
      const { data: labs } = await supabase
        .from("labs").select("*").eq("is_published", true).order("sort_order");
      const map: Record<string, Lab> = {};
      (labs ?? []).forEach((l: any) => { map[l.slug] = l; });
      setLabsBySlug(map);

      if (user) {
        const { data: att } = await supabase
          .from("lab_attempts").select("lab_id, status").eq("user_id", user.id);
        const pmap: Record<string, string> = {};
        (att ?? []).forEach((a: any) => { pmap[a.lab_id] = a.status; });
        setProgress(pmap);
      }
    })();
  }, [user]);

  const matches = (lab: Lab | undefined) => {
    if (!lab) return false;
    if (difficulty !== "all" && lab.difficulty !== difficulty) return false;
    const labStatus = progress[lab.id] ?? "not_started";
    if (status !== "all" && status !== labStatus) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${lab.title} ${lab.objective ?? ""} ${lab.scenario ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const totalLabsAll = moduleNotes.reduce((s, m) => s + m.labSlugs.length, 0);
  const totalShown = useMemo(
    () => moduleNotes.reduce((s, m) => s + m.labSlugs.filter((slug) => matches(labsBySlug[slug])).length, 0),
    [labsBySlug, search, difficulty, status, progress],
  );
  const completed = useMemo(
    () => Object.values(progress).filter((p) => p === "completed").length,
    [progress],
  );
  const filtersActive = search.trim() !== "" || difficulty !== "all" || status !== "all";

  const plan = mode === "1day" ? oneDayPlan : twoDayPlan;
  // Default expand: first day open
  const defaultDay = plan[0]?.id;

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[{ label: "Course Catalog" }]} />}
      title="SC-900 Course Catalog"
    >
      <div className="container py-6 space-y-6 max-w-6xl">
        {/* Hero / overview */}
        <Card className="border-0 shadow-portal overflow-hidden bg-gradient-hero text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="secondary" className="mb-2 gap-1">
                  <GraduationCap className="h-3 w-3" /> SC-900 day-wise index
                </Badge>
                <h1 className="text-2xl font-bold">Course Catalog</h1>
                <p className="text-sm opacity-85 max-w-2xl mt-1">
                  Day-by-day breakdown aligned with the official table of contents. Each module shows the theory notes
                  to teach plus the hands-on labs that follow them.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <HeroStat label="Modules" value={5} icon={BookOpen} />
                <HeroStat label="Labs" value={totalLabsAll} icon={FlaskConical} />
                <HeroStat label="You've done" value={`${completed}/${totalLabsAll}`} icon={ClipboardCheck} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode + filters */}
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4 space-y-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList>
                <TabsTrigger value="1day" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />1-Day intensive</TabsTrigger>
                <TabsTrigger value="2day" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />2-Day split</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search labs by title, objective, or scenario…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="not_started">Not started</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {filtersActive && (
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setSearch(""); setDifficulty("all"); setStatus("all"); }}>
                  <X className="h-3 w-3" /> Clear
                </Button>
              )}
              <div className="text-xs text-muted-foreground ml-auto">
                {totalShown} of {totalLabsAll} labs shown
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day-wise index */}
        <Accordion type="multiple" defaultValue={[defaultDay]} className="space-y-4">
          {plan.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              labsBySlug={labsBySlug}
              progress={progress}
              matches={matches}
            />
          ))}
        </Accordion>
      </div>
    </AppLayout>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

function HeroStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="rounded-md bg-primary-foreground/10 px-3 py-2 min-w-[90px]">
      <div className="flex items-center gap-1.5 text-[10px] opacity-80 uppercase tracking-wide">
        <Icon className="h-3 w-3" />{label}
      </div>
      <div className="text-xl font-bold leading-tight">{value}</div>
    </div>
  );
}

function DayCard({
  day, labsBySlug, progress, matches,
}: {
  day: DayPlan;
  labsBySlug: Record<string, Lab>;
  progress: Record<string, string>;
  matches: (lab: Lab | undefined) => boolean;
}) {
  // Pre-compute filtered labs per module for this day
  const modulesFiltered = day.modules.map((m) => ({
    note: m,
    labs: m.labSlugs.map((slug) => labsBySlug[slug]).filter((l) => matches(l)),
  }));
  const dayLabsCount = day.modules.reduce((s, m) => s + m.labSlugs.length, 0);
  const dayShownCount = modulesFiltered.reduce((s, m) => s + m.labs.length, 0);
  const dayCompleted = day.modules.reduce(
    (s, m) => s + m.labSlugs.filter((slug) => {
      const l = labsBySlug[slug]; return l && progress[l.id] === "completed";
    }).length, 0,
  );
  const dayTheoryMin = day.modules.reduce((s, m) => s + m.theoryMinutes, 0);
  const dayLabMin = day.modules.reduce(
    (s, m) => s + m.labSlugs.reduce((a, slug) => a + (labsBySlug[slug]?.duration_min ?? 0), 0), 0,
  );

  if (dayShownCount === 0 && dayLabsCount > 0) {
    // Hidden by filter — still show empty hint
  }

  return (
    <AccordionItem value={day.id} className="border-0">
      <Card className="overflow-hidden shadow-card">
        <AccordionTrigger className="hover:no-underline px-5 py-4 [&[data-state=open]>div>svg.chev]:rotate-180">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded bg-gradient-hero text-primary-foreground grid place-items-center font-bold shrink-0">
                {day.label.replace(/[^0-9]/g, "")}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{day.label}</div>
                <div className="text-lg font-bold">{day.subtitle}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{day.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" />{dayTheoryMin}m theory</Badge>
              <Badge variant="outline" className="gap-1"><FlaskConical className="h-3 w-3" />{Math.round(dayLabMin)}m labs</Badge>
              <Badge variant="secondary">{dayCompleted}/{dayLabsCount}</Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-5">
          <div className="space-y-5 pt-2">
            {modulesFiltered.map(({ note, labs }) => (
              <ModuleSection
                key={note.title}
                note={note}
                labs={labs}
                progress={progress}
                hiddenCount={note.labSlugs.length - labs.length}
              />
            ))}
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

function ModuleSection({
  note, labs, progress, hiddenCount,
}: {
  note: ModuleNote;
  labs: Lab[];
  progress: Record<string, string>;
  hiddenCount: number;
}) {
  const meta = domainMeta[note.domain];
  const Icon = meta.icon;

  return (
    <section id={note.moduleSlug ?? undefined} className="rounded-lg border border-border overflow-hidden">
      {/* Module header */}
      <div className={`h-1 ${meta.bar}`} />
      <div className={`px-4 py-3 ${meta.soft} border-b border-border`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded grid place-items-center ${meta.bar} text-primary-foreground shrink-0`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                {note.title}
                {note.code && <Badge variant="outline" className="text-[10px]">{note.code}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />{note.theoryMinutes}m theory</span>
                <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" />{note.labSlugs.length} labs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body: Notes + Labs */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Theory notes */}
        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <BookOpen className="h-3 w-3" /> Theory notes
          </div>
          <ul className="space-y-1.5 text-sm">
            {note.topics.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${meta.bar}`} />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Labs */}
        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <FlaskConical className="h-3 w-3" /> Hands-on labs
            {hiddenCount > 0 && (
              <span className="text-[10px] text-muted-foreground/70 font-normal normal-case ml-1">
                ({hiddenCount} hidden by filter)
              </span>
            )}
          </div>

          {note.domain === "exam" ? (
            <ExamCard />
          ) : labs.length === 0 ? (
            <div className="text-xs text-muted-foreground py-3">No labs match the current filters.</div>
          ) : (
            <ul className="space-y-2">
              {labs.map((lab, idx) => (
                <LabRow key={lab.id} lab={lab} index={idx + 1} status={progress[lab.id]} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function LabRow({ lab, index, status }: { lab: Lab; index: number; status?: string }) {
  const Icon = simulatorIcon[lab.simulator] ?? BookOpen;
  return (
    <li className="rounded-md border border-border bg-card hover:shadow-card transition-shadow p-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded bg-primary-soft text-primary grid place-items-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium">Lab {index}</span>
            <span>·</span>
            <span>{simulatorLabel[lab.simulator] ?? lab.simulator}</span>
          </div>
          <div className="text-sm font-medium leading-snug mt-0.5">{lab.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary" className={`${difficultyTone[lab.difficulty]} border-0 capitalize text-[10px] px-1.5 py-0`}>
              {lab.difficulty}
            </Badge>
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />{lab.duration_min}m
            </span>
            {status === "completed" && <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">✓ Completed</Badge>}
            {status === "in_progress" && <Badge variant="outline" className="text-[10px] px-1.5 py-0">In progress</Badge>}
          </div>
          {lab.objective && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{lab.objective}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <Link to={`/lab/${lab.slug}`}>
            <Button size="sm" className="gap-1 h-7 w-full">
              {status === "completed" ? "Review" : status === "in_progress" ? "Resume" : "Start"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          {lab.ms_learn_url && (
            <a
              href={lab.ms_learn_url} target="_blank" rel="noopener noreferrer"
              aria-label={`Open the matching free Microsoft Learn module for ${lab.title} in a new tab`}
            >
              <Button size="sm" variant="outline" className="gap-1 h-7 w-full text-[11px]">
                MS Learn <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

function ExamCard() {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
      <div className="h-8 w-8 rounded bg-gradient-hero text-primary-foreground grid place-items-center shrink-0">
        <ClipboardCheck className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">Take the in-app practice exam</div>
        <p className="text-xs text-muted-foreground mt-1">
          50 questions · 60-minute clock · pass mark 70%. Mirrors the real SC-900 format.
        </p>
      </div>
      <Link to="/exam" className="shrink-0">
        <Button size="sm" className="gap-1 h-7">Start <ArrowRight className="h-3 w-3" /></Button>
      </Link>
    </div>
  );
}
