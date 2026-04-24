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
        { id: "incidents", label: "Incidents & alerts", icon: AlertTriangle },
        { id: "attack-story", label: "Attack story", icon: Network },
      ]},
      { label: "Assets", items: [
        { id: "assets", label: "Devices & users", icon: Cpu },
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
        { id: "sentinel-workspace", label: "Workspace overview", icon: Shield, aliases: ["home"] },
        { id: "incidents", label: "Incidents", icon: AlertTriangle },
        { id: "hunting", label: "Hunting", icon: Search },
        { id: "logs", label: "Logs (KQL)", icon: Database },
      ]},
      { label: "Configuration", items: [
        { id: "analytics", label: "Analytics rules", icon: Activity },
        { id: "playbooks", label: "Automation · Playbooks", icon: Zap },
        { id: "workbook", label: "Workbooks", icon: Layers },
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
export function PortalSimulator({ simulator, expectedAction, onValidate }: Props) {
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
          <div className="mb-3 text-[11px] text-muted-foreground border-l-2 border-primary/40 pl-2">
            {helperHint}
          </div>

          <BladeVisual simulator={simulator} navState={navState} onAction={fireAction} actions={actions} />
          <ActionPanel
            expectedAction={expectedAction}
            fields={fields}
            actions={actions}
            setField={setField}
            fireAction={fireAction}
          />

          {validated && (
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

const SIM_ICON: Record<SimKind, any> = { defender: Shield, purview: Lock, sentinel: Server, generic: Brain };

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
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Devices & Identities</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Onboarded devices" value="847" />
          <Stat label="At risk" value="12" tone="text-destructive" />
          <Stat label="Compromised users" value="3" tone="text-warning" />
        </div>
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
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_100px]">
          <span>Recommendation</span><span>Severity</span><span>Score impact</span>
        </div>
        {RECOS.map((r) => (
          <div key={r.name} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_100px] border-t border-border">
            <span className="truncate">{r.name}</span>
            <span><Badge variant={r.sev === "High" ? "destructive" : "secondary"}>{r.sev}</Badge></span>
            <span>+{r.impact}</span>
          </div>
        ))}
      </Card>
    ),
    "recommended-actions": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Improvement actions · top by impact</h3>
        <ul className="text-xs space-y-1.5">
          <li>• Enable MFA for all users (+12 pts)</li>
          <li>• Block legacy authentication (+8 pts)</li>
          <li>• Enable Conditional Access for admins (+6 pts)</li>
        </ul>
      </Card>
    ),
    "defender-cloud": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Defender for Cloud · CSPM</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Subscriptions" value="3" />
          <Stat label="Recommendations" value="68" tone="text-warning" />
          <Stat label="Regulatory %" value="71%" />
        </div>
      </Card>
    ),
    "attack-simulator": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Defender for Office 365 · Attack simulation training</h3>
        <p className="text-xs text-muted-foreground">Run safe phishing simulations to measure user resilience.</p>
      </Card>
    ),
    simulations: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_120px]">
          <span>Simulation</span><span>Compromise</span><span>Date</span>
        </div>
        {[{ n: "Q1 phish — credential harvest", c: "12%", d: "Mar 14" }, { n: "Payroll lure", c: "27%", d: "Feb 03" }].map((s) => (
          <div key={s.n} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_120px] border-t border-border">
            <span>{s.n}</span><span className="text-warning">{s.c}</span><span className="text-muted-foreground">{s.d}</span>
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
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Sensitivity labels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {["Public", "Internal", "Confidential", "Highly Confidential — M&A"].map((l) => (
            <Badge key={l} variant="outline" className="justify-center py-1.5">{l}</Badge>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Encryption + watermark + access scope per label.</p>
      </Card>
    ),
    "dlp-policies": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Data loss prevention · policies</h3>
        <ul className="text-xs space-y-1">
          <li>• PCI — credit card numbers (Exchange + OneDrive)</li>
          <li>• PII India (Aadhaar / PAN) — DPDP Act 2023</li>
          <li>• Source code exfiltration — Endpoint DLP</li>
        </ul>
      </Card>
    ),
    audit: () => (
      <Card className="p-3 font-mono text-xs">
        <div className="text-muted-foreground mb-1">// Audit search results · last 7 days</div>
        <div>2026-04-22 09:14 · alice@contoso.com · FileDownloaded · sales-roadmap.xlsx</div>
        <div>2026-04-22 11:02 · bob@contoso.com · MailItemsAccessed · 14 items</div>
        <div>2026-04-23 03:47 · admin@contoso.com · UserLoginFailed (×6)</div>
      </Card>
    ),
    ediscovery: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">eDiscovery (Premium) · cases</h3>
        <div className="text-xs">
          <div className="border border-border rounded p-2 mb-2">
            <div className="font-medium">Bob Smith — termination review</div>
            <div className="text-muted-foreground">Custodians: 3 · Hold: active · Searches: 4</div>
          </div>
        </div>
      </Card>
    ),
    "insider-risk": () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Insider risk · alerts (last 30d)</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="High" value="2" tone="text-destructive" />
          <Stat label="Medium" value="9" tone="text-warning" />
          <Stat label="Low" value="34" />
        </div>
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
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Sentinel incidents</h3>
        <div className="text-xs text-muted-foreground">5 high · 12 medium · 31 low (open)</div>
      </Card>
    ),
    hunting: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Hunting library</h3>
        <div className="text-xs text-muted-foreground">214 built-in queries · MITRE ATT&CK aligned · 12 custom</div>
      </Card>
    ),
    logs: () => (
      <Card className="p-3 font-mono text-[11px] leading-relaxed">
        <div className="text-muted-foreground">// KQL editor — paste your query below</div>
        <div className="mt-1">SigninLogs</div>
        <div>| where ResultType != 0</div>
        <div>| where TimeGenerated &gt; ago(1h)</div>
        <div>| summarize FailedAttempts=count() by UserPrincipalName, IPAddress</div>
        <div>| where FailedAttempts &gt; 10</div>
      </Card>
    ),
    analytics: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Analytics rules</h3>
        <div className="text-xs text-muted-foreground">187 active · 142 Microsoft · 45 custom · 5/5/m default cadence</div>
      </Card>
    ),
    playbooks: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Playbooks (Logic Apps)</h3>
        <ul className="text-xs space-y-1">
          <li>• Isolate-Device-MDE</li>
          <li>• Disable-User-Entra</li>
          <li>• Notify-SOC-Teams</li>
        </ul>
      </Card>
    ),
    workbook: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Workbook · SOC overview</h3>
        <div className="text-xs text-muted-foreground">12 visualizations · pinned 3 to dashboard</div>
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
};

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
