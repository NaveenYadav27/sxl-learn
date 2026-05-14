// Two compact runtime visualizations rendered on the M1 module page:
//   - Namespaces tree  (Host OS → namespaces → Containers)
//   - cgroups tree     (Host Resources → controllers → Containers, with throttle/OOM markers)
// Each node has a HoverTerm on the relevant kernel primitive.

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverTerm } from "@/components/HoverTerm";
import { Cpu, MemoryStick, HardDrive, Network, Server, Box, Flame, ShieldAlert } from "lucide-react";

export function RuntimeVisualizations() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <NamespacesViz />
      <CgroupsViz />
    </div>
  );
}

/* ---------------------------------------------------- Namespaces ---- */
function NamespacesViz() {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-shadowx-azure via-primary to-shadowx-azure" />
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Namespaces — isolation</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">Hover each layer</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          The Linux kernel partitions its global resources so each container sees its own private view.
        </p>

        <Layer icon={Server} label="Host OS" tone="muted">
          One shared kernel powers every container on this node.
        </Layer>

        <Connector />

        <div className="grid grid-cols-3 gap-2">
          <NsChip label="PID" termKey="namespace">
            Container sees only its own processes. PID 1 inside ≠ PID 1 on host.
          </NsChip>
          <NsChip label="NET" termKey="namespace">
            Private interfaces, routes and iptables. Bridged via veth pairs.
          </NsChip>
          <NsChip label="MNT" termKey="overlayfs">
            Private rootfs assembled from overlayfs layers.
          </NsChip>
        </div>

        <Connector />

        <div className="grid grid-cols-3 gap-2">
          <ContainerChip name="api" />
          <ContainerChip name="worker" />
          <ContainerChip name="cache" />
        </div>

        <p className="text-[11px] text-muted-foreground italic pt-1">
          Built with <HoverTerm termKey="runc">runc</HoverTerm> + <HoverTerm termKey="containerd">containerd</HoverTerm>.
        </p>
      </CardContent>
    </Card>
  );
}

/* --------------------------------------------------------- cgroups ---- */
function CgroupsViz() {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-warning via-primary to-warning" />
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">cgroups — resource limits</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">Watch for OOM</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          <HoverTerm termKey="cgroup">cgroups</HoverTerm> meter and cap CPU, memory and I/O so one workload can't starve a whole node.
        </p>

        <Layer icon={Server} label="Host resources" tone="muted">
          16 vCPU · 64 GiB RAM · 2 TB NVMe
        </Layer>

        <Connector />

        <div className="grid grid-cols-3 gap-2">
          <CgChip icon={Cpu} label="CPU" usage={68} cap="2.0 cores" tone="ok" />
          <CgChip icon={MemoryStick} label="Memory" usage={94} cap="512 MiB" tone="warn" hint="OOMKilled risk" />
          <CgChip icon={HardDrive} label="Disk I/O" usage={42} cap="50 MB/s" tone="ok" />
        </div>

        <Connector />

        <div className="grid grid-cols-3 gap-2">
          <ContainerChip name="api" status="ok" />
          <ContainerChip name="worker" status="throttled" />
          <ContainerChip name="cache" status="ok" />
        </div>

        <div className="rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-[11px] flex items-start gap-2">
          <Flame className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-warning">CPU throttling</span> on <code>worker</code> — hits its 2-core cap during peak.
            <br />
            <span className="font-semibold text-destructive">OOM event</span> recorded on <code>cache</code> — bump the memory limit or fix the leak.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------- shared atoms ---- */
function Layer({
  icon: Icon,
  label,
  tone = "primary",
  children,
}: {
  icon: any;
  label: string;
  tone?: "primary" | "muted";
  children?: React.ReactNode;
}) {
  const cls = tone === "muted" ? "bg-muted/40 border-border" : "bg-primary/10 border-primary/30";
  return (
    <div className={`rounded-md border ${cls} px-3 py-2 flex items-center gap-2.5`}>
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="min-w-0">
        <div className="text-xs font-semibold">{label}</div>
        {children && <div className="text-[11px] text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center">
      <div className="w-px h-3 bg-border" />
    </div>
  );
}

function NsChip({ label, termKey, children }: { label: string; termKey: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-shadowx-azure/30 bg-shadowx-azure/5 px-2 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-shadowx-azure font-semibold mb-1">
        <HoverTerm termKey={termKey} asChip>{label} ns</HoverTerm>
      </div>
      <div className="text-[10px] text-muted-foreground leading-snug">{children}</div>
    </div>
  );
}

function CgChip({
  icon: Icon,
  label,
  usage,
  cap,
  tone,
  hint,
}: {
  icon: any;
  label: string;
  usage: number;
  cap: string;
  tone: "ok" | "warn";
  hint?: string;
}) {
  const bar = tone === "warn" ? "bg-warning" : "bg-success";
  return (
    <div className="rounded-md border border-border px-2 py-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">cap {cap}</div>
      <div className="h-1.5 rounded bg-muted mt-1.5 overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${Math.min(usage, 100)}%` }} />
      </div>
      <div className="text-[10px] mt-0.5 text-foreground/70">{usage}%</div>
      {hint && <div className="text-[10px] text-warning mt-0.5">{hint}</div>}
    </div>
  );
}

function ContainerChip({ name, status }: { name: string; status?: "ok" | "throttled" }) {
  const cls =
    status === "throttled"
      ? "border-warning/50 bg-warning/10 text-warning"
      : "border-success/40 bg-success/5 text-success";
  return (
    <div className={`rounded-md border ${cls} px-2 py-1.5 text-center`}>
      <div className="flex items-center justify-center gap-1 text-[11px] font-mono font-semibold">
        <Box className="h-3 w-3" /> {name}
      </div>
      <div className="text-[9px] uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
        {status === "throttled" ? (
          <>
            <ShieldAlert className="h-2.5 w-2.5" /> throttled
          </>
        ) : (
          <>
            <Network className="h-2.5 w-2.5" /> running
          </>
        )}
      </div>
    </div>
  );
}

export default RuntimeVisualizations;
