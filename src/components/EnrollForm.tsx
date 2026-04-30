import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  program: "soc" | "itsm" | "pen200" | "csa" | "k8s";
  programName: string;
}

export function EnrollForm({ program, programName }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim() || null,
      notes: String(fd.get("notes") || "").trim() || null,
      program,
    };

    if (!payload.full_name || !payload.email) {
      toast({ title: "Please add your name and email", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("enrollments").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit — please try again", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 grid place-items-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Seat request received</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will WhatsApp / email you within 24 hours with payment details and your batch start date for the
          {" "}<span className="font-medium text-foreground">{programName}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name *</Label>
        <Input id="full_name" name="full_name" required placeholder="Your name" autoComplete="name" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input id="phone" name="phone" placeholder="+91 ..." autoComplete="tel" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Anything we should know? (optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Background, goals, questions..." rows={3} />
      </div>
      <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Reserve seat for ₹199 (1hr Intro Batch)
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        ₹199 reserves your seat in the 1-hour live intro batch. Full program pricing will be announced soon.
      </p>
    </form>
  );
}
