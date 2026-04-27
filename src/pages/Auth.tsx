import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (params.get("mode") === "signup") setMode("signup");
  }, [params]);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate("/dashboard");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    if (error) {
      setBusy(false);
      if (error.message.toLowerCase().includes("already registered")) {
        toast.error("That email is already registered. Try signing in.");
        setMode("signin");
      } else toast.error(error.message);
      return;
    }
    // Record consent timestamp on the user's profile (best-effort)
    if (data.user?.id) {
      await supabase
        .from("profiles")
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq("id", data.user.id);
    }
    setBusy(false);
    toast.success("Account created — you're in!");
    navigate("/dashboard");
  }

  async function handleGoogle() {
    if (!agreed) {
      toast.error("Please accept the Terms & Conditions before continuing with Google.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30"
             style={{ backgroundImage: "radial-gradient(circle at 30% 30%, hsl(var(--shadow-azure) / 0.4), transparent 50%), radial-gradient(circle at 70% 70%, hsl(var(--shadow-ember) / 0.35), transparent 50%)" }} />
        <Link to="/" className="relative z-10">
          <Logo size="md" showWordmark showTagline />
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Practise Microsoft security <span className="text-shadowx-gradient">like a pro.</span>
          </h2>
          <p className="mt-4 text-foreground/75 max-w-md">
            22 hands-on labs across Entra, Defender XDR, Purview and Sentinel — guided by an AI tutor that nudges you to the right answer.
          </p>
        </div>
        <div className="relative z-10 text-xs text-shadowx-gold/70 uppercase tracking-[0.2em]">
          © ShadowX Lab · SC-900 simulator
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-elevated border-border/60">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center lg:hidden">
              <Logo size="md" showWordmark={false} />
            </div>
            <CardTitle className="font-display text-2xl tracking-wide">Welcome to ShadowX Lab</CardTitle>
            <CardDescription>Sign in to continue your SC-900 journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="si-pw">Password</Label>
                    <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="su-name">Name</Label>
                    <Input id="su-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="su-pw">Password</Label>
                    <Input id="su-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Min 8 chars. Avoid breached passwords (we check).</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
