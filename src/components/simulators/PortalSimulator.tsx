/**
 * PortalSimulator — universal Microsoft-portal twin used by Defender XDR,
 * Purview, Sentinel, Entra, and concept labs.
 *
 * It validates against the expected_action contract authored in lab_steps:
 *   navigate  { target }
 *   action    { target }                 — click a labelled action button
 *   select    { target } or {field,value}— pick a row / option
 *   input     { field, value }           — type text into a field
 *   toggle    { field, value }           — switch on/off
 *   filter    { field, value }           — apply a filter chip
 *   sort      { field, value }           — sort by column asc/desc
 *   classify  { field, value }           — pick a classification verdict
 *   assign    { field, value }           — assign role/owner/license
 *   configure { field, value }           — multi-property config picker
 *   create    { target, value? }         — create entity flow
 *   read      { field }                  — observe-only step (auto-completes)
 *
 * Targets/fields use kebab-case as authored in the DB. We normalize once so
 * `defender-home`, `purview-home`, `entra-home`, `sentinel-workspace` all
 * resolve cleanly to nav IDs.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, Search, Bell, HelpCircle, Settings as SettingsIcon, ChevronRight,
  CheckCircle2, AlertTriangle, FileText, Database, Activity, Cpu, Mail,
  Cloud, Lock, Eye, Users, Network, Zap, Layers, Target, Server, Trophy,
  Brain, Filter, Pin, ArrowUpDown, MousePointerClick, Plus, Play,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type SimKind = "defender" | "purview" | "sentinel" | "entra" | "generic";

interface Action {
  type?: string;
  target?: string;
  field?: string;
  value?: any;
  [key: string]: any;
}

interface Props {
  simulator: SimKind;
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
  /** When true, hides lab-validation hints/checkmarks — pure showcase mode. */
  demoMode?: boolean;
}

interface NavItem { id: string; label: string; icon: any; aliases?: string[] }
interface NavSection { label?: string; items: NavItem[] }

interface NavConfig {
  brand: string;
  brandColor: string;
  sideColor: string;
  accentBadge: string;
  initials: string;
  defaultNav: string;
  sections: NavSection[];
}

// -----------------------------------------------------------------------------
// Nav configs — ids include all kebab-case targets used in seeded lab_steps
// -----------------------------------------------------------------------------
const NAV_CONFIGS: Record<SimKind, NavConfig> = {
  defender: {
    brand: "Microsoft Defender XDR",
    brandColor: "bg-[hsl(220,26%,14%)]",
    sideColor: "bg-[hsl(220,22%,20%)]",
    accentBadge: "Simulator",
    initials: "SO",
    defaultNav: "defender-home",
    sections: [
      { items: [
        { id: "defender-home", label: "Home", icon: Shield, aliases: ["home"] },
        { id: "incidents", label: "Incidents & alerts", icon: AlertTriangle, aliases: ["defender-incidents", "incident"] },
        { id: "attack-story", label: "Attack story", icon: Network },
      ]},
      { label: "Assets", items: [
        { id: "assets", label: "Devices & users", icon: Cpu, aliases: ["devices", "events", "network"] },
      ]},
      { label: "Email & collab", items: [
        { id: "attack-simulator", label: "Attack simulator", icon: Mail },
        { id: "simulations", label: "Past simulations", icon: Activity },
      ]},
      { label: "Cloud security", items: [
        { id: "defender-cloud", label: "Defender for Cloud", icon: Cloud },
        { id: "secure-score", label: "Secure Score", icon: Trophy },
        { id: "recommendations", label: "Recommendations", icon: FileText },
        { id: "recommended-actions", label: "Recommended actions", icon: Zap, aliases: ["improvement-actions"] },
      ]},
    ],
  },
  purview: {
    brand: "Microsoft Purview compliance portal",
    brandColor: "bg-[hsl(280,30%,20%)]",
    sideColor: "bg-[hsl(280,25%,26%)]",
    accentBadge: "Simulator",
    initials: "CO",
    defaultNav: "purview-home",
    sections: [
      { items: [
        { id: "purview-home", label: "Home", icon: Shield, aliases: ["home"] },
        { id: "compliance-manager", label: "Compliance Manager", icon: Trophy },
      ]},
      { label: "Information protection", items: [
        { id: "sensitivity-labels", label: "Sensitivity labels", icon: Lock },
        { id: "dlp-policies", label: "DLP policies", icon: FileText },
      ]},
      { label: "Solutions", items: [
        { id: "audit", label: "Audit", icon: Eye },
        { id: "ediscovery", label: "eDiscovery", icon: Search },
        { id: "insider-risk", label: "Insider risk", icon: Users },
      ]},
    ],
  },
  sentinel: {
    brand: "Microsoft Sentinel",
    brandColor: "bg-[hsl(210,40%,16%)]",
    sideColor: "bg-[hsl(210,35%,22%)]",
    accentBadge: "SOC simulator",
    initials: "SC",
    defaultNav: "sentinel-workspace",
    sections: [
      { items: [
        { id: "sentinel-workspace", label: "Workspace overview", icon: Shield, aliases: ["home", "overview"] },
        { id: "incidents", label: "Incidents", icon: AlertTriangle },
        { id: "hunting", label: "Hunting", icon: Search },
        { id: "logs", label: "Logs (KQL)", icon: Database },
      ]},
      { label: "Configuration", items: [
        { id: "analytics", label: "Analytics rules", icon: Activity, aliases: ["analytics-rules"] },
        { id: "playbooks", label: "Automation · Playbooks", icon: Zap },
        { id: "workbook", label: "Workbooks", icon: Layers, aliases: ["workbooks", "pin-workbook"] },
      ]},
    ],
  },
  generic: {
    brand: "Knowledge Lab",
    brandColor: "bg-[hsl(217,91%,30%)]",
    sideColor: "bg-[hsl(217,80%,38%)]",
    accentBadge: "Concept lab",
    initials: "TT",
    defaultNav: "home",
    sections: [
      { items: [
        { id: "home", label: "Lesson", icon: Brain },
        { id: "exercise", label: "Exercise", icon: Target },
      ]},
    ],
  },
  entra: {
    brand: "Microsoft Entra admin center",
    brandColor: "bg-[hsl(220,26%,14%)]",
    sideColor: "bg-[hsl(220,22%,20%)]",
    accentBadge: "Identity simulator",
    initials: "PR",
    defaultNav: "entra-home",
    sections: [
      { items: [
        { id: "entra-home", label: "Home", icon: Shield, aliases: ["home"] },
      ]},
      { label: "Identity", items: [
        { id: "users", label: "Users", icon: Users, aliases: ["user-profile"] },
        { id: "groups", label: "Groups", icon: Layers },
        { id: "auth-methods", label: "Authentication methods", icon: Lock },
        { id: "per-user-mfa", label: "Per-user MFA", icon: Lock },
      ]},
      { label: "Protection", items: [
        { id: "conditional-access", label: "Conditional Access", icon: Shield },
        { id: "identity-protection", label: "Identity Protection", icon: Eye },
        { id: "user-risk-policy", label: "User-risk policy", icon: AlertTriangle },
        { id: "risky-signins", label: "Risky sign-ins", icon: Activity, aliases: ["entra-signin-logs", "signin-detail", "sign-in-logs"] },
      ]},
      { label: "Hybrid & Azure", items: [
        { id: "hybrid-management", label: "Hybrid management", icon: Network },
        { id: "entra-connect", label: "Entra Connect", icon: Network },
        { id: "sync-comparison", label: "Sync options", icon: Layers },
        { id: "resource-groups", label: "Resource groups", icon: Server },
        { id: "iam", label: "Access control (IAM)", icon: Users },
      ]},
    ],
  },
};

