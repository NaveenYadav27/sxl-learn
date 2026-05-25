/**
 * Kubernetes Resource Center — the downloadable backbone of the K8s program.
 * Lists every PDF in K8S_RESOURCES with size, sections, reading time and skill
 * level. Pure presentation: no backend, no auth-gating (links resolve to files
 * under /public/resources/).
 */
import { Link } from "react-router-dom";
import { Download, BookOpen, ArrowLeft, FileText, GraduationCap, Clock, Layers, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { K8S_RESOURCES, type SkillLevel } from "@/lib/k8sResources";

const LEVEL_TOKEN: Record<SkillLevel, string> = {
  Beginner:   "bg-[hsl(var(--ops-info)/0.15)] text-[hsl(var(--ops-info))] border-[hsl(var(--ops-info)/0.4)]",
  Engineer:   "bg-[hsl(var(--ops-accent)/0.15)] text-[hsl(var(--ops-accent))] border-[hsl(var(--ops-accent)/0.5)]",
  Enterprise: "bg-[hsl(var(--ops-warning)/0.15)] text-[hsl(var(--ops-warning))] border-[hsl(var(--ops-warning)/0.5)]",
};

export default function K8sResources() {
  const master = K8S_RESOURCES.find((r) => r.id === "master")!;
  const rest = K8S_RESOURCES.filter((r) => r.id !== "master");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/40">
        <div className="container py-6 flex flex-col gap-2">
          <Link to="/k8s" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-3 w-3" /> Kubernetes program
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-shadowx-azure/15 border border-shadowx-azure/40">
              <BookOpen className="h-5 w-5 text-shadowx-azure" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Kubernetes Resource Center</h1>
              <p className="text-sm text-muted-foreground">
                The downloadable enterprise training ecosystem — guides, labs, troubleshooting and interview prep.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Featured master guide */}
        <Card className="border-shadowx-azure/40 bg-gradient-to-br from-shadowx-azure/10 to-transparent overflow-hidden">
          <CardContent className="p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-shadowx-gold/50 text-shadowx-gold">
                  Premium · Core backbone
                </Badge>
                <Badge variant="outline" className={`text-[10px] uppercase ${LEVEL_TOKEN[master.level]}`}>
                  {master.level}
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-bold">{master.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{master.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> PDF · {master.size}</span>
                <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {master.pages} pages</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {master.readingTime}</span>
                <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {master.sections.length} chapters</span>
              </div>
            </div>
            <a href={master.file} download>
              <Button size="lg" className="gap-2 bg-shadowx-gold text-black hover:bg-shadowx-gold/90">
                <Download className="h-4 w-4" /> Download master guide
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Companion pack */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-shadowx-azure" />
            <h2 className="text-lg font-semibold">Companion pack — labs, playbooks & prep</h2>
            <Badge variant="outline" className="ml-auto text-[10px]">{rest.length} downloads</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((r) => (
              <Card key={r.id} className="border-border hover:border-shadowx-azure/50 transition-colors flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{r.tag}</Badge>
                    <Badge variant="outline" className={`text-[10px] uppercase ${LEVEL_TOKEN[r.level]}`}>{r.level}</Badge>
                  </div>
                  <h3 className="font-semibold text-base">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex-1">{r.blurb}</p>

                  <div className="mt-3 text-[11px] text-muted-foreground border-t border-border pt-3 space-y-1">
                    <div className="flex justify-between"><span>Size</span><span className="text-foreground font-mono">{r.size}</span></div>
                    <div className="flex justify-between"><span>Pages</span><span className="text-foreground font-mono">{r.pages}</span></div>
                    <div className="flex justify-between"><span>Reading time</span><span className="text-foreground font-mono">{r.readingTime}</span></div>
                    <div className="flex justify-between"><span>Sections</span><span className="text-foreground font-mono">{r.sections.length}</span></div>
                  </div>

                  <details className="mt-3 text-[11px]">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Sections covered</summary>
                    <ul className="mt-2 space-y-0.5 text-foreground/80 list-disc list-inside">
                      {r.sections.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </details>

                  <a href={r.file} download className="mt-4">
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer / context */}
        <div className="rounded-md border border-border bg-card/40 p-4 text-sm text-muted-foreground">
          Every chapter of the Master Guide is cross-linked from the Ops-Console incident pages
          (look for the <span className="font-semibold text-foreground">Related Guide Sections</span> panel).
          The labs in the workbook line up 1:1 with the in-browser kubectl simulator inside Module 3.
        </div>
      </div>
    </div>
  );
}
