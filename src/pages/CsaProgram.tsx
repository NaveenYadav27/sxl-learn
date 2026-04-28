import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Radar, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const modules = [
  {
    d: "Module 01",
    t: "Security Operations and Management",
    desc: "How a SOC enhances an organization's security posture, focusing on the critical roles of people, technology, and processes.",
  },
  {
    d: "Module 02",
    t: "Understanding Cyber Threats, IoCs & Attack Methodology",
    desc: "Various cyberattacks, their IoCs, and the tactics, techniques and procedures (TTPs) cybercriminals use.",
  },
  {
    d: "Module 03",
    t: "Log Management",
    desc: "Log management in SIEM — how logs are generated, stored, centrally collected, normalized, and correlated across systems.",
  },
  {
    d: "Module 04",
    t: "Incident Detection and Triage",
    desc: "SIEM fundamentals, deployment strategies, use case development, and how it helps SOC analysts detect anomalies, triage alerts, and report incidents.",
  },
  {
    d: "Module 05",
    t: "Proactive Threat Detection",
    desc: "Threat intelligence and threat hunting integrated with SIEM to reduce false positives and enable faster, more accurate alert triage.",
  },
  {
    d: "Module 06",
    t: "Incident Response",
    desc: "Stages of incident response and how the IRT collaborates with SOC to handle and respond to escalated incidents.",
  },
  {
    d: "Module 07",
    t: "Forensic Investigation and Malware Analysis",
    desc: "Forensic investigation and malware analysis in SOC operations to understand attack methods, identify IoCs, and enhance defenses.",
  },
  {
    d: "Module 08",
    t: "SOC for Cloud Environments",
    desc: "SOC processes in cloud environments — monitoring, detection, automated response, and security in AWS, Azure, and GCP using cloud-native tools.",
  },
];

const learn = [
  "End-to-end SOC operations & analyst workflow",
  "Cyber threats, IoCs & attacker TTPs",
  "Log management & SIEM correlation",
  "Alert triage & incident detection",
  "Threat intelligence & threat hunting",
  "Incident response lifecycle",
  "Forensics & malware analysis basics",
  "Cloud SOC across AWS, Azure & GCP",
];

const audience = [
  "Aspiring SOC analysts (L1 / L2)",
  "IT / network admins moving into security",
  "Cybersecurity students preparing for CSA / CEH-aligned roles",
  "Career switchers targeting Blue Team jobs",
];

const CsaProgram = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, hsl(var(--shadow-azure) / 0.28), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--shadow-ember) / 0.2), transparent 45%)",
        }}
      />
      <div className="relative container py-16 md:py-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All programs
        </Link>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-5 border border-shadowx-azure/40 text-shadowx-azure">
              <Radar className="h-3 w-3" /> Certified SOC Analyst · CSA Aligned · Live + Hands-on
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Certified SOC Analyst <span className="text-shadowx-gradient">(CSA)</span> Program
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Build deep Blue Team skills across SIEM, threat intelligence, incident response, forensics and cloud SOC — aligned to the EC-Council CSA syllabus.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#enroll">
                <Button size="lg" className="gap-2 font-semibold">
                  Secure My Seat for ₹999 <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <div className="text-sm text-muted-foreground">
                <span className="line-through opacity-60">₹4,999</span> · <span className="text-shadowx-gold font-semibold">₹999 intro</span> · batch starts this week
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="8" l="Modules" />
              <Stat n="40+" l="Hands-on labs" />
              <Stat n="CSA" l="Exam aligned" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="csa" programName="Certified SOC Analyst (CSA) Program" />
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

    {/* Module map */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your CSA Module Map</h2>
      <p className="text-center text-muted-foreground mt-2">
        Outcome: <span className="text-foreground font-medium">Job-ready as a SOC Analyst (L1 → L2).</span>
      </p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {modules.map((m) => (
          <Card key={m.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-security" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">{m.d}</div>
              <h3 className="mt-1 font-semibold text-lg">{m.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
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
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">Intro Price</div>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl font-bold text-shadowx-gradient">₹999</span>
              <span className="text-muted-foreground line-through">₹4,999</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Full program access · CSA aligned</div>
            <a href="#enroll" className="block mt-6">
              <Button size="lg" className="w-full font-semibold">Secure My Seat for ₹999</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* FAQ */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
      <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
        <AccordionItem value="q1"><AccordionTrigger>How is this different from the SC-900 SOC program?</AccordionTrigger><AccordionContent>SC-900 is a 7-day fundamentals + interview prep sprint. CSA is the deeper, EC-Council-aligned program covering SIEM, threat hunting, IR, forensics and cloud SOC.</AccordionContent></AccordionItem>
        <AccordionItem value="q2"><AccordionTrigger>Do I need prior experience?</AccordionTrigger><AccordionContent>Basic IT and networking knowledge helps. We cover SOC concepts from the ground up before diving into SIEM, threat intel and forensics.</AccordionContent></AccordionItem>
        <AccordionItem value="q3"><AccordionTrigger>Is this an official EC-Council course?</AccordionTrigger><AccordionContent>No. This is an independent prep program aligned to the EC-Council CSA syllabus to help you build the skills tested in the exam.</AccordionContent></AccordionItem>
        <AccordionItem value="q4"><AccordionTrigger>Are there hands-on labs?</AccordionTrigger><AccordionContent>Yes — every module includes guided labs covering log analysis, SIEM use cases, threat hunting, IR playbooks and cloud SOC monitoring.</AccordionContent></AccordionItem>
      </Accordion>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">Certified SOC Analyst (CSA) Program · ShadowXLab Academy</div>
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

export default CsaProgram;
