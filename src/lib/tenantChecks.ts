/**
 * Tenant-backed step validators.
 *
 * Lab steps can now declare expected_action like:
 *   { type: "tenant_check", check: "user_exists", params: { display_name: "Pat" } }
 *   { type: "tenant_check", check: "user_count_at_least", params: { count: 11 } }
 *   { type: "tenant_check", check: "group_exists", params: { display_name: "Pilot Users" } }
 *   { type: "tenant_check", check: "role_assigned", params: { role: "User Administrator" } }
 *   { type: "tenant_check", check: "ca_policy_requires_mfa_for_admins" }
 *   { type: "tenant_check", check: "ca_policy_blocks_legacy_auth" }
 *
 * Each check returns { ok, message } so the Lab page can show meaningful feedback.
 */
import { supabase } from "@/integrations/supabase/client";

export type TenantCheckResult = { ok: boolean; message: string };

const ADMIN_ROLES = new Set([
  "Global Administrator", "Privileged Role Administrator", "Security Administrator",
  "Conditional Access Administrator", "User Administrator", "Helpdesk Administrator",
  "Application Administrator", "Compliance Administrator",
]);

export async function runTenantCheck(
  userId: string,
  check: string,
  params: Record<string, any> = {},
): Promise<TenantCheckResult> {
  switch (check) {
    case "user_exists": {
      const q = supabase.from("tenant_users").select("id, display_name, user_principal_name").eq("user_id", userId);
      if (params.display_name) q.ilike("display_name", `%${params.display_name}%`);
      if (params.upn) q.eq("user_principal_name", params.upn);
      const { data } = await q.limit(1);
      return data && data.length > 0
        ? { ok: true, message: `Found user: ${data[0].display_name}` }
        : { ok: false, message: `No matching user yet — create one in your tenant.` };
    }

    case "user_count_at_least": {
      const { count } = await supabase
        .from("tenant_users")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      const need = Number(params.count ?? 1);
      return (count ?? 0) >= need
        ? { ok: true, message: `Tenant has ${count} users (need ≥ ${need}).` }
        : { ok: false, message: `Only ${count ?? 0} users — add more to reach ${need}.` };
    }

    case "group_exists": {
      const q = supabase.from("tenant_groups").select("id, display_name, group_type, membership_type").eq("user_id", userId);
      if (params.display_name) q.ilike("display_name", `%${params.display_name}%`);
      if (params.group_type) q.eq("group_type", params.group_type);
      if (params.membership_type) q.eq("membership_type", params.membership_type);
      const { data } = await q.limit(1);
      return data && data.length > 0
        ? { ok: true, message: `Found group: ${data[0].display_name}` }
        : { ok: false, message: `No matching group yet.` };
    }

    case "dynamic_group_exists": {
      const { data } = await supabase
        .from("tenant_groups")
        .select("id, display_name, dynamic_rule")
        .eq("user_id", userId)
        .eq("membership_type", "dynamic");
      const matches = (data ?? []).filter((g) =>
        !params.contains_rule || (g.dynamic_rule ?? "").toLowerCase().includes(String(params.contains_rule).toLowerCase()),
      );
      return matches.length > 0
        ? { ok: true, message: `Dynamic group "${matches[0].display_name}" matches the rule.` }
        : { ok: false, message: `Create a dynamic group whose rule contains "${params.contains_rule ?? ""}".` };
    }

    case "role_assigned": {
      const { data } = await supabase
        .from("tenant_role_assignments")
        .select("id, role_name")
        .eq("user_id", userId)
        .eq("role_name", params.role);
      return (data ?? []).length > 0
        ? { ok: true, message: `${params.role} is assigned.` }
        : { ok: false, message: `Assign the ${params.role} role to a user.` };
    }

    case "ca_policy_requires_mfa_for_admins": {
      const { data } = await supabase
        .from("tenant_ca_policies")
        .select("id, display_name, state, conditions, grant_controls")
        .eq("user_id", userId);
      const match = (data ?? []).find((p) => {
        const includeRoles: string[] = p.conditions?.users?.includeRoles ?? [];
        const targetsAdmin = includeRoles.some((r) => ADMIN_ROLES.has(r));
        const grants: string[] = p.grant_controls?.builtInControls ?? [];
        const requiresMfa = grants.includes("mfa");
        const enforced = p.state === "enabled" || p.state === "enabledForReportingButNotEnforced";
        return targetsAdmin && requiresMfa && enforced;
      });
      return match
        ? { ok: true, message: `Policy "${match.display_name}" requires MFA for admins.` }
        : { ok: false, message: `Create a CA policy that targets an admin role and requires MFA.` };
    }

    case "ca_policy_blocks": {
      const { data } = await supabase
        .from("tenant_ca_policies")
        .select("id, display_name, state, grant_controls")
        .eq("user_id", userId);
      const match = (data ?? []).find((p) => {
        const grants: string[] = p.grant_controls?.builtInControls ?? [];
        return grants.includes("block") && p.state === "enabled";
      });
      return match
        ? { ok: true, message: `Block policy "${match.display_name}" is enabled.` }
        : { ok: false, message: `Create an enabled CA policy with the "Block access" control.` };
    }

    case "ca_policy_count_at_least": {
      const { count } = await supabase
        .from("tenant_ca_policies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      const need = Number(params.count ?? 1);
      return (count ?? 0) >= need
        ? { ok: true, message: `Tenant has ${count} CA policies.` }
        : { ok: false, message: `Need ≥ ${need} CA policies, currently ${count ?? 0}.` };
    }

    case "user_mfa_enabled": {
      const { data } = await supabase
        .from("tenant_users")
        .select("id, display_name, mfa_enabled")
        .eq("user_id", userId)
        .ilike("display_name", `%${params.display_name ?? ""}%`)
        .limit(1);
      const u = data?.[0];
      return u?.mfa_enabled
        ? { ok: true, message: `MFA enabled for ${u.display_name}.` }
        : { ok: false, message: `Enable MFA on user${params.display_name ? ` ${params.display_name}` : ""}.` };
    }

    case "user_disabled": {
      const { data } = await supabase
        .from("tenant_users")
        .select("id, display_name, account_enabled")
        .eq("user_id", userId)
        .ilike("display_name", `%${params.display_name ?? ""}%`)
        .limit(1);
      const u = data?.[0];
      return u && !u.account_enabled
        ? { ok: true, message: `Account disabled for ${u.display_name}.` }
        : { ok: false, message: `Disable the account for ${params.display_name ?? "the target user"}.` };
    }

    default:
      return { ok: false, message: `Unknown tenant check: ${check}` };
  }
}
