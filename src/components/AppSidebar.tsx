import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  Home, LayoutDashboard, BookOpen, Users, Shield, Lock, Gavel, Trophy,
  Settings, GraduationCap, Network, ClipboardCheck, Flame, Zap, Wallet, Building2, CalendarDays, Award,
} from "lucide-react";
import { getXpStats, type XpStats } from "@/lib/xp";
import { useAuth } from "@/hooks/useAuth";
import { useCourse } from "@/hooks/useCourse";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import { CourseSwitcher } from "@/components/CourseSwitcher";

const baseLearnerNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Course Catalog", url: "/catalog", icon: BookOpen },
  { title: "Session Plan", url: "/session-plan", icon: CalendarDays },
  { title: "My Live Tenant", url: "/tenant", icon: Building2, courseOnly: "sc-900" as const },
  { title: "ServiceNow Journey", url: "/servicenow-journey", icon: Award, courseOnly: "cis-itsm" as const },
  { title: "Practice Exam", url: "/exam", icon: ClipboardCheck },
  { title: "My Progress", url: "/progress", icon: Trophy },
  { title: "License Guide", url: "/licensing", icon: Wallet },
];

const sc900PortalNav = [
  { title: "Microsoft Entra", url: "/portal/entra", icon: Users, color: "text-domain-entra" },
  { title: "Defender XDR", url: "/defender", icon: Shield, color: "text-domain-security" },
  { title: "Microsoft Purview", url: "/purview", icon: Gavel, color: "text-domain-compliance" },
  { title: "Microsoft Sentinel", url: "/portal/sentinel", icon: Network, color: "text-primary-glow" },
];

const instructorNav = [
  { title: "Cohort", url: "/instructor/cohort", icon: GraduationCap },
  { title: "Learners", url: "/admin/learners", icon: Users },
];

const adminNav = [
  { title: "Learners", url: "/admin/learners", icon: Users },
  { title: "Enrollments", url: "/admin/enrollments", icon: ClipboardCheck },
  { title: "Manage Content", url: "/admin/content", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { isInstructor, isAdmin, signOut, user } = useAuth();
  const { course } = useCourse();
  const learnerNav = baseLearnerNav.filter((i) => !i.courseOnly || i.courseOnly === course.code);
  const portalNav = course.code === "sc-900" ? sc900PortalNav : [];
  const courseLabSlugs = useMemo(() => new Set(course.modules.flatMap((m) => m.labSlugs)), [course.code]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [xp, setXp] = useState<XpStats | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: allLabs }, { data: atts }, xpStats] = await Promise.all([
        supabase.from("labs").select("id, slug").eq("is_published", true),
        supabase.from("lab_attempts").select("lab_id, status").eq("user_id", user.id).eq("status", "completed"),
        getXpStats(user.id),
      ]);
      if (cancelled) return;
      const courseLabIds = new Set((allLabs ?? []).filter((l: any) => courseLabSlugs.has(l.slug)).map((l: any) => l.id));
      const doneIds = new Set((atts ?? []).map((a) => a.lab_id).filter((id) => courseLabIds.has(id)));
      setProgress({ done: doneIds.size, total: courseLabIds.size });
      setXp(xpStats);
    })();
    return () => { cancelled = true; };
  }, [user, pathname, course.code, courseLabSlugs]); // refresh when navigating or switching course

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
        <CourseSwitcher collapsed={collapsed} />
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
                      <span>{course.shortName} progress</span>
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

        {portalNav.length > 0 && (
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
        )}

        {isInstructor && !isAdmin && (
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
