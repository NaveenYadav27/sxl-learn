/**
 * Tenant — the live working environment.
 * A persistent, per-learner virtual Microsoft Entra tenant.
 * Full CRUD on users, groups, role assignments, and Conditional Access policies.
 */
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users, Building2, Shield, Activity, Trash2, Plus, RotateCcw, Sparkles, AlertCircle,
  CheckCircle2, MapPin, Wifi, Lock,
} from "lucide-react";
import {
  useTenantUsers, useTenantGroups, useTenantRoleAssignments, useTenantCAPolicies,
  useTenantSignInLogs, useResetTenant, useCreateTenantUser, useUpdateTenantUser,
  useDeleteTenantUser, useCreateTenantGroup, useDeleteTenantGroup, useAssignRole,
  useRemoveRoleAssignment, useCreateCAPolicy, useDeleteCAPolicy,
} from "@/hooks/useTenant";
import { format } from "date-fns";

const ENTRA_ROLES = [
  "Global Administrator", "Privileged Role Administrator", "Security Administrator",
  "Conditional Access Administrator", "User Administrator", "Helpdesk Administrator",
  "Billing Administrator", "Application Administrator", "Compliance Administrator",
  "Exchange Administrator", "SharePoint Administrator", "Teams Administrator",
];

export default function Tenant() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Practice" }, { label: "My virtual tenant" }]} />

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Contoso · Live tenant</h1>
              <Badge className="bg-success/10 text-success border-success/30">Live</Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              Your personal, persistent virtual Microsoft Entra tenant. Every change you make is saved.
              No Microsoft license required — practice as much as you like.
            </p>
          </div>
          <ResetButton />
        </header>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Users</TabsTrigger>
            <TabsTrigger value="groups"><Building2 className="h-3.5 w-3.5 mr-1.5" />Groups</TabsTrigger>
            <TabsTrigger value="roles"><Shield className="h-3.5 w-3.5 mr-1.5" />Roles</TabsTrigger>
            <TabsTrigger value="ca"><Lock className="h-3.5 w-3.5 mr-1.5" />Conditional Access</TabsTrigger>
            <TabsTrigger value="signins"><Activity className="h-3.5 w-3.5 mr-1.5" />Sign-in logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="groups"><GroupsTab /></TabsContent>
          <TabsContent value="roles"><RolesTab /></TabsContent>
          <TabsContent value="ca"><CATab /></TabsContent>
          <TabsContent value="signins"><SignInsTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// ============ RESET ============
