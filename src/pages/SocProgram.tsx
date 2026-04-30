import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const days = [
  { d: "Day 1", t: "SOC basics", desc: "What a SOC does, tiers, daily life of an analyst." },
  { d: "Day 2", t: "Security tools", desc: "Microsoft Defender XDR, Entra ID, Sentinel — what each does." },
  { d: "Day 3", t: "Alerts & logs", desc: "Reading alerts, sign-in logs, KQL basics." },
  { d: "Day 4", t: "Incident response", desc: "Triage, containment, escalation playbook." },
  { d: "Day 5", t: "Hands-on labs", desc: "Investigate phishing, MFA fatigue, risky sign-ins inside our simulator." },
  { d: "Day 6", t: "Interview questions", desc: "Top 50 SOC L1 interview Q&A drills." },
  { d: "Day 7", t: "Resume & preparation", desc: "Resume polish, mock interview, next steps." },
];

const learn = [
  "SOC fundamentals & analyst workflow",
  "Microsoft Defender, Entra & Sentinel",
  "Alert triage and log analysis",
  "Incident response basics",
  "Interview preparation",
];

const audience = [
  "Beginners in cybersecurity",
  "Career switchers",
  "Freshers looking for first cyber role",
  "People struggling in SOC interviews",
];

const SocProgram = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, hsl(var(--shadow-azure) / 0.3), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--shadow-ember) / 0.18), transparent 45%)",
        }}
      />
      <div className="relative container py-16 md:py-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All programs
        </Link>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-5 border border-shadowx-azure/40 text-shadowx-azure">
              <Shield className="h-3 w-3" /> SC-900 · 1hr Intro Batch @ ₹199 · Live
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              SOC Analyst <span className="text-shadowx-gradient">Job Ready</span> Program
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Break into cybersecurity with real SOC skills and interview preparation. Become confident to attend SOC Analyst interviews in 7 days.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#enroll">
                <Button size="lg" className="gap-2 font-semibold">
                  Reserve seat for ₹199 <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <div className="text-sm text-muted-foreground">
                <span className="text-shadowx-gold font-semibold">1hr Intro Batch · ₹199</span> · full program pricing TBA
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="7" l="Days" />
              <Stat n="22+" l="Hands-on labs" />
              <Stat n="50" l="Interview Q&A" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="soc" programName="SOC Analyst Program" />
          </div>
        </div>
      </div>
    </section>

    {/* Who this is for */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Who this is for</h2>
      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
        {audience.map((a) => (
          <div key={a} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm font-medium">{a}</span>
          </div>
        ))}
      </div>
    </section>

    {/* What you learn */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">What you learn</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {learn.map((l) => (
            <Card key={l} className="border-border">
              <CardContent className="p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-shadowx-azure mt-0.5 shrink-0" />
                <span className="font-medium">{l}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* 7-day plan */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your 7-Day Plan</h2>
      <p className="text-center text-muted-foreground mt-2">Outcome: <span className="text-foreground font-medium">Ready to attend SOC interviews.</span></p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {days.map((day, i) => (
          <Card key={day.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-security" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">{day.d}</div>
              <h3 className="mt-1 font-semibold text-lg">{day.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{day.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Pricing */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Pricing</h2>
        <Card className="mt-8 max-w-md mx-auto border-primary/30 shadow-elevated">
          <CardContent className="p-8">
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">1hr Intro Batch</div>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl font-bold text-shadowx-gradient">₹199</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">1 hour live · hands-on · seats limited</div>
            <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
              Full multi-day program pricing will be announced soon.
            </div>
            <a href="#enroll" className="block mt-6">
              <Button size="lg" className="w-full font-semibold">Reserve seat for ₹199</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* FAQ */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
      <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
        <AccordionItem value="q1"><AccordionTrigger>Is this beginner friendly?</AccordionTrigger><AccordionContent>Yes — we start from absolute basics. No prior cybersecurity experience needed.</AccordionContent></AccordionItem>
        <AccordionItem value="q2"><AccordionTrigger>Is the training live?</AccordionTrigger><AccordionContent>Yes — live sessions every day, plus recordings and on-demand hands-on labs in our simulator.</AccordionContent></AccordionItem>
        <AccordionItem value="q3"><AccordionTrigger>What's the focus?</AccordionTrigger><AccordionContent>Interview preparation. Every day ends with the questions, scenarios, and resume material you need to crack SOC L1 interviews.</AccordionContent></AccordionItem>
        <AccordionItem value="q4"><AccordionTrigger>Do I need an Azure tenant?</AccordionTrigger><AccordionContent>No. We provide a full simulator that mirrors Microsoft Defender, Entra and Sentinel — nothing to install.</AccordionContent></AccordionItem>
      </Accordion>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">SOC Analyst (SC-900) Job Ready Program · ShadowXLab Academy</div>
      </div>
    </footer>
  </div>
);

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-shadowx-gradient">{n}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-shadowx-gold/80 mt-1">{l}</div>
    </div>
  );
}

export default SocProgram;
