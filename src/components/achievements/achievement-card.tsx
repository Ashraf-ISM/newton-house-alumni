import { ArrowUpRight, BadgeCheck, Building2, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { categoryName } from "@/data/achievements";
import { initials } from "@/lib/utils";
import type { Achievement } from "@/types";

export function AchievementCard({ a }: { a: Achievement }) {
  const monogram = a.isSample ? "NH" : initials(a.name);

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden bg-card p-6 shadow-soft ring-1 ring-line/80 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift sm:p-7">
      {/* Subtle architectural top rule */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold-dark via-gold to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div>
        {/* Header: Portrait / Refined Initials + Category & Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-gold/45 bg-ivory">
            {a.portraitUrl ? (
              <Image
                src={a.portraitUrl}
                alt={`Portrait of ${a.name}`}
                fill
                sizes="3.5rem"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                unoptimized={a.portraitUrl.startsWith("data:")}
              />
            ) : (
              <span
                role="img"
                aria-label={`Initials for ${a.name}`}
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ivory via-ivory-2 to-gold/15 font-serif text-lg font-semibold tracking-wider text-navy transition-colors duration-300 group-hover:bg-gold/20"
              >
                {monogram}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
              {categoryName(a.category)}
            </span>
            {a.isSample ? (
              <Badge variant="sample">Sample</Badge>
            ) : a.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e3efe6] px-2.5 py-1 font-label text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#22553a]">
                <BadgeCheck className="size-3" aria-hidden /> Verified
              </span>
            ) : null}
          </div>
        </div>

        {/* Name & Graduation Year */}
        <div className="mt-5">
          <h3 className="font-serif text-[1.5rem] leading-[1.18] text-navy transition-colors duration-300 group-hover:text-gold-deep">
            <Link href={`/achievements/${a.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {a.name}
            </Link>
          </h3>

          <p className="mt-1.5 inline-flex items-center gap-1.5 font-label text-[0.6875rem] font-medium tracking-[0.08em] text-muted-strong">
            <GraduationCap className="size-3.5 text-brick/85" aria-hidden />
            {a.graduationYear
              ? `Class of ${a.graduationYear}${a.department ? ` · ${a.department}` : ""}`
              : "Graduation year: verified on publication"}
          </p>
        </div>

        {/* Designation & Organisation */}
        <div className="mt-4 border-l-2 border-gold/55 pl-3.5">
          <p className="text-[0.875rem] font-semibold leading-snug text-ink">{a.designation}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-muted-strong">
            <Building2 className="size-3.5 shrink-0 text-gold-dark" aria-hidden />
            <span className="truncate">{a.organisation}</span>
          </p>
        </div>

        {/* Summary citation */}
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-strong">{a.summary}</p>
      </div>

      {/* Footer: Read profile link */}
      <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4">
        <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-navy transition-colors duration-300 group-hover:text-gold-deep">
          Read profile
          <ArrowUpRight
            className="size-3.5 text-gold-dark transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
        <span className="font-serif text-xs italic text-muted">Newton House</span>
      </div>
    </article>
  );
}