// Resolve an authored target like "defender-home" / "home" to the canonical
// nav id used in NAV_CONFIGS. Returns null if it's not a navigable target.
function resolveNavTarget(cfg: NavConfig, raw: string): string | null {
  for (const sec of cfg.sections) {
    for (const it of sec.items) {
      if (it.id === raw) return it.id;
      if (it.aliases?.includes(raw)) return it.id;
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export function PortalSimulator({ simulator, expectedAction, onValidate, demoMode }: Props) {
  const cfg = NAV_CONFIGS[simulator];
  const [navState, setNavState] = useState(cfg.defaultNav);
  const [fields, setFields] = useState<Record<string, any>>({});
  const [actions, setActions] = useState<Set<string>>(new Set()); // clicked action targets
  const [validated, setValidated] = useState(false);

  // Reset on step change
  useEffect(() => {
    setValidated(false);
    setFields({});
    setActions(new Set());
  }, [expectedAction]);

  // Auto-validate "read" steps (observation only)
  useEffect(() => {
    if (expectedAction?.type === "read" && !validated) {
      const t = setTimeout(() => {
        setValidated(true);
        onValidate(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [expectedAction, validated, onValidate]);

  function check(s: { nav: string; fields: Record<string, any>; actions: Set<string> }): boolean {
    const a = expectedAction;
    if (!a?.type) return false;
    switch (a.type) {
      case "navigate":
        return s.nav === resolveNavTarget(cfg, a.target ?? "");
      case "query":
        // Authored as { type:"query", target:"logs", value:"<KQL>" }.
        // Validate by navigating to the logs blade (target defaults to "logs").
        return s.nav === resolveNavTarget(cfg, a.target ?? "logs");
      case "action":
      case "create":
        return s.actions.has(a.target ?? "");
      case "select":
        if (a.target) return s.actions.has(a.target);
        if (a.field) return String(s.fields[a.field] ?? "") === String(a.value ?? "");
        return false;
      case "input":
      case "filter":
      case "sort":
      case "classify":
      case "assign":
      case "configure":
        return String(s.fields[a.field!] ?? "").toLowerCase() === String(a.value ?? "").toLowerCase();
      case "toggle":
        return Boolean(s.fields[a.field!]) === Boolean(a.value);
      case "read":
        return validated;
      default:
        return false;
    }
  }

  function commit(next: { nav?: string; fields?: Record<string, any>; actions?: Set<string> }) {
    const merged = {
      nav: next.nav ?? navState,
      fields: next.fields ?? fields,
      actions: next.actions ?? actions,
    };
    if (!validated && check(merged)) {
      setValidated(true);
      onValidate(true);
    }
  }

  function go(nav: string) {
    setNavState(nav);
    commit({ nav });
  }
  function setField(name: string, value: any) {
    const next = { ...fields, [name]: value };
    setFields(next);
    commit({ fields: next });
  }
  function fireAction(target: string) {
    const next = new Set(actions);
    next.add(target);
    setActions(next);
    commit({ actions: next });
  }

  const helperHint = useMemo(() => buildHint(expectedAction, cfg), [expectedAction, cfg]);

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-elevated">
      {/* Top bar */}
      <div className={`${cfg.brandColor} text-primary-foreground flex items-center px-3 h-10 gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 grid place-items-center bg-primary rounded-sm">
            <Shield className="h-3 w-3" />
          </div>
          <span className="font-semibold truncate">{cfg.brand}</span>
          <Badge variant="outline" className="border-warning/40 text-warning bg-warning/10 text-[9px] uppercase tracking-wider">
            {cfg.accentBadge}
          </Badge>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white/10 rounded px-3 py-1 flex items-center gap-2 w-72 max-w-full">
            <Search className="h-3 w-3 opacity-70" />
            <span className="text-white/60">Search…</span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-80">
          <Bell className="h-3.5 w-3.5" />
          <SettingsIcon className="h-3.5 w-3.5" />
          <HelpCircle className="h-3.5 w-3.5" />
          <div className="h-6 w-6 rounded-full bg-primary-glow grid place-items-center text-[10px] font-semibold">
            {cfg.initials}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] min-h-[520px]">
        {/* Left blade */}
        <ScrollArea className={`${cfg.sideColor} text-primary-foreground/85 text-xs py-2`}>
          {cfg.sections.map((sec, i) => (
            <div key={i}>
              {sec.label && <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-white/50">{sec.label}</div>}
              {sec.items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => go(it.id)}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 ${navState === it.id ? "bg-primary/30 border-l-2 border-primary-glow" : ""}`}
                >
                  <it.icon className="h-3.5 w-3.5" />
                  <span className="truncate">{it.label}</span>
                </button>
              ))}
            </div>
          ))}
        </ScrollArea>

        {/* Main blade */}
        <div className="bg-background p-4 text-sm overflow-auto">
          <Crumb cfg={cfg} navState={navState} />
          {!demoMode && (
            <div className="mb-3 text-[11px] text-muted-foreground border-l-2 border-primary/40 pl-2">
              {helperHint}
            </div>
          )}

          <BladeVisual simulator={simulator} navState={navState} onAction={fireAction} actions={actions} />
          {!demoMode && (
            <ActionPanel
              expectedAction={expectedAction}
              fields={fields}
              actions={actions}
              setField={setField}
              fireAction={fireAction}
            />
          )}

          {!demoMode && validated && (
            <div className="mt-4 flex items-center gap-2 text-success bg-success/10 border border-success/30 rounded px-3 py-2 text-xs">
              <CheckCircle2 className="h-4 w-4" /> Step complete — well done.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function pretty(id: string) {
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Crumb({ cfg, navState }: { cfg: NavConfig; navState: string }) {
  const item = cfg.sections.flatMap((s) => s.items).find((i) => i.id === navState);
  return (
    <div className="breadcrumb-trail mb-3 text-xs">
      <span>{cfg.brand}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground">{item?.label ?? pretty(navState)}</span>
    </div>
  );
}

function buildHint(a: Action, cfg: NavConfig) {
  if (!a?.type) return "Read the step instructions and act accordingly.";
  switch (a.type) {
    case "navigate": {
      const id = resolveNavTarget(cfg, a.target ?? "");
      const item = cfg.sections.flatMap((s) => s.items).find((i) => i.id === id);
      return `Click "${item?.label ?? pretty(a.target ?? "")}" in the left navigation.`;
    }
    case "action": return `Click the "${pretty(a.target ?? "")}" action below.`;
    case "query": return `Open "Logs (KQL)" in the left navigation${a.value ? ` and run: ${a.value}` : ""}.`;
    case "create": return `Use the "Create ${pretty(a.target ?? "")}" button below.`;
    case "select": return a.target ? `Select "${pretty(a.target)}" in the list below.` : `Pick the requested option below.`;
    case "input": return `Enter the requested value in the field below.`;
    case "toggle": return `Toggle the switch below.`;
    case "filter": return `Apply the "${a.value}" filter on ${pretty(a.field ?? "")}.`;
    case "sort": return `Sort by ${pretty(a.field ?? "")} (${a.value}).`;
    case "classify": return `Classify the item below.`;
    case "assign": return `Assign the requested ${pretty(a.field ?? "")}.`;
    case "configure": return `Configure ${pretty(a.field ?? "")}.`;
    case "read": return `Observe the data below — this step auto-completes.`;
    default: return "";
  }
}

// -----------------------------------------------------------------------------
// Action panel — rendered for every step based on expected_action.type
// -----------------------------------------------------------------------------
function ActionPanel({
  expectedAction: a, fields, actions, setField, fireAction,
}: {
  expectedAction: Action;
  fields: Record<string, any>;
  actions: Set<string>;
  setField: (k: string, v: any) => void;
  fireAction: (t: string) => void;
}) {
  if (!a?.type) return null;
  const done = (k: string) => actions.has(k);

  // "action" / "create" / "select-by-target": one click does it
  if (a.type === "action" || a.type === "create" || (a.type === "select" && a.target)) {
    const Icon = a.type === "create" ? Plus : a.type === "select" ? MousePointerClick : Play;
    const verb = a.type === "create" ? "Create" : a.type === "select" ? "Select" : "Run";
    return (
      <Card className="p-3 mt-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium">{verb} "{pretty(a.target ?? "")}"</div>
          <div className="text-[11px] text-muted-foreground">Click to perform this action.</div>
        </div>
        <Button size="sm" onClick={() => fireAction(a.target!)} disabled={done(a.target!)}>
          <Icon className="h-3.5 w-3.5 mr-1" />
          {done(a.target!) ? "Done" : verb}
        </Button>
      </Card>
    );
  }

  if (a.type === "input" && a.field) {
    return (
      <Card className="p-3 mt-3 space-y-2">
        <label className="text-xs font-medium block">{pretty(a.field)}</label>
        <Input
          value={fields[a.field] ?? ""}
          onChange={(e) => setField(a.field!, e.target.value)}
          placeholder={String(a.value ?? "")}
        />
        <p className="text-[10px] text-muted-foreground">
          Tip: enter <code className="bg-muted px-1 rounded">{String(a.value ?? "")}</code>.
        </p>
      </Card>
    );
  }

  if (a.type === "toggle" && a.field) {
    return (
      <Card className="p-3 mt-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium">{pretty(a.field)}</div>
          <div className="text-[11px] text-muted-foreground">Toggle to complete this step.</div>
        </div>
        <Switch checked={!!fields[a.field]} onCheckedChange={(v) => setField(a.field!, v)} />
      </Card>
    );
  }

  if ((a.type === "filter" || a.type === "sort") && a.field) {
    const Icon = a.type === "filter" ? Filter : ArrowUpDown;
    const choices = a.type === "sort" ? ["asc", "desc"] : choicesForFilter(a.field, a.value);
    return (
      <Card className="p-3 mt-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Icon className="h-3.5 w-3.5 text-primary" /> {a.type === "sort" ? "Sort" : "Filter"} by {pretty(a.field)}
        </div>
        <div className="flex gap-2 flex-wrap">
          {choices.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={fields[a.field!] === c ? "default" : "outline"}
              onClick={() => setField(a.field!, c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (a.type === "classify" && a.field) {
    const verdicts = ["TP-Targeted", "TP-Benign", "FP", "Informational"];
    return (
      <Card className="p-3 mt-3 space-y-2">
        <div className="text-xs font-medium">Classify alert verdict</div>
        <div className="flex flex-wrap gap-2">
          {verdicts.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={fields[a.field!] === v ? "default" : "outline"}
              onClick={() => setField(a.field!, v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if ((a.type === "assign" || a.type === "configure") && a.field) {
    const choices = choicesForAssign(a.field, a.value);
    return (
      <Card className="p-3 mt-3 space-y-2">
        <label className="text-xs font-medium block">{pretty(a.field)}</label>
        {choices.length > 0 ? (
          <Select value={fields[a.field] ?? ""} onValueChange={(v) => setField(a.field!, v)}>
            <SelectTrigger><SelectValue placeholder={`Select ${pretty(a.field)}`} /></SelectTrigger>
            <SelectContent>
              {choices.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={fields[a.field] ?? ""}
            onChange={(e) => setField(a.field!, e.target.value)}
            placeholder={String(a.value ?? "")}
          />
        )}
        <p className="text-[10px] text-muted-foreground">
          Tip: <code className="bg-muted px-1 rounded">{String(a.value ?? "")}</code>
        </p>
      </Card>
    );
  }

  return null;
}

function choicesForFilter(field: string, expected: any): string[] {
  if (field === "severity") return ["Low", "Medium", "High", "Critical"];
  if (field === "regulation") return ["ISO27001", "NIST CSF", "SOC2", "HIPAA"];
  if (field === "time") return ["1d", "7d", "30d", "90d"];
  return [String(expected ?? "")];
}
function choicesForAssign(field: string, expected: any): string[] {
  if (field === "license") return ["M365-E3", "M365-E5", "EMS-E3", "EMS-E5"];
  if (field === "role") return ["Reader", "Contributor", "Owner", "Security Admin"];
  if (field === "principal" || field === "owner") return [String(expected ?? "")];
  if (field === "users") return ["Finance", "HR", "Engineering", "Marketing"];
  if (field === "technique") return ["credential-harvest", "link-in-attachment", "drive-by-url"];
  if (field === "verdict") return ["TP-Targeted", "TP-Benign", "FP"];
  if (field === "action") return ["block", "block-with-override", "warn", "audit-only"];
  if (field === "attestation") return ["true", "false"];
  if (field === "conditions") return ["compliant+location", "compliant-only", "location-only"];
  if (field === "locations") return ["exchange", "exchange+onedrive", "exchange+onedrive+teams"];
  if (field === "protection") return ["encrypt", "encrypt+watermark", "watermark-only"];
  if (field === "schedule") return ["1m/1m", "5m/5m", "15m/15m", "1h/1h"];
  if (field === "search") return [String(expected ?? "")];
  if (field === "signin-risk") return ["low-allow", "med-mfa-high-block", "high-block"];
  if (field === "user-risk") return ["low-allow", "medium-pwd-change", "high-block"];
  return [String(expected ?? "")];
}

// -----------------------------------------------------------------------------
// Blade visuals — branded "what you see" content per nav target
// -----------------------------------------------------------------------------
function BladeVisual({
  simulator, navState, onAction, actions,
}: {
  simulator: SimKind;
  navState: string;
  onAction: (t: string) => void;
  actions: Set<string>;
}) {
  const Visual = VISUALS[simulator]?.[navState];
  if (Visual) return <Visual onAction={onAction} done={(k: string) => actions.has(k)} />;
  return <DefaultBlade simulator={simulator} navState={navState} />;
}

function DefaultBlade({ simulator, navState }: { simulator: SimKind; navState: string }) {
  const Icon = SIM_ICON[simulator];
  return (
    <Card className="p-3 bg-muted/40">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{pretty(navState)}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        This blade simulates the {pretty(navState)} view. Use the action panel below.
      </p>
    </Card>
  );
}

const SIM_ICON: Record<SimKind, any> = { defender: Shield, purview: Lock, sentinel: Server, entra: Users, generic: Brain };

interface VisualProps { onAction: (t: string) => void; done: (t: string) => boolean }

const VISUALS: Record<SimKind, Record<string, (p: VisualProps) => JSX.Element>> = {
  defender: {
    "defender-home": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Defender XDR · Today</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="Active incidents" value="17" tone="text-warning" />
          <Stat label="High severity" value="5" tone="text-destructive" />
          <Stat label="Devices at risk" value="12" />
          <Stat label="Secure Score" value="62%" tone="text-primary" />
        </div>
      </Card>
    ),
    incidents: ({ done, onAction }) => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_120px_80px_100px]">
          <span>Incident</span><span>Severity</span><span>Status</span><span>Assets</span><span>Action</span>
        </div>
        {INCIDENTS.map((i) => (
          <div key={i.id} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_120px_80px_100px] border-t border-border hover:bg-muted/30 items-center">
            <span className="truncate">{i.name}</span>
            <span><Badge variant={i.sev === "High" ? "destructive" : "secondary"}>{i.sev}</Badge></span>
            <span>{i.status}</span>
            <span>{i.assets}</span>
            <span>
              <Button size="sm" variant={done("top-incident") && i.id === "top" ? "default" : "ghost"}
                onClick={() => onAction(i.id === "top" ? "top-incident" : `incident-${i.id}`)}>
                Open
              </Button>
            </span>
          </div>
        ))}
      </Card>
    ),
    "attack-story": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Attack story · MITRE ATT&CK chain</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {["Recon", "Initial access", "Execution", "Persistence", "Privilege esc", "Lateral move", "Exfiltration"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary-soft border border-primary/30 rounded">{s}</span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </span>
          ))}
        </div>
      </Card>
    ),
    assets: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_120px_80px]">
          <span>Device / User</span><span>OS / Type</span><span>Risk</span><span>Last seen</span><span>Exposure</span>
        </div>
        {DEVICES.map((d) => (
          <div key={d.name} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_120px_80px] border-t border-border hover:bg-muted/30">
            <span className="truncate font-medium">{d.name}</span>
            <span className="text-muted-foreground">{d.os}</span>
            <span><Badge variant={d.risk === "High" ? "destructive" : d.risk === "Medium" ? "secondary" : "outline"}>{d.risk}</Badge></span>
            <span className="text-muted-foreground">{d.seen}</span>
            <span className={d.exp > 60 ? "text-destructive" : d.exp > 30 ? "text-warning" : ""}>{d.exp}</span>
          </div>
        ))}
      </Card>
    ),
    "secure-score": () => (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Microsoft Secure Score</div>
            <div className="text-3xl font-bold text-primary">62%</div>
            <div className="text-[10px] text-muted-foreground">412 of 665 points · ↑ 4% in 30 days</div>
          </div>
          <Trophy className="h-10 w-10 text-warning" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Identity" value="71%" tone="text-domain-entra" />
          <Stat label="Devices" value="58%" tone="text-domain-security" />
          <Stat label="Apps" value="54%" />
        </div>
      </Card>
    ),
    recommendations: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_100px_120px]">
          <span>Recommendation</span><span>Severity</span><span>Score impact</span><span>Status</span>
        </div>
        {RECOS.map((r) => (
          <div key={r.name} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_100px_120px] border-t border-border hover:bg-muted/30">
            <span className="truncate">{r.name}</span>
            <span><Badge variant={r.sev === "High" ? "destructive" : "secondary"}>{r.sev}</Badge></span>
            <span>+{r.impact}</span>
            <span className="text-muted-foreground">To address</span>
          </div>
        ))}
      </Card>
    ),
    "recommended-actions": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold">Improvement actions · top by impact</div>
        {[
          { n: "Enable MFA for all users", pts: 12, cat: "Identity" },
          { n: "Block legacy authentication", pts: 8, cat: "Identity" },
          { n: "Enable Conditional Access for admins", pts: 6, cat: "Identity" },
          { n: "Turn on tamper protection (Defender for Endpoint)", pts: 5, cat: "Devices" },
          { n: "Restrict guest invitations to admins", pts: 4, cat: "Apps" },
          { n: "Enable ASR rule: Block Office macros from Internet", pts: 3, cat: "Devices" },
        ].map((r) => (
          <div key={r.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_60px] border-t border-border">
            <span>{r.n}</span>
            <span className="text-muted-foreground">{r.cat}</span>
            <span className="text-success font-medium">+{r.pts}</span>
          </div>
        ))}
      </Card>
    ),
    "defender-cloud": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Defender for Cloud · CSPM</h3>
          <Badge variant="outline">3 subscriptions</Badge>
        </div>
        <div className="p-3 grid grid-cols-3 gap-2 text-xs">
          <Stat label="Subscriptions" value="3" />
          <Stat label="Recommendations" value="68" tone="text-warning" />
          <Stat label="Regulatory %" value="71%" />
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_120px]">
          <span>Subscription</span><span>Score</span><span>Open recos</span>
        </div>
        {[
          { s: "sub-prod-eastus", sc: "76%", r: 18 },
          { s: "sub-dev-westus", sc: "61%", r: 27 },
          { s: "sub-shared-services", sc: "82%", r: 23 },
        ].map((x) => (
          <div key={x.s} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_120px] border-t border-border">
            <span>{x.s}</span><span className="text-primary">{x.sc}</span><span>{x.r}</span>
          </div>
        ))}
      </Card>
    ),
    "attack-simulator": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <h3 className="text-sm font-semibold">Attack simulation training</h3>
          <p className="text-[11px] text-muted-foreground">Run safe phishing simulations to measure user resilience.</p>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_100px]">
          <span>Template</span><span>Technique</span><span>Targeted</span><span>Predicted CR</span>
        </div>
        {[
          { n: "Microsoft 365 password expiry", t: "Credential harvest", u: 540, p: "11%" },
          { n: "DocuSign — please review", t: "Link in attachment", u: 420, p: "8%" },
          { n: "HR — annual benefits", t: "Drive-by URL", u: 847, p: "14%" },
          { n: "DHL package failed delivery", t: "Malware attachment", u: 320, p: "6%" },
        ].map((s) => (
          <div key={s.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_100px] border-t border-border">
            <span className="truncate">{s.n}</span>
            <span className="text-muted-foreground">{s.t}</span>
            <span>{s.u}</span>
            <span className="text-warning">{s.p}</span>
          </div>
        ))}
      </Card>
    ),
    simulations: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_100px_120px]">
          <span>Simulation</span><span>Compromise</span><span>Reported</span><span>Date</span>
        </div>
        {[
          { n: "Q1 phish — credential harvest", c: "12%", r: "38%", d: "Mar 14" },
          { n: "Payroll lure", c: "27%", r: "18%", d: "Feb 03" },
          { n: "OneDrive shared file", c: "9%", r: "44%", d: "Jan 17" },
          { n: "Voicemail link", c: "15%", r: "22%", d: "Dec 04" },
        ].map((s) => (
          <div key={s.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_100px_120px] border-t border-border">
            <span>{s.n}</span><span className="text-warning">{s.c}</span><span className="text-success">{s.r}</span><span className="text-muted-foreground">{s.d}</span>
          </div>
        ))}
      </Card>
    ),
  },

  purview: {
    "purview-home": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Microsoft Purview · Home</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="Compliance score" value="71%" tone="text-primary" />
          <Stat label="DLP policies" value="14" />
          <Stat label="Sensitivity labels" value="6" />
          <Stat label="Open eDiscovery" value="2" />
        </div>
      </Card>
    ),
    "compliance-manager": () => (
      <Card className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Compliance Score</div>
            <div className="text-3xl font-bold text-primary">71%</div>
            <div className="text-[10px] text-muted-foreground">412 of 580 controls</div>
          </div>
          <Layers className="h-10 w-10 text-primary" />
        </div>
        <div className="text-xs text-muted-foreground">Active assessments: ISO 27001:2022, NIST CSF, SOC 2 Type II</div>
      </Card>
    ),
    "sensitivity-labels": () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[160px_1fr_120px_100px]">
          <span>Label</span><span>Protection</span><span>Scope</span><span>Files tagged</span>
        </div>
        {[
          { l: "Public", p: "None", s: "All users", n: 12480 },
          { l: "Internal", p: "Watermark", s: "All employees", n: 38122 },
          { l: "Confidential", p: "Encrypt + watermark", s: "Employees only", n: 7841 },
          { l: "Confidential / Finance", p: "Encrypt + DRM (Edit)", s: "fin-team@", n: 2104 },
          { l: "Highly Confidential — M&A", p: "Encrypt + DRM (View) + DNF", s: "ma-deal@", n: 312 },
          { l: "Customer PII", p: "Encrypt + DLP block", s: "All employees", n: 9402 },
        ].map((x) => (
          <div key={x.l} className="px-3 py-2 text-xs grid grid-cols-[160px_1fr_120px_100px] border-t border-border">
            <span className="font-medium">{x.l}</span>
            <span className="text-muted-foreground">{x.p}</span>
            <span>{x.s}</span>
            <span>{x.n.toLocaleString()}</span>
          </div>
        ))}
      </Card>
    ),
    "dlp-policies": () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_140px_100px_100px_80px]">
          <span>Policy</span><span>Locations</span><span>Mode</span><span>Matches 7d</span><span>Status</span>
        </div>
        {[
          { n: "PCI — credit card numbers", loc: "Exchange + OneDrive", m: "Block", h: 14, s: "On" },
          { n: "PII India (Aadhaar / PAN) · DPDP", loc: "Exchange + Teams + SP", m: "Block + override", h: 47, s: "On" },
          { n: "Source code exfiltration", loc: "Endpoint DLP", m: "Audit + warn", h: 8, s: "On" },
          { n: "GDPR — EU resident PII", loc: "All M365", m: "Block + notify", h: 22, s: "On" },
          { n: "Patient health (HIPAA)", loc: "Exchange + SharePoint", m: "Block", h: 3, s: "On" },
          { n: "M&A keywords", loc: "Exchange + Teams", m: "Audit", h: 0, s: "Test" },
        ].map((p) => (
          <div key={p.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_140px_100px_100px_80px] border-t border-border">
            <span className="truncate">{p.n}</span>
            <span className="text-muted-foreground">{p.loc}</span>
            <span>{p.m}</span>
            <span className={p.h > 20 ? "text-warning" : ""}>{p.h}</span>
            <span><Badge variant={p.s === "On" ? "default" : "secondary"}>{p.s}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    audit: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[150px_1fr_140px_1fr]">
          <span>Time</span><span>User</span><span>Activity</span><span>Item</span>
        </div>
        {[
          { t: "2026-04-22 09:14", u: "alice@contoso.com", a: "FileDownloaded", i: "sales-roadmap.xlsx" },
          { t: "2026-04-22 11:02", u: "bob@contoso.com", a: "MailItemsAccessed", i: "14 items" },
          { t: "2026-04-23 03:47", u: "admin@contoso.com", a: "UserLoginFailed (×6)", i: "203.0.113.7" },
          { t: "2026-04-23 09:21", u: "priya@contoso.com", a: "FileSharedExternally", i: "client-list.xlsx" },
          { t: "2026-04-23 14:08", u: "raj@contoso.com", a: "TeamsChannelDeleted", i: "Project Atlas / General" },
          { t: "2026-04-24 02:11", u: "svc-backup@contoso.com", a: "MailboxLogin", i: "ExchangeOnline" },
        ].map((r) => (
          <div key={r.t + r.u} className="px-3 py-2 text-xs grid grid-cols-[150px_1fr_140px_1fr] border-t border-border font-mono">
            <span className="text-muted-foreground">{r.t}</span>
            <span className="truncate">{r.u}</span>
            <span>{r.a}</span>
            <span className="text-muted-foreground truncate">{r.i}</span>
          </div>
        ))}
      </Card>
    ),
    ediscovery: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_100px_80px]">
          <span>Case</span><span>Custodians</span><span>Hold</span><span>Searches</span><span>Status</span>
        </div>
        {[
          { n: "Bob Smith — termination review", c: 3, h: "Active", s: 4, st: "Open" },
          { n: "Project Atlas IP litigation", c: 12, h: "Active", s: 18, st: "Open" },
          { n: "GDPR DSR — A. Müller", c: 1, h: "—", s: 2, st: "Closed" },
          { n: "FINRA inquiry — trading desk", c: 7, h: "Active", s: 11, st: "Open" },
        ].map((c) => (
          <div key={c.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_100px_80px] border-t border-border">
            <span className="truncate font-medium">{c.n}</span>
            <span>{c.c}</span>
            <span>{c.h}</span>
            <span>{c.s}</span>
            <span><Badge variant={c.st === "Open" ? "default" : "outline"}>{c.st}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    "insider-risk": () => (
      <Card className="overflow-hidden">
        <div className="p-3 grid grid-cols-3 gap-2 text-xs border-b border-border">
          <Stat label="High" value="2" tone="text-destructive" />
          <Stat label="Medium" value="9" tone="text-warning" />
          <Stat label="Low" value="34" />
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_140px_100px_120px]">
          <span>Alert</span><span>User</span><span>Severity</span><span>Trigger</span>
        </div>
        {[
          { a: "Departing employee · downloads spike", u: "bob.smith@contoso", s: "High", t: "Data theft policy" },
          { a: "Unusual file deletion", u: "raj.k@contoso", s: "Medium", t: "Data leaks policy" },
          { a: "Email forwarded to personal", u: "alice.w@contoso", s: "Medium", t: "Data leaks policy" },
          { a: "USB transfer at off-hours", u: "mike.l@contoso", s: "Low", t: "General data leaks" },
          { a: "Cloud sync to non-corp account", u: "diana.r@contoso", s: "Medium", t: "Data leaks policy" },
        ].map((x) => (
          <div key={x.a + x.u} className="px-3 py-2 text-xs grid grid-cols-[1fr_140px_100px_120px] border-t border-border">
            <span className="truncate">{x.a}</span>
            <span className="text-muted-foreground truncate">{x.u}</span>
            <span><Badge variant={x.s === "High" ? "destructive" : x.s === "Medium" ? "secondary" : "outline"}>{x.s}</Badge></span>
            <span className="text-muted-foreground">{x.t}</span>
          </div>
        ))}
      </Card>
    ),
  },

  sentinel: {
    "sentinel-workspace": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Sentinel workspace · contoso-soc</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="Data sources" value="42" />
          <Stat label="Analytics rules" value="187" />
          <Stat label="Open incidents" value="48" tone="text-warning" />
          <Stat label="Avg MTTA" value="11m" />
        </div>
      </Card>
    ),
    incidents: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[80px_1fr_90px_100px_100px_100px]">
          <span>ID</span><span>Title</span><span>Severity</span><span>Status</span><span>Owner</span><span>Created</span>
        </div>
        {[
          { id: "INC-9412", t: "Possible AiTM phishing — priya@", s: "High", st: "New", o: "soc-tier1", c: "12m ago" },
          { id: "INC-9411", t: "Anomalous AAD sign-in from Tor", s: "High", st: "Active", o: "soc-tier2", c: "37m ago" },
          { id: "INC-9408", t: "Mass mailbox download", s: "Medium", st: "Active", o: "soc-tier2", c: "1h ago" },
          { id: "INC-9402", t: "Suspicious PowerShell on FIN-WS-04", s: "High", st: "New", o: "—", c: "2h ago" },
          { id: "INC-9397", t: "Brute force against /owa", s: "Medium", st: "Active", o: "soc-tier1", c: "3h ago" },
          { id: "INC-9389", t: "DLP — PCI exfil to Gmail", s: "Medium", st: "Closed", o: "compliance", c: "5h ago" },
          { id: "INC-9381", t: "Defender for Cloud — public storage", s: "Low", st: "Active", o: "cloud-eng", c: "8h ago" },
        ].map((i) => (
          <div key={i.id} className="px-3 py-2 text-xs grid grid-cols-[80px_1fr_90px_100px_100px_100px] border-t border-border hover:bg-muted/30">
            <span className="font-mono text-primary">{i.id}</span>
            <span className="truncate">{i.t}</span>
            <span><Badge variant={i.s === "High" ? "destructive" : i.s === "Medium" ? "secondary" : "outline"}>{i.s}</Badge></span>
            <span>{i.st}</span>
            <span className="text-muted-foreground">{i.o}</span>
            <span className="text-muted-foreground">{i.c}</span>
          </div>
        ))}
      </Card>
    ),
    hunting: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_140px_120px_80px]">
          <span>Query</span><span>Tactic</span><span>Data source</span><span>Hits</span>
        </div>
        {[
          { q: "Suspicious mass-download from SharePoint", t: "Exfiltration", d: "OfficeActivity", h: 3 },
          { q: "Anomalous Azure RoleAssignment", t: "Privilege Escalation", d: "AuditLogs", h: 1 },
          { q: "PowerShell EncodedCommand executions", t: "Execution", d: "DeviceProcessEvents", h: 12 },
          { q: "AAD impossible travel", t: "Initial Access", d: "SigninLogs", h: 4 },
          { q: "DNS to known DGA domains", t: "Command & Control", d: "DnsEvents", h: 0 },
          { q: "Service principal added to high-priv role", t: "Persistence", d: "AuditLogs", h: 2 },
        ].map((q) => (
          <div key={q.q} className="px-3 py-2 text-xs grid grid-cols-[1fr_140px_120px_80px] border-t border-border">
            <span className="truncate">{q.q}</span>
            <span className="text-muted-foreground">{q.t}</span>
            <span className="font-mono text-[10px]">{q.d}</span>
            <span className={q.h > 0 ? "text-warning font-medium" : "text-muted-foreground"}>{q.h}</span>
          </div>
        ))}
      </Card>
    ),
    logs: () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border text-xs font-mono bg-muted/40">
          <div className="text-muted-foreground">// KQL editor — contoso-soc workspace</div>
          <div className="mt-1">SigninLogs</div>
          <div>| where ResultType != 0 and TimeGenerated &gt; ago(1h)</div>
          <div>| summarize FailedAttempts=count() by UserPrincipalName, IPAddress</div>
          <div>| where FailedAttempts &gt; 10</div>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_140px_80px]">
          <span>UserPrincipalName</span><span>IPAddress</span><span>FailedAttempts</span>
        </div>
        {[
          { u: "priya@contosobank.in", ip: "203.0.113.42", n: 87 },
          { u: "alex@contosobank.in", ip: "198.51.100.7", n: 41 },
          { u: "svc-jenkins@contosobank.in", ip: "10.20.30.40", n: 28 },
          { u: "raj@contosobank.in", ip: "203.0.113.99", n: 14 },
        ].map((r) => (
          <div key={r.u} className="px-3 py-2 text-xs grid grid-cols-[1fr_140px_80px] border-t border-border font-mono">
            <span>{r.u}</span><span>{r.ip}</span><span className="text-warning">{r.n}</span>
          </div>
        ))}
      </Card>
    ),
    analytics: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_80px_80px]">
          <span>Rule</span><span>Tactic</span><span>Severity</span><span>Status</span><span>Cadence</span>
        </div>
        {[
          { n: "AAD — Sign-in from blocked country", t: "Initial Access", s: "High", st: "Enabled", c: "5m" },
          { n: "MDE — Process injection detected", t: "Defense Evasion", s: "High", st: "Enabled", c: "5m" },
          { n: "Mass Exchange mailbox download", t: "Exfiltration", s: "Medium", st: "Enabled", c: "10m" },
          { n: "ADFS account lockout spike", t: "Credential Access", s: "Medium", st: "Enabled", c: "15m" },
          { n: "Azure — public IP added to NSG", t: "Persistence", s: "Low", st: "Disabled", c: "1h" },
          { n: "Defender for Cloud — high-sev recommendation", t: "Discovery", s: "Medium", st: "Enabled", c: "1h" },
        ].map((r) => (
          <div key={r.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_80px_80px] border-t border-border">
            <span className="truncate">{r.n}</span>
            <span className="text-muted-foreground">{r.t}</span>
            <span><Badge variant={r.s === "High" ? "destructive" : r.s === "Medium" ? "secondary" : "outline"}>{r.s}</Badge></span>
            <span>{r.st}</span>
            <span className="font-mono text-[10px]">{r.c}</span>
          </div>
        ))}
      </Card>
    ),
    playbooks: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_80px]">
          <span>Playbook</span><span>Trigger</span><span>Runs 7d</span><span>State</span>
        </div>
        {[
          { n: "Isolate-Device-MDE", t: "Incident · High", r: 14, s: "On" },
          { n: "Disable-User-Entra", t: "Alert · risky user", r: 9, s: "On" },
          { n: "Notify-SOC-Teams", t: "Any incident", r: 142, s: "On" },
          { n: "Enrich-IP-VirusTotal", t: "Alert · external IP", r: 311, s: "On" },
          { n: "Block-IP-FortiGate", t: "Manual / SOAR", r: 6, s: "On" },
          { n: "Open-ServiceNow-Incident", t: "Incident · any", r: 87, s: "On" },
        ].map((p) => (
          <div key={p.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_80px] border-t border-border">
            <span className="font-medium">{p.n}</span>
            <span className="text-muted-foreground">{p.t}</span>
            <span>{p.r}</span>
            <span><Badge>{p.s}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    workbook: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-3">Workbook · SOC overview</h3>
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <Stat label="MTTA" value="11m" tone="text-primary" />
          <Stat label="MTTR" value="2h 14m" />
          <Stat label="Closed 7d" value="142" tone="text-success" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border border-border rounded p-2">
            <div className="text-[10px] uppercase text-muted-foreground mb-1">Incidents by severity (7d)</div>
            <div className="flex items-end gap-1 h-16">
              <div className="flex-1 bg-destructive/70 rounded-t" style={{ height: "70%" }} />
              <div className="flex-1 bg-warning/70 rounded-t" style={{ height: "45%" }} />
              <div className="flex-1 bg-primary/60 rounded-t" style={{ height: "85%" }} />
              <div className="flex-1 bg-muted rounded-t" style={{ height: "30%" }} />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1"><span>High</span><span>Med</span><span>Low</span><span>Info</span></div>
          </div>
          <div className="border border-border rounded p-2">
            <div className="text-[10px] uppercase text-muted-foreground mb-1">Top data sources</div>
            <ul className="text-xs space-y-1">
              <li>• SigninLogs — 41%</li>
              <li>• SecurityEvent — 22%</li>
              <li>• DeviceEvents — 17%</li>
              <li>• OfficeActivity — 12%</li>
            </ul>
          </div>
        </div>
      </Card>
    ),
  },

  generic: {
    home: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Concept lab</h3>
        <p className="text-xs text-muted-foreground">Read the step prompt then enter your answer below.</p>
      </Card>
    ),
    exercise: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Exercise</h3>
        <p className="text-xs text-muted-foreground">Use the field below to record your answer.</p>
      </Card>
    ),
  },

  entra: {
    "entra-home": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Microsoft Entra ID · Contoso Bank India</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="Tenant" value="contosobank" />
          <Stat label="License" value="M365 E5" tone="text-primary" />
          <Stat label="Users" value="847" />
          <Stat label="Groups" value="312" />
        </div>
      </Card>
    ),
    users: () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Users · 847</h3>
          <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />New user</Button>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_180px_120px_100px_80px]">
          <span>Display name</span><span>UPN</span><span>Job title</span><span>MFA</span><span>Status</span>
        </div>
        {USERS.map((u) => (
          <div key={u.upn} className="px-3 py-2 text-xs grid grid-cols-[1fr_180px_120px_100px_80px] border-t border-border hover:bg-muted/30">
            <span className="truncate">{u.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">{u.upn}</span>
            <span className="truncate">{u.title}</span>
            <span>{u.mfa ? <Badge variant="default">Registered</Badge> : <Badge variant="outline">No</Badge>}</span>
            <span><Badge variant={u.enabled ? "secondary" : "destructive"}>{u.enabled ? "Enabled" : "Blocked"}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    groups: () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Groups · 312</h3>
          <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />New group</Button>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_100px]">
          <span>Group name</span><span>Type</span><span>Members</span><span>Membership</span>
        </div>
        {[
          { n: "sg-Admins-Global", t: "Security", m: 4, ms: "Assigned" },
          { n: "sg-Helpdesk", t: "Security", m: 22, ms: "Assigned" },
          { n: "sg-Finance-RW", t: "Security", m: 47, ms: "Dynamic" },
          { n: "sg-CA-Exclude-BreakGlass", t: "Security", m: 2, ms: "Assigned" },
          { n: "M365 — Project Atlas", t: "Microsoft 365", m: 31, ms: "Assigned" },
          { n: "M365 — All Employees", t: "Microsoft 365", m: 847, ms: "Dynamic" },
          { n: "sg-MFA-Exempt-Service", t: "Security", m: 6, ms: "Assigned" },
        ].map((g) => (
          <div key={g.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_100px] border-t border-border">
            <span className="font-medium truncate">{g.n}</span>
            <span className="text-muted-foreground">{g.t}</span>
            <span>{g.m}</span>
            <span><Badge variant="outline">{g.ms}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    "auth-methods": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold">Authentication methods policy</div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_120px]">
          <span>Method</span><span>State</span><span>Target</span><span>Registered</span>
        </div>
        {[
          { n: "Microsoft Authenticator (push + passwordless)", s: "Enabled", t: "All users", r: "812 / 847" },
          { n: "FIDO2 security key", s: "Enabled", t: "Admins", r: "11 / 14" },
          { n: "Windows Hello for Business", s: "Enabled", t: "All users", r: "623 / 847" },
          { n: "Temporary Access Pass (TAP)", s: "Enabled", t: "Helpdesk-issued", r: "—" },
          { n: "SMS", s: "Enabled", t: "All users", r: "201 / 847" },
          { n: "Voice call", s: "Disabled", t: "—", r: "—" },
          { n: "Email OTP", s: "Disabled", t: "Guests", r: "—" },
        ].map((m) => (
          <div key={m.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_120px] border-t border-border">
            <span className="truncate">{m.n}</span>
            <span><Badge variant={m.s === "Enabled" ? "default" : "outline"}>{m.s}</Badge></span>
            <span className="text-muted-foreground">{m.t}</span>
            <span>{m.r}</span>
          </div>
        ))}
      </Card>
    ),
    "per-user-mfa": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border">
          <h3 className="text-sm font-semibold">Per-user MFA (legacy)</h3>
          <p className="text-[10px] text-muted-foreground">Use Conditional Access for tenant-wide MFA. This view is for legacy individual exceptions only.</p>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_180px_120px]">
          <span>User</span><span>UPN</span><span>MFA Status</span>
        </div>
        {USERS.slice(0, 6).map((u) => (
          <div key={u.upn} className="px-3 py-2 text-xs grid grid-cols-[1fr_180px_120px] border-t border-border">
            <span>{u.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{u.upn}</span>
            <span><Badge variant={u.mfa ? "default" : "outline"}>{u.mfa ? "Enforced" : "Disabled"}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    "conditional-access": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Conditional Access · Policies</h3>
          <Button size="sm"><Plus className="h-3 w-3 mr-1" />New policy</Button>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_100px_100px]">
          <span>Policy</span><span>State</span><span>Users</span><span>Modified</span>
        </div>
        {[
          { n: "CA001 — Require MFA for admins", s: "On", u: "14 admins", m: "2d ago" },
          { n: "CA002 — Block legacy auth (all)", s: "On", u: "All users", m: "12d ago" },
          { n: "CA003 — Require compliant device", s: "On", u: "All employees", m: "21d ago" },
          { n: "CA004 — Block sign-in from countries", s: "On", u: "All users", m: "1mo ago" },
          { n: "CA005 — Require MFA from external networks", s: "On", u: "All users", m: "3w ago" },
          { n: "CA006 — Session controls for SharePoint", s: "Report-only", u: "All users", m: "8d ago" },
          { n: "CA007 — Risky sign-in → require MFA + change pwd", s: "On", u: "All users", m: "5d ago" },
          { n: "CA008 — Guest access — restricted apps", s: "On", u: "All guests", m: "1mo ago" },
        ].map((p) => (
          <div key={p.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_100px_100px] border-t border-border hover:bg-muted/30">
            <span className="truncate">{p.n}</span>
            <span><Badge variant={p.s === "On" ? "default" : "secondary"}>{p.s}</Badge></span>
            <span className="text-muted-foreground">{p.u}</span>
            <span className="text-muted-foreground">{p.m}</span>
          </div>
        ))}
      </Card>
    ),
    "identity-protection": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Identity Protection</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Risky users" value="9" tone="text-warning" />
          <Stat label="Risky sign-ins (24h)" value="42" />
          <Stat label="Risk detections" value="187" />
        </div>
      </Card>
    ),
    "user-risk-policy": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold">User-risk & sign-in-risk policies</div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_140px_120px_80px]">
          <span>Policy</span><span>Risk level</span><span>Action</span><span>Users</span><span>State</span>
        </div>
        {[
          { n: "User risk policy", r: "High", a: "Require password change", u: "All users", s: "On" },
          { n: "Sign-in risk policy", r: "Medium and above", a: "Require MFA", u: "All users", s: "On" },
          { n: "MFA registration policy", r: "—", a: "Require registration (14d)", u: "All users", s: "On" },
        ].map((p) => (
          <div key={p.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_140px_120px_80px] border-t border-border">
            <span className="font-medium">{p.n}</span>
            <span><Badge variant={p.r === "High" ? "destructive" : "secondary"}>{p.r}</Badge></span>
            <span>{p.a}</span>
            <span className="text-muted-foreground">{p.u}</span>
            <span><Badge>{p.s}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    "risky-signins": () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_140px_120px_80px]">
          <span>User</span><span>Risk</span><span>Detection</span><span>Location</span><span>Action</span>
        </div>
        {[
          { u: "priya@contosobank.in", r: "High", d: "Anonymous IP (Tor)", l: "Unknown" },
          { u: "alex@contosobank.in", r: "Medium", d: "Atypical travel", l: "Mumbai → Lagos" },
          { u: "raj@contosobank.in", r: "Low", d: "Unfamiliar properties", l: "Bengaluru" },
          { u: "diana.r@contosobank.in", r: "High", d: "Leaked credentials", l: "Bengaluru" },
          { u: "svc-jenkins@contosobank.in", r: "Medium", d: "Unusual sign-in", l: "AWS us-east-1" },
        ].map((s) => (
          <div key={s.u} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_140px_120px_80px] border-t border-border">
            <span className="truncate">{s.u}</span>
            <span><Badge variant={s.r === "High" ? "destructive" : "secondary"}>{s.r}</Badge></span>
            <span className="text-muted-foreground">{s.d}</span>
            <span className="text-muted-foreground">{s.l}</span>
            <span><Button size="sm" variant="ghost">View</Button></span>
          </div>
        ))}
      </Card>
    ),
    "hybrid-management": () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold">Hybrid identity management</div>
        <div className="p-3 grid grid-cols-3 gap-2 text-xs border-b border-border">
          <Stat label="Synced objects" value="847" />
          <Stat label="Last sync" value="3 min ago" tone="text-success" />
          <Stat label="Sync errors" value="0" tone="text-success" />
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_120px_120px_100px]">
          <span>Connector</span><span>Type</span><span>Last run</span><span>Status</span>
        </div>
        {[
          { n: "contoso.local", t: "AD DS", l: "3 min ago", s: "Healthy" },
          { n: "contosobank.onmicrosoft.com", t: "Entra ID", l: "3 min ago", s: "Healthy" },
          { n: "contoso-ad-export", t: "OU filtering", l: "3 min ago", s: "Healthy" },
        ].map((c) => (
          <div key={c.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_120px_120px_100px] border-t border-border">
            <span className="font-medium">{c.n}</span>
            <span>{c.t}</span>
            <span className="text-muted-foreground">{c.l}</span>
            <span><Badge variant="default">{c.s}</Badge></span>
          </div>
        ))}
      </Card>
    ),
    "entra-connect": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Entra Connect deployment plan</h3>
        <ul className="text-xs space-y-1">
          <li>• Topology: single forest → single tenant</li>
          <li>• Sign-in: PHS with seamless SSO</li>
          <li>• Filtering: OU-scoped sync</li>
        </ul>
      </Card>
    ),
    "sync-comparison": () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[120px_1fr_1fr]">
          <span>Model</span><span>Pros</span><span>Cons</span>
        </div>
        {[
          { m: "PHS", p: "Simple · cloud-only auth", c: "Hash sync trust required" },
          { m: "PTA", p: "On-prem auth · no hash", c: "Agent dependency" },
          { m: "Federation", p: "Full control · MFA chaining", c: "ADFS overhead" },
        ].map((r) => (
          <div key={r.m} className="px-3 py-2 text-xs grid grid-cols-[120px_1fr_1fr] border-t border-border">
            <span className="font-medium">{r.m}</span><span>{r.p}</span><span className="text-muted-foreground">{r.c}</span>
          </div>
        ))}
      </Card>
    ),
    "resource-groups": () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium">Resource groups</div>
        {["rg-finance-prod", "rg-marketing-dev", "rg-shared-network"].map((r) => (
          <div key={r} className="px-3 py-2 text-xs border-t border-border">{r}</div>
        ))}
      </Card>
    ),
    iam: () => (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Access control (IAM) · sub-prod-eastus</h3>
          <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Add role assignment</Button>
        </div>
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_180px_140px_100px]">
          <span>Principal</span><span>Role</span><span>Scope</span><span>Type</span>
        </div>
        {[
          { p: "Aarti Patel", r: "Owner", s: "Subscription", t: "User" },
          { p: "sg-Admins-Global", r: "Contributor", s: "Subscription", t: "Group" },
          { p: "Bob Smith", r: "Reader", s: "rg-finance-prod", t: "User" },
          { p: "sp-deploy-cicd", r: "Contributor", s: "rg-finance-prod", t: "Service Principal" },
          { p: "sg-Helpdesk", r: "Reader", s: "Subscription", t: "Group" },
          { p: "diana.r@contosobank.in", r: "User Access Administrator", s: "rg-shared-network", t: "User" },
        ].map((a) => (
          <div key={a.p + a.r} className="px-3 py-2 text-xs grid grid-cols-[1fr_180px_140px_100px] border-t border-border">
            <span className="font-medium truncate">{a.p}</span>
            <span>{a.r}</span>
            <span className="text-muted-foreground">{a.s}</span>
            <span><Badge variant="outline">{a.t}</Badge></span>
          </div>
        ))}
      </Card>
    ),
  },
};

