import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Shield, Cog, ArrowLeft, RotateCcw, Trash2, UserPlus, CheckCircle2, XCircle, Clock,
  Mail, Network, Truck, Boxes, Bug, Users as UsersIcon,
} from "lucide-react";

type ProgramCode = "soc" | "itsm" | "ccna" | "cdl" | "k8s" | "pen200" | "csa";
const PROGRAMS: { code: ProgramCode; label: string; icon: any }[] = [
  { code: "soc", label: "SOC Analyst", icon: Shield },
  { code: "itsm", label: "ITSM / ServiceNow", icon: Cog },
  { code: "csa", label: "Certified SOC Analyst", icon: UsersIcon },
  { code: "ccna", label: "CCNA", icon: Network },
  { code: "cdl", label: "Cloud Digital Leader", icon: Truck },
  { code: "k8s", label: "Kubernetes", icon: Boxes },
  { code: "pen200", label: "PEN-200 / OSCP", icon: Bug },
];
const programMeta = (p: ProgramCode) => PROGRAMS.find((x) => x.code === p) ?? { code: p, label: p.toUpperCase(), icon: Shield };

type Profile = { id: string; display_name: string | null; created_at: string; pdi_instance_url: string | null };
type AccessRow = { id: string; program: ProgramCode; granted_at: string };
type RoleRow = { role: "learner" | "instructor" | "admin" };
type Attempt = {
  id: string; lab_id: string; status: string; score: number;
  started_at: string; completed_at: string | null;
  labs?: { title: string; slug: string; module_id: string } | null;
};
type Response = {
  id: string; attempt_id: string; selected_index: number; is_correct: boolean; answered_at: string;
  lab_questions?: { question: string; correct_index: number; options: any; explanation: string | null } | null;
};

