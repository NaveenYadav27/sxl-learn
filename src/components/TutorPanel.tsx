import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, Lightbulb, Bot, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string }

interface Props {
  labContext?: string;          // e.g. "Lab: MFA + CA. Current step: Target directory roles."
  attemptId?: string;
  initialPrompt?: string;       // optional opener shown as if from tutor
}

export function TutorPanel({ labContext, attemptId, initialPrompt }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>(
    initialPrompt ? [{ role: "assistant", content: initialPrompt }] : []
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || streaming) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    // persist user message (best-effort)
    if (user) {
      supabase.from("tutor_messages").insert({
        user_id: user.id, attempt_id: attemptId ?? null, role: "user", content: text,
      });
    }

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/tutor-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          labContext,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errBody = await resp.json().catch(() => ({}));
        toast.error(errBody.error ?? `Tutor unavailable (${resp.status})`);
        setStreaming(false);
        setMessages((m) => m.slice(0, -1)); // roll back user msg visual
        setInput(text);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const c = [...m]; c[c.length - 1] = { role: "assistant", content: assistant }; return c;
              });
            }
          } catch { /* ignore partial */ }
        }
      }

      if (user && assistant) {
        supabase.from("tutor_messages").insert({
          user_id: user.id, attempt_id: attemptId ?? null, role: "assistant", content: assistant,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tutor failed");
    } finally {
      setStreaming(false);
    }
  }

  const quickPrompts = [
    "Explain this step in 1 sentence",
    "Give me a hint",
    "Why does this matter in industry?",
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="h-7 w-7 rounded grid place-items-center bg-gradient-hero text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Twin Tutor</div>
          <div className="text-[10px] text-muted-foreground">SC-900 AI coach · always on</div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8 space-y-2">
            <Bot className="h-8 w-8 mx-auto text-primary/60" />
            <p>Ask me anything about this lab — I won't give the answer, just nudges.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="h-6 w-6 rounded grid place-items-center bg-primary text-primary-foreground shrink-0">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div className={`text-sm rounded-md px-3 py-2 max-w-[88%] whitespace-pre-wrap ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {m.content || (streaming ? "…" : "")}
                </div>
                {m.role === "user" && (
                  <div className="h-6 w-6 rounded grid place-items-center bg-secondary text-secondary-foreground shrink-0">
                    <UserIcon className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q) => (
            <Button key={q} variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => send(q)} disabled={streaming}>
              <Lightbulb className="h-3 w-3" /> {q}
            </Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input
            placeholder="Ask the tutor…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
          />
          <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
