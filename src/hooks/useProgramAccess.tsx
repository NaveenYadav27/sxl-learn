import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Program = "soc" | "itsm";

export function useProgramAccess() {
  const { user, isAdmin } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrograms([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("program_access")
      .select("program")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setPrograms((data ?? []).map((r) => r.program as Program));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const hasAny = isAdmin || programs.length > 0;
  const hasSoc = isAdmin || programs.includes("soc");
  const hasItsm = isAdmin || programs.includes("itsm");

  return { programs, loading, hasAny, hasSoc, hasItsm };
}
