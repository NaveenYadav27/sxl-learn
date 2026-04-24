// AI Tutor — streams SC-900 contextual answers via Lovable AI Gateway (Gemini).
// Uses Server-Sent Events streaming. No auth header verification needed (public);
// learner-side identity is enforced when the client also writes the user message
// to the tutor_messages table under their own RLS.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Msg { role: "user" | "assistant" | "system"; content: string }

const SYSTEM_PROMPT = `You are "Twin Tutor", an expert SC-900 instructor inside a hands-on simulator.

Your job: help the learner complete the current lab step.

Rules:
- Be concise (under 120 words unless asked to elaborate).
- Reference real Microsoft product names (Microsoft Entra ID, Conditional Access, Defender XDR, Microsoft Purview, Sentinel, Compliance Manager).
- When relevant, give a 1-line industry example (BFSI, healthcare, India DPDP Act, breaches like Midnight Blizzard, Uber MFA bombing).
- Never give the literal answer to a step — instead nudge them toward it with the smallest possible hint.
- If the learner is clearly stuck after multiple hints, give the answer plus a "why this matters" sentence.
- If asked something off-topic, gently steer back to SC-900.
- Use Markdown, short bullets, and \`code\` formatting for portal paths like \`Entra → Protection → Conditional Access\`.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, labContext } = await req.json() as { messages: Msg[]; labContext?: string };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const fullMessages: Msg[] = [
      { role: "system", content: SYSTEM_PROMPT + (labContext ? `\n\n--- Current lab context ---\n${labContext}` : "") },
      ...messages,
    ];

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (upstream.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const err = await upstream.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${err}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