const USERS = [
  { name: "Aarti Patel", upn: "aarti.patel@contosobank.in", title: "CISO", mfa: true, enabled: true },
  { name: "Priya Sharma", upn: "priya@contosobank.in", title: "SOC Analyst", mfa: true, enabled: true },
  { name: "Raj Kumar", upn: "raj@contosobank.in", title: "Network Admin", mfa: true, enabled: true },
  { name: "Alex Tan", upn: "alex@contosobank.in", title: "Cloud Engineer", mfa: true, enabled: true },
  { name: "Diana Roy", upn: "diana.r@contosobank.in", title: "IAM Lead", mfa: true, enabled: true },
  { name: "Bob Smith", upn: "bob.smith@contosobank.in", title: "Contractor", mfa: false, enabled: false },
  { name: "Mike Lee", upn: "mike.l@contosobank.in", title: "Helpdesk", mfa: true, enabled: true },
  { name: "Alice Wong", upn: "alice.w@contosobank.in", title: "Finance Mgr", mfa: true, enabled: true },
  { name: "svc-jenkins", upn: "svc-jenkins@contosobank.in", title: "Service account", mfa: false, enabled: true },
  { name: "svc-backup", upn: "svc-backup@contosobank.in", title: "Service account", mfa: false, enabled: true },
];

