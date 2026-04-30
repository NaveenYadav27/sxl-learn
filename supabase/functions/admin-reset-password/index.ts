// Admin-only edge function: reset a learner's password (sends recovery link or sets new password directly).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller client (uses caller's JWT) — to verify role
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdminData } = await callerClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdminData) return json({ error: "Admins only" }, 403);

    const body = await req.json().catch(() => ({}));
    const { email, mode = "link", new_password } = body as {
      email?: string;
      mode?: "link" | "set";
      new_password?: string;
    };
    if (!email) return json({ error: "email required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (mode === "set") {
      if (!new_password || new_password.length < 8) {
        return json({ error: "new_password must be 8+ chars" }, 400);
      }
      // Find user by email via admin API
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listErr) return json({ error: listErr.message }, 500);
      const target = list.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
      if (!target) return json({ error: "user not found" }, 404);
      const { error: upErr } = await admin.auth.admin.updateUserById(target.id, { password: new_password });
      if (upErr) return json({ error: upErr.message }, 500);
      return json({ ok: true, mode: "set" });
    }

    // mode = "link" → send password recovery email
    const { error: linkErr } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get("origin") ?? ""}/auth?type=recovery`,
    });
    if (linkErr) return json({ error: linkErr.message }, 500);
    return json({ ok: true, mode: "link" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
