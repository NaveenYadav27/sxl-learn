/**
 * /demo — interactive walkthrough of every tool on the platform.
 *
 * Default: shows only the tools for the **active course**.
 * Side-by-side: authorised users (admins, or learners with access to 2+
 * programs) can compare two courses' tool stacks in a split view.
 */
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Shield, Users, Gavel, Network, Terminal, Workflow, Building2, Columns2, Lock } from "lucide-react";
import { PortalSimulator } from "@/components/simulators/PortalSimulator";
import { ServiceNowSimulator } from "@/components/simulators/ServiceNowSimulator";
import { KaliTerminalSimulator } from "@/components/simulators/KaliTerminalSimulator";
import { useCourse } from "@/hooks/useCourse";
import { useAuth } from "@/hooks/useAuth";
import { useProgramAccess } from "@/hooks/useProgramAccess";
import { COURSES, COURSE_LIST, type CourseCode } from "@/lib/courses";

const noop = () => {};

type Tool = {
  id: string;
  name: string;
  icon: any;
  blurb: string;
  courses: CourseCode[];
  render: () => JSX.Element;
};

const tools: Tool[] = [
  {
    id: "entra",
    name: "Microsoft Entra",
    icon: Users,
    blurb: "Identity & access — users, groups, Conditional Access, MFA. Fully clickable with seeded tenant directory.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="entra" expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "defender",
    name: "Defender XDR",
    icon: Shield,
    blurb: "Browse incidents, alerts, secure score & attack simulation — sample SOC data preloaded.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="defender" expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "purview",
    name: "Microsoft Purview",
    icon: Gavel,
    blurb: "Sensitivity labels, DLP policies, classified files — explore the full compliance portal.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="purview" expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "sentinel",
    name: "Microsoft Sentinel",
    icon: Network,
    blurb: "SIEM dashboards, KQL hunts & analytic rules — sample workspace ready.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="sentinel" expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "tenant",
    name: "Live Tenant",
    icon: Building2,
    blurb: "Per-learner sandbox tenant powering the SC-900 live labs (10 users, 4 groups, 3 incidents seeded).",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="entra" expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    icon: Workflow,
    blurb: "Incident, Problem, Change, Catalog, CMDB & Flow Designer — full instance with sample tickets.",
    courses: ["cis-itsm"],
    render: () => <ServiceNowSimulator expectedAction={{ type: "any" } as any} onValidate={noop} demoMode />,
  },
  {
    id: "kali",
    name: "Kali Terminal",
    icon: Terminal,
    blurb: "Offensive-security shell — recon, exploitation, AD attacks. Try `nmap`, `whoami`, `ls`, `mimikatz`…",
    courses: ["pen-200"],
    render: () => <KaliTerminalSimulator expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
];

function toolsForCourse(code: CourseCode) {
  return tools.filter((t) => t.courses.includes(code));
}

/** Single course tool tabs panel — used in both single & split views. */
function CourseToolPanel({ courseCode, compact = false }: { courseCode: CourseCode; compact?: boolean }) {
  const course = COURSES[courseCode];
  const courseTools = useMemo(() => toolsForCourse(courseCode), [courseCode]);
  const [active, setActive] = useState<string>(courseTools[0]?.id ?? "");

  useEffect(() => {
    if (courseTools.length && !courseTools.find((t) => t.id === active)) {
      setActive(courseTools[0].id);
    }
  }, [courseTools, active]);

  if (courseTools.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No demo tools registered for {course.shortName} yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={active} onValueChange={setActive}>
      <TabsList className="flex flex-wrap h-auto gap-1">
        {courseTools.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
            <t.icon className="h-3.5 w-3.5" />
            <span className={compact ? "text-xs" : ""}>{t.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {courseTools.map((t) => (
        <TabsContent key={t.id} value={t.id} className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className={`${compact ? "text-base" : "text-lg"} font-semibold flex items-center gap-2`}>
                <t.icon className="h-5 w-5 text-primary" />
                {t.name}
              </h2>
              {!compact && <p className="text-sm text-muted-foreground">{t.blurb}</p>}
            </div>
            <Badge variant="secondary" className="shrink-0">{course.shortName}</Badge>
          </div>
          <div className={`rounded-lg border border-border bg-card p-2 ${compact ? "min-h-[520px]" : "min-h-[600px]"}`}>
            {active === t.id && t.render()}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function Demo() {
  const { course, courseCode, setCourseCode } = useCourse();
  const { isAdmin, isInstructor } = useAuth();
  const { programs, hasSoc, hasItsm } = useProgramAccess();

  // Authorisation for side-by-side: admins, instructors, or learners with
  // access to 2+ distinct programs.
  const canCompare = isAdmin || isInstructor || programs.length >= 2 || (hasSoc && hasItsm);

  const [splitMode, setSplitMode] = useState(false);
  const [secondCourse, setSecondCourse] = useState<CourseCode>(() => {
    const other = COURSE_LIST.find((c) => c.code !== courseCode);
    return (other?.code ?? courseCode) as CourseCode;
  });

  // Keep the secondary course different from the primary when primary changes.
  useEffect(() => {
    if (secondCourse === courseCode) {
      const other = COURSE_LIST.find((c) => c.code !== courseCode);
      if (other) setSecondCourse(other.code);
    }
  }, [courseCode, secondCourse]);

  const otherCourses = COURSE_LIST.filter((c) => c.code !== courseCode);

  return (
    <AppLayout
      skipAccessGate
      title={splitMode ? "Tool Demo — Side-by-Side" : `${course.shortName} Tool Demo`}
      breadcrumb={
        <div className="text-xs text-muted-foreground">
          {splitMode
            ? `Comparing ${course.shortName} ↔ ${COURSES[secondCourse].shortName}`
            : `Walkthrough of the ${course.shortName} simulator stack`}
        </div>
      }
      actions={
        canCompare ? (
          <div className="flex items-center gap-2">
            <Columns2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="split-mode" className="text-xs cursor-pointer">Side-by-side</Label>
            <Switch id="split-mode" checked={splitMode} onCheckedChange={setSplitMode} />
          </div>
        ) : null
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Platform Demo</CardTitle>
              <Badge variant="outline">{course.code.toUpperCase()}</Badge>
              {splitMode && <Badge variant="outline">{secondCourse.toUpperCase()}</Badge>}
            </div>
            <CardDescription>
              {splitMode
                ? "Two course simulator stacks side-by-side. Switch the primary course from the sidebar; pick the comparison course on the right."
                : `A guided look at every interactive tool used in ${course.shortName}. Switch course from the sidebar to see a different program's tool stack.`}{" "}
              Click around freely — nothing is saved here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTitle className="text-sm">Live sandbox — sample data preloaded</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Every simulator below is fully interactive. Click, type, navigate, create records — the seeded sample
                tenants, tickets, alerts and labs are all there. Nothing here is scored or persisted to your real
                progress; for graded labs use the <strong>Course Catalog</strong>.
              </AlertDescription>
            </Alert>

            {!canCompare && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Side-by-side comparison is available to admins, instructors, and learners enrolled in two or more programs.
              </div>
            )}
          </CardContent>
        </Card>

        {splitMode && canCompare ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Left:</span>
                <Select value={courseCode} onValueChange={(v) => setCourseCode(v as CourseCode)}>
                  <SelectTrigger className="h-8 w-[200px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.shortName} — {c.vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Right:</span>
                <Select value={secondCourse} onValueChange={(v) => setSecondCourse(v as CourseCode)}>
                  <SelectTrigger className="h-8 w-[200px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {otherCourses.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.shortName} — {c.vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setSplitMode(false)}>
                Exit split view
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <course.icon className={`h-4 w-4 ${course.accentClass}`} />
                  <h3 className="text-sm font-semibold">{course.shortName}</h3>
                  <Badge variant="outline" className="text-[10px]">{course.vendor}</Badge>
                </div>
                <CourseToolPanel courseCode={courseCode} compact />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  {(() => {
                    const Icon = COURSES[secondCourse].icon;
                    return <Icon className={`h-4 w-4 ${COURSES[secondCourse].accentClass}`} />;
                  })()}
                  <h3 className="text-sm font-semibold">{COURSES[secondCourse].shortName}</h3>
                  <Badge variant="outline" className="text-[10px]">{COURSES[secondCourse].vendor}</Badge>
                </div>
                <CourseToolPanel courseCode={secondCourse} compact />
              </div>
            </div>
          </div>
        ) : (
          <CourseToolPanel courseCode={courseCode} />
        )}
      </div>
    </AppLayout>
  );
}
