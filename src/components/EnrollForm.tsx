import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  program: "soc" | "itsm" | "pen200" | "csa" | "k8s" | "cdl" | "ccna" | "splunkes";
  programName: string;
}

export function EnrollForm({ program, programName }: Props) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      const metaName = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "";
      if (metaName && !fullName) setFullName(metaName);
    }
  }, [user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim() || null;
    const cleanNotes = notes.trim() || null;

    if (!cleanName || !cleanEmail) {
      toast({ title: "Please add your name and email", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const payload = {
      full_name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      notes: cleanNotes,
      program,
      user_id: user?.id || null,
      status: "new",
    };

    const { error } = await supabase.from("enrollments").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit — please try again", description: error.message, variant: "destructive" });
      return;
    }
    setSubmittedEmail(cleanEmail);
    setSubmittedName(cleanName);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 grid place-items-center">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Cohort Application Received</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our admissions team will WhatsApp / email you within 24 hours with your batch schedule and onboarding details for the{" "}
            <span className="font-medium text-foreground">{programName}</span>.
          </p>
        </div>

        {user ? (
          <div className="pt-2">
            <Link to="/dashboard">
              <Button size="lg" className="w-full font-semibold gap-2">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="pt-2 space-y-3">
            <Link to={`/auth?mode=signup&program=${program}&email=${encodeURIComponent(submittedEmail)}&name=${encodeURIComponent(submittedName)}`}>
              <Button size="lg" className="w-full font-semibold gap-2">
                Create Account & Start Learning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to={`/auth?mode=signin&program=${program}&email=${encodeURIComponent(submittedEmail)}`} className="text-primary underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name *</Label>
        <Input
          id="full_name"
          name="full_name"
          required
          placeholder="Your name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+91 ..."
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Anything we should know? (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Background, goals, questions..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Apply for Cohort Enrollment
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Cohort seats are reviewed on a rolling basis. Our admissions team will confirm your batch schedule within 24 hours.
      </p>
    </form>
  );
}
