import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const TRIAL_MS = 2 * 60 * 60 * 1000; // 2 hours

export function useK8sTrial() {
  const { user } = useAuth();
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Tick every second for live countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) {
      setStartedAt(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
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
      // Start the trial now
      const { data: inserted } = await supabase
        .from("k8s_trials")
        .insert({ user_id: user.id })
        .select("started_at")
        .maybeSingle();
      if (cancelled) return;
      setStartedAt(inserted?.started_at ? new Date(inserted.started_at) : new Date());
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
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
