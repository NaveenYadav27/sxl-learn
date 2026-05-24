/**
 * K8sAutoText — scans a plain string for known Kubernetes glossary terms
 * and wraps each occurrence with a <K8sTerm> hover-glossary trigger.
 *
 * Used inside lab "why this step matters" copy, incident summaries and
 * troubleshooting checklists so engineers can hover any K8s noun and get
 * a beginner+technical popover (Linux vs Windows, SOC relevance, commands,
 * failure modes) without leaving the page.
 */
import { Fragment, useMemo } from "react";
import { K8S_GLOSSARY } from "@/lib/k8sGlossary";
import { K8sTerm } from "./K8sTerm";

// Build a single regex of every term + alias, longest first so multi-word
// matches win over substrings. Word-boundary aware but tolerates hyphens
// (e.g. "kube-apiserver", "kube-proxy").
const PATTERN = (() => {
  const set = new Set<string>();
  for (const e of Object.values(K8S_GLOSSARY)) {
    set.add(e.term);
    for (const a of e.aliases ?? []) set.add(a);
  }
  const sorted = Array.from(set).sort((a, b) => b.length - a.length);
  const escaped = sorted.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?<![A-Za-z0-9_-])(${escaped.join("|")})(?![A-Za-z0-9_-])`, "gi");
})();

export function K8sAutoText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    const out: Array<{ kind: "text" | "term"; value: string }> = [];
    let last = 0;
    const re = new RegExp(PATTERN.source, PATTERN.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ kind: "text", value: text.slice(last, m.index) });
      out.push({ kind: "term", value: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.kind === "term" ? (
          <K8sTerm key={i} term={p.value}>{p.value}</K8sTerm>
        ) : (
          <Fragment key={i}>{p.value}</Fragment>
        ),
      )}
    </span>
  );
}

export default K8sAutoText;
