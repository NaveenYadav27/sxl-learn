import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourse";
import { getXpStats, type XpStats } from "@/lib/xp";
import { Trophy, Clock, BookOpen, ArrowRight, Sparkles, Shield, Users, Lock, Gavel, Flame, Zap, ClipboardCheck } from "lucide-react";

const domainIcon: Record<string, any> = { concepts: Sparkles, entra: Users, security: Shield, compliance: Gavel };
const domainGrad: Record<string, string> = {
  concepts: "bg-gradient-concepts", entra: "bg-gradient-entra",
  security: "bg-gradient-security", compliance: "bg-gradient-compliance",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { course } = useCourse();
  const allowedSlugs = useMemo(() => new Set(course.modules.flatMap((m) => m.labSlugs)), [course.code]);
  const allowedModuleSlugs = useMemo(
    () => new Set(course.modules.filter((m) => m.moduleSlug !== null).map((m) => m.moduleSlug!)),
    [course.code],
  );
  const [stats, setStats] = useState({ totalLabs: 0, completed: 0, inProgress: 0, score: 0 });
  const [modules, setModules] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [resumeLab, setResumeLab] = useState<{ slug: string; title: string } | null>(null);
  const [xp, setXp] = useState<XpStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: mods }, { data: labsRaw }, { data: attempts }, xpStats] = await Promise.all([
        supabase.from("modules").select("*").order("sort_order"),
        supabase.from("labs").select("id, module_id, slug"),
        supabase.from("lab_attempts").select("*, lab:labs(slug, title, simulator)").eq("user_id", user.id).order("started_at", { ascending: false }),
        getXpStats(user.id),
      ]);
      setXp(xpStats);

      // Scope labs and modules to the active course
      const labs = (labsRaw ?? []).filter((l: any) => allowedSlugs.has(l.slug));
      const labIds = new Set(labs.map((l: any) => l.id));
      const courseAttempts = (attempts ?? []).filter((a: any) => labIds.has(a.lab_id));

      const completed = courseAttempts.filter((a) => a.status === "completed").length;
      const inProgress = courseAttempts.filter((a) => a.status === "in_progress").length;
      const score = courseAttempts.reduce((s, a) => s + (a.score ?? 0), 0);
      setStats({ totalLabs: labs.length, completed, inProgress, score });

      const labsByModule = new Map<string, number>();
      const completedByModule = new Map<string, Set<string>>();
      labs.forEach((l: any) => labsByModule.set(l.module_id, (labsByModule.get(l.module_id) ?? 0) + 1));
      courseAttempts.filter((a) => a.status === "completed").forEach((a: any) => {
        const lab = labs.find((l: any) => l.id === a.lab_id);
        if (!lab) return;
        if (!completedByModule.has(lab.module_id)) completedByModule.set(lab.module_id, new Set());
        completedByModule.get(lab.module_id)!.add(lab.id);
      });
      const courseMods = (mods ?? []).filter((m: any) => allowedModuleSlugs.has(m.slug));
      // Override DB module title/code/weight with this course's curriculum metadata
      // so CIS-ITSM (which reuses SC-900 slug buckets for styling) shows ITSM titles.
      const noteBySlug = new Map(
        course.modules.filter((n) => n.moduleSlug).map((n) => [n.moduleSlug as string, n] as const),
      );
      setModules(courseMods.map((m: any) => {
        const note = noteBySlug.get(m.slug);
        return {
          ...m,
          title: note?.title ?? m.title,
          domain_code: note?.code ?? m.domain_code,
          exam_weight: note ? `${(note.theoryMinutes ?? 0) + (note.labBudgetMinutes ?? 0)} min` : m.exam_weight,
          total: labsByModule.get(m.id) ?? 0,
          done: completedByModule.get(m.id)?.size ?? 0,
        };
      }));

      // Recent activity scoped to this course
      setRecent(courseAttempts.slice(0, 5));

      // Resume target: most recent in-progress in this course; else most recent; else first lab
      const inProgressAtt = courseAttempts.find((a: any) => a.status === "in_progress");
      const fallbackAtt = courseAttempts[0];
      const target = inProgressAtt ?? fallbackAtt;
      if (target?.lab) {
        setResumeLab({ slug: target.lab.slug, title: target.lab.title });
      } else {
        // First lab in this course's curriculum, if it exists in DB
        const firstSlug = course.modules.flatMap((m) => m.labSlugs)[0];
        if (firstSlug) {
          const { data: firstLab } = await supabase
            .from("labs")
            .select("slug, title")
            .eq("slug", firstSlug)
            .maybeSingle();
          if (firstLab) setResumeLab({ slug: firstLab.slug, title: firstLab.title });
          else setResumeLab(null);
        } else {
          setResumeLab(null);
        }
      }

      setLoading(false);
    })();
  }, [user, course.code, allowedSlugs, allowedModuleSlugs]);

  const overallPct = stats.totalLabs ? Math.round((stats.completed / stats.totalLabs) * 100) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="container py-6 space-y-6">
        {/* Welcome */}
        <Card className="hero-surface border-0">
          <CardContent className="pt-6 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="text-sm text-muted-foreground">Welcome back,</div>
              <div className="text-2xl font-bold text-foreground">{user?.user_metadata?.display_name ?? user?.email?.split("@")[0]}</div>
              <p className="mt-2 text-foreground/80 max-w-xl">
                You're {overallPct}% of the way to {course.shortName} ready. Keep your streak going.
              </p>
            </div>
            <Link to={resumeLab ? `/lab/${resumeLab.slug}` : "/catalog"} className="max-w-xs">
              <Button size="lg" className="gap-2 w-full">
                <span className="truncate">
                  {resumeLab ? `Resume: ${resumeLab.title}` : "Continue learning"}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Streak / XP / Exam strip */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded grid place-items-center bg-warning/10 text-warning">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{xp?.streak ?? 0}<span className="text-sm font-normal text-muted-foreground"> day streak</span></div>
                <div className="text-xs text-muted-foreground">{(xp?.streak ?? 0) > 0 ? "Keep it going — come back tomorrow." : "Complete any step today to start a streak."}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded grid place-items-center bg-primary-soft text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">Lvl {xp?.level ?? 1} <span className="text-sm font-normal text-muted-foreground">· {xp?.xp ?? 0} XP</span></div>
                  <div className="text-xs text-muted-foreground">{xp ? `${xp.xpToNext} XP to level ${xp.level + 1}` : "Earn XP by completing lab steps"}</div>
                </div>
              </div>
              <Progress value={xp ? (xp.xpInLevel / 200) * 100 : 0} className="h-1.5" />
            </CardContent>
          </Card>
          <Card className="shadow-card border-primary/30 bg-primary-soft/40">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded grid place-items-center bg-primary text-primary-foreground">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Practice exam</div>
                <div className="text-xs text-muted-foreground">50 questions · 60 min · pass mark 70%</div>
              </div>
              <Link to="/exam"><Button size="sm">Take exam</Button></Link>
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={BookOpen} label="Labs available" value={stats.totalLabs} tone="text-primary" />
          <Kpi icon={Clock} label="In progress" value={stats.inProgress} tone="text-warning" />
          <Kpi icon={Trophy} label="Completed" value={stats.completed} tone="text-success" />
          <Kpi icon={Sparkles} label="Total points" value={stats.score} tone="text-primary-glow" />
        </div>

        {/* Modules grid */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Your {course.shortName} path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {modules.map((m) => {
              const Icon = domainIcon[m.slug] ?? BookOpen;
              const pct = m.total ? Math.round((m.done / m.total) * 100) : 0;
              return (
                <Card key={m.id} className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow">
                  <div className={`h-1.5 ${domainGrad[m.slug] ?? "bg-primary"}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded grid place-items-center ${domainGrad[m.slug]} text-primary-foreground`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{m.title}</CardTitle>
                          <CardDescription className="text-xs">{m.domain_code} · Exam weight {m.exam_weight}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{m.done}/{m.total}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={pct} className="h-1.5" />
                    <Link to={`/catalog#${m.slug}`} className="mt-3 inline-flex items-center text-sm text-primary hover:underline">
                      View labs <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : recent.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">No labs started yet. Pick one from the catalog to begin.</p>
                  <Link to="/catalog"><Button>Open course catalog</Button></Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((a) => (
                    <li key={a.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{a.lab?.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {a.status === "completed" ? "Completed" : "In progress"} · {a.score} pts
                        </div>
                      </div>
                      <Link to={`/lab/${a.lab?.slug}`}>
                        <Button variant="ghost" size="sm">{a.status === "completed" ? "Review" : "Resume"}</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${tone}`} />
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
