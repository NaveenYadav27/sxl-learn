import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface Crumb { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb-trail" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-foreground inline-flex items-center gap-1">
        <Home className="h-3 w-3" /> Home
      </Link>
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {c.to ? (
            <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
