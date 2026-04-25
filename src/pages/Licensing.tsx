import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sparkles, ExternalLink, CheckCircle2, Star, Building2, GraduationCap, Shield, Users,
  Gavel, Network, BookOpen, Info, Wallet, Wrench, Database,
} from "lucide-react";
import { useCourse } from "@/hooks/useCourse";

/* ---------------- SC-900 (Microsoft) tiers ---------------- */
const msTiers = [
  {
    name: "Microsoft 365 Developer Program",
    price: "Free",
    badge: "Best for SC-900 study",
    icon: GraduationCap,
    highlight: true,
    summary:
      "A free, renewable Microsoft 365 E5 sandbox tenant pre-populated with 25 demo users. Includes Entra ID P2, Defender for Office 365, Purview, and Intune.",
    includes: [
      "Microsoft Entra ID Premium P2 (Identity Protection, PIM)",
      "Defender for Office 365 Plan 2",
      "Microsoft Purview compliance suite",
      "Intune device management",
      "Power Platform & Teams",
    ],
    missing: ["Microsoft Sentinel (Azure subscription required)", "Defender for Endpoint live data"],
    cta: { label: "Join Developer Program", url: "https://developer.microsoft.com/microsoft-365/dev-program" },
  },
  {
    name: "Azure Free Account + Pay-as-you-go",
    price: "$200 free credit / 12 months",
    badge: "For Sentinel & Defender for Cloud",
    icon: Wallet,
    summary:
      "Required to deploy Microsoft Sentinel and Defender for Cloud. The free credit covers most SC-900 study needs (a Sentinel workspace runs ≈ $2–5/day on light ingestion).",
    includes: [
      "Azure subscription for Log Analytics workspace",
      "Microsoft Sentinel SIEM/SOAR",
      "Defender for Cloud (CSPM free tier)",
      "Azure Key Vault, Storage, networking",
    ],
    missing: ["Microsoft 365 workloads — pair with Dev Program tenant"],
    cta: { label: "Create Azure free account", url: "https://azure.microsoft.com/free/" },
  },
  {
    name: "Microsoft 365 Business Premium",
    price: "~$22 / user / month",
    badge: "Small business",
    icon: Building2,
    summary:
      "Production-ready license for SMBs. Includes Entra ID P1, Defender for Business, Intune, and Purview basics. Good if you already run a small org.",
    includes: ["Entra ID P1 (Conditional Access)", "Defender for Business", "Intune", "Purview Information Protection"],
    missing: ["Identity Protection (P2)", "Defender XDR full advanced hunting", "Sentinel"],
    cta: { label: "View plan", url: "https://www.microsoft.com/microsoft-365/business/microsoft-365-business-premium" },
  },
  {
    name: "Microsoft 365 E5 (Enterprise)",
    price: "~$57 / user / month",
    badge: "Full enterprise stack",
    icon: Star,
    summary:
      "The complete production stack. Everything in SC-900 — Defender XDR, Purview eDiscovery Premium, Entra ID P2, Insider Risk — at enterprise scale.",
    includes: [
      "Entra ID P2 + Identity Governance",
      "Defender XDR (Endpoint P2, Identity, Cloud Apps, Office 365 P2)",
      "Purview Premium (Insider Risk, Communication Compliance, eDiscovery Premium)",
      "Intune Suite",
    ],
    missing: ["Sentinel (still needs Azure subscription)"],
    cta: { label: "View E5 plan", url: "https://www.microsoft.com/microsoft-365/enterprise/e5" },
  },
];

const msPortalAccess = [
  { name: "Microsoft Entra admin center", url: "https://entra.microsoft.com", icon: Users, needs: "Any M365 tenant (P2 features need E5 or Entra ID P2)" },
  { name: "Microsoft Defender portal", url: "https://security.microsoft.com", icon: Shield, needs: "Defender for Business, E3, or E5" },
  { name: "Microsoft Purview portal", url: "https://purview.microsoft.com", icon: Gavel, needs: "Any M365 tenant (Premium features need E5)" },
  { name: "Microsoft Sentinel", url: "https://portal.azure.com", icon: Network, needs: "Azure subscription + Log Analytics workspace" },
  { name: "Microsoft Intune admin", url: "https://intune.microsoft.com", icon: Sparkles, needs: "Intune license (Business Premium, E3, E5)" },
];

const msResources = [
  { title: "Microsoft Learn", desc: "Official SC-900 learning path — free, self-paced.",
    url: "https://learn.microsoft.com/credentials/certifications/exams/sc-900/", label: "Open" },
  { title: "Exam page", desc: "Skills outline, scheduling, and study guide PDF.",
    url: "https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/", label: "Exam SC-900" },
  { title: "Microsoft Reactor", desc: "Free live workshops & SC-900 cram sessions.",
    url: "https://developer.microsoft.com/reactor/", label: "Browse events" },
];

