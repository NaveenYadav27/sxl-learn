import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Cog, LogOut, Crosshair, Radar, Container, Cloud, Network, MessageSquare, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const programs = [
  { name: "SOC Analyst Program", path: "/soc", icon: Shield, grad: "bg-gradient-security", desc: "SC-900 & Blue Team Operations" },
  { name: "Certified SOC Analyst (CSA)", path: "/csa", icon: Radar, grad: "bg-gradient-security", desc: "EC-Council & Microsoft hybrid" },
  { name: "PEN-200 / OSCP+ Program", path: "/pen200", icon: Crosshair, grad: "bg-gradient-security", desc: "Offensive Security & Red Teaming" },
  { name: "Kubernetes & Docker Foundation", path: "/k8s", icon: Container, grad: "bg-gradient-entra", desc: "Cloud Native & Containerization" },
  { name: "Cisco CCNA 200-301", path: "/ccna", icon: Network, grad: "bg-gradient-concepts", desc: "Network Engineering & Routing" },
  { name: "Google Cloud Digital Leader", path: "/cdl", icon: Cloud, grad: "bg-gradient-concepts", desc: "GCP Architecture & Products" },
  { name: "ITSM / ServiceNow Program", path: "/itsm", icon: Cog, grad: "bg-gradient-entra", desc: "CIS-ITSM & Enterprise Workflows" },
];

const Pending = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/"><Logo size="sm" showWordmark showTagline /></Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12 max-w-4xl">
        <Card className="border-border shadow-elevated">
          <CardContent className="p-8 md:p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center mb-5">
              <Clock className="h-7 w-7 text-shadowx-azure" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-shadowx-azure/30 bg-shadowx-obsidian/70 px-3 py-1 text-xs text-shadowx-azure mb-3 font-mono">
              COHORT REGISTRATION RECEIVED
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Your Account is Active & Cohort is in Review</h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Welcome{user?.email ? <> <span className="text-foreground font-medium">{user.email}</span></> : ""}! Your registration has been received. Our admissions team assigns batches and activates full program access on a rolling 24-hour review.
            </p>

            <div className="mt-6 p-4 rounded-xl border border-shadowx-azure/30 bg-shadowx-azure/5 max-w-xl mx-auto flex items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-shadowx-azure font-semibold">Immediate Practice</div>
                <div className="text-sm font-medium mt-0.5">Explore the Kubernetes 2-Hour Interactive Sandbox</div>
              </div>
              <Link to="/k8s">
                <Button size="sm" className="gap-1 font-semibold shrink-0">
                  Launch K8s Preview <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-left">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Explore All ShadowX Lab Cohort Pathways
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {programs.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link key={p.path} to={p.path} className="block group">
                      <div className="rounded-xl border border-border bg-card hover:border-shadowx-azure/50 hover:bg-secondary/40 transition p-4 flex items-start gap-3 h-full">
                        <div className={`h-9 w-9 rounded ${p.grad} text-primary-foreground grid place-items-center shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm group-hover:text-shadowx-azure transition truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.desc}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-secondary/40 p-4 text-xs text-muted-foreground max-w-xl mx-auto">
              Need fast-track batch onboarding or have a corporate voucher? Contact our admissions desk directly via WhatsApp / Email and we'll activate your access right away.
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-xs text-muted-foreground text-center">ShadowXLab Enterprise Cybersecurity Ecosystem</div>
      </footer>
    </div>
  );
};

export default Pending;
