import { useState } from "react";
import { ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/ops/components/PageHeader";
import { SectionCard } from "@/ops/components/SectionCard";

const SPLUNK_BASE = "https://siem.shadowxlab.com";

const QUICK_LINKS: { label: string; path: string; description: string }[] = [
  { label: "Enterprise Security", path: "/en-US/app/SplunkEnterpriseSecuritySuite", description: "ES home — posture, swimlanes, threat intel" },
  { label: "Incident Review", path: "/en-US/app/SplunkEnterpriseSecuritySuite/incident_review", description: "Notable event triage queue" },
  { label: "Search & Reporting", path: "/en-US/app/search/search", description: "Run ad-hoc SPL queries" },
  { label: "Security Posture", path: "/en-US/app/SplunkEnterpriseSecuritySuite/ess_security_posture", description: "Top-level KPIs across domains" },
];

export default function SplunkLive() {
  const [path, setPath] = useState(QUICK_LINKS[1].path);
  const [iframeKey, setIframeKey] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const url = `${SPLUNK_BASE}${path}`;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Splunk ES — Live"
        description="Embedded view of siem.shadowxlab.com. Sign in once in Splunk; the session persists in the iframe."
        breadcrumb={<span>Security / Splunk ES / Live</span>}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBlocked(false); setIframeKey((k) => k + 1); }}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-2.5 py-1 text-[12px] hover:border-[hsl(var(--ops-accent)/0.5)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reload
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-2.5 py-1 text-[12px] text-[hsl(var(--ops-accent))] hover:bg-[hsl(var(--ops-accent)/0.25)]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
            </a>
          </div>
        }
      />

      <div className="grid gap-3 p-4 lg:grid-cols-4">
        {QUICK_LINKS.map((q) => {
          const active = q.path === path;
          return (
            <button
              key={q.path}
              onClick={() => { setPath(q.path); setBlocked(false); setIframeKey((k) => k + 1); }}
              className={`rounded-sm border p-3 text-left transition ${
                active
                  ? "border-[hsl(var(--ops-accent)/0.6)] bg-[hsl(var(--ops-accent)/0.12)]"
                  : "border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] hover:border-[hsl(var(--ops-accent)/0.4)]"
              }`}
            >
              <div className="text-[12px] font-semibold text-[hsl(var(--ops-fg))]">{q.label}</div>
              <div className="mt-1 text-[11px] text-[hsl(var(--ops-muted-fg))]">{q.description}</div>
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <SectionCard
          title="Splunk console"
          description={url}
          bodyClassName="p-0"
        >
          <div className="relative h-[calc(100vh-360px)] min-h-[520px] w-full bg-black">
            <iframe
              key={iframeKey}
              src={url}
              title="Splunk Enterprise Security"
              className="h-full w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-read; clipboard-write; fullscreen"
              onError={() => setBlocked(true)}
            />
            {blocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[hsl(var(--ops-panel))]/95 p-6 text-center">
                <ShieldAlert className="h-8 w-8 text-[hsl(var(--ops-warning))]" />
                <div className="text-[13px] font-semibold">Splunk refused to load in a frame</div>
                <p className="max-w-md text-[12px] text-[hsl(var(--ops-muted-fg))]">
                  The Splunk server at <code className="font-mono">{SPLUNK_BASE}</code> is sending an{" "}
                  <code className="font-mono">X-Frame-Options</code> / CSP header that blocks embedding.
                  Open it in a new tab instead, or ask an admin to allow framing from this origin.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.15)] px-3 py-1.5 text-[12px] text-[hsl(var(--ops-accent))]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Splunk in new tab
                </a>
              </div>
            )}
          </div>
          <div className="border-t border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] px-3 py-2 text-[11px] text-[hsl(var(--ops-muted-fg))]">
            Tip: most Splunk deployments block iframe embedding by default. If the panel above stays blank,
            use <strong>Open in new tab</strong>. To enable embedding, set
            {" "}<code className="font-mono">X-Frame-Options: ALLOW-FROM</code> (or a matching{" "}
            <code className="font-mono">Content-Security-Policy: frame-ancestors</code>) on the Splunk web tier
            for <code className="font-mono">{window.location.origin}</code>.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