/* ---------------- CIS-ITSM (ServiceNow) tiers ---------------- */
const snowTiers = [
  {
    name: "ServiceNow Developer Program",
    price: "Free",
    badge: "Best for CIS-ITSM study",
    icon: GraduationCap,
    highlight: true,
    summary:
      "A free Personal Developer Instance (PDI) running the latest ServiceNow release with full ITSM, CMDB, Service Catalog, and Knowledge applications.",
    includes: [
      "Full ITSM application suite (Incident, Problem, Change, Request)",
      "CMDB & Service Mapping (sample data)",
      "Service Catalog & Knowledge Management",
      "Performance Analytics demo data",
      "Studio, Flow Designer, and scripting access",
    ],
    missing: ["No production data", "Instance hibernates after 10 days idle (wake on demand)"],
    cta: { label: "Get a free PDI", url: "https://developer.servicenow.com/" },
  },
  {
    name: "Now Learning — Free training",
    price: "Free",
    badge: "Official courseware",
    icon: BookOpen,
    summary:
      "ServiceNow's official self-paced training portal. The CIS-ITSM exam blueprint and recommended courses are all free.",
    includes: [
      "ITSM Fundamentals on-demand course",
      "CIS-ITSM exam blueprint & prep guide",
      "Hands-on labs in a guided sandbox",
      "Practice questions",
    ],
    missing: ["Live instructor-led classes are paid"],
    cta: { label: "Open Now Learning", url: "https://nowlearning.servicenow.com/" },
  },
  {
    name: "Partner / Customer instance",
    price: "Provided by employer",
    badge: "Real-world practice",
    icon: Building2,
    summary:
      "If you work at a ServiceNow partner or customer, you likely have access to dev/test sub-prod instances — ideal for production-shaped data and real workflows.",
    includes: ["Production-shaped CMDB & Catalog", "Custom workflows & integrations", "Real SLAs & assignment groups"],
    missing: ["Access depends on your role", "Cannot freely break things"],
    cta: { label: "ServiceNow product overview", url: "https://www.servicenow.com/products/itsm.html" },
  },
];

const snowPortalAccess = [
  { name: "Personal Developer Instance", url: "https://developer.servicenow.com/dev.do", icon: Wrench, needs: "Free ServiceNow developer account" },
  { name: "Now Learning portal", url: "https://nowlearning.servicenow.com/", icon: BookOpen, needs: "Free Now account" },
  { name: "Docs (Product documentation)", url: "https://www.servicenow.com/docs", icon: Database, needs: "Public access" },
  { name: "Community", url: "https://www.servicenow.com/community", icon: Users, needs: "Free Now account" },
];

const snowResources = [
  { title: "Now Learning", desc: "Official ServiceNow self-paced learning paths.",
    url: "https://nowlearning.servicenow.com/", label: "Open" },
  { title: "CIS-ITSM exam page", desc: "Exam blueprint, scheduling, and prep guide.",
    url: "https://www.servicenow.com/services/training-and-certification.html", label: "Exam CIS-ITSM" },
  { title: "Developer Community", desc: "PDI tips, scripts, and ITSM how-tos from the community.",
    url: "https://www.servicenow.com/community", label: "Browse community" },
];

export default function Licensing() {
  const { course } = useCourse();
  const isItsm = course.code === "cis-itsm";

  const tiers = isItsm ? snowTiers : msTiers;
  const portalAccess = isItsm ? snowPortalAccess : msPortalAccess;
  const resources = isItsm ? snowResources : msResources;
  const portalSectionTitle = isItsm ? "Instance & portal access" : "Portal access checklist";
  const recommendedTitle = `Recommended path for ${course.shortName} candidates`;
  const recommendedBody = isItsm ? (
    <>
      <strong>ServiceNow Developer Program (free PDI)</strong> + <strong>Now Learning</strong> covers
      100% of CIS-ITSM hands-on objectives at zero cost. Use this app's simulator for guided practice,
      then replicate every flow in your PDI for muscle memory.
    </>
  ) : (
    <>
      <strong>Microsoft 365 Developer Program (free)</strong> + <strong>Azure free account</strong> covers
      ~95% of SC-900 hands-on objectives at zero cost. Use this app's simulators for guided practice, then
      replicate in your dev tenant for muscle memory.
    </>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Resources" }, { label: "Licensing guide" }]} />

        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">License & access guide</h1>
          <p className="text-muted-foreground max-w-3xl">{course.licensingFocus}</p>
        </header>

        <Alert className="border-primary/40 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">{recommendedTitle}</AlertTitle>
          <AlertDescription className="text-foreground/80">{recommendedBody}</AlertDescription>
        </Alert>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{isItsm ? "Instance options" : "License tiers"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tiers.map((t) => (
              <Card key={t.name} className={t.highlight ? "border-primary/50 shadow-md" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`grid h-9 w-9 place-items-center rounded ${t.highlight ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <t.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        <CardDescription className="text-xs">{t.price}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={t.highlight ? "default" : "secondary"} className="text-[10px]">{t.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t.summary}</p>

                  <div>
                    <div className="text-xs font-medium mb-1.5 text-foreground">Includes</div>
                    <ul className="space-y-1">
                      {t.includes.map((i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {t.missing.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1.5 text-foreground">Not included</div>
                      <ul className="space-y-1">
                        {t.missing.map((i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="h-3.5 w-3.5 inline-block text-center text-warning shrink-0">−</span>
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button asChild size="sm" variant={t.highlight ? "default" : "outline"} className="w-full">
                    <a href={t.cta.url} target="_blank" rel="noopener noreferrer">
                      {t.cta.label}<ExternalLink className="h-3 w-3 ml-1.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{portalSectionTitle}</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {portalAccess.map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-8 w-8 place-items-center rounded bg-muted shrink-0">
                        <p.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.needs}</div>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        Open<ExternalLink className="h-3 w-3 ml-1.5" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Free study resources</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {resources.map((r) => (
              <Card key={r.title}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{r.title}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />{r.label}<ExternalLink className="h-3 w-3 ml-1.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Pricing is indicative (USD, list price as of 2025) and varies by region, channel, and commitment term.
            Always verify with the vendor or your reseller before purchase.
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  );
}
