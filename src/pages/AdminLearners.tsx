import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { COURSE_LIST } from "@/lib/courses";
import { programToCourseCode, type ProgramCode } from "@/lib/programMap";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Eye,
  RefreshCw,
  Users,
  Check,
  X as XIcon,
  Pencil,
} from "lucide-react";

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  ssid: string | null;
  suspended: boolean;
  created_at: string;
};
type AccessRow = { user_id: string; program: ProgramCode };
type AttemptRow = {
  user_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
};
type TrialRow = { user_id: string };

type Bucket = "subscribed" | "demo" | "registered";

type LearnerRow = {
  id: string;
  display_name: string;
  email: string;
  ssid: string | null;
  suspended: boolean;
  joined: string;
  programs: ProgramCode[];
  attempts: number;
  completed: number;
  progressPct: number;
  hours: number;
  lastActive: string | null;
  bucket: Bucket;
};

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Status" },
  { value: "subscribed", label: "Full Access" },
  { value: "demo", label: "Demo" },
  { value: "registered", label: "Registered" },
  { value: "suspended", label: "Suspended" },
];

const AdminLearners = () => {
  const { isAdmin, isInstructor, loading: authLoading } = useAuth();
  const allowed = isAdmin || isInstructor;
  const [rows, setRows] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSsid, setEditingSsid] = useState<string | null>(null);
  const [ssidDraft, setSsidDraft] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: profiles }, { data: access }, { data: attempts }, { data: trials }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, email, ssid, suspended, created_at"),
        supabase.from("program_access").select("user_id, program"),
        supabase
          .from("lab_attempts")
          .select("user_id, status, started_at, completed_at"),
        supabase.from("k8s_trials").select("user_id"),
      ]);

    const accessByUser = new Map<string, ProgramCode[]>();
    ((access ?? []) as AccessRow[]).forEach((a) => {
      const arr = accessByUser.get(a.user_id) ?? [];
      arr.push(a.program);
      accessByUser.set(a.user_id, arr);
    });

    const attemptsByUser = new Map<string, AttemptRow[]>();
    ((attempts ?? []) as AttemptRow[]).forEach((a) => {
      const arr = attemptsByUser.get(a.user_id) ?? [];
      arr.push(a);
      attemptsByUser.set(a.user_id, arr);
    });

    const trialSet = new Set(((trials ?? []) as TrialRow[]).map((t) => t.user_id));
    const totalLabs = Math.max(
      1,
      new Set(((attempts ?? []) as AttemptRow[]).map(() => 1)).size, // placeholder denom
    );

    const built: LearnerRow[] = ((profiles ?? []) as ProfileRow[]).map((p) => {
      const atts = attemptsByUser.get(p.id) ?? [];
      const completed = atts.filter((a) => a.status === "completed");
      const totalSeconds = completed.reduce((acc, a) => {
        if (!a.completed_at) return acc;
        const s = new Date(a.started_at).getTime();
        const e = new Date(a.completed_at).getTime();
        return acc + Math.max(0, (e - s) / 1000);
      }, 0);
      const hours = Math.round((totalSeconds / 3600) * 10) / 10;
      const last =
        atts
          .map((a) => a.completed_at || a.started_at)
          .filter(Boolean)
          .sort()
          .pop() ?? null;
      const progs = accessByUser.get(p.id) ?? [];
      let bucket: Bucket;
      if (progs.length > 0) bucket = "subscribed";
      else if (trialSet.has(p.id) || atts.length > 0) bucket = "demo";
      else bucket = "registered";
      const progressPct =
        atts.length > 0 ? Math.min(100, Math.round((completed.length / Math.max(atts.length, totalLabs)) * 100)) : 0;
      return {
        id: p.id,
        display_name: p.display_name || "(unnamed)",
        email: p.email || "",
        ssid: p.ssid,
        suspended: p.suspended,
        joined: p.created_at,
        programs: progs,
        attempts: atts.length,
        completed: completed.length,
        progressPct,
        hours,
        lastActive: last,
        bucket,
      };
    });

    built.sort((a, b) =>
      (b.lastActive ?? b.joined).localeCompare(a.lastActive ?? a.joined),
    );
    setRows(built);
    setLoading(false);
  }

  useEffect(() => {
    if (!allowed) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle) {
        const hay = `${r.display_name} ${r.email} ${r.ssid ?? ""} ${r.id}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (courseFilter !== "all") {
        if (!r.programs.includes(courseFilter as ProgramCode)) return false;
      }
      if (statusFilter !== "all") {
        if (statusFilter === "suspended") {
          if (!r.suspended) return false;
        } else if (r.bucket !== statusFilter) return false;
      }
      return true;
    });
  }, [rows, q, courseFilter, statusFilter]);

  const stats = useMemo(() => {
    const subscribed = rows.filter((r) => r.bucket === "subscribed").length;
    const demo = rows.filter((r) => r.bucket === "demo").length;
    const registered = rows.filter((r) => r.bucket === "registered").length;
    return { total: rows.length, subscribed, demo, registered };
  }, [rows]);

  const groups = useMemo(() => {
    const g: Record<Bucket, LearnerRow[]> = { subscribed: [], demo: [], registered: [] };
    filtered.forEach((r) => g[r.bucket].push(r));
    return g;
  }, [filtered]);

  async function saveSsid(userId: string) {
    const value = ssidDraft.trim().toUpperCase() || null;
    const { error } = await supabase
      .from("profiles")
      .update({ ssid: value })
      .eq("id", userId);
    if (error) {
      toast.error(`Could not save SSID: ${error.message}`);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, ssid: value } : r)));
    setEditingSsid(null);
    setSsidDraft("");
    toast.success("SSID updated");
  }

  if (authLoading) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout
      title="Admin · Users"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Users" }]} />}
      skipAccessGate
    >
      <div className="container py-6 space-y-4">
        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight">
                  All Users <span className="text-muted-foreground">({stats.total})</span>
                </h1>
                <span className="text-xs text-muted-foreground ml-3">
                  <span className="text-primary font-medium">{stats.subscribed} subscribed</span>
                  <span className="mx-1">·</span>
                  <span className="text-amber-500 font-medium">{stats.demo} demo</span>
                  <span className="mx-1">·</span>
                  <span className="text-muted-foreground font-medium">
                    {stats.registered} registered
                  </span>
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click any user row to manage their access, courses, and modules.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or SSID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {COURSE_LIST.map((c) => {
                // Map course code → program code (skip if no mapping)
                const program = Object.entries(programToCourseCode).find(
                  ([, cc]) => cc === c.code,
                )?.[0] as ProgramCode | undefined;
                if (!program) return null;
                return (
                  <SelectItem key={program} value={program}>
                    {c.shortName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <>
            <UserSection
              title="Subscribed Users"
              subtitle="Active course enrollments (paid users)"
              accent="text-primary"
              rows={groups.subscribed}
              editingSsid={editingSsid}
              ssidDraft={ssidDraft}
              onStartEdit={(r) => {
                setEditingSsid(r.id);
                setSsidDraft(r.ssid ?? "");
              }}
              onChangeDraft={setSsidDraft}
              onCancelEdit={() => {
                setEditingSsid(null);
                setSsidDraft("");
              }}
              onSaveSsid={saveSsid}
            />
            <UserSection
              title="Demo Users"
              subtitle="Trial or sample lab activity, no paid course"
              accent="text-amber-500"
              rows={groups.demo}
              editingSsid={editingSsid}
              ssidDraft={ssidDraft}
              onStartEdit={(r) => {
                setEditingSsid(r.id);
                setSsidDraft(r.ssid ?? "");
              }}
              onChangeDraft={setSsidDraft}
              onCancelEdit={() => {
                setEditingSsid(null);
                setSsidDraft("");
              }}
              onSaveSsid={saveSsid}
            />
            <UserSection
              title="Registered Users"
              subtitle="Signed up, no access or activity yet"
              accent="text-muted-foreground"
              rows={groups.registered}
              editingSsid={editingSsid}
              ssidDraft={ssidDraft}
              onStartEdit={(r) => {
                setEditingSsid(r.id);
                setSsidDraft(r.ssid ?? "");
              }}
              onChangeDraft={setSsidDraft}
              onCancelEdit={() => {
                setEditingSsid(null);
                setSsidDraft("");
              }}
              onSaveSsid={saveSsid}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

function UserSection({
  title,
  subtitle,
  accent,
  rows,
  editingSsid,
  ssidDraft,
  onStartEdit,
  onChangeDraft,
  onCancelEdit,
  onSaveSsid,
}: {
  title: string;
  subtitle: string;
  accent: string;
  rows: LearnerRow[];
  editingSsid: string | null;
  ssidDraft: string;
  onStartEdit: (r: LearnerRow) => void;
  onChangeDraft: (v: string) => void;
  onCancelEdit: () => void;
  onSaveSsid: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <h2 className={`text-sm font-semibold ${accent}`}>
            {title} <span className="opacity-70">({rows.length})</span>
          </h2>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        {rows.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">No users in this bucket.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[26%]">User</TableHead>
                <TableHead>SSID</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead className="w-[160px]">Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right w-[80px]">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      to={`/admin/learners/${r.id}`}
                      className="font-medium hover:underline"
                    >
                      {r.display_name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[260px]">
                      {r.email || (
                        <span className="font-mono opacity-60">{r.id.slice(0, 8)}…</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingSsid === r.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          autoFocus
                          value={ssidDraft}
                          onChange={(e) => onChangeDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onSaveSsid(r.id);
                            if (e.key === "Escape") onCancelEdit();
                          }}
                          placeholder="SX-XXXXXX"
                          className="h-7 w-28 text-xs font-mono uppercase"
                        />
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onSaveSsid(r.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelEdit}>
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : r.ssid ? (
                      <button
                        type="button"
                        onClick={() => onStartEdit(r)}
                        className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-mono hover:bg-muted"
                      >
                        {r.ssid}
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartEdit(r)}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                        assign
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.programs.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {r.programs.map((p) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className="uppercase text-[10px] px-1.5 py-0 h-5"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${r.progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                        {r.progressPct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.suspended ? (
                      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
                        Suspended
                      </Badge>
                    ) : r.bucket === "subscribed" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/15">
                        Full Access
                      </Badge>
                    ) : r.bucket === "demo" ? (
                      <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/15">
                        Demo
                      </Badge>
                    ) : (
                      <Badge variant="outline">Registered</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                    {r.hours}h
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/learners/${r.id}`}>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminLearners;
