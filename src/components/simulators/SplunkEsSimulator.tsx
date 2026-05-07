/**
 * SplunkEsSimulator — full Splunk Enterprise Security mimic.
 *
 * Views: search, security-posture, incident-review, risk-analysis,
 *        investigation, glass-tables, assets-identities, threat-intel,
 *        correlation-searches, dashboards.
 *
 * Contract (matches every other simulator on the platform):
 *   { type: "navigate",  to: "<viewId>" }
 *   { type: "click",     target: "<labelled-action>" }
 *   { type: "select",    target: "<field>", value?: "<value>" }
 *   { type: "run-spl",   contains?: "<substring>" }
 *   { type: "any" }
 */
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Gauge,
  ListChecks, FlaskConical, Layers, Database, Users, Globe, Workflow,
  ChevronRight, Play, Bug, FileSearch, Tag,
} from "lucide-react";

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
  if (expected.type === "run-spl" || expected.type === "run-query") {
    if (state.action !== "run-spl") return false;
    const v = (state.value ?? "").toLowerCase();
    if (expected.contains) return v.includes(expected.contains.toLowerCase());
    if (expected.equals) return v === expected.equals.toLowerCase();
    return true;
  }
  return false;
}

const NAV_GROUPS: { label: string; items: { id: string; label: string; icon: any }[] }[] = [
  {
    label: "Splunk Core",
    items: [
      { id: "search", label: "Search & Reporting", icon: Search },
      { id: "dashboards", label: "Dashboards", icon: Layers },
    ],
  },
  {
    label: "Enterprise Security",
    items: [
      { id: "security-posture", label: "Security Posture", icon: Gauge },
      { id: "incident-review", label: "Incident Review", icon: AlertTriangle },
      { id: "risk-analysis", label: "Risk Analysis", icon: ShieldCheck },
      { id: "investigation", label: "Investigations", icon: FileSearch },
      { id: "glass-tables", label: "Glass Tables", icon: Layers },
    ],
  },
  {
    label: "Configure",
    items: [
      { id: "correlation-searches", label: "Correlation Searches", icon: Workflow },
      { id: "assets-identities", label: "Assets & Identities", icon: Users },
      { id: "threat-intel", label: "Threat Intelligence", icon: Globe },
    ],
  },
];

