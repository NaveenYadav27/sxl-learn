/**
 * Module 3 add-on: Kubernetes Hands-On Labs section.
 * Lists every lab from K8S_HANDS_ON_LABS with category + level filters and
 * links each lab to /k8s/labs/:slug plus a per-lab PDF/Markdown download.
 * Purely additive — rendered below the existing Module 3 content.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Download, Clock, ArrowRight, Filter, FileText } from "lucide-react";
import {
  K8S_HANDS_ON_LABS,
  LAB_CATEGORIES,
  type LabCategory,
  type LabLevel,
  labPdfPath,
  labMdPath,
  LABS_WORKBOOK_PATH,
} from "@/lib/k8sHandsOnLabs";

const LEVEL_STYLE: Record<LabLevel, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  Engineer: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  Enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/40",
};

export function HandsOnLabsSection() {
  const [cat, setCat] = useState<LabCategory | "All">("All");
  const [lvl, setLvl] = useState<LabLevel | "All">("All");

  const labs = useMemo(
    () =>
      K8S_HANDS_ON_LABS.filter(
        (l) => (cat === "All" || l.category === cat) && (lvl === "All" || l.level === lvl),
      ),
    [cat, lvl],
  );

  return (
    <Card className="border-l-4 border-l-primary shadow-card">
      <CardContent className="pt-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/15 grid place-items-center">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Enterprise lab system
              </div>
              <h2 className="text-xl font-bold">Kubernetes Hands-On Labs</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                12 enterprise-grade labs — beginner installation through SRE incident investigation.
                Every lab ships with commands, expected output, troubleshooting and viva questions,
                plus PDF + Markdown downloads.
              </p>
            </div>
          </div>
          <a
            href={LABS_WORKBOOK_PATH}
            download
            className="inline-flex items-center gap-1.5 text-xs font-medium rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary hover:bg-primary/20"
          >
            <Download className="h-3.5 w-3.5" /> Full workbook (PDF)
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {(["All", ...LAB_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-2.5 py-0.5 transition-colors ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-3 inline-flex items-center gap-1 text-muted-foreground">Level:</span>
          {(["All", "Beginner", "Engineer", "Enterprise"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLvl(l)}
              className={`rounded-full border px-2.5 py-0.5 transition-colors ${
                lvl === l
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-3 md:grid-cols-2">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="rounded-md border border-border bg-card/60 p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Lab {String(lab.number).padStart(2, "0")} · {lab.category}
                  </div>
                  <h3 className="text-sm font-semibold leading-tight mt-0.5">{lab.title}</h3>
                </div>
                <Badge variant="outline" className={`text-[10px] ${LEVEL_STYLE[lab.level]}`}>
                  {lab.level}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {lab.focus.slice(0, 5).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] rounded-sm border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{lab.objective}</p>

              <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {lab.durationMin} min
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={labMdPath(lab)}
                    download
                    title="Download Markdown"
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted/40 px-2 py-1 text-[10px] text-foreground hover:bg-muted"
                  >
                    <FileText className="h-3 w-3" /> MD
                  </a>
                  <a
                    href={labPdfPath(lab)}
                    download
                    title="Download PDF"
                    className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </a>
                  <Button asChild size="sm" className="h-7 px-2 text-[11px]">
                    <Link to={`/k8s/labs/${lab.slug}`}>
                      Open <ArrowRight className="h-3 w-3 ml-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {labs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No labs match the current filters.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
