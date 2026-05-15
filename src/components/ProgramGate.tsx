import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProgramAccess } from "@/hooks/useProgramAccess";
import { useK8sTrial, formatRemaining } from "@/hooks/useK8sTrial";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight, Timer } from "lucide-react";
import {
  programLabels,
  programMarketingPath,
  isFirstModule,
  type ProgramCode,
} from "@/lib/programMap";

interface Props {
  program: ProgramCode;
  /** Pass the module slug to allow Module 1 (free preview). */
  moduleSlug?: string;
  /** Allow first lab inside the first module too. */
  allowFirstLab?: boolean;
  children: ReactNode;
}

/**
 * Gates content behind program_access.
 * - Module 1 of every program is always free for any signed-in user.
 * - Everything else requires program_access (admins + instructors bypass).
 */
export function ProgramGate({ program, moduleSlug, children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { has, loading: accessLoading } = useProgramAccess();
  const isK8s = program === "k8s";
  const trial = useK8sTrial();

  if (authLoading || accessLoading || (isK8s && user && trial.loading)) {
    return <div className="container py-16 text-center text-muted-foreground text-sm">Loading…</div>;
  }

  if (!user) {
    return <Paywall program={program} unauthenticated />;
  }

  // Free preview: Module 1
  if (moduleSlug && isFirstModule(program, moduleSlug)) {
    return <>{children}</>;
  }

  if (has(program)) return <>{children}</>;

  // K8s 2-hour free trial from first access
  if (isK8s && trial.active) {
    return (
      <>
        <K8sTrialBanner remainingMs={trial.remainingMs} />
        {children}
      </>
    );
  }

  if (isK8s && trial.expired) {
    return <Paywall program={program} trialExpired />;
  }

  return <Paywall program={program} />;
}

function K8sTrialBanner({ remainingMs }: { remainingMs: number }) {
  return (
    <div className="sticky top-0 z-40 border-b border-shadowx-gold/30 bg-shadowx-gold/10 backdrop-blur">
      <div className="container py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Timer className="h-4 w-4 text-shadowx-gold" />
          <span>Free 2-hour K8s preview</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-shadowx-gold font-semibold tabular-nums">
            {formatRemaining(remainingMs)}
          </span>
          <Link to="/k8s">
            <Button size="sm" className="h-7 text-xs">Unlock full access</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Paywall({ program, unauthenticated }: { program: ProgramCode; unauthenticated?: boolean }) {
  return (
    <div className="container py-16">
      <Card className="max-w-xl mx-auto border-primary/30 shadow-elevated">
        <CardContent className="p-8 text-center space-y-5">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 grid place-items-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-shadowx-azure">
              {programLabels[program]}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mt-2">
              This content is part of the full program
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              You're previewing <span className="font-medium text-foreground">Module 1 free</span>.
              Unlock the rest with the 1-hour intro batch at <span className="text-shadowx-gold font-semibold">₹199</span>.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4 text-left space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-shadowx-gold mt-0.5 shrink-0" />
              <span>All modules + hands-on labs + interview prep</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-shadowx-gold mt-0.5 shrink-0" />
              <span>Live cohort + dedicated instructor</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-shadowx-gold mt-0.5 shrink-0" />
              <span>Capstone + completion certificate</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to={programMarketingPath[program]} className="flex-1">
              <Button className="w-full gap-2 font-semibold">
                Reserve seat for ₹199 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {unauthenticated && (
              <Link to="/auth" className="flex-1">
                <Button variant="outline" className="w-full">Sign in</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
