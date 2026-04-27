import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Cog, ArrowRight, Sparkles, Users, Briefcase, GraduationCap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";

const Index = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, hsl(var(--shadow-azure) / 0.25), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--shadow-ember) / 0.22), transparent 45%), radial-gradient(circle at 50% 50%, hsl(var(--shadow-gold) / 0.12), transparent 35%)",
        }}
      />
      <div className="relative container py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-6 border border-shadowx-gold/30 text-shadowx-gold">
          <Sparkles className="h-3 w-3" /> 7-Day Job Ready Programs · ₹999 Intro
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Choose Your <span className="text-shadowx-gradient">Career Path</span>
        </h1>
        <p className="mt-5 text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto">
          Start your career in Cybersecurity or IT Operations with hands-on training and interview preparation.
        </p>
      </div>
    </section>

    {/* Two-card chooser */}
    <section className="container -mt-12 md:-mt-16 pb-20 relative z-10">
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* SOC */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card">
          <div className="h-1.5 bg-gradient-security" />
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-security text-primary-foreground grid place-items-center mb-5">
              <Shield className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Cybersecurity</div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">SOC Analyst (SC-900)</h2>
            <p className="mt-3 text-muted-foreground">
              Learn SOC fundamentals, alerts, incident response, and prepare for cybersecurity interviews.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Bullet>Microsoft Defender, Entra & Sentinel hands-on</Bullet>
              <Bullet>Real alert triage & incident response</Bullet>
              <Bullet>SOC interview question bank</Bullet>
            </ul>
            <Link to="/soc" className="block mt-7">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Join SOC Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-3 text-center text-xs text-muted-foreground">7 days · ₹999 intro · batch starts this week</div>
          </CardContent>
        </Card>

        {/* ITSM */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card">
          <div className="h-1.5 bg-gradient-entra" />
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-entra text-primary-foreground grid place-items-center mb-5">
              <Cog className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold mb-1">IT Operations</div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">ITSM / ServiceNow</h2>
            <p className="mt-3 text-muted-foreground">
              Learn ITSM workflows, ticket handling, and prepare for ServiceNow and IT support roles.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Bullet>Incident, Problem, Change end-to-end</Bullet>
              <Bullet>CMDB, Service Catalog & Workflows</Bullet>
              <Bullet>ServiceNow / IT support interview prep</Bullet>
            </ul>
            <Link to="/itsm" className="block mt-7">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Join ITSM Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-3 text-center text-xs text-muted-foreground">7 days · ₹999 intro · batch starts this week</div>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Who it's for */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Built for people who want a job — not another certificate</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <Persona icon={GraduationCap} title="Freshers" desc="Get your first IT or cyber job." />
          <Persona icon={Users} title="Career switchers" desc="Move into security or IT ops with confidence." />
          <Persona icon={Briefcase} title="Stuck in interviews" desc="Crack the questions that keep failing you." />
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="container py-16 text-center">
      <h2 className="text-2xl md:text-3xl font-bold">Ready to start?</h2>
      <p className="mt-2 text-muted-foreground">Pick your program above. Batches start this week.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/soc"><Button size="lg" variant="default">Join SOC Program</Button></Link>
        <Link to="/itsm"><Button size="lg" variant="outline">Join ITSM Program</Button></Link>
      </div>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground text-center md:text-right">
          ShadowXLab Academy · Job-ready training in Cybersecurity & IT Operations.
        </div>
      </div>
    </footer>
  </div>
);

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-foreground/85">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Persona({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary grid place-items-center mx-auto mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export default Index;
