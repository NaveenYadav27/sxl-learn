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
