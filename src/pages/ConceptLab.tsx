import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { getAnyModuleExplanation } from "@/lib/getAnyExplanation";

type Section = { label: string; value: string; tone?: "default" | "warning" | "primary" };

export default function ConceptLab() {
  const { moduleSlug, conceptId } = useParams<{ moduleSlug: string; conceptId: string }>();
  const explanation = useMemo(
    () => (moduleSlug ? getAnyModuleExplanation(moduleSlug) : undefined),
    [moduleSlug],
  );
  const concept = explanation?.conceptDeepDives.find((c) => c.id === conceptId);

  const sections: Section[] = useMemo(() => {
    if (!concept) return [];
    const out: Section[] = [
      { label: "One-liner", value: concept.oneLine, tone: "primary" },
      { label: "Formal definition", value: concept.formal },
      { label: "Plain English", value: concept.plainEnglish },
      { label: "Analogy", value: concept.analogy },
      { label: "How it works", value: concept.howItWorks },
      { label: "Microsoft / vendor mapping", value: concept.microsoftMapping },
      { label: "When to use", value: concept.whenToUse },
    ];
    if (concept.whenNotToUse) out.push({ label: "When NOT to use", value: concept.whenNotToUse });
    out.push({ label: "Common mistake", value: concept.commonMistake, tone: "warning" });
    out.push({ label: "Exam angle", value: concept.examAngle, tone: "primary" });
    return out;
  }, [concept]);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const total = sections.length;
  const pct = total === 0 ? 0 : Math.round(((step + 1) / total) * 100);

  if (!explanation || !concept) {
    return (
      <AppLayout breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Concept" }]} />} title="Concept not found">
        <div className="p-6 text-sm text-muted-foreground">
          We couldn't find this concept.{" "}
          <Link to={moduleSlug ? `/module/${moduleSlug}` : "/catalog"} className="text-primary underline">Back to module</Link>
        </div>
      </AppLayout>
    );
  }

  const currentIdx = explanation.conceptDeepDives.findIndex((c) => c.id === conceptId);
  const prevConcept = currentIdx > 0 ? explanation.conceptDeepDives[currentIdx - 1] : null;
  const nextConcept = currentIdx >= 0 && currentIdx < explanation.conceptDeepDives.length - 1
    ? explanation.conceptDeepDives[currentIdx + 1] : null;

  return (
    <AppLayout
      breadcrumb={
        <Breadcrumb items={[
          { label: "Catalog", to: "/catalog" },
          { label: "Module", to: `/module/${moduleSlug}` },
          { label: concept.name },
        ]} />
      }
      title={`${concept.name} — Concept Lab`}
    >
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card className="shadow-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="text-[10px]">Concept lab</Badge>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                Step {Math.min(step + 1, total)} / {total}
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold">{concept.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{concept.oneLine}</p>
            <Progress value={pct} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {!done && (
          <Card className="shadow-card">
            <CardContent className="pt-5 space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{sections[step].label}</div>
              <div
                className={`text-base leading-relaxed ${
                  sections[step].tone === "warning" ? "text-warning"
                    : sections[step].tone === "primary" ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {sections[step].value}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="outline" size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Previous
                </Button>
                {step < total - 1 ? (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                    Next <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setDone(true)}>
                    Mark as understood <CheckCircle2 className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {done && (
          <Card className="shadow-card border-success/40">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="text-base font-semibold">Concept complete</div>
              </div>
              <p className="text-sm text-muted-foreground">
                You've worked through every angle of <span className="font-semibold text-foreground">{concept.name}</span>.
                Continue to the next concept or jump back to the module.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {prevConcept && (
                  <Link to={`/concept-lab/${moduleSlug}/${prevConcept.id}`}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="h-3 w-3 mr-1" /> {prevConcept.name}
                    </Button>
                  </Link>
                )}
                {nextConcept && (
                  <Link to={`/concept-lab/${moduleSlug}/${nextConcept.id}`}>
                    <Button size="sm">
                      Next: {nextConcept.name} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
                <Link to={`/module/${moduleSlug}`}>
                  <Button variant="outline" size="sm">Back to module</Button>
                </Link>
                <Link to={`/module-lab/${moduleSlug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Run full module lab <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
