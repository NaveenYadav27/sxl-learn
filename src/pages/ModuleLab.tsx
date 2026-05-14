import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, FlaskConical,
  Layers, Sparkles, BookOpen,
} from "lucide-react";
import { getAnyModuleExplanation } from "@/lib/getAnyExplanation";
import { COURSE_LIST } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";

type Lab = {
  id: string; slug: string; title: string; objective: string | null;
  difficulty: string; duration_min: number;
};

type Step =
  | { kind: "intro"; title: string; body: string }
  | { kind: "concept"; conceptId: string; title: string; oneLine: string;
      sections: { label: string; value: string }[] }
  | { kind: "labs"; title: string };

export default function ModuleLab() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const explanation = useMemo(
    () => (moduleSlug ? getAnyModuleExplanation(moduleSlug) : undefined),
    [moduleSlug],
  );

  const note = useMemo(() => {
    if (!moduleSlug) return undefined;
    for (const c of COURSE_LIST) {
      const found = c.modules.find((m) => m.moduleSlug === moduleSlug);
      if (found) return found;
    }
    return undefined;
  }, [moduleSlug]);

  const [labs, setLabs] = useState<Lab[]>([]);
  useEffect(() => {
    if (!note) return;
    (async () => {
      const { data } = await supabase
        .from("labs")
        .select("id,slug,title,objective,difficulty,duration_min")
        .in("slug", note.labSlugs)
        .eq("is_published", true);
      const map = new Map((data ?? []).map((l: any) => [l.slug, l]));
      setLabs(note.labSlugs.map((s) => map.get(s)).filter(Boolean) as Lab[]);
    })();
  }, [note]);

  const steps: Step[] = useMemo(() => {
    if (!explanation) return [];
    const out: Step[] = [
      {
        kind: "intro",
        title: explanation.tagline || "Module overview",
        body: explanation.overview || "",
      },
    ];
    for (const c of explanation.conceptDeepDives) {
      const sections = [
        { label: "Plain English", value: c.plainEnglish },
        { label: "How it works", value: c.howItWorks },
        { label: "When to use", value: c.whenToUse },
        { label: "Common mistake", value: c.commonMistake },
      ];
      out.push({
        kind: "concept",
        conceptId: c.id,
        title: c.name,
        oneLine: c.oneLine,
        sections,
      });
    }
    out.push({ kind: "labs", title: "Hands-on labs" });
    return out;
  }, [explanation]);

  const [idx, setIdx] = useState(0);
  const total = steps.length;
  const pct = total === 0 ? 0 : Math.round(((idx + 1) / total) * 100);

  if (!explanation) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Module Lab" }]} />} title="Module not found">
        <div className="p-6 text-sm text-muted-foreground">
          We couldn't load this module.{" "}
          <Link to="/catalog" className="text-primary underline">Back to catalog</Link>
        </div>
      </AppLayout>
    );
  }

  const step = steps[idx];

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb items={[
          { label: "Catalog", to: "/catalog" },
          { label: "Module", to: `/module/${moduleSlug}` },
          { label: "Module lab" },
        ]} />
      }
      title={`${note?.title || moduleSlug} — Full module lab`}
    >
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="text-[10px]">Module lab · single walkthrough</Badge>
              <Badge variant="secondary" className="text-[10px] ml-auto">Step {idx + 1} / {total}</Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold">{note?.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every concept in this module, end-to-end, then all hands-on labs.
            </p>
            <Progress value={pct} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-5 space-y-3">
            {step.kind === "intro" && (
              <>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="text-sm font-semibold">Module overview</div>
                </div>
                <div className="text-base font-medium">{step.title}</div>
                <p className="text-sm leading-relaxed text-foreground/90">{step.body}</p>
              </>
            )}

            {step.kind === "concept" && (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div className="text-sm font-semibold">Concept {idx} of {explanation.conceptDeepDives.length}</div>
                  <Link
                    to={`/concept-lab/${moduleSlug}/${step.conceptId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <Button variant="outline" size="sm" className="h-7 text-[11px]">
                      Open as concept lab <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="text-base font-semibold">{step.title}</div>
                <p className="text-sm text-muted-foreground">{step.oneLine}</p>
                <div className="space-y-3 pt-1">
                  {step.sections.map((s, i) => (
                    <div key={i} className="border-l-2 border-primary/40 pl-3">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                      <div className="text-sm leading-relaxed">{s.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step.kind === "labs" && (
              <>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  <div className="text-sm font-semibold">All hands-on labs in this module</div>
                </div>
                {labs.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Loading labs…</div>
                ) : (
                  <ul className="space-y-2">
                    {labs.map((lab, i) => (
                      <li key={lab.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                        <div className="h-7 w-7 rounded grid place-items-center bg-primary/15 text-primary text-xs font-semibold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{lab.title}</div>
                          {lab.objective && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{lab.objective}</p>
                          )}
                          <div className="flex gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] capitalize">{lab.difficulty}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{lab.duration_min}m</Badge>
                          </div>
                        </div>
                        <Link to={`/lab/${lab.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="gap-1 h-7">
                            Open <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="rounded-md border border-success/40 bg-success/5 p-3 text-xs text-foreground/80 mt-2">
                  <CheckCircle2 className="h-3 w-3 inline mr-1 text-success" />
                  You've reached the end of the module walkthrough. Open each lab in a new tab and complete it to finish the module.
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline" size="sm"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
              >
                <ArrowLeft className="h-3 w-3 mr-1" /> Previous
              </Button>
              {idx < total - 1 ? (
                <Button size="sm" onClick={() => setIdx((i) => i + 1)}>
                  Next <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Link to={`/module/${moduleSlug}`}>
                  <Button size="sm" variant="outline">Back to module</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
