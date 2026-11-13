import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Grid3x3, ChevronLeft, Shield, ExternalLink, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MITRE_TACTICS, MITRE_TECHNIQUES, findTechnique } from "../data/mitre";
import { SCENARIOS } from "../data/scenarios";

export function AcademyMitre() {
  const [selectedTechId, setSelectedTechId] = useState<string>("T1110.001");
  const [filterTactic, setFilterTactic] = useState<string | null>(null);

  // Map which techniques are tested in which scenarios
  const scenarioCoverage = useMemo(() => {
    const map = new Map<string, { scenarioName: string; scenarioId: string }[]>();
    for (const s of SCENARIOS) {
      for (const m of s.mitreMap) {
        const cur = map.get(m.techniqueId) ?? [];
        if (!cur.some((c) => c.scenarioId === s.id)) {
          cur.push({ scenarioName: s.name, scenarioId: s.id });
        }
        map.set(m.techniqueId, cur);
      }
    }
    return map;
  }, []);

  const selectedTech = findTechnique(selectedTechId) ?? MITRE_TECHNIQUES[0];
  const coverageForSelected = scenarioCoverage.get(selectedTech.id) ?? [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/ops/academy" className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Academy
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-semibold">MITRE ATT&CK</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Grid3x3 className="h-7 w-7 text-primary" /> MITRE ATT&CK Enterprise Matrix
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Map adversary behavior to standardized tactics and techniques across the Academy&apos;s 9 deterministic scenarios.
          </p>
        </div>
        <Link to="/ops/academy">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Curriculum
          </Button>
        </Link>
      </div>

      {/* Main Grid & Inspector */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Tactics Columns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase font-mono text-muted-foreground">
              Tactics (Kill Chain Order)
            </span>
            <div className="flex gap-2">
              {filterTactic && (
                <Button size="sm" variant="ghost" onClick={() => setFilterTactic(null)} className="h-6 text-[10px]">
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...MITRE_TACTICS]
              .sort((a, b) => a.order - b.order)
              .filter((tac) => !filterTactic || tac.id === filterTactic)
              .map((tac) => {
                const techniques = MITRE_TECHNIQUES.filter((t) => t.tacticIds.includes(tac.id));

                return (
                  <Card key={tac.id} className="border-border bg-card p-3 space-y-2">
                    <div className="border-b border-border pb-2">
                      <div className="text-[10px] font-mono text-primary font-bold">{tac.id}</div>
                      <h3 className="font-display font-semibold text-xs text-foreground">{tac.name}</h3>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{tac.question}</div>
                    </div>

                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {techniques.map((tech) => {
                        const isSelected = selectedTech.id === tech.id;
                        const hasScenario = scenarioCoverage.has(tech.id);

                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => setSelectedTechId(tech.id)}
                            className={`w-full text-left p-1.5 rounded text-[11px] transition-colors flex items-center justify-between ${
                              isSelected
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "hover:bg-muted/60 text-foreground"
                            }`}
                          >
                            <span className="truncate mr-1">{tech.name}</span>
                            {hasScenario && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  isSelected ? "bg-white" : "bg-primary"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Selected Technique Inspector */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card className="border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="text-xs font-mono text-primary font-bold">{selectedTech.id}</div>
                <h2 className="font-display text-xl font-bold">{selectedTech.name}</h2>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {selectedTech.tacticIds.join(", ")}
              </Badge>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-foreground block mb-1">Adversary Description:</strong>
                <p className="text-muted-foreground">{selectedTech.description}</p>
              </div>

              <div>
                <strong className="text-foreground block mb-1">Real-World Attack Example:</strong>
                <div className="rounded bg-muted/40 p-2.5 text-muted-foreground border border-border/60">
                  {selectedTech.example}
                </div>
              </div>

              <div>
                <strong className="text-foreground block mb-1">Telemetry & Log Sources:</strong>
                <div className="flex flex-wrap gap-1">
                  {selectedTech.logSources.map((ls) => (
                    <Badge key={ls} variant="secondary" className="text-[10px] font-mono">
                      {ls}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-foreground block mb-1">Detection Logic / Correlation Idea:</strong>
                <div className="rounded bg-primary/5 p-2.5 text-primary border border-primary/20 font-mono text-[11px]">
                  {selectedTech.detectionIdea}
                </div>
              </div>
            </div>

            {/* Scenario Linkages */}
            <div className="pt-3 border-t border-border">
              <strong className="text-xs text-foreground block mb-2">Simulated in Academy Scenarios:</strong>
              {coverageForSelected.length > 0 ? (
                <div className="space-y-1.5">
                  {coverageForSelected.map((cov) => (
                    <div
                      key={cov.scenarioId}
                      className="rounded border border-border bg-muted/20 p-2 text-xs flex items-center justify-between"
                    >
                      <span>{cov.scenarioName}</span>
                      <Link to={`/ops/academy/lesson/l08?step=lab`}>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-primary">
                          Open Lab <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Reference technique available across custom query searches and hunting drills.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
