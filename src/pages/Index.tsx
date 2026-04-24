import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Users, Lock, Gavel, Sparkles, GraduationCap, Trophy, Zap,
  CheckCircle2, ArrowRight, Network, Brain,
} from "lucide-react";

const domains = [
  { icon: Shield, name: "Concepts", desc: "Zero Trust, Defense in Depth, Encryption", weight: "10–15%", grad: "bg-gradient-concepts" },
  { icon: Users, name: "Microsoft Entra", desc: "Identity, MFA, Conditional Access, PIM", weight: "25–30%", grad: "bg-gradient-entra" },
  { icon: Lock, name: "Security Solutions", desc: "Defender XDR, Sentinel, Secure Score", weight: "25–30%", grad: "bg-gradient-security" },
  { icon: Gavel, name: "Compliance", desc: "Purview, DLP, Insider Risk, eDiscovery", weight: "25–30%", grad: "bg-gradient-compliance" },
];

const features = [
  { icon: Network, title: "High-fidelity simulators", desc: "Practise inside pixel-accurate Entra, Defender, Purview and Sentinel twins. No Azure subscription needed." },
  { icon: Brain, title: "AI tutor on every step", desc: "Get hints, explanations and 'why this matters' coaching from a Gemini-powered SC-900 tutor — without giving away answers." },
  { icon: Zap, title: "Real industry scenarios", desc: "Triage Midnight Blizzard, MFA bombing, India DPDP-Act DLP, departing-employee data theft, and more." },
  { icon: GraduationCap, title: "Instructor cockpit", desc: "Trainers see live cohort progress, scores and stuck learners during VILT sessions." },
  { icon: Trophy, title: "Badges & SC-900 readiness score", desc: "Earn Identity Pro, SOC Analyst, Compliance Champion and the SC-900 Ready trophy." },
  { icon: CheckCircle2, title: "Maps to every exam objective", desc: "22 hands-on labs covering every sub-objective in Microsoft's official SC-900 study guide." },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    {/* Top bar */}
    <header className="border-b border-border bg-card">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">Enterprise Twin</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary-soft text-primary font-medium">SC-900</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth?mode=signup"><Button size="sm">Get started</Button></Link>
        </nav>
      </div>
    </header>

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div className="relative container py-20 md:py-28 text-primary-foreground">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur px-3 py-1 text-xs font-medium mb-6 border border-primary-foreground/20">
            <Sparkles className="h-3 w-3" /> Practise Microsoft Security on a high-fidelity twin
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            The hands-on way to <span className="text-primary-glow">pass SC-900</span> and actually understand it.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/85 max-w-2xl">
            22 interactive labs inside simulated Microsoft Entra, Defender XDR, Purview and Sentinel — guided by an AI tutor, scored in real time, no Azure tenant required.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                Browse the 22 labs
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            <Stat n="22" l="Hands-on labs" />
            <Stat n="4" l="Exam domains" />
            <Stat n="100%" l="Objective coverage" />
          </div>
        </div>
      </div>
    </section>

    {/* Domains */}
    <section className="container py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Cover every SC-900 exam domain</h2>
        <p className="mt-3 text-muted-foreground">Each domain is broken into bite-sized interactive labs that mirror real Microsoft admin centers.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {domains.map((d) => (
          <Card key={d.name} className="overflow-hidden border-border shadow-card hover:shadow-elevated transition-shadow">
            <div className={`h-1.5 ${d.grad}`} />
            <CardContent className="pt-6">
              <div className={`h-10 w-10 rounded grid place-items-center ${d.grad} text-primary-foreground mb-4`}>
                <d.icon className="h-5 w-5" />
              </div>
              <div className="text-xs text-muted-foreground font-medium">EXAM WEIGHT {d.weight}</div>
              <h3 className="mt-1 font-semibold text-lg">{d.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Built like a Microsoft portal. Taught like a tutor.</h2>
          <p className="mt-3 text-muted-foreground">Every detail engineered so muscle memory transfers to the real thing.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="border-border shadow-card">
              <CardContent className="pt-6">
                <div className="h-9 w-9 rounded grid place-items-center bg-primary-soft text-primary mb-4">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="container py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-bold">Ready to earn your SC-900?</h2>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Free to start. No credit card. Instant access to all 22 simulated labs and the AI tutor.</p>
      <Link to="/auth?mode=signup" className="inline-block mt-8">
        <Button size="lg" className="gap-2">Create free account <ArrowRight className="h-4 w-4" /></Button>
      </Link>
    </section>

    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      Enterprise Twin · An independent SC-900 training simulator. Not affiliated with Microsoft.
    </footer>
  </div>
);

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary-glow">{n}</div>
      <div className="text-xs uppercase tracking-wider text-primary-foreground/70">{l}</div>
    </div>
  );
}

export default Index;
