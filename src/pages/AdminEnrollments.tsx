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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Cog, UserPlus, Trash2 } from "lucide-react";

type Enrollment = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  program: "soc" | "itsm";
  notes: string | null;
  status: string;
  created_at: string;
};

type AccessRow = {
  id: string;
  user_id: string;
  program: "soc" | "itsm";
  granted_at: string;
};

const AdminEnrollments = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantProgram, setGrantProgram] = useState<"soc" | "itsm">("soc");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    const [{ data: e }, { data: a }] = await Promise.all([
      supabase.from("enrollments").select("*").order("created_at", { ascending: false }),
      supabase.from("program_access").select("*").order("granted_at", { ascending: false }),
    ]);
    setEnrollments((e ?? []) as Enrollment[]);
    setAccess((a ?? []) as AccessRow[]);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setEnrollments((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function grant() {
    if (!grantUserId.trim()) {
      toast({ title: "Enter a user ID", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("program_access")
      .insert({ user_id: grantUserId.trim(), program: grantProgram });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to grant", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Access granted" });
    setGrantUserId("");
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

  return (
    <AppLayout
      title="Admin · Enrollments"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Enrollments" }]} />}
    >
      <div className="container py-6 space-y-6">
        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Enrollment requests ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="access">Active program access ({access.length})</TabsTrigger>
            <TabsTrigger value="grant">Grant access</TabsTrigger>
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
                            {r.program === "soc" ? (
                              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> SOC</Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1"><Cog className="h-3 w-3" /> ITSM</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={r.status === "contacted" ? "default" : r.status === "enrolled" ? "default" : "secondary"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "contacted")}>Mark contacted</Button>
                            <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "enrolled")}>Mark enrolled</Button>
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
                            {r.program === "soc" ? (
                              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> SOC</Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1"><Cog className="h-3 w-3" /> ITSM</Badge>
                            )}
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
                  <h3 className="font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" /> Grant program access</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paste the user's ID (from their signup confirmation or the auth backend) and pick the program.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">User ID (UUID)</label>
                  <Input
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={grantUserId}
                    onChange={(e) => setGrantUserId(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Program</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={grantProgram === "soc" ? "default" : "outline"}
                      onClick={() => setGrantProgram("soc")}
                      className="gap-2 flex-1"
                    >
                      <Shield className="h-4 w-4" /> SOC
                    </Button>
                    <Button
                      type="button"
                      variant={grantProgram === "itsm" ? "default" : "outline"}
                      onClick={() => setGrantProgram("itsm")}
                      className="gap-2 flex-1"
                    >
                      <Cog className="h-4 w-4" /> ITSM
                    </Button>
                  </div>
                </div>
                <Button onClick={grant} disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Grant access
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
