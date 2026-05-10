export type Status = "new" | "assigned" | "in_progress" | "pending" | "resolved" | "closed";
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Assignee {
  id: string;
  name: string;
  group?: string;
  avatarUrl?: string;
}

export interface MenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}