const AdminLearnerDetail = () => {
  const { userId = "" } = useParams();
  const { isAdmin, isInstructor, loading: authLoading } = useAuth();
  const allowed = isAdmin || isInstructor;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const [email, setEmail] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [{ data: p }, { data: a }, { data: r }, { data: at }, { data: em }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, created_at, pdi_instance_url").eq("id", userId).maybeSingle(),
      supabase.from("program_access").select("id, program, granted_at").eq("user_id", userId),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("lab_attempts")
        .select("id, lab_id, status, score, started_at, completed_at, labs(title, slug, module_id)")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),
      supabase.rpc("admin_get_user_email", { _user_id: userId }),
    ]);
    setProfile((p as Profile) ?? null);
    setEmail((em as string | null) ?? null);
    setAccess((a ?? []) as AccessRow[]);
    setRoles((r ?? []) as RoleRow[]);
    setAttempts((at ?? []) as Attempt[]);

    const attemptIds = (at ?? []).map((x: any) => x.id);
    if (attemptIds.length) {
      const { data: resp } = await supabase
        .from("question_responses")
        .select("id, attempt_id, selected_index, is_correct, answered_at, lab_questions(question, correct_index, options, explanation)")
        .in("attempt_id", attemptIds)
        .order("answered_at", { ascending: false });
      setResponses((resp ?? []) as Response[]);
    } else {
      setResponses([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (allowed && userId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, userId]);

  if (authLoading) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  async function grant(program: ProgramCode) {
    setWorking(true);
    const { error } = await supabase.from("program_access").insert({ user_id: userId, program });
    setWorking(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Granted ${program.toUpperCase()}` });
    refresh();
  }

  async function revoke(id: string) {
    setWorking(true);
    const { error } = await supabase.from("program_access").delete().eq("id", id);
    setWorking(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Access revoked" });
    refresh();
  }

  async function resetProgress() {
    if (!confirm("Reset ALL lab progress for this learner? This cannot be undone.")) return;
    setWorking(true);
    const { error } = await supabase.rpc("reset_user_lab_progress", { _user_id: userId });
    setWorking(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Lab progress reset" });
    refresh();
  }

  const completed = attempts.filter((a) => a.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
    : 0;
  const correctResponses = responses.filter((r) => r.is_correct).length;
  const accuracy = responses.length ? Math.round((correctResponses / responses.length) * 100) : 0;

  const role = roles.some((r) => r.role === "admin")
    ? "admin"
    : roles.some((r) => r.role === "instructor")
    ? "instructor"
    : "learner";

  return (
    <AppLayout
      title={profile?.display_name || "Learner"}
      breadcrumb={
        <Breadcrumb
          items={[
            { label: "Admin" },
            { label: "Learners", to: "/admin/learners" },
            { label: profile?.display_name || "Learner" },
          ]}
        />
      }
      skipAccessGate
    >
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/learners"><ArrowLeft className="h-4 w-4 mr-1" />Back to learners</Link>
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={resetProgress} disabled={working}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset lab progress
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : (
          <>
            {/* Profile card */}
            <Card>
              <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Display name</div>
                    <div className="font-semibold text-lg">{profile?.display_name || "(unnamed)"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-sm flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {email ? (
                        <a href={`mailto:${email}`} className="text-primary hover:underline break-all">{email}</a>
                      ) : (
                        <span className="text-muted-foreground italic">unavailable</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">User ID</div>
                    <div className="font-mono text-xs break-all">{userId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Role</div>
                    <Badge variant={role === "admin" ? "default" : role === "instructor" ? "secondary" : "outline"}>
                      {role}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Joined</div>
                    <div className="text-sm">{profile && new Date(profile.created_at).toLocaleString()}</div>
                  </div>
                  {profile?.pdi_instance_url && (
                    <div>
                      <div className="text-xs text-muted-foreground">PDI instance</div>
                      <a href={profile.pdi_instance_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">
                        {profile.pdi_instance_url}
                      </a>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 content-start">
                  <Stat label="Attempts" value={attempts.length} />
                  <Stat label="Completed" value={completed.length} />
                  <Stat label="Avg score" value={avgScore || "—"} />
                  <Stat label="Questions answered" value={responses.length} />
                  <Stat label="Correct" value={correctResponses} />
                  <Stat label="Accuracy" value={responses.length ? `${accuracy}%` : "—"} />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="access">
              <TabsList>
                <TabsTrigger value="access">Program access ({access.length})</TabsTrigger>
                <TabsTrigger value="attempts">Lab attempts ({attempts.length})</TabsTrigger>
                <TabsTrigger value="responses">Quiz responses ({responses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="access" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Granted programs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {access.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No programs granted yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {access.map((a) => {
                          const meta = programMeta(a.program);
                          const Icon = meta.icon;
                          return (
                            <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="gap-1"><Icon className="h-3 w-3" />{meta.label}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  granted {new Date(a.granted_at).toLocaleString()}
                                </span>
                              </div>
                              {isAdmin && (
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revoke(a.id)} disabled={working}>
                                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        <span className="text-sm text-muted-foreground self-center mr-2 w-full md:w-auto">Quick grant:</span>
                        {PROGRAMS.map((p) => {
                          const Icon = p.icon;
                          const already = access.some((a) => a.program === p.code);
                          return (
                            <Button
                              key={p.code}
                              size="sm"
                              variant="outline"
                              onClick={() => grant(p.code)}
                              disabled={working || already}
                              title={already ? "Already granted" : `Grant ${p.label}`}
                            >
                              <Icon className="h-3.5 w-3.5 mr-1" /> {p.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attempts" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {attempts.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">No lab attempts.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Lab</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Completed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attempts.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell>
                                <div className="font-medium text-sm">{a.labs?.title ?? "(unknown lab)"}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{a.labs?.slug}</div>
                              </TableCell>
                              <TableCell>
                                {a.status === "completed" ? (
                                  <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" />completed</Badge>
                                ) : a.status === "in_progress" ? (
                                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />in progress</Badge>
                                ) : (
                                  <Badge variant="outline">{a.status}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">{a.score}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(a.started_at).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {a.completed_at ? new Date(a.completed_at).toLocaleString() : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responses" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {responses.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">No quiz responses yet.</div>
                    ) : (
                      <div className="divide-y">
                        {responses.map((r) => {
                          const opts = Array.isArray(r.lab_questions?.options) ? (r.lab_questions!.options as string[]) : [];
                          const chosen = opts[r.selected_index] ?? `option ${r.selected_index}`;
                          const correct = opts[r.lab_questions?.correct_index ?? -1];
                          return (
                            <div key={r.id} className="p-4 space-y-2">
                              <div className="flex items-start gap-2">
                                {r.is_correct ? (
                                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{r.lab_questions?.question ?? "(question missing)"}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Answered: <span className={r.is_correct ? "text-success" : "text-destructive"}>{chosen}</span>
                                    {!r.is_correct && correct && (
                                      <> · Correct: <span className="text-success">{correct}</span></>
                                    )}
                                  </div>
                                  {r.lab_questions?.explanation && (
                                    <div className="text-xs text-muted-foreground mt-1 italic">{r.lab_questions.explanation}</div>
                                  )}
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(r.answered_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default AdminLearnerDetail;
