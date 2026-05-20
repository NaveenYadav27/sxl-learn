import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Trash2, KeyRound, Mail } from "lucide-react";
import { programLabels, type ProgramCode } from "@/lib/programMap";

const PROGRAMS: ProgramCode[] = ["soc", "itsm", "pen200", "csa", "k8s"];

type Enrollment = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  program: ProgramCode;
  notes: string | null;
  status: string;
  created_at: string;
};

type AccessRow = {
  id: string;
  user_id: string;
  program: ProgramCode;
  granted_at: string;
};

const AdminEnrollments = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);

  // grant form
  const [grantEmail, setGrantEmail] = useState("");
  const [grantProgram, setGrantProgram] = useState<ProgramCode>("soc");
  const [granting, setGranting] = useState(false);

  // reset password form
  const [resetEmail, setResetEmail] = useState("");
  const [resetMode, setResetMode] = useState<"link" | "set">("link");
  const [resetPwd, setResetPwd] = useState("");
  const [resetting, setResetting] = useState(false);

  const [profilesById, setProfilesById] = useState<
    Record<string, { display_name: string | null; email: string | null }>
  >({});

  async function refresh() {
    setLoading(true);
    const [{ data: e }, { data: a }] = await Promise.all([
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("program_access").select("*").order("granted_at", { ascending: false }),
    ]);
    setEnrollments((e ?? []) as Enrollment[]);
    const accessRows = (a ?? []) as AccessRow[];
    setAccess(accessRows);
    const ids = Array.from(new Set(accessRows.map((r) => r.user_id)));
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", ids);
      const map: Record<string, { display_name: string | null; email: string | null }> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = { display_name: p.display_name, email: p.email };
      });
      setProfilesById(map);
    } else {
      setProfilesById({});
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  async function setStatus(id: string, status: string) {
    const row = enrollments.find((r) => r.id === id);
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setEnrollments((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    // If marked enrolled, auto-grant access
    if (status === "enrolled" && row) {
      const { data, error: rpcErr } = await supabase.rpc("admin_grant_access_by_email", {
        _email: row.email,
        _program: row.program,
      });
      if (rpcErr) {
        toast({ title: "Access grant failed", description: rpcErr.message, variant: "destructive" });
      } else {
        toast({
          title: data === "granted" ? "Access granted" : "Pending signup",
          description:
            data === "granted"
              ? `${row.email} now has ${programLabels[row.program]} access.`
              : `${row.email} will get access automatically on signup.`,
        });
        refresh();
      }
    }
  }

  async function grantByEmail() {
    if (!grantEmail.trim()) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    setGranting(true);
    const { data, error } = await supabase.rpc("admin_grant_access_by_email", {
      _email: grantEmail.trim(),
      _program: grantProgram,
    });
    setGranting(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: data === "granted" ? "Access granted" : "Pending signup",
      description:
        data === "granted"
          ? `${grantEmail} now has ${programLabels[grantProgram]} access.`
          : `${grantEmail} will get access automatically when they sign up.`,
    });
    setGrantEmail("");
    refresh();
  }

  async function revoke(id: string) {
    const { error } = await supabase.from("program_access").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setAccess((prev) => prev.filter((r) => r.id !== id));
  }

  async function resetPassword() {
    if (!resetEmail.trim()) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    if (resetMode === "set" && resetPwd.length < 8) {
      toast({ title: "Password must be 8+ chars", variant: "destructive" });
      return;
    }
    setResetting(true);
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { email: resetEmail.trim(), mode: resetMode, new_password: resetPwd || undefined },
    });
    setResetting(false);
    if (error || (data && (data as any).error)) {
      toast({
        title: "Reset failed",
        description: error?.message || (data as any).error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Done",
      description: resetMode === "link" ? "Recovery email sent." : "Password updated.",
    });
    setResetEmail("");
    setResetPwd("");
  }

  return (
    <AppLayout
      title="Admin · Enrollments"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Enrollments" }]} />}
    >
      <div className="container py-6 space-y-6">
        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Enrollment requests ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="access">Active access ({access.length})</TabsTrigger>
            <TabsTrigger value="grant">Grant access</TabsTrigger>
            <TabsTrigger value="password">Reset password</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                ) : enrollments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No enrollment requests yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">
                            {r.full_name}
                            {r.notes && <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{r.notes}</div>}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{r.email}</div>
                            {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{programLabels[r.program] ?? r.program}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={r.status === "enrolled" || r.status === "active" ? "default" : "secondary"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "contacted")}>Contacted</Button>
                            <Button size="sm" variant="default" onClick={() => setStatus(r.id, "enrolled")}>Mark enrolled + grant</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {access.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No users have access yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Granted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {access.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">{r.user_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{programLabels[r.program] ?? r.program}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(r.granted_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => revoke(r.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
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

          <TabsContent value="grant" className="mt-4">
            <Card className="max-w-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" /> Grant program access by email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Works whether the user has signed up yet or not. If not yet signed up, access is auto-granted on signup.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="learner@example.com"
                    value={grantEmail}
                    onChange={(e) => setGrantEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Program</label>
                  <Select value={grantProgram} onValueChange={(v) => setGrantProgram(v as ProgramCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p}>{programLabels[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={grantByEmail} disabled={granting} className="w-full">
                  {granting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Grant access
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <Card className="max-w-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> Reset learner password</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send a recovery link, or set a temporary password directly.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">User email</label>
                  <Input
                    type="email"
                    placeholder="learner@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={resetMode === "link" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setResetMode("link")}
                  >
                    <Mail className="h-4 w-4" /> Email recovery link
                  </Button>
                  <Button
                    type="button"
                    variant={resetMode === "set" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setResetMode("set")}
                  >
                    <KeyRound className="h-4 w-4" /> Set new password
                  </Button>
                </div>
                {resetMode === "set" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New password (min 8 chars)</label>
                    <Input
                      type="text"
                      placeholder="TempPass#2026"
                      value={resetPwd}
                      onChange={(e) => setResetPwd(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Share this securely with the learner and ask them to change it.</p>
                  </div>
                )}
                <Button onClick={resetPassword} disabled={resetting} className="w-full">
                  {resetting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {resetMode === "link" ? "Send recovery email" : "Set password now"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminEnrollments;
