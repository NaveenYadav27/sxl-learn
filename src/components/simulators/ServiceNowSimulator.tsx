/**
 * ServiceNowSimulator — Now Platform–style twin used by all CIS-ITSM labs.
 *
 * Matches the same expected_action contract as PortalSimulator:
 *   navigate  { target }                — open an application module from the left nav
 *   action    { target }                — click a labelled action button (Submit, Update, …)
 *   input     { field, value }          — type into a field
 *   select    { field, value }          — pick a dropdown / reference value
 *   classify  { field, value }          — set Impact / Urgency / Priority / State
 *   configure { field, value }          — multi-property config (CAB risk, CMDB class…)
 *   create    { target, value? }        — open a "New" form for the current table
 *   read      { field }                 — observe step (auto-completes)
 *
 * Visually inspired by the ServiceNow Polaris UI: dark-navy top bar, slim
 * left "Application Navigator" with filter, and a form/list workspace.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Bell, HelpCircle, Settings as SettingsIcon, Star,
  CheckCircle2, AlertTriangle, ChevronRight, Plus, Save, RefreshCw,
  LayoutDashboard, Ticket, Bug, Wrench, BookOpen, Database, Workflow,
  Server, ListChecks, Globe, Filter, Trophy, MousePointerClick,
} from "lucide-react";

interface Action {
  type?: string;
  target?: string;
  field?: string;
  value?: any;
  [key: string]: any;
}

interface Props {
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
  /** When true, hides lab-validation hints — pure showcase mode. */
  demoMode?: boolean;
}

interface NavItem { id: string; label: string; icon: any; aliases?: string[] }
interface NavSection { label: string; items: NavItem[] }

