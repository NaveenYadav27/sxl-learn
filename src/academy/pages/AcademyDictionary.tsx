import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, BookOpen, ChevronLeft, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  SOC_TERMS, TERM_CATEGORIES, TERM_WHY, termLesson, type TermCategory
} from "../data/dictionary";

export function AcademyDictionary() {
  const [params, setSearchParams] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const highlightTerm = params.get("term") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SOC_TERMS.filter((t) => {
      const matchCat = selectedCat === "all" || t.category === selectedCat;
      const matchQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.full.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, selectedCat]);

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
            <span className="text-xs font-mono text-primary font-semibold">Dictionary</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">SOC Analyst Technical Dictionary</h1>
          <p className="text-xs text-muted-foreground mt-1">
            50+ core cybersecurity and SOC terms with plain-English analogies, concrete SIEM examples, and practical lab linkages.
          </p>
        </div>
        <Link to="/ops/academy">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Curriculum
          </Button>
        </Link>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms, concepts, acronyms (e.g. SIEM, RBA, Beaconing)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            variant={selectedCat === "all" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setSelectedCat("all")}
          >
            All ({SOC_TERMS.length})
          </Button>
          {TERM_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCat === cat.id ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((term) => {
          const isHighlighted = highlightTerm === term.id;
          const targetLesson = termLesson(term.id);

          return (
            <Card
              key={term.id}
              id={`term-${term.id}`}
              className={`border-border bg-card flex flex-col justify-between transition-all ${
                isHighlighted ? "ring-2 ring-primary border-primary shadow-glow-azure" : ""
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-primary">
                    {term.term}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {term.category}
                  </Badge>
                </div>

                <p className="text-xs font-medium text-foreground/90 leading-relaxed">
                  {term.short}
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {term.full}
                </p>

                <div className="rounded-lg bg-muted/40 p-3 text-[11px] space-y-2 border border-border/60">
                  <div>
                    <strong className="text-foreground">Analogy: </strong>
                    <span className="text-muted-foreground">{term.analogy}</span>
                  </div>
                  <div>
                    <strong className="text-foreground">In the SOC: </strong>
                    <span className="text-muted-foreground">{term.example}</span>
                  </div>
                  {TERM_WHY[term.id] && (
                    <div>
                      <strong className="text-foreground">Why it matters: </strong>
                      <span className="text-muted-foreground">{TERM_WHY[term.id]}</span>
                    </div>
                  )}
                </div>

                {term.related.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>Related:</span>
                    {term.related.map((rid) => (
                      <button
                        key={rid}
                        type="button"
                        onClick={() => {
                          setQuery(rid);
                        }}
                        className="rounded px-1.5 py-0.5 bg-muted text-primary hover:underline"
                      >
                        {rid}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>

              <div className="p-5 pt-0 border-t border-border mt-2">
                <Link to={`/ops/academy/lesson/${targetLesson}?step=lab`} className="block mt-3">
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs">
                    Practice in Lab ({targetLesson.toUpperCase()}) <ArrowRight className="h-3.5 w-3.5" />
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
