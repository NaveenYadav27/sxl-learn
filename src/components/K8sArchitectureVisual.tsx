// Visual map: basic Kubernetes terms → architecture position.
// Pure SVG, theme-aware via design tokens. Every node is a hover-glossary
// trigger via K8sTerm so learners can click any box and read the definition,
// Linux↔Windows mechanics, SOC relevance, and failure modes.

import { K8sTerm } from "@/components/K8sTerm";
import { Network, Cpu, Boxes } from "lucide-react";

interface NodeBox {
  id: string;        // glossary id
  label: string;     // visible label
  sub?: string;      // one-line role
  x: number; y: number; w: number; h: number;
  tone: "control" | "worker" | "pod" | "net" | "store";
}

const CONTROL_PLANE: NodeBox[] = [
  { id: "api-server",        label: "kube-apiserver",    sub: "front door · REST", x: 20,  y: 44, w: 150, h: 48, tone: "control" },
  { id: "scheduler",         label: "kube-scheduler",    sub: "places pods",       x: 180, y: 44, w: 140, h: 48, tone: "control" },
  { id: "controller-manager",label: "controller-manager",sub: "reconciles state",  x: 330, y: 44, w: 160, h: 48, tone: "control" },
  { id: "etcd",              label: "etcd",              sub: "cluster KV store",  x: 500, y: 44, w: 90,  h: 48, tone: "store" },
];

const WORKER: NodeBox[] = [
  { id: "kubelet",     label: "kubelet",     sub: "node agent",      x: 20,  y: 150, w: 110, h: 40, tone: "worker" },
  { id: "kube-proxy",  label: "kube-proxy",  sub: "iptables / IPVS", x: 140, y: 150, w: 130, h: 40, tone: "worker" },
  { id: "cni",         label: "CNI plugin",  sub: "pod networking",  x: 280, y: 150, w: 110, h: 40, tone: "net" },
  { id: "container-runtime", label: "containerd", sub: "runs containers", x: 400, y: 150, w: 130, h: 40, tone: "worker" },
];

const PODS: NodeBox[] = [
  { id: "pod", label: "Pod A", sub: "1+ containers", x: 30,  y: 210, w: 90, h: 44, tone: "pod" },
  { id: "pod", label: "Pod B", sub: "sidecar pair",  x: 130, y: 210, w: 90, h: 44, tone: "pod" },
  { id: "pod", label: "Pod C", sub: "init + app",    x: 230, y: 210, w: 90, h: 44, tone: "pod" },
];

const NETWORK: NodeBox[] = [
  { id: "service", label: "Service",  sub: "ClusterIP",        x: 350, y: 210, w: 110, h: 44, tone: "net" },
  { id: "ingress", label: "Ingress",  sub: "L7 entry",         x: 470, y: 210, w: 120, h: 44, tone: "net" },
];

function tone(t: NodeBox["tone"]) {
  switch (t) {
    case "control": return { stroke: "hsl(var(--ops-accent))",   fill: "hsl(var(--ops-accent)/0.12)" };
    case "worker":  return { stroke: "hsl(200 80% 55%)",         fill: "hsl(200 80% 55%/0.10)" };
    case "pod":     return { stroke: "hsl(142 70% 45%)",         fill: "hsl(142 70% 45%/0.12)" };
    case "net":     return { stroke: "hsl(265 60% 65%)",         fill: "hsl(265 60% 65%/0.12)" };
    case "store":   return { stroke: "hsl(35 90% 55%)",          fill: "hsl(35 90% 55%/0.12)" };
  }
}

function Node({ n }: { n: NodeBox }) {
  const c = tone(n.tone);
  return (
    <g>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={6}
        fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
      <foreignObject x={n.x} y={n.y} width={n.w} height={n.h}>
        <div className="flex h-full w-full flex-col items-center justify-center px-1 text-center leading-tight">
          <K8sTerm term={n.id}>
            <span className="text-[11.5px] font-semibold text-[hsl(var(--ops-fg))]">{n.label}</span>
          </K8sTerm>
          {n.sub && <span className="text-[9.5px] text-[hsl(var(--ops-muted-fg))]">{n.sub}</span>}
        </div>
      </foreignObject>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, dashed }: { x1:number;y1:number;x2:number;y2:number; dashed?: boolean }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="hsl(var(--ops-accent))" strokeWidth={1.3}
    strokeDasharray={dashed ? "4 3" : undefined}
    markerEnd="url(#kav-arrow)" />;
}

