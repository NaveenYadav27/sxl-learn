/**
 * EntraSimulator — interactive twin of the Microsoft Entra admin center.
 * Renders a fake portal blade for the current step and reports back when
 * the learner completes the expected_action contract.
 *
 * Supported expected_action types (see lab_steps.expected_action):
 *  - { type: "navigate", target }
 *  - { type: "input", field, equals }
 *  - { type: "select", field, equals }
 *  - { type: "multi-select", field, required_includes: string[] }
 *  - { type: "toggle", field, equals }
 *  - { type: "validate", tool, expected_result }
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, Shield, Users, Network, Building2, Settings as SettingsIcon,
  Activity, BookOpen, Search, Bell, HelpCircle, Plus, Eye, CheckCircle2, AlertCircle,
} from "lucide-react";

interface Action {
  type: string;
  target?: string;
  field?: string;
  equals?: any;
  required_includes?: string[];
  tool?: string;
  expected_result?: string;
}

interface SimState {
  navState: string;                       // current portal "page"
  policyName: string;
  directoryRoles: string[];
  targetResources: string;
  requireMfa: boolean;
  enabled: boolean;
  whatIfRun: boolean;
}

const initialState: SimState = {
  navState: "home",
  policyName: "",
  directoryRoles: [],
  targetResources: "",
  requireMfa: false,
  enabled: false,
  whatIfRun: false,
};

const ALL_ROLES = [
  "Global Administrator", "Privileged Role Administrator", "Security Administrator",
  "Conditional Access Administrator", "User Administrator", "Helpdesk Administrator",
  "Billing Administrator",
];

interface Props {
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
}

export function EntraSimulator({ expectedAction, onValidate }: Props) {
  const [state, setState] = useState<SimState>(initialState);
  const [validated, setValidated] = useState(false);

  // Re-evaluate validation on every state change for the current step
  useEffect(() => {
    setValidated(false);
  }, [expectedAction]);

  function check(s: SimState): boolean {
    const a = expectedAction;
    switch (a.type) {
      case "navigate":
        return s.navState === a.target;
      case "input":
        return (s as any)[a.field!] === a.equals;
      case "select":
        return (s as any)[a.field!] === a.equals;
      case "multi-select": {
        const arr = (s as any)[a.field!] as string[];
        return (a.required_includes ?? []).every((r) => arr.includes(r));
      }
      case "toggle":
        return Boolean((s as any)[a.field!]) === Boolean(a.equals);
      case "validate":
        return s.whatIfRun;
      default: return false;
    }
  }

  function update(patch: Partial<SimState>) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (!validated && check(next)) {
        setValidated(true);
        onValidate(true);
      }
      return next;
    });
  }

  // ============ PORTAL CHROME ============
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-elevated">
      {/* Top bar - Microsoft style */}
      <div className="bg-[hsl(220,26%,14%)] text-primary-foreground flex items-center px-3 h-10 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 grid place-items-center bg-primary rounded-sm">
            <Shield className="h-3 w-3" />
          </div>
          <span className="font-semibold">Microsoft Entra admin center</span>
          <Badge variant="outline" className="border-warning/40 text-warning bg-warning/10 text-[9px] uppercase tracking-wider">Simulator</Badge>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white/10 rounded px-3 py-1 flex items-center gap-2 w-72 max-w-full">
            <Search className="h-3 w-3 opacity-70" />
            <span className="text-white/60">Search resources, services…</span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-80">
          <Bell className="h-3.5 w-3.5" />
          <SettingsIcon className="h-3.5 w-3.5" />
          <HelpCircle className="h-3.5 w-3.5" />
          <div className="h-6 w-6 rounded-full bg-primary-glow grid place-items-center text-[10px] font-semibold">PR</div>
        </div>
      </div>

      <div className="grid grid-cols-[200px_1fr] min-h-[480px]">
        {/* Left blade nav */}
        <div className="bg-[hsl(220,22%,20%)] text-primary-foreground/85 text-xs py-2">
          <NavItem icon={Activity} label="Overview"  active={state.navState === "entra-overview"} onClick={() => update({ navState: "entra-overview" })}/>
          <NavSection label="Identity" />
          <NavItem icon={Users} label="Users" />
          <NavItem icon={Building2} label="Groups" />
          <NavItem icon={Network} label="External Identities" />
          <NavSection label="Protection" />
          <NavItem icon={Shield} label="Conditional Access"
            active={state.navState === "ca-policies" || state.navState === "ca-create"}
            onClick={() => update({ navState: "ca-policies" })} />
          <NavItem icon={Eye} label="Identity Protection" />
          <NavSection label="Monitoring" />
          <NavItem icon={Activity} label="Sign-in logs" />
          <NavItem icon={BookOpen} label="Audit logs" />
        </div>

        {/* Main content blade */}
        <div className="bg-background p-4 text-sm">
          {state.navState === "home" && <HomeBlade onOpenEntra={() => update({ navState: "entra-overview" })} />}
          {state.navState === "entra-overview" && <OverviewBlade onOpenCA={() => update({ navState: "ca-policies" })} />}
          {state.navState === "ca-policies" && <PoliciesBlade onCreate={() => update({ navState: "ca-create" })} />}
          {state.navState === "ca-create" && (
            <CreatePolicyBlade
              state={state}
              update={update}
              onWhatIf={() => update({ whatIfRun: true })}
            />
          )}
          {state.navState === "ca-done" && <DoneBlade />}

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

