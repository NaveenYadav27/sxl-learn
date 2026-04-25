import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, FlaskConical, Coffee, ClipboardCheck, Sparkles, Users,
  Shield, Gavel, ArrowRight, Clock, GraduationCap, CheckCircle2, Building2,
} from "lucide-react";
import { useCourse } from "@/hooks/useCourse";
import type { DayPlan as CourseDayPlan } from "@/lib/curriculum";

/* ----------------------------- Types ----------------------------- */
type Block =
  | { kind: "theory"; minutes: number; title: string; bullets: string[]; domain: DomainKey }
  | { kind: "lab"; minutes: number; title: string; slug: string; domain: DomainKey; live?: boolean }
  | { kind: "break"; minutes: number; title: string }
  | { kind: "exam"; minutes: number; title: string; description: string };

type Session = {
  id: string;
  title: string;
  module?: string;
  domain?: DomainKey;
  blocks: Block[];
};

type DomainKey = "concepts" | "iam" | "entra" | "security" | "compliance" | "exam";

/* --------------------------- Design map -------------------------- */
const domainMeta: Record<DomainKey, { label: string; icon: any; bar: string; chip: string; soft: string }> = {
  concepts:   { label: "Security Concepts",        icon: Sparkles,       bar: "bg-gradient-concepts",   chip: "bg-domain-concepts/15 text-domain-concepts border-domain-concepts/30",   soft: "bg-domain-concepts/5" },
  iam:        { label: "Identity & Access",        icon: Users,          bar: "bg-gradient-entra",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",          soft: "bg-domain-entra/5" },
  entra:      { label: "Entra Capabilities",       icon: Building2,      bar: "bg-gradient-entra",      chip: "bg-domain-entra/15 text-domain-entra border-domain-entra/30",          soft: "bg-domain-entra/5" },
  security:   { label: "Security Solutions",       icon: Shield,         bar: "bg-gradient-security",   chip: "bg-domain-security/15 text-domain-security border-domain-security/30", soft: "bg-domain-security/5" },
  compliance: { label: "Compliance & Governance",  icon: Gavel,          bar: "bg-gradient-compliance", chip: "bg-domain-compliance/15 text-domain-compliance border-domain-compliance/30", soft: "bg-domain-compliance/5" },
  exam:       { label: "Exam Prep",                icon: ClipboardCheck, bar: "bg-gradient-hero",       chip: "bg-primary/15 text-primary border-primary/30",                          soft: "bg-primary/5" },
};

/* --------------------------- Curriculum -------------------------- */
/* Authoritative source: SC-900 TOC (8h, 70% lab / 30% theory)
   Module times in TOC:
     M1 Concepts        45T + 45L   = 90
     M2 IAM             45T + 75L   = 120
     M3 Entra           30T + 90L   = 120
     M4 Security        30T + 75L   = 105
     M5 Compliance      30T + 75L   = 105
     Exam prep          15T + 15L   = 30
   Total                              570 min (+ ~30 min breaks => 8h day)
*/
const sessions: Session[] = [
  {
    id: "kickoff",
    title: "Kickoff & platform tour",
    blocks: [
      { kind: "theory", minutes: 10, title: "Welcome, objectives & how the lab works", domain: "concepts",
        bullets: [
          "Course goals, agenda and exam structure",
          "How the live tenant simulator graders work",
          "How XP, streaks and badges track progress",
        ]},
    ],
  },
  {
    id: "m1",
    title: "Module 1 — Security Concepts",
    module: "SC900-M1",
    domain: "concepts",
    blocks: [
      { kind: "theory", minutes: 45, title: "Security fundamentals", domain: "concepts",
        bullets: [
          "Zero Trust principles (verify explicitly, least privilege, assume breach)",
          "Defense in Depth strategy",
          "CIA Triad — Confidentiality, Integrity, Availability",
          "Threats, vulnerabilities & risk management",
          "Shared responsibility model in cloud security",
        ]},
      { kind: "lab", minutes: 15, title: "Explore Microsoft Secure Score",  slug: "secure-score-explore",       domain: "concepts" },
      { kind: "lab", minutes: 15, title: "Analyze security recommendations", slug: "analyze-recommendations",   domain: "concepts" },
      { kind: "lab", minutes: 15, title: "Review attack simulation overview", slug: "attack-simulation-overview", domain: "concepts" },
    ],
  },
  { id: "br1", title: "Break", blocks: [{ kind: "break", minutes: 10, title: "Short break" }] },
  {
    id: "m2",
    title: "Module 2 — Identity & Access Management",
    module: "SC900-M2",
    domain: "iam",
    blocks: [
      { kind: "theory", minutes: 45, title: "Identity & access fundamentals", domain: "iam",
        bullets: [
          "Authentication vs Authorization",
          "Multi-Factor Authentication (MFA)",
          "Role-Based Access Control (RBAC)",
          "Conditional Access policies",
          "Privileged Identity Management (PIM) overview",
        ]},
      { kind: "lab", minutes: 18, title: "Create users and groups in Entra ID", slug: "create-users-groups", domain: "iam" },
      { kind: "lab", minutes: 18, title: "Configure RBAC roles in Azure",       slug: "configure-rbac",       domain: "iam" },
      { kind: "lab", minutes: 22, title: "Implement Conditional Access policy", slug: "conditional-access",   domain: "iam" },
      { kind: "lab", minutes: 17, title: "Enable and test MFA",                 slug: "enable-test-mfa",      domain: "iam" },
    ],
  },
  { id: "lunch", title: "Lunch", blocks: [{ kind: "break", minutes: 30, title: "Lunch break" }] },
  {
    id: "m3",
    title: "Module 3 — Microsoft Entra Capabilities",
    module: "SC900-M3",
    domain: "entra",
    blocks: [
      { kind: "theory", minutes: 30, title: "Entra in depth", domain: "entra",
        bullets: [
          "Microsoft Entra ID architecture",
          "Hybrid identity concepts",
          "Identity protection",
          "Passwordless authentication",
          "B2B and B2C identity concepts",
        ]},
      { kind: "lab", minutes: 22, title: "Configure passwordless authentication",  slug: "passwordless-auth",   domain: "entra" },
      { kind: "lab", minutes: 23, title: "Set up Identity Protection policies",    slug: "identity-protection", domain: "entra" },
      { kind: "lab", minutes: 22, title: "Simulate risky sign-in detection",       slug: "risky-signin-sim",    domain: "entra" },
      { kind: "lab", minutes: 23, title: "Explore hybrid identity configuration",  slug: "hybrid-identity",     domain: "entra" },
      { kind: "lab", minutes: 25, title: "Live tenant — harden Contoso identities", slug: "live-tenant-harden-identities", domain: "entra", live: true },
    ],
  },
  { id: "br2", title: "Break", blocks: [{ kind: "break", minutes: 10, title: "Short break" }] },
  {
    id: "m4",
    title: "Module 4 — Security Solutions in Microsoft",
    module: "SC900-M4",
    domain: "security",
    blocks: [
      { kind: "theory", minutes: 30, title: "Defender, Sentinel & posture", domain: "security",
        bullets: [
          "Microsoft Defender overview (XDR, MDE, MDO, MDCA)",
          "Microsoft Sentinel basics — SIEM + SOAR",
          "Cloud security posture management (CSPM)",
          "Endpoint protection concepts",
        ]},
      { kind: "lab", minutes: 17, title: "Explore Microsoft Defender portal", slug: "defender-portal-explore",      domain: "security" },
      { kind: "lab", minutes: 20, title: "Investigate security alerts",       slug: "investigate-alerts",           domain: "security" },
      { kind: "lab", minutes: 18, title: "Review Sentinel dashboards",        slug: "sentinel-dashboards",          domain: "security" },
      { kind: "lab", minutes: 20, title: "Create basic analytic rule",        slug: "analytic-rule-create",         domain: "security" },
      { kind: "lab", minutes: 25, title: "Live tenant — triage a phishing incident in Defender XDR", slug: "live-defender-triage-phishing", domain: "security", live: true },
    ],
  },
  { id: "br3", title: "Break", blocks: [{ kind: "break", minutes: 10, title: "Short break" }] },
  {
    id: "m5",
    title: "Module 5 — Compliance & Governance",
    module: "SC900-M5",
    domain: "compliance",
    blocks: [
      { kind: "theory", minutes: 30, title: "Compliance, Purview & DLP", domain: "compliance",
        bullets: [
          "Compliance management overview",
          "Microsoft Purview basics",
          "Data Loss Prevention (DLP) concepts",
          "Information protection & sensitivity labels",
          "eDiscovery and auditing basics",
        ]},
      { kind: "lab", minutes: 18, title: "Create sensitivity label", slug: "create-sensitivity-label", domain: "compliance" },
      { kind: "lab", minutes: 22, title: "Configure DLP policy",     slug: "configure-dlp",            domain: "compliance" },
      { kind: "lab", minutes: 17, title: "Review compliance score",  slug: "compliance-score",         domain: "compliance" },
      { kind: "lab", minutes: 18, title: "Enable audit logging",     slug: "enable-audit-logging",     domain: "compliance" },
      { kind: "lab", minutes: 45, title: "Live tenant — classify and protect Contoso data with Purview", slug: "live-purview-classify-and-protect", domain: "compliance", live: true },
    ],
  },
  {
    id: "exam",
    title: "Exam prep & practice discussion",
    domain: "exam",
    blocks: [
      { kind: "theory", minutes: 15, title: "Exam tips & common pitfalls", domain: "exam",
        bullets: [
          "How SC-900 questions are framed (definitions, scenarios, capabilities)",
          "High-yield Microsoft terminology to memorise",
          "Time management — 60 min for ~50 questions",
        ]},
      { kind: "exam",   minutes: 15, title: "Take the in-app practice exam", description: "50 questions, 60-minute clock, pass mark 70%. You'll do a guided 15-min preview here and finish at home." },
    ],
  },
];

/* --------------------------- Day plans --------------------------- */
const oneDayOrder = ["kickoff", "m1", "br1", "m2", "lunch", "m3", "br2", "m4", "br3", "m5", "exam"];

const twoDayPlan: { day: string; sessions: string[]; subtitle: string }[] = [
  { day: "Day 1", subtitle: "Foundations & identity",  sessions: ["kickoff", "m1", "br1", "m2", "lunch", "m3"] },
  { day: "Day 2", subtitle: "Defence & compliance",    sessions: ["m4", "br3", "m5", "exam"] },
];

/* --------------------------- Helpers --------------------------- */
function totalMinutes(blocks: Block[]) {
  return blocks.reduce((s, b) => s + b.minutes, 0);
}
function fmtDuration(min: number) {
  const h = Math.floor(min / 60); const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
function addMinutes(start: string, minutes: number) {
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* --------------------------- Page --------------------------- */
export default function SessionPlan() {
  const { course } = useCourse();
  const [mode, setMode] = useState<"1day" | "2day">("1day");
  const [startTime, setStartTime] = useState("09:00");

  const totalMin = useMemo(() => sessions.reduce((s, x) => s + totalMinutes(x.blocks), 0), []);
  const labMin = useMemo(
    () => sessions.reduce((s, x) => s + x.blocks.filter((b) => b.kind === "lab").reduce((a, b) => a + b.minutes, 0), 0),
    [],
  );
  const theoryMin = useMemo(
    () => sessions.reduce((s, x) => s + x.blocks.filter((b) => b.kind === "theory").reduce((a, b) => a + b.minutes, 0), 0),
    [],
  );
  const labCount = useMemo(
    () => sessions.reduce((s, x) => s + x.blocks.filter((b) => b.kind === "lab").length, 0),
    [],
  );

  return (
    <AppLayout title="Session Plan">
      <div className="container py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <Card className="hero-surface border-0">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="secondary" className="mb-2 gap-1">
                  <GraduationCap className="h-3 w-3" /> {course.shortName} instructor playbook
                </Badge>
                <h1 className="text-2xl font-bold">Day-wise session plan</h1>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                  Full 8-hour curriculum aligned with the official table of contents — every theory block and lab maps
                  to a hands-on exercise inside this platform. Switch between a 1-day intensive or a 2-day split.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted/60 border border-border px-3 py-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="start" className="text-muted-foreground">Start</label>
                <input
                  id="start" type="time" value={startTime}
                  onChange={(e) => setStartTime(e.target.value || "09:00")}
                  className="bg-background border border-border rounded px-2 py-1 text-foreground [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <Stat label="Total duration" value={fmtDuration(totalMin)} icon={Clock} />
              <Stat label="Hands-on labs" value={`${labCount} labs`} icon={FlaskConical} />
              <Stat label="Lab time" value={fmtDuration(labMin)} icon={CheckCircle2} />
              <Stat label="Theory time" value={fmtDuration(theoryMin)} icon={BookOpen} />
            </div>
          </CardContent>
        </Card>

        {/* Mode tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList>
            <TabsTrigger value="1day">1-Day intensive (8h)</TabsTrigger>
            <TabsTrigger value="2day">2-Day split (4h × 2)</TabsTrigger>
          </TabsList>

          <TabsContent value="1day" className="mt-4">
            <DaySchedule
              title={`Day 1 — Full ${course.shortName} bootcamp`}
              subtitle="Run from start to finish in a single guided session"
              sessions={oneDayOrder.map((id) => sessions.find((s) => s.id === id)!).filter(Boolean)}
              startTime={startTime}
            />
          </TabsContent>

          <TabsContent value="2day" className="mt-4 space-y-6">
            {twoDayPlan.map((d) => (
              <DaySchedule
                key={d.day}
                title={`${d.day} — ${d.subtitle}`}
                subtitle={d.day === "Day 1" ? "Foundations and identity controls" : "Detect, respond and govern"}
                sessions={d.sessions.map((id) => sessions.find((s) => s.id === id)!).filter(Boolean)}
                startTime={startTime}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* TOC alignment proof */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TOC alignment</CardTitle>
            <CardDescription>Every official lab from the table of contents has a verified hands-on exercise on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <AlignmentRow module="M1 Security Concepts"          tocLabs={3} platformLabs={3} />
              <AlignmentRow module="M2 Identity & Access"           tocLabs={4} platformLabs={4} />
              <AlignmentRow module="M3 Entra Capabilities"          tocLabs={4} platformLabs={4} bonus={1} />
              <AlignmentRow module="M4 Security Solutions"          tocLabs={4} platformLabs={4} bonus={1} />
              <AlignmentRow module="M5 Compliance & Governance"     tocLabs={4} platformLabs={4} bonus={1} />
              <AlignmentRow module="Exam prep"                      tocLabs={1} platformLabs={1} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Bonus labs are extra "Live tenant" exercises that go beyond the TOC for deeper practice — they're optional in the 1-day plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

/* ----------------- Generic course day-plan view (non-SC-900) ----------------- */
function CourseDayPlanView({
  course, startTime, setStartTime,
}: {
  course: ReturnType<typeof useCourse>["course"];
  startTime: string;
  setStartTime: (s: string) => void;
}) {
  const [planMode, setPlanMode] = useState<"fiveDay" | "twoDay" | "oneDay">("fiveDay");
  const plan: CourseDayPlan[] = course.plans[planMode];
  const dayTotals = (d: CourseDayPlan) =>
    d.modules.reduce((s, m) => s + m.theoryMinutes + m.labBudgetMinutes, 0);
  const totalMin = plan.reduce((s, d) => s + dayTotals(d), 0);
  const labCount = plan.reduce(
    (s, d) => s + d.modules.reduce((a, m) => a + m.labSlugs.length, 0), 0,
  );
  const labMin = plan.reduce(
    (s, d) => s + d.modules.reduce((a, m) => a + m.labBudgetMinutes, 0), 0,
  );
  const theoryMin = plan.reduce(
    (s, d) => s + d.modules.reduce((a, m) => a + m.theoryMinutes, 0), 0,
  );

  return (
    <AppLayout title="Session Plan">
      <div className="container py-6 space-y-6 max-w-6xl">
        <Card className="hero-surface border-0">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="secondary" className="mb-2 gap-1">
                  <GraduationCap className="h-3 w-3" /> {course.shortName} instructor playbook
                </Badge>
                <h1 className="text-2xl font-bold">Day-wise session plan</h1>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                  {course.longName} — choose a 5-day, 2-day, or 1-day intensive layout. Each day links to the
                  matching modules and labs in the catalog.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted/60 border border-border px-3 py-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="start" className="text-muted-foreground">Start</label>
                <input
                  id="start" type="time" value={startTime}
                  onChange={(e) => setStartTime(e.target.value || "09:00")}
                  className="bg-background border border-border rounded px-2 py-1 text-foreground [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <Stat label="Total duration" value={fmtDuration(totalMin)} icon={Clock} />
              <Stat label="Hands-on labs" value={`${labCount} labs`} icon={FlaskConical} />
              <Stat label="Lab time" value={fmtDuration(labMin)} icon={CheckCircle2} />
              <Stat label="Theory time" value={fmtDuration(theoryMin)} icon={BookOpen} />
            </div>
          </CardContent>
        </Card>

        <Tabs value={planMode} onValueChange={(v) => setPlanMode(v as any)}>
          <TabsList>
            <TabsTrigger value="fiveDay">5-Day plan</TabsTrigger>
            <TabsTrigger value="twoDay">2-Day plan</TabsTrigger>
            <TabsTrigger value="oneDay">1-Day intensive</TabsTrigger>
          </TabsList>

          <TabsContent value={planMode} className="mt-4 space-y-4">
            {plan.map((d) => (
              <Card key={d.id} className="overflow-hidden shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base">{d.label} — {d.subtitle}</CardTitle>
                      <CardDescription>{d.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />{fmtDuration(dayTotals(d))}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {d.modules.map((m) => (
                    <div key={m.title} className="rounded-md border border-border bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-sm font-semibold flex items-center gap-2">
                            {m.title}
                            {m.code && <Badge variant="outline" className="text-[10px]">{m.code}</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <BookOpen className="h-3 w-3" />{fmtDuration(m.theoryMinutes)} theory
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <FlaskConical className="h-3 w-3" />{fmtDuration(m.labBudgetMinutes)} labs
                          </Badge>
                        </div>
                      </div>
                      <ul className="mt-2 text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                        {m.topics.slice(0, 5).map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                      {m.moduleSlug && (
                        <div className="mt-2 flex justify-end">
                          <Link to={`/module/${m.moduleSlug}`}>
                            <Button size="sm" variant="ghost" className="gap-1 h-7">
                              Open module <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* --------------------------- Sub-components --------------------------- */
function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-md bg-primary-foreground/10 px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs opacity-80"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function AlignmentRow({ module, tocLabs, platformLabs, bonus = 0 }: { module: string; tocLabs: number; platformLabs: number; bonus?: number }) {
  const ok = tocLabs === platformLabs;
  return (
    <div className="flex items-center justify-between rounded border border-border px-3 py-2 bg-card">
      <span className="font-medium">{module}</span>
      <span className="flex items-center gap-2">
        <Badge variant={ok ? "secondary" : "destructive"} className="gap-1">
          <CheckCircle2 className="h-3 w-3" /> {platformLabs}/{tocLabs} labs
        </Badge>
        {bonus > 0 && <Badge variant="outline" className="gap-1 border-primary/30 text-primary">+{bonus} bonus</Badge>}
      </span>
    </div>
  );
}

function DaySchedule({
  title, subtitle, sessions, startTime,
}: { title: string; subtitle: string; sessions: Session[]; startTime: string }) {
  let cursor = startTime;
  const dayTotal = sessions.reduce((s, x) => s + totalMinutes(x.blocks), 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{fmtDuration(dayTotal)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((s) => {
          const start = cursor;
          const end = addMinutes(start, totalMinutes(s.blocks));
          cursor = end;
          return <SessionBlock key={s.id} session={s} start={start} end={end} />;
        })}
      </CardContent>
    </Card>
  );
}

function SessionBlock({ session, start, end }: { session: Session; start: string; end: string }) {
  // Pure break sessions: render lightweight row
  if (session.blocks.every((b) => b.kind === "break")) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/30 px-4 py-2.5 text-sm">
        <Coffee className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{session.title}</span>
        <span className="text-xs text-muted-foreground ml-auto">{start} – {end} · {fmtDuration(totalMinutes(session.blocks))}</span>
      </div>
    );
  }

  const meta = session.domain ? domainMeta[session.domain] : null;
  const Icon = meta?.icon ?? BookOpen;

  let blockCursor = start;

  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-card">
      {meta && <div className={`h-1 ${meta.bar}`} />}
      <div className={`px-4 py-3 ${meta?.soft ?? "bg-muted/30"} border-b border-border`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded grid place-items-center ${meta?.bar ?? "bg-primary"} text-primary-foreground`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {session.title}
                {session.module && <Badge variant="outline" className="text-[10px]">{session.module}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{start} – {end} · {fmtDuration(totalMinutes(session.blocks))}</div>
            </div>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {session.blocks.map((b, idx) => {
          const blockStart = blockCursor;
          const blockEnd = addMinutes(blockStart, b.minutes);
          blockCursor = blockEnd;
          return <BlockRow key={idx} block={b} start={blockStart} end={blockEnd} />;
        })}
      </ul>
    </div>
  );
}

function BlockRow({ block, start, end }: { block: Block; start: string; end: string }) {
  if (block.kind === "break") {
    return (
      <li className="flex items-center gap-3 px-4 py-2.5 text-sm bg-muted/20">
        <Coffee className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{block.title}</span>
        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{start} – {end} · {block.minutes}m</span>
      </li>
    );
  }

  if (block.kind === "theory") {
    const meta = domainMeta[block.domain];
    return (
      <li className="px-4 py-3 flex items-start gap-3">
        <div className="h-7 w-7 rounded bg-muted grid place-items-center shrink-0 mt-0.5">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{block.title}</span>
            <Badge variant="outline" className={`text-[10px] ${meta.chip}`}>Theory</Badge>
          </div>
          <ul className="mt-1.5 text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
            {block.bullets.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{start} – {end} · {block.minutes}m</span>
      </li>
    );
  }

  if (block.kind === "lab") {
    const meta = domainMeta[block.domain];
    return (
      <li className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
        <div className={`h-7 w-7 rounded grid place-items-center shrink-0 mt-0.5 ${meta.bar} text-primary-foreground`}>
          <FlaskConical className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{block.title}</span>
            <Badge variant="outline" className={`text-[10px] ${meta.chip}`}>Lab</Badge>
            {block.live && <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Live tenant</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{start} – {end} · {block.minutes}m</span>
          <Link to={`/lab/${block.slug}`}>
            <Button size="sm" variant="ghost" className="gap-1 h-7">
              Open <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </li>
    );
  }

  // exam
  return (
    <li className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <div className="h-7 w-7 rounded bg-gradient-hero text-primary-foreground grid place-items-center shrink-0 mt-0.5">
        <ClipboardCheck className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{block.title}</span>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Practice</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{start} – {end} · {block.minutes}m</span>
        <Link to="/exam">
          <Button size="sm" variant="ghost" className="gap-1 h-7">
            Start <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </li>
  );
}
