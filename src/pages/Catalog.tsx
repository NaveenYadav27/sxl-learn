import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, ArrowRight, Sparkles, Shield, Users, Gavel, BookOpen, Lock, ExternalLink, Search, X } from "lucide-react";

const simulatorIcon: Record<string, any> = {
  entra: Users, defender: Shield, purview: Gavel, sentinel: Lock, generic: BookOpen,
};
const simulatorLabel: Record<string, string> = {
  entra: "Microsoft Entra", defender: "Defender XDR", purview: "Microsoft Purview", sentinel: "Sentinel", generic: "Concepts",
};
const domainGrad: Record<string, string> = {
  concepts: "bg-gradient-concepts", iam: "bg-gradient-iam", entra: "bg-gradient-entra",
  security: "bg-gradient-security", compliance: "bg-gradient-compliance",
};
const difficultyTone: Record<string, string> = {
  beginner: "bg-success/10 text-success", intermediate: "bg-warning/10 text-warning", advanced: "bg-destructive/10 text-destructive",
};

export default function Catalog() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, string>>({}); // labId → status
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [{ data: mods }, { data: labs }] = await Promise.all([
        supabase.from("modules").select("*").order("sort_order"),
        supabase.from("labs").select("*").eq("is_published", true).order("sort_order"),
      ]);
      const grouped = (mods ?? []).map((m) => ({
        ...m,
        labs: (labs ?? []).filter((l) => l.module_id === m.id),
      }));
      setGroups(grouped);

      if (user) {
        const { data: att } = await supabase.from("lab_attempts").select("lab_id, status").eq("user_id", user.id);
        const map: Record<string, string> = {};
        (att ?? []).forEach((a: any) => { map[a.lab_id] = a.status; });
        setProgress(map);
      }
    })();
  }, [user]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .map((m) => {
        const labs = m.labs.filter((lab: any) => {
          if (difficulty !== "all" && lab.difficulty !== difficulty) return false;
          const labStatus = progress[lab.id] ?? "not_started";
          if (status === "completed" && labStatus !== "completed") return false;
          if (status === "in_progress" && labStatus !== "in_progress") return false;
          if (status === "not_started" && labStatus !== "not_started") return false;
          if (q) {
            const hay = `${lab.title} ${lab.objective ?? ""} ${lab.scenario ?? ""}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
        return { ...m, labs };
      })
      .filter((m) => m.labs.length > 0);
  }, [groups, progress, search, difficulty, status]);

  const totalShown = filteredGroups.reduce((s, m) => s + m.labs.length, 0);
  const filtersActive = search.trim() !== "" || difficulty !== "all" || status !== "all";

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[{ label: "Course Catalog" }]} />}
      title="SC-900 Course Catalog"
    >
      <div className="container py-6 space-y-6">
        {/* Filter bar */}
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search labs by title, objective, or scenario…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setSearch(""); setDifficulty("all"); setStatus("all"); }}>
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
            <div className="text-xs text-muted-foreground ml-auto">{totalShown} lab{totalShown === 1 ? "" : "s"}</div>
          </CardContent>
        </Card>

        {filteredGroups.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No labs match these filters.</CardContent></Card>
        ) : filteredGroups.map((m) => (
          <section key={m.id} id={m.slug}>
            <div className={`rounded-lg p-5 mb-4 text-primary-foreground ${domainGrad[m.slug] ?? "bg-primary"}`}>
              <div className="text-xs opacity-80 font-medium">{m.domain_code} · EXAM WEIGHT {m.exam_weight}</div>
              <h2 className="text-xl font-bold mt-1">{m.title}</h2>
              <p className="text-sm opacity-90 mt-1 max-w-3xl">{m.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {m.labs.map((lab: any, idx: number) => {
                const Icon = simulatorIcon[lab.simulator] ?? BookOpen;
                const status = progress[lab.id];
                return (
                  <Card key={lab.id} className="shadow-card hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded bg-primary-soft text-primary grid place-items-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Lab {idx + 1}</span>
                            <span>·</span>
                            <span>{simulatorLabel[lab.simulator]}</span>
                          </div>
                          <CardTitle className="text-base mt-0.5">{lab.title}</CardTitle>
                          <CardDescription className="text-xs flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={`${difficultyTone[lab.difficulty]} border-0 capitalize`}>
                              {lab.difficulty}
                            </Badge>
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lab.duration_min} min</span>
                            {status === "completed" && <Badge className="bg-success text-success-foreground">✓ Completed</Badge>}
                            {status === "in_progress" && <Badge variant="outline">In progress</Badge>}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lab.scenario && (
                        <div className="text-xs bg-muted/50 border-l-2 border-primary/30 p-2 rounded-sm mb-2">
                          <span className="font-medium text-primary">Scenario:</span> {lab.scenario}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">{lab.objective}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Link to={`/lab/${lab.slug}`}>
                          <Button size="sm" className="gap-1">
                            {status === "completed" ? "Review lab" : status === "in_progress" ? "Resume" : "Start lab"}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                        {lab.ms_learn_url && (
                          <a
                            href={lab.ms_learn_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Open the matching free Microsoft Learn module for ${lab.title} in a new tab`}
                          >
                            <Button size="sm" variant="outline" className="gap-1">
                              Microsoft Learn
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
