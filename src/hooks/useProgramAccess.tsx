import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { ProgramCode } from "@/lib/programMap";

export type Program = ProgramCode;

export function useProgramAccess() {
  const { user, isAdmin, isInstructor } = useAuth();
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

  // Admins + instructors see everything; learners see only what they paid for.
  const elevated = isAdmin || isInstructor;
  const has = (p: Program) => elevated || programs.includes(p);

  return {
    programs,
    loading,
    hasAny: elevated || programs.length > 0,
    has,
    hasSoc: has("soc"),
    hasItsm: has("itsm"),
    hasPen200: has("pen200"),
    hasCsa: has("csa"),
    hasK8s: has("k8s"),
  };
}
