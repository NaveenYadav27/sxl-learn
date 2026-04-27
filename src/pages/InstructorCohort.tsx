import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Search, Users, Activity, CheckCircle2, AlertCircle,
  Shield, Cog, TrendingUp, Clock, Trophy,
} from "lucide-react";

type Profile = { id: string; display_name: string | null; created_at: string };
type Access = { user_id: string; program: "soc" | "itsm" };
type Attempt = {
  id: string; user_id: string; lab_id: string; status: string; score: number;
  started_at: string; completed_at: string | null;
  labs?: { title: string; slug: string } | null;
  profiles?: { display_name: string | null } | null;
};

type CohortRow = {
  id: string;
  display_name: string;
  joined: string;
  programs: ("soc" | "itsm")[];
  attempts: number;
  completed: number;
  inProgress: number;
  avgScore: number;
  lastActive: string | null;
  health: "healthy" | "stalled" | "at-risk" | "inactive";
};

const InstructorCohort = () => {
  const { isInstructor, isAdmin, loading: authLoading } = useAuth();
  const allowed = isInstructor || isAdmin;
  const [rows, setRows] = useState<CohortRow[]>([]);
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      setLoading(true);
      const [{ data: profiles }, { data: access }, { data: attempts }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, created_at"),
        supabase.from("program_access").select("user_id, program"),
        supabase
          .from("lab_attempts")
          .select("id, user_id, lab_id, status, score, started_at, completed_at, labs(title, slug)")
          .order("started_at", { ascending: false })
          .limit(500),
      ]);

      const accessByUser = new Map<string, ("soc" | "itsm")[]>();
      ((access ?? []) as Access[]).forEach((a) => {
        const arr = accessByUser.get(a.user_id) ?? [];
        arr.push(a.program);
        accessByUser.set(a.user_id, arr);
      });

      const attemptsByUser = new Map<string, Attempt[]>();
      ((attempts ?? []) as Attempt[]).forEach((a) => {
        const arr = attemptsByUser.get(a.user_id) ?? [];
        arr.push(a);
        attemptsByUser.set(a.user_id, arr);
      });

      const now = Date.now();
      const built: CohortRow[] = ((profiles ?? []) as Profile[])
        // Cohort = only people who have program access (real learners)
        .filter((p) => (accessByUser.get(p.id) ?? []).length > 0)
        .map((p) => {
          const atts = attemptsByUser.get(p.id) ?? [];
          const completed = atts.filter((a) => a.status === "completed");
          const inProg = atts.filter((a) => a.status === "in_progress");
          const avg = completed.length
            ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
            : 0;
          const last =
            atts
              .map((a) => a.completed_at || a.started_at)
              .filter(Boolean)
              .sort()
              .pop() ?? null;

          const daysSince = last ? (now - new Date(last).getTime()) / 86_400_000 : Infinity;
          let health: CohortRow["health"];
          if (atts.length === 0) health = "inactive";
          else if (daysSince > 14) health = "at-risk";
          else if (avg && avg < 60) health = "stalled";
          else health = "healthy";

          return {
            id: p.id,
            display_name: p.display_name || "(unnamed)",
            joined: p.created_at,
            programs: accessByUser.get(p.id) ?? [],
            attempts: atts.length,
            completed: completed.length,
            inProgress: inProg.length,
            avgScore: avg,
            lastActive: last,
            health,
          };
        });

      built.sort((a, b) => (b.lastActive ?? b.joined).localeCompare(a.lastActive ?? a.joined));

      // Attach display_name onto recent attempts for the activity feed
      const profileById = new Map(((profiles ?? []) as Profile[]).map((p) => [p.id, p.display_name]));
      const enrichedRecent = ((attempts ?? []) as Attempt[]).slice(0, 30).map((a) => ({
        ...a,
        profiles: { display_name: profileById.get(a.user_id) ?? null },
      }));

      setRows(built);
      setRecent(enrichedRecent);
      setLoading(false);
    })();
  }, [allowed]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) => r.display_name.toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active7d = rows.filter((r) => {
      if (!r.lastActive) return false;
      return Date.now() - new Date(r.lastActive).getTime() < 7 * 86_400_000;
    }).length;
    const atRisk = rows.filter((r) => r.health === "at-risk" || r.health === "inactive").length;
    const totalCompletions = rows.reduce((s, r) => s + r.completed, 0);
    const avgClassScore = (() => {
      const scored = rows.filter((r) => r.avgScore > 0);
      if (!scored.length) return 0;
      return Math.round(scored.reduce((s, r) => s + r.avgScore, 0) / scored.length);
    })();
    return { total, active7d, atRisk, totalCompletions, avgClassScore };
  }, [rows]);

  if (authLoading) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout
      title="Instructor · Cohort"
      breadcrumb={<Breadcrumb items={[{ label: "Instructor" }, { label: "Cohort" }]} />}
      skipAccessGate
    >
      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi icon={Users} label="Cohort size" value={stats.total} />
          <Kpi icon={Activity} label="Active 7d" value={stats.active7d} />
          <Kpi icon={AlertCircle} label="At-risk / inactive" value={stats.atRisk} tone="warn" />
          <Kpi icon={CheckCircle2} label="Lab completions" value={stats.totalCompletions} />
          <Kpi icon={Trophy} label="Avg class score" value={stats.avgClassScore || "—"} />
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster ({rows.length})</TabsTrigger>
            <TabsTrigger value="activity">Recent activity</TabsTrigger>
            <TabsTrigger value="risk">At-risk learners ({stats.atRisk})</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or user ID…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <span className="text-xs text-muted-foreground">{filtered.length} of {rows.length}</span>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No learners in this cohort yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Learner</TableHead>
                        <TableHead>Programs</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead className="text-right">Attempts</TableHead>
                        <TableHead className="text-right">Done</TableHead>
                        <TableHead className="text-right">Avg score</TableHead>
                        <TableHead>Last active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Link to={`/admin/learners/${r.id}`} className="font-medium hover:underline">
                              {r.display_name}
                            </Link>
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{r.id}</div>
                          </TableCell>
                          <TableCell className="space-x-1">
                            {r.programs.includes("soc") && (
                              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />SOC</Badge>
                            )}
                            {r.programs.includes("itsm") && (
                              <Badge variant="outline" className="gap-1"><Cog className="h-3 w-3" />ITSM</Badge>
                            )}
                          </TableCell>
                          <TableCell><HealthBadge health={r.health} /></TableCell>
                          <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.completed}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.avgScore || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.lastActive ? new Date(r.lastActive).toLocaleString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Last 30 lab events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recent.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                  <div className="divide-y">
                    {recent.map((a) => (
                      <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                        {a.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <Link to={`/admin/learners/${a.user_id}`} className="font-medium hover:underline">
                              {a.profiles?.display_name || "(unnamed)"}
                            </Link>{" "}
                            <span className="text-muted-foreground">
                              {a.status === "completed" ? "completed" : "started"}
                            </span>{" "}
                            <span className="font-medium">{a.labs?.title ?? "a lab"}</span>
                            {a.status === "completed" && (
                              <span className="text-muted-foreground"> · score {a.score}</span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(a.completed_at || a.started_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {(() => {
                  const risky = rows.filter((r) => r.health === "at-risk" || r.health === "inactive");
                  if (risky.length === 0)
                    return (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No at-risk learners. Cohort is on track.
                      </div>
                    );
                  return (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Learner</TableHead>
                          <TableHead>Health</TableHead>
                          <TableHead className="text-right">Attempts</TableHead>
                          <TableHead>Last active</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {risky.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Link to={`/admin/learners/${r.id}`} className="font-medium hover:underline">
                                {r.display_name}
                              </Link>
                            </TableCell>
                            <TableCell><HealthBadge health={r.health} /></TableCell>
                            <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {r.lastActive ? new Date(r.lastActive).toLocaleString() : "Never"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(r.joined).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

function Kpi({
  icon: Icon, label, value, tone,
}: { icon: any; label: string; value: number | string; tone?: "warn" }) {
  const accent =
    tone === "warn"
      ? "bg-warning/10 text-warning"
      : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-md flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthBadge({ health }: { health: CohortRow["health"] }) {
  if (health === "healthy") return <Badge className="bg-success text-success-foreground hover:bg-success/90">healthy</Badge>;
  if (health === "stalled") return <Badge variant="secondary">stalled</Badge>;
  if (health === "at-risk") return <Badge variant="destructive">at-risk</Badge>;
  return <Badge variant="outline">inactive</Badge>;
}

export default InstructorCohort;
