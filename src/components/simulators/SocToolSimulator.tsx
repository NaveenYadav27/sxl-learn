/**
 * SocToolSimulator — single component that renders one of seven SOC-tool
 * simulators used across the Certified SOC Analyst (CSA) program.
 *
 * Tools (selected by the `tool` prop):
 *   - splunk      Splunk Enterprise — SPL search & dashboards
 *   - qradar      IBM QRadar — offense triage console
 *   - elastic     Elastic Stack — Kibana Discover (KQL filter)
 *   - misp        MISP — threat-intel events & IOC attributes
 *   - thehive     TheHive + Cortex — case management & observable enrichment
 *   - wireshark   Wireshark — PCAP packet list + display filter
 *   - suricata    Suricata + Zeek — eve.json alerts & conn.log feed
 *
 * All seven share the standard expected_action contract used by every other
 * simulator on the platform:
 *
 *   { type: "navigate",  to: "<viewId>" }
 *   { type: "click",     target: "<labelled-action>" }
 *   { type: "select",    target: "<field>", value?: "<value>" }
 *   { type: "run-query", contains?: "<substring>" }
 *   { type: "any" }
 *
 * Every learner action is recorded in a right-hand audit pane to mirror how
 * each real product surfaces analyst activity.
 */
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Activity, CheckCircle2, AlertTriangle, Database, Shield, Network,
  FileSearch, Briefcase, Layers, Tag, Eye, Filter, Play, Bug, Globe, ChevronRight,
} from "lucide-react";

export type SocTool =
  | "splunk" | "qradar" | "elastic" | "misp" | "thehive" | "wireshark" | "suricata";

interface Action {
  type?: string;
  to?: string;
  target?: string;
  value?: string;
  contains?: string;
  equals?: string;
  [key: string]: any;
}

interface Props {
  tool: SocTool;
  expectedAction: Action;
  onValidate: (ok: boolean) => void;
}

interface AuditEntry { at: string; action: string; detail: string; }

function ts() { return new Date().toTimeString().slice(0, 8); }

function matches(state: { view: string; action: string; value?: string }, expected: Action): boolean {
  if (!expected || expected.type === "any") return true;
  if (expected.type === "navigate" && expected.to)
    return state.view === expected.to && state.action === "navigate";
  if (expected.type === "click" && expected.target)
    return state.action === `click:${expected.target}`;
  if (expected.type === "select" && expected.target) {
    if (state.action !== `select:${expected.target}`) return false;
    if (!expected.value) return true;
    return (state.value ?? "").toLowerCase().includes(expected.value.toLowerCase());
  }
  if (expected.type === "run-query") {
    if (state.action !== "run-query") return false;
    const v = (state.value ?? "").toLowerCase();
    if (expected.contains) return v.includes(expected.contains.toLowerCase());
    if (expected.equals) return v === expected.equals.toLowerCase();
    return true;
  }
  return false;
}

const TOOL_META: Record<SocTool, {
  name: string; vendor: string; tagline: string; accent: string; icon: any;
}> = {
  splunk:    { name: "Splunk Enterprise",  vendor: "Splunk",    tagline: "Search Processing Language (SPL) console", accent: "text-shadowx-gold",    icon: Search },
  qradar:    { name: "IBM QRadar SIEM",    vendor: "IBM",       tagline: "Offense investigation console",            accent: "text-domain-security", icon: Shield },
  elastic:   { name: "Elastic — Kibana",   vendor: "Elastic",   tagline: "Discover • KQL filtering on indices",      accent: "text-shadowx-azure",   icon: Database },
  misp:      { name: "MISP",               vendor: "MISP-Project", tagline: "Threat intel sharing platform",         accent: "text-domain-entra",    icon: Tag },
  thehive:   { name: "TheHive + Cortex",   vendor: "StrangeBee", tagline: "Case management & observable enrichment", accent: "text-domain-compliance", icon: Briefcase },
  wireshark: { name: "Wireshark",          vendor: "Wireshark.org", tagline: "PCAP packet analyser",                 accent: "text-shadowx-azure",   icon: Network },
  suricata:  { name: "Suricata + Zeek",    vendor: "OISF",      tagline: "Network IDS — eve.json + conn.log",        accent: "text-domain-security", icon: FileSearch },
};

