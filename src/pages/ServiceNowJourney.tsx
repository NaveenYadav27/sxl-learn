import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, BookOpen, Award, Activity, ClipboardCheck, FolderOpen, FileQuestion,
  CheckCircle2, Globe, Clock, Sparkles, Server,
} from "lucide-react";
import {
  cisItsmJourney, cisItsmDeltaQuizzes, NOW_LEARNING_URL,
  EXAM_REGISTRATION_URL, CREDENTIALING_GUIDE_URL, CREDLY_BADGE_INFO_URL,
  type JourneyResource,
} from "@/lib/nowLearningCisItsm";
import { Link } from "react-router-dom";

const kindMeta: Record<JourneyResource["kind"], { icon: any; label: string; tone: string }> = {
  course:     { icon: BookOpen,        label: "On-demand course",  tone: "text-domain-entra" },
  credential: { icon: Award,           label: "Credential",         tone: "text-warning" },
  simulator:  { icon: Activity,        label: "Simulator",          tone: "text-primary-glow" },
  exam:       { icon: ClipboardCheck,  label: "Pearson VUE exam",   tone: "text-success" },
  collection: { icon: FolderOpen,      label: "Learning collection",tone: "text-domain-compliance" },
  quiz:       { icon: FileQuestion,    label: "Practice quiz",      tone: "text-primary" },
};

function ResourceRow({ r }: { r: JourneyResource }) {
  const meta = kindMeta[r.kind];
  const Icon = meta.icon;
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-md border border-border bg-card hover:bg-muted/40 px-3 py-2.5 transition-colors group"
    >
      <div className={`h-8 w-8 rounded grid place-items-center bg-muted ${meta.tone} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{r.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{meta.label}</span>
          {r.durationLabel && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{r.durationLabel}</span>
          )}
          {r.language && (
            <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{r.language}</span>
          )}
        </div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
    </a>
  );
}

export default function ServiceNowJourney() {
  return (
    <AppLayout
      title="Official CIS-ITSM journey"
      breadcrumb={
        <Breadcrumb items={[{ label: "Dashboard", to: "/dashboard" }, { label: "ServiceNow journey" }]} />
      }
    >
      <div className="container py-6 space-y-6 max-w-5xl">
        {/* Hero */}
        <Card className="hero-surface border-0">
          <CardContent className="pt-6 flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-2 gap-1">
                <Server className="h-3 w-3" /> ServiceNow Now Learning
              </Badge>
              <h1 className="text-2xl font-bold text-foreground">
                Certified Implementation Specialist – IT Service Management (CIS-ITSM)
              </h1>
              <p className="mt-2 text-sm text-foreground/80">
                The official ServiceNow learning path for the CIS-ITSM certification. Use this page as your
                roadmap — Shadowx Lab covers the hands-on simulation and exam prep, while the resources
                below take you to ServiceNow's own training, the Pearson VUE exam, and the Credly badge.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={EXAM_REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2"><ClipboardCheck className="h-4 w-4" /> Register for exam</Button>
                </a>
                <a href={NOW_LEARNING_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2"><ExternalLink className="h-4 w-4" /> Open on Now Learning</Button>
                </a>
                <a href={CREDENTIALING_GUIDE_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" className="gap-2"><BookOpen className="h-4 w-4" /> Credentialing guide</Button>
                </a>
              </div>
            </div>
            <Card className="shadow-card border-primary/30 bg-card max-w-xs">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" /> How to use this with Shadowx
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Run our 5-day CIS-ITSM labs to build muscle memory.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Connect a real PDI from the dashboard for live practice.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Sit the official delta quizzes below before exam day.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> Book your Pearson VUE seat when you're consistently &gt; 85%.</li>
                </ul>
                <Link to="/dashboard" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  Back to my dashboard →
                </Link>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* 6-step roadmap */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Two ways to earn this achievement</h2>
          <p className="text-sm text-muted-foreground">
            The official journey has six steps. Each one links to the matching resource on Now Learning.
          </p>

          <div className="space-y-3">
            {cisItsmJourney.map((step) => (
              <Card key={step.number} className="shadow-card overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full grid place-items-center bg-primary text-primary-foreground font-bold shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription className="text-xs">{step.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {step.rule === "complete-all" && "Complete all"}
                      {step.rule === "earn-credential" && "Earn credential"}
                      {step.rule === "any" && "Any of the below"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {step.resources.map((r) => <ResourceRow key={r.title} r={r} />)}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Delta release quizzes */}
        <section className="space-y-3">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold">Per-release practice quizzes</h2>
              <p className="text-sm text-muted-foreground">
                Official 1-hour quizzes per ServiceNow release. Take whichever matches the version your
                exam is scheduled against (newest at the top).
              </p>
            </div>
            <Badge variant="secondary">{cisItsmDeltaQuizzes.length} quizzes</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {cisItsmDeltaQuizzes.map((q) => <ResourceRow key={q.title} r={q} />)}
          </div>
        </section>

        {/* Footer note */}
        <Card className="border-dashed">
          <CardContent className="pt-5 text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">About the credential.</strong> Passing the proctored
              CIS-ITSM exam awards you a ServiceNow certification and a{" "}
              <a href={CREDLY_BADGE_INFO_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Credly digital badge
              </a>
              {" "}you can showcase online.
            </p>
            <p>
              All resources on this page are hosted by ServiceNow at{" "}
              <a href="https://learning.servicenow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                learning.servicenow.com
              </a>
              . Shadowx Lab is an independent practice platform and is not affiliated with ServiceNow.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
