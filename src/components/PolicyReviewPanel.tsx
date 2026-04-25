/**
 * PolicyReviewPanel — calls the policy-review edge function and renders
 * AI findings (severity, finding, recommendation) for CA and/or DLP policies.
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type Finding = {
  severity: Severity;
  policy_id: string;
  policy_name: string;
  policy_kind: "ca" | "dlp";
  finding: string;
  recommendation: string;
};

const SEV_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

function sevColor(s: Severity) {
  switch (s) {
    case "critical": return "bg-destructive text-destructive-foreground border-destructive";
    case "high": return "bg-destructive/15 text-destructive border-destructive/40";
    case "medium": return "bg-warning/15 text-warning border-warning/40";
    case "low": return "bg-primary/10 text-primary border-primary/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

interface Props {
  kind?: "ca" | "dlp" | "all";
  title?: string;
  description?: string;
}

export function PolicyReviewPanel({ kind = "all", title, description }: Props) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);

  async function review() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("policy-review", {
        body: { kind },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSummary((data as any)?.summary ?? null);
      const sorted = ((data as any)?.findings as Finding[] | undefined)?.slice().sort(
        (a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity),
      );
      setFindings(sorted ?? []);
      toast({ title: "AI review complete", description: `${sorted?.length ?? 0} findings.` });
    } catch (e: any) {
      toast({ title: "Review failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-glow" />
            {title ?? "AI policy reviewer"}
          </CardTitle>
          <CardDescription>
            {description ?? "Let an AI analyst inspect your policies and surface gaps with concrete fixes."}
          </CardDescription>
        </div>
        <Button onClick={review} disabled={loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-1.5" />}
          {loading ? "Reviewing…" : "Review with AI"}
        </Button>
      </CardHeader>
      <CardContent>
        {findings === null && !loading && (
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">Review with AI</span> to get a posture summary and a prioritised list of findings.
          </p>
        )}
        {summary && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm mb-4">
            <span className="font-medium mr-1">Summary:</span>{summary}
          </div>
        )}
        {findings && findings.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> No findings — your policies look healthy.
          </div>
        )}
        {findings && findings.length > 0 && (
          <ul className="space-y-3">
            {findings.map((f, i) => (
              <li key={i} className="rounded-md border border-border p-3 bg-card">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${sevColor(f.severity)}`}>
                    {f.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {f.policy_kind === "ca" ? "Conditional Access" : "DLP"}
                  </Badge>
                  <span className="text-sm font-medium">{f.policy_name}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning" />
                  <span>{f.finding}</span>
                </div>
                <div className="flex items-start gap-2 text-sm mt-1.5 text-muted-foreground">
                  <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" />
                  <span><span className="font-medium text-foreground">Fix: </span>{f.recommendation}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
