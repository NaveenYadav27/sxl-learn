import { Button } from "@/components/ui/button";
import { ExternalLink, Server } from "lucide-react";
import { usePdi, pdiLink } from "@/hooks/usePdi";
import { Link } from "react-router-dom";

/**
 * Map a CIS-ITSM lab slug → the matching ServiceNow nav_to target.
 * If a lab isn't mapped explicitly, we fall back to the homepage.
 */
const LAB_TO_TARGET: Record<string, string> = {
  // Foundations
  "itsm-explore-instance": "navpage.do",
  "itsm-roles-and-groups": "sys_user_group_list.do",
  "itsm-process-map": "navpage.do",
  // Incident
  "itsm-create-incident": "incident.do?sys_id=-1",
  "itsm-priority-matrix": "incident_list.do",
  "itsm-resolve-and-close": "incident_list.do?sysparm_query=active=true",
  "itsm-major-incident": "incident_list.do?sysparm_query=priority=1",
  // Problem & Knowledge
  "itsm-create-problem": "problem.do?sys_id=-1",
  "itsm-rca-five-whys": "problem_list.do",
  "itsm-create-kb-article": "kb_knowledge.do?sys_id=-1",
  "itsm-link-known-error": "problem_list.do?sysparm_query=known_error=true",
  // Change & Release
  "itsm-standard-change": "change_request.do?sys_id=-1&sysparm_query=type=standard",
  "itsm-normal-change-cab": "change_request_list.do?sysparm_query=type=normal",
  "itsm-emergency-change": "change_request.do?sys_id=-1&sysparm_query=type=emergency",
  "itsm-change-schedule": "change_request_list.do",
  "itsm-release-promote": "rm_release_list.do",
  // Catalog & CMDB
  "itsm-build-catalog-item": "sc_cat_item_list.do",
  "itsm-fulfil-request": "sc_request_list.do",
  "itsm-create-ci": "cmdb_ci_list.do",
  "itsm-relate-cis": "cmdb_rel_ci_list.do",
  "itsm-mttr-dashboard": "$pa_dashboard.do",
};

/**
 * "Open in PDI" button shown on every ServiceNow lab.
 * If the user hasn't connected a PDI yet, we render a soft prompt that links
 * to the dashboard card instead.
 */
export function PdiDeepLink({ labSlug }: { labSlug: string }) {
  const { pdiUrl, loading } = usePdi();
  if (loading) return null;

  if (!pdiUrl) {
    return (
      <Link
        to="/dashboard"
        className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 hover:bg-muted px-2.5 py-2 text-xs transition-colors group"
        aria-label="Connect your ServiceNow PDI to deep-link this lab"
      >
        <Server className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-foreground">Connect your PDI</span>
          <span className="block text-[10px] text-muted-foreground">
            Practice this lab in a real ServiceNow instance
          </span>
        </span>
      </Link>
    );
  }

  const target = LAB_TO_TARGET[labSlug] ?? "navpage.do";
  const href = pdiLink(pdiUrl, target);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary-soft/40 hover:bg-primary-soft px-2.5 py-2 text-xs transition-colors group"
      aria-label="Open this lab in your ServiceNow PDI"
    >
      <Server className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-foreground">Open in my PDI</span>
        <span className="block text-[10px] text-muted-foreground">Jump to the matching screen</span>
      </span>
      <Button size="sm" variant="ghost" className="h-6 px-1.5 shrink-0" tabIndex={-1}>
        <ExternalLink className="h-3 w-3" />
      </Button>
    </a>
  );
}