// -----------------------------------------------------------------------------
// Application Navigator
// -----------------------------------------------------------------------------
const NAV_SECTIONS: NavSection[] = [
  {
    label: "Self-Service",
    items: [
      { id: "sn-home", label: "Home", icon: LayoutDashboard, aliases: ["home", "dashboard"] },
      { id: "service-catalog", label: "Service Catalog", icon: BookOpen, aliases: ["catalog"] },
      { id: "knowledge", label: "Knowledge", icon: BookOpen, aliases: ["kb", "knowledge-base"] },
    ],
  },
  {
    label: "Incident",
    items: [
      { id: "incident-open", label: "All Open Incidents", icon: Ticket, aliases: ["incidents", "all-incidents"] },
      { id: "incident-create", label: "Create New Incident", icon: Plus, aliases: ["new-incident"] },
      { id: "major-incident", label: "Major Incidents", icon: AlertTriangle, aliases: ["mim"] },
    ],
  },
  {
    label: "Problem",
    items: [
      { id: "problem-open", label: "All Open Problems", icon: Bug, aliases: ["problems"] },
      { id: "problem-create", label: "Create New Problem", icon: Plus, aliases: ["new-problem"] },
      { id: "known-error", label: "Known Errors", icon: AlertTriangle, aliases: ["kedb"] },
    ],
  },
  {
    label: "Change",
    items: [
      { id: "change-open", label: "All Open Changes", icon: Workflow, aliases: ["changes"] },
      { id: "change-standard", label: "Standard Change", icon: ListChecks, aliases: ["standard"] },
      { id: "change-normal", label: "Normal Change (CAB)", icon: ListChecks, aliases: ["normal", "cab"] },
      { id: "change-emergency", label: "Emergency Change", icon: AlertTriangle, aliases: ["emergency"] },
      { id: "change-schedule", label: "Change Schedule", icon: ListChecks, aliases: ["schedule"] },
      { id: "release", label: "Release Management", icon: Workflow, aliases: ["releases"] },
    ],
  },
  {
    label: "Service Catalog",
    items: [
      { id: "catalog-builder", label: "Catalog Builder", icon: Wrench, aliases: ["builder"] },
      { id: "ritm", label: "Requested Items (RITM)", icon: Ticket, aliases: ["requests"] },
      { id: "catalog-task", label: "Catalog Tasks", icon: ListChecks, aliases: ["tasks"] },
    ],
  },
  {
    label: "Configuration",
    items: [
      { id: "cmdb", label: "CMDB", icon: Database, aliases: ["cmdb-home"] },
      { id: "ci-create", label: "Create CI", icon: Plus, aliases: ["new-ci"] },
      { id: "ci-relationships", label: "CI Relationships", icon: Workflow, aliases: ["relationships"] },
      { id: "csdm", label: "CSDM Workspace", icon: Globe, aliases: ["csdm-home"] },
    ],
  },
  {
    label: "Reporting",
    items: [
      { id: "dashboards", label: "Performance Analytics", icon: LayoutDashboard, aliases: ["dashboard", "mttr-dashboard"] },
      { id: "reports", label: "Reports", icon: ListChecks, aliases: ["reporting"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users-roles", label: "Users & Roles", icon: SettingsIcon, aliases: ["roles", "groups", "assignment-groups"] },
      { id: "process-map", label: "Process Map", icon: Workflow, aliases: ["processes"] },
      { id: "instance", label: "Instance Settings", icon: Server, aliases: ["explore-instance"] },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function resolveNav(targetRaw?: string): string | null {
  if (!targetRaw) return null;
  const t = targetRaw.toLowerCase().trim();
  // exact id
  const exact = ALL_ITEMS.find((i) => i.id === t);
  if (exact) return exact.id;
  // alias
  const alias = ALL_ITEMS.find((i) => i.aliases?.includes(t));
  if (alias) return alias.id;
  // contains/startsWith
  const partial = ALL_ITEMS.find((i) => i.id.startsWith(t) || t.startsWith(i.id));
  if (partial) return partial.id;
  return null;
}

// -----------------------------------------------------------------------------
// Field catalog — what each "screen" exposes
// -----------------------------------------------------------------------------
type FieldDef = {
  key: string;
  label: string;
  kind: "text" | "select";
  options?: string[];
  aliases?: string[];
};

const FORM_FIELDS: Record<string, FieldDef[]> = {
  "incident-create": [
    { key: "caller", label: "Caller", kind: "text" },
    { key: "short-description", label: "Short description", kind: "text", aliases: ["short_description", "description"] },
    { key: "category", label: "Category", kind: "select", options: ["Software", "Hardware", "Network", "Inquiry"] },
    { key: "impact", label: "Impact", kind: "select", options: ["1 - High", "2 - Medium", "3 - Low"] },
    { key: "urgency", label: "Urgency", kind: "select", options: ["1 - High", "2 - Medium", "3 - Low"] },
    { key: "priority", label: "Priority", kind: "select", options: ["1 - Critical", "2 - High", "3 - Moderate", "4 - Low"] },
    { key: "state", label: "State", kind: "select", options: ["New", "In Progress", "On Hold", "Resolved", "Closed"] },
    { key: "assignment-group", label: "Assignment group", kind: "select", options: ["Service Desk", "Network", "Database", "Application Support"] },
  ],
  "problem-create": [
    { key: "short-description", label: "Short description", kind: "text" },
    { key: "category", label: "Category", kind: "select", options: ["Software", "Hardware", "Network"] },
    { key: "rca-method", label: "RCA method", kind: "select", options: ["5 Whys", "Fishbone (Ishikawa)", "Kepner-Tregoe"] },
    { key: "state", label: "State", kind: "select", options: ["New", "Assess", "Root Cause Analysis", "Fix in Progress", "Resolved", "Closed"] },
    { key: "known-error", label: "Known error", kind: "select", options: ["Yes", "No"] },
  ],
  knowledge: [
    { key: "title", label: "Article title", kind: "text" },
    { key: "knowledge-base", label: "Knowledge base", kind: "select", options: ["IT", "HR", "Customer Service"] },
    { key: "category", label: "Category", kind: "select", options: ["How-to", "Troubleshooting", "FAQ", "Reference"] },
    { key: "workflow-state", label: "Workflow state", kind: "select", options: ["Draft", "Review", "Published", "Retired"], aliases: ["state"] },
  ],
  "change-standard": [
    { key: "short-description", label: "Short description", kind: "text" },
    { key: "type", label: "Type", kind: "select", options: ["Standard", "Normal", "Emergency"] },
    { key: "template", label: "Template", kind: "select", options: ["Restart Web Server", "Patch OS", "Add Disk", "Custom"] },
    { key: "risk", label: "Risk", kind: "select", options: ["Low", "Moderate", "High"] },
  ],
  "change-normal": [
    { key: "short-description", label: "Short description", kind: "text" },
    { key: "type", label: "Type", kind: "select", options: ["Standard", "Normal", "Emergency"] },
    { key: "risk", label: "Risk", kind: "select", options: ["Low", "Moderate", "High"] },
    { key: "impact", label: "Impact", kind: "select", options: ["1 - High", "2 - Medium", "3 - Low"] },
    { key: "approval", label: "Approval", kind: "select", options: ["Requested", "Approved", "Rejected"] },
    { key: "cab-required", label: "CAB required", kind: "select", options: ["Yes", "No"] },
  ],
  "change-emergency": [
    { key: "short-description", label: "Short description", kind: "text" },
    { key: "type", label: "Type", kind: "select", options: ["Standard", "Normal", "Emergency"] },
    { key: "risk", label: "Risk", kind: "select", options: ["Low", "Moderate", "High"] },
    { key: "ecab-approval", label: "ECAB approval", kind: "select", options: ["Pending", "Approved", "Rejected"], aliases: ["approval"] },
  ],
  release: [
    { key: "release-name", label: "Release name", kind: "text" },
    { key: "environment", label: "Target environment", kind: "select", options: ["Dev", "Test", "Staging", "Production"] },
    { key: "state", label: "State", kind: "select", options: ["Planned", "In Progress", "Released", "Closed"] },
  ],
  "catalog-builder": [
    { key: "item-name", label: "Catalog item name", kind: "text", aliases: ["name"] },
    { key: "category", label: "Category", kind: "select", options: ["Hardware", "Software", "Access", "Other"] },
    { key: "variable", label: "Variable", kind: "text" },
    { key: "workflow", label: "Fulfilment workflow", kind: "select", options: ["Approval → Task", "Direct Task", "Multi-Stage Approval"] },
  ],
  ritm: [
    { key: "state", label: "State", kind: "select", options: ["Open", "Work In Progress", "Closed Complete", "Closed Incomplete"] },
    { key: "stage", label: "Stage", kind: "select", options: ["Waiting for Approval", "Fulfillment", "Delivery", "Completed"] },
  ],
  "ci-create": [
    { key: "name", label: "CI name", kind: "text" },
    { key: "class", label: "Class", kind: "select", options: ["cmdb_ci_server", "cmdb_ci_appl", "cmdb_ci_database", "cmdb_ci_service"] },
    { key: "operational-status", label: "Operational status", kind: "select", options: ["Operational", "Non-Operational", "Retired"] },
    { key: "environment", label: "Environment", kind: "select", options: ["Production", "Test", "Dev"] },
  ],
  "ci-relationships": [
    { key: "parent", label: "Parent CI", kind: "text" },
    { key: "relationship-type", label: "Relationship type", kind: "select", options: ["Runs on::Runs", "Depends on::Used by", "Hosted on::Hosts"] },
    { key: "child", label: "Child CI", kind: "text" },
  ],
  dashboards: [
    { key: "kpi", label: "KPI", kind: "select", options: ["MTTR", "First Call Resolution", "Change Success Rate", "Reopen Rate"] },
    { key: "timeframe", label: "Timeframe", kind: "select", options: ["Last 7 days", "Last 30 days", "Last quarter"] },
  ],
  "users-roles": [
    { key: "user", label: "User", kind: "text" },
    { key: "role", label: "Role", kind: "select", options: ["itil", "itil_admin", "admin", "knowledge_admin", "approver_user"] },
    { key: "group", label: "Assignment group", kind: "select", options: ["Service Desk", "Network", "Database", "Application Support", "CAB Approvers"] },
  ],
  "process-map": [
    { key: "process", label: "Process", kind: "select", options: ["Request → Incident → Problem → Change", "Knowledge Lifecycle", "Catalog Fulfilment"] },
  ],
  instance: [
    { key: "scope", label: "Application scope", kind: "select", options: ["Global", "Custom Application"] },
    { key: "ui", label: "UI", kind: "select", options: ["UI Builder", "Service Portal", "Workspace"] },
  ],
};

function fieldsFor(navId: string): FieldDef[] {
  return FORM_FIELDS[navId] ?? [];
}

function resolveField(navId: string, fieldRaw?: string): FieldDef | null {
  if (!fieldRaw) return null;
  const f = fieldRaw.toLowerCase().trim().replace(/_/g, "-");
  const list = fieldsFor(navId);
  return (
    list.find((x) => x.key === f) ??
    list.find((x) => x.aliases?.includes(f)) ??
    list.find((x) => x.key.includes(f) || f.includes(x.key)) ??
    null
  );
}

function valuesMatch(actual: string, expected: any): boolean {
  if (expected == null) return true;
  const a = String(actual).toLowerCase().trim();
  const e = String(expected).toLowerCase().trim();
  if (a === e) return true;
  // tolerate "1 - High" vs "high"
  return a.includes(e) || e.includes(a);
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export function ServiceNowSimulator({ expectedAction, onValidate, demoMode }: Props) {
  const initialNav = useMemo(() => {
    const t = resolveNav(expectedAction?.target);
    if (t) return t;
    return "sn-home";
  }, [expectedAction]);

  const [activeNav, setActiveNav] = useState<string>(initialNav);
  const [navFilter, setNavFilter] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Reset per step
  useEffect(() => {
    setActiveNav(initialNav);
    setFieldValues({});
    setStatusMsg(null);
    // observe-only
    if (expectedAction?.type === "read") {
      const t = setTimeout(() => onValidate(true), 600);
      return () => clearTimeout(t);
    }
  }, [expectedAction, initialNav, onValidate]);

  const fields = fieldsFor(activeNav);

  function flash(ok: boolean, text: string) {
    setStatusMsg({ ok, text });
    if (ok) onValidate(true);
    setTimeout(() => setStatusMsg(null), 2500);
  }

  function handleNavClick(id: string) {
    setActiveNav(id);
    setFieldValues({});
    if (expectedAction?.type === "navigate") {
      const wanted = resolveNav(expectedAction.target);
      if (wanted === id) flash(true, `Navigated to ${ALL_ITEMS.find((i) => i.id === id)?.label}`);
    }
  }

  function handleFieldChange(key: string, value: string) {
    setFieldValues((m) => ({ ...m, [key]: value }));
    const t = expectedAction?.type;
    if (!t) return;
    if (["input", "select", "classify", "configure"].includes(t)) {
      const wantedField = resolveField(activeNav, expectedAction.field);
      if (wantedField?.key === key && valuesMatch(value, expectedAction.value)) {
        flash(true, `${wantedField.label} set to "${value}"`);
      }
    }
  }

  function handleAction(name: string) {
    const t = expectedAction?.type;
    if (t === "action" && (expectedAction.target ?? "").toLowerCase() === name.toLowerCase()) {
      flash(true, `${name} confirmed`);
    } else if (t === "create" && name.toLowerCase() === "submit") {
      flash(true, `Record created`);
    } else {
      flash(false, `That action doesn't satisfy this step.`);
    }
  }

  const activeItem = ALL_ITEMS.find((i) => i.id === activeNav);

  return (
    <Card className="overflow-hidden border-border shadow-card">
      {/* Top bar — ServiceNow Polaris-ish */}
      <div className="bg-[hsl(220,32%,12%)] text-white px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-[hsl(155,90%,40%)] grid place-items-center text-[10px] font-bold">
            SN
          </div>
          <span className="text-sm font-semibold tracking-wide">ServiceNow</span>
          <Badge className="bg-[hsl(155,90%,40%)]/20 text-[hsl(155,90%,70%)] border-0 text-[10px]">
            Simulator
          </Badge>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
            <Input
              placeholder="Search…"
              className="h-7 pl-7 bg-white/10 border-white/10 text-white placeholder:text-white/50 text-xs"
              readOnly
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <Bell className="h-4 w-4" />
          <HelpCircle className="h-4 w-4" />
          <SettingsIcon className="h-4 w-4" />
          <div className="h-6 w-6 rounded-full bg-[hsl(155,90%,40%)] grid place-items-center text-[10px] font-bold">
            SO
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] min-h-[440px]">
        {/* Application Navigator */}
        <aside className="bg-[hsl(220,28%,18%)] text-white/90 border-r border-white/10 flex flex-col">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
              <Input
                placeholder="Filter navigator"
                value={navFilter}
                onChange={(e) => setNavFilter(e.target.value)}
                className="h-7 pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-[11px]"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-3">
              {NAV_SECTIONS.map((section) => {
                const items = section.items.filter(
                  (i) =>
                    !navFilter ||
                    i.label.toLowerCase().includes(navFilter.toLowerCase()) ||
                    section.label.toLowerCase().includes(navFilter.toLowerCase()),
                );
                if (items.length === 0) return null;
                return (
                  <div key={section.label}>
                    <div className="text-[10px] uppercase tracking-wider text-white/50 px-2 py-1 font-semibold">
                      {section.label}
                    </div>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-[12px] transition-colors ${
                            active
                              ? "bg-[hsl(155,90%,40%)]/20 text-[hsl(155,90%,75%)]"
                              : "hover:bg-white/5 text-white/85"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Workspace */}
        <main className="bg-background text-foreground flex flex-col">
          {/* Breadcrumb / form header */}
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>ServiceNow</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">{activeItem?.label ?? "Home"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" className="h-7" onClick={() => handleAction("Save")}>
                <Save className="h-3 w-3 mr-1" />Save
              </Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => handleAction("Update")}>
                <RefreshCw className="h-3 w-3 mr-1" />Update
              </Button>
              <Button size="sm" className="h-7" onClick={() => handleAction("Submit")}>
                <Plus className="h-3 w-3 mr-1" />Submit
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-auto">
            {fields.length === 0 ? (
              demoMode ? (
                <DemoListView navId={activeNav} activeItem={activeItem} />
              ) : (
                <EmptyScreen activeItem={activeItem} expected={expectedAction} />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                {fields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-medium text-foreground/80">
                      {f.label}
                    </label>
                    {f.kind === "text" ? (
                      <Input
                        value={fieldValues[f.key] ?? ""}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        className="h-8 text-xs"
                      />
                    ) : (
                      <Select
                        value={fieldValues[f.key] ?? ""}
                        onValueChange={(v) => handleFieldChange(f.key, v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={`Select ${f.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options!.map((o) => (
                            <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Status banner */}
            {statusMsg && !demoMode && (
              <div
                className={`mt-4 flex items-center gap-2 rounded border px-3 py-2 text-xs ${
                  statusMsg.ok
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-warning/40 bg-warning/10 text-warning"
                }`}
              >
                {statusMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Hint chip */}
            {!demoMode && <ExpectedHint expected={expectedAction} activeNav={activeNav} />}
          </div>
        </main>
      </div>
    </Card>
  );
}

function EmptyScreen({ activeItem, expected }: { activeItem?: NavItem; expected: Action }) {
  return (
    <div className="text-center py-10 text-sm text-muted-foreground">
      <div className="mx-auto h-12 w-12 rounded bg-muted grid place-items-center mb-3">
        {activeItem?.icon ? <activeItem.icon className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </div>
      <div className="font-medium text-foreground">{activeItem?.label ?? "Now Platform"}</div>
      <p className="mt-1 max-w-md mx-auto">
        Use the application navigator on the left to open the correct module for this step.
      </p>
      {expected?.type === "navigate" && (
        <Badge variant="outline" className="mt-3 gap-1">
          <MousePointerClick className="h-3 w-3" />
          Hint: navigate to a related module
        </Badge>
      )}
    </div>
  );
}

function ExpectedHint({ expected, activeNav }: { expected: Action; activeNav: string }) {
  if (!expected?.type) return null;
  const labelMap: Record<string, string> = {
    navigate: "Navigate to the right application module",
    action: `Click the "${expected.target ?? "expected"}" action`,
    input: "Fill in the highlighted field",
    select: "Choose the right value",
    classify: "Set the correct classification",
    configure: "Configure the right value",
    create: "Open and submit a new record",
  };
  const text = labelMap[expected.type];
  if (!text) return null;
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] text-primary">
      <Star className="h-3 w-3" />
      {text}
    </div>
  );
}
