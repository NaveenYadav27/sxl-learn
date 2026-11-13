import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Cog, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const days = [
  { d: "Day 1", t: "ITSM basics", desc: "ITIL 4 in plain English, service value, key roles." },
  { d: "Day 2", t: "Incident management", desc: "Ticket lifecycle, priority/urgency, escalation." },
  { d: "Day 3", t: "Problem & knowledge", desc: "Root cause, known errors, knowledge base." },
  { d: "Day 4", t: "Change management", desc: "Standard / normal / emergency changes, CAB." },
  { d: "Day 5", t: "CMDB & catalog", desc: "Configuration items, relationships, request catalog." },
  { d: "Day 6", t: "Interview questions", desc: "Top 50 ServiceNow / IT support interview Q&A." },
  { d: "Day 7", t: "Resume & preparation", desc: "Resume polish, mock interview, next steps." },
];

const learn = [
  "ITSM fundamentals (ITIL 4)",
  "Incident management",
  "Problem and change management",
  "CMDB and Service Catalog",
  "Interview preparation",
];

const audience = [
  "Beginners in IT",
  "Freshers looking for first IT role",
  "Career switchers into IT operations",
  "Candidates struggling with ServiceNow interviews",
];

const ItsmProgram = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, hsl(var(--shadow-gold) / 0.22), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--shadow-azure) / 0.2), transparent 45%)",
        }}
      />
      <div className="relative container py-16 md:py-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All programs
        </Link>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-5 border border-shadowx-gold/40 text-shadowx-gold">
              <Cog className="h-3 w-3" /> ITSM / ServiceNow · Enterprise Service Operations · Hands-on Workflows
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              ITSM / ServiceNow <span className="text-shadowx-gradient">Job Ready</span> Program
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Start your IT career with ServiceNow and ITSM workflows. Become confident to attend ITSM / ServiceNow interviews.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#enroll">
                <Button size="lg" className="gap-2 font-semibold">
                  Apply for Cohort <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <div className="text-sm text-muted-foreground">
                <span className="text-shadowx-gold font-semibold">Live Interactive Cohort</span> · Simulated Incident, Problem, Change & CMDB
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="7" l="Days" />
              <Stat n="33+" l="Hands-on labs" />
              <Stat n="50" l="Interview Q&A" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="itsm" programName="ITSM / ServiceNow Program" />
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
                <Sparkles className="h-5 w-5 text-shadowx-gold mt-0.5 shrink-0" />
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
      <p className="text-center text-muted-foreground mt-2">Outcome: <span className="text-foreground font-medium">Ready to attend ITSM interviews.</span></p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {days.map((day) => (
          <Card key={day.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-entra" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold">{day.d}</div>
              <h3 className="mt-1 font-semibold text-lg">{day.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{day.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Admissions */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Admissions & Cohort Schedule</h2>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          Cohort batches are strictly limited to ensure direct mentor guidance, real-world ticket handling, and interview coaching.
        </p>
        <Card className="mt-8 max-w-md mx-auto border-primary/30 shadow-elevated">
          <CardContent className="p-8">
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold">Next Available Cohort</div>
            <div className="mt-2">
              <span className="font-display text-2xl font-bold text-foreground">Upcoming Live Batch</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">7 Days Intensive · Live Instructor · Hands-on ITSM Simulation</div>
            <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
              Applications are reviewed on a rolling basis. Onboarding credentials delivered upon enrollment acceptance.
            </div>
            <a href="#enroll" className="block mt-6">
              <Button size="lg" className="w-full font-semibold">Apply for Cohort</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* FAQ */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
      <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
        <AccordionItem value="q1"><AccordionTrigger>Is this beginner friendly?</AccordionTrigger><AccordionContent>Yes — we start from absolute basics. No prior IT or ServiceNow experience needed.</AccordionContent></AccordionItem>
        <AccordionItem value="q2"><AccordionTrigger>Is the training live?</AccordionTrigger><AccordionContent>Yes — daily live sessions, plus recordings and hands-on labs in our ServiceNow-style simulator.</AccordionContent></AccordionItem>
        <AccordionItem value="q3"><AccordionTrigger>What's the focus?</AccordionTrigger><AccordionContent>Interview preparation. Every day ends with the questions, scenarios, and resume material you need to crack ITSM / ServiceNow interviews.</AccordionContent></AccordionItem>
        <AccordionItem value="q4"><AccordionTrigger>Do I need a ServiceNow PDI?</AccordionTrigger><AccordionContent>Not required. We provide a full simulator. Optionally, you can connect your own free Personal Developer Instance.</AccordionContent></AccordionItem>
      </Accordion>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">ITSM / ServiceNow Job Ready Program · ShadowXLab Academy</div>
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

export default ItsmProgram;
