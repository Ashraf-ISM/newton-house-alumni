import Link from "next/link";
import { cn } from "@/lib/utils";
import { Emblem } from "./emblem";

export function Logo({
  tone = "light",
  className,
  compact = false,
}: {
  /** light = for dark backgrounds */
  tone?: "light" | "dark";
  className?: string;
  compact?: boolean;
}) {
  const light = tone === "light";
  return (
    <Link
      href="/"
      aria-label="Newton House — Patna Science College Alumni Association, home"
      className={cn("group flex items-center gap-3", className)}
    >
      <Emblem className={cn("size-11 transition-transform duration-500 group-hover:scale-[1.04] sm:size-12", light ? "text-gold" : "text-gold-dark")} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[1.2rem] font-semibold tracking-[0.06em] sm:text-[1.3rem]",
            light ? "text-ivory" : "text-navy",
          )}
        >
          NEWTON HOUSE
        </span>
        {!compact && (
          <>
            <span className={cn("mt-1 font-label text-[0.56rem] font-semibold tracking-[0.2em] sm:text-[0.6rem]", light ? "text-ivory/75" : "text-muted-strong")}>
              PATNA SCIENCE COLLEGE
            </span>
            <span className={cn("mt-0.5 font-label text-[0.56rem] tracking-[0.2em] sm:text-[0.6rem]", light ? "text-gold/90" : "text-gold-deep")}>
              ALUMNI ASSOCIATION
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