export function K8sArchitectureVisual() {
  return (
    <div className="rounded-md border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]">
      <div className="flex items-center gap-2 border-b border-[hsl(var(--ops-border))] px-4 py-2.5">
        <Network className="h-4 w-4 text-[hsl(var(--ops-accent))]" />
        <span className="text-[13px] font-semibold text-[hsl(var(--ops-fg))]">
          Visual map · basic Kubernetes terms → architecture
        </span>
        <span className="ml-auto text-[11px] text-[hsl(var(--ops-muted-fg))]">
          Hover any box for definition · Linux↔Windows · SOC relevance · failure modes
        </span>
      </div>

      <div className="px-4 pt-3">
        <Legend />
      </div>

      <div className="p-4">
        <svg viewBox="0 0 610 280" className="w-full h-auto">
          <defs>
            <marker id="kav-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--ops-accent))" />
            </marker>
          </defs>

          {/* Control plane band */}
          <rect x={10} y={26} width={590} height={80} rx={8}
            fill="hsl(var(--ops-accent)/0.04)" stroke="hsl(var(--ops-accent)/0.35)" strokeDasharray="3 3" />
          <text x={18} y={40} fontSize="9.5" fontWeight="700" fill="hsl(var(--ops-accent))" letterSpacing="1">
            CONTROL PLANE
          </text>
          {CONTROL_PLANE.map((n) => <Node key={n.label} n={n} />)}

          {/* Worker band */}
          <rect x={10} y={132} width={590} height={130} rx={8}
            fill="hsl(200 80% 55%/0.04)" stroke="hsl(200 80% 55%/0.35)" strokeDasharray="3 3" />
          <text x={18} y={146} fontSize="9.5" fontWeight="700" fill="hsl(200 80% 65%)" letterSpacing="1">
            WORKER NODE
          </text>
          {WORKER.map((n) => <Node key={n.label} n={n} />)}
          {PODS.map((n) => <Node key={n.label} n={n} />)}
          {NETWORK.map((n) => <Node key={n.label} n={n} />)}

          {/* Flows */}
          <Arrow x1={95}  y1={92}  x2={75}  y2={150} />     {/* api → kubelet */}
          <Arrow x1={250} y1={92}  x2={205} y2={150} />     {/* sched → kube-proxy region */}
          <Arrow x1={410} y1={92}  x2={465} y2={150} />     {/* ctrl-mgr → runtime */}
          <Arrow x1={545} y1={92}  x2={545} y2={150} dashed />{/* etcd ↔ */}
          <Arrow x1={75}  y1={190} x2={75}  y2={210} />     {/* kubelet → Pod A */}
          <Arrow x1={205} y1={190} x2={175} y2={210} />     {/* kube-proxy → Pod B */}
          <Arrow x1={465} y1={190} x2={275} y2={232} dashed />{/* runtime → Pod C */}
          <Arrow x1={320} y1={232} x2={350} y2={232} />     {/* pods → service */}
          <Arrow x1={460} y1={232} x2={470} y2={232} />     {/* service → ingress */}
        </svg>
      </div>

      <div className="grid gap-3 border-t border-[hsl(var(--ops-border))] p-4 text-[11.5px] md:grid-cols-3">
        <Quick icon={<Cpu className="h-3.5 w-3.5" />} title="Control plane"
          body="Brain of the cluster. Decides what should run. Stateless except etcd." />
        <Quick icon={<Boxes className="h-3.5 w-3.5" />} title="Worker node"
          body="Runs your workloads. kubelet pulls work from API server and asks containerd to start pods." />
        <Quick icon={<Network className="h-3.5 w-3.5" />} title="Networking"
          body="CNI gives every pod an IP. Service load-balances; Ingress is the L7 front door." />
      </div>
    </div>
  );
}

function Quick({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] p-2.5">
      <div className="mb-1 inline-flex items-center gap-1.5 text-[hsl(var(--ops-accent))]">
        {icon}<span className="text-[10.5px] font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-[hsl(var(--ops-fg))] leading-snug">{body}</div>
    </div>
  );
}

function Legend() {
  const items: { label: string; tone: NodeBox["tone"] }[] = [
    { label: "Control plane", tone: "control" },
    { label: "Worker agents", tone: "worker" },
    { label: "Pods",          tone: "pod" },
    { label: "Networking",    tone: "net" },
    { label: "State (etcd)",  tone: "store" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
      {items.map((i) => {
        const c = tone(i.tone);
        return (
          <span key={i.label} className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-bg))] px-1.5 py-0.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.fill, border: `1px solid ${c.stroke}` }} />
            <span className="text-[hsl(var(--ops-muted-fg))]">{i.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export default K8sArchitectureVisual;
