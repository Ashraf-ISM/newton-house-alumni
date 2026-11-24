import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Clearly labels demonstration / unverified content. */
export function SampleNotice({ children, tone = "light", className }: { children: ReactNode; tone?: "light" | "dark"; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-md border border-dashed px-4 py-3 text-[0.8125rem] leading-relaxed",
        tone === "dark" ? "border-gold/35 bg-gold/[0.06] text-ivory/80" : "border-gold-dark/45 bg-gold/[0.08] text-ink/85",
        className,
      )}
    >
      <Info className={cn("mt-0.5 size-4 shrink-0", tone === "dark" ? "text-gold" : "text-gold-deep")} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
