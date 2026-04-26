import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Normalise a user-typed ServiceNow PDI URL to "https://<instance>.service-now.com".
 * Accepts e.g. "dev12345", "dev12345.service-now.com", "https://dev12345.service-now.com/nav_to.do?...".
 * Returns null if it can't be parsed into an instance hostname.
 */
export function normalisePdiUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  // Bare instance id like "dev12345"
  if (/^[a-z0-9-]+$/i.test(raw)) {
    return `https://${raw.toLowerCase()}.service-now.com`;
  }
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!host.endsWith(".service-now.com")) return null;
  return `https://${host}`;
}

/** Build a ServiceNow nav_to deep link to a specific table list, e.g. "incident_list.do". */
export function pdiLink(base: string, target: string): string {
  const clean = base.replace(/\/$/, "");
  return `${clean}/nav_to.do?uri=${encodeURIComponent(target)}`;
}

export function usePdi() {
  const { user } = useAuth();
  const [pdiUrl, setPdiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPdiUrl(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("pdi_instance_url" as any)
      .eq("id", user.id)
      .maybeSingle();
    setPdiUrl(((data as any)?.pdi_instance_url as string | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (raw: string | null): Promise<{ ok: boolean; error?: string; value?: string | null }> => {
      if (!user) return { ok: false, error: "Not signed in" };
      let value: string | null = null;
      if (raw && raw.trim()) {
        const norm = normalisePdiUrl(raw);
        if (!norm) return { ok: false, error: "Enter a valid PDI URL like https://dev12345.service-now.com" };
        value = norm;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ pdi_instance_url: value } as any)
        .eq("id", user.id);
      if (error) return { ok: false, error: error.message };
      setPdiUrl(value);
      return { ok: true, value };
    },
    [user],
  );

  return { pdiUrl, loading, save, refresh };
}
