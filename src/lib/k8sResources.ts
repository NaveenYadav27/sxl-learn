/**
 * Catalog of downloadable Kubernetes resource-pack PDFs that ship with the
 * ShadowXLab Kubernetes program. All files live under /public/resources/ so
 * they can be served and linked directly without an API round-trip.
 */
export type SkillLevel = "Beginner" | "Engineer" | "Enterprise";

export interface K8sResource {
  id: string;
  title: string;
  file: string;          // path under /public, served as /resources/...
  size: string;          // human-readable size
  pages: number;         // approx page count
  readingTime: string;   // e.g. "45 min"
  level: SkillLevel;
  sections: string[];    // chapters / topics covered
  blurb: string;
  tag: "Master" | "Cheat sheet" | "Playbook" | "Workbook" | "Windows" | "Incidents" | "Interview";
}

export const K8S_RESOURCES: K8sResource[] = [
  {
    id: "master",
    title: "Kubernetes Master Training Guide",
    file: "/resources/Visual_Kubernetes_Guide.pdf",
    size: "~12 KB",
    pages: 14,
    readingTime: "45 min",
    level: "Engineer",
    tag: "Master",
    blurb:
      "The backbone of the program. Architecture, pod lifecycle, networking, storage, RBAC, hybrid Linux/Windows clusters and observability — beginner-to-enterprise.",
    sections: [
      "Why Kubernetes exists",
      "Control plane & worker components",
      "Pod lifecycle & probes",
      "Networking & Service types",
      "Storage / PV / PVC / CSI",
      "RBAC & PodSecurityAdmission",
      "Linux ↔ Windows hybrid",
      "Observability stack",
      "Troubleshooting methodology",
      "Enterprise patterns",
    ],
  },
  {
    id: "cheatsheet",
    title: "kubectl Cheat Sheet",
    file: "/resources/kubectl_Cheat_Sheet.pdf",
    size: "~3 KB",
    pages: 4,
    readingTime: "5 min",
    level: "Beginner",
    tag: "Cheat sheet",
    blurb:
      "Every command you'll use in production — context, pods, services, rollouts, debug, RBAC. Print-friendly.",
    sections: ["Context", "Pods & workloads", "Services & networking", "Rollouts", "Debug & events", "RBAC"],
  },
  {
    id: "playbook",
    title: "Troubleshooting Playbook",
    file: "/resources/Kubernetes_Troubleshooting_Playbook.pdf",
    size: "~7 KB",
    pages: 12,
    readingTime: "25 min",
    level: "Engineer",
    tag: "Playbook",
    blurb:
      "11 production incidents — symptom → likely causes → exact investigation commands. The fastest path from alert to remediation.",
    sections: [
      "Node NotReady", "CrashLoopBackOff", "ImagePullBackOff", "Pending Pods",
      "CoreDNS failure", "CNI failure", "OOMKilled", "Probe failures",
      "PVC Pending", "API server 5xx", "Service unreachable",
    ],
  },
  {
    id: "workbook",
    title: "Lab Workbook",
    file: "/resources/Kubernetes_Lab_Workbook.pdf",
    size: "~7 KB",
    pages: 16,
    readingTime: "60 min hands-on",
    level: "Beginner",
    tag: "Workbook",
    blurb:
      "Step-by-step labs aligned to Modules 1–3 with objective, commands and expected output for every exercise.",
    sections: [
      "Run your first container", "Build a Dockerfile", "Push to a registry",
      "kubectl & first Pod", "Deployment + Service", "Diagnose CrashLoopBackOff",
      "Windows worker node", "RBAC for a junior SRE",
    ],
  },
  {
    id: "windows",
    title: "Windows Worker Node Labs",
    file: "/resources/Windows_Worker_Node_Labs.pdf",
    size: "~5 KB",
    pages: 8,
    readingTime: "20 min",
    level: "Enterprise",
    tag: "Windows",
    blurb:
      "Hybrid Linux + Windows Kubernetes. Joining Windows nodes, scheduling IIS workloads, HNS troubleshooting.",
    sections: ["Concepts", "Join Windows node", "Schedule IIS pod", "HNS & kube-proxy.exe", "Windows troubleshooting matrix"],
  },
  {
    id: "handsOnWorkbook",
    title: "Hands-On Labs Workbook (12 enterprise labs)",
    file: "/resources/labs/Kubernetes_HandsOn_Labs_Workbook.pdf",
    size: "~80 KB",
    pages: 60,
    readingTime: "8h hands-on",
    level: "Engineer",
    tag: "Workbook",
    blurb:
      "The complete Module 3 lab system in one downloadable workbook — kubeadm install, SRE troubleshooting, Flannel/CNI, RBAC, monitoring, Windows worker nodes and a full enterprise incident investigation capstone.",
    sections: [
      "Install Kubernetes on Ubuntu", "Troubleshooting fundamentals", "Lifecycle & architecture",
      "Pods & Deployments", "Services & networking", "Flannel & CNI",
      "Resources & OOMKilled", "Storage", "Security",
      "Monitoring & observability", "Windows worker node", "Enterprise incident capstone",
    ],
  },
  {
    id: "incidents",
    title: "Enterprise Incident Guide",
    file: "/resources/Enterprise_Incident_Guide.pdf",
    size: "~6 KB",
    pages: 10,
    readingTime: "20 min",
    level: "Enterprise",
    tag: "Incidents",
    blurb:
      "Five real production scenarios — Black Friday latency, pod evictions, DNS storm, Windows mass-NotReady, secret exfiltration — with investigation, fix and postmortem lessons.",
    sections: ["P1 latency", "Eviction storms", "DNS storm", "Windows pool down", "Secret exfiltration"],
  },
  {
    id: "interview",
    title: "Interview, Viva & Scenario Prep",
    file: "/resources/Kubernetes_Interview_Viva_Prep.pdf",
    size: "~6 KB",
    pages: 10,
    readingTime: "30 min",
    level: "Engineer",
    tag: "Interview",
    blurb:
      "80+ questions with model answers — beginner, intermediate, advanced and scenario-based for SRE / platform / DevOps interviews and vivas.",
    sections: ["Beginner Q&A", "Intermediate Q&A", "Advanced Q&A", "Scenario / viva drills"],
  },
];

