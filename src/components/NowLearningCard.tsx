import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { NOW_LEARNING_URL, cisItsmJourney } from "@/lib/nowLearningCisItsm";

/**
 * Compact dashboard card promoting the Now Learning roadmap.
 * Renders only on CIS-ITSM (decision made by parent).
 */
export function NowLearningCard() {
  return (
    <Card className="shadow-card border-primary/20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary-glow to-primary" />
      <CardContent className="pt-5 flex items-start gap-4 flex-wrap">
        <div className="h-10 w-10 rounded grid place-items-center bg-primary-soft text-primary shrink-0">
          <Award className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">Official CIS-ITSM journey</span>
            <Badge variant="secondary" className="text-[10px]">Now Learning</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Follow ServiceNow's {cisItsmJourney.length}-step path — pre-requisites, Data Foundations cert,
            ITSM specialisation, simulator, exam, and continued learning. Pair it with our hands-on labs
            to be exam-ready.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/servicenow-journey">
              <Button size="sm" className="gap-2">
                View roadmap <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <a href={NOW_LEARNING_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-2">
                Open on ServiceNow <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
