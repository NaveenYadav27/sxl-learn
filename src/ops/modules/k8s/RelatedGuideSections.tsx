/**
 * RelatedGuideSections — small inline panel rendered on K8s incident detail
 * pages. Maps the current incident ID to chapters in the downloadable
 * resource pack so learners can jump straight from an incident to the
 * matching chapter / lab / playbook.
 */
import { Link } from "react-router-dom";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import { K8S_RESOURCES, INCIDENT_GUIDE_LINKS, DEFAULT_GUIDE_LINKS } from "@/lib/k8sResources";

export function RelatedGuideSections({ incidentId }: { incidentId: string }) {
  const links = INCIDENT_GUIDE_LINKS[incidentId] ?? DEFAULT_GUIDE_LINKS;
  const resolved = links
    .map((l) => {
      const r = K8S_RESOURCES.find((x) => x.id === l.resourceId);
      return r ? { r, chapters: l.chapters } : null;
    })
    .filter(Boolean) as { r: typeof K8S_RESOURCES[number]; chapters: string[] }[];

  if (resolved.length === 0) return null;

  return (
    <section className="rounded-md border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.08)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--ops-accent))]">
          <BookOpen className="h-3.5 w-3.5" /> Related Guide Sections
        </div>
        <Link to="/k8s/resources" className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--ops-accent))] hover:underline">
          Resource Center <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {resolved.map(({ r, chapters }) => (
          <li key={r.id} className="rounded-sm border border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[hsl(var(--ops-fg))] truncate">{r.title}</div>
              <a
                href={r.file}
                download
                title={`Download ${r.title}`}
                className="inline-flex items-center gap-1 rounded-sm border border-[hsl(var(--ops-success)/0.5)] bg-[hsl(var(--ops-success)/0.15)] px-1.5 py-0.5 text-[10px] text-[hsl(var(--ops-success))] hover:bg-[hsl(var(--ops-success)/0.25)]"
              >
                <Download className="h-3 w-3" /> PDF
              </a>
            </div>
            <div className="mt-1 text-[10.5px] uppercase tracking-wide text-[hsl(var(--ops-muted-fg))]">
              {r.tag} · {r.level} · {r.readingTime}
            </div>
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-[hsl(var(--ops-fg))] list-disc list-inside">
              {chapters.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
