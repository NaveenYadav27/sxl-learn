import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./navConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers } from "lucide-react";

interface Props {
  collapsed: boolean;
}

export function OpsSidebar({ collapsed }: Props) {
  const { pathname } = useLocation();
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-sidebar))] text-[hsl(var(--ops-sidebar-fg))] transition-[width]",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div className="flex h-12 items-center gap-2 border-b border-[hsl(var(--ops-border))] px-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[hsl(var(--ops-accent))] text-[hsl(var(--ops-bg))]">
          <Layers className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[12px] font-semibold">ShadowX Lab</div>
            <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">Ops Platform</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <TooltipProvider delayDuration={200}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--ops-muted-fg))]">
                  {group.label}
                </div>
              )}
              <ul className="space-y-0.5 px-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to || (item.to !== "/ops" && pathname.startsWith(item.to));
                  const content = (
                    <span
                      className={cn(
                        "group flex items-center gap-2 rounded-sm px-2 py-1.5 text-[12px] transition-colors",
                        active
                          ? "bg-[hsl(var(--ops-accent)/0.18)] text-[hsl(var(--ops-fg))]"
                          : "text-[hsl(var(--ops-sidebar-fg))] hover:bg-[hsl(var(--ops-panel-2))] hover:text-[hsl(var(--ops-fg))]",
                        !item.enabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active && "text-[hsl(var(--ops-accent))]")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {!item.enabled && (
                            <span className="text-[9px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">soon</span>
                          )}
                        </>
                      )}
                    </span>
                  );
                  const node = item.enabled ? (
                    <NavLink to={item.to}>{content}</NavLink>
                  ) : (
                    <div aria-disabled>{content}</div>
                  );
                  return (
                    <li key={item.to}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{node}</TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                            {!item.enabled && " · Coming soon"}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        node
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </TooltipProvider>
      </nav>
      <div className="border-t border-[hsl(var(--ops-border))] px-3 py-2 text-[10px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
        {collapsed ? "v1" : "Platform v1.0"}
      </div>
    </aside>
  );
}
