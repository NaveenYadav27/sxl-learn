import { Bell, ChevronDown, PanelLeft, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "../components/GlobalSearch";
import { NotificationCenter } from "../components/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface Props {
  onToggleSidebar: () => void;
}

export function OpsTopbar({ onToggleSidebar }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-3">
      <button
        onClick={onToggleSidebar}
        className="rounded-sm p-1.5 text-[hsl(var(--ops-muted-fg))] hover:bg-[hsl(var(--ops-panel-2))] hover:text-[hsl(var(--ops-fg))]"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className={cn(
          "flex h-8 w-72 items-center gap-2 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 text-left text-[12px] text-[hsl(var(--ops-muted-fg))] transition-colors hover:border-[hsl(var(--ops-accent)/0.5)]",
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 truncate">Search modules, records, dashboards…</span>
        <kbd className="hidden rounded border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] px-1 text-[10px] sm:inline">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-success)/0.4)] bg-[hsl(var(--ops-success)/0.12)] px-2 py-1 text-[11px] text-[hsl(var(--ops-success))]">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ops-success))] animate-pulse" />
          All systems operational
        </span>

        <button
          className="flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2 py-1 text-[12px] text-[hsl(var(--ops-fg))] hover:border-[hsl(var(--ops-accent)/0.5)]"
          aria-label="Quick create"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <button
          onClick={() => setNotifOpen(true)}
          className="relative rounded-sm p-1.5 text-[hsl(var(--ops-muted-fg))] hover:bg-[hsl(var(--ops-panel-2))] hover:text-[hsl(var(--ops-fg))]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--ops-critical))]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-[hsl(var(--ops-panel-2))]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--ops-accent)/0.2)] text-[10px] font-semibold text-[hsl(var(--ops-accent))]">
              {initials}
            </span>
            <ChevronDown className="h-3 w-3 text-[hsl(var(--ops-muted-fg))]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
            <div className="px-2 py-1.5 text-[11px] text-[hsl(var(--ops-muted-fg))]">{user?.email}</div>
            <DropdownMenuSeparator className="bg-[hsl(var(--ops-border))]" />
            <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-[12px]">
              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Learning portal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="text-[12px] text-[hsl(var(--ops-critical))]">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} />
    </header>
  );
}
