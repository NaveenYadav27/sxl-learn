import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Cloud, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const modules = [
  { d: "Module 01", t: "Digital Transformation with Google Cloud", desc: "Cloud, cloud-native, on-prem vs hybrid vs multicloud and the IaaS/PaaS/SaaS shared responsibility model." },
  { d: "Module 02", t: "Exploring Data Transformation",            desc: "Databases, warehouses and lakes; pick the right Cloud SQL / Spanner / BigQuery / Bigtable / Firestore product." },
  { d: "Module 03", t: "Innovating with Google Cloud AI",          desc: "AI vs ML, the Google Cloud AI ladder, pre-trained APIs, BigQuery ML and Vertex AI." },
  { d: "Module 04", t: "Modernize Infrastructure & Applications",  desc: "Migration paths, Compute Engine, serverless (Cloud Run, App Engine, Functions), GKE and Apigee." },
  { d: "Module 05", t: "Trust & Security with Google Cloud",       desc: "Defense-in-depth, IAM, 2SV, Cloud Armor, transparency, data residency and compliance." },
  { d: "Module 06", t: "Scaling with Google Cloud Operations",     desc: "Resource hierarchy, budgets, TCO, reliability, SRE, support tiers and sustainability." },
];

const learn = [
  "What 'cloud' really means and why Google Cloud is differentiated",
  "Google Cloud product map — pick the right service per scenario",
  "Cloud Storage classes & BigQuery for data workloads",
  "AI ladder: pre-trained APIs → AutoML → Vertex AI",
  "IaaS / PaaS / SaaS and the shared responsibility model",
  "Compute Engine vs Cloud Run vs GKE — when to use what",
  "Trust, security, IAM and Cloud Armor fundamentals",
  "Resource hierarchy, budgets, SRE and sustainability",
];

const audience = [
  "Project managers, business analysts and product owners",
  "Cloud champions and pre-sales / customer success teams",
  "Engineers preparing for the official Cloud Digital Leader exam",
  "Anyone moving into a cloud-first organization",
];

const CdlProgram = () => (
  <div className="min-h-screen bg-background">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, hsl(var(--shadow-azure) / 0.30), transparent 45%), radial-gradient(circle at 85% 70%, hsl(var(--shadow-ember) / 0.18), transparent 45%)",
        }}
      />
      <div className="relative container py-16 md:py-24">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground gap-1 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All programs
        </Link>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-shadowx-obsidian/60 backdrop-blur px-3 py-1 text-xs font-medium mb-5 border border-shadowx-azure/40 text-shadowx-azure">
              <Cloud className="h-3 w-3" /> Google Cloud Digital Leader · Live Cohort Training
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Google <span className="text-shadowx-gradient">Cloud Digital Leader</span> Certification
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Learn to recommend the right Google Cloud product for any business scenario. All six exam sections, hands-on tours of the Google Cloud Console, and a full practice exam — built for non-engineers and engineers alike.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#enroll">
                <Button size="lg" className="gap-2 font-semibold">
                  Apply for Cohort <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <div className="text-sm text-muted-foreground">
                <span className="text-shadowx-azure font-semibold">Live Interactive Cohort</span> · Real Google Cloud Architecture Scenarios
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="6" l="Modules" />
              <Stat n="13h" l="Live + labs" />
              <Stat n="1" l="Practice exam" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="cdl" programName="Google Cloud Digital Leader Program" />
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
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {learn.map((l) => (
            <Card key={l} className="border-border">
              <CardContent className="p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-shadowx-azure mt-0.5 shrink-0" />
                <span className="font-medium text-sm">{l}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Module map */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your CDL Module Map</h2>
      <p className="text-center text-muted-foreground mt-2">
        Outcome: <span className="text-foreground font-medium">Pass the Google Cloud Digital Leader exam — first attempt.</span>
      </p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {modules.map((m) => (
          <Card key={m.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-entra" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">{m.d}</div>
              <h3 className="mt-1 font-semibold text-lg">{m.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* Practice & exam */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Practice exam & hands-on Console tour</h2>
        <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">
          Every module includes a 5-question self-check and a hands-on lab inside our Google Cloud Console simulator. Wrap up with a full timed practice exam aligned to the official CDL blueprint.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 text-sm">
          {[
            "Hands-on Cloud Console tours per module",
            "Cloud Storage class picker lab",
            "BigQuery public-dataset query lab",
            "Compute Engine vs Cloud Run scenario lab",
            "IAM role & audit log walkthrough",
            "Full timed CDL-style practice exam",
          ].map((d) => (
            <div key={d} className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="h-4 w-4 text-shadowx-azure mt-0.5 shrink-0" />
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Admissions */}
    <section className="container py-16 text-center">
      <h2 className="text-2xl md:text-3xl font-bold">Admissions & Cohort Schedule</h2>
      <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
        Interactive Google Cloud digital transformation and architectural guidance training.
      </p>
      <Card className="mt-8 max-w-md mx-auto border-primary/30 shadow-elevated">
        <CardContent className="p-8">
          <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">Next Available Cohort</div>
          <div className="mt-2">
            <span className="font-display text-2xl font-bold text-foreground">Upcoming Live Batch</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">6 Modules · 13h Live + Console Tours · Practice Exam</div>
          <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            Applications are reviewed on a rolling basis. Onboarding credentials delivered upon enrollment acceptance.
          </div>
          <a href="#enroll" className="block mt-6">
            <Button size="lg" className="w-full font-semibold">Apply for Cohort</Button>
          </a>
        </CardContent>
      </Card>
    </section>

    {/* FAQ */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
          <AccordionItem value="q1"><AccordionTrigger>Do I need a technical background?</AccordionTrigger><AccordionContent>No. Cloud Digital Leader is designed for business stakeholders. We explain every Google Cloud product in plain English first, then show you the Console.</AccordionContent></AccordionItem>
          <AccordionItem value="q2"><AccordionTrigger>Do I need a Google Cloud account for the labs?</AccordionTrigger><AccordionContent>Not for the platform labs — we ship a Google Cloud Console simulator. We also show you how to use the official $300 free-tier credits if you want to practise on the real console.</AccordionContent></AccordionItem>
          <AccordionItem value="q3"><AccordionTrigger>Is this aligned to the official exam?</AccordionTrigger><AccordionContent>Yes. The 6 modules map 1:1 to the published Cloud Digital Leader exam guide sections, and our practice exam mirrors the question style.</AccordionContent></AccordionItem>
          <AccordionItem value="q4"><AccordionTrigger>How long until I'm exam-ready?</AccordionTrigger><AccordionContent>Most candidates are ready after the 5-day plan (≈ 13 hours of live + lab time). The 2-day intensive and 1-day bootcamp options compress the same content for tight schedules.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">Cloud Digital Leader Program · ShadowXLab Academy</div>
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

export default CdlProgram;
