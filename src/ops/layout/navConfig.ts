import {
  LayoutDashboard,
  AlertTriangle,
  AlertOctagon,
  GitPullRequest,
  Database,
  ShieldAlert,
  Search,
  Activity,
  Cpu,
  Workflow,
  Cloud,
  BarChart3,
  BookOpen,
  Bot,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operate",
    items: [
      { label: "Dashboard", to: "/ops", icon: LayoutDashboard, enabled: true },
    ],
  },
  {
    label: "Service Management",
    items: [
      { label: "Incidents", to: "/ops/incidents", icon: AlertTriangle, enabled: false },
      { label: "Problems", to: "/ops/problems", icon: AlertOctagon, enabled: false },
      { label: "Changes", to: "/ops/changes", icon: GitPullRequest, enabled: false },
      { label: "CMDB", to: "/ops/cmdb", icon: Database, enabled: false },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "SOC Operations", to: "/ops/soc", icon: ShieldAlert, enabled: false },
      { label: "Splunk ES", to: "/ops/splunk-es", icon: Search, enabled: false },
    ],
  },
  {
    label: "Reliability",
    items: [
      { label: "Monitoring", to: "/ops/monitoring", icon: Activity, enabled: false },
      { label: "SRE", to: "/ops/sre", icon: Cpu, enabled: false },
      { label: "DevOps", to: "/ops/devops", icon: Workflow, enabled: false },
      { label: "Cloud Operations", to: "/ops/cloud", icon: Cloud, enabled: false },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", to: "/ops/reports", icon: BarChart3, enabled: false },
      { label: "Knowledge Base", to: "/ops/kb", icon: BookOpen, enabled: false },
      { label: "Automation", to: "/ops/automation", icon: Bot, enabled: false },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Administration", to: "/ops/admin", icon: Settings, enabled: false },
    ],
  },
];
