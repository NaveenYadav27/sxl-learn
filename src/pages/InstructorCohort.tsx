import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Search, Users, Activity, CheckCircle2, AlertCircle,
  TrendingUp, Clock, Trophy, Megaphone, Pin, Plus, GraduationCap,
} from "lucide-react";
import { programLabels, type ProgramCode } from "@/lib/programMap";

type Profile = { id: string; display_name: string | null; created_at: string };
type Access = { user_id: string; program: ProgramCode };
type Attempt = {
  id: string; user_id: string; lab_id: string; status: string; score: number;
  started_at: string; completed_at: string | null;
  labs?: { title: string; slug: string } | null;
  profiles?: { display_name: string | null } | null;
};
type Lab = { id: string; title: string; slug: string };
type Announcement = {
  id: string; title: string; body: string; pinned: boolean;
  program: ProgramCode | null; batch_id: string | null;
  author_id: string; created_at: string;
};

type CohortRow = {
  id: string;
  display_name: string;
  joined: string;
  programs: ProgramCode[];
  attempts: number;
  completed: number;
  inProgress: number;
  avgScore: number;
  lastActive: string | null;
  health: "healthy" | "stalled" | "at-risk" | "inactive";
};

const InstructorCohort = () => {
  const { isInstructor, isAdmin, loading: authLoading, user } = useAuth();
  const allowed = isInstructor || isAdmin;
  const [rows, setRows] = useState<CohortRow[]>([]);
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [programFilter, setProgramFilter] = useState<ProgramCode | "all">("all");

  // Announcement dialog
  const [annOpen, setAnnOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annProgram, setAnnProgram] = useState<ProgramCode | "all">("all");
  const [annPinned, setAnnPinned] = useState(false);
  const [annPosting, setAnnPosting] = useState(false);

  // Manual grading dialog
  const [gradeUserId, setGradeUserId] = useState<string | null>(null);
  const [gradeLabId, setGradeLabId] = useState<string>("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: profiles }, { data: access }, { data: attempts }, { data: labsData }, { data: anns }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, created_at"),
      supabase.from("program_access").select("user_id, program"),
      supabase
        .from("lab_attempts")
        .select("id, user_id, lab_id, status, score, started_at, completed_at, labs(title, slug)")
        .order("started_at", { ascending: false })
        .limit(500),
      supabase.from("labs").select("id, title, slug").eq("is_published", true).order("title"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    const accessByUser = new Map<string, ProgramCode[]>();
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
      .filter((p) => (accessByUser.get(p.id) ?? []).length > 0)
      .map((p) => {
        const atts = attemptsByUser.get(p.id) ?? [];
        const completed = atts.filter((a) => a.status === "completed");
        const inProg = atts.filter((a) => a.status === "in_progress");
        const avg = completed.length
          ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
          : 0;
        const last =
          atts.map((a) => a.completed_at || a.started_at).filter(Boolean).sort().pop() ?? null;
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

    const profileById = new Map(((profiles ?? []) as Profile[]).map((p) => [p.id, p.display_name]));
    const enrichedRecent = ((attempts ?? []) as Attempt[]).slice(0, 30).map((a) => ({
      ...a,
      profiles: { display_name: profileById.get(a.user_id) ?? null },
    }));

    setRows(built);
    setRecent(enrichedRecent);
    setLabs((labsData ?? []) as Lab[]);
    setAnnouncements((anns ?? []) as Announcement[]);
    setLoading(false);
  }

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => programFilter === "all" || r.programs.includes(programFilter))
      .filter((r) => !needle || r.display_name.toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle));
  }, [q, rows, programFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active7d = filtered.filter((r) => r.lastActive && Date.now() - new Date(r.lastActive).getTime() < 7 * 86_400_000).length;
    const atRisk = filtered.filter((r) => r.health === "at-risk" || r.health === "inactive").length;
    const totalCompletions = filtered.reduce((s, r) => s + r.completed, 0);
    const scored = filtered.filter((r) => r.avgScore > 0);
    const avgClassScore = scored.length ? Math.round(scored.reduce((s, r) => s + r.avgScore, 0) / scored.length) : 0;
    return { total, active7d, atRisk, totalCompletions, avgClassScore };
  }, [filtered]);

  async function postAnnouncement() {
    if (!user || !annTitle.trim() || !annBody.trim()) {
      toast({ title: "Title and body required", variant: "destructive" });
      return;
    }
    setAnnPosting(true);
    const { error } = await supabase.from("announcements").insert({
      title: annTitle.trim(),
      body: annBody.trim(),
      pinned: annPinned,
      program: annProgram === "all" ? null : annProgram,
      batch_id: null,
      author_id: user.id,
    });
    setAnnPosting(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Announcement posted" });
    setAnnTitle(""); setAnnBody(""); setAnnPinned(false); setAnnOpen(false);
    load();
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    setAnnouncements((p) => p.filter((a) => a.id !== id));
  }

  async function submitGrade() {
    if (!user || !gradeUserId || !gradeLabId) return;
    setGrading(true);
    const { error } = await supabase.from("instructor_lab_overrides").insert({
      user_id: gradeUserId,
      lab_id: gradeLabId,
      instructor_id: user.id,
      status: "completed",
      feedback: gradeFeedback || null,
    });
    setGrading(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Lab marked complete" });
    setGradeUserId(null); setGradeLabId(""); setGradeFeedback("");
  }

  if (authLoading) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout
      title="Instructor · Cohort"
      breadcrumb={<Breadcrumb items={[{ label: "Instructor" }, { label: "Cohort" }]} />}
      skipAccessGate
    >
      <div className="container py-6 space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <Select value={programFilter} onValueChange={(v) => setProgramFilter(v as any)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {(["soc", "itsm", "pen200", "csa", "k8s"] as ProgramCode[]).map((p) => (
                <SelectItem key={p} value={p}>{programLabels[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={annOpen} onOpenChange={setAnnOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Megaphone className="h-4 w-4" /> Post announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New announcement</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Title</Label><Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>Body</Label><Textarea rows={5} value={annBody} onChange={(e) => setAnnBody(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={annProgram} onValueChange={(v) => setAnnProgram(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All programs</SelectItem>
                      {(["soc", "itsm", "pen200", "csa", "k8s"] as ProgramCode[]).map((p) => (
                        <SelectItem key={p} value={p}>{programLabels[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={annPinned} onCheckedChange={(v) => setAnnPinned(!!v)} />
                  <Pin className="h-3.5 w-3.5" /> Pin to top
                </label>
                <Button onClick={postAnnouncement} disabled={annPosting} className="w-full">
                  {annPosting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi icon={Users} label="Cohort size" value={stats.total} />
          <Kpi icon={Activity} label="Active 7d" value={stats.active7d} />
          <Kpi icon={AlertCircle} label="At-risk / inactive" value={stats.atRisk} tone="warn" />
          <Kpi icon={CheckCircle2} label="Lab completions" value={stats.totalCompletions} />
          <Kpi icon={Trophy} label="Avg class score" value={stats.avgClassScore || "—"} />
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster ({filtered.length})</TabsTrigger>
            <TabsTrigger value="activity">Recent activity</TabsTrigger>
            <TabsTrigger value="risk">At-risk ({stats.atRisk})</TabsTrigger>
            <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name or user ID…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
              <span className="text-xs text-muted-foreground">{filtered.length} of {rows.length}</span>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No learners match.</div>
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Link to={`/admin/learners/${r.id}`} className="font-medium hover:underline">{r.display_name}</Link>
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{r.id}</div>
                          </TableCell>
                          <TableCell className="space-x-1 space-y-1">
                            {r.programs.map((p) => (
                              <Badge key={p} variant="outline" className="text-[10px]">{p.toUpperCase()}</Badge>
                            ))}
                          </TableCell>
                          <TableCell><HealthBadge health={r.health} /></TableCell>
                          <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.completed}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.avgScore || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.lastActive ? new Date(r.lastActive).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => setGradeUserId(r.id)}>
                              <GraduationCap className="h-3.5 w-3.5 mr-1" /> Grade
                            </Button>
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
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Last 30 lab events</CardTitle></CardHeader>
              <CardContent className="p-0">
                {recent.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                  <div className="divide-y">
                    {recent.map((a) => (
                      <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                        {a.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <Link to={`/admin/learners/${a.user_id}`} className="font-medium hover:underline">{a.profiles?.display_name || "(unnamed)"}</Link>{" "}
                            <span className="text-muted-foreground">{a.status === "completed" ? "completed" : "started"}</span>{" "}
                            <span className="font-medium">{a.labs?.title ?? "a lab"}</span>
                            {a.status === "completed" && <span className="text-muted-foreground"> · score {a.score}</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(a.completed_at || a.started_at).toLocaleString()}</div>
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
                  const risky = filtered.filter((r) => r.health === "at-risk" || r.health === "inactive");
                  if (risky.length === 0) return <div className="p-8 text-center text-sm text-muted-foreground">No at-risk learners. Cohort is on track.</div>;
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
                            <TableCell><Link to={`/admin/learners/${r.id}`} className="font-medium hover:underline">{r.display_name}</Link></TableCell>
                            <TableCell><HealthBadge health={r.health} /></TableCell>
                            <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.lastActive ? new Date(r.lastActive).toLocaleString() : "Never"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(r.joined).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 space-y-3">
            {announcements.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No announcements yet.</CardContent></Card>
            ) : announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {a.pinned && <Pin className="h-3.5 w-3.5 text-warning" />}
                        <h4 className="font-semibold">{a.title}</h4>
                        <Badge variant="outline" className="text-[10px]">{a.program ? programLabels[a.program] : "All programs"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    {(isAdmin || a.author_id === user?.id) && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAnnouncement(a.id)}>Delete</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Manual grading dialog */}
        <Dialog open={!!gradeUserId} onOpenChange={(v) => !v && setGradeUserId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Manually mark lab complete</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Lab</Label>
                <Select value={gradeLabId} onValueChange={setGradeLabId}>
                  <SelectTrigger><SelectValue placeholder="Pick a lab" /></SelectTrigger>
                  <SelectContent>
                    {labs.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Feedback (optional)</Label>
                <Textarea rows={3} value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Great work on the YAML…" />
              </div>
              <Button onClick={submitGrade} disabled={grading || !gradeLabId} className="w-full">
                {grading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Mark complete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number | string; tone?: "warn" }) {
  const accent = tone === "warn" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-md flex items-center justify-center ${accent}`}><Icon className="h-4 w-4" /></div>
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
