import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Network, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProgramMarketingHeader } from "@/components/ProgramMarketingHeader";
import { EnrollForm } from "@/components/EnrollForm";
import { ccnaThirtyDayPlan } from "@/lib/curriculumCcna";

const modules = [
  { d: "Module 01", t: "Network Fundamentals (20%)",         desc: "Network devices, topologies, cabling, TCP/UDP, IPv4 & IPv6 addressing, wireless principles, virtualization and switching concepts." },
  { d: "Module 02", t: "Network Access (20%)",               desc: "VLANs, 802.1Q trunks, CDP/LLDP, EtherChannel/LACP, Rapid PVST+, Cisco wireless architectures and WLC GUI." },
  { d: "Module 03", t: "IP Connectivity (25%)",              desc: "Routing table anatomy, forwarding decisions, IPv4/IPv6 static routing, single-area OSPFv2 and First Hop Redundancy Protocols." },
  { d: "Module 04", t: "IP Services (10%)",                  desc: "Inside source NAT, NTP, DHCP, DNS, SNMP, syslog, QoS PHB, SSH and TFTP/FTP." },
  { d: "Module 05", t: "Security Fundamentals (15%)",        desc: "Threats & mitigations, device hardening, ACLs, port security, DHCP snooping, DAI, AAA and wireless security (WPA/WPA2/WPA3)." },
  { d: "Module 06", t: "Automation & Programmability (10%)", desc: "Automation impact, controller-based / SDN, REST APIs, JSON, Ansible & Terraform, plus AI/ML in network operations." },
];

const learn = [
  "All 49 official CCNA 200-301 v1.1 sub-objectives — to depth",
  "Subnet and supernet IPv4 / IPv6 addresses on demand",
  "Configure and verify VLANs, trunks and Rapid PVST+ STP",
  "OSPFv2 single-area, static routing and FHRP concepts",
  "Inside-source NAT, DHCP relay, NTP, SSH and syslog",
  "Standard and extended ACLs plus L2 security (DAI, snooping)",
  "WLC GUI: build a WPA2 PSK WLAN end-to-end",
  "REST APIs, JSON, Ansible / Terraform and SDN basics",
];

const audience = [
  "Network engineers and helpdesk pros chasing CCNA",
  "Cybersecurity learners who need solid networking foundations",
  "Cloud and DevOps engineers who keep getting blocked by routing",
  "Students preparing for the official Cisco 200-301 exam",
];

const CcnaProgram = () => (
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
              <Network className="h-3 w-3" /> Cisco CCNA 200-301 v1.1 · 30-Day Cohort · Live
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Cisco <span className="text-shadowx-gradient">CCNA 200-301</span> in 30 Days
            </h1>
            <p className="mt-5 text-lg md:text-xl text-foreground/80 max-w-xl">
              A structured 30-day journey through every section of the official CCNA exam guide — network fundamentals, access, IP connectivity, services, security and automation. Hands-on with Packet Tracer, the WLC GUI and REST/JSON.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#enroll">
                <Button size="lg" className="gap-2 font-semibold">
                  Reserve a seat <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <div className="text-sm text-muted-foreground">
                <span className="text-shadowx-gold font-semibold">Cohort pricing announced soon</span> · ~1h–1.5h per day
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat n="30" l="Days" />
              <Stat n="6" l="Exam sections" />
              <Stat n="49" l="Sub-objectives" />
            </div>
          </div>

          <div id="enroll" className="lg:sticky lg:top-24">
            <EnrollForm program="ccna" programName="Cisco CCNA 200-301 30-Day Program" />
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
      <h2 className="text-2xl md:text-3xl font-bold text-center">Your CCNA Module Map</h2>
      <p className="text-center text-muted-foreground mt-2">
        Outcome: <span className="text-foreground font-medium">Pass the Cisco CCNA 200-301 exam — first attempt.</span>
      </p>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {modules.map((mod) => (
          <Card key={mod.d} className="border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-entra" />
            <CardContent className="p-5 pl-6">
              <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">{mod.d}</div>
              <h3 className="mt-1 font-semibold text-lg">{mod.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{mod.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* 30-day schedule */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">30-Day Schedule</h2>
        <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">
          ~1 hour to 1.5 hours per day, mapped 1:1 to the official Cisco TOC sub-objectives.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {ccnaThirtyDayPlan.map((d) => (
            <Card key={d.id} className="border-border">
              <CardContent className="p-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-shadowx-azure">{d.label}</div>
                <div className="mt-1 font-semibold text-sm">{d.subtitle}</div>
                <p className="mt-1.5 text-xs text-muted-foreground">{d.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Practice & exam */}
    <section className="container py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center">Hands-on labs & practice exam</h2>
      <p className="text-center text-muted-foreground mt-3 max-w-2xl mx-auto">
        Every module ships with self-checks plus Packet Tracer / WLC labs. The course closes with a full timed practice exam aligned to the official 200-301 v1.1 blueprint.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8 text-sm">
        {[
          "Subnetting and IPv6 addressing workshops",
          "VLAN, trunk and Rapid PVST+ labs",
          "Static routing and OSPFv2 single-area labs",
          "NAT, DHCP relay, NTP and SSH labs",
          "ACL, port security and DHCP snooping labs",
          "REST API + JSON walkthrough with Postman",
        ].map((d) => (
          <div key={d} className="flex items-start gap-2 rounded-lg border border-border bg-card p-4">
            <CheckCircle2 className="h-4 w-4 text-shadowx-azure mt-0.5 shrink-0" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </section>

    {/* FAQ */}
    <section className="bg-secondary/40 border-y border-border">
      <div className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">FAQ</h2>
        <Accordion type="single" collapsible className="mt-8 max-w-2xl mx-auto">
          <AccordionItem value="q1"><AccordionTrigger>Do I need prior networking experience?</AccordionTrigger><AccordionContent>No. Day 1–7 builds you up from zero — components, topologies, TCP/UDP and subnetting — before we touch any IOS commands.</AccordionContent></AccordionItem>
          <AccordionItem value="q2"><AccordionTrigger>What lab environment is used?</AccordionTrigger><AccordionContent>We use Cisco Packet Tracer for most labs (free with Cisco NetAcad). EVE-NG and CML topologies are provided as optional upgrades for advanced learners.</AccordionContent></AccordionItem>
          <AccordionItem value="q3"><AccordionTrigger>Is this aligned to the latest exam version?</AccordionTrigger><AccordionContent>Yes — the curriculum maps 1:1 to the CCNA 200-301 v1.1 (Aug 2024) exam guide and all six exam sections.</AccordionContent></AccordionItem>
          <AccordionItem value="q4"><AccordionTrigger>How much time per day?</AccordionTrigger><AccordionContent>Plan for ~1h–1.5h per day across the 30 days (≈ 35–45 hours total live + lab). Dedicated bootcamp / weekend formats are also available.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </section>

    <footer className="border-t border-border py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="xs" showWordmark showTagline />
        <div className="text-xs text-muted-foreground">CCNA 200-301 Program · ShadowXLab Academy</div>
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

export default CcnaProgram;
