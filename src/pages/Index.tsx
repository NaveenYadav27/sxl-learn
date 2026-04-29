import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Cog, Crosshair, Radar, Container, ArrowRight, Sparkles, Users, Briefcase, GraduationCap, CheckCircle2, Star } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";

const Index = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      {/* Deep obsidian base */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Premium ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 15% 20%, hsl(var(--shadow-azure) / 0.32), transparent 55%), radial-gradient(ellipse 55% 45% at 85% 80%, hsl(var(--shadow-ember) / 0.28), transparent 55%), radial-gradient(ellipse 40% 30% at 50% 50%, hsl(var(--shadow-gold) / 0.10), transparent 60%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--shadow-gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--shadow-gold)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* Top hairline brand stripe */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-shadowx-gold/60 to-transparent" />

      <div className="relative container py-24 md:py-32 text-center">
        {/* Eyebrow badge — refined */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-shadowx-obsidian/70 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] mb-8 border border-shadowx-gold/40 text-shadowx-gold shadow-glow-gold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-shadowx-gold opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-shadowx-gold" />
          </span>
          Cohort live · Batch starts this week
        </div>

        {/* Headline — editorial, larger, tighter */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.98] text-white">
          Engineered for the
          <br />
          <span className="text-shadowx-gradient">job you deserve.</span>
        </h1>

        {/* Subheadline — refined */}
        <p className="mt-7 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          Five elite programs in <span className="text-white font-medium">Cybersecurity</span>, <span className="text-white font-medium">IT Operations</span>, <span className="text-white font-medium">Offensive Security</span>, <span className="text-white font-medium">Blue Team SOC</span> and <span className="text-white font-medium">Kubernetes & Docker DevOps</span>. Live training, real labs, interview-ready outcomes.
        </p>

        {/* Trust row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-white/60">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-shadowx-gold" />
            <span>Hands-on labs</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-shadowx-gold" />
            <span>Live mentor support</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-shadowx-gold" />
            <span>Interview-focused</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-white/15" />
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-shadowx-gold text-shadowx-gold" />
            <span>4.9 / 5 from learners</span>
          </div>
        </div>

        {/* Price tag */}
        <div className="mt-10 inline-flex items-baseline gap-2 text-white/80">
          <span className="text-xs uppercase tracking-widest text-white/50">Intro pricing</span>
          <span className="font-display text-2xl font-bold text-shadowx-gold">₹999</span>
          <span className="text-xs text-white/40 line-through">₹4,999</span>
        </div>
      </div>

      {/* Bottom fade for seamless card overlap */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>

    {/* Two-card chooser */}
    <section className="container -mt-12 md:-mt-16 pb-20 relative z-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
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

        {/* PEN-200 */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card">
          <div className="h-1.5 bg-gradient-security" />
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-security text-primary-foreground grid place-items-center mb-5">
              <Crosshair className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Offensive Security</div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">PEN-200 / OSCP+</h2>
            <p className="mt-3 text-muted-foreground">
              Penetration testing with Kali Linux. Build the skills and mindset to pass OSCP+ and work as a pentester.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Bullet>Web, SQLi & client-side attacks</Bullet>
              <Bullet>Windows / Linux privilege escalation</Bullet>
              <Bullet>Active Directory attack paths</Bullet>
            </ul>
            <Link to="/pen200" className="block mt-7">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Join PEN-200 Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-3 text-center text-xs text-muted-foreground">OSCP+ aligned · ₹999 intro · batch starts this week</div>
          </CardContent>
        </Card>

        {/* CSA */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card">
          <div className="h-1.5 bg-gradient-security" />
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-security text-primary-foreground grid place-items-center mb-5">
              <Radar className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Blue Team · Advanced</div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Certified SOC Analyst (CSA)</h2>
            <p className="mt-3 text-muted-foreground">
              Deep Blue Team training across SIEM, threat hunting, IR, forensics and cloud SOC — aligned to the EC-Council CSA syllabus.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Bullet>SIEM, log management & correlation</Bullet>
              <Bullet>Threat intel, hunting & IR playbooks</Bullet>
              <Bullet>Forensics & cloud SOC (AWS / Azure / GCP)</Bullet>
            </ul>
            <Link to="/csa" className="block mt-7">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Join CSA Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-3 text-center text-xs text-muted-foreground">8 modules · ₹999 intro · batch starts this week</div>
          </CardContent>
        </Card>

        {/* K8S */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card">
          <div className="h-1.5 bg-gradient-entra" />
          <CardContent className="p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-entra text-primary-foreground grid place-items-center mb-5">
              <Container className="h-6 w-6" />
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold mb-1">DevOps · Cloud Native</div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Kubernetes & Docker</h2>
            <p className="mt-3 text-muted-foreground">
              Containerize, deploy and operate apps on Kubernetes. 16 hours of hands-on labs in a real in-browser docker + kubectl terminal.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Bullet>Docker images, Dockerfiles & registries</Bullet>
              <Bullet>Pods, Deployments & Services</Bullet>
              <Bullet>Capstone: ship a containerized app</Bullet>
            </ul>
            <Link to="/k8s" className="block mt-7">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Join K8S Program <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-3 text-center text-xs text-muted-foreground">5 modules · 16h · ₹999 intro</div>
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
        <Link to="/pen200"><Button size="lg" variant="outline">Join PEN-200 Program</Button></Link>
        <Link to="/csa"><Button size="lg" variant="outline">Join CSA Program</Button></Link>
        <Link to="/k8s"><Button size="lg" variant="outline">Join K8S Program</Button></Link>
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
