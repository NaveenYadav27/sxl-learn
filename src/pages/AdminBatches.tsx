import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, UserPlus, X } from "lucide-react";
import { programLabels, type ProgramCode } from "@/lib/programMap";

const PROGRAMS: ProgramCode[] = ["soc", "itsm", "pen200", "csa", "k8s"];

type Batch = {
  id: string;
  name: string;
  program: ProgramCode;
  start_date: string;
  end_date: string | null;
  capacity: number;
  instructor_id: string | null;
  is_active: boolean;
};

type Profile = { id: string; display_name: string | null };
type Enrollment = { id: string; user_id: string | null; batch_id: string };

const AdminBatches = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [program, setProgram] = useState<ProgramCode>("k8s");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [instructorId, setInstructorId] = useState<string>("none");
  const [creating, setCreating] = useState(false);

  // assign learner
  const [assignBatch, setAssignBatch] = useState<Batch | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function refresh() {
    setLoading(true);
    const [{ data: b }, { data: roles }, { data: profs }, { data: be }] = await Promise.all([
      supabase.from("batches").select("*").order("start_date", { ascending: false }),
      supabase.from("user_roles").select("user_id").eq("role", "instructor"),
      supabase.from("profiles").select("id, display_name"),
      supabase.from("batch_enrollments").select("id, user_id, batch_id"),
    ]);
    const profMap: Record<string, Profile> = {};
    (profs ?? []).forEach((p: any) => (profMap[p.id] = p));
    const instructorIds = new Set((roles ?? []).map((r: any) => r.user_id));
    setBatches((b ?? []) as Batch[]);
    setInstructors((profs ?? []).filter((p: any) => instructorIds.has(p.id)));
    setProfilesById(profMap);
    setEnrollments((be ?? []) as Enrollment[]);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  async function createBatch() {
    if (!name.trim() || !startDate) {
      toast({ title: "Name and start date required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("batches").insert({
      name: name.trim(),
      program,
      start_date: startDate,
      end_date: endDate || null,
      capacity,
      instructor_id: instructorId === "none" ? null : instructorId,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Batch created" });
    setOpen(false);
    setName("");
    refresh();
  }

  async function toggleActive(b: Batch) {
    const { error } = await supabase.from("batches").update({ is_active: !b.is_active }).eq("id", b.id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    refresh();
  }

  async function removeBatch(id: string) {
    if (!confirm("Delete this batch and all its assignments?")) return;
    await supabase.from("batch_enrollments").delete().eq("batch_id", id);
    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    refresh();
  }

  async function assignLearner() {
    if (!assignBatch || !assignEmail.trim()) return;
    setAssigning(true);
    // look up by email via profiles join — we don't have email on profiles, so we use enrollments
    const { data: enr } = await supabase
      .from("enrollments")
      .select("user_id")
      .ilike("email", assignEmail.trim())
      .not("user_id", "is", null)
      .limit(1);
    const uid = enr?.[0]?.user_id;
    if (!uid) {
      setAssigning(false);
      toast({ title: "User not found", description: "They must sign up first.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("batch_enrollments").insert({ batch_id: assignBatch.id, user_id: uid });
    setAssigning(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Learner added to batch" });
    setAssignEmail("");
    refresh();
  }

  async function removeFromBatch(enrollmentId: string) {
    const { error } = await supabase.from("batch_enrollments").delete().eq("id", enrollmentId);
    if (error) return toast({ title: error.message, variant: "destructive" });
    refresh();
  }

  return (
    <AppLayout
      title="Admin · Batches"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Batches" }]} />}
    >
      <div className="container py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Cohorts & batches</h2>
            <p className="text-sm text-muted-foreground">Organize learners into batches per program with an instructor.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New batch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create batch</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="K8s · April 2026 · Evenings" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <Select value={program} onValueChange={(v) => setProgram(v as ProgramCode)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROGRAMS.map((p) => <SelectItem key={p} value={p}>{programLabels[p]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || "0"))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End date (optional)</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Select value={instructorId} onValueChange={setInstructorId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Unassigned —</SelectItem>
                      {instructors.map((i) => (
                        <SelectItem key={i.id} value={i.id}>{i.display_name || i.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createBatch} disabled={creating} className="w-full">
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
            ) : batches.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No batches yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead className="text-right">Learners</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => {
                    const count = enrollments.filter((e) => e.batch_id === b.id).length;
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell><Badge variant="outline">{programLabels[b.program]}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(b.start_date).toLocaleDateString()}
                          {b.end_date && ` → ${new Date(b.end_date).toLocaleDateString()}`}
                        </TableCell>
                        <TableCell className="text-xs">
                          {b.instructor_id ? (profilesById[b.instructor_id]?.display_name || "—") : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{count} / {b.capacity}</TableCell>
                        <TableCell>
                          <Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "active" : "archived"}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => setAssignBatch(b)}>
                            <UserPlus className="h-3.5 w-3.5 mr-1" /> Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleActive(b)}>
                            {b.is_active ? "Archive" : "Reactivate"}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeBatch(b.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {assignBatch && (
          <Dialog open={!!assignBatch} onOpenChange={(v) => !v && setAssignBatch(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Manage learners — {assignBatch.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="learner@example.com"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                  />
                  <Button onClick={assignLearner} disabled={assigning}>
                    {assigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Learner must already have an account.</p>
                <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
                  {enrollments.filter((e) => e.batch_id === assignBatch.id).length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No learners assigned yet.</div>
                  ) : (
                    enrollments.filter((e) => e.batch_id === assignBatch.id).map((e) => (
                      <div key={e.id} className="px-3 py-2 flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{e.user_id ? profilesById[e.user_id]?.display_name || "(unnamed)" : "—"}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{e.user_id}</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFromBatch(e.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminBatches;
