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
  Target,
  Boxes,
  Server,
  Container,
  Layers,
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
      { label: "Incidents", to: "/ops/incidents", icon: AlertTriangle, enabled: true },
      { label: "Problems", to: "/ops/problems", icon: AlertOctagon, enabled: true },
      { label: "Changes", to: "/ops/changes", icon: GitPullRequest, enabled: true },
      { label: "CMDB", to: "/ops/cmdb", icon: Database, enabled: true },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Alerts", to: "/ops/alerts", icon: ShieldAlert, enabled: true },
      { label: "Splunk ES Notables", to: "/ops/notables", icon: Search, enabled: true },
    ],
  },
  {
    label: "Reliability",
    items: [
      { label: "Monitoring", to: "/ops/monitoring", icon: Activity, enabled: true },
      { label: "Services", to: "/ops/sre/services", icon: Cpu, enabled: true },
      { label: "SLOs", to: "/ops/sre/slos", icon: Target, enabled: true },
    ],
  },
  {
    label: "Kubernetes & Containers",
    items: [
      { label: "Clusters", to: "/ops/k8s/clusters", icon: Layers, enabled: true },
      { label: "Workloads", to: "/ops/k8s/workloads", icon: Boxes, enabled: true },
      { label: "Pods", to: "/ops/k8s/pods", icon: Server, enabled: true },
      { label: "Docker", to: "/ops/k8s/containers", icon: Container, enabled: true },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "DevOps", to: "/ops/devops", icon: Workflow, enabled: false },
      { label: "Cloud Operations", to: "/ops/cloud", icon: Cloud, enabled: false },
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
