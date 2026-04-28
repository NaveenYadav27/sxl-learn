/**
 * /demo — read-only walkthrough of every interactive tool on the platform.
 *
 * Tools shown are filtered by the **active course** (via useCourse), so each
 * program (SC-900 / CIS-ITSM / PEN-200) only sees its own simulator stack.
 * Auth-gated but bypasses program-access so prospects/instructors can browse.
 */
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, Shield, Users, Gavel, Network, Terminal, Workflow, Building2 } from "lucide-react";
import { EntraSimulator } from "@/components/simulators/EntraSimulator";
import { PortalSimulator } from "@/components/simulators/PortalSimulator";
import { ServiceNowSimulator } from "@/components/simulators/ServiceNowSimulator";
import { KaliTerminalSimulator } from "@/components/simulators/KaliTerminalSimulator";
import { useCourse } from "@/hooks/useCourse";

const noop = () => {};

type CourseCode = "sc-900" | "cis-itsm" | "pen-200";

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
    render: () => <EntraSimulator expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "defender",
    name: "Defender XDR",
    icon: Shield,
    blurb: "Browse incidents, alerts, secure score & attack simulation — sample SOC data preloaded.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="defender" expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "purview",
    name: "Microsoft Purview",
    icon: Gavel,
    blurb: "Sensitivity labels, DLP policies, classified files — explore the full compliance portal.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="purview" expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "sentinel",
    name: "Microsoft Sentinel",
    icon: Network,
    blurb: "SIEM dashboards, KQL hunts & analytic rules — sample workspace ready.",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="sentinel" expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "tenant",
    name: "Live Tenant",
    icon: Building2,
    blurb: "Per-learner sandbox tenant powering the SC-900 live labs (10 users, 4 groups, 3 incidents seeded).",
    courses: ["sc-900"],
    render: () => <PortalSimulator simulator="entra" expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    icon: Workflow,
    blurb: "Incident, Problem, Change, Catalog, CMDB & Flow Designer — full instance with sample tickets.",
    courses: ["cis-itsm"],
    render: () => <ServiceNowSimulator expectedAction={{ type: "any" } as any} onValidate={noop} />,
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

export default function Demo() {
  const { course } = useCourse();
  const courseTools = useMemo(
    () => tools.filter((t) => t.courses.includes(course.code as CourseCode)),
    [course.code],
  );
  const [active, setActive] = useState<string>(courseTools[0]?.id ?? "");

  // Reset selected tab when the user switches course.
  useEffect(() => {
    if (courseTools.length && !courseTools.find((t) => t.id === active)) {
      setActive(courseTools[0].id);
    }
  }, [courseTools, active]);

  return (
    <AppLayout
      skipAccessGate
      title={`${course.shortName} Tool Demo`}
      breadcrumb={
        <div className="text-xs text-muted-foreground">
          Read-only walkthrough of the {course.shortName} simulator stack
        </div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>{course.shortName} Platform Demo</CardTitle>
              <Badge variant="outline">{course.code.toUpperCase()}</Badge>
            </div>
            <CardDescription>
              A guided look at every interactive tool used in <strong>{course.shortName}</strong>. Switch course from the
              sidebar to see a different program's tool stack. Click around freely — nothing is saved and no progress is
              tracked here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle className="text-sm">Live sandbox — sample data preloaded</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Every simulator below is fully interactive. Click, type, navigate, create records — the seeded sample
                tenant, tickets, alerts and labs are all there. Nothing here is scored or persisted to your real
                progress; for graded labs use the <strong>Course Catalog</strong>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {courseTools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No demo tools registered for this course yet.
            </CardContent>
          </Card>
        ) : (
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <t.icon className="h-5 w-5 text-primary" />
                      {t.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{t.blurb}</p>
                  </div>
                  <Badge variant="secondary">{course.shortName} simulator</Badge>
                </div>
                <div className="rounded-lg border border-border bg-card p-2 min-h-[600px]">
                  {active === t.id && t.render()}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
