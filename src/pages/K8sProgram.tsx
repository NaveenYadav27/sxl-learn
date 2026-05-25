import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";

const modules = [
  {
    d: "Module 01",
    t: "Containerization Fundamentals & Docker Architecture",
    desc: "Why containers exist, how Docker is built, and how images, containers and registries fit together.",
  },
  {
    d: "Module 02",
    t: "Building Docker Images & Containerized Apps",
    desc: "Author Dockerfiles, build optimised images, tag them and push to a container registry.",
  },
  {
    d: "Module 03",
    t: "Kubernetes Fundamentals & Pod Architecture",
    desc: "Control plane, worker nodes, the Pod lifecycle and your first kubectl deployments.",
  },
  {
    d: "Module 04",
    t: "Deployments & Service Exposure",
    desc: "Scale workloads with Deployments and expose them through ClusterIP, NodePort and LoadBalancer Services.",
  },
  {
    d: "Module 05",
    t: "Monitoring, Troubleshooting & Capstone",
    desc: "Read logs and events, debug crashloops and ship the capstone: a multi-replica containerized app behind a Service.",
  },
];

const learn = [
  "Container fundamentals & Docker architecture",
  "Writing & optimising Dockerfiles",
  "Container registries & image distribution",
  "Kubernetes objects: Pods, Deployments, Services",
  "Cluster networking & service discovery",
  "Scaling, rolling updates & rollbacks",
  "Logs, events & debugging workflows",
  "Capstone: deploy a containerized app end-to-end",
];

const audience = [
  "DevOps & Platform Engineers",
  "Backend developers shipping services to Kubernetes",
  "SRE / Cloud engineers running container workloads",
  "Career switchers targeting cloud-native roles",
];

const K8sProgram = () => (
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
              <Container className="h-3 w-3" /> Kubernetes & Docker · 1hr Intro Batch @ ₹199 · Live
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Kubernetes & Docker <span className="text-shadowx-gradient">Containerization</span> Foundation
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              Become job-ready on the cloud-native stack. Build Docker images, deploy to a real Kubernetes cluster, expose services and ship a containerized capstone — all in an interactive in-browser terminal.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/module/k8s-containerization-fundamentals">
                <Button size="lg" className="gap-2 font-semibold bg-shadowx-gold text-black hover:bg-shadowx-gold/90">
                  Start free 2-hour preview <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/k8s/resources">
                <Button size="lg" variant="outline" className="gap-2 font-semibold border-shadowx-azure/50 text-shadowx-azure hover:bg-shadowx-azure/10">
                  Resource Center · 7 PDFs
                </Button>
              </Link>
              <a href="#enroll">
                <Button size="lg" variant="outline" className="gap-2 font-semibold">
                  Reserve seat for ₹199
                </Button>
              </a>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              No login needed · full course unlocked for 2 hours from your first click
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="5" l="Modules" />
              <Stat n="16h" l="Live + labs" />
              <Stat n="1" l="Capstone" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="k8s" programName="Kubernetes & Docker Foundation Program" />
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
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your Containerization Module Map</h2>
      <p className="text-center text-muted-foreground mt-2">
        Outcome: <span className="text-foreground font-medium">Ship a containerized app to Kubernetes — end-to-end.</span>
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

    {/* Capstone */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Capstone — Containerized Application Deployment</h2>
        <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">
          You'll build a Docker image for a sample app, push it to a registry, deploy it to a Kubernetes cluster with multiple replicas, expose it through a Service and demonstrate the running architecture.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 text-sm">
          {[
            "Docker image built from a clean Dockerfile",
            "Image pushed to a container registry",
            "Kubernetes Deployment with replicas",
            "Service endpoint exposed externally",
            "Logs & metrics demonstrating the workload",
            "Architecture documentation & demo readiness",
          ].map((d) => (
            <div key={d} className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="h-4 w-4 text-shadowx-azure mt-0.5 shrink-0" />
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="container py-16 text-center">
      <h2 className="text-2xl md:text-3xl font-bold">Pricing</h2>
      <Card className="mt-8 max-w-md mx-auto border-primary/30 shadow-elevated">
        <CardContent className="p-8">
          <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">1hr Intro Batch</div>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="font-display text-5xl font-bold text-shadowx-gradient">₹199</span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">1 hour live · Docker + Kubernetes taster · seats limited</div>
          <div className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            Full multi-day program pricing will be announced soon.
          </div>
          <a href="#enroll" className="block mt-6">
            <Button size="lg" className="w-full font-semibold">Reserve seat for ₹199</Button>
          </a>
        </CardContent>
      </Card>
    </section>

    {/* FAQ */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
          <AccordionItem value="q1"><AccordionTrigger>Do I need prior Docker or Kubernetes experience?</AccordionTrigger><AccordionContent>No. Basic Linux / command-line familiarity is enough. We start with what a container is and build up to deploying a multi-replica application on Kubernetes.</AccordionContent></AccordionItem>
          <AccordionItem value="q2"><AccordionTrigger>Do I need to install Docker or a cluster on my laptop?</AccordionTrigger><AccordionContent>Not for the labs — every module ships with an in-browser terminal that recognises real <code>docker</code> and <code>kubectl</code> commands. We also show you how to set up Kind / Minikube locally if you want to practise outside the platform.</AccordionContent></AccordionItem>
          <AccordionItem value="q3"><AccordionTrigger>Is this aligned to a certification?</AccordionTrigger><AccordionContent>The curriculum is foundation-level and prepares you for CKAD-style hands-on tasks. It is also the right base before tackling CKA, CKAD or cloud-provider Kubernetes certifications.</AccordionContent></AccordionItem>
          <AccordionItem value="q4"><AccordionTrigger>What does the capstone involve?</AccordionTrigger><AccordionContent>You'll containerize a sample app, push the image, deploy it to a Kubernetes cluster with multiple replicas, expose it through a Service and demonstrate the running architecture with logs and screenshots.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">Kubernetes & Docker Foundation Program · ShadowXLab Academy</div>
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

export default K8sProgram;
