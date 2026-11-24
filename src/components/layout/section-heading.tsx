import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Eyebrow + editorial serif heading + optional lead paragraph. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  className,
  as: Tag = "h2",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow", dark ? "text-gold" : "text-gold-deep", align === "center" && "justify-center")}>{eyebrow}</p>
      ) : null}
      <Tag
        id={id}
        className={cn(
          "mt-4 text-[2.35rem] leading-[1.04] sm:text-5xl lg:text-[3.5rem]",
          dark ? "text-ivory" : "text-navy",
        )}
      >
        {title}
      </Tag>
      {lead ? (
        <p className={cn("mt-5 text-[1.0625rem] leading-relaxed", dark ? "text-ivory/72" : "text-muted-strong", align === "center" && "mx-auto max-w-xl")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
