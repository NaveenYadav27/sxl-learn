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
        const conds = (p.conditions ?? {}) as any;
        const grants = ((p.grant_controls ?? {}) as any).builtInControls as string[] | undefined;
        const includeRoles: string[] = conds?.users?.includeRoles ?? [];
        const targetsAdmin = includeRoles.some((r) => ADMIN_ROLES.has(r));
        const requiresMfa = (grants ?? []).includes("mfa");
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
        const grants = ((p.grant_controls ?? {}) as any).builtInControls as string[] | undefined;
        return (grants ?? []).includes("block") && p.state === "enabled";
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

    case "incident_resolved": {
      const q = supabase
        .from("tenant_incidents")
        .select("id, display_name, status, classification")
        .eq("user_id", userId)
        .eq("status", "resolved");
      if (params.contains) q.ilike("display_name", `%${params.contains}%`);
      const { data } = await q.limit(1);
      const inc = data?.[0];
      if (!inc) return { ok: false, message: `Resolve the incident${params.contains ? ` "${params.contains}"` : ""}.` };
      if (params.classification && inc.classification !== params.classification) {
        return { ok: false, message: `Resolved, but classify it as "${params.classification}".` };
      }
      return { ok: true, message: `Incident "${inc.display_name}" resolved.` };
    }

    case "incident_assigned": {
      const q = supabase
        .from("tenant_incidents")
        .select("id, display_name, assigned_to")
        .eq("user_id", userId)
        .not("assigned_to", "is", null);
      if (params.contains) q.ilike("display_name", `%${params.contains}%`);
      const { data } = await q.limit(1);
      return data && data.length > 0
        ? { ok: true, message: `Incident "${data[0].display_name}" is assigned.` }
        : { ok: false, message: `Assign the incident${params.contains ? ` "${params.contains}"` : ""} to an analyst.` };
    }

    case "incident_in_progress": {
      const q = supabase
        .from("tenant_incidents")
        .select("id, display_name, status")
        .eq("user_id", userId)
        .eq("status", "inProgress");
      if (params.contains) q.ilike("display_name", `%${params.contains}%`);
      const { data } = await q.limit(1);
      return data && data.length > 0
        ? { ok: true, message: `Incident "${data[0].display_name}" is in progress.` }
        : { ok: false, message: `Move the incident to "In progress".` };
    }

    case "alert_status": {
      // params: { contains?: string, status: 'new'|'inProgress'|'resolved' }
      const q = supabase
        .from("tenant_alerts")
        .select("id, title, status")
        .eq("user_id", userId)
        .eq("status", params.status ?? "resolved");
      if (params.contains) q.ilike("title", `%${params.contains}%`);
      const { data } = await q.limit(1);
      return data && data.length > 0
        ? { ok: true, message: `Alert "${data[0].title}" is ${data[0].status}.` }
        : { ok: false, message: `Set alert${params.contains ? ` "${params.contains}"` : ""} to ${params.status}.` };
    }

    case "label_exists": {
      const q = supabase
        .from("tenant_sensitivity_labels")
        .select("id, display_name, encryption_enabled, watermark_text")
        .eq("user_id", userId);
      if (params.display_name) q.ilike("display_name", `%${params.display_name}%`);
      const { data } = await q.limit(1);
      const lbl = data?.[0];
      if (!lbl) return { ok: false, message: `Create a label${params.display_name ? ` named "${params.display_name}"` : ""}.` };
      if (params.require_encryption && !lbl.encryption_enabled) {
        return { ok: false, message: `Label "${lbl.display_name}" must enable encryption.` };
      }
      if (params.require_watermark && !lbl.watermark_text) {
        return { ok: false, message: `Label "${lbl.display_name}" must have a watermark.` };
      }
      return { ok: true, message: `Label "${lbl.display_name}" looks good.` };
    }

    case "dlp_policy_exists": {
      const { data } = await supabase
        .from("tenant_dlp_policies")
        .select("id, display_name, state, locations, rules, action")
        .eq("user_id", userId);
      const match = (data ?? []).find((p) => {
        if (params.display_name && !p.display_name.toLowerCase().includes(String(params.display_name).toLowerCase())) return false;
        if (params.state && p.state !== params.state) return false;
        if (params.action && p.action !== params.action) return false;
        if (params.location) {
          const locs: string[] = (p.locations as any) ?? [];
          if (!locs.includes(params.location)) return false;
        }
        if (params.sensitive_type) {
          const types: string[] = ((p.rules ?? {}) as any).sensitiveInfoTypes ?? [];
          if (!types.some((t) => t.toLowerCase().includes(String(params.sensitive_type).toLowerCase()))) return false;
        }
        return true;
      });
      return match
        ? { ok: true, message: `DLP policy "${match.display_name}" matches the requirement.` }
        : { ok: false, message: `Create a DLP policy meeting the criteria.` };
    }

    case "file_classified": {
      const q = supabase
        .from("tenant_classified_files")
        .select("id, file_name, label_id, tenant_sensitivity_labels:label_id(display_name)")
        .eq("user_id", userId)
        .not("label_id", "is", null);
      if (params.file_contains) q.ilike("file_name", `%${params.file_contains}%`);
      const { data } = await q.limit(1);
      const f: any = data?.[0];
      if (!f) return { ok: false, message: `Apply a label to ${params.file_contains ? `"${params.file_contains}"` : "the file"}.` };
      if (params.label_name) {
        const labelName = f.tenant_sensitivity_labels?.display_name ?? "";
        if (!labelName.toLowerCase().includes(String(params.label_name).toLowerCase())) {
          return { ok: false, message: `Apply the "${params.label_name}" label specifically.` };
        }
      }
      return { ok: true, message: `"${f.file_name}" is classified.` };
    }

    default:
      return { ok: false, message: `Unknown tenant check: ${check}` };
  }
}
