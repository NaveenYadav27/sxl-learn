import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentorPanel } from "../components/MentorPanel";
import { LESSONS } from "../data/lessons";
import { SCENARIOS_BY_ID } from "../data/scenarios";

export function AcademyMentor() {
  const [selectedLessonId, setSelectedLessonId] = useState<string>("l01");

  const lesson = LESSONS.find((l) => l.id === selectedLessonId);
  const scenario = lesson?.scenarioId ? SCENARIOS_BY_ID[lesson.scenarioId] : undefined;

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/ops/academy" className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Academy
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-mono text-primary font-semibold">AI Mentor</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" /> Contextual AI SOC Mentor
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Simulated senior SOC Lead mentor. Ask for concept breakdowns, investigative guidance, challenge questions, or hand-off reviews.
          </p>
        </div>
        <Link to="/ops/academy">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Curriculum
          </Button>
        </Link>
      </div>

      {/* Lesson Selector */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">
            Anchor Mentor to Lesson Scenario
          </span>
          {lesson && (
            <Badge variant="outline" className="text-[10px] font-mono">
              Scenario: {scenario?.name ?? "General Foundations"}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {LESSONS.map((l) => (
            <Button
              key={l.id}
              size="sm"
              variant={selectedLessonId === l.id ? "default" : "outline"}
              className="h-7 text-xs font-mono"
              onClick={() => setSelectedLessonId(l.id)}
            >
              L{String(l.number).padStart(2, "0")} · {l.title.split(":")[0]}
            </Button>
          ))}
        </div>
      </div>

      {/* Mentor Chat Panel */}
      <div className="rounded-xl border border-border bg-card p-5 min-h-[580px] shadow-card">
        <MentorPanel standalone={{ lesson, scenario }} />
      </div>
    </div>
  );
}