export function SplunkEsSimulator({ expectedAction, onValidate }: Props) {
  const [view, setView] = useState<string>("search");
  const [audit, setAudit] = useState<AuditEntry[]>([
    { at: ts(), action: "splunkes.session.start", detail: "Opened Splunk Enterprise Security as analyst.shadowx" },
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
    if (expectedAction.type === "run-spl" || expectedAction.type === "run-query")
      return `Run an SPL search ${expectedAction.contains ? `containing "${expectedAction.contains}"` : ""}`;
    if (expectedAction.type === "any") return "Free exploration — any action will pass.";
    return "";
  }, [expectedAction]);

  return (
    <Card className="overflow-hidden border-0 shadow-card">
      {/* Top bar */}
      <div className="flex items-center gap-2 bg-[hsl(220_15%_10%)] text-foreground px-3 py-2 border-b border-border">
        <ShieldCheck className="h-4 w-4 text-shadowx-gold" />
        <span className="font-display text-sm font-semibold tracking-wide">Splunk Enterprise Security</span>
        <Badge variant="outline" className="text-[10px] font-mono">Splunk · ES 7.x</Badge>
        <span className="text-[10px] text-muted-foreground hidden md:inline ml-1">SPL · Notables · RBA · Investigations</span>
        <div className="flex-1" />
        {expectedHint && (
          <Badge variant="outline" className="text-[10px] gap-1 max-w-[320px] truncate">
            <Activity className="h-3 w-3" /> {expectedHint}
          </Badge>
        )}
        {solved && (
          <Badge className="bg-success/15 text-success border-success/30 text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Solved
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[200px_1fr_240px] min-h-[520px] bg-background">
        {/* LEFT navigation rail */}
        <ScrollArea className="border-r border-border bg-card">
          <div className="p-2 space-y-3">
            {NAV_GROUPS.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
                  {g.label}
                </div>
                {g.items.map((it) => {
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
                      <ItemIcon className="h-3.5 w-3.5 shrink-0 text-shadowx-gold" />
                      <span className="truncate">{it.label}</span>
                      {active && <ChevronRight className="h-3 w-3 ml-auto text-primary" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* CENTER view */}
        <main className="overflow-auto p-4">
          <View view={view} emit={emit} />
        </main>

        {/* RIGHT audit */}
        <aside className="border-l border-border bg-card overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Analyst activity</div>
            <div className="text-[10px] text-muted-foreground">Live actions in this session</div>
          </div>
          <ScrollArea className="flex-1">
            <ul className="p-2 space-y-1.5 text-[11px] font-mono">
              {audit.map((e, i) => (
                <li key={i} className="leading-snug">
                  <span className="text-muted-foreground">{e.at} </span>
                  <span className="text-shadowx-gold">{e.action}</span>
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

type Emit = (action: string, detail: string, value?: string) => void;

function PageHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div className="h-10 w-10 rounded bg-primary-soft grid place-items-center">
        <Icon className="h-5 w-5 text-shadowx-gold" />
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

function Kpi({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-2xl font-display font-bold mt-1 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}

/* ---------- Views ---------- */
function View({ view, emit }: { view: string; emit: Emit }) {
  switch (view) {
    case "search":               return <SearchView emit={emit} />;
    case "dashboards":           return <DashboardsView emit={emit} />;
    case "security-posture":     return <PostureView emit={emit} />;
    case "incident-review":      return <IncidentReviewView emit={emit} />;
    case "risk-analysis":        return <RiskAnalysisView emit={emit} />;
    case "investigation":        return <InvestigationView emit={emit} />;
    case "glass-tables":         return <GlassTablesView emit={emit} />;
    case "correlation-searches": return <CorrelationView emit={emit} />;
    case "assets-identities":    return <AssetsView emit={emit} />;
    case "threat-intel":         return <ThreatIntelView emit={emit} />;
    default: return null;
  }
}

/* SEARCH — SPL editor with sample tables */
function SearchView({ emit }: { emit: Emit }) {
  const [spl, setSpl] = useState(`index=wineventlog EventCode=4625\n| stats count by user, src_ip\n| where count > 5`);
  const [ran, setRan] = useState(false);

  const sample = useMemo(() => {
    const s = spl.toLowerCase();
    if (s.includes("4625") || s.includes("failed")) {
      return {
        cols: ["_time", "user", "src_ip", "count"],
        rows: [
          ["2026-05-07 09:12", "j.doe",  "203.0.113.5",   42],
          ["2026-05-07 09:14", "a.kumar","198.51.100.7",  31],
          ["2026-05-07 09:16", "m.lee",  "203.0.113.5",   18],
          ["2026-05-07 09:21", "svc-bk", "10.0.0.42",     12],
        ],
      };
    }
    if (s.includes("tstats") || s.includes("authentication")) {
      return {
        cols: ["_time", "Authentication.user", "Authentication.dest", "count"],
        rows: [
          ["2026-05-07 08:00", "j.doe",   "DC01",  88],
          ["2026-05-07 08:00", "a.kumar", "FS01",  54],
          ["2026-05-07 08:00", "svc-bk",  "SQL01", 31],
        ],
      };
    }
    return {
      cols: ["_time", "host", "sourcetype", "_raw"],
      rows: [
        ["2026-05-07 09:18", "web01",  "access_combined", "GET / 200 1234"],
        ["2026-05-07 09:18", "fw01",   "cisco:asa",       "%ASA-6-302013 Built"],
        ["2026-05-07 09:18", "win-dc", "WinEventLog",     "EventCode=4624 Logon"],
      ],
    };
  }, [spl]);

  return (
    <div className="space-y-3">
      <PageHeader icon={Search} title="Search & Reporting" subtitle="Splunk Processing Language (SPL) console" />
      <Card className="p-2">
        <div className="text-[10px] text-muted-foreground px-1 pb-1">SPL</div>
        <Textarea
          value={spl}
          onChange={(e) => setSpl(e.target.value)}
          className="font-mono text-xs min-h-[110px]"
          placeholder="index=... | stats count by user"
        />
        <div className="flex items-center gap-2 pt-2">
          <select
            className="h-8 rounded border border-border bg-background px-2 text-xs"
            defaultValue="last_24h"
            onChange={(e) => emit(`select:time-range`, `Time range → ${e.target.value}`, e.target.value)}
          >
            <option value="last_15m">Last 15 minutes</option>
            <option value="last_60m">Last 60 minutes</option>
            <option value="last_24h">Last 24 hours</option>
            <option value="last_7d">Last 7 days</option>
            <option value="last_30d">Last 30 days</option>
          </select>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => { setRan(true); emit("run-spl", `Ran SPL: ${spl.slice(0, 80)}…`, spl); }}
          >
            <Play className="h-3 w-3" /> Search
          </Button>
          <Badge variant="outline" className="text-[10px]">{ran ? `${sample.rows.length} events` : "0 events"}</Badge>
        </div>
      </Card>
      <DataTable cols={sample.cols} rows={sample.rows} />
    </div>
  );
}

/* DASHBOARDS list */
function DashboardsView({ emit }: { emit: Emit }) {
  const dashes = [
    "Security Posture", "Incident Review", "Risk Analysis",
    "Access Anomalies", "Endpoint Investigation", "Network Anomalies",
    "Identity Investigator", "Threat Activity", "Asset Investigator",
  ];
  return (
    <div className="space-y-3">
      <PageHeader icon={Layers} title="Dashboards" subtitle="Splunk Enterprise Security domain dashboards" />
      <div className="grid grid-cols-3 gap-2">
        {dashes.map((d) => (
          <button
            key={d}
            onClick={() => emit(`click:open-dashboard:${d}`, `Opened dashboard ${d}`)}
            className="rounded border border-border bg-card p-3 text-left hover:bg-muted transition-colors"
          >
            <div className="text-xs font-semibold">{d}</div>
            <div className="text-[10px] text-muted-foreground mt-1">ES domain dashboard</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* SECURITY POSTURE */
function PostureView({ emit }: { emit: Emit }) {
  return (
    <div className="space-y-3">
      <PageHeader icon={Gauge} title="Security Posture" subtitle="Key indicators across all ES domains" />
      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Notable Events (24h)" value={142} tone="text-shadowx-gold" />
        <Kpi label="Open Notables" value={37} />
        <Kpi label="Critical (urgency)" value={5} tone="text-destructive" />
        <Kpi label="Mean Time to Triage" value="14m" />
      </div>
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">Notable Events Over Time</div>
        <svg viewBox="0 0 400 80" className="w-full">
          <polyline fill="none" stroke="hsl(var(--shadow-gold))" strokeWidth="2"
            points="0,60 30,55 60,40 90,52 120,30 150,38 180,22 210,28 240,18 270,30 300,20 330,12 360,18 400,8" />
        </svg>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">Top Notable Events</div>
          <ul className="text-xs space-y-1.5">
            <li className="flex justify-between"><span>Threat - Brute Force Detected</span><span className="font-mono">38</span></li>
            <li className="flex justify-between"><span>Endpoint - Suspicious PowerShell</span><span className="font-mono">22</span></li>
            <li className="flex justify-between"><span>Access - Concurrent Login Attempts</span><span className="font-mono">17</span></li>
            <li className="flex justify-between"><span>Risk - User Risk Threshold Exceeded</span><span className="font-mono">12</span></li>
          </ul>
        </Card>
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">Top Sources</div>
          <ul className="text-xs space-y-1.5">
            <li className="flex justify-between"><span>win-dc01</span><span className="font-mono">62</span></li>
            <li className="flex justify-between"><span>fw-edge-01</span><span className="font-mono">41</span></li>
            <li className="flex justify-between"><span>okta-cloud</span><span className="font-mono">28</span></li>
          </ul>
        </Card>
      </div>
      <Button size="sm" variant="outline" onClick={() => emit("click:edit-key-indicators", "Opened Key Indicators editor")}>
        Edit Key Indicators
      </Button>
    </div>
  );
}

/* INCIDENT REVIEW */
const NOTABLES = [
  { id: "NOT-1042", t: "Threat - Brute Force Detected on j.doe@corp", urgency: "critical", status: "New", entity: "j.doe", rule: "Access - Brute Force" },
  { id: "NOT-1041", t: "Endpoint - Suspicious PowerShell Encoded Command", urgency: "high", status: "New", entity: "ws-fin-12", rule: "Endpoint - Susp PS" },
  { id: "NOT-1040", t: "Risk - User Risk Threshold Exceeded (a.kumar)", urgency: "high", status: "In Progress", entity: "a.kumar", rule: "Risk - Threshold" },
  { id: "NOT-1039", t: "Access - Concurrent Login from Multiple Geos", urgency: "medium", status: "New", entity: "m.lee", rule: "Access - Impossible Travel" },
  { id: "NOT-1038", t: "Network - C2 Beaconing to Known Bad IP", urgency: "critical", status: "Pending", entity: "10.0.4.21", rule: "Network - TI Match" },
  { id: "NOT-1037", t: "Endpoint - Disabling Defender via Registry", urgency: "high", status: "Resolved", entity: "ws-eng-04", rule: "Endpoint - Defense Evasion" },
];

function urgencyTone(u: string) {
  if (u === "critical") return "text-destructive";
  if (u === "high") return "text-shadowx-ember";
  if (u === "medium") return "text-shadowx-gold";
  return "text-muted-foreground";
}

function IncidentReviewView({ emit }: { emit: Emit }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [comment, setComment] = useState("");

  const rows = NOTABLES.filter((n) => statusFilter === "all" || n.status.toLowerCase() === statusFilter);
  const sel = NOTABLES.find((n) => n.id === selected);

  return (
    <div className="space-y-3">
      <PageHeader icon={AlertTriangle} title="Incident Review" subtitle="Triage notable events" />
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); emit(`select:status-filter`, `Filter status → ${e.target.value}`, e.target.value); }}
          className="h-8 rounded border border-border bg-background px-2 text-xs"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <Input placeholder="Search notables…" className="h-8 text-xs max-w-xs" />
        <Badge variant="outline" className="text-[10px] ml-auto">{rows.length} notables</Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5">ID</th>
              <th className="text-left px-2 py-1.5">Title</th>
              <th className="text-left px-2 py-1.5">Urgency</th>
              <th className="text-left px-2 py-1.5">Status</th>
              <th className="text-left px-2 py-1.5">Entity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr
                key={n.id}
                onClick={() => { setSelected(n.id); emit(`click:open-notable:${n.id}`, `Opened ${n.id}`); }}
                className={`border-t border-border cursor-pointer hover:bg-muted/40 ${selected === n.id ? "bg-primary-soft" : ""}`}
              >
                <td className="px-2 py-1.5 font-mono">{n.id}</td>
                <td className="px-2 py-1.5">{n.t}</td>
                <td className={`px-2 py-1.5 font-mono uppercase text-[10px] ${urgencyTone(n.urgency)}`}>{n.urgency}</td>
                <td className="px-2 py-1.5">{n.status}</td>
                <td className="px-2 py-1.5 font-mono">{n.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {sel && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">{sel.id}</Badge>
            <div className="text-sm font-semibold">{sel.t}</div>
            <Badge className={`ml-auto ${urgencyTone(sel.urgency)}`} variant="outline">{sel.urgency}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><span className="text-muted-foreground">Rule:</span> <span className="font-mono">{sel.rule}</span></div>
            <div><span className="text-muted-foreground">Entity:</span> <span className="font-mono">{sel.entity}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="font-mono">{sel.status}</span></div>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Adjacent events (3) · Contributing events (12) · Risk score impact: +45
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Button size="sm" variant="outline" onClick={() => emit(`click:assign-to-me`, `Assigned ${sel.id} to analyst.shadowx`)}>Assign to me</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:change-status:in-progress`, `${sel.id} → In Progress`)}>Mark In Progress</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:suppress-notable`, `Suppressed ${sel.id} for 24h`)}>Suppress 24h</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:run-adaptive-response`, `Ran adaptive response on ${sel.id}`)}>Run Adaptive Response</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:add-to-investigation`, `Added ${sel.id} to investigation INV-220`)}>Add to Investigation</Button>
            <Button size="sm" onClick={() => emit(`click:resolve-notable`, `Resolved ${sel.id}`)}>Resolve</Button>
          </div>
          <Textarea
            placeholder="Add comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-xs"
          />
          <Button size="sm" variant="ghost" onClick={() => emit(`click:add-comment`, `Added comment to ${sel.id}`)}>Save comment</Button>
        </Card>
      )}
    </div>
  );
}

/* RISK ANALYSIS */
const RISK_OBJECTS = [
  { name: "j.doe",   type: "user",   score: 92, sources: 6, attck: 4 },
  { name: "a.kumar", type: "user",   score: 78, sources: 4, attck: 3 },
  { name: "ws-fin-12", type: "system", score: 65, sources: 5, attck: 2 },
  { name: "10.0.4.21", type: "other", score: 54, sources: 3, attck: 2 },
];

function RiskAnalysisView({ emit }: { emit: Emit }) {
  return (
    <div className="space-y-3">
      <PageHeader icon={ShieldCheck} title="Risk Analysis" subtitle="Risk-Based Alerting (RBA) overview" />
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Risk Notables (24h)" value={9} tone="text-shadowx-gold" />
        <Kpi label="Risk Objects > 80" value={3} tone="text-destructive" />
        <Kpi label="Avg ATT&CK breadth" value="2.8" />
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5">Risk Object</th>
              <th className="text-left px-2 py-1.5">Type</th>
              <th className="text-left px-2 py-1.5">Score</th>
              <th className="text-left px-2 py-1.5">Source rules</th>
              <th className="text-left px-2 py-1.5">ATT&CK techniques</th>
              <th className="text-left px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {RISK_OBJECTS.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="px-2 py-1.5 font-mono">{r.name}</td>
                <td className="px-2 py-1.5">{r.type}</td>
                <td className={`px-2 py-1.5 font-mono font-bold ${r.score >= 80 ? "text-destructive" : r.score >= 60 ? "text-shadowx-ember" : "text-shadowx-gold"}`}>{r.score}</td>
                <td className="px-2 py-1.5 font-mono">{r.sources}</td>
                <td className="px-2 py-1.5 font-mono">{r.attck}</td>
                <td className="px-2 py-1.5">
                  <Button size="sm" variant="ghost" onClick={() => emit(`click:pivot-risk:${r.name}`, `Pivoted into risk events for ${r.name}`)}>
                    Pivot
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => emit(`click:create-risk-rule`, "Opened risk rule wizard")}>New Risk Rule</Button>
        <Button size="sm" variant="outline" onClick={() => emit(`click:create-risk-notable-rule`, "Opened risk-notable rule wizard")}>New Risk Notable Rule</Button>
      </div>
    </div>
  );
}

/* INVESTIGATION WORKBENCH */
function InvestigationView({ emit }: { emit: Emit }) {
  const events = [
    { at: "09:12", type: "notable", text: "NOT-1042 Brute Force on j.doe" },
    { at: "09:18", type: "artifact", text: "Added artifact: 203.0.113.5 (src_ip)" },
    { at: "09:21", type: "note",     text: "Confirmed VPN logs corroborate burst pattern" },
    { at: "09:30", type: "action",   text: "Adaptive response: disabled user j.doe in AD" },
    { at: "09:42", type: "artifact", text: "Added artifact: ws-fin-12 (host)" },
  ];
  return (
    <div className="space-y-3">
      <PageHeader icon={FileSearch} title="Investigation Workbench" subtitle="INV-220 · Brute force → account compromise" />
      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Artifacts" value={7} />
        <Kpi label="Notes" value={4} />
        <Kpi label="Collaborators" value={2} />
      </div>
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">Timeline</div>
        <ul className="space-y-2 text-xs">
          {events.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-muted-foreground">{e.at}</span>
              <Badge variant="outline" className="text-[10px] uppercase">{e.type}</Badge>
              <span>{e.text}</span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => emit(`click:add-note`, "Added investigation note")}>Add note</Button>
        <Button size="sm" variant="outline" onClick={() => emit(`click:add-artifact`, "Added artifact")}>Add artifact</Button>
        <Button size="sm" variant="outline" onClick={() => emit(`click:add-collaborator`, "Added collaborator")}>Add collaborator</Button>
        <Button size="sm" variant="outline" onClick={() => emit(`click:export-investigation`, "Exported investigation INV-220")}>Export PDF</Button>
        <Button size="sm" onClick={() => emit(`click:close-investigation`, "Closed investigation INV-220")}>Close investigation</Button>
      </div>
    </div>
  );
}

/* GLASS TABLES */
function GlassTablesView({ emit }: { emit: Emit }) {
  const tables = ["Executive Security Overview", "Cloud SOC Glass Table", "Endpoint Health Map"];
  return (
    <div className="space-y-3">
      <PageHeader icon={Layers} title="Glass Tables" subtitle="Visual security dashboards bound to KPIs" />
      <div className="grid grid-cols-2 gap-2">
        {tables.map((t) => (
          <button
            key={t}
            onClick={() => emit(`click:open-glass-table:${t}`, `Opened glass table ${t}`)}
            className="rounded border border-border bg-card p-4 text-left hover:bg-muted transition-colors"
          >
            <div className="text-sm font-semibold">{t}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Bound to 6 KPIs · last edit 2d ago</div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-8 rounded bg-muted/60 border border-border" />
              ))}
            </div>
          </button>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => emit(`click:create-glass-table`, "Started new glass table")}>+ New Glass Table</Button>
    </div>
  );
}

/* CORRELATION SEARCHES */
const CORRELATIONS = [
  { name: "Access - Brute Force Detected",      app: "DA-ESS-AccessProtection",  status: "Enabled",  schedule: "*/5 * * * *",  notable: "yes", risk: "no" },
  { name: "Endpoint - Suspicious PowerShell",   app: "DA-ESS-EndpointProtection",status: "Enabled",  schedule: "*/10 * * * *", notable: "yes", risk: "yes" },
  { name: "Network - TI Match Outbound",        app: "DA-ESS-NetworkProtection", status: "Enabled",  schedule: "*/15 * * * *", notable: "yes", risk: "no" },
  { name: "Risk - User Risk Threshold Exceeded",app: "SA-ThreatIntelligence",    status: "Enabled",  schedule: "0 * * * *",    notable: "yes", risk: "no" },
  { name: "Access - Concurrent Login Geo",      app: "DA-ESS-AccessProtection",  status: "Disabled", schedule: "*/30 * * * *", notable: "no",  risk: "yes" },
];

function CorrelationView({ emit }: { emit: Emit }) {
  const [sel, setSel] = useState<string | null>(null);
  const r = CORRELATIONS.find((c) => c.name === sel);
  return (
    <div className="space-y-3">
      <PageHeader icon={Workflow} title="Correlation Searches" subtitle="Detection rules powering ES notables & risk" />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => emit(`click:new-correlation`, "Started new correlation search")}>+ Create New Search</Button>
        <Button size="sm" variant="outline" onClick={() => emit(`click:filter-attack-mapped`, "Filtered to ATT&CK-mapped rules")}>ATT&CK mapped only</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5">Rule</th>
              <th className="text-left px-2 py-1.5">App</th>
              <th className="text-left px-2 py-1.5">Status</th>
              <th className="text-left px-2 py-1.5">Schedule</th>
              <th className="text-left px-2 py-1.5">Notable</th>
              <th className="text-left px-2 py-1.5">Risk</th>
            </tr>
          </thead>
          <tbody>
            {CORRELATIONS.map((c) => (
              <tr
                key={c.name}
                onClick={() => { setSel(c.name); emit(`click:open-correlation:${c.name}`, `Opened ${c.name}`); }}
                className={`border-t border-border cursor-pointer hover:bg-muted/40 ${sel === c.name ? "bg-primary-soft" : ""}`}
              >
                <td className="px-2 py-1.5 font-mono">{c.name}</td>
                <td className="px-2 py-1.5 text-[10px] text-muted-foreground">{c.app}</td>
                <td className={`px-2 py-1.5 font-mono ${c.status === "Enabled" ? "text-success" : "text-muted-foreground"}`}>{c.status}</td>
                <td className="px-2 py-1.5 font-mono">{c.schedule}</td>
                <td className="px-2 py-1.5">{c.notable}</td>
                <td className="px-2 py-1.5">{c.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {r && (
        <Card className="p-3 space-y-2">
          <div className="text-sm font-semibold">{r.name}</div>
          <pre className="text-[11px] font-mono bg-muted/50 p-2 rounded overflow-auto">{`| tstats summariesonly=t count from datamodel=Authentication
  where Authentication.action="failure"
  by Authentication.user, Authentication.dest
| where count > 25`}</pre>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={() => emit(`click:clone-rule`, `Cloned ${r.name}`)}>Clone</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:tune-rule`, `Tuned thresholds on ${r.name}`)}>Tune thresholds</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:add-attack-mapping`, `Mapped ${r.name} to T1110.001`)}>Map to ATT&CK</Button>
            <Button size="sm" variant="outline" onClick={() => emit(`click:add-adaptive-response`, `Added adaptive response to ${r.name}`)}>Add Adaptive Response</Button>
            <Button size="sm" onClick={() => emit(`click:enable-rule`, `Enabled ${r.name}`)}>Enable</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ASSETS & IDENTITIES */
function AssetsView({ emit }: { emit: Emit }) {
  const assets = [
    ["10.0.0.10",  "win-dc01",   "DC",        "production", "high"],
    ["10.0.4.21",  "ws-fin-12",  "endpoint",  "finance",    "medium"],
    ["10.0.5.50",  "sql-prd-02", "database",  "production", "critical"],
  ];
  const ids = [
    ["j.doe",   "John Doe",      "Finance Analyst",   "AD"],
    ["a.kumar", "Anika Kumar",   "DBA",               "Entra"],
    ["svc-bk",  "Backup Service","service account",   "AD"],
  ];
  return (
    <div className="space-y-3">
      <PageHeader icon={Users} title="Assets & Identities" subtitle="ES asset & identity framework" />
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2 flex items-center justify-between">
          <span>Assets</span>
          <Button size="sm" variant="outline" onClick={() => emit(`click:upload-asset-lookup`, "Uploaded asset lookup CSV")}>Upload lookup</Button>
        </div>
        <DataTable cols={["IP", "Hostname", "Category", "BU", "Priority"]} rows={assets} />
      </Card>
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2 flex items-center justify-between">
          <span>Identities</span>
          <Button size="sm" variant="outline" onClick={() => emit(`click:merge-identities`, "Triggered identity merge job")}>Merge identities</Button>
        </div>
        <DataTable cols={["User", "Display name", "Role", "Source"]} rows={ids} />
      </Card>
    </div>
  );
}

/* THREAT INTEL */
function ThreatIntelView({ emit }: { emit: Emit }) {
  const feeds = [
    ["MISP - corp-intel",  "TAXII 2.1", "active",   "12 432"],
    ["AlienVault OTX",     "TAXII 2.0", "active",   "84 110"],
    ["Custom IP allowlist","File",      "active",     "812"],
    ["AbuseIPDB",          "REST",      "disabled", "—"],
  ];
  const matches = [
    ["10.0.4.21 → 198.51.100.7", "ip",  "C2 Cobalt Strike", "MISP - corp-intel", "high"],
    ["dns: evil-cdn.example",    "dom", "Phishing kit",     "AlienVault OTX",    "medium"],
    ["sha256: a9f1…",            "hash","Trickbot loader",  "MISP - corp-intel", "high"],
  ];
  return (
    <div className="space-y-3">
      <PageHeader icon={Globe} title="Threat Intelligence" subtitle="Feeds, IOCs and Threat Activity" />
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2 flex items-center justify-between">
          <span>Intel feeds</span>
          <Button size="sm" variant="outline" onClick={() => emit(`click:add-intel-feed`, "Added new intel feed")}>+ Add feed</Button>
        </div>
        <DataTable cols={["Feed", "Type", "Status", "Indicators"]} rows={feeds} />
      </Card>
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">Threat Activity (last 24h)</div>
        <DataTable cols={["Match", "Type", "Threat", "Source", "Severity"]} rows={matches} />
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => emit(`click:tune-intel-fp`, "Marked match as false positive")}>Mark FP</Button>
          <Button size="sm" onClick={() => emit(`click:create-notable-from-match`, "Created notable from intel match")}>Create notable</Button>
        </div>
      </Card>
    </div>
  );
}