export function SocToolSimulator({ tool, expectedAction, onValidate }: Props) {
  const meta = TOOL_META[tool];
  const initialView = defaultView(tool);
  const [view, setView] = useState<string>(initialView);
  const [audit, setAudit] = useState<AuditEntry[]>([
    { at: ts(), action: `${tool}.session.start`, detail: `Opened ${meta.name} as analyst.shadowx` },
  ]);
  const [solved, setSolved] = useState(false);

  useEffect(() => { setSolved(false); }, [expectedAction]);

  function emit(action: string, detail: string, value?: string) {
    setAudit((a) => [...a, { at: ts(), action, detail }]);
    if (!solved && matches({ view, action, value }, expectedAction)) {
      setSolved(true);
      setAudit((a) => [...a, { at: ts(), action: "lab.step.complete", detail: "✔ Step objective met." }]);
      setTimeout(() => onValidate(true), 350);
    }
  }

  function navigate(v: string, label: string) {
    setView(v);
    setAudit((a) => [...a, { at: ts(), action: "navigate", detail: `Opened ${label}` }]);
    if (!solved && matches({ view: v, action: "navigate" }, expectedAction)) {
      setSolved(true);
      setAudit((a) => [...a, { at: ts(), action: "lab.step.complete", detail: "✔ Step objective met." }]);
      setTimeout(() => onValidate(true), 350);
    }
  }

  const expectedHint = useMemo(() => {
    if (!expectedAction) return "";
    if (expectedAction.type === "navigate") return `Open the ${expectedAction.to} view`;
    if (expectedAction.type === "click")    return `Click "${expectedAction.target}"`;
    if (expectedAction.type === "select")   return `Set ${expectedAction.target} → ${expectedAction.value ?? "any"}`;
    if (expectedAction.type === "run-query")return `Run a query ${expectedAction.contains ? `containing "${expectedAction.contains}"` : ""}`;
    if (expectedAction.type === "any")      return "Free exploration — any action will pass.";
    return "";
  }, [expectedAction]);

  const Icon = meta.icon;

  return (
    <Card className="overflow-hidden border-0 shadow-card">
      {/* Top bar */}
      <div className="flex items-center gap-2 bg-[hsl(220_15%_10%)] text-foreground px-3 py-2 border-b border-border">
        <Icon className={`h-4 w-4 ${meta.accent}`} />
        <span className="font-display text-sm font-semibold tracking-wide">{meta.name}</span>
        <Badge variant="outline" className="text-[10px] font-mono">{meta.vendor}</Badge>
        <span className="text-[10px] text-muted-foreground hidden md:inline ml-1">{meta.tagline}</span>
        <div className="flex-1" />
        {expectedHint && (
          <Badge variant="outline" className="text-[10px] gap-1 max-w-[280px] truncate">
            <Activity className="h-3 w-3" /> {expectedHint}
          </Badge>
        )}
        {solved && (
          <Badge className="bg-success/15 text-success border-success/30 text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Solved
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[180px_1fr_240px] min-h-[480px] bg-background">
        {/* LEFT navigation rail */}
        <ScrollArea className="border-r border-border bg-card">
          <div className="p-2 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
              {meta.vendor}
            </div>
            {navItemsFor(tool).map((it) => {
              const ItemIcon = it.icon;
              const active = it.id === view;
              return (
                <button
                  key={it.id}
                  onClick={() => navigate(it.id, it.label)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors ${
                    active ? "bg-primary-soft border border-primary/40 font-medium" : "hover:bg-muted"
                  }`}
                >
                  <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${meta.accent}`} />
                  <span className="truncate">{it.label}</span>
                  {active && <ChevronRight className="h-3 w-3 ml-auto text-primary" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* CENTER tool view */}
        <main className="overflow-auto p-4">
          <ToolView tool={tool} view={view} emit={emit} />
        </main>

        {/* RIGHT audit log */}
        <aside className="border-l border-border bg-card overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {tool === "wireshark" ? "Capture log" : tool === "thehive" ? "Case audit trail" : "Analyst activity"}
            </div>
            <div className="text-[10px] text-muted-foreground">Live actions in this session</div>
          </div>
          <ScrollArea className="flex-1">
            <ul className="p-2 space-y-1.5 text-[11px] font-mono">
              {audit.map((e, i) => (
                <li key={i} className="leading-snug">
                  <span className="text-muted-foreground">{e.at} </span>
                  <span className={meta.accent}>{e.action}</span>
                  <div className="text-foreground/85 pl-2 break-words">{e.detail}</div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>
      </div>
    </Card>
  );
}

/* ---------- per-tool navigation ---------- */
function defaultView(tool: SocTool): string {
  switch (tool) {
    case "splunk":    return "search";
    case "qradar":    return "offenses";
    case "elastic":   return "discover";
    case "misp":      return "events";
    case "thehive":   return "cases";
    case "wireshark": return "capture";
    case "suricata":  return "alerts";
  }
}

function navItemsFor(tool: SocTool): { id: string; label: string; icon: any }[] {
  switch (tool) {
    case "splunk": return [
      { id: "search",     label: "Search & Reporting", icon: Search },
      { id: "dashboards", label: "Dashboards",         icon: Layers },
      { id: "alerts",     label: "Alerts",             icon: AlertTriangle },
    ];
    case "qradar": return [
      { id: "offenses",  label: "Offenses",       icon: Shield },
      { id: "log-activity", label: "Log Activity", icon: FileSearch },
      { id: "rules",     label: "Rules",          icon: Filter },
    ];
    case "elastic": return [
      { id: "discover",   label: "Discover",      icon: Search },
      { id: "dashboards", label: "Dashboards",    icon: Layers },
      { id: "rules",      label: "Detection rules", icon: Filter },
    ];
    case "misp": return [
      { id: "events",  label: "Events",     icon: Tag },
      { id: "attributes", label: "Attributes", icon: Layers },
      { id: "feeds",   label: "Feeds",      icon: Globe },
    ];
    case "thehive": return [
      { id: "cases",       label: "Cases",       icon: Briefcase },
      { id: "tasks",       label: "Tasks",       icon: Layers },
      { id: "observables", label: "Observables", icon: Eye },
    ];
    case "wireshark": return [
      { id: "capture",    label: "Live capture", icon: Network },
      { id: "statistics", label: "Statistics",   icon: Layers },
    ];
    case "suricata": return [
      { id: "alerts",   label: "Alerts (eve)", icon: AlertTriangle },
      { id: "conn-log", label: "Zeek conn.log", icon: Network },
      { id: "rules",    label: "Rules",        icon: Filter },
    ];
  }
}

/* ---------- shared building blocks ---------- */
type Emit = (action: string, detail: string, value?: string) => void;

function PageHeader({ icon: Icon, title, subtitle, accent }: { icon: any; title: string; subtitle: string; accent?: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div className="h-10 w-10 rounded bg-primary-soft grid place-items-center">
        <Icon className={`h-5 w-5 ${accent ?? "text-primary"}`} />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function DataTable({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  return (
    <Card className="p-2">
      <table className="w-full text-xs">
        <thead className="text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className="text-left py-1 px-1">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((v, j) => <td key={j} className="py-1.5 px-1 font-mono">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---------- per-tool views ---------- */
function ToolView({ tool, view, emit }: { tool: SocTool; view: string; emit: Emit }) {
  if (tool === "splunk")    return <SplunkView view={view} emit={emit} />;
  if (tool === "qradar")    return <QRadarView view={view} emit={emit} />;
  if (tool === "elastic")   return <ElasticView view={view} emit={emit} />;
  if (tool === "misp")      return <MispView view={view} emit={emit} />;
  if (tool === "thehive")   return <TheHiveView view={view} emit={emit} />;
  if (tool === "wireshark") return <WiresharkView view={view} emit={emit} />;
  return <SuricataView view={view} emit={emit} />;
}

/* ============== SPLUNK ============== */
function SplunkView({ view, emit }: { view: string; emit: Emit }) {
  const [spl, setSpl] = useState('index=main sourcetype=auth | stats count by user');
  if (view === "search") {
    return (
      <>
        <PageHeader icon={Search} title="Search & Reporting" subtitle="Run SPL across index=main · last 24h" accent="text-shadowx-gold" />
        <div className="space-y-2">
          <Textarea value={spl} onChange={(e) => setSpl(e.target.value)} className="font-mono text-xs h-24" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => emit("run-query", `Ran SPL: ${spl}`, spl)}><Play className="h-3 w-3 mr-1" /> Run search</Button>
            <Button size="sm" variant="outline" onClick={() => emit("click:save-as-alert", "Saved as alert")}>Save as alert</Button>
          </div>
        </div>
        <div className="mt-3">
          <DataTable
            cols={["_time", "user", "src_ip", "action", "count"]}
            rows={[
              ["10:14:02", "dave",  "198.51.100.7", "login_failed", 12],
              ["10:14:18", "dave",  "198.51.100.7", "login_success", 1],
              ["10:15:01", "ivy",   "203.0.113.42", "login_success", 1],
              ["10:18:22", "alice", "203.0.113.42", "login_success", 1],
            ]}
          />
        </div>
      </>
    );
  }
  if (view === "dashboards") {
    return (
      <>
        <PageHeader icon={Layers} title="Security Posture" subtitle="Out-of-the-box Splunk Enterprise Security dashboard" accent="text-shadowx-gold" />
        <div className="grid grid-cols-3 gap-2">
          {["Notable events: 14", "Risk score: 482", "MTTR: 32m"].map((s) => (
            <Card key={s} className="p-3 text-xs font-semibold">{s}</Card>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={() => emit("click:open-notable", "Opened notable event #14021")}>
          Open top notable event
        </Button>
      </>
    );
  }
  return (
    <>
      <PageHeader icon={AlertTriangle} title="Saved alerts" subtitle="Scheduled SPL searches" accent="text-shadowx-gold" />
      <DataTable
        cols={["Title", "Schedule", "Severity", "Last fired"]}
        rows={[
          ["Brute force - failed logons > 10 / 5m", "*/5 * * * *", "high",   "2m ago"],
          ["Impossible travel",                      "*/15 * * * *","high",  "11m ago"],
          ["Unusual process - powershell encoded",  "*/10 * * * *","medium","27m ago"],
        ]}
      />
    </>
  );
}

/* ============== QRADAR ============== */
function QRadarView({ view, emit }: { view: string; emit: Emit }) {
  if (view === "offenses") {
    return (
      <>
        <PageHeader icon={Shield} title="Offenses" subtitle="Correlated incidents ranked by magnitude" accent="text-domain-security" />
        <DataTable
          cols={["ID", "Description", "Magnitude", "Source IP", "Status"]}
          rows={[
            [1042, "Multiple Login Failures Followed by Success", 9, "198.51.100.7", "Open"],
            [1041, "Communication with known C2 server",          8, "192.0.2.66",   "Open"],
            [1039, "Privileged account abuse",                    7, "10.0.4.15",    "Hidden"],
          ]}
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => emit("click:investigate-offense-1042", "Investigated offense 1042")}>Investigate 1042</Button>
          <Button size="sm" variant="outline" onClick={() => emit("click:close-offense", "Closed offense as benign")}>Close offense</Button>
        </div>
      </>
    );
  }
  if (view === "log-activity") {
    return (
      <>
        <PageHeader icon={FileSearch} title="Log Activity" subtitle="AQL view across DSMs" accent="text-domain-security" />
        <DataTable
          cols={["Time", "Log source", "Event name", "Username", "Source IP"]}
          rows={[
            ["10:14:02", "Windows AD",      "Logon Failure",         "dave",  "198.51.100.7"],
            ["10:14:18", "Windows AD",      "Logon Success",         "dave",  "198.51.100.7"],
            ["10:15:00", "Palo Alto FW",    "Threat (C2)",           "-",     "192.0.2.66"],
            ["10:17:12", "M365 AuditLog",   "MailItemsAccessed",     "ivy",   "203.0.113.99"],
          ]}
        />
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Filter} title="Custom Rules" subtitle="QRadar correlation rules" accent="text-domain-security" />
      <DataTable
        cols={["Rule", "Group", "Enabled"]}
        rows={[
          ["BB:CategoryDefinition: Authentication Failures", "Auth", "Yes"],
          ["Excessive Authentication Failures from same IP", "Auth", "Yes"],
          ["Successful Logon After Multiple Failures",       "Auth", "Yes"],
        ]}
      />
    </>
  );
}

/* ============== ELASTIC / KIBANA ============== */
function ElasticView({ view, emit }: { view: string; emit: Emit }) {
  const [kql, setKql] = useState('event.action : "logon-failed" and source.ip : "198.51.100.7"');
  if (view === "discover") {
    return (
      <>
        <PageHeader icon={Search} title="Discover" subtitle="Index pattern: winlogbeat-*" accent="text-shadowx-azure" />
        <div className="flex gap-2 mb-3">
          <Input value={kql} onChange={(e) => setKql(e.target.value)} className="font-mono text-xs" />
          <Button size="sm" onClick={() => emit("run-query", `KQL filter: ${kql}`, kql)}>Refresh</Button>
        </div>
        <DataTable
          cols={["@timestamp", "event.action", "user.name", "source.ip", "winlog.event_id"]}
          rows={[
            ["10:14:02", "logon-failed",  "dave", "198.51.100.7", 4625],
            ["10:14:08", "logon-failed",  "dave", "198.51.100.7", 4625],
            ["10:14:18", "logon-success", "dave", "198.51.100.7", 4624],
          ]}
        />
      </>
    );
  }
  if (view === "dashboards") {
    return (
      <>
        <PageHeader icon={Layers} title="SIEM Overview" subtitle="Elastic Security pre-built dashboard" accent="text-shadowx-azure" />
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-xs">Hosts: 124</Card>
          <Card className="p-3 text-xs">Detections (24h): 38</Card>
          <Card className="p-3 text-xs">Alerts: open 11 / closed 27</Card>
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Filter} title="Detection rules" subtitle="Elastic prebuilt + custom rules" accent="text-shadowx-azure" />
      <DataTable
        cols={["Rule", "Severity", "Enabled"]}
        rows={[
          ["Suspicious PowerShell Encoded Command", "high",   "Yes"],
          ["Impossible travel via Okta",            "high",   "Yes"],
          ["Linux: persistence via cron",           "medium", "Yes"],
        ]}
      />
    </>
  );
}

/* ============== MISP ============== */
function MispView({ view, emit }: { view: string; emit: Emit }) {
  if (view === "events") {
    return (
      <>
        <PageHeader icon={Tag} title="Events" subtitle="Threat-intel events shared with your community" accent="text-domain-entra" />
        <DataTable
          cols={["ID", "Info", "Threat", "Tags", "Date"]}
          rows={[
            [4421, "APT-XYZ phishing wave Q2",   "high",   "tlp:amber, apt-xyz", "2026-04-22"],
            [4420, "Emotet C2 cluster",          "medium", "tlp:green, emotet",  "2026-04-21"],
            [4418, "Credential dump - retail",   "high",   "tlp:red, leak",      "2026-04-20"],
          ]}
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => emit("click:open-event-4421", "Opened event 4421")}>Open event 4421</Button>
          <Button size="sm" variant="outline" onClick={() => emit("click:publish-event", "Published event to community")}>Publish</Button>
        </div>
      </>
    );
  }
  if (view === "attributes") {
    return (
      <>
        <PageHeader icon={Layers} title="Attributes (IOCs)" subtitle="Indicators inside event 4421" accent="text-domain-entra" />
        <DataTable
          cols={["Type", "Value", "IDS", "Comment"]}
          rows={[
            ["url",     "http://login-contoso[.]secure-id[.]xyz/auth", "Yes", "Phishing landing"],
            ["sha256",  "f3a9b2…b71e",                                  "Yes", "Stage-2 loader"],
            ["ip-dst",  "192.0.2.66",                                   "Yes", "C2 server"],
            ["email",   "cfo-contoso@protonmail.com",                   "No",  "Spoofed sender"],
          ]}
        />
        <Button size="sm" className="mt-3" onClick={() => emit("click:export-stix", "Exported attributes as STIX 2.1")}>
          Export as STIX 2.1
        </Button>
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Globe} title="Feeds" subtitle="Subscribed intel feeds" accent="text-domain-entra" />
      <DataTable
        cols={["Provider", "Format", "Enabled", "Last pull"]}
        rows={[
          ["CIRCL OSINT",       "MISP",  "Yes", "12m ago"],
          ["abuse.ch URLhaus",  "CSV",   "Yes", "1h ago"],
          ["AlienVault OTX",    "STIX",  "Yes", "3h ago"],
        ]}
      />
    </>
  );
}

/* ============== THEHIVE ============== */
function TheHiveView({ view, emit }: { view: string; emit: Emit }) {
  const [severity, setSeverity] = useState("Medium");
  if (view === "cases") {
    return (
      <>
        <PageHeader icon={Briefcase} title="Cases" subtitle="Active incident investigations" accent="text-domain-compliance" />
        <DataTable
          cols={["#", "Title", "Severity", "Status", "Owner"]}
          rows={[
            [114, "Phishing — Finance team",   "High",   "Open",     "alice"],
            [113, "Atypical travel — dave",    "High",   "Open",     "bob"],
            [112, "Suspicious binary on mac",  "Medium", "Containment","frank"],
          ]}
        />
        <Card className="mt-3 p-3 space-y-2">
          <div className="text-xs font-semibold">Create new case</div>
          <Input placeholder="Title" defaultValue="Suspicious sign-in from Tor" className="text-xs h-8" />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Severity</label>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); emit("select:severity", `Severity → ${e.target.value}`, e.target.value); }}
              className="w-full mt-1 rounded border border-border bg-background text-xs px-2 py-1.5"
            >
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
          <Button size="sm" onClick={() => emit("click:create-case", `Created case (sev=${severity})`)}>Create case</Button>
        </Card>
      </>
    );
  }
  if (view === "tasks") {
    return (
      <>
        <PageHeader icon={Layers} title="Tasks" subtitle="Tasks assigned across open cases" accent="text-domain-compliance" />
        <DataTable
          cols={["Case", "Task", "Assignee", "Status"]}
          rows={[
            [114, "Identify all recipients",    "alice", "InProgress"],
            [114, "Block sender at gateway",    "frank", "Waiting"],
            [113, "Reset password for dave",    "bob",   "Completed"],
            [112, "Isolate DAVE-MACBOOK",       "frank", "InProgress"],
          ]}
        />
        <Button size="sm" className="mt-3" onClick={() => emit("click:close-task", "Closed task: Block sender at gateway")}>
          Close selected task
        </Button>
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Eye} title="Observables" subtitle="IOCs attached to cases (Cortex enrichment available)" accent="text-domain-compliance" />
      <DataTable
        cols={["Type", "Data", "TLP", "Cortex"]}
        rows={[
          ["url",    "http://login-contoso[.]secure-id[.]xyz/auth", "AMBER", "VirusTotal: 38/72"],
          ["ip",     "192.0.2.66",                                   "AMBER", "AbuseIPDB: 92/100"],
          ["domain", "secure-id[.]xyz",                              "AMBER", "WHOIS: 3 days old"],
        ]}
      />
      <Button size="sm" className="mt-3" onClick={() => emit("click:run-cortex", "Ran Cortex analyzers on all observables")}>
        Run all analyzers
      </Button>
    </>
  );
}

/* ============== WIRESHARK ============== */
function WiresharkView({ view, emit }: { view: string; emit: Emit }) {
  const [filter, setFilter] = useState("http.request.method == \"POST\"");
  if (view === "capture") {
    return (
      <>
        <PageHeader icon={Network} title="Live capture — eth0" subtitle="phishing-investigation.pcapng (12,481 packets)" accent="text-shadowx-azure" />
        <div className="flex gap-2 mb-3">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} className="font-mono text-xs" placeholder="Display filter" />
          <Button size="sm" onClick={() => emit("run-query", `Applied display filter: ${filter}`, filter)}>Apply</Button>
        </div>
        <DataTable
          cols={["No.", "Time", "Source", "Destination", "Protocol", "Info"]}
          rows={[
            [4012, "1.214s", "10.0.1.42",    "192.0.2.66",     "TCP",  "49214 → 443 [SYN]"],
            [4013, "1.218s", "192.0.2.66",   "10.0.1.42",      "TCP",  "443 → 49214 [SYN, ACK]"],
            [4019, "1.402s", "10.0.1.42",    "192.0.2.66",     "TLSv1.3", "Client Hello"],
            [4051, "2.118s", "10.0.1.42",    "192.0.2.66",     "HTTP", "POST /collect HTTP/1.1"],
          ]}
        />
        <Card className="mt-3 p-3 font-mono text-[11px] space-y-0.5">
          <div className="text-muted-foreground">▼ Frame 4051: 482 bytes on wire</div>
          <div className="text-muted-foreground">▼ Ethernet II, Src: aa:bb:cc:11:22:33</div>
          <div className="text-muted-foreground">▼ Internet Protocol Version 4, Src: 10.0.1.42, Dst: 192.0.2.66</div>
          <div className="text-muted-foreground">▼ Transmission Control Protocol, Src Port: 49214</div>
          <div className="text-shadowx-gold">▼ Hypertext Transfer Protocol</div>
          <div className="pl-3">POST /collect HTTP/1.1</div>
          <div className="pl-3">Host: secure-id.xyz</div>
          <div className="pl-3">User-Agent: Mozilla/5.0 (...)</div>
          <div className="pl-3 text-destructive">Cookie: session=ZXhmaWx0cmF0ZWQ=</div>
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Layers} title="Statistics → Conversations" subtitle="Top talkers in this capture" accent="text-shadowx-azure" />
      <DataTable
        cols={["Address A", "Address B", "Packets", "Bytes", "Duration"]}
        rows={[
          ["10.0.1.42",  "192.0.2.66",  "1,214", "918 KB", "00:02:14"],
          ["10.0.1.42",  "8.8.8.8",     "12",    "1.2 KB", "00:00:01"],
          ["10.0.1.42",  "20.42.65.84", "884",   "612 KB", "00:01:48"],
        ]}
      />
    </>
  );
}

/* ============== SURICATA + ZEEK ============== */
function SuricataView({ view, emit }: { view: string; emit: Emit }) {
  if (view === "alerts") {
    return (
      <>
        <PageHeader icon={AlertTriangle} title="eve.json — alerts" subtitle="Suricata IDS alerts (last 5 min)" accent="text-domain-security" />
        <Card className="p-3 font-mono text-[11px] space-y-1">
          <div className="text-shadowx-gold">{"{"}</div>
          <div className="pl-3">"event_type": "alert",</div>
          <div className="pl-3">"src_ip": "10.0.1.42",</div>
          <div className="pl-3">"dest_ip": "192.0.2.66",</div>
          <div className="pl-3">"alert": {"{"}</div>
          <div className="pl-6">"signature": "ET MALWARE Generic C2 Beacon", "severity": 1, "category": "trojan-activity"</div>
          <div className="pl-3">{"}"}</div>
          <div className="text-shadowx-gold">{"}"}</div>
        </Card>
        <DataTable
          cols={["Time", "Signature", "Sev", "Src", "Dst"]}
          rows={[
            ["10:18:22", "ET MALWARE Generic C2 Beacon",      1, "10.0.1.42", "192.0.2.66"],
            ["10:18:25", "ET POLICY DNS Query for .xyz TLD",  3, "10.0.1.42", "8.8.8.8"],
            ["10:19:01", "ET SCAN Possible Nmap User-Agent",  2, "203.0.113.7", "10.0.1.5"],
          ]}
        />
        <Button size="sm" className="mt-3" onClick={() => emit("click:tag-as-malicious", "Tagged source IP as malicious in TI feed")}>
          Tag source as malicious
        </Button>
      </>
    );
  }
  if (view === "conn-log") {
    return (
      <>
        <PageHeader icon={Network} title="Zeek conn.log" subtitle="All TCP/UDP connections seen on the wire" accent="text-domain-security" />
        <DataTable
          cols={["ts", "id.orig_h", "id.resp_h", "service", "duration", "bytes"]}
          rows={[
            ["10:18:22", "10.0.1.42", "192.0.2.66", "ssl",  "00:02:14", "918K"],
            ["10:18:25", "10.0.1.42", "8.8.8.8",    "dns",  "00:00:01", "1.2K"],
            ["10:18:30", "10.0.1.42", "20.42.65.84","ssl",  "00:01:48", "612K"],
          ]}
        />
      </>
    );
  }
  return (
    <>
      <PageHeader icon={Filter} title="Suricata rules" subtitle="Loaded rule files (Emerging Threats Open)" accent="text-domain-security" />
      <DataTable
        cols={["Rule file", "Rules", "Enabled"]}
        rows={[
          ["emerging-malware.rules", "12,481", "Yes"],
          ["emerging-policy.rules",  "3,914",  "Yes"],
          ["emerging-scan.rules",    "884",    "Yes"],
        ]}
      />
    </>
  );
}
