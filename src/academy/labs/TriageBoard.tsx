import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TriageAlert } from "../types";
import { useLessonRuntime } from "../components/runtime";
import { RichText } from "../components/RichText";

const PRIORITIES: TriageAlert["answer"][] = ["critical", "high", "medium", "low"];
const TONE: Record<string, string> = { critical: "text-destructive", high: "text-shadowx-ember", medium: "text-shadowx-gold", low: "text-muted-foreground" };

export function TriageBoard({ alerts }: { alerts: TriageAlert[] }) {
  const rt = useLessonRuntime();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [announced, setAnnounced] = useState(false);
  const correct = alerts.filter((a) => picked[a.id] === a.answer).length;

  function choose(a: TriageAlert, p: string) {
    const next = { ...picked, [a.id]: p };
    setPicked(next);
    rt.emit({ action: "select:triage", value: `${a.id}=${p}`, detail: `Classified "${a.title}" as ${p}` });
    if (p !== a.answer) rt.mistake(`"${a.title}" classified as ${p}`);
    if (!announced && alerts.every((x) => next[x.id] === x.answer)) {
      setAnnounced(true);
      rt.emit({ action: "click:triage-all-correct", detail: "All alerts classified correctly" });
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <div className="text-sm font-semibold">Triage board — classify each alert by priority</div>
          <div className="text-[11px] text-muted-foreground">Think: how bad is it if true, how likely is it true, and is it still happening?</div>
        </div>
        <Badge variant="outline" className="font-mono">{correct}/{alerts.length} correct</Badge>
      </div>
      <ul className="divide-y divide-border">
        {alerts.map((a) => {
          const p = picked[a.id];
          const ok = p === a.answer;
          return (
            <li key={a.id} className="space-y-2 px-3 py-3">
              <div className="flex flex-wrap items-start gap-2">
                <Badge variant="outline" className="text-[10px]">{a.source}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground"><RichText text={a.detail} /></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {PRIORITIES.map((pr) => (
                  <Button key={pr} size="sm" variant={p === pr ? "default" : "outline"} className={`h-7 text-[11px] capitalize ${p === pr ? "" : TONE[pr]}`}
                    aria-pressed={p === pr} onClick={() => choose(a, pr)}>
                    {pr}
                  </Button>
                ))}
                {p && (ok
                  ? <span className="flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Correct</span>
                  : <span className="flex items-center gap-1 text-[11px] text-destructive"><XCircle className="h-3.5 w-3.5" /> Not quite — re-read the impact and whether it's confirmed</span>)}
              </div>
              {ok && <div className="rounded-md bg-success/10 p-2 text-[11px]"><RichText text={a.why} /></div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
