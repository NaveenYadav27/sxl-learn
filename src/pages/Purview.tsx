import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  useTenantLabels, useCreateLabel, useDeleteLabel,
  useTenantDLPPolicies, useCreateDLPPolicy, useUpdateDLPPolicy, useDeleteDLPPolicy,
  useTenantClassifiedFiles, useApplyLabelToFile,
  useResetTenant, useTenantUsers,
} from "@/hooks/useTenant";
import { Gavel, Plus, Trash2, Shield, FileText, RefreshCw, Tag } from "lucide-react";

const COLORS = ["green", "blue", "yellow", "orange", "red", "purple", "gray"];
const LOCATIONS = ["Exchange", "SharePoint", "OneDrive", "Teams", "Devices"];

export default function Purview() {
  const labels = useTenantLabels();
  const dlp = useTenantDLPPolicies();
  const files = useTenantClassifiedFiles();
  const users = useTenantUsers();
  const reset = useResetTenant();

  return (
    <AppLayout
      title="Microsoft Purview"
      breadcrumb={[{ label: "Simulators" }, { label: "Microsoft Purview" }]}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-domain-compliance/10 text-domain-compliance">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Data governance & compliance</h2>
            <p className="text-sm text-muted-foreground">
              Sensitivity labels, DLP policies, and data classification — backed by your live tenant.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => reset.mutate()} disabled={reset.isPending}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Reset tenant
        </Button>
      </div>

      <Tabs defaultValue="labels">
        <TabsList>
          <TabsTrigger value="labels"><Tag className="h-4 w-4 mr-1.5" />Sensitivity Labels</TabsTrigger>
          <TabsTrigger value="dlp"><Shield className="h-4 w-4 mr-1.5" />DLP Policies</TabsTrigger>
          <TabsTrigger value="data"><FileText className="h-4 w-4 mr-1.5" />Data Classification</TabsTrigger>
        </TabsList>

        <TabsContent value="labels" className="mt-4">
          <LabelsPanel labels={labels.data ?? []} loading={labels.isLoading} />
        </TabsContent>
        <TabsContent value="dlp" className="mt-4">
          <DLPPanel policies={dlp.data ?? []} loading={dlp.isLoading} />
        </TabsContent>
        <TabsContent value="data" className="mt-4">
          <FilesPanel
            files={files.data ?? []}
            labels={labels.data ?? []}
            users={users.data ?? []}
            loading={files.isLoading}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

// ----- Labels -----
function LabelsPanel({ labels, loading }: { labels: any[]; loading: boolean }) {
  const create = useCreateLabel();
  const del = useDeleteLabel();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    display_name: "", description: "", priority: 1, color: "blue",
    encryption_enabled: false, watermark_text: "", scope: "file",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Sensitivity labels</CardTitle>
          <CardDescription>Classify documents and emails by sensitivity tier.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New label</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create sensitivity label</DialogTitle>
              <DialogDescription>Define a new classification tier.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Display name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="e.g. Trade Secret" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Color</Label>
                  <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Encrypt content</Label>
                <Switch checked={form.encryption_enabled} onCheckedChange={(v) => setForm({ ...form, encryption_enabled: v })} />
              </div>
              {form.encryption_enabled && (
                <div>
                  <Label>Watermark text</Label>
                  <Input value={form.watermark_text} onChange={(e) => setForm({ ...form, watermark_text: e.target.value })} placeholder="e.g. CONFIDENTIAL" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!form.display_name) return;
                  await create.mutateAsync(form as any);
                  setOpen(false);
                  setForm({ display_name: "", description: "", priority: 1, color: "blue", encryption_enabled: false, watermark_text: "", scope: "file" });
                }}
                disabled={create.isPending}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading labels…</p>
        ) : labels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No labels yet. Create one to start classifying data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Encryption</TableHead>
                <TableHead>Watermark</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {labels.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.priority}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cssColor(l.color) }} />
                      {l.display_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate">{l.description ?? "—"}</TableCell>
                  <TableCell>{l.encryption_enabled ? <Badge>On</Badge> : <span className="text-muted-foreground">Off</span>}</TableCell>
                  <TableCell className="text-sm">{l.watermark_text ?? "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(l.id)} disabled={del.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

function cssColor(name: string) {
  switch (name) {
    case "green": return "hsl(142 76% 45%)";
    case "blue": return "hsl(217 91% 60%)";
    case "yellow": return "hsl(48 96% 53%)";
    case "orange": return "hsl(25 95% 53%)";
    case "red": return "hsl(0 84% 60%)";
    case "purple": return "hsl(271 91% 65%)";
    default: return "hsl(0 0% 60%)";
  }
}

// ----- DLP -----
function DLPPanel({ policies, loading }: { policies: any[]; loading: boolean }) {
  const create = useCreateDLPPolicy();
  const update = useUpdateDLPPolicy();
  const del = useDeleteDLPPolicy();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    display_name: "", description: "", state: "test",
    locations: ["Exchange"] as string[],
    sensitive: "Credit Card Number",
    threshold: 1,
    action: "notify",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Data loss prevention policies</CardTitle>
          <CardDescription>Block or warn when sensitive content leaves protected locations.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New DLP policy</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create DLP policy</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="e.g. Block PII to external" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>State</Label>
                  <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="test">Test mode</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="notify">Notify only</SelectItem>
                      <SelectItem value="allowOverride">Allow with override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Locations</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {LOCATIONS.map((loc) => {
                    const on = form.locations.includes(loc);
                    return (
                      <Badge
                        key={loc}
                        variant={on ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setForm({ ...form, locations: on ? form.locations.filter((l) => l !== loc) : [...form.locations, loc] })}
                      >
                        {loc}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sensitive info type</Label>
                  <Input value={form.sensitive} onChange={(e) => setForm({ ...form, sensitive: e.target.value })} />
                </div>
                <div>
                  <Label>Match threshold</Label>
                  <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!form.display_name) return;
                  await create.mutateAsync({
                    display_name: form.display_name,
                    description: form.description,
                    state: form.state,
                    locations: form.locations,
                    rules: { sensitiveInfoTypes: [form.sensitive], threshold: form.threshold },
                    action: form.action,
                  });
                  setOpen(false);
                }}
                disabled={create.isPending}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading policies…</p>
        ) : policies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No DLP policies yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Sensitive types</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                  </TableCell>
                  <TableCell>
                    <Select value={p.state} onValueChange={(v) => update.mutate({ id: p.id, state: v })}>
                      <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs">{(p.locations ?? []).join(", ")}</TableCell>
                  <TableCell className="text-xs">{(p.rules?.sensitiveInfoTypes ?? []).join(", ")}</TableCell>
                  <TableCell>
                    <Badge variant={p.action === "block" ? "destructive" : "secondary"}>{p.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

// ----- Files -----
function FilesPanel({ files, labels, users, loading }: { files: any[]; labels: any[]; users: any[]; loading: boolean }) {
  const apply = useApplyLabelToFile();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data classification</CardTitle>
        <CardDescription>Apply sensitivity labels to discovered files.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading files…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Sensitivity score</TableHead>
                <TableHead>Applied label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((f) => {
                const owner = users.find((u) => u.id === f.owner_id);
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.file_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.location}</TableCell>
                    <TableCell className="text-sm">{owner?.display_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={f.sensitivity_score > 75 ? "destructive" : f.sensitivity_score > 40 ? "default" : "secondary"}>
                        {f.sensitivity_score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={f.label_id ?? "none"}
                        onValueChange={(v) => apply.mutate({ id: f.id, label_id: v === "none" ? null : v })}
                      >
                        <SelectTrigger className="h-8 w-[200px]"><SelectValue placeholder="Unclassified" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unclassified</SelectItem>
                          {labels.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