// ============ NAV ============
function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-white/5 ${active ? "bg-primary/30 border-l-2 border-primary-glow" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}
function NavSection({ label }: { label: string }) {
  return <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-white/50">{label}</div>;
}

// ============ BLADES ============
function HomeBlade({ onOpenEntra }: { onOpenEntra: () => void }) {
  return (
    <div>
      <div className="breadcrumb-trail mb-3"><span>Home</span></div>
      <h2 className="text-lg font-semibold mb-3">Microsoft Entra admin center</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
        <Tile icon={Shield} label="Microsoft Entra ID" onClick={onOpenEntra} highlight />
        <Tile icon={Users} label="Users" />
        <Tile icon={Building2} label="Enterprise apps" />
        <Tile icon={Network} label="App registrations" />
        <Tile icon={Activity} label="Sign-in logs" />
        <Tile icon={Eye} label="Identity Protection" />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, onClick, highlight }: any) {
  return (
    <button
      onClick={onClick}
      className={`portal-blade p-3 text-left hover:shadow-portal transition-shadow ${highlight ? "ring-2 ring-primary/60" : ""}`}
    >
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-sm font-medium">{label}</div>
    </button>
  );
}

function OverviewBlade({ onOpenCA }: { onOpenCA: () => void }) {
  return (
    <div>
      <div className="breadcrumb-trail mb-3"><span>Home</span><ChevronRight className="h-3 w-3" /><span className="text-foreground">Microsoft Entra ID</span></div>
      <h2 className="text-lg font-semibold mb-3">Contoso Bank India · Overview</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Card className="p-3"><div className="text-xs text-muted-foreground">Tenant</div><div className="font-medium">contosobank.onmicrosoft.com</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">License</div><div className="font-medium">Microsoft 365 E5</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Users</div><div className="font-medium">847</div></Card>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Now expand <strong>Protection</strong> in the left nav and click <strong>Conditional Access</strong>.</div>
      <Button size="sm" variant="outline" onClick={onOpenCA}>Open Conditional Access →</Button>
    </div>
  );
}

function PoliciesBlade({ onCreate }: { onCreate: () => void }) {
  return (
    <div>
      <div className="breadcrumb-trail mb-3">
        <span>Home</span><ChevronRight className="h-3 w-3" />
        <span>Entra ID</span><ChevronRight className="h-3 w-3" />
        <span>Protection</span><ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Conditional Access</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Conditional Access · Policies</h2>
        <Button size="sm" onClick={onCreate}><Plus className="h-3 w-3 mr-1" />New policy</Button>
      </div>
      <div className="border border-border rounded">
        <div className="bg-muted/50 px-3 py-2 text-xs font-medium grid grid-cols-3">
          <span>Name</span><span>State</span><span>Created</span>
        </div>
        <div className="px-3 py-6 text-center text-xs text-muted-foreground">No policies yet. Create your first one.</div>
      </div>
    </div>
  );
}

function CreatePolicyBlade({ state, update, onWhatIf }: any) {
  return (
    <div>
      <div className="breadcrumb-trail mb-3">
        <span>Home</span><ChevronRight className="h-3 w-3" />
        <span>Conditional Access</span><ChevronRight className="h-3 w-3" />
        <span className="text-foreground">New policy</span>
      </div>
      <h2 className="text-lg font-semibold mb-3">New Conditional Access policy</h2>

      <div className="space-y-4 max-w-2xl">
        <Field label="Name *">
          <Input value={state.policyName} onChange={(e: any) => update({ policyName: e.target.value })} placeholder="CA001 - Require MFA for Admins" />
        </Field>

        <Section title="Assignments → Users">
          <div className="text-xs text-muted-foreground mb-2">Include &gt; Directory roles</div>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox
                  checked={state.directoryRoles.includes(r)}
                  onCheckedChange={(v) => {
                    const next = v
                      ? [...state.directoryRoles, r]
                      : state.directoryRoles.filter((x: string) => x !== r);
                    update({ directoryRoles: next });
                  }}
                />
                {r}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Target resources">
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tr" checked={state.targetResources === "all_cloud_apps"} onChange={() => update({ targetResources: "all_cloud_apps" })}/>
              All cloud apps
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tr" checked={state.targetResources === "selected"} onChange={() => update({ targetResources: "selected" })}/>
              Select apps
            </label>
          </div>
        </Section>

        <Section title="Access controls → Grant">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={state.requireMfa} onCheckedChange={(v) => update({ requireMfa: !!v })}/>
            Require multifactor authentication
          </label>
        </Section>

        <Section title="Enable policy">
          <div className="flex items-center gap-3">
            <Switch checked={state.enabled} onCheckedChange={(v) => update({ enabled: v })} />
            <span className="text-xs">{state.enabled ? "On" : "Report-only"}</span>
          </div>
        </Section>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button size="sm" variant="outline" onClick={onWhatIf}>
            <Eye className="h-3 w-3 mr-1" /> What If — simulate priya@contosobank.in
          </Button>
          {state.whatIfRun && (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3 w-3" /> Policy WOULD apply
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DoneBlade() {
  return <div className="text-success text-sm">Done.</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium block mb-1">{label}</label>{children}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded p-3">
      <div className="text-xs font-semibold mb-2 text-foreground">{title}</div>
      {children}
    </div>
  );
}
