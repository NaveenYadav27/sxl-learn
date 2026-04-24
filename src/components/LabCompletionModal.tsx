import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Clock, ArrowRight, Award } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  labTitle: string;
  score: number;
  totalSteps: number;
  durationSec: number;
  newBadges: string[];
  nextLabSlug?: string | null;
  nextLabTitle?: string | null;
}

const badgeLabel: Record<string, { name: string; tone: string }> = {
  "first-lab": { name: "First Steps", tone: "bg-primary" },
  "identity-pro": { name: "Identity Pro", tone: "bg-domain-entra" },
  "soc-analyst": { name: "SOC Analyst", tone: "bg-domain-security" },
  "compliance-champ": { name: "Compliance Champion", tone: "bg-domain-compliance" },
  "xdr-master": { name: "XDR Master", tone: "bg-primary-glow" },
  "sc900-ready": { name: "SC-900 Ready", tone: "bg-gradient-hero" },
};

export function LabCompletionModal({
  open, onClose, labTitle, score, totalSteps, durationSec, newBadges, nextLabSlug, nextLabTitle,
}: Props) {
  const minutes = Math.max(1, Math.round(durationSec / 60));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-hero text-primary-foreground px-6 pt-8 pb-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary-foreground/20 grid place-items-center mb-3 backdrop-blur-sm">
            <Trophy className="h-8 w-8" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl text-primary-foreground">Lab complete!</DialogTitle>
            <p className="text-sm text-primary-foreground/85">{labTitle}</p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat icon={Sparkles} value={score} label="points" tone="text-primary" />
            <Stat icon={Award} value={totalSteps} label="steps" tone="text-success" />
            <Stat icon={Clock} value={`${minutes}m`} label="time" tone="text-warning" />
          </div>

          {newBadges.length > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary-soft p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-2">
                New badges unlocked
              </div>
              <div className="flex flex-wrap gap-2">
                {newBadges.map((slug) => {
                  const meta = badgeLabel[slug] ?? { name: slug, tone: "bg-muted" };
                  return (
                    <Badge key={slug} className={`${meta.tone} text-primary-foreground border-0 gap-1`}>
                      <Award className="h-3 w-3" /> {meta.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={onClose}>Stay on this lab</Button>
            {nextLabSlug ? (
              <Link to={`/lab/${nextLabSlug}`} onClick={onClose}>
                <Button className="w-full sm:w-auto gap-2">
                  Next: {nextLabTitle} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/progress" onClick={onClose}>
                <Button className="w-full sm:w-auto gap-2">
                  View my progress <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: any; value: any; label: string; tone: string }) {
  return (
    <div className="rounded-lg bg-muted/40 border border-border py-3">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${tone}`} />
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
