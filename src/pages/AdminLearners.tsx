import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Cog, Search, Users, Activity, CheckCircle2, GraduationCap } from "lucide-react";

type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

type Access = { user_id: string; program: "soc" | "itsm" };
type RoleRow = { user_id: string; role: "learner" | "instructor" | "admin" };
type Attempt = { user_id: string; status: string; score: number; started_at: string; completed_at: string | null };

type LearnerRow = {
  id: string;
  display_name: string;
  joined: string;
  programs: ("soc" | "itsm")[];
  roles: ("learner" | "instructor" | "admin")[];
  attempts: number;
  completed: number;
  avgScore: number;
  lastActive: string | null;
};

const AdminLearners = () => {
  const { isAdmin, isInstructor, loading: authLoading } = useAuth();
  const allowed = isAdmin || isInstructor;
  const [rows, setRows] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!allowed) return;
    (async () => {
      setLoading(true);
      const [{ data: profiles }, { data: access }, { data: roles }, { data: attempts }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, created_at"),
        supabase.from("program_access").select("user_id, program"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("lab_attempts").select("user_id, status, score, started_at, completed_at"),
      ]);

      const accessByUser = new Map<string, ("soc" | "itsm")[]>();
      ((access ?? []) as Access[]).forEach((a) => {
        const arr = accessByUser.get(a.user_id) ?? [];
        arr.push(a.program);
        accessByUser.set(a.user_id, arr);
      });

      const rolesByUser = new Map<string, RoleRow["role"][]>();
      ((roles ?? []) as RoleRow[]).forEach((r) => {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesByUser.set(r.user_id, arr);
      });

      const attemptsByUser = new Map<string, Attempt[]>();
      ((attempts ?? []) as Attempt[]).forEach((a) => {
        const arr = attemptsByUser.get(a.user_id) ?? [];
        arr.push(a);
        attemptsByUser.set(a.user_id, arr);
      });

      const built: LearnerRow[] = ((profiles ?? []) as Profile[]).map((p) => {
        const atts = attemptsByUser.get(p.id) ?? [];
        const completed = atts.filter((a) => a.status === "completed");
        const avg = completed.length
          ? Math.round(completed.reduce((s, a) => s + (a.score || 0), 0) / completed.length)
          : 0;
        const last = atts
          .map((a) => a.completed_at || a.started_at)
          .filter(Boolean)
          .sort()
          .pop() ?? null;
        return {
          id: p.id,
          display_name: p.display_name || "(unnamed)",
          joined: p.created_at,
          programs: accessByUser.get(p.id) ?? [],
          roles: rolesByUser.get(p.id) ?? [],
          attempts: atts.length,
          completed: completed.length,
          avgScore: avg,
          lastActive: last,
        };
      });

      built.sort((a, b) => (b.lastActive ?? b.joined).localeCompare(a.lastActive ?? a.joined));
      setRows(built);
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
    const enrolled = rows.filter((r) => r.programs.length > 0).length;
    const active7d = rows.filter((r) => {
      if (!r.lastActive) return false;
      return Date.now() - new Date(r.lastActive).getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;
    const totalCompletions = rows.reduce((s, r) => s + r.completed, 0);
    return { total, enrolled, active7d, totalCompletions };
  }, [rows]);

  if (authLoading) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout
      title="Admin · Learners"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Learners" }]} />}
      skipAccessGate
    >
      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi icon={Users} label="Total signups" value={stats.total} />
          <Kpi icon={GraduationCap} label="With program access" value={stats.enrolled} />
          <Kpi icon={Activity} label="Active last 7 days" value={stats.active7d} />
          <Kpi icon={CheckCircle2} label="Lab completions" value={stats.totalCompletions} />
        </div>

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
              <div className="p-8 text-center text-sm text-muted-foreground">No learners found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Attempts</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Avg score</TableHead>
                    <TableHead>Last active</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40">
                      <TableCell>
                        <Link to={`/admin/learners/${r.id}`} className="font-medium hover:underline">
                          {r.display_name}
                        </Link>
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{r.id}</div>
                      </TableCell>
                      <TableCell className="space-x-1">
                        {r.programs.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        {r.programs.includes("soc") && (
                          <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />SOC</Badge>
                        )}
                        {r.programs.includes("itsm") && (
                          <Badge variant="outline" className="gap-1"><Cog className="h-3 w-3" />ITSM</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.roles.includes("admin") ? (
                          <Badge>admin</Badge>
                        ) : r.roles.includes("instructor") ? (
                          <Badge variant="secondary">instructor</Badge>
                        ) : (
                          <Badge variant="outline">learner</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.attempts}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.completed}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.avgScore || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.lastActive ? new Date(r.lastActive).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.joined).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
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

export default AdminLearners;
