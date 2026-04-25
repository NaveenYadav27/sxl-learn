/**
 * Defender — virtual Microsoft Defender XDR portal.
 * Lets learners triage incidents and alerts that are persisted in their own tenant.
 */
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle2, Clock, UserCircle, Activity, Bug, Mail, Globe } from "lucide-react";
import {
  useTenantIncidents, useTenantAlerts, useUpdateIncident, useUpdateAlert,
  useTenantUsers, type TenantIncident,
} from "@/hooks/useTenant";
import { format } from "date-fns";

const SEVERITY: Record<string, { label: string; cls: string }> = {
  high: { label: "High", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  medium: { label: "Medium", cls: "bg-warning/15 text-warning border-warning/30" },
  low: { label: "Low", cls: "bg-primary/15 text-primary border-primary/30" },
  informational: { label: "Info", cls: "bg-muted text-muted-foreground border-border" },
};

const STATUS: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: "Active", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
  inProgress: { label: "In progress", cls: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  resolved: { label: "Resolved", cls: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
};

function ProductIcon({ p }: { p: string }) {
  if (p.includes("Office")) return <Mail className="h-4 w-4" />;
  if (p.includes("Endpoint")) return <Bug className="h-4 w-4" />;
  if (p.includes("Identity") || p.includes("Entra")) return <Globe className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
}

export default function Defender() {
  const { data: incidents = [], isLoading } = useTenantIncidents();
  const { data: users = [] } = useTenantUsers();
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null;

  const stats = {
    active: incidents.filter((i) => i.status === "active").length,
    inProgress: incidents.filter((i) => i.status === "inProgress").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    high: incidents.filter((i) => i.severity === "high").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Simulators" }, { label: "Defender XDR" }]} />

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-domain-security" />
              <h1 className="text-3xl font-bold tracking-tight">Microsoft Defender XDR</h1>
              <Badge className="bg-success/10 text-success border-success/30">Live</Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              Triage real incidents in your virtual tenant. Assign analysts, classify findings as
              true/false positive, and resolve. State persists — labs grade your work against the database.
            </p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Active" value={stats.active} tone="destructive" />
          <StatCard label="In progress" value={stats.inProgress} tone="warning" />
          <StatCard label="Resolved" value={stats.resolved} tone="success" />
          <StatCard label="High severity" value={stats.high} tone="destructive" />
        </div>

        <Tabs defaultValue="incidents">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="alerts">All alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
              {/* Left: incident list */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Incident queue</CardTitle>
                  <CardDescription>{incidents.length} total</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <ul className="divide-y divide-border">
                      {isLoading && <li className="p-4 text-sm text-muted-foreground">Loading…</li>}
                      {!isLoading && incidents.length === 0 && (
                        <li className="p-4 text-sm text-muted-foreground">No incidents in this tenant.</li>
                      )}
                      {incidents.map((inc) => {
                        const sev = SEVERITY[inc.severity] ?? SEVERITY.medium;
                        const st = STATUS[inc.status] ?? STATUS.active;
                        const StIcon = st.icon;
                        const active = inc.id === (selected?.id ?? "");
                        return (
                          <li key={inc.id}>
                            <button
                              onClick={() => setSelectedId(inc.id)}
                              className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${active ? "bg-muted/60" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-sm font-medium leading-snug">{inc.display_name}</span>
                                <Badge variant="outline" className={`text-[10px] ${sev.cls}`}>{sev.label}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{inc.description}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Badge variant="outline" className={`${st.cls} text-[10px]`}>
                                  <StIcon className="h-3 w-3 mr-1" />{st.label}
                                </Badge>
                                <span>· {format(new Date(inc.created_at), "MMM d, HH:mm")}</span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Right: incident detail */}
              <div>
                {selected ? (
                  <IncidentDetail incident={selected} userById={userById} users={users} />
                ) : (
                  <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Select an incident.</CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <AllAlertsTable userById={userById} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "destructive" | "warning" | "success" }) {
  const cls =
    tone === "destructive" ? "text-destructive" :
    tone === "warning" ? "text-warning" : "text-success";
  return (
    <Card>
      <CardContent className="py-4">
        <div className={`text-3xl font-bold ${cls}`}>{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function IncidentDetail({
  incident, userById, users,
}: {
  incident: TenantIncident;
  userById: Record<string, any>;
  users: any[];
}) {
  const { data: alerts = [] } = useTenantAlerts(incident.id);
  const updateIncident = useUpdateIncident();
  const updateAlert = useUpdateAlert();
  const [notes, setNotes] = useState(incident.resolution_notes ?? "");

  const sev = SEVERITY[incident.severity] ?? SEVERITY.medium;
  const st = STATUS[incident.status] ?? STATUS.active;
  const assignee = incident.assigned_to ? userById[incident.assigned_to] : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg leading-tight">{incident.display_name}</CardTitle>
              <CardDescription>{incident.description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline" className={sev.cls}>{sev.label} severity</Badge>
              <Badge variant="outline" className={st.cls}>{st.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Status</Label>
              <Select
                value={incident.status}
                onValueChange={(v) => updateIncident.mutate({ id: incident.id, status: v })}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inProgress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classification</Label>
              <Select
                value={incident.classification ?? "_none"}
                onValueChange={(v) => updateIncident.mutate({
                  id: incident.id,
                  classification: v === "_none" ? null : v,
                })}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Not set —</SelectItem>
                  <SelectItem value="truePositive">True positive</SelectItem>
                  <SelectItem value="falsePositive">False positive</SelectItem>
                  <SelectItem value="informationalExpectedActivity">Informational / expected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned to</Label>
              <Select
                value={incident.assigned_to ?? "_none"}
                onValueChange={(v) => updateIncident.mutate({
                  id: incident.id,
                  assigned_to: v === "_none" ? null : v,
                })}
              >
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Resolution notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (incident.resolution_notes ?? "")) {
                  updateIncident.mutate({ id: incident.id, resolution_notes: notes });
                }
              }}
              placeholder="What did you find? Why true/false positive? What did you remediate?"
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          {assignee && (
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5" /> Assigned to <span className="text-foreground font-medium">{assignee.display_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Linked alerts ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {alerts.map((a) => {
              const asev = SEVERITY[a.severity] ?? SEVERITY.medium;
              const ast = STATUS[a.status === "new" ? "active" : a.status] ?? STATUS.active;
              const affected = a.affected_user_id ? userById[a.affected_user_id] : null;
              return (
                <li key={a.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ProductIcon p={a.product} />
                        <span className="truncate">{a.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <span>{a.product}</span>
                        {a.mitre_technique && <Badge variant="outline" className="text-[10px]">MITRE {a.mitre_technique}</Badge>}
                        {affected && <span>· {affected.display_name}</span>}
                        <span>· {format(new Date(a.detected_at), "MMM d, HH:mm")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={`${asev.cls} text-[10px]`}>{asev.label}</Badge>
                      <Select value={a.status} onValueChange={(v) => updateAlert.mutate({ id: a.id, status: v })}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="inProgress">In progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </li>
              );
            })}
            {alerts.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No alerts linked to this incident.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function AllAlertsTable({ userById }: { userById: Record<string, any> }) {
  const { data: alerts = [], isLoading } = useTenantAlerts();
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        <ul className="divide-y divide-border">
          {alerts.map((a) => {
            const sev = SEVERITY[a.severity] ?? SEVERITY.medium;
            const affected = a.affected_user_id ? userById[a.affected_user_id] : null;
            return (
              <li key={a.id} className="p-4 flex items-start gap-3">
                <ProductIcon p={a.product} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.product}{a.mitre_technique ? ` · MITRE ${a.mitre_technique}` : ""}
                    {affected ? ` · ${affected.display_name}` : ""}
                    {" · "}{format(new Date(a.detected_at), "MMM d, HH:mm")}
                  </div>
                </div>
                <Badge variant="outline" className={sev.cls}>{sev.label}</Badge>
                <Badge variant="outline" className="capitalize">{a.status}</Badge>
              </li>
            );
          })}
          {alerts.length === 0 && !isLoading && (
            <li className="p-6 text-sm text-muted-foreground">No alerts in this tenant.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">{children}</label>;
}
