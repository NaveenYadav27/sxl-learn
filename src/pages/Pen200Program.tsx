import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Crosshair, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const modules = [
  { d: "Module 1", t: "Intro to Cybersecurity", desc: "Core concepts, technologies and best practices that form the bedrock of pentesting." },
  { d: "Module 2", t: "Report Writing", desc: "Craft clear, actionable reports detailing vulnerabilities, impact and remediation." },
  { d: "Module 3", t: "Information Gathering", desc: "Map targets and find attack surface with Nmap, Shodan and OSINT tooling." },
  { d: "Module 4", t: "Vulnerability Scanning", desc: "Identify known vulnerabilities with Nessus / OpenVAS and triage findings." },
  { d: "Module 5", t: "Intro to Web Applications", desc: "How web apps work, underlying tech and architectural weaknesses." },
  { d: "Module 6", t: "Common Web Attacks", desc: "Injection flaws, session hijacking, auth bypass and how to stop them." },
  { d: "Module 7", t: "SQL Injection", desc: "Manipulate databases to extract data, compromise backends and escalate." },
  { d: "Module 8", t: "Client-Side Attacks", desc: "Exploit browsers, extensions and client-side tech to gain access." },
  { d: "Module 9", t: "Locating Public Exploits", desc: "Find reliable exploits, assess them and integrate responsibly into testing." },
  { d: "Module 10", t: "Fixing Exploits", desc: "Adapt and customize exploits, obfuscate payloads, bypass defenses." },
  { d: "Module 11", t: "Antivirus Evasion", desc: "Disguise exploits and obfuscate payloads to evade AV detection." },
  { d: "Module 12", t: "Password Attacks", desc: "Brute-force, dictionary and rainbow-table attacks against weak auth." },
  { d: "Module 13", t: "Windows Privilege Escalation", desc: "Exploit Windows misconfigs to gain admin-level access." },
  { d: "Module 14", t: "Linux Privilege Escalation", desc: "Escalate to root on Linux servers and critical infrastructure." },
  { d: "Module 15", t: "Advanced Tunneling", desc: "Covert channels, pivoting, evasion and persistence." },
  { d: "Module 16", t: "Metasploit Framework", desc: "Exploit dev, payload generation and post-exploitation with Metasploit." },
  { d: "Module 17", t: "Active Directory: Enumeration", desc: "Enumerate users, groups, trusts with BloodHound and PowerView." },
  { d: "Module 18", t: "Attacking AD Authentication", desc: "Exploit Kerberos, NTLM and other AD auth weaknesses." },
  { d: "Module 19", t: "Lateral Movement in AD", desc: "Move laterally, expand control and reach engagement objectives." },
];

const learn = [
  "Penetration testing methodology",
  "Web application & SQL injection attacks",
  "Privilege escalation (Windows & Linux)",
  "Active Directory attack paths",
  "Exploit development & AV evasion",
  "Professional pentest reporting",
];

const audience = [
  "Aspiring penetration testers preparing for OSCP+",
  "SOC analysts moving into offensive security",
  "IT / network engineers targeting red team roles",
  "Security students who want a hands-on, exam-aligned path",
];

const Pen200Program = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, hsl(var(--shadow-ember) / 0.25), transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--shadow-azure) / 0.2), transparent 45%)",
        }}
      />
      <div className="relative container py-16 md:py-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All programs
        </Link>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-5 border border-shadowx-gold/40 text-shadowx-gold">
              <Crosshair className="h-3 w-3" /> OffSec PEN-200 · OSCP+ Prep · Live + Hands-on
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              PEN-200 <span className="text-shadowx-gradient">OSCP+ Prep</span> Program
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Penetration Testing with Kali Linux. Build the offensive mindset, hands-on skill and reporting craft to pass OSCP+ and work as a pentester.
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
              <Stat n="19" l="Modules" />
              <Stat n="100+" l="Hands-on labs" />
              <Stat n="OSCP+" l="Exam aligned" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="pen200" programName="PEN-200 / OSCP+ Program" />
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

    {/* Module map */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your PEN-200 Module Map</h2>
      <p className="text-center text-muted-foreground mt-2">Outcome: <span className="text-foreground font-medium">Ready to attempt the OSCP+ exam.</span></p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {modules.map((m) => (
          <Card key={m.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-security" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold">{m.d}</div>
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
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold">Intro Price</div>
            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="font-display text-5xl font-bold text-shadowx-gradient">₹999</span>
              <span className="text-muted-foreground line-through">₹4,999</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Full program access · OSCP+ aligned</div>
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
        <AccordionItem value="q1"><AccordionTrigger>Do I need prior experience?</AccordionTrigger><AccordionContent>Comfort with Linux command line and basic networking helps. We cover everything from fundamentals to advanced AD attacks.</AccordionContent></AccordionItem>
        <AccordionItem value="q2"><AccordionTrigger>Is this an official OffSec course?</AccordionTrigger><AccordionContent>No. This is an independent prep program aligned to the OffSec PEN-200 / OSCP+ syllabus to help you prepare for the exam.</AccordionContent></AccordionItem>
        <AccordionItem value="q3"><AccordionTrigger>Are there hands-on labs?</AccordionTrigger><AccordionContent>Yes — every module includes guided labs covering enumeration, exploitation, privilege escalation and AD attack paths.</AccordionContent></AccordionItem>
        <AccordionItem value="q4"><AccordionTrigger>What about reporting?</AccordionTrigger><AccordionContent>A dedicated module covers professional pentest report writing — the same skill assessed in the OSCP+ exam.</AccordionContent></AccordionItem>
      </Accordion>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">PEN-200 / OSCP+ Prep Program · ShadowXLab Academy</div>
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

export default Pen200Program;
