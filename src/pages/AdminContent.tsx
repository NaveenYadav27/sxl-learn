import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Search, FileText, FlaskConical, BookOpen, ListChecks,
  CheckCircle2, EyeOff, ExternalLink, Award,
} from "lucide-react";

type Module = {
  id: string; slug: string; title: string; description: string | null;
  domain_code: string; exam_weight: string | null; sort_order: number;
};
type Lab = {
  id: string; slug: string; title: string; module_id: string; simulator: string;
  difficulty: string; duration_min: number; is_published: boolean;
  sort_order: number; ms_learn_url: string | null; objective: string | null;
};
type BadgeRow = { id: string; slug: string; name: string; description: string | null };

const AdminContent = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [stepCounts, setStepCounts] = useState<Map<string, number>>(new Map());
  const [questionCounts, setQuestionCounts] = useState<Map<string, number>>(new Map());
  const [attemptCounts, setAttemptCounts] = useState<Map<string, number>>(new Map());
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [
      { data: m },
      { data: l },
      { data: steps },
      { data: questions },
      { data: attempts },
      { data: bg },
    ] = await Promise.all([
      supabase.from("modules").select("*").order("sort_order"),
      supabase.from("labs").select("*").order("sort_order"),
      supabase.from("lab_steps").select("lab_id"),
      supabase.from("lab_questions").select("lab_id"),
      supabase.from("lab_attempts").select("lab_id"),
      supabase.from("badges").select("*").order("name"),
    ]);
    setModules((m ?? []) as Module[]);
    setLabs((l ?? []) as Lab[]);
    setBadges((bg ?? []) as BadgeRow[]);

    const sMap = new Map<string, number>();
    (steps ?? []).forEach((r: any) => sMap.set(r.lab_id, (sMap.get(r.lab_id) ?? 0) + 1));
    setStepCounts(sMap);

    const qMap = new Map<string, number>();
    (questions ?? []).forEach((r: any) => qMap.set(r.lab_id, (qMap.get(r.lab_id) ?? 0) + 1));
    setQuestionCounts(qMap);

    const aMap = new Map<string, number>();
    (attempts ?? []).forEach((r: any) => aMap.set(r.lab_id, (aMap.get(r.lab_id) ?? 0) + 1));
    setAttemptCounts(aMap);

    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  async function togglePublish(lab: Lab) {
    setBusyId(lab.id);
    const { error } = await supabase
      .from("labs")
      .update({ is_published: !lab.is_published })
      .eq("id", lab.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    setLabs((prev) => prev.map((x) => (x.id === lab.id ? { ...x, is_published: !x.is_published } : x)));
    toast({ title: lab.is_published ? "Lab unpublished" : "Lab published" });
  }

  const labsByModule = useMemo(() => {
    const map = new Map<string, Lab[]>();
    labs.forEach((l) => {
      const arr = map.get(l.module_id) ?? [];
      arr.push(l);
      map.set(l.module_id, arr);
    });
    return map;
  }, [labs]);

  const filteredModules = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return modules;
    return modules.filter((m) => {
      if (m.title.toLowerCase().includes(needle) || m.slug.toLowerCase().includes(needle)) return true;
      const ml = labsByModule.get(m.id) ?? [];
      return ml.some(
        (l) => l.title.toLowerCase().includes(needle) || l.slug.toLowerCase().includes(needle),
      );
    });
  }, [q, modules, labsByModule]);

  const stats = useMemo(() => {
    const totalLabs = labs.length;
    const published = labs.filter((l) => l.is_published).length;
    const totalQuestions = Array.from(questionCounts.values()).reduce((s, n) => s + n, 0);
    const totalSteps = Array.from(stepCounts.values()).reduce((s, n) => s + n, 0);
    return { totalLabs, published, totalQuestions, totalSteps };
  }, [labs, stepCounts, questionCounts]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout
      title="Admin · Content Management"
      breadcrumb={<Breadcrumb items={[{ label: "Admin" }, { label: "Content" }]} />}
      skipAccessGate
    >
      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Kpi icon={BookOpen} label="Modules" value={modules.length} />
          <Kpi icon={FlaskConical} label="Labs" value={stats.totalLabs} />
          <Kpi icon={CheckCircle2} label="Published" value={`${stats.published}/${stats.totalLabs}`} />
          <Kpi icon={ListChecks} label="Quiz questions" value={stats.totalQuestions} />
          <Kpi icon={Award} label="Badges" value={badges.length} />
        </div>

        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Catalog ({modules.length})</TabsTrigger>
            <TabsTrigger value="labs">All labs ({labs.length})</TabsTrigger>
            <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
          </TabsList>

          {/* CATALOG: Modules → labs accordion */}
          <TabsContent value="catalog" className="mt-4 space-y-3">
            <div className="relative max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search modules or labs…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            {loading ? (
              <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
            ) : filteredModules.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No modules match.</CardContent></Card>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredModules.map((m) => {
                  const ml = labsByModule.get(m.id) ?? [];
                  const pub = ml.filter((l) => l.is_published).length;
                  return (
                    <AccordionItem key={m.id} value={m.id} className="border rounded-md bg-card">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{m.title}</div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">{m.slug}</div>
                          </div>
                          <div className="flex items-center gap-2 mr-2">
                            {m.exam_weight && <Badge variant="outline" className="text-[10px]">{m.exam_weight}</Badge>}
                            <Badge variant="secondary" className="text-[10px]">
                              {pub}/{ml.length} published
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        {ml.length === 0 ? (
                          <div className="p-4 text-xs text-muted-foreground">No labs in this module.</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Lab</TableHead>
                                <TableHead>Simulator</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="text-right">Steps</TableHead>
                                <TableHead className="text-right">Qs</TableHead>
                                <TableHead className="text-right">Attempts</TableHead>
                                <TableHead>Published</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ml.map((l) => (
                                <TableRow key={l.id}>
                                  <TableCell>
                                    <div className="font-medium text-sm flex items-center gap-2">
                                      {l.title}
                                      {l.ms_learn_url && (
                                        <a
                                          href={l.ms_learn_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-muted-foreground hover:text-primary"
                                          title="MS Learn reference"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{l.slug}</div>
                                  </TableCell>
                                  <TableCell><Badge variant="outline" className="text-[10px]">{l.simulator}</Badge></TableCell>
                                  <TableCell><Badge variant="outline" className="text-[10px]">{l.difficulty}</Badge></TableCell>
                                  <TableCell className="text-right tabular-nums text-xs">{stepCounts.get(l.id) ?? 0}</TableCell>
                                  <TableCell className="text-right tabular-nums text-xs">{questionCounts.get(l.id) ?? 0}</TableCell>
                                  <TableCell className="text-right tabular-nums text-xs">{attemptCounts.get(l.id) ?? 0}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={l.is_published}
                                        disabled={busyId === l.id}
                                        onCheckedChange={() => togglePublish(l)}
                                      />
                                      {l.is_published ? (
                                        <span className="text-[10px] text-success">live</span>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                                          <EyeOff className="h-3 w-3" />hidden
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </TabsContent>

          {/* ALL LABS: flat searchable table */}
          <TabsContent value="labs" className="mt-4 space-y-3">
            <div className="relative max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search labs…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Simulator</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-right">Steps</TableHead>
                        <TableHead className="text-right">Qs</TableHead>
                        <TableHead className="text-right">Attempts</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labs
                        .filter((l) => {
                          const needle = q.trim().toLowerCase();
                          if (!needle) return true;
                          return l.title.toLowerCase().includes(needle) || l.slug.toLowerCase().includes(needle);
                        })
                        .map((l) => {
                          const mod = modules.find((m) => m.id === l.module_id);
                          return (
                            <TableRow key={l.id}>
                              <TableCell>
                                <div className="font-medium text-sm">{l.title}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{l.slug}</div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{mod?.title ?? "—"}</TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px]">{l.simulator}</Badge></TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px]">{l.difficulty}</Badge></TableCell>
                              <TableCell className="text-right tabular-nums text-xs">{l.duration_min}</TableCell>
                              <TableCell className="text-right tabular-nums text-xs">{stepCounts.get(l.id) ?? 0}</TableCell>
                              <TableCell className="text-right tabular-nums text-xs">{questionCounts.get(l.id) ?? 0}</TableCell>
                              <TableCell className="text-right tabular-nums text-xs">{attemptCounts.get(l.id) ?? 0}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={l.is_published}
                                    disabled={busyId === l.id}
                                    onCheckedChange={() => togglePublish(l)}
                                  />
                                  {l.is_published ? (
                                    <span className="text-[10px] text-success">live</span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">hidden</span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" /> Achievement badges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {badges.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No badges defined yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {badges.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium text-sm">{b.name}</TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{b.slug}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{b.description ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          Module/lab content is curated in <code className="text-[10px]">src/lib/curriculum.ts</code> & seeded via migrations.
          Use the publish toggle to hide a lab from learners without deleting it.
        </p>
      </div>
    </AppLayout>
  );
};

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminContent;
