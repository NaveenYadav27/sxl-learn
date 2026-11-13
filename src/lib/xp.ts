import { supabase } from "@/integrations/supabase/client";

/**
 * XP & Streak engine — computed entirely from existing tables.
 * - XP = sum of lab_attempts.score (already accrued from steps + quiz)
 * - Level: 1 every 200 XP
 * - Streak: count of consecutive UTC days with at least one attempt activity
 *           (started_at OR completed_at), ending today or yesterday.
 */

export interface XpStats {
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  streak: number;
  lastActiveISO: string | null;
}

const PER_LEVEL = 200;

function dayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function getXpStats(userId: string): Promise<XpStats> {
  const { data: attempts } = await supabase
    .from("lab_attempts")
    .select("score, started_at, completed_at")
    .eq("user_id", userId);

  const xp = (attempts ?? []).reduce((s, a: any) => s + (a.score ?? 0), 0);
  const level = Math.floor(xp / PER_LEVEL) + 1;
  const xpInLevel = xp % PER_LEVEL;
  const xpToNext = PER_LEVEL - xpInLevel;

  // Build set of active UTC day keys
  const days = new Set<string>();
  let last: Date | null = null;
  (attempts ?? []).forEach((a: any) => {
    [a.started_at, a.completed_at].forEach((iso) => {
      if (!iso) return;
      const d = new Date(iso);
      days.add(dayKey(d));
      if (!last || d > last) last = d;
    });
  });

  // Walk back from today; allow grace if last activity was yesterday
  let streak = 0;
  const today = new Date();
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!days.has(dayKey(cursor))) {
    // try yesterday as anchor
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(dayKey(cursor))) {
      return { xp, level, xpInLevel, xpToNext, streak: 0, lastActiveISO: last ? (last as Date).toISOString() : null };
    }
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { xp, level, xpInLevel, xpToNext, streak, lastActiveISO: last ? (last as Date).toISOString() : null };
}
