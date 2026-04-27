import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Cog, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const Pending = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/"><Logo size="sm" showWordmark showTagline /></Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-16 max-w-2xl">
        <Card className="border-border shadow-elevated">
          <CardContent className="p-8 md:p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary-soft text-primary grid place-items-center mb-5">
              <Clock className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">You're almost in</h1>
            <p className="mt-3 text-muted-foreground">
              Thanks for signing up{user?.email ? <> as <span className="text-foreground font-medium">{user.email}</span></> : ""}.
              Access to your program is granted manually by our team after enrollment is confirmed.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
              <Link to="/soc" className="block">
                <div className="rounded-xl border border-border bg-card hover:bg-secondary/40 transition p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded bg-gradient-security text-primary-foreground grid place-items-center shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">SOC Analyst Program</div>
                    <div className="text-xs text-muted-foreground mt-0.5">View & enroll →</div>
                  </div>
                </div>
              </Link>
              <Link to="/itsm" className="block">
                <div className="rounded-xl border border-border bg-card hover:bg-secondary/40 transition p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded bg-gradient-entra text-primary-foreground grid place-items-center shrink-0">
                    <Cog className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">ITSM / ServiceNow Program</div>
                    <div className="text-xs text-muted-foreground mt-0.5">View & enroll →</div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="mt-8 rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
              Already enrolled? Our team will activate your access within 24 hours.
              You'll be able to enter the dashboard the moment that's done.
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-xs text-muted-foreground text-center">ShadowXLab Academy</div>
      </footer>
    </div>
  );
};

export default Pending;
