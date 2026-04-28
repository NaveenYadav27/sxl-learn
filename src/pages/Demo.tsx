/**
 * /demo — interactive walkthrough of every tool on the platform.
 *
 * Default: shows only the tools for the **active course** (or `?course=` param).
 * Authorised users (admins, instructors, or learners with 2+ programs) see
 * "Open in new tab" links for each course so they can right-click / middle-click
 * to compare courses side-by-side in separate browser windows.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, Shield, Users, Gavel, Network, Terminal, Workflow, Building2, ExternalLink, Lock } from "lucide-react";
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

function CourseToolPanel({ courseCode }: { courseCode: CourseCode }) {
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
            <span>{t.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {courseTools.map((t) => (
        <TabsContent key={t.id} value={t.id} className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <t.icon className="h-5 w-5 text-primary" />
                {t.name}
              </h2>
              <p className="text-sm text-muted-foreground">{t.blurb}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">{course.shortName}</Badge>
          </div>
          <div className="rounded-lg border border-border bg-card p-2 min-h-[600px]">
            {active === t.id && t.render()}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function Demo() {
  const { course, courseCode: activeCourseCode, setCourseCode } = useCourse();
  const { isAdmin, isInstructor } = useAuth();
  const { programs, hasSoc, hasItsm } = useProgramAccess();
  const [searchParams] = useSearchParams();

  // Authorisation for opening other courses in new tabs.
  const canCompare = isAdmin || isInstructor || programs.length >= 2 || (hasSoc && hasItsm);

  // If a `?course=` is present and valid, render that course (without changing
  // the user's globally-selected course). Otherwise use the active course.
  const paramCourse = searchParams.get("course") as CourseCode | null;
  const viewCourse: CourseCode =
    paramCourse && COURSES[paramCourse] ? paramCourse : activeCourseCode;
  const viewing = COURSES[viewCourse];
  const isPinned = paramCourse !== null && paramCourse !== activeCourseCode;

  const otherCourses = COURSE_LIST.filter((c) => c.code !== viewCourse);

  return (
    <AppLayout
      skipAccessGate
      title={`${viewing.shortName} Tool Demo`}
      breadcrumb={
        <div className="text-xs text-muted-foreground">
          Walkthrough of the {viewing.shortName} simulator stack
          {isPinned && <span className="ml-2 italic">(pinned via URL)</span>}
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Platform Demo</CardTitle>
              <Badge variant="outline">{viewing.code.toUpperCase()}</Badge>
            </div>
            <CardDescription>
              A guided look at every interactive tool used in {viewing.shortName}. Switch course from the sidebar to
              change this view, or open another course in a new tab below to compare side-by-side.
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

            {canCompare ? (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground">Open another course in a new tab:</span>
                {otherCourses.map((c) => {
                  const Icon = c.icon;
                  return (
                    <a
                      key={c.code}
                      href={`/demo?course=${c.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 hover:bg-muted transition-colors"
                      title={`Open ${c.shortName} demo in a new tab (right-click for more options)`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${c.accentClass}`} />
                      <span>{c.shortName}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  );
                })}
                {isPinned && (
                  <button
                    type="button"
                    onClick={() => setCourseCode(viewCourse)}
                    className="ml-1 text-muted-foreground underline hover:text-foreground"
                  >
                    Make {viewing.shortName} my active course
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Opening other courses side-by-side is available to admins, instructors, and learners enrolled in two or more programs.
              </div>
            )}
          </CardContent>
        </Card>

        <CourseToolPanel courseCode={viewCourse} />
      </div>
    </AppLayout>
  );
}
