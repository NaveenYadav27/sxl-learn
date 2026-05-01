/**
 * GcpConsoleSimulator — interactive mock of the Google Cloud Console used by
 * all Cloud Digital Leader (CDL) labs.
 *
 * The simulator mimics the look-and-feel of console.cloud.google.com:
 *   - Top app bar with project switcher
 *   - Left navigation rail with Google Cloud product groups
 *   - Main content area that switches based on the active product
 *
 * Steps are validated through the same expected_action contract as the other
 * simulators (KaliTerminal, K8sTerminal, ServiceNow):
 *
 *   { type: "navigate", to: "storage" }       // open a product page
 *   { type: "click",    target: "create-bucket" }   // click a labelled action
 *   { type: "select",   target: "storage-class", value: "Coldline" }
 *   { type: "run-query", contains: "SELECT" }
 *   { type: "any" }                            // free exploration
 *
 * Every action a learner takes is logged in an audit pane on the right.
 */
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Cloud, Database, BarChart3, Server, Box, Shield, Wallet, Bot, HardDrive,
  Search, Menu, ChevronRight, CheckCircle2, AlertTriangle, FolderTree, Zap, Activity,
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

type ProductId =
  | "home"
  | "iam"
  | "storage"
  | "bigquery"
  | "compute"
  | "cloudrun"
  | "gke"
  | "vision-ai"
  | "billing"
  | "armor"
  | "hierarchy";

interface Product {
  id: ProductId;
  label: string;
  group: string;
  icon: any;
  color: string;
}

const PRODUCTS: Product[] = [
  { id: "home", label: "Cloud overview", group: "Home", icon: Cloud, color: "text-shadowx-azure" },
  { id: "hierarchy", label: "Resource Manager", group: "Home", icon: FolderTree, color: "text-shadowx-azure" },
  { id: "iam", label: "IAM & Admin", group: "Security", icon: Shield, color: "text-domain-security" },
  { id: "armor", label: "Cloud Armor", group: "Security", icon: Shield, color: "text-domain-security" },
  { id: "storage", label: "Cloud Storage", group: "Storage", icon: HardDrive, color: "text-shadowx-azure" },
  { id: "bigquery", label: "BigQuery", group: "Analytics", icon: BarChart3, color: "text-domain-entra" },
  { id: "vision-ai", label: "Vision AI", group: "AI / ML", icon: Bot, color: "text-domain-entra" },
  { id: "compute", label: "Compute Engine", group: "Compute", icon: Server, color: "text-shadowx-gold" },
  { id: "cloudrun", label: "Cloud Run", group: "Compute", icon: Zap, color: "text-shadowx-gold" },
  { id: "gke", label: "Kubernetes Engine", group: "Compute", icon: Box, color: "text-shadowx-gold" },
  { id: "billing", label: "Billing", group: "Admin", icon: Wallet, color: "text-domain-compliance" },
];

function groupProducts(): Record<string, Product[]> {
  return PRODUCTS.reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});
}

