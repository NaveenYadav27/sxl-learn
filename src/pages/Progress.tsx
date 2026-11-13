import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourse";
import {
  Trophy, Sparkles, BookOpen, Clock, CheckCircle2, ArrowRight, Award,
  Users, Shield, Gavel, Network, Lock,
} from "lucide-react";

const domainIcon: Record<string, any> = {
  concepts: Sparkles, iam: Lock, entra: Users, security: Shield, compliance: Gavel,
};
const domainGrad: Record<string, string> = {
  concepts: "bg-gradient-concepts",
  iam: "bg-gradient-iam",
  entra: "bg-gradient-entra",
  security: "bg-gradient-security",
  compliance: "bg-gradient-compliance",
};
const badgeMeta: Record<string, { tone: string; icon: any }> = {
  "first-lab": { tone: "bg-primary", icon: Sparkles },
  "identity-pro": { tone: "bg-domain-entra", icon: Users },
  "soc-analyst": { tone: "bg-domain-security", icon: Shield },
  "compliance-champ": { tone: "bg-domain-compliance", icon: Gavel },
  "xdr-master": { tone: "bg-primary-glow", icon: Network },
  "sc900-ready": { tone: "bg-gradient-hero", icon: Trophy },
};

export default function ProgressPage() {
  const { user } = useAuth();
  const { course } = useCourse();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [totals, setTotals] = useState({ labs: 0, completed: 0, score: 0, minutes: 0 });



  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: mods }, { data: labs }, { data: atts }, { data: badges }, { data: ub }] = await Promise.all([
        supabase.from("modules").select("*").order("sort_order"),
        supabase.from("labs").select("id, module_id, slug, title, duration_min, simulator").eq("is_published", true).order("sort_order"),
        supabase.from("lab_attempts").select("*, lab:labs(id, slug, title, module_id, duration_min)").eq("user_id", user.id).order("started_at", { ascending: false }),
        supabase.from("badges").select("*").order("slug"),
        supabase.from("user_badges").select("*, badge:badges(*)").eq("user_id", user.id).order("earned_at", { ascending: false }),
      ]);

      const labList = labs ?? [];
      const attList = atts ?? [];
      const completedAttempts = attList.filter((a) => a.status === "completed");
      const completedLabIds = new Set(completedAttempts.map((a) => a.lab_id));

      // total time spent on completed attempts (approximate: use lab.duration_min)
      const minutes = completedAttempts.reduce((s, a: any) => s + (a.lab?.duration_min ?? 0), 0);
      const score = attList.reduce((s, a) => s + (a.score ?? 0), 0);

      setTotals({
        labs: labList.length,
        completed: completedLabIds.size,
        score,
        minutes,
      });

      setModules(
        (mods ?? []).map((m) => {
          const moduleLabs = labList.filter((l) => l.module_id === m.id);
          const done = moduleLabs.filter((l) => completedLabIds.has(l.id)).length;
          return { ...m, labs: moduleLabs, total: moduleLabs.length, done };
        })
      );
      setAttempts(attList);
      setAllBadges(badges ?? []);
      setEarnedBadges(ub ?? []);
      setLoading(false);
    })();
  }, [user]);

  const overallPct = totals.labs ? Math.round((totals.completed / totals.labs) * 100) : 0;
  const earnedSlugs = new Set(earnedBadges.map((b) => b.badge?.slug).filter(Boolean));

  return (
    <AppLayout
      title="My Progress"
      breadcrumb={<Breadcrumb items={[{ label: "My Progress" }]} />}
    >
      <div className="container py-6 space-y-6 max-w-6xl">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            {/* Hero summary */}
            <Card className="hero-surface border-0">
              <CardContent className="pt-6 grid md:grid-cols-[1fr_auto] items-center gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">{course.shortName} readiness</div>
                  <div className="text-4xl font-bold mt-1 text-shadowx-gradient">{overallPct}%</div>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    {totals.completed} of {totals.labs} labs completed · {earnedBadges.length} badge{earnedBadges.length === 1 ? "" : "s"} earned
                  </p>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden max-w-md">
                    <div className="h-full bg-gradient-shadowx rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-5 text-center">
                  <HeroStat icon={Sparkles} value={totals.score} label="points" />
                  <HeroStat icon={Clock} value={`${totals.minutes}m`} label="time" />
                  <HeroStat icon={Award} value={earnedBadges.length} label="badges" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="modules" className="space-y-4">
              <TabsList>
                <TabsTrigger value="modules">By module</TabsTrigger>
                <TabsTrigger value="activity">Activity log</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
              </TabsList>

              {/* Modules */}
              <TabsContent value="modules" className="space-y-4">
                {modules.map((m) => {
                  const Icon = domainIcon[m.slug] ?? BookOpen;
                  const pct = m.total ? Math.round((m.done / m.total) * 100) : 0;
                  return (
                    <Card key={m.id} className="shadow-card overflow-hidden">
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
                      <CardContent className="space-y-3">
                        <ProgressBar value={pct} className="h-1.5" />
                        <ul className="divide-y divide-border text-sm">
                          {m.labs.map((lab: any) => {
                            const att = attempts.find((a) => a.lab_id === lab.id);
                            const done = att?.status === "completed";
                            const inProg = att?.status === "in_progress";
                            return (
                              <li key={lab.id} className="py-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  {done ? (
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
                                  )}
                                  <span className={`truncate ${done ? "text-muted-foreground" : ""}`}>{lab.title}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {att && <span className="text-xs text-muted-foreground">{att.score} pts</span>}
                                  <Link to={`/lab/${lab.slug}`}>
                                    <Button size="sm" variant={done ? "ghost" : inProg ? "secondary" : "outline"}>
                                      {done ? "Review" : inProg ? "Resume" : "Start"}
                                    </Button>
                                  </Link>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Activity */}
              <TabsContent value="activity">
                <Card>
                  <CardContent className="pt-6">
                    {attempts.length === 0 ? (
                      <div className="text-center py-10 text-sm text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        No labs started yet.
                        <div className="mt-3"><Link to="/catalog"><Button>Open catalog</Button></Link></div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {attempts.map((a: any) => (
                          <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{a.lab?.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {a.status === "completed" ? "Completed" : "In progress"} ·
                                {" "}{new Date(a.started_at).toLocaleDateString()} · {a.score} pts
                              </div>
                            </div>
                            <Link to={`/lab/${a.lab?.slug}`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                {a.status === "completed" ? "Review" : "Resume"} <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Badges */}
              <TabsContent value="badges">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allBadges.map((b) => {
                    const owned = earnedSlugs.has(b.slug);
                    const meta = badgeMeta[b.slug] ?? { tone: "bg-muted", icon: Award };
                    const Icon = meta.icon;
                    const earned = earnedBadges.find((eb) => eb.badge?.slug === b.slug);
                    return (
                      <Card
                        key={b.id}
                        className={`shadow-card transition-all ${owned ? "" : "opacity-50 grayscale"}`}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className={`mx-auto h-14 w-14 rounded-full grid place-items-center text-primary-foreground mb-3 ${meta.tone}`}>
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="font-semibold text-sm">{b.name}</div>
                          <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                          {owned && earned && (
                            <div className="text-[10px] uppercase tracking-wider text-primary mt-3">
                              Earned {new Date(earned.earned_at).toLocaleDateString()}
                            </div>
                          )}
                          {!owned && (
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3">
                              Locked
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: any; value: any; label: string }) {
  return (
    <div>
      <Icon className="h-4 w-4 mx-auto opacity-80" />
      <div className="text-2xl font-bold leading-none mt-1">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-75 mt-1">{label}</div>
    </div>
  );
}
