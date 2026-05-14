// Auto-links known tech terms inside a plain text string to <HoverTerm>.
// Each term is wrapped only on its FIRST occurrence per <SmartText> instance
// to keep the page readable.

import React from "react";
import { HoverTerm } from "@/components/HoverTerm";
import { GLOSSARY_KEYS_SORTED, findGlossaryTerm } from "@/lib/techGlossary";

const ESCAPE = /[.*+?^${}()|[\]\\]/g;
const escapeRe = (s: string) => s.replace(ESCAPE, "\\$&");

// Build one big regex once: word-boundary, case-insensitive, longest-first.
// Use lookarounds so we match multi-word terms like "control plane" too.
const PATTERN = new RegExp(
  "(?<![\\w-])(" + GLOSSARY_KEYS_SORTED.map(escapeRe).join("|") + ")(?![\\w-])",
  "gi",
);

interface Props {
  text: string;
  /** Stop wrapping after this many distinct terms (default 6). */
  maxTerms?: number;
  className?: string;
}

export function SmartText({ text, maxTerms = 6, className }: Props) {
  if (!text) return null;
  const used = new Set<string>();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  PATTERN.lastIndex = 0;

  while ((match = PATTERN.exec(text)) !== null) {
    const raw = match[0];
    const key = raw.toLowerCase();
    const entry = findGlossaryTerm(key);
    if (!entry || used.has(entry.term) || used.size >= maxTerms) continue;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <HoverTerm key={`${entry.term}-${match.index}`} termKey={key}>
        {raw}
      </HoverTerm>,
    );
    used.add(entry.term);
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return <span className={className}>{parts}</span>;
}

export default SmartText;
