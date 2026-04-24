/**
 * PortalSimulator — a configurable, Microsoft-portal-style twin used by the
 * Defender XDR, Purview compliance, Sentinel SOC, and generic knowledge labs.
 *
 * It validates against the same `expected_action` contract as EntraSimulator:
 *  - { type: "navigate", target }   → user must click the matching nav item
 *  - { type: "input", field, value } → user types `value` into the field
 *  - { type: "toggle", field, value: true } → user toggles a switch / runs an action
 *
 * Each `simulator` value (defender / purview / sentinel / generic) gets its own
 * branded chrome, nav tree, and "main blade" widgets — but the validation
 * engine is shared, so adding a new lab only requires authoring steps in the
 * database, not new React components.
 */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, Search, Bell, HelpCircle, Settings as SettingsIcon, ChevronRight,
  CheckCircle2, AlertTriangle, FileText, Database, Activity, Cpu, Mail,
  Cloud, Lock, Eye, Users, Network, Bot, Zap, Layers, Target, Server,
  Trophy, Brain,
} from "lucide-react";

type Action =
  | { type: "navigate"; target?: string }
  | { type: "input"; field?: string; value?: string }
  | { type: "toggle"; field?: string; value?: boolean }
  | Record<string, any>;

interface Props {
  simulator: "defender" | "purview" | "sentinel" | "generic";
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
}

interface NavConfig {
  brand: string;
  brandColor: string;       // tailwind class for the top-bar background
  accentBadge: string;      // header badge label
  initials: string;
  sections: Array<{
    label?: string;
    items: Array<{ id: string; label: string; icon: any }>;
  }>;
  defaultNav: string;
}