// ---------------- validation helper ----------------
function matches(state: { product: ProductId; action: string; value?: string }, expected: Action): boolean {
  if (!expected || expected.type === "any") return true;
  if (expected.type === "navigate" && expected.to) {
    return state.product === expected.to && state.action === "navigate";
  }
  if (expected.type === "click" && expected.target) {
    return state.action === `click:${expected.target}`;
  }
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

export function GcpConsoleSimulator({ expectedAction, onValidate }: Props) {
  const [product, setProduct] = useState<ProductId>("home");
  const [audit, setAudit] = useState<{ at: string; action: string; detail: string }[]>([
    { at: ts(), action: "console.signin", detail: "Signed in to project shadowx-academy-prod" },
  ]);
  const [solved, setSolved] = useState(false);
  const groups = useMemo(groupProducts, []);

  function emit(action: string, detail: string, value?: string) {
    setAudit((a) => [...a, { at: ts(), action, detail }]);
    if (!solved && matches({ product, action, value }, expectedAction)) {
      setSolved(true);
      setAudit((a) => [...a, { at: ts(), action: "lab.step.complete", detail: "✔ Step objective met." }]);
      setTimeout(() => onValidate(true), 350);
    }
  }

  function navigate(p: ProductId) {
    setProduct(p);
    const meta = PRODUCTS.find((x) => x.id === p);
    setAudit((a) => [...a, { at: ts(), action: "navigate", detail: `Opened ${meta?.label ?? p}` }]);
    if (!solved && matches({ product: p, action: "navigate" }, expectedAction)) {
      setSolved(true);
      setAudit((a) => [...a, { at: ts(), action: "lab.step.complete", detail: "✔ Step objective met." }]);
      setTimeout(() => onValidate(true), 350);
    }
  }

  useEffect(() => { setSolved(false); }, [expectedAction]);

  const expectedHint = useMemo(() => {
    if (!expectedAction) return "";
    if (expectedAction.type === "navigate") return `Open the ${labelFor(expectedAction.to as ProductId)} page`;
    if (expectedAction.type === "click") return `Click "${expectedAction.target}"`;
    if (expectedAction.type === "select") return `Set ${expectedAction.target} → ${expectedAction.value ?? "any"}`;
    if (expectedAction.type === "run-query") return `Run a query ${expectedAction.contains ? `containing "${expectedAction.contains}"` : ""}`;
    if (expectedAction.type === "any") return "Free exploration — any action will pass.";
    return "";
  }, [expectedAction]);

  return (
    <Card className="overflow-hidden border-0 shadow-card">
      {/* Top bar */}
      <div className="flex items-center gap-2 bg-[hsl(220_15%_10%)] text-foreground px-3 py-2 border-b border-border">
        <Menu className="h-4 w-4 text-muted-foreground" />
        <Cloud className="h-4 w-4 text-shadowx-azure" />
        <span className="font-display text-sm font-semibold tracking-wide">Google Cloud</span>
        <Badge variant="outline" className="text-[10px] font-mono">shadowx-academy-prod ▾</Badge>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2 bg-muted/40 rounded px-2 py-1 text-xs text-muted-foreground">
          <Search className="h-3 w-3" />
          <span>Search products and resources</span>
        </div>
        {expectedHint && (
          <Badge variant="outline" className="text-[10px] gap-1 max-w-[260px] truncate">
            <Activity className="h-3 w-3" /> {expectedHint}
          </Badge>
        )}
        {solved && (
          <Badge className="bg-success/15 text-success border-success/30 text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Solved
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[210px_1fr_240px] min-h-[460px] bg-background">
        {/* LEFT: navigation rail */}
        <ScrollArea className="border-r border-border bg-card">
          <div className="p-2 space-y-3">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">{group}</div>
                <ul className="space-y-0.5">
                  {items.map((p) => {
                    const Icon = p.icon;
                    const active = p.id === product;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => navigate(p.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors ${
                            active ? "bg-primary-soft border border-primary/40 font-medium" : "hover:bg-muted"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${p.color}`} />
                          <span className="truncate">{p.label}</span>
                          {active && <ChevronRight className="h-3 w-3 ml-auto text-primary" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* CENTER: product page */}
        <main className="overflow-auto p-5">
          <ProductPage product={product} emit={emit} />
        </main>

        {/* RIGHT: audit log */}
        <aside className="border-l border-border bg-card overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Cloud Audit Logs</div>
            <div className="text-[10px] text-muted-foreground">Live activity in this project</div>
          </div>
          <ScrollArea className="flex-1">
            <ul className="p-2 space-y-1.5 text-[11px] font-mono">
              {audit.map((e, i) => (
                <li key={i} className="leading-snug">
                  <span className="text-muted-foreground">{e.at} </span>
                  <span className="text-shadowx-azure">{e.action}</span>
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

function labelFor(id: ProductId): string {
  return PRODUCTS.find((p) => p.id === id)?.label ?? id;
}

function ts(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

// ---------------- per-product pages ----------------
type EmitFn = (action: string, detail: string, value?: string) => void;

function ProductPage({ product, emit }: { product: ProductId; emit: EmitFn }) {
  switch (product) {
    case "home":      return <HomePage />;
    case "hierarchy": return <HierarchyPage emit={emit} />;
    case "iam":       return <IamPage emit={emit} />;
    case "storage":   return <StoragePage emit={emit} />;
    case "bigquery":  return <BigQueryPage emit={emit} />;
    case "vision-ai": return <VisionAiPage emit={emit} />;
    case "compute":   return <ComputePage emit={emit} />;
    case "cloudrun":  return <CloudRunPage emit={emit} />;
    case "gke":       return <GkePage emit={emit} />;
    case "billing":   return <BillingPage emit={emit} />;
    case "armor":     return <ArmorPage emit={emit} />;
  }
}

function PageHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="h-10 w-10 rounded bg-primary-soft grid place-items-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <PageHeader icon={Cloud} title="Welcome, Cloud champion" subtitle="Project: shadowx-academy-prod · Region: us-central1" />
      <div className="grid sm:grid-cols-3 gap-3">
        <Tile label="Active services" value="11" />
        <Tile label="Spend (MTD)" value="$184.20" />
        <Tile label="Sustainability" value="Carbon-free 92%" />
      </div>
      <Card className="mt-4 p-4 text-xs text-muted-foreground">
        Use the navigation rail on the left to open any Google Cloud product. Every action you take is recorded
        in the Cloud Audit Logs panel on the right — that's exactly how a real Google Cloud project tracks
        activity for security and billing.
      </Card>
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold text-shadowx-gradient">{value}</div>
    </Card>
  );
}

function HierarchyPage({ emit }: { emit: EmitFn }) {
  return (
    <>
      <PageHeader icon={FolderTree} title="Resource Manager" subtitle="Organization → Folder → Project → Resource" />
      <Card className="p-4 text-sm font-mono">
        <div>📂 <span className="font-semibold">Organization</span> — shadowxlab.academy</div>
        <div className="pl-5">📁 Folder — engineering</div>
        <div className="pl-10">📁 Folder — production</div>
        <div className="pl-16">🟢 Project — shadowx-academy-prod (active)</div>
        <div className="pl-16">🟢 Project — shadowx-data-warehouse</div>
        <div className="pl-10">📁 Folder — non-prod</div>
        <div className="pl-16">🟡 Project — shadowx-academy-dev</div>
        <div className="pl-5">📁 Folder — finance</div>
        <div className="pl-10">🟢 Project — shadowx-billing</div>
      </Card>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => emit("click:create-folder", "Created folder")}>Create folder</Button>
        <Button size="sm" variant="outline" onClick={() => emit("click:create-project", "Created project")}>Create project</Button>
      </div>
    </>
  );
}

function IamPage({ emit }: { emit: EmitFn }) {
  const [role, setRole] = useState("roles/viewer");
  return (
    <>
      <PageHeader icon={Shield} title="IAM & Admin" subtitle="Permissions for project shadowx-academy-prod" />
      <Card className="p-3 mb-3">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Principal</th><th className="text-left">Role</th><th className="text-left">Inheritance</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">alice@shadowxlab.academy</td><td>Owner</td><td>Project</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">bob@shadowxlab.academy</td><td>Editor</td><td>Inherited from folder</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">data-team@shadowxlab.academy</td><td>BigQuery Data Viewer</td><td>Project</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">carol@shadowxlab.academy</td><td>{role}</td><td>Project</td></tr>
          </tbody>
        </table>
      </Card>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grant role to carol@</label>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); emit("select:role", `Set role → ${e.target.value}`, e.target.value); }}
            className="w-full mt-1 rounded border border-border bg-background text-xs px-2 py-1.5"
          >
            <option>roles/viewer</option>
            <option>roles/editor</option>
            <option>roles/owner</option>
            <option>roles/storage.admin</option>
            <option>roles/bigquery.dataEditor</option>
          </select>
        </div>
        <Button size="sm" onClick={() => emit("click:save-iam", `Saved IAM binding ${role} for carol@`)}>Save</Button>
      </div>
    </>
  );
}

function StoragePage({ emit }: { emit: EmitFn }) {
  const [bucketName, setBucketName] = useState("shadowx-academy-data");
  const [klass, setKlass] = useState("Standard");
  return (
    <>
      <PageHeader icon={HardDrive} title="Cloud Storage" subtitle="Object storage with four storage classes" />
      <Card className="p-3 mb-3">
        <div className="text-xs font-semibold mb-2">Existing buckets</div>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Name</th><th>Class</th><th>Region</th><th>Objects</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-app-images</td><td>Standard</td><td>us-central1</td><td>312</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-backups</td><td>Nearline</td><td>us-central1</td><td>48</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-archives</td><td>Archive</td><td>us-central1</td><td>5,201</td></tr>
          </tbody>
        </table>
      </Card>

      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">Create a new bucket</div>
        <div className="space-y-2">
          <Input value={bucketName} onChange={(e) => setBucketName(e.target.value)} className="text-xs h-8" />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Storage class</label>
            <select
              value={klass}
              onChange={(e) => { setKlass(e.target.value); emit("select:storage-class", `Selected ${e.target.value}`, e.target.value); }}
              className="block w-full mt-1 rounded border border-border bg-background text-xs px-2 py-1.5"
            >
              <option>Standard</option>
              <option>Nearline</option>
              <option>Coldline</option>
              <option>Archive</option>
            </select>
            <div className="text-[10px] text-muted-foreground mt-1">
              {klass === "Standard"   && "Hot data accessed often — highest cost, lowest latency."}
              {klass === "Nearline"   && "Accessed less than once per month — 30-day min storage."}
              {klass === "Coldline"   && "Accessed less than once per quarter — 90-day min storage."}
              {klass === "Archive"    && "Disaster recovery / long-term retention — 365-day min storage, cheapest."}
            </div>
          </div>
          <Button size="sm" onClick={() => emit("click:create-bucket", `Created bucket ${bucketName} (${klass})`)}>
            Create bucket
          </Button>
        </div>
      </Card>
    </>
  );
}

function BigQueryPage({ emit }: { emit: EmitFn }) {
  const [sql, setSql] = useState("SELECT name, count\nFROM `bigquery-public-data.usa_names.usa_1910_current`\nWHERE state = 'CA'\nORDER BY count DESC\nLIMIT 10;");
  const [rows, setRows] = useState<{ name: string; count: number }[] | null>(null);
  function run() {
    setRows([
      { name: "Maria",    count: 161582 },
      { name: "Jose",     count: 158301 },
      { name: "Daniel",   count: 145720 },
      { name: "David",    count: 144209 },
      { name: "Michael",  count: 142117 },
      { name: "Jessica",  count: 138204 },
      { name: "Andrew",   count: 132014 },
      { name: "Anthony",  count: 130880 },
      { name: "Sarah",    count: 128114 },
      { name: "John",     count: 127401 },
    ]);
    emit("run-query", `Ran query (${sql.length} chars)`, sql);
  }
  return (
    <>
      <PageHeader icon={BarChart3} title="BigQuery" subtitle="Serverless data warehouse — query petabytes with SQL" />
      <Card className="p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">SQL editor — bigquery-public-data</div>
        <Textarea value={sql} onChange={(e) => setSql(e.target.value)} className="font-mono text-xs h-32" />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={run} className="gap-1"><Zap className="h-3 w-3" /> Run query</Button>
          <span className="text-[10px] text-muted-foreground">Estimated bytes processed: 1.2 GB · ≈ $0.006</span>
        </div>
      </Card>
      {rows && (
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">Query results · 10 rows</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr><th className="text-left py-1">name</th><th className="text-right">count</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-border">
                  <td className="py-1">{r.name}</td>
                  <td className="text-right font-mono">{r.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function VisionAiPage({ emit }: { emit: EmitFn }) {
  const [analyzed, setAnalyzed] = useState(false);
  return (
    <>
      <PageHeader icon={Bot} title="Vision AI" subtitle="Pre-trained image analysis API — no ML expertise required" />
      <Card className="p-3 mb-3">
        <div className="aspect-video rounded bg-gradient-hero flex items-center justify-center text-xs text-muted-foreground">
          🖼  shadowx-sample-image.jpg
        </div>
        <Button size="sm" className="mt-3" onClick={() => { setAnalyzed(true); emit("click:analyze-image", "Sent image to Vision API"); }}>
          Analyze image
        </Button>
      </Card>
      {analyzed && (
        <Card className="p-3">
          <div className="text-xs font-semibold mb-2">Vision API response</div>
          <pre className="text-[11px] font-mono bg-muted/30 rounded p-2 overflow-auto">{`{
  "labels": [
    { "description": "Laptop",   "score": 0.97 },
    { "description": "Desk",     "score": 0.92 },
    { "description": "Indoor",   "score": 0.89 }
  ],
  "safeSearch": { "adult": "VERY_UNLIKELY", "violence": "UNLIKELY" },
  "text": "ShadowX Lab — CDL prep"
}`}</pre>
        </Card>
      )}
    </>
  );
}

function ComputePage({ emit }: { emit: EmitFn }) {
  return (
    <>
      <PageHeader icon={Server} title="Compute Engine" subtitle="IaaS virtual machines — full OS control" />
      <Card className="p-3 mb-3">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Name</th><th>Machine type</th><th>Zone</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-web-01</td><td>e2-medium</td><td>us-central1-a</td><td className="text-success">Running</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-web-02</td><td>e2-medium</td><td>us-central1-b</td><td className="text-success">Running</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-batch</td><td>n2-standard-4</td><td>us-central1-c</td><td className="text-muted-foreground">Stopped</td></tr>
          </tbody>
        </table>
      </Card>
      <Button size="sm" onClick={() => emit("click:create-vm", "Created VM instance")}>Create instance</Button>
    </>
  );
}

function CloudRunPage({ emit }: { emit: EmitFn }) {
  return (
    <>
      <PageHeader icon={Zap} title="Cloud Run" subtitle="Serverless containers — pay only when requests arrive" />
      <Card className="p-3 mb-3">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Service</th><th>Region</th><th>Last deployed</th><th>Requests/24h</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-api</td><td>us-central1</td><td>2h ago</td><td>184,912</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-pdf</td><td>us-central1</td><td>1d ago</td><td>2,310</td></tr>
          </tbody>
        </table>
      </Card>
      <Button size="sm" onClick={() => emit("click:deploy-service", "Deployed Cloud Run service")}>Deploy service</Button>
    </>
  );
}

function GkePage({ emit }: { emit: EmitFn }) {
  return (
    <>
      <PageHeader icon={Box} title="Kubernetes Engine" subtitle="Managed Kubernetes — control planes operated by Google" />
      <Card className="p-3 mb-3">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Cluster</th><th>Mode</th><th>Location</th><th>Nodes</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-prod</td><td>Autopilot</td><td>us-central1</td><td>—</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-dev</td><td>Standard</td><td>us-central1-a</td><td>3</td></tr>
          </tbody>
        </table>
      </Card>
      <Button size="sm" onClick={() => emit("click:create-cluster", "Created GKE cluster")}>Create cluster</Button>
    </>
  );
}

function BillingPage({ emit }: { emit: EmitFn }) {
  const [budget, setBudget] = useState("500");
  return (
    <>
      <PageHeader icon={Wallet} title="Billing" subtitle="Reports, budgets and quotas for shadowx-academy-prod" />
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <Tile label="MTD spend" value="$184.20" />
        <Tile label="Forecast" value="$612" />
        <Tile label="Last month" value="$489" />
      </div>
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">Create budget alert</div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly budget (USD)</label>
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} className="text-xs h-8 mt-1" />
          </div>
          <Button size="sm" onClick={() => emit("click:create-budget", `Created budget alert at $${budget}/mo`, budget)}>Create</Button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">
          Tip: alerts at 50% / 90% / 100% of budget catch surprise bills before the end of the month.
        </div>
      </Card>
    </>
  );
}

function ArmorPage({ emit }: { emit: EmitFn }) {
  return (
    <>
      <PageHeader icon={Shield} title="Cloud Armor" subtitle="Edge security — DDoS protection and WAF rules" />
      <Card className="p-3 mb-3">
        <div className="text-xs font-semibold mb-2">Active security policies</div>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr><th className="text-left py-1">Policy</th><th>Default action</th><th>Rules</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-edge-policy</td><td className="text-success">allow</td><td>4</td></tr>
            <tr className="border-t border-border"><td className="py-1.5">shadowx-block-tor</td><td className="text-warning">deny (403)</td><td>1</td></tr>
          </tbody>
        </table>
      </Card>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => emit("click:enable-ddos", "Enabled adaptive DDoS protection")}>Enable adaptive protection</Button>
        <Button size="sm" variant="outline" onClick={() => emit("click:add-waf-rule", "Added WAF rule")}>Add WAF rule</Button>
      </div>
    </>
  );
}
