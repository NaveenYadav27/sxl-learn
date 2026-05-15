import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const TRIAL_MS = 2 * 60 * 60 * 1000; // 2 hours
const LS_KEY = "shadowx.k8sTrialStartedAt";

export function useK8sTrial() {
  const { user } = useAuth();
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Anonymous: sessionStorage-based trial (resets when browser/tab closes)
    if (!user) {
      try {
        const stored = sessionStorage.getItem(LS_KEY);
        if (stored) {
          setStartedAt(new Date(stored));
        } else {
          const startIso = new Date().toISOString();
          sessionStorage.setItem(LS_KEY, startIso);
          setStartedAt(new Date(startIso));
        }
      } catch {
        setStartedAt(new Date());
      }
      setLoading(false);
      return;
    }

    // Authenticated: DB-backed trial (carries over from any anon session)
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("k8s_trials")
        .select("started_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;

      if (data?.started_at) {
        setStartedAt(new Date(data.started_at));
        setLoading(false);
        return;
      }

      // Carry over the anonymous start time if present, else start now
      let seedIso: string | null = null;
      try {
        seedIso = localStorage.getItem(LS_KEY);
      } catch { /* ignore */ }

      const insertPayload: { user_id: string; started_at?: string } = { user_id: user.id };
      if (seedIso) insertPayload.started_at = seedIso;

      const { data: inserted } = await supabase
        .from("k8s_trials")
        .insert(insertPayload)
        .select("started_at")
        .maybeSingle();
      if (cancelled) return;
      setStartedAt(inserted?.started_at ? new Date(inserted.started_at) : new Date());
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const expiresAt = startedAt ? new Date(startedAt.getTime() + TRIAL_MS) : null;
  const remainingMs = expiresAt ? Math.max(0, expiresAt.getTime() - now) : 0;
  const active = !!startedAt && remainingMs > 0;
  const expired = !!startedAt && remainingMs === 0;

  return { startedAt, expiresAt, remainingMs, active, expired, loading };
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
