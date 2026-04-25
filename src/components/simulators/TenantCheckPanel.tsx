/**
 * TenantCheckPanel — runs a DB-backed validator on a polling loop.
 * Used inside Lab.tsx when a step's expected_action is { type: "tenant_check", ... }.
 *
 * Behaviour:
 *  - Polls the check every 2 seconds.
 *  - Also re-checks when the user clicks "Check now".
 *  - On success, calls onValidate(true) once.
 *  - Includes a deep link to /tenant so the user can perform the action.
 */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { runTenantCheck, type TenantCheckResult } from "@/lib/tenantChecks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  check: string;
  params?: Record<string, any>;
  onValidate: (ok: boolean) => void;
}

export function TenantCheckPanel({ check, params, onValidate }: Props) {
  const { user } = useAuth();
  const [result, setResult] = useState<TenantCheckResult | null>(null);
  const [running, setRunning] = useState(false);
  const validatedRef = useRef(false);

  async function runOnce() {
    if (!user) return;
    setRunning(true);
    try {
      const r = await runTenantCheck(user.id, check, params ?? {});
      setResult(r);
      if (r.ok && !validatedRef.current) {
        validatedRef.current = true;
        onValidate(true);
      }
    } finally {
      setRunning(false);
    }
  }

  // Reset when the check identity changes (new step)
  useEffect(() => {
    validatedRef.current = false;
    setResult(null);
    runOnce();
    const id = setInterval(() => {
      if (!validatedRef.current) runOnce();
    }, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, JSON.stringify(params ?? {}), user?.id]);

  const ok = result?.ok ?? false;

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden shadow-elevated">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(220,26%,14%)] text-primary-foreground">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-5 w-5 grid place-items-center bg-primary rounded-sm">
            <Building2 className="h-3 w-3" />
          </div>
          <span className="font-semibold">Live tenant validator</span>
          <Badge variant="outline" className="border-success/40 text-success bg-success/10 text-[9px] uppercase tracking-wider">Real DB</Badge>
        </div>
        <Link to="/tenant" target="_blank">
          <Button variant="secondary" size="sm" className="h-7 text-xs">
            Open My Tenant <ExternalLink className="h-3 w-3 ml-1.5" />
          </Button>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          This step is graded by inspecting your live virtual tenant. Make the change in your tenant
          (in a new tab), then come back — we'll detect it automatically within a couple of seconds.
        </p>

        <div className={`rounded border p-3 flex items-start gap-2 text-sm
          ${ok ? "bg-success/10 border-success/30 text-success"
              : "bg-muted/40 border-border text-foreground"}`}>
          {ok ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-warning" />}
          <span className="flex-1">{result?.message ?? "Checking your tenant…"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Auto-polling every ~2.5s</span>
          <Button variant="outline" size="sm" onClick={runOnce} disabled={running} className="h-7">
            <RefreshCw className={`h-3 w-3 mr-1.5 ${running ? "animate-spin" : ""}`} />Check now
          </Button>
        </div>
      </div>
    </div>
  );
}
