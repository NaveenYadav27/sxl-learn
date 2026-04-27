import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function ProgramMarketingHeader() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showWordmark showTagline />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/soc" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">SOC</Button></Link>
          <Link to="/itsm" className="hidden sm:inline-flex"><Button variant="ghost" size="sm">ITSM</Button></Link>
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
        </nav>
      </div>
    </header>
  );
}
