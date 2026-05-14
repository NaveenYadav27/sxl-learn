// Hover-glossary chips rendered on the M1/M2 module pages.
// Picks the relevant terms from DOCKER_HOVER_TERMS for each module.

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointerClick } from "lucide-react";
import { HoverTerm } from "@/components/HoverTerm";

const M1_TERMS = [
  "namespace", "cgroup", "containerd", "runc", "overlayfs",
  "docker-engine", "dockerd", "oci", "capabilities", "seccomp",
];
const M2_TERMS = [
  "FROM", "COPY", "RUN", "CMD", "ENTRYPOINT", "EXPOSE", "WORKDIR",
  "docker-hub", "registry", "layer", "multi-stage",
];

export function HoverGlossary({ moduleSlug }: { moduleSlug: string }) {
  const terms =
    moduleSlug === "k8s-containerization-fundamentals" ? M1_TERMS
    : moduleSlug === "k8s-docker-images" ? M2_TERMS
    : [];
  if (!terms.length) return null;

  return (
    <Card className="shadow-card">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-2">
          <MousePointerClick className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Hover intelligence</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">{terms.length} terms</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Hover any chip for a quick definition plus production relevance, security impact and the most common failure mode you'll see in the wild.
        </p>
        <div className="flex flex-wrap gap-2">
          {terms.map((k) => (
            <HoverTerm key={k} termKey={k} asChip />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default HoverGlossary;
