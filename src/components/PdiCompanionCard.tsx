import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Server, ExternalLink, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { usePdi } from "@/hooks/usePdi";

/**
 * "Connect your PDI" card — shown on the dashboard for CIS-ITSM learners.
 * Lets them save the URL of their personal ServiceNow developer instance so
 * we can deep-link them into the real product alongside our simulator.
 */
export function PdiCompanionCard() {
  const { pdiUrl, loading, save } = usePdi();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setDraft(pdiUrl ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await save(draft);
    setSaving(false);
    if (!res.ok) {
      toast.error("Couldn't save PDI", { description: res.error });
      return;
    }
    toast.success(res.value ? "PDI connected" : "PDI cleared");
    setEditing(false);
  }

  async function handleDisconnect() {
    setSaving(true);
    const res = await save(null);
    setSaving(false);
    if (!res.ok) {
      toast.error("Couldn't disconnect", { description: res.error });
      return;
    }
    toast.success("PDI disconnected");
    setEditing(false);
  }

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded grid place-items-center bg-primary-soft text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">ServiceNow PDI companion</CardTitle>
              <CardDescription className="text-xs">
                Pair this platform with a real ServiceNow Personal Developer Instance.
              </CardDescription>
            </div>
          </div>
          {pdiUrl && !editing && (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" /> Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!pdiUrl && !editing && (
          <>
            <p className="text-sm text-muted-foreground">
              CIS-ITSM exam scenarios assume hands-on time in a real PDI. Request a free instance from
              ServiceNow, then paste its URL here so each lab can deep-link you straight to the matching screen.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://developer.servicenow.com/dev.do#!/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Request a free PDI
                </Button>
              </a>
              <Button size="sm" onClick={startEdit} disabled={loading}>
                I have a PDI — connect it
              </Button>
            </div>
          </>
        )}

        {pdiUrl && !editing && (
          <>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-mono break-all">
              {pdiUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={pdiUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open my PDI
                </Button>
              </a>
              <Button size="sm" variant="outline" className="gap-2" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" /> Change
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleDisconnect}
                disabled={saving}
              >
                <Trash2 className="h-3.5 w-3.5" /> Disconnect
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: each ServiceNow lab now shows an <strong>Open in PDI</strong> button that jumps straight to
              the relevant table (e.g. Incident, Problem, Change).
            </p>
          </>
        )}

        {editing && (
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="pdi-url">
              Your PDI URL or instance id
            </label>
            <Input
              id="pdi-url"
              autoFocus
              placeholder="https://dev12345.service-now.com"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              You can paste the full URL or just the instance id like <code>dev12345</code>.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                <Check className="h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-2">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
