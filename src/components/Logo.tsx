import { cn } from "@/lib/utils";
import logoSrc from "@/assets/shadowx-logo.png";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

interface LogoProps {
  size?: Size;
  showWordmark?: boolean;
  showTagline?: boolean;
  variant?: "default" | "stacked" | "wordmark-only";
  className?: string;
}

/**
 * ShadowX Lab — official brand mark
 * Empower · Illuminate · Uphold
 */
export function Logo({
  size = "sm",
  showWordmark = true,
  showTagline = false,
  variant = "default",
  className,
}: LogoProps) {
  if (variant === "wordmark-only") {
    return (
      <div className={cn("leading-tight", className)}>
        <span className="font-display font-bold tracking-wide text-shadowx-gradient text-lg">
          SHADOWX LAB
        </span>
        {showTagline && (
          <div className="text-[9px] uppercase tracking-[0.2em] text-shadowx-gold/80 mt-0.5">
            Empower · Illuminate · Uphold
          </div>
        )}
      </div>
    );
  }

  const mark = (
    <div
      className={cn(
        "relative grid place-items-center shrink-0 rounded-md bg-shadowx-obsidian ring-1 ring-shadowx-azure/30 shadow-glow-azure",
        sizeMap[size]
      )}
    >
      <img
        src={logoSrc}
        alt="ShadowX Lab"
        className="h-full w-full object-contain p-0.5"
        loading="eager"
        decoding="async"
      />
    </div>
  );

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {mark}
        {showWordmark && (
          <div className="text-center leading-tight">
            <div className="font-display font-bold tracking-wider text-shadowx-gradient text-base">
              SHADOWX LAB
            </div>
            {showTagline && (
              <div className="text-[9px] uppercase tracking-[0.2em] text-shadowx-gold/80 mt-0.5">
                Empower · Illuminate · Uphold
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {mark}
      {showWordmark && (
        <div className="leading-tight">
          <div className="font-display font-bold tracking-wider text-shadowx-gradient text-sm">
            SHADOWX LAB
          </div>
          {showTagline && (
            <div className="text-[9px] uppercase tracking-[0.2em] text-shadowx-gold/80 mt-0.5">
              Empower · Illuminate · Uphold
            </div>
          )}
        </div>
      )}
    </div>
  );
}
