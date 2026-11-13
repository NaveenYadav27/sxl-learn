import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { OpsSidebar } from "./OpsSidebar";
import { OpsTopbar } from "./OpsTopbar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const COLLAPSE_BP = 1280;

export function OpsLayout() {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(
    typeof window === "undefined" ? false : window.innerWidth < COLLAPSE_BP,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${COLLAPSE_BP}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setCollapsed(!e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
  }, []);

  if (loading) {
    return (
      <div className="ops-theme dark min-h-screen bg-[hsl(var(--ops-bg))] p-8">
        <Skeleton className="h-12 w-1/3" />
      </div>
    );
  }
  // Allow anonymous access during K8s 2-hour public trial
  if (!user) {
    const trialStart = (() => {
      try { return sessionStorage.getItem("shadowx.k8sTrialStartedAt"); } catch { return null; }
    })();
    if (!trialStart) {
      try { sessionStorage.setItem("shadowx.k8sTrialStartedAt", new Date().toISOString()); } catch { /* ignore */ }
    } else {
      const elapsed = Date.now() - new Date(trialStart).getTime();
      if (elapsed > 2 * 60 * 60 * 1000) return <Navigate to="/k8s" replace />;
    }
  }

  return (
    <div className="ops-theme dark flex h-screen w-full overflow-hidden bg-[hsl(var(--ops-bg))] text-[hsl(var(--ops-fg))]">
      <OpsSidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <OpsTopbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
