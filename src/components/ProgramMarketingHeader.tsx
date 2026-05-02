import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

export function ProgramMarketingHeader() {
  const { user, loading } = useAuth();
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showWordmark showTagline />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/soc" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">SOC</Button></Link>
          <Link to="/itsm" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">ITSM</Button></Link>
          <Link to="/pen200" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">PEN-200</Button></Link>
          <Link to="/csa" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">CSA</Button></Link>
          <Link to="/k8s" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">K8S</Button></Link>
          <Link to="/ccna" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">CCNA</Button></Link>
          {!loading && (
            user
              ? <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
              : <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