const NAV_CONFIGS: Record<Props["simulator"], NavConfig> = {
  defender: {
    brand: "Microsoft Defender XDR",
    brandColor: "bg-[hsl(220,26%,14%)]",
    accentBadge: "Simulator",
    initials: "SO",
    defaultNav: "incidents",
    sections: [
      { items: [
        { id: "home", label: "Home", icon: Shield },
        { id: "incidents", label: "Incidents & alerts", icon: AlertTriangle },
        { id: "incident_detail", label: "Incident: FIN-WS-04", icon: Target },
        { id: "attack_story", label: "Attack story", icon: Network },
      ]},
      { label: "Assets", items: [
        { id: "device", label: "Devices", icon: Cpu },
        { id: "users", label: "Identities", icon: Users },
      ]},
      { label: "Email & collab", items: [
        { id: "email_explorer", label: "Explorer", icon: Mail },
      ]},
      { label: "Cloud apps", items: [
        { id: "cloud_discovery", label: "Cloud discovery", icon: Cloud },
        { id: "activity_log", label: "Activity log", icon: Activity },
      ]},
      { label: "Cloud security", items: [
        { id: "defender_cloud", label: "Defender for Cloud", icon: Shield },
        { id: "secure_score", label: "Secure Score", icon: Trophy },
        { id: "recommendations", label: "Recommendations", icon: FileText },
      ]},
    ],
  },
  purview: {
    brand: "Microsoft Purview compliance portal",
    brandColor: "bg-[hsl(280,30%,20%)]",
    accentBadge: "Simulator",
    initials: "CO",
    defaultNav: "home",
    sections: [
      { items: [
        { id: "home", label: "Home", icon: Shield },
        { id: "compliance_manager", label: "Compliance Manager", icon: Trophy },
        { id: "score", label: "Compliance score", icon: Activity },
      ]},
      { label: "Solutions", items: [
        { id: "sensitivity_labels", label: "Information Protection", icon: Lock },
        { id: "retention", label: "Records management", icon: FileText },
        { id: "insider_risk", label: "Insider risk management", icon: Eye },
        { id: "ediscovery", label: "eDiscovery", icon: Search },
      ]},
    ],
  },
  sentinel: {
    brand: "Microsoft Sentinel",
    brandColor: "bg-[hsl(210,40%,16%)]",
    accentBadge: "SOC simulator",
    initials: "SC",
    defaultNav: "hunting",
    sections: [
      { items: [
        { id: "home", label: "Overview", icon: Shield },
        { id: "incidents", label: "Incidents", icon: AlertTriangle },
        { id: "hunting", label: "Hunting", icon: Search },
        { id: "logs", label: "Logs (KQL)", icon: Database },
      ]},
      { label: "Configuration", items: [
        { id: "playbooks", label: "Automation · Playbooks", icon: Zap },
        { id: "analytics", label: "Analytics rules", icon: Activity },
      ]},
    ],
  },
  generic: {
    brand: "Knowledge Lab",
    brandColor: "bg-[hsl(217,91%,30%)]",
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

export function PortalSimulator({ simulator, expectedAction, onValidate }: Props) {
  const cfg = NAV_CONFIGS[simulator];
  const [navState, setNavState] = useState(cfg.defaultNav);
  const [fields, setFields] = useState<Record<string, any>>({});
  const [validated, setValidated] = useState(false);

  // reset when step changes
  useEffect(() => {
    setValidated(false);
    setFields({});
  }, [expectedAction]);

  function check(s: { nav: string; fields: Record<string, any> }) {
    const a = expectedAction;
    if (!a?.type) return false;
    if (a.type === "navigate") return s.nav === a.target;
    if (a.type === "input") return String(s.fields[a.field!] ?? "").toLowerCase() === String(a.value ?? "").toLowerCase();
    if (a.type === "toggle") return Boolean(s.fields[a.field!]) === Boolean(a.value);
    return false;
  }

  function go(nav: string) {
    setNavState(nav);
    if (!validated && check({ nav, fields })) {
      setValidated(true);
      onValidate(true);
    }
  }

  function setField(name: string, value: any) {
    const next = { ...fields, [name]: value };
    setFields(next);
    if (!validated && check({ nav: navState, fields: next })) {
      setValidated(true);
      onValidate(true);
    }
  }

  const helperHint = useMemo(() => {
    const a = expectedAction;
    if (!a?.type) return "Read the step instructions and act accordingly.";
    if (a.type === "navigate") return `Click "${prettyNav(a.target ?? "")}" in the left navigation.`;
    if (a.type === "input") return `Enter the requested value in the highlighted field.`;
    if (a.type === "toggle") return `Use the switch / button below to perform the action.`;
    return "";
  }, [expectedAction]);

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

      <div className="grid grid-cols-[220px_1fr] min-h-[480px]">
        {/* Left blade */}
        <ScrollArea className={`${cfg.brandColor.replace("14%","20%").replace("16%","22%").replace("20%","26%").replace("30%","20%")} text-primary-foreground/85 text-xs py-2`}>
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
        <div className="bg-background p-4 text-sm">
          <Crumb simulator={simulator} navState={navState} />

          {/* Hint at the top of every blade */}
          <div className="mb-3 text-[11px] text-muted-foreground border-l-2 border-primary/40 pl-2">
            {helperHint}
          </div>

          <BladeBody
            simulator={simulator}
            navState={navState}
            fields={fields}
            setField={setField}
            expectedAction={expectedAction}
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

// ============= breadcrumb ===============
function Crumb({ simulator, navState }: { simulator: string; navState: string }) {
  return (
    <div className="breadcrumb-trail mb-3 text-xs">
      <span className="capitalize">{simulator}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground">{prettyNav(navState)}</span>
    </div>
  );
}

function prettyNav(id: string) {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============= blade body (renders a generic action panel) =============
function BladeBody({
  simulator, navState, fields, setField, expectedAction,
}: {
  simulator: string;
  navState: string;
  fields: Record<string, any>;
  setField: (k: string, v: any) => void;
  expectedAction: Action;
}) {
  const a = expectedAction;
  const TopVisual = TOP_VISUAL[simulator]?.[navState];

  return (
    <div className="space-y-4">
      {TopVisual ? <TopVisual /> : <DefaultBladeHeader simulator={simulator} navState={navState} />}

      {/* Action panel: rendered based on the expected_action contract */}
      {a?.type === "input" && a.field && (
        <Card className="p-3 space-y-2">
          <label className="text-xs font-medium block">
            {labelForField(a.field)}
          </label>
          <Input
            value={fields[a.field] ?? ""}
            onChange={(e) => setField(a.field!, e.target.value)}
            placeholder={String(a.value ?? "")}
          />
          <p className="text-[10px] text-muted-foreground">
            Tip: enter <code className="bg-muted px-1 rounded">{String(a.value ?? "")}</code> to satisfy this step.
          </p>
        </Card>
      )}

      {a?.type === "toggle" && a.field && (
        <Card className="p-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium">{labelForField(a.field)}</div>
            <div className="text-[11px] text-muted-foreground">
              Toggle this control to complete the step.
            </div>
          </div>
          <Switch
            checked={!!fields[a.field]}
            onCheckedChange={(v) => setField(a.field!, v)}
          />
        </Card>
      )}

      {a?.type === "navigate" && (
        <Card className="p-3 text-xs text-muted-foreground">
          You're on the right page once "{prettyNav(a.target ?? "")}" is highlighted in the sidebar.
        </Card>
      )}
    </div>
  );
}

function labelForField(field: string) {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function DefaultBladeHeader({ simulator, navState }: { simulator: string; navState: string }) {
  const Icon = ICON_FOR[simulator] ?? Shield;
  return (
    <div className="border border-border rounded p-3 bg-muted/40">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{prettyNav(navState)}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        Mock blade rendered for the simulator. Follow the action panel below to complete this step.
      </p>
    </div>
  );
}

const ICON_FOR: Record<string, any> = {
  defender: Shield, purview: Lock, sentinel: Server, generic: Brain,
};

// =================================================================
// Bespoke "rich" visuals for high-value blades. Each function returns
// the upper portion of the blade — the action panel still renders below.
// =================================================================
const TOP_VISUAL: Record<string, Record<string, () => JSX.Element>> = {
  defender: {
    incidents: () => (
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-[1fr_100px_120px_80px]">
          <span>Incident</span><span>Severity</span><span>Status</span><span>Assets</span>
        </div>
        {[
          { name: "Multi-stage attack on FIN-WS-04", sev: "High", status: "New", count: 12 },
          { name: "Lateral movement detected on HR-DC", sev: "High", status: "New", count: 8 },
          { name: "Phish wave from payroll-update.com", sev: "Medium", status: "Active", count: 87 },
        ].map((i) => (
          <div key={i.name} className="px-3 py-2 text-xs grid grid-cols-[1fr_100px_120px_80px] border-t border-border hover:bg-muted/30">
            <span className="truncate">{i.name}</span>
            <span><Badge variant={i.sev === "High" ? "destructive" : "secondary"}>{i.sev}</Badge></span>
            <span>{i.status}</span>
            <span>{i.count}</span>
          </div>
        ))}
      </Card>
    ),
    incident_detail: () => (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Incident · Multi-stage attack on FIN-WS-04</h3>
          <Badge variant="destructive">High</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Devices" value="1" />
          <Stat label="Users" value="3" />
          <Stat label="Mailboxes" value="2" />
        </div>
      </Card>
    ),
    attack_story: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Attack story</h3>
        <div className="flex items-center gap-2 text-xs">
          {["Recon","Initial access","Execution","Persistence","Lateral move","Exfil"].map((s) => (
            <span key={s} className="px-2 py-1 bg-primary-soft border border-primary/30 rounded">{s}</span>
          ))}
        </div>
      </Card>
    ),
    device: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">FIN-WS-04 · Windows 11</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="Risk" value="High" />
          <Stat label="Health" value="Active threats" />
          <Stat label="Onboarded" value="MDE" />
        </div>
      </Card>
    ),
    secure_score: () => (
      <Card className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-muted-foreground">Current Secure Score</div>
            <div className="text-2xl font-bold text-primary">62%</div>
          </div>
          <Trophy className="h-8 w-8 text-warning" />
        </div>
      </Card>
    ),
    email_explorer: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Email explorer · last 24h</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Stat label="Total" value="14,210" />
          <Stat label="Phish" value="312" />
          <Stat label="Malware" value="18" />
          <Stat label="ZAP" value="74" />
        </div>
      </Card>
    ),
    cloud_discovery: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Cloud discovery</h3>
        <div className="text-xs text-muted-foreground">847 cloud apps detected · 312 unsanctioned · 18 high-risk</div>
      </Card>
    ),
  },
  purview: {
    sensitivity_labels: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Sensitivity labels</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {["Public","Internal","Confidential","Highly Confidential"].map((l) => (
            <Badge key={l} variant="outline" className="justify-center py-1">{l}</Badge>
          ))}
        </div>
      </Card>
    ),
    retention: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Retention policies</h3>
        <div className="text-xs text-muted-foreground">3 active policies · covers Exchange, SharePoint, OneDrive, Teams</div>
      </Card>
    ),
    insider_risk: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Insider risk · alerts</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Stat label="High" value="2" />
          <Stat label="Med" value="9" />
          <Stat label="Low" value="34" />
        </div>
      </Card>
    ),
    ediscovery: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">eDiscovery cases</h3>
        <div className="text-xs text-muted-foreground">2 open cases · 1 on legal hold</div>
      </Card>
    ),
    compliance_manager: () => (
      <Card className="p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-muted-foreground">Compliance Score</div>
            <div className="text-2xl font-bold text-primary">71%</div>
          </div>
          <Layers className="h-8 w-8 text-primary" />
        </div>
      </Card>
    ),
  },
  sentinel: {
    hunting: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Hunting queries</h3>
        <div className="text-xs text-muted-foreground">214 built-in queries · 12 custom · MITRE ATT&CK aligned</div>
      </Card>
    ),
    logs: () => (
      <Card className="p-3 font-mono text-xs">
        <div className="text-muted-foreground">// KQL editor</div>
        <div>SigninLogs</div>
        <div>| where ResultType != 0</div>
        <div>| summarize count() by UserPrincipalName</div>
      </Card>
    ),
    incidents: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Open incidents</h3>
        <div className="text-xs text-muted-foreground">5 high · 12 medium · 31 low</div>
      </Card>
    ),
    playbooks: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2">Playbooks</h3>
        <div className="text-xs text-muted-foreground">3 deployed · powered by Azure Logic Apps</div>
      </Card>
    ),
  },
  generic: {
    home: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Concept lab</h3>
        <p className="text-xs text-muted-foreground">
          This lab tests core SC-900 understanding. Read the step prompt, then enter the requested value.
        </p>
      </Card>
    ),
    exercise: () => (
      <Card className="p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Exercise</h3>
        <p className="text-xs text-muted-foreground">
          Use the field below to record your answer.
        </p>
      </Card>
    ),
  },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
