// Policy Reviewer — inspects the caller's tenant policies (CA + DLP)
// using Lovable AI and returns structured findings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ROLES = [
  "Global Administrator", "Privileged Role Administrator", "Security Administrator",
  "Conditional Access Administrator", "User Administrator", "Helpdesk Administrator",
  "Application Administrator", "Compliance Administrator",
];

interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  policy_id: string;
  policy_name: string;
  policy_kind: "ca" | "dlp";
  finding: string;
  recommendation: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userResult, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userResult.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userResult.user.id;

    const body = await req.json().catch(() => ({}));
    const kind = (body?.kind ?? "all") as "ca" | "dlp" | "all";

    // Pull the relevant policies (RLS-scoped to the caller).
    const [caRes, dlpRes] = await Promise.all([
      kind === "dlp" ? Promise.resolve({ data: [] as any[], error: null }) :
        supabase.from("tenant_ca_policies").select("id, display_name, state, conditions, grant_controls"),
      kind === "ca" ? Promise.resolve({ data: [] as any[], error: null }) :
        supabase.from("tenant_dlp_policies").select("id, display_name, state, locations, rules, action"),
    ]);
    if (caRes.error) throw caRes.error;
    if (dlpRes.error) throw dlpRes.error;

    const caPolicies = caRes.data ?? [];
    const dlpPolicies = dlpRes.data ?? [];

    if (caPolicies.length === 0 && dlpPolicies.length === 0) {
      return new Response(JSON.stringify({ findings: [], summary: "No policies to review yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compact policy summary for the model
    const promptInput = {
      conditional_access_policies: caPolicies.map((p: any) => ({
        id: p.id,
        name: p.display_name,
        state: p.state,
        targets_admin_roles: ((p.conditions?.users?.includeRoles ?? []) as string[]).filter((r) => ADMIN_ROLES.includes(r)),
        all_users: (p.conditions?.users?.includeUsers ?? []).includes("All"),
        applications: p.conditions?.applications?.includeApplications ?? [],
        grant_controls: p.grant_controls?.builtInControls ?? [],
        operator: p.grant_controls?.operator,
      })),
      dlp_policies: dlpPolicies.map((p: any) => ({
        id: p.id,
        name: p.display_name,
        state: p.state,
        locations: p.locations ?? [],
        sensitive_types: p.rules?.sensitiveInfoTypes ?? [],
        threshold: p.rules?.threshold,
        external_recipients: p.rules?.externalRecipients ?? false,
        action: p.action,
      })),
    };

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a senior Microsoft 365 security architect reviewing a learner's tenant policies.
Analyze the provided Conditional Access and DLP policies. Return ONLY valid JSON matching the schema.
Look for: missing MFA on admins, legacy auth not blocked, report-only policies that should be enabled, DLP policies in test mode that should be enabled, missing critical sensitive info types, gaps in location coverage (e.g., DLP missing Teams when Exchange is covered), policies targeting "All users" with "block" without exclusions, etc.
Be practical and actionable — every finding must include a concrete recommendation.
Severity scale: critical (active risk), high, medium, low, info (best practice).`;

    const userPrompt = `Review these tenant policies and return findings:\n\n${JSON.stringify(promptInput, null, 2)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_findings",
            description: "Report security findings against the learner's policies.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "1–2 sentence overall posture summary." },
                findings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
                      policy_id: { type: "string" },
                      policy_name: { type: "string" },
                      policy_kind: { type: "string", enum: ["ca", "dlp"] },
                      finding: { type: "string" },
                      recommendation: { type: "string" },
                    },
                    required: ["severity", "policy_id", "policy_name", "policy_kind", "finding", "recommendation"],
                  },
                },
              },
              required: ["summary", "findings"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_findings" } },
      }),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI call failed (${aiResponse.status}): ${text}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return findings");
    }

    let parsed: { summary: string; findings: Finding[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    // Audit log entry
    await supabase.from("tenant_audit_logs").insert({
      user_id: userId,
      action: "ai_policy_review",
      target_type: "tenant",
      details: {
        kind,
        ca_count: caPolicies.length,
        dlp_count: dlpPolicies.length,
        findings_count: parsed.findings?.length ?? 0,
      },
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("policy-review error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
