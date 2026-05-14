// Visual diagram panel for Concept Labs.
// Renders an SVG architecture illustration based on the concept's name/keywords.
// Pure SVG — no external deps. All colors via design tokens.

import React from "react";

interface Props {
  conceptName: string;
  conceptId: string;
}

function pickKind(name: string, id: string): Kind {
  const s = (name + " " + id).toLowerCase();
  if (/(pod|kubernet|deployment|replicaset|orchestrat)/.test(s)) return "k8s";
  if (/(image|layer|build|dockerfile|registry)/.test(s)) return "image";
  if (/(network|service|ingress|load.?balanc|dns|cni|bridge)/.test(s)) return "network";
  if (/(secur|capabil|seccomp|namespac|cgroup|isolat|runtime|runc|containerd)/.test(s)) return "runtime";
  if (/(lifecycle|stop|start|create|state)/.test(s)) return "lifecycle";
  if (/(virtual|hypervisor|bare.?metal|evolution|deploy)/.test(s)) return "evolution";
  return "generic";
}

type Kind = "k8s" | "image" | "network" | "runtime" | "lifecycle" | "evolution" | "generic";

export function ConceptDiagram({ conceptName, conceptId }: Props) {
  const kind = pickKind(conceptName, conceptId);
  return (
    <div className="rounded-md border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-muted/20 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-primary/20 bg-primary/5 text-[10px] uppercase tracking-wider text-primary font-semibold flex items-center justify-between">
        <span>Visual model</span>
        <span className="text-muted-foreground normal-case tracking-normal">{conceptName}</span>
      </div>
      <div className="p-4">
        <svg viewBox="0 0 600 220" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cd-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
            <marker id="cd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--primary))" />
            </marker>
          </defs>
          {kind === "k8s" && <DiagramK8s />}
          {kind === "image" && <DiagramImage />}
          {kind === "network" && <DiagramNetwork />}
          {kind === "runtime" && <DiagramRuntime />}
          {kind === "lifecycle" && <DiagramLifecycle />}
          {kind === "evolution" && <DiagramEvolution />}
          {kind === "generic" && <DiagramGeneric label={conceptName} />}
        </svg>
      </div>
    </div>
  );
}

/* ------- Sub-diagrams (pure SVG, theme-aware via currentColor / hsl tokens) ------- */

const text = "fill-foreground";
const muted = "fill-muted-foreground";