const DEVICES = [
  { name: "FIN-WS-04", os: "Windows 11 Pro", risk: "High", seen: "2 min ago", exp: 78 },
  { name: "HR-DC-01", os: "Win Server 2022", risk: "High", seen: "1 min ago", exp: 64 },
  { name: "MKT-LAP-22", os: "macOS 14.4", risk: "Medium", seen: "12 min ago", exp: 41 },
  { name: "DEV-CONTAINER-7", os: "Ubuntu 22.04", risk: "Medium", seen: "5 min ago", exp: 38 },
  { name: "CFO-IPHONE", os: "iOS 17.4", risk: "Low", seen: "1 h ago", exp: 12 },
  { name: "BR-KIOSK-09", os: "Windows 10 LTSC", risk: "Low", seen: "32 min ago", exp: 22 },
  { name: "OT-PLC-GATEWAY", os: "Linux 5.4", risk: "Medium", seen: "3 min ago", exp: 47 },
];

const INCIDENTS = [
  { id: "top", name: "Multi-stage attack on FIN-WS-04", sev: "High", status: "New", assets: 12 },
  { id: "lateral", name: "Lateral movement on HR-DC", sev: "High", status: "New", assets: 8 },
  { id: "phish", name: "Phish wave from payroll-update.com", sev: "Medium", status: "Active", assets: 87 },
];
const RECOS = [
  { name: "Enable MFA for all users", sev: "High", impact: 12 },
  { name: "Block legacy authentication", sev: "High", impact: 8 },
  { name: "Restrict guest access in Teams", sev: "Medium", impact: 4 },
  { name: "Apply baseline security to subscriptions", sev: "Medium", impact: 6 },
];

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="border border-border rounded p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${tone}`}>{value}</div>
    </div>
  );
}
