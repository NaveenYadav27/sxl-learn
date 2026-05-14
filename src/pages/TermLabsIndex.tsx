import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ExternalLink, FlaskConical, Search } from "lucide-react";
import { TECH_GLOSSARY } from "@/lib/techGlossary";

// Group terms by topical category for nicer browsing.
const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Kubernetes", keys: ["pod","deployment","replicaset","service","ingress","configmap","secret","namespace","node","kubelet","kube-proxy","etcd","scheduler","cni","csi","helm","kubectl","yaml","manifest","control plane","api server","rolling update","liveness probe","readiness probe","imagepullbackoff","crashloopbackoff"] },
  { title: "Containers", keys: ["container","image","layer","registry","dockerfile","cgroup","containerd","runc","oci","capabilities","seccomp","overlayfs","multi-stage"] },
  { title: "Cloud & platforms", keys: ["eks","aks","gke","openshift","iam","rbac","service account"] },
  { title: "Networking", keys: ["dns","tls","http","https","tcp","udp","vpc","subnet","loadbalancer","nat","vlan","cidr"] },
  { title: "DevOps & SRE", keys: ["cicd","pipeline","artifact","sre","sla","slo","sli","mttr","mtbf","error budget","blue-green","canary","iac","terraform","ansible","git","gitops"] },
  { title: "Observability", keys: ["prometheus","grafana","loki","jaeger","opentelemetry","splunk"] },
  { title: "Security", keys: ["cve","cvss","mfa","oauth","oidc","saml","jwt","zerotrust","siem","soar","edr","xdr","soc"] },
  { title: "ITSM", keys: ["itil","itsm","incident","problem","change","cmdb","ci","servicenow"] },
  { title: "APIs & architecture", keys: ["api","rest","graphql","webhook","microservice","monolith"] },
];

export default function TermLabsIndex() {
  const [q, setQ] = useState("");
  const total = Object.keys(TECH_GLOSSARY).length;

  const groups = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: g.keys
        .map((k) => ({ key: k, entry: TECH_GLOSSARY[k] }))
        .filter((x) => x.entry)
        .filter((x) => !ql || x.entry.term.toLowerCase().includes(ql) || x.entry.quick.toLowerCase().includes(ql) || x.key.includes(ql)),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  return (
    <AppLayout
      breadcrumb={<Breadcrumb items={[{ label: "Catalog", to: "/catalog" }, { label: "Term Labs" }]} />}
      title="Term Labs — every tech term as a hands-on lab"
    >
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <Card className="shadow-card border-primary/30">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h1 className="text-base md:text-lg font-semibold">Term Labs</h1>
              <Badge variant="outline" className="text-[10px]">{total} labs</Badge>
              <Badge variant="secondary" className="text-[10px] ml-auto">Each opens in a new tab</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Every tech term in the platform glossary is available as its own interactive lab — visual diagram, telemetry header, terminal preview and panel-by-panel walkthrough.
            </p>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search terms — e.g. ingress, cgroup, slo, jwt…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>

        {groups.map((g) => (
          <Card key={g.title} className="shadow-card">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold">{g.title}</h2>
                <Badge variant="outline" className="text-[10px]">{g.items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {g.items.map(({ key, entry }) => (
                  <Link
                    key={key}
                    to={`/term-lab/${encodeURIComponent(key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border border-border rounded-md p-3 hover:border-primary/60 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold group-hover:text-primary truncate">{entry.term}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{entry.quick}</div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <Card><CardContent className="pt-5 text-sm text-muted-foreground">No matching terms.</CardContent></Card>
        )}
      </div>
    </AppLayout>
  );
}
