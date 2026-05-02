import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, GraduationCap, BookOpen, FlaskConical, Calendar } from "lucide-react";
import { useCourse } from "@/hooks/useCourse";

type DurationCard = {
  to: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  available: boolean;
};

export default function SessionPlan() {
  const { course } = useCourse();

  const cards: DurationCard[] = [
    {
      to: "/session-plan/30d",
      title: "30-day program",
      subtitle: "1 hour per day",
      description: "Daily 1-hour sessions across a full month — best for working professionals upskilling on the side.",
      badge: "30 days × 1h",
      available: !!course.plans.thirtyDay && course.plans.thirtyDay.length > 0,
    },
    {
      to: "/session-plan/8h",
      title: "8-hour intensive",
      subtitle: "Single-day bootcamp",
      description: "Run the full curriculum from start to finish in one guided 8-hour session.",
      badge: "1 day × 8h",
      available: true,
    },
    {
      to: "/session-plan/4h",
      title: "4-hour split",
      subtitle: "Two half-days",
      description: "Two 4-hour sessions — ideal for back-to-back afternoons or two evenings.",
      badge: "2 days × 4h",
      available: true,
    },
    {
      to: "/session-plan/2h",
      title: "2-hour modules",
      subtitle: course.plans.fiveDay.length + "-day cadence",
      description: "Bite-sized 2-hour daily sessions across the working week. Best retention.",
      badge: course.plans.fiveDay.length + " days × 2h",
      available: true,
    },
    {
      to: "/session-plan/1h",
      title: "1-hour tool tour",
      subtitle: "Express overview",
      description: "Fast walkthrough of the platform's most important screens and flows.",
      badge: "1 hour",
      available: !!course.plans.oneHour,
    },
  ];

  return (
    <AppLayout title="Session Plan">
      <div className="container py-6 space-y-6 max-w-6xl">
        <Card className="hero-surface border-0">
          <CardContent className="pt-6 space-y-2">
            <Badge variant="secondary" className="gap-1">
              <GraduationCap className="h-3 w-3" /> {course.shortName} instructor playbook
            </Badge>
            <h1 className="text-2xl font-bold">Choose your session length</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {course.longName} is delivered in four formats. Pick the duration that matches the cohort —
              each one maps the same modules and labs to a different cadence.
            </p>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <Card
              key={c.to}
              className={`overflow-hidden shadow-card transition ${c.available ? "hover:shadow-lg hover:-translate-y-0.5" : "opacity-60"}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription>{c.subtitle}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {c.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Day-by-day timing</span>
                  <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />Theory blocks</span>
                  <span className="inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" />Hands-on labs</span>
                </div>
                {c.available ? (
                  <Link to={c.to}>
                    <Button className="gap-1">
                      Open plan <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled variant="outline">
                    Not available for {course.shortName}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
