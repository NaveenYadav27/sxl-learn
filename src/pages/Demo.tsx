/**
 * /demo — read-only walkthrough of every interactive tool on the platform.
 *
 * Auth-gated (any signed-in user) but bypasses the program-access gate so
 * prospects/instructors can showcase the full tool stack without enrollments.
 *
 * Each tool is rendered with a benign `expectedAction` that won't trigger any
 * destructive validation; `onValidate` is a no-op so nothing persists.
 */
import { useState } from "react";
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

const noop = () => {};

const tools = [
  {
    id: "entra",
    name: "Microsoft Entra",
    icon: Users,
    blurb: "Identity & access — users, groups, Conditional Access, MFA.",
    program: "SC-900",
    render: () => <EntraSimulator expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
  {
    id: "defender",
    name: "Defender XDR",
    icon: Shield,
    blurb: "Incidents, alerts, secure score, attack simulation.",
    program: "SC-900",
    render: () => <PortalSimulator simulator="defender" expectedAction={{ type: "read" } as any} onValidate={noop} />,
  },
  {
    id: "purview",
    name: "Microsoft Purview",
    icon: Gavel,
    blurb: "Sensitivity labels, DLP policies, classified files.",
    program: "SC-900",
    render: () => <PortalSimulator simulator="purview" expectedAction={{ type: "read" } as any} onValidate={noop} />,
  },
  {
    id: "sentinel",
    name: "Microsoft Sentinel",
    icon: Network,
    blurb: "SIEM dashboards & analytic rules.",
    program: "SC-900",
    render: () => <PortalSimulator simulator="sentinel" expectedAction={{ type: "read" } as any} onValidate={noop} />,
  },
  {
    id: "tenant",
    name: "Live Tenant",
    icon: Building2,
    blurb: "Per-learner sandbox tenant powering the SC-900 live labs.",
    program: "SC-900",
    render: () => (
      <PortalSimulator simulator="entra" expectedAction={{ type: "read" } as any} onValidate={noop} />
    ),
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    icon: Workflow,
    blurb: "Incident, Problem, Change, Catalog, CMDB & Flow Designer.",
    program: "CIS-ITSM",
    render: () => <ServiceNowSimulator expectedAction={{ type: "read" } as any} onValidate={noop} />,
  },
  {
    id: "kali",
    name: "Kali Terminal",
    icon: Terminal,
    blurb: "Offensive-security shell — recon, exploitation, AD attacks.",
    program: "PEN-200",
    render: () => <KaliTerminalSimulator expectedAction={{ type: "any" } as any} onValidate={noop} />,
  },
];

export default function Demo() {
  const [active, setActive] = useState(tools[0].id);

  return (
    <AppLayout
      skipAccessGate
      title="Tool Showcase"
      breadcrumb={
        <div className="text-xs text-muted-foreground">Read-only demo of every simulator on the platform</div>
      }
    >
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Platform Demo</CardTitle>
            </div>
            <CardDescription>
              A guided look at every interactive tool we ship — Entra, Defender, Purview, Sentinel, ServiceNow and the Kali
              terminal. Click around freely; nothing is saved and no progress is tracked here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle className="text-sm">Demo mode</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Validators are disabled. To run a real, scored lab, open the <strong>Course Catalog</strong> and pick a
                module from your enrolled program.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {tools.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                <t.icon className="h-3.5 w-3.5" />
                <span>{t.name}</span>
                <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0">{t.program}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tools.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <t.icon className="h-5 w-5 text-primary" />
                    {t.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t.blurb}</p>
                </div>
                <Badge variant="secondary">{t.program} simulator</Badge>
              </div>
              <div className="rounded-lg border border-border bg-card p-2 min-h-[600px]">
                {active === t.id && t.render()}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
