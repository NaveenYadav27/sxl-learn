import { Link } from "react-router-dom";
import { Terminal, Shield, ArrowRight, CheckCircle2, Play, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LESSONS } from "../data/lessons";
import { useAcademy } from "../engine/progress";
import { SCENARIOS_BY_ID } from "../data/scenarios";

export function AcademyLabs() {
  const academy = useAcademy();
  const state = academy.state;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/ops/academy" className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Academy
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-semibold">Labs Catalog</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">SOC Simulator Labs Catalog</h1>
          <p className="text-xs text-muted-foreground mt-1">
            10 interactive educational simulators mapped to real SOC operational activities.
          </p>
        </div>
        <Link to="/ops/academy">
          <Button variant="outline" size="sm" className="text-xs">
            Curriculum View
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LESSONS.map((lesson) => {
          const prog = state.lessons[lesson.id];
          const isComplete = prog?.status === "completed";
          const scenario = lesson.scenarioId ? SCENARIOS_BY_ID[lesson.scenarioId] : undefined;

          return (
            <Card key={lesson.id} className="border-border bg-card flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="h-1.5 bg-gradient-security" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Lab {String(lesson.number).padStart(2, "0")}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                      {lesson.lab.kind}
                    </Badge>
                  </div>

                  <h3 className="font-display font-semibold text-base">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {lesson.tagline}
                  </p>

                  {scenario && (
                    <div className="rounded bg-muted/40 p-2.5 text-[11px] space-y-1">
                      <div className="text-muted-foreground font-semibold">
                        Scenario: <span className="text-foreground">{scenario.name}</span>
                      </div>
                      <div className="text-muted-foreground text-[10px] line-clamp-1">
                        {scenario.tagline}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{lesson.lab.objectives.length || (lesson.lab.splExercises?.length ?? 0)} Objectives</span>
                    {isComplete && (
                      <span className="flex items-center gap-1 text-success font-semibold text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                <Link to={`/ops/academy/lesson/${lesson.id}?step=lab`} className="block">
                  <Button size="sm" className="w-full gap-2 text-xs font-semibold">
                    Launch Simulator Lab <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
