import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, BookOpen, Users, Shield, Lock, Gavel, Trophy,
  Settings, GraduationCap, Network, ClipboardCheck, Flame, Zap, Wallet, Building2, CalendarDays,
} from "lucide-react";
import { getXpStats, type XpStats } from "@/lib/xp";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";

const learnerNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Course Catalog", url: "/catalog", icon: BookOpen },
  { title: "Session Plan", url: "/session-plan", icon: CalendarDays },
  { title: "My Live Tenant", url: "/tenant", icon: Building2 },
  { title: "Practice Exam", url: "/exam", icon: ClipboardCheck },
  { title: "My Progress", url: "/progress", icon: Trophy },
  { title: "License Guide", url: "/licensing", icon: Wallet },
];

const portalNav = [
  { title: "Microsoft Entra", url: "/portal/entra", icon: Users, color: "text-domain-entra" },
  { title: "Defender XDR", url: "/defender", icon: Shield, color: "text-domain-security" },
  { title: "Microsoft Purview", url: "/purview", icon: Gavel, color: "text-domain-compliance" },
  { title: "Microsoft Sentinel", url: "/portal/sentinel", icon: Network, color: "text-primary-glow" },
];

const instructorNav = [
  { title: "Cohort", url: "/instructor/cohort", icon: GraduationCap },
];

const adminNav = [
  { title: "Manage Content", url: "/admin/content", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { isInstructor, isAdmin, signOut, user } = useAuth();
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [xp, setXp] = useState<XpStats | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ count: total }, { data: atts }, xpStats] = await Promise.all([
        supabase.from("labs").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("lab_attempts").select("lab_id, status").eq("user_id", user.id).eq("status", "completed"),
        getXpStats(user.id),
      ]);
      if (cancelled) return;
      const doneIds = new Set((atts ?? []).map((a) => a.lab_id));
      setProgress({ done: doneIds.size, total: total ?? 0 });
      setXp(xpStats);
    })();
    return () => { cancelled = true; };
  }, [user, pathname]); // refresh when navigating (e.g. after lab completion)

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2.5 group">
          <Logo size="sm" showWordmark={false} />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wider text-shadowx-gradient">
                SHADOWX LAB
              </div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-shadowx-gold/80">
                Empower · Illuminate · Uphold
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learnerNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {!collapsed && (progress.total > 0 || (xp && xp.xp > 0)) && (
              <div className="mx-2 mt-2 mb-1 rounded-md bg-sidebar-accent/40 px-2.5 py-2 space-y-2">
                {progress.total > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] font-medium text-sidebar-foreground/80 mb-1">
                      <span>SC-900 progress</span>
                      <span>{progress.done}/{progress.total}</span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                )}
                {xp && (
                  <div className="flex items-center justify-between text-[10px] font-medium text-sidebar-foreground/80 pt-1 border-t border-sidebar-border/50">
                    <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3 text-primary-glow" />Lvl {xp.level} · {xp.xp} XP</span>
                    <span className={`inline-flex items-center gap-1 ${xp.streak > 0 ? "text-warning" : "text-sidebar-foreground/50"}`}>
                      <Flame className="h-3 w-3" />{xp.streak}d
                    </span>
                  </div>
                )}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Simulators</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portalNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className={item.color} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isInstructor && (
          <SidebarGroup>
            <SidebarGroupLabel>Instructor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {instructorNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-2 py-1.5 text-xs text-sidebar-foreground/70 truncate">{user.email}</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground justify-start"
        >
          <Lock className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