function Box({ x, y, w = 90, h = 40, label, sub, tone = "primary" }: {
  x: number; y: number; w?: number; h?: number; label: string; sub?: string; tone?: "primary" | "muted" | "success" | "warning";
}) {
  const stroke = tone === "primary" ? "hsl(var(--primary))" :
                 tone === "success" ? "hsl(var(--success))" :
                 tone === "warning" ? "hsl(var(--warning))" :
                 "hsl(var(--border))";
  const fill = tone === "primary" ? "hsl(var(--primary) / 0.08)" :
               tone === "success" ? "hsl(var(--success) / 0.08)" :
               tone === "warning" ? "hsl(var(--warning) / 0.08)" :
               "hsl(var(--muted) / 0.4)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1} />
      <text x={x + w / 2} y={y + (sub ? 18 : h / 2 + 4)} textAnchor="middle" className={text} fontSize="11" fontWeight="600">{label}</text>
      {sub && <text x={x + w / 2} y={y + 32} textAnchor="middle" className={muted} fontSize="9">{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--primary))" strokeWidth={1.5} markerEnd="url(#cd-arrow)" />;
}

function DiagramK8s() {
  return (
    <g>
      <rect x={10} y={10} width={580} height={200} rx={8} fill="url(#cd-grad)" stroke="hsl(var(--primary) / 0.3)" />
      <text x={20} y={28} className={muted} fontSize="10">CONTROL PLANE</text>
      <Box x={20} y={36} w={100} h={36} label="API server" tone="primary" />
      <Box x={130} y={36} w={90} h={36} label="Scheduler" tone="primary" />
      <Box x={230} y={36} w={120} h={36} label="Controller-mgr" tone="primary" />
      <Box x={360} y={36} w={70} h={36} label="etcd" tone="primary" />
      <text x={20} y={100} className={muted} fontSize="10">WORKER NODE</text>
      <rect x={20} y={108} width={560} height={92} rx={6} fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" />
      <Box x={30} y={120} w={70} h={28} label="kubelet" tone="muted" />
      <Box x={110} y={120} w={90} h={28} label="kube-proxy" tone="muted" />
      <Box x={220} y={120} w={70} h={50} label="Pod A" sub="2 ctrs" tone="success" />
      <Box x={300} y={120} w={70} h={50} label="Pod B" sub="1 ctr" tone="success" />
      <Box x={380} y={120} w={70} h={50} label="Pod C" sub="3 ctrs" tone="success" />
      <Box x={470} y={120} w={100} h={50} label="Service" sub="ClusterIP" tone="warning" />
      <Arrow x1={70} y1={72} x2={255} y2={120} />
      <Arrow x1={335} y1={120} x2={470} y2={140} />
    </g>
  );
}

function DiagramImage() {
  return (
    <g>
      <text x={20} y={24} className={muted} fontSize="10">IMAGE LAYERS (immutable)</text>
      {[
        { y: 40, label: "Base OS · alpine:3.20", tone: "muted" as const },
        { y: 70, label: "RUN apk add nodejs", tone: "primary" as const },
        { y: 100, label: "COPY package.json + npm install", tone: "primary" as const },
        { y: 130, label: "COPY . .   (app source)", tone: "primary" as const },
        { y: 160, label: "Writable container layer", tone: "success" as const },
      ].map((l, i) => (
        <Box key={i} x={20} y={l.y} w={350} h={24} label={l.label} tone={l.tone} />
      ))}
      <Box x={400} y={40} w={170} h={50} label="Registry" sub="ghcr.io / ECR / ACR" tone="warning" />
      <Box x={400} y={110} w={170} h={50} label="Container" sub="docker run" tone="success" />
      <Arrow x1={370} y1={60} x2={400} y2={65} />
      <Arrow x1={485} y1={90} x2={485} y2={110} />
      <Arrow x1={400} y1={135} x2={370} y2={170} />
    </g>
  );
}

function DiagramNetwork() {
  return (
    <g>
      <Box x={20} y={90} w={80} h={40} label="Client" sub="HTTPS" tone="muted" />
      <Box x={140} y={90} w={110} h={40} label="LoadBalancer" sub="NLB / ALB" tone="warning" />
      <Box x={290} y={90} w={100} h={40} label="Ingress" sub="L7 routing" tone="primary" />
      <Box x={430} y={40} w={140} h={40} label="Service A" sub="ClusterIP" tone="primary" />
      <Box x={430} y={140} w={140} h={40} label="Service B" sub="ClusterIP" tone="primary" />
      <Box x={460} y={5} w={45} h={28} label="Pod" tone="success" />
      <Box x={510} y={5} w={45} h={28} label="Pod" tone="success" />
      <Box x={460} y={185} w={45} h={28} label="Pod" tone="success" />
      <Box x={510} y={185} w={45} h={28} label="Pod" tone="success" />
      <Arrow x1={100} y1={110} x2={140} y2={110} />
      <Arrow x1={250} y1={110} x2={290} y2={110} />
      <Arrow x1={390} y1={100} x2={430} y2={60} />
      <Arrow x1={390} y1={120} x2={430} y2={160} />
    </g>
  );
}

function DiagramRuntime() {
  return (
    <g>
      <Box x={20} y={20} w={560} h={40} label="Application process" sub="your code (PID 1 inside container)" tone="success" />
      <Box x={20} y={70} w={180} h={36} label="Namespaces" sub="pid · net · mnt · uts · ipc · user" tone="primary" />
      <Box x={210} y={70} w={180} h={36} label="cgroups" sub="cpu · memory · io · pids" tone="primary" />
      <Box x={400} y={70} w={180} h={36} label="seccomp + capabilities" sub="syscall + privilege filter" tone="warning" />
      <Box x={20} y={120} w={560} h={36} label="runc / containerd" sub="OCI runtime — creates ns + cgroups, exec()s your code" tone="muted" />
      <Box x={20} y={166} w={560} h={36} label="Linux kernel" sub="shared with host — there is no guest OS" tone="muted" />
    </g>
  );
}

function DiagramLifecycle() {
  const states = [
    { x: 20, label: "create", tone: "muted" as const },
    { x: 130, label: "running", tone: "success" as const },
    { x: 240, label: "paused", tone: "warning" as const },
    { x: 350, label: "stopped", tone: "warning" as const },
    { x: 460, label: "removed", tone: "muted" as const },
  ];
  return (
    <g>
      {states.map((s, i) => (
        <React.Fragment key={s.label}>
          <Box x={s.x} y={90} w={100} h={44} label={s.label} tone={s.tone} />
          {i < states.length - 1 && <Arrow x1={s.x + 100} y1={112} x2={s.x + 110} y2={112} />}
        </React.Fragment>
      ))}
      <text x={300} y={40} textAnchor="middle" className={muted} fontSize="10">CONTAINER LIFECYCLE</text>
      <text x={70} y={170} className={muted} fontSize="9">docker create</text>
      <text x={170} y={170} className={muted} fontSize="9">docker start</text>
      <text x={285} y={170} className={muted} fontSize="9">docker pause</text>
      <text x={395} y={170} className={muted} fontSize="9">docker stop</text>
      <text x={500} y={170} className={muted} fontSize="9">docker rm</text>
    </g>
  );
}

function DiagramEvolution() {
  const items = [
    { x: 20, label: "Bare metal", sub: "1 OS / 1 app", tone: "muted" as const },
    { x: 140, label: "VMs", sub: "guest OS each", tone: "muted" as const },
    { x: 260, label: "Containers", sub: "share kernel", tone: "primary" as const },
    { x: 380, label: "Orchestration", sub: "Kubernetes", tone: "primary" as const },
    { x: 500, label: "Serverless", sub: "no servers", tone: "success" as const },
  ];
  return (
    <g>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <Box x={it.x} y={80} w={100} h={56} label={it.label} sub={it.sub} tone={it.tone} />
          {i < items.length - 1 && <Arrow x1={it.x + 100} y1={108} x2={it.x + 120} y2={108} />}
        </React.Fragment>
      ))}
      <text x={300} y={40} textAnchor="middle" className={muted} fontSize="10">EVOLUTION OF DEPLOYMENT MODELS</text>
    </g>
  );
}

function DiagramGeneric({ label }: { label: string }) {
  return (
    <g>
      <Box x={40} y={80} w={160} h={60} label="Input" sub="request / event" tone="muted" />
      <Box x={220} y={80} w={160} h={60} label={label.length > 20 ? label.slice(0, 20) + "…" : label} sub="this concept" tone="primary" />
      <Box x={400} y={80} w={160} h={60} label="Output" sub="effect on system" tone="success" />
      <Arrow x1={200} y1={110} x2={220} y2={110} />
      <Arrow x1={380} y1={110} x2={400} y2={110} />
    </g>
  );
}

export default ConceptDiagram;
