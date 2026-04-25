/**
 * useTenant — central data layer for the learner's virtual Entra tenant.
 * Wraps Supabase queries + mutations with React Query for caching.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export type TenantUser = {
  id: string;
  display_name: string;
  user_principal_name: string;
  job_title: string | null;
  department: string | null;
  account_enabled: boolean;
  mfa_enabled: boolean;
  created_at: string;
};

export type TenantGroup = {
  id: string;
  display_name: string;
  description: string | null;
  group_type: string;
  membership_type: string;
  dynamic_rule: string | null;
  created_at: string;
};

export type TenantRoleAssignment = {
  id: string;
  role_name: string;
  principal_type: string;
  principal_id: string;
  assigned_at: string;
};

export type TenantCAPolicy = {
  id: string;
  display_name: string;
  state: string;
  conditions: any;
  grant_controls: any;
  created_at: string;
};

export type TenantSignIn = {
  id: string;
  principal_id: string | null;
  app_display_name: string;
  ip_address: string | null;
  location: string | null;
  status: string;
  risk_level: string;
  risk_detail: string | null;
  signed_in_at: string;
};

export function useTenantUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_users", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantUser[]> => {
      const { data, error } = await supabase
        .from("tenant_users")
        .select("*")
        .order("display_name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantGroups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_groups", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantGroup[]> => {
      const { data, error } = await supabase
        .from("tenant_groups")
        .select("*")
        .order("display_name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantRoleAssignments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_role_assignments", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantRoleAssignment[]> => {
      const { data, error } = await supabase
        .from("tenant_role_assignments")
        .select("*")
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantCAPolicies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_ca_policies", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantCAPolicy[]> => {
      const { data, error } = await supabase
        .from("tenant_ca_policies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantSignInLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_sign_in_logs", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantSignIn[]> => {
      const { data, error } = await supabase
        .from("tenant_sign_in_logs")
        .select("*")
        .order("signed_in_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResetTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reset_tenant");
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_users"] });
      qc.invalidateQueries({ queryKey: ["tenant_groups"] });
      qc.invalidateQueries({ queryKey: ["tenant_role_assignments"] });
      qc.invalidateQueries({ queryKey: ["tenant_ca_policies"] });
      qc.invalidateQueries({ queryKey: ["tenant_sign_in_logs"] });
      qc.invalidateQueries({ queryKey: ["tenant_incidents"] });
      qc.invalidateQueries({ queryKey: ["tenant_alerts"] });
      qc.invalidateQueries({ queryKey: ["tenant_sensitivity_labels"] });
      qc.invalidateQueries({ queryKey: ["tenant_dlp_policies"] });
      qc.invalidateQueries({ queryKey: ["tenant_classified_files"] });
      toast({ title: "Tenant reset", description: "Your virtual tenant has been re-seeded." });
    },
    onError: (e: any) => toast({ title: "Reset failed", description: e.message, variant: "destructive" }),
  });
}

export function useCreateTenantUser() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      display_name: string;
      user_principal_name: string;
      job_title?: string;
      department?: string;
      mfa_enabled?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_users")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id,
        action: "create_user",
        target_type: "tenant_user",
        target_id: data.id,
        details: { display_name: input.display_name },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_users"] });
      toast({ title: "User created" });
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateTenantUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TenantUser> & { id: string }) => {
      const { error } = await supabase.from("tenant_users").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant_users"] }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteTenantUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_users").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_users"] });
      qc.invalidateQueries({ queryKey: ["tenant_role_assignments"] });
      toast({ title: "User deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
}

export function useCreateTenantGroup() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      display_name: string;
      description?: string;
      group_type: string;
      membership_type?: string;
      dynamic_rule?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_groups")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id,
        action: "create_group",
        target_type: "tenant_group",
        target_id: data.id,
        details: { display_name: input.display_name },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_groups"] });
      toast({ title: "Group created" });
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteTenantGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_groups"] });
      toast({ title: "Group deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
}

export function useAssignRole() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { role_name: string; principal_id: string; principal_type?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_role_assignments")
        .insert({
          user_id: user.id,
          role_name: input.role_name,
          principal_id: input.principal_id,
          principal_type: input.principal_type ?? "user",
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id,
        action: "assign_role",
        target_type: "tenant_role_assignment",
        target_id: data.id,
        details: input,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_role_assignments"] });
      toast({ title: "Role assigned" });
    },
    onError: (e: any) => toast({ title: "Assign failed", description: e.message, variant: "destructive" }),
  });
}

export function useRemoveRoleAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_role_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_role_assignments"] });
      toast({ title: "Role removed" });
    },
    onError: (e: any) => toast({ title: "Remove failed", description: e.message, variant: "destructive" }),
  });
}

export function useCreateCAPolicy() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      display_name: string;
      state: string;
      conditions: any;
      grant_controls: any;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_ca_policies")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id,
        action: "create_ca_policy",
        target_type: "tenant_ca_policy",
        target_id: data.id,
        details: { display_name: input.display_name },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_ca_policies"] });
      toast({ title: "Policy created" });
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteCAPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_ca_policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_ca_policies"] });
      toast({ title: "Policy deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
}

// ----- Defender XDR-style: incidents & alerts -----

export type TenantIncident = {
  id: string;
  display_name: string;
  description: string | null;
  severity: string;
  status: string; // active | inProgress | resolved
  classification: string | null; // truePositive | falsePositive | informationalExpectedActivity
  determination: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type TenantAlert = {
  id: string;
  incident_id: string | null;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  category: string;
  product: string;
  mitre_technique: string | null;
  affected_user_id: string | null;
  affected_device_id: string | null;
  detected_at: string;
};

export function useTenantIncidents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_incidents", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantIncident[]> => {
      const { data, error } = await supabase
        .from("tenant_incidents").select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTenantAlerts(incidentId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_alerts", user?.id, incidentId ?? "all"],
    enabled: !!user,
    queryFn: async (): Promise<TenantAlert[]> => {
      const q = supabase.from("tenant_alerts").select("*").order("detected_at", { ascending: false });
      if (incidentId) q.eq("incident_id", incidentId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateIncident() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TenantIncident> & { id: string }) => {
      const update: any = { ...patch };
      if (patch.status === "resolved" && !patch.resolved_at) {
        update.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase.from("tenant_incidents").update(update).eq("id", id);
      if (error) throw error;
      if (user) {
        await supabase.from("tenant_audit_logs").insert({
          user_id: user.id,
          action: "update_incident",
          target_type: "tenant_incident",
          target_id: id,
          details: patch as any,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_incidents"] });
      toast({ title: "Incident updated" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TenantAlert> & { id: string }) => {
      const { error } = await supabase.from("tenant_alerts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant_alerts"] }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

// ----- Purview-style: sensitivity labels, DLP policies, classified files -----

export type TenantSensitivityLabel = {
  id: string;
  display_name: string;
  description: string | null;
  priority: number;
  color: string;
  encryption_enabled: boolean;
  watermark_text: string | null;
  scope: string;
  created_at: string;
};

export type TenantDLPPolicy = {
  id: string;
  display_name: string;
  description: string | null;
  state: string; // enabled | disabled | test
  locations: string[];
  rules: any;
  action: string; // block | notify | allowOverride
  created_at: string;
};

export type TenantClassifiedFile = {
  id: string;
  file_name: string;
  location: string;
  owner_id: string | null;
  label_id: string | null;
  classification_source: string;
  sensitivity_score: number;
  created_at: string;
};

export function useTenantLabels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_sensitivity_labels", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantSensitivityLabel[]> => {
      const { data, error } = await supabase
        .from("tenant_sensitivity_labels").select("*").order("priority");
      if (error) throw error;
      return (data ?? []) as TenantSensitivityLabel[];
    },
  });
}

export function useTenantDLPPolicies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_dlp_policies", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantDLPPolicy[]> => {
      const { data, error } = await supabase
        .from("tenant_dlp_policies").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TenantDLPPolicy[];
    },
  });
}

export function useTenantClassifiedFiles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tenant_classified_files", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantClassifiedFile[]> => {
      const { data, error } = await supabase
        .from("tenant_classified_files").select("*").order("file_name");
      if (error) throw error;
      return (data ?? []) as TenantClassifiedFile[];
    },
  });
}

export function useCreateLabel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TenantSensitivityLabel, "id" | "created_at">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_sensitivity_labels")
        .insert({ ...input, user_id: user.id })
        .select().single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id, action: "create_label", target_type: "tenant_sensitivity_label",
        target_id: data.id, details: { display_name: input.display_name },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_sensitivity_labels"] });
      toast({ title: "Label created" });
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_sensitivity_labels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_sensitivity_labels"] });
      qc.invalidateQueries({ queryKey: ["tenant_classified_files"] });
      toast({ title: "Label deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
}

export function useCreateDLPPolicy() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      display_name: string;
      description?: string;
      state: string;
      locations: string[];
      rules: any;
      action: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tenant_dlp_policies")
        .insert({ ...input, user_id: user.id })
        .select().single();
      if (error) throw error;
      await supabase.from("tenant_audit_logs").insert({
        user_id: user.id, action: "create_dlp_policy", target_type: "tenant_dlp_policy",
        target_id: data.id, details: { display_name: input.display_name },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_dlp_policies"] });
      toast({ title: "DLP policy created" });
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateDLPPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<TenantDLPPolicy> & { id: string }) => {
      const { error } = await supabase.from("tenant_dlp_policies").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenant_dlp_policies"] }),
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteDLPPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenant_dlp_policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_dlp_policies"] });
      toast({ title: "Policy deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
}

export function useApplyLabelToFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, label_id }: { id: string; label_id: string | null }) => {
      const { error } = await supabase
        .from("tenant_classified_files")
        .update({ label_id, classification_source: "manual" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant_classified_files"] });
      toast({ title: "Label applied" });
    },
    onError: (e: any) => toast({ title: "Apply failed", description: e.message, variant: "destructive" }),
  });
}