/**
 * Map an Ops-Console incident ID to the resource sections that explain it.
 * Used by the IncidentDetail page to render a "Related Guide Sections" panel.
 */
export interface RelatedGuideEntry {
  resourceId: string;
  chapters: string[];
}

export const INCIDENT_GUIDE_LINKS: Record<string, RelatedGuideEntry[]> = {
  // M3 — CrashLoopBackOff family
  "K8S-INC-3001": [
    { resourceId: "master",   chapters: ["Pod lifecycle & probes", "Troubleshooting methodology"] },
    { resourceId: "playbook", chapters: ["CrashLoopBackOff", "Probe failures"] },
    { resourceId: "workbook", chapters: ["Diagnose CrashLoopBackOff"] },
  ],
  "K8S-INC-3002": [
    { resourceId: "master",   chapters: ["Control plane & worker components", "Linux ↔ Windows hybrid"] },
    { resourceId: "windows",  chapters: ["HNS & kube-proxy.exe", "Windows troubleshooting matrix"] },
    { resourceId: "playbook", chapters: ["Node NotReady"] },
  ],
  "K8S-INC-3003": [
    { resourceId: "master",   chapters: ["Networking & Service types"] },
    { resourceId: "playbook", chapters: ["Service unreachable", "CoreDNS failure"] },
    { resourceId: "incidents", chapters: ["DNS storm"] },
  ],
  "K8S-INC-3004": [
    { resourceId: "master",   chapters: ["Pod lifecycle & probes"] },
    { resourceId: "playbook", chapters: ["Pending Pods", "PVC Pending"] },
  ],
  "K8S-INC-3005": [
    { resourceId: "master",   chapters: ["RBAC & PodSecurityAdmission"] },
    { resourceId: "incidents", chapters: ["Secret exfiltration"] },
    { resourceId: "interview", chapters: ["Scenario / viva drills"] },
  ],
};

/** Fallback links applied to any incident not explicitly mapped. */
export const DEFAULT_GUIDE_LINKS: RelatedGuideEntry[] = [
  { resourceId: "master",   chapters: ["Troubleshooting methodology"] },
  { resourceId: "playbook", chapters: ["Investigation commands"] },
  { resourceId: "cheatsheet", chapters: ["Debug & events"] },
];
