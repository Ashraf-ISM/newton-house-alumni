import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Portrait } from "@/components/alumni/portrait";
import { Badge } from "@/components/ui/badge";
import { categoryName } from "@/data/achievements";
import type { Achievement } from "@/types";

export function AchievementCard({ a }: { a: Achievement }) {
  return (
    <article className="group relative grid h-full grid-cols-[7.5rem_1fr] bg-card shadow-soft ring-1 ring-line/70 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift sm:grid-cols-[9rem_1fr]">
      <Portrait name={a.isSample ? "Sample Profile" : a.name} photoUrl={a.portraitUrl} className="h-full min-h-48" textClassName="text-4xl" sizes="10rem" />
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">{categoryName(a.category)}</span>
          {a.isSample ? <Badge variant="sample">Sample</Badge> : a.verified ? <BadgeCheck className="size-4 text-gold-dark" aria-label="Verified" /> : null}
        </div>
        <h3 className="mt-2 font-serif text-[1.45rem] leading-tight text-navy">
          <Link href={`/achievements/${a.slug}`} className="after:absolute after:inset-0">
            {a.name}
          </Link>
        </h3>
        <p className="mt-1 text-[0.8125rem] font-medium text-ink/80">
          {a.designation} · {a.organisation}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-strong">{a.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[0.8125rem] font-semibold text-gold-deep">
          Read profile <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}
