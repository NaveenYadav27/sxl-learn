import { supabase } from "@/integrations/supabase/client";

/**
 * Award badges based on the user's current completion state.
 * Idempotent — checks user_badges before inserting.
 * Returns slugs of newly awarded badges (so the UI can celebrate).
 */
export async function awardBadgesForUser(userId: string): Promise<string[]> {
  // Pull all data needed in parallel
  const [{ data: badges }, { data: userBadges }, { data: modules }, { data: labs }, { data: attempts }] =
    await Promise.all([
      supabase.from("badges").select("id, slug"),
      supabase.from("user_badges").select("badge_id, badges(slug)").eq("user_id", userId),
      supabase.from("modules").select("id, slug"),
      supabase.from("labs").select("id, module_id, slug"),
      supabase.from("lab_attempts").select("lab_id, status").eq("user_id", userId).eq("status", "completed"),
    ]);

  if (!badges || !modules || !labs || !attempts) return [];

  const ownedSlugs = new Set(
    (userBadges ?? []).map((ub: any) => ub.badges?.slug).filter(Boolean) as string[]
  );
  const completedLabIds = new Set(attempts.map((a) => a.lab_id));
  const bySlug = (slug: string) => badges.find((b) => b.slug === slug);

  const toAward: { slug: string; badge_id: string }[] = [];
  const queue = (slug: string) => {
    if (ownedSlugs.has(slug)) return;
    const b = bySlug(slug);
    if (b) toAward.push({ slug, badge_id: b.id });
  };

  // first-lab — any completion
  if (completedLabIds.size >= 1) queue("first-lab");

  // module mastery: completed all labs in a module
  const moduleSlugToBadge: Record<string, string> = {
    entra: "identity-pro",
    security: "soc-analyst",
    compliance: "compliance-champ",
    iam: "identity-pro", // IAM also rolls into identity
  };

  for (const mod of modules) {
    const moduleLabs = labs.filter((l) => l.module_id === mod.id);
    if (moduleLabs.length === 0) continue;
    const allDone = moduleLabs.every((l) => completedLabIds.has(l.id));
    const badgeSlug = moduleSlugToBadge[mod.slug];
    if (allDone && badgeSlug) queue(badgeSlug);
  }

  // sc900-ready — all labs done
  if (labs.length > 0 && labs.every((l) => completedLabIds.has(l.id))) {
    queue("sc900-ready");
  }

  // xdr-master — defender capstone (any completed defender lab with "incident" or "xdr" in slug)
  const xdrLab = labs.find((l) => l.slug?.includes("xdr") || l.slug?.includes("incident"));
  if (xdrLab && completedLabIds.has(xdrLab.id)) queue("xdr-master");

  if (toAward.length === 0) return [];

  await supabase
    .from("user_badges")
    .insert(toAward.map((t) => ({ user_id: userId, badge_id: t.badge_id })));

  return toAward.map((t) => t.slug);
}