function ResetButton() {
  const reset = useResetTenant();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset tenant
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your virtual tenant?</AlertDialogTitle>
          <AlertDialogDescription>
            This wipes all users, groups, role assignments, policies, and logs in your tenant
            and reseeds the default Contoso directory. Use this anytime you want a clean slate.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => reset.mutate()} disabled={reset.isPending}>
            {reset.isPending ? "Resetting…" : "Reset & re-seed"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============ USERS ============
function UsersTab() {
  const { data: users, isLoading } = useTenantUsers();
  const update = useUpdateTenantUser();
  const del = useDeleteTenantUser();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Directory users</CardTitle>
          <CardDescription>Create, enable, disable, and remove users in your tenant.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New user</Button>
          </DialogTrigger>
          <CreateUserDialog onClose={() => setOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="rounded border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 text-xs font-medium grid grid-cols-[2fr_2fr_1.2fr_1fr_80px_80px_60px] gap-3">
              <span>Display name</span><span>UPN</span><span>Job title</span><span>Department</span>
              <span>Enabled</span><span>MFA</span><span></span>
            </div>
            <div className="divide-y">
              {users?.map((u) => (
                <div key={u.id} className="px-4 py-2 text-sm grid grid-cols-[2fr_2fr_1.2fr_1fr_80px_80px_60px] gap-3 items-center hover:bg-muted/30">
                  <span className="font-medium truncate">{u.display_name}</span>
                  <span className="text-muted-foreground text-xs truncate">{u.user_principal_name}</span>
                  <span className="text-xs truncate">{u.job_title ?? "—"}</span>
                  <span className="text-xs truncate">{u.department ?? "—"}</span>
                  <Switch
                    checked={u.account_enabled}
                    onCheckedChange={(v) => update.mutate({ id: u.id, account_enabled: v })}
                  />
                  <Switch
                    checked={u.mfa_enabled}
                    onCheckedChange={(v) => update.mutate({ id: u.id, mfa_enabled: v })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(u.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              {!users?.length && (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Empty tenant. Click "Reset tenant" to seed it, or add a user.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateTenantUser();
  const [form, setForm] = useState({
    display_name: "", user_principal_name: "", job_title: "", department: "", mfa_enabled: false,
  });

  function submit() {
    if (!form.display_name || !form.user_principal_name) return;
    create.mutate(form, { onSuccess: () => { onClose(); } });
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New user</DialogTitle>
        <DialogDescription>Add a user to your virtual directory.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div><Label>Display name *</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Pat Patterson" /></div>
        <div><Label>User principal name *</Label><Input value={form.user_principal_name} onChange={(e) => setForm({ ...form, user_principal_name: e.target.value })} placeholder="pat@contoso.onmicrosoft.com" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Job title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
          <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-2"><Switch checked={form.mfa_enabled} onCheckedChange={(v) => setForm({ ...form, mfa_enabled: v })} /><Label>MFA enabled</Label></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============ GROUPS ============
function GroupsTab() {
  const { data: groups, isLoading } = useTenantGroups();
  const del = useDeleteTenantGroup();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div><CardTitle className="text-base">Groups</CardTitle><CardDescription>Security and Microsoft 365 groups.</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New group</Button></DialogTrigger>
          <CreateGroupDialog onClose={() => setOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="rounded border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 text-xs font-medium grid grid-cols-[2fr_3fr_1fr_1fr_60px] gap-3">
              <span>Name</span><span>Description</span><span>Type</span><span>Membership</span><span></span>
            </div>
            <div className="divide-y">
              {groups?.map((g) => (
                <div key={g.id} className="px-4 py-2 text-sm grid grid-cols-[2fr_3fr_1fr_1fr_60px] gap-3 items-center hover:bg-muted/30">
                  <span className="font-medium">{g.display_name}</span>
                  <span className="text-xs text-muted-foreground truncate">{g.description ?? "—"}</span>
                  <Badge variant="outline" className="text-xs justify-self-start">{g.group_type}</Badge>
                  <Badge variant="secondary" className="text-xs justify-self-start">{g.membership_type}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => del.mutate(g.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              {!groups?.length && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No groups yet.</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateGroupDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateTenantGroup();
  const [form, setForm] = useState({
    display_name: "", description: "", group_type: "security", membership_type: "assigned", dynamic_rule: "",
  });

  function submit() {
    if (!form.display_name) return;
    const payload: any = { ...form };
    if (payload.membership_type !== "dynamic") delete payload.dynamic_rule;
    create.mutate(payload, { onSuccess: onClose });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New group</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Name *</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Group type</Label>
            <Select value={form.group_type} onValueChange={(v) => setForm({ ...form, group_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="m365">Microsoft 365</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Membership</Label>
            <Select value={form.membership_type} onValueChange={(v) => setForm({ ...form, membership_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.membership_type === "dynamic" && (
          <div>
            <Label>Dynamic rule</Label>
            <Input value={form.dynamic_rule} onChange={(e) => setForm({ ...form, dynamic_rule: e.target.value })} placeholder='user.department -eq "Sales"' />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============ ROLES ============
function RolesTab() {
  const { data: assignments } = useTenantRoleAssignments();
  const { data: users } = useTenantUsers();
  const remove = useRemoveRoleAssignment();
  const [open, setOpen] = useState(false);

  const userMap = new Map(users?.map((u) => [u.id, u]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Entra role assignments</CardTitle>
          <CardDescription>Privileged roles granted to users in your tenant.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Assign role</Button></DialogTrigger>
          <AssignRoleDialog onClose={() => setOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded border border-border overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 text-xs font-medium grid grid-cols-[2fr_2fr_1fr_60px] gap-3">
            <span>Role</span><span>Assigned to</span><span>Granted</span><span></span>
          </div>
          <div className="divide-y">
            {assignments?.map((a) => {
              const u = userMap.get(a.principal_id);
              return (
                <div key={a.id} className="px-4 py-2 text-sm grid grid-cols-[2fr_2fr_1fr_60px] gap-3 items-center">
                  <span className="font-medium flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-warning" />{a.role_name}
                  </span>
                  <span className="text-xs">{u ? u.display_name : <span className="text-muted-foreground italic">deleted user</span>}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(a.assigned_at), "PP")}</span>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              );
            })}
            {!assignments?.length && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No role assignments.</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignRoleDialog({ onClose }: { onClose: () => void }) {
  const { data: users } = useTenantUsers();
  const assign = useAssignRole();
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  function submit() {
    if (!role || !userId) return;
    assign.mutate({ role_name: role, principal_id: userId }, { onSuccess: onClose });
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Assign Entra role</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue placeholder="Pick a role" /></SelectTrigger>
            <SelectContent>{ENTRA_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>User</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger><SelectValue placeholder="Pick a user" /></SelectTrigger>
            <SelectContent>{users?.map((u) => <SelectItem key={u.id} value={u.id}>{u.display_name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={assign.isPending}>{assign.isPending ? "Assigning…" : "Assign"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============ CONDITIONAL ACCESS ============
function CATab() {
  const { data: policies } = useTenantCAPolicies();
  const del = useDeleteCAPolicy();
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Conditional Access policies</CardTitle>
          <CardDescription>Build identity-based access controls. Toggle state to enable, disable, or report-only.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New policy</Button></DialogTrigger>
          <CreateCAPolicyDialog onClose={() => setOpen(false)} />
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {policies?.map((p) => (
          <div key={p.id} className="rounded border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium truncate">{p.display_name}</span>
                <StatePill state={p.state} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(p.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
            <div className="mt-2 grid md:grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground mb-1">Conditions</div>
                <pre className="bg-muted/50 rounded p-2 overflow-x-auto text-[10px] leading-snug">{JSON.stringify(p.conditions, null, 2)}</pre>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Grant controls</div>
                <pre className="bg-muted/50 rounded p-2 overflow-x-auto text-[10px] leading-snug">{JSON.stringify(p.grant_controls, null, 2)}</pre>
              </div>
            </div>
          </div>
        ))}
        {!policies?.length && <div className="text-center text-xs text-muted-foreground py-8">No policies. Create one to start enforcing access controls.</div>}
      </CardContent>
    </Card>
  );
}

function StatePill({ state }: { state: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    enabled: { label: "On", cls: "bg-success/10 text-success border-success/30" },
    disabled: { label: "Off", cls: "bg-muted text-muted-foreground border-border" },
    enabledForReportingButNotEnforced: { label: "Report-only", cls: "bg-warning/10 text-warning border-warning/30" },
  };
  const m = map[state] ?? map.disabled;
  return <Badge variant="outline" className={`text-[10px] ${m.cls}`}>{m.label}</Badge>;
}

function CreateCAPolicyDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateCAPolicy();
  const [form, setForm] = useState({
    display_name: "",
    state: "enabledForReportingButNotEnforced",
    includeRoles: [] as string[],
    targetApps: "All",
    requireMfa: true,
    requireCompliantDevice: false,
    block: false,
  });

  function submit() {
    if (!form.display_name) return;
    const grant_controls: any = { operator: "OR", builtInControls: [] };
    if (form.block) grant_controls.builtInControls = ["block"];
    else {
      if (form.requireMfa) grant_controls.builtInControls.push("mfa");
      if (form.requireCompliantDevice) grant_controls.builtInControls.push("compliantDevice");
    }
    const payload = {
      display_name: form.display_name,
      state: form.state,
      conditions: {
        users: form.includeRoles.length ? { includeRoles: form.includeRoles } : { includeUsers: ["All"] },
        applications: { includeApplications: [form.targetApps] },
      },
      grant_controls,
    };
    create.mutate(payload, { onSuccess: onClose });
  }

  function toggleRole(r: string) {
    setForm((f) => ({
      ...f,
      includeRoles: f.includeRoles.includes(r) ? f.includeRoles.filter((x) => x !== r) : [...f.includeRoles, r],
    }));
  }

  return (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader><DialogTitle>New Conditional Access policy</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div><Label>Name *</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Require MFA for all users" /></div>

        <div>
          <Label>State</Label>
          <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">On</SelectItem>
              <SelectItem value="enabledForReportingButNotEnforced">Report-only</SelectItem>
              <SelectItem value="disabled">Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Assignments → Include directory roles</Label>
          <div className="grid grid-cols-2 gap-1.5 text-xs max-h-40 overflow-y-auto border border-border rounded p-2">
            {ENTRA_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.includeRoles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                <span>{r}</span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Leave empty to apply to all users.</p>
        </div>

        <div>
          <Label>Target apps</Label>
          <Select value={form.targetApps} onValueChange={(v) => setForm({ ...form, targetApps: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All cloud apps</SelectItem>
              <SelectItem value="Office365">Office 365</SelectItem>
              <SelectItem value="MicrosoftAdminPortals">Microsoft admin portals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Grant controls</Label>
          <div className="space-y-1.5 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={form.block} onCheckedChange={(v) => setForm({ ...form, block: !!v })} />Block access</label>
            {!form.block && (
              <>
                <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={form.requireMfa} onCheckedChange={(v) => setForm({ ...form, requireMfa: !!v })} />Require MFA</label>
                <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={form.requireCompliantDevice} onCheckedChange={(v) => setForm({ ...form, requireCompliantDevice: !!v })} />Require compliant device</label>
              </>
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============ SIGN-IN LOGS ============
function SignInsTab() {
  const { data: logs } = useTenantSignInLogs();
  const { data: users } = useTenantUsers();
  const userMap = new Map(users?.map((u) => [u.id, u]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign-in logs</CardTitle>
        <CardDescription>Recent authentication events. Hunt for risky sign-ins to practice Identity Protection.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded border border-border overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 text-xs font-medium grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr_1fr] gap-3">
            <span>User</span><span>App</span><span>Location</span><span>Status</span><span>Risk</span><span>Time</span>
          </div>
          <div className="divide-y">
            {logs?.map((l) => {
              const u = userMap.get(l.principal_id ?? "");
              return (
                <div key={l.id} className="px-4 py-2 text-xs grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr_1fr] gap-3 items-center">
                  <span className="truncate">{u?.display_name ?? "—"}</span>
                  <span className="truncate">{l.app_display_name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{l.location ?? "—"}</span>
                  <span className={l.status === "success" ? "text-success" : "text-destructive"}>
                    {l.status === "success" ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : <AlertCircle className="inline h-3 w-3 mr-1" />}
                    {l.status}
                  </span>
                  <RiskBadge level={l.risk_level} />
                  <span className="text-muted-foreground">{format(new Date(l.signed_in_at), "PP p")}</span>
                </div>
              );
            })}
            {!logs?.length && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No sign-in logs yet.</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: string }) {
  const m: Record<string, string> = {
    none: "bg-muted text-muted-foreground border-border",
    low: "bg-warning/10 text-warning border-warning/30",
    medium: "bg-warning/20 text-warning border-warning/40",
    high: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`text-[10px] ${m[level] ?? m.none}`}>{level}</Badge>;
}
