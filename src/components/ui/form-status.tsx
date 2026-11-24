import { CheckCircle2, AlertCircle, FlaskConical } from "lucide-react";
import type { ActionResult } from "@/types";
import { cn } from "@/lib/utils";

/** Announces form results to assistive tech and shows a styled banner. */
export function FormStatus({ state, className, tone = "light" }: { state: ActionResult | null; className?: string; tone?: "light" | "dark" }) {
  if (!state) return <div aria-live="polite" className="sr-only" />;
  const dark = tone === "dark";
  return (
    <div
      role={state.ok ? "status" : "alert"}
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm leading-relaxed",
        state.ok
          ? dark
            ? "border-gold/30 bg-gold/10 text-ivory"
            : "border-[#bcd8c4] bg-[#eef6f0] text-[#1f4d33]"
          : dark
            ? "border-brick/50 bg-brick/15 text-ivory"
            : "border-[#e8c3b8] bg-[#fbefeb] text-[#7c3121]",
        className,
      )}
    >
      {state.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      <div>
        <p>{state.message}</p>
        {state.ok && state.demo ? (
          <p className={cn("mt-1 flex items-center gap-1.5 text-xs", dark ? "text-ivory/70" : "text-[#1f4d33]/80")}>
            <FlaskConical className="size-3.5" /> Demo mode — stored in server memory until Supabase is connected.
          </p>
        ) : null}
      </div>
    </div>
  );
}
