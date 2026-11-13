import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Cog, Crosshair, Radar, Container, ArrowRight,
  Sparkles, Users, Briefcase, GraduationCap, CheckCircle2,
  Terminal, Network, Cloud, Lock, ChevronRight, Activity, Flame
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <ProgramMarketingHeader />

    {/* Hero */}
    <section className="relative overflow-hidden border-b border-border">
      {/* Deep obsidian base */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Premium ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 65% 55% at 20% 25%, hsl(var(--shadow-azure) / 0.28), transparent 60%), radial-gradient(ellipse 55% 45% at 80% 75%, hsl(var(--shadow-ember) / 0.20), transparent 55%), radial-gradient(ellipse 40% 30% at 50% 40%, hsl(var(--shadow-gold) / 0.08), transparent 65%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--shadow-azure)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--shadow-azure)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)",
        }}
      />

      {/* Top brand accent stripe */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-shadowx-azure/70 to-transparent" />

      <div className="relative container py-20 md:py-28 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-shadowx-obsidian/80 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] mb-7 border border-shadowx-azure/40 text-shadowx-azure shadow-glow-azure">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-shadowx-azure opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-shadowx-azure" />
          </span>
          ShadowXLab Enterprise Cybersecurity Ecosystem
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] text-white max-w-4xl mx-auto">
          Operational Mastery for
          <br />
          <span className="text-shadowx-gradient">Cyber Defense & Engineering.</span>
        </h1>

        {/* Brand philosophy statement */}
        <div className="mt-4 text-xs font-mono uppercase tracking-[0.25em] text-shadowx-gold/90">
          Empower · Illuminate · Uphold · Defend
        </div>

        {/* Subheadline */}
        <p className="mt-6 text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
          Enterprise learning environments engineered for Blue Team SOC Analysts, Penetration Testers, and Cloud Infrastructure Engineers. Real SIEM simulations, deterministic investigation labs, and interview-ready outcomes.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href="#flagship-pathway">
            <Button size="lg" className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
              Explore Learning Pathway <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <Link to="/ops/academy">
            <Button size="lg" variant="outline" className="gap-2 font-semibold border-shadowx-azure/60 text-shadowx-azure hover:bg-shadowx-azure/10">
              <Terminal className="h-4 w-4" /> Launch SOC Academy Simulator
            </Button>
          </Link>
          <a href="#all-programs">
            <Button size="lg" variant="ghost" className="gap-2 font-semibold text-white/80 hover:text-white">
              View All Programs
            </Button>
          </a>
        </div>

        {/* Enterprise trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-shadowx-azure" />
            <span>Educational SIEM & EDR Simulators</span>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-shadowx-azure" />
            <span>Deterministic Attack Scenarios</span>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-shadowx-azure" />
            <span>MITRE ATT&CK & SPL Practice</span>
          </div>
          <div className="hidden sm:block h-3.5 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-shadowx-azure" />
            <span>Industry Syllabus Alignment</span>
          </div>
        </div>
      </div>
    </section>

    {/* FLAGSHIP CYBERSECURITY LEARNING PATHWAY */}
    <section id="flagship-pathway" className="container py-16 md:py-24 border-b border-border">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary mb-3">
          <Shield className="h-3.5 w-3.5" /> Flagship Professional Pathway
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          From Fundamentals to Elite Cyber Operations
        </h2>
        <p className="mt-3 text-muted-foreground text-base">
          A coherent, progressive 3-tier cybersecurity pathway designed to take learners from foundational security principles into hands-on defensive SOC analysis and offensive ethical hacking.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {/* Stage 1 */}
        <Card className="border-border bg-card/60 backdrop-blur relative overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 bg-gradient-security" />
          <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-shadowx-azure">Stage 01</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">Foundations</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-bold">Cybersecurity Fundamentals</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Master the foundational building blocks: networking architecture (OSI, TCP/IP, DNS), identity and access management (IAM), Windows & Linux OS telemetry, security terminology, and baseline threat models (SC-900 aligned).
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground/85 flex-1">
              <Bullet>TCP/IP, subnetting & firewall concepts</Bullet>
              <Bullet>Authentication, Kerberos & zero-trust identity</Bullet>
              <Bullet>System telemetry, Sysmon & event collection</Bullet>
              <Bullet>SC-900 security, compliance & identity essentials</Bullet>
            </ul>
            <div className="mt-6 pt-4 border-t border-border">
              <Link to="/soc" className="w-full block">
                <Button variant="outline" className="w-full gap-2 text-xs">
                  Review Fundamentals Track <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stage 2 */}
        <Card className="border-primary/50 shadow-glow-azure bg-card/80 backdrop-blur relative overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 bg-gradient-security" />
          <div className="absolute top-3 right-3">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 font-semibold">Core Focus</span>
          </div>
          <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-shadowx-azure">Stage 02</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">Blue Team Defense</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-security text-white grid place-items-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-bold">SOC Analyst & Incident Response</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Transition into active operational defense. Investigate real notables in Splunk ES and Microsoft Sentinel simulators, write SPL queries, map adversary tactics to MITRE ATT&CK, and execute incident containment.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground/85 flex-1">
              <Bullet>Real-time notable triage & dispositioning</Bullet>
              <Bullet>SPL search query design & threshold baselines</Bullet>
              <Bullet>Risk-Based Alerting (RBA) & entity correlation</Bullet>
              <Bullet>Ransomware, lateral movement & brute-force incident response</Bullet>
            </ul>
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <Link to="/ops/academy" className="w-full block">
                <Button className="w-full gap-2 text-xs font-semibold">
                  Enter SOC Academy Simulator <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/soc" className="w-full block">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
                  View SOC Analyst Syllabus
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stage 3 */}
        <Card className="border-border bg-card/60 backdrop-blur relative overflow-hidden flex flex-col justify-between">
          <div className="h-1.5 bg-gradient-security" />
          <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-shadowx-azure">Stage 03</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">Offensive Security</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-destructive/15 text-destructive grid place-items-center mb-4">
              <Crosshair className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-bold">CEH / Ethical Hacking & PEN-200</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Complete the security circle by thinking like an adversary. Conduct authorized reconnaissance, exploit web application vulnerabilities, escalate privileges in Windows/Linux environments, and document findings into executive-grade reports.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground/85 flex-1">
              <Bullet>Port scanning, enumeration & service profiling</Bullet>
              <Bullet>Web vulnerabilities (SQLi, XSS, SSRF, IDOR)</Bullet>
              <Bullet>Privilege escalation & credential extraction</Bullet>
              <Bullet>Active Directory attack vectors & OSCP+ methodologies</Bullet>
            </ul>
            <div className="mt-6 pt-4 border-t border-border">
              <Link to="/pen200" className="w-full block">
                <Button variant="outline" className="w-full gap-2 text-xs">
                  Explore PEN-200 / CEH Track <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* SOC ACADEMY SIMULATOR SPOTLIGHT */}
    <section className="bg-secondary/30 border-b border-border py-16">
      <div className="container">
        <div className="rounded-2xl border border-primary/30 bg-card/90 p-8 md:p-12 shadow-elevated relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none bg-gradient-to-l from-primary to-transparent" />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-mono uppercase tracking-wider text-primary mb-4">
                <Activity className="h-3.5 w-3.5" /> 10-Hour Hands-on Learning Simulator
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Inside the SOC Academy Simulator
              </h2>
              <p className="mt-4 text-foreground/80 leading-relaxed text-sm md:text-base">
                Experience a complete, educational Splunk ES-style operations center. Walk through 10 structured lessons combining learning objectives, terminology popovers, visual architecture diagrams, progressive 5-level hint ladders, live SPL search execution against deterministic incident datasets, and an integrated AI SOC Mentor.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-xs text-foreground/90">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>9 Deterministic Attack Scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Interactive Search & Reporting SPL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Notable Event Review & Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>MITRE ATT&CK Matrix Mapping</span>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/ops/academy">
                  <Button size="lg" className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                    Launch SOC Academy <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/ops/academy/labs">
                  <Button size="lg" variant="outline" className="gap-2 font-semibold">
                    Browse All 10 Labs
                  </Button>
                </Link>
                <Link to="/ops/academy/dictionary">
                  <Button size="lg" variant="ghost" className="gap-2 font-semibold">
                    SOC Dictionary (50+ Terms)
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-black/60 p-5 font-mono text-xs text-muted-foreground shadow-card">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success inline-block" />
                  <span className="ml-2 font-bold text-shadowx-azure">sxl-soc-simulator :: session-active</span>
                </div>
                <span className="text-muted-foreground">ES 7.3 Mimic</span>
              </div>
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <div className="text-shadowx-gold">[INFO] Ingesting Wineventlog, Sysmon, Firewall, DNS</div>
                <div className="text-foreground">[ALERT] ACAD-NOT-1042: Brute force burst detected on j.doe</div>
                <div className="text-muted-foreground">[SEARCH] index=auth EventCode=4625 | stats count by user, src_ip</div>
                <div className="text-success">[MATCH] 42 failed logons from 198.51.100.44 confirmed</div>
                <div className="text-foreground">[MITRE] Technique T1110.001 mapped to Credential Access</div>
                <div className="text-shadowx-azure">[DISPOSITION] True Positive - Escalated to Incident Response</div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span>Readiness Tracker: 10 Core SOC Skills</span>
                <span className="text-success font-semibold">Deterministic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ALL PROGRAMS CATALOG */}
    <section id="all-programs" className="container py-16 md:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Comprehensive Program Catalog</h2>
        <p className="mt-2 text-muted-foreground">
          Industry-aligned curricula in Cybersecurity, IT Operations, Penetration Testing, Cloud and DevOps.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* SOC */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-security" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-security text-white grid place-items-center mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Cybersecurity</div>
              <h3 className="font-display text-xl font-bold">SOC Analyst (SC-900)</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Learn SOC fundamentals, alert triage, incident response, and prepare for entry-level cybersecurity roles.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Microsoft Defender & Sentinel telemetry</Bullet>
                <Bullet>Real alert triage & incident investigation</Bullet>
                <Bullet>50+ SOC interview questions & answers</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/soc" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore SOC Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* ITSM */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-entra" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-entra text-white grid place-items-center mb-4">
                <Cog className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold mb-1">IT Operations</div>
              <h3 className="font-display text-xl font-bold">ITSM / ServiceNow</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Learn ITSM operational workflows, ticket resolution, and prepare for ServiceNow and IT service management roles.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Incident, Problem & Change Management</Bullet>
                <Bullet>CMDB, Service Catalog & SLA monitoring</Bullet>
                <Bullet>ServiceNow / IT support interview coaching</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/itsm" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore ITSM Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* PEN-200 */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-security" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-destructive/15 text-destructive grid place-items-center mb-4">
                <Crosshair className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Offensive Security</div>
              <h3 className="font-display text-xl font-bold">PEN-200 / OSCP+</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Penetration testing with Kali Linux. Build the practical methodology to pass OSCP+ and perform authorized assessments.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Web exploitation, SQLi & API attacks</Bullet>
                <Bullet>Windows & Linux privilege escalation</Bullet>
                <Bullet>Active Directory attack path enumeration</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/pen200" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore PEN-200 Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CSA */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-security" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-security text-white grid place-items-center mb-4">
                <Radar className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Blue Team · Advanced</div>
              <h3 className="font-display text-xl font-bold">Certified SOC Analyst</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Deep Blue Team training across SIEM, threat hunting, digital forensics, and cloud SOC aligned to the EC-Council CSA syllabus.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Log management, normalization & correlation</Bullet>
                <Bullet>Threat intelligence & threat hunting playbooks</Bullet>
                <Bullet>Multi-cloud SOC architecture (AWS/Azure/GCP)</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/csa" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore CSA Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* K8S */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-entra" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-entra text-white grid place-items-center mb-4">
                <Container className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold mb-1">DevOps · Containers</div>
              <h3 className="font-display text-xl font-bold">Kubernetes & Docker</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Containerize, deploy and troubleshoot workloads on Kubernetes with 16 downloadable enterprise lab guides and terminal practice.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Dockerfile optimization & multi-stage builds</Bullet>
                <Bullet>Pods, Deployments, Services & Ingress</Bullet>
                <Bullet>16 Hands-on enterprise labs + PDF guides</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/k8s" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore K8S Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CCNA */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-security" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Network className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure mb-1">Networking</div>
              <h3 className="font-display text-xl font-bold">Cisco CCNA (200-301)</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                A structured 30-day curriculum covering all official exam sections: IP connectivity, subnetting, switching, routing, and network automation.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>IPv4/IPv6 addressing & subnetting</Bullet>
                <Bullet>VLANs, trunking, STP & routing protocols</Bullet>
                <Bullet>Network security, ACLs & automation</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/ccna" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore CCNA Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CDL */}
        <Card className="overflow-hidden border-border shadow-elevated hover:shadow-glow transition-all hover:-translate-y-1 bg-card flex flex-col justify-between">
          <div>
            <div className="h-1.5 bg-gradient-entra" />
            <CardContent className="p-6">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                <Cloud className="h-5 w-5" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-gold mb-1">Cloud · Google Cloud</div>
              <h3 className="font-display text-xl font-bold">Google Cloud Digital Leader</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Master digital transformation, cloud concepts, and recommend the right Google Cloud product for any modern enterprise use-case.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                <Bullet>Compute Engine, GKE & Cloud Functions</Bullet>
                <Bullet>Storage, Cloud SQL, Spanner & BigQuery</Bullet>
                <Bullet>Cloud IAM, billing models & architecture</Bullet>
              </ul>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Link to="/cdl" className="block">
              <Button size="sm" className="w-full gap-2 font-semibold">
                Explore CDL Program <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>

    {/* WHO IT'S FOR */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Built for Practical Execution</h2>
          <p className="mt-2 text-sm text-muted-foreground">Designed for rigorous skills-development and job readiness.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <Persona icon={GraduationCap} title="Freshers & Graduates" desc="Build real hands-on lab proof and portfolio experience to secure your first cyber or IT role." />
          <Persona icon={Users} title="Career Switchers" desc="Transition from general IT, system administration, or development into cyber operations with structured practice." />
          <Persona icon={Briefcase} title="Practicing Analysts" desc="Sharpen SPL search fluency, incident triage speed, and MITRE ATT&CK mapping skills." />
        </div>
      </div>
    </section>

    {/* CTA / CONTACT */}
    <section className="container py-16 text-center">
      <h2 className="text-2xl md:text-3xl font-bold">Begin Your Skills Journey</h2>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Select a program above to view detailed lesson plans, or contact our admissions team for cohort schedules.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/ops/academy"><Button size="lg" className="bg-primary text-primary-foreground font-semibold">Launch SOC Academy</Button></Link>
        <Link to="/soc"><Button size="lg" variant="outline">SOC Analyst</Button></Link>
        <Link to="/itsm"><Button size="lg" variant="outline">ITSM</Button></Link>
        <Link to="/pen200"><Button size="lg" variant="outline">PEN-200</Button></Link>
        <Link to="/csa"><Button size="lg" variant="outline">CSA</Button></Link>
        <Link to="/k8s"><Button size="lg" variant="outline">Kubernetes</Button></Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border py-8 bg-card/40">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground text-center md:text-right">
          ShadowXLab Academy · Empower · Illuminate · Uphold · Defend
          <div className="mt-1 text-[11px] text-muted-foreground/80">
            Professional Cybersecurity & IT Operations Learning Ecosystem
          </div>
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
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

export default Index;
