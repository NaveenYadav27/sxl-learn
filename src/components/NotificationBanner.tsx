import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "shadowxlab_notice_closed";

export function NotificationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "true") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div
      role="status"
      className="flex items-center gap-3 border-l-4 border-l-[hsl(24_95%_53%)] bg-card/60 px-4 py-2 text-xs sm:text-sm text-foreground/90 border-b border-border"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[hsl(24_95%_53%)]" />
      <p className="flex-1 leading-snug">
        At <span className="font-semibold text-foreground">ShadowXLab</span>, evolution is constant. Our platform is continuously enhanced, and any missing labs or concepts will be rapidly identified, engineered, and deployed.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
