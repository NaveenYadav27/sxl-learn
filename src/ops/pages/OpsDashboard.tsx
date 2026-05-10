import { PageHeader } from "../components/PageHeader";
import { KpiCard } from "../components/KpiCard";
import { SectionCard } from "../components/SectionCard";
import { EmptyState } from "../components/EmptyState";
import { Activity, AlertTriangle, GitPullRequest, ShieldAlert } from "lucide-react";

export default function OpsDashboard() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Operations Dashboard"
        description="Single pane of glass across ITSM, SOC, and reliability operations."
        breadcrumb={<span>Operate / Dashboard</span>}
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Open Incidents" value="—" hint="Awaiting module activation" intent="critical" />
        <KpiCard label="Active Alerts" value="—" hint="SOC stream offline" intent="warning" />
        <KpiCard label="Pending Changes" value="—" hint="CAB queue empty" intent="default" />
        <KpiCard label="SLA Compliance" value="—" hint="No data window selected" intent="success" />
      </div>

      <div className="grid gap-3 p-4 pt-0 lg:grid-cols-3">
        <SectionCard title="Service Management" description="Incident · Problem · Change · CMDB" className="lg:col-span-2">
          <EmptyState
            icon={GitPullRequest}
            title="ITSM module not yet activated"
            hint="Once enabled, incident queues, change calendars, and CMDB relationships will appear here."
          />
        </SectionCard>

        <SectionCard title="Security Operations" description="SOC · Splunk ES">
          <EmptyState
            icon={ShieldAlert}
            title="SOC streams offline"
            hint="Notable events and triage queues will populate when the SOC module is enabled."
          />
        </SectionCard>

        <SectionCard title="Reliability" description="Monitoring · SRE · DevOps · Cloud" className="lg:col-span-2">
          <EmptyState
            icon={Activity}
            title="No telemetry connected"
            hint="Service health, SLOs, and deployment pipelines will be visualized here."
          />
        </SectionCard>

        <SectionCard title="Recent Activity" description="Cross-module audit feed">
          <EmptyState
            icon={AlertTriangle}
            title="Activity feed empty"
            hint="System events, assignments, and approvals will stream here."
          />
        </SectionCard>
      </div>
    </div>
  );
}
