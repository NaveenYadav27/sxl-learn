import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useProgramAccess } from "@/hooks/useProgramAccess";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  children: ReactNode;
  title?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  /** When true, skip the program-access gate (used by /pending and admin pages). */
  skipAccessGate?: boolean;
}

export function AppLayout({ children, title, breadcrumb, actions, skipAccessGate }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const { hasAny, loading: accessLoading } = useProgramAccess();

  if (loading || (user && !skipAccessGate && accessLoading)) {
    return (
      <div className="min-h-screen p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!skipAccessGate && !isAdmin && !hasAny) return <Navigate to="/pending" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 shadow-card">
            <SidebarTrigger className="text-foreground" />
            <div className="flex-1">
              {breadcrumb}
              {title && <h1 className="text-base font-semibold text-foreground leading-tight">{title}</h1>}
            </div>
            {actions}
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
