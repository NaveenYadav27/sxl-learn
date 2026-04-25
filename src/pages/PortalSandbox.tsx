import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PortalSimulator } from "@/components/simulators/PortalSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, ExternalLink, Sparkles, Info, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type Sim = "entra" | "defender" | "purview" | "sentinel";

const META: Record<Sim, { title: string; tagline: string; realUrl: string; learnUrl: string; color: string }> = {
  entra: {
    title: "Microsoft Entra",
    tagline: "Identity & access management — manage users, groups, RBAC, MFA, and Conditional Access.",
    realUrl: "https://entra.microsoft.com",
    learnUrl: "https://learn.microsoft.com/entra/",
    color: "domain-entra",
  },
  defender: {
    title: "Microsoft Defender XDR",
    tagline: "Unified incident & alert investigation across email, identity, endpoints, and cloud apps.",
    realUrl: "https://security.microsoft.com",
    learnUrl: "https://learn.microsoft.com/defender-xdr/",
    color: "domain-security",
  },
  purview: {
    title: "Microsoft Purview",
    tagline: "Information protection, DLP, audit, and compliance posture management.",
    realUrl: "https://purview.microsoft.com",
    learnUrl: "https://learn.microsoft.com/purview/",
    color: "domain-compliance",
  },
  sentinel: {
    title: "Microsoft Sentinel",
    tagline: "Cloud-native SIEM/SOAR — KQL hunting, analytic rules, and incident response.",
    realUrl: "https://portal.azure.com/#blade/Microsoft_Azure_Security_Insights/WorkspaceSelectorBlade",
    learnUrl: "https://learn.microsoft.com/azure/sentinel/",
    color: "primary-glow",
  },
};

export default function PortalSandbox() {
  const { sim } = useParams<{ sim: Sim }>();
  const kind: Sim = (sim && (sim in META) ? sim : "entra") as Sim;
  const meta = META[kind];

  const [labs, setLabs] = useState<{ slug: string; title: string; difficulty: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("labs")
        .select("slug, title, difficulty, sort_order")
        .eq("simulator", kind)
        .eq("is_published", true)
        .order("sort_order");
      setLabs(data ?? []);
    })();
  }, [kind]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Simulators" }, { label: meta.title }]} />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Free explore mode</Badge>
              <Badge variant="outline" className="text-[10px]">No scoring</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{meta.tagline}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={meta.learnUrl} target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4 mr-1.5" />MS Learn<ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={meta.realUrl} target="_blank" rel="noopener noreferrer">
                Open real portal<ExternalLink className="h-3 w-3 ml-1.5 opacity-60" />
              </a>
            </Button>
          </div>
        </header>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sandbox mode</AlertTitle>
          <AlertDescription>
            This is a free-explore environment — click around to learn the UI. For guided, scored practice with real
            objectives, start a lab below.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <PortalSimulator
                simulator={kind}
                expectedAction={{ type: "read", field: "sandbox" }}
                onValidate={() => { /* no-op in sandbox */ }}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Guided labs ({labs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {labs.length === 0 && <p className="text-xs text-muted-foreground">No labs published yet.</p>}
                {labs.map((l) => (
                  <Button
                    key={l.slug}
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between font-normal"
                  >
                    <Link to={`/lab/${l.slug}`}>
                      <span className="truncate">{l.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Want a real tenant?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>To practice in the actual Microsoft portal, you'll need a license or developer tenant.</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/licensing">View licensing guide</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
