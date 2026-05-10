## ShadowXLab Enterprise Operations Simulator — Foundation Shell

Goal: a reusable enterprise platform shell (ServiceNow / Splunk ES / Grafana feel) layered **alongside** the existing learning app, not replacing it. All modules (ITSM, SOC, SRE, etc.) plug into this shell later without rebuilds.

### Scope of this phase
Foundation only. No labs, no fake incidents, no module logic. Reusable shell + design tokens + primitives + one empty Dashboard route to prove the shell works.

### 1. Audit & reuse (no rebuilds)
Reuse from current codebase:
- `AppLayout`, `AppSidebar`, `SidebarProvider` — extend, don't replace
- shadcn primitives: `card`, `table`, `badge`, `tabs`, `dialog`, `dropdown-menu`, `command` (search), `sheet` (notifications), `tooltip`, `breadcrumb`
- `cn()`, existing HSL token system in `index.css`
- Existing simulators stay untouched

### 2. New route namespace
Mount the enterprise shell at `/ops/*` so the learning app keeps working.
- `/ops` → Dashboard (empty grid placeholder, no fake data)
- `/ops/*` → 404 inside shell for now (modules added later)

### 3. Files to create

```
src/ops/
  layout/
    OpsLayout.tsx           Shell: sidebar + topbar + content
    OpsSidebar.tsx          Modular nav config-driven from navConfig.ts
    OpsTopbar.tsx           Search trigger, alerts, notifications, profile, status pill
    navConfig.ts            Single source of truth for sidebar sections
  components/
    KpiCard.tsx             Label, value, delta, trend slot
    DataTable.tsx           Generic <T> table: sort, filter, paginate, row status, expandable, row actions
    FilterBar.tsx           Reusable filter chips + search input
    StatusBadge.tsx         status="new|assigned|in_progress|pending|resolved|closed"
    SeverityBadge.tsx       severity="critical|high|medium|low|info"
    SlaIndicator.tsx        % + color band
    AssigneeChip.tsx        Avatar + name + group
    ActivityTimeline.tsx    Generic event feed
    OpsModal.tsx            Thin wrapper over Dialog with header/footer slots
    OpsTabs.tsx             Underlined enterprise tabs
    GlobalSearch.tsx        cmdk palette (Cmd+K)
    NotificationCenter.tsx  Sheet-based feed
    EmptyState.tsx          Icon + title + hint + optional CTA
    PageHeader.tsx          Title, breadcrumb, actions row
    SectionCard.tsx         Bordered surface with header
  lib/
    statuses.ts             Status + severity enums + color token map
    types.ts                Shared types (Status, Severity, Priority, Assignee)
  pages/
    OpsDashboard.tsx        Grid of empty KpiCard + SectionCard placeholders
```

### 4. Routing
Add to `src/App.tsx`:
```
<Route path="/ops" element={<OpsLayout />}>
  <Route index element={<OpsDashboard />} />
</Route>
```
`OpsLayout` renders an `<Outlet />`. Future modules: `<Route path="incidents" .../>` etc.

### 5. Sidebar config (expandable, no hardcoded module logic)
`navConfig.ts` exports groups: Operate (Dashboard), Service Mgmt (Incident, Problem, Change, CMDB), Security (SOC, Splunk ES), Reliability (Monitoring, SRE, DevOps, Cloud Ops), Insights (Reports, KB, Automation), Admin. Every item: `{ label, icon, to, enabled }`. Disabled items render greyed with "Coming soon" tooltip — no broken routes.

### 6. Design language
Add a scoped `.ops-theme` class on `OpsLayout` root with operational palette using existing HSL variables — no new globals so the learning app is unaffected:
- bg: graphite `222 18% 10%`, panel `222 16% 13%`, border `222 12% 20%`
- text: `220 14% 92%` / muted `220 10% 65%`
- accent azure (reuse `--shadow-azure`), severity uses existing destructive/warning/success/info
- Density: `text-[13px]` base, `h-9` rows, 12px gutters
- No animations beyond hover/focus transitions

Tokens added as CSS vars under `.ops-theme {}` in `index.css` so components can use `bg-[hsl(var(--ops-panel))]` consistently.

### 7. DataTable contract (the most important reusable)
```ts
type Column<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  width?: string;
};
type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  rowStatus?: (r: T) => Status;        // colors left border
  rowActions?: (r: T) => MenuItem[];
  expandable?: (r: T) => ReactNode;
  pageSize?: number;
  filters?: ReactNode;                  // FilterBar slot
  emptyState?: ReactNode;
};
```
Every future table (incidents, alerts, changes, assets, vulns, events) uses this — no new tables.

### 8. Status / severity system
Single `statuses.ts`:
```ts
export const STATUS = { new, assigned, in_progress, pending, resolved, closed } as const;
export const SEVERITY = { critical, high, medium, low, info } as const;
export const statusToken: Record<Status, {label, fg, bg, border}> = {...}
```
`StatusBadge`/`SeverityBadge` read from this map — change once, propagate everywhere.

### 9. Out of scope (explicit)
- No incident/alert/change UIs
- No fake data, no lorem
- No edits to learning app routes, simulators, courses, DB
- No backend changes, no migrations
- No marketing pages

### 10. Acceptance
- Visit `/ops` → enterprise shell renders: dark graphite, sidebar with grouped modular nav (most disabled), topbar with search/alerts/profile, empty Dashboard with KpiCard + SectionCard placeholders showing `EmptyState`
- All primitives importable from `@/ops/components/*`
- Existing `/`, `/dashboard`, `/catalog`, simulators unchanged
- Build passes

This shell is the substrate. Future ITSM/SOC/SRE work = add a route + use existing primitives. Zero shell rebuilds.