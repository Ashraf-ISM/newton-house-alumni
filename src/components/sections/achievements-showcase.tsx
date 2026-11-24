"use client";

import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Reveal } from "@/components/animations/reveal";
import { SampleNotice } from "@/components/layout/sample-notice";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { achievementCategories, categoryName } from "@/data/achievements";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementCategory } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function AchievementsShowcase({
  achievements,
  heading = true,
}: {
  achievements: Achievement[];
  heading?: boolean;
}) {
  const [cat, setCat] = useState<string>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: achievements.length };
    for (const c of achievementCategories) map[c.slug] = 0;
    for (const a of achievements) map[a.category] = (map[a.category] ?? 0) + 1;
    return map;
  }, [achievements]);

  const list = useMemo(
    () => (cat === "all" ? achievements : achievements.filter((a) => a.category === cat)),
    [achievements, cat],
  );

  const hasSamples = achievements.some((a) => a.isSample);
  const activeCategoryLabel = cat === "all" ? "All Fields" : categoryName(cat as AchievementCategory);

  return (
    <div>
      {heading ? (
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              id="achievements-title"
              eyebrow="Distinguished Alumni"
              title="Carrying the House Into the World"
              lead="Celebrating Newton House alumni across research, public service, science, enterprise and leadership."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/achievements" className={cn(buttonVariants({ variant: "outline" }))}>
              All achievements <ArrowRight aria-hidden />
            </Link>
          </Reveal>
        </div>
      ) : null}

      {/* Filter Bar: Pill-style navigation + Result counter */}
      <div className={cn("rounded-lg border border-line/85 bg-card p-3 shadow-soft sm:p-4", heading && "mt-12")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter achievements by category"
            className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-1 sm:flex-wrap"
          >
            {[{ slug: "all", name: "All Fields" }, ...achievementCategories].map((c) => {
              const active = cat === c.slug;
              const count = counts[c.slug] ?? 0;
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCat(c.slug)}
                  className={cn(
                    "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                    active ? "text-navy" : "text-muted-strong hover:bg-ivory hover:text-navy",
                  )}
                >
                  {active ? (
                    <m.span
                      layoutId="achievement-filter-pill"
                      className="absolute inset-0 rounded-full border border-gold-dark/40 bg-gold shadow-[0_4px_14px_-4px_rgb(214_173_104_/_0.65)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative z-10">{c.name}</span>
                  <span
                    className={cn(
                      "relative z-10 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-label text-[0.65rem] font-semibold tabular-nums transition-colors",
                      active ? "bg-navy/15 text-navy" : "bg-ivory-2 text-muted-strong",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Counter */}
          <div
            aria-live="polite"
            className="flex shrink-0 items-center justify-between gap-3 border-t border-line/70 pt-2.5 text-xs text-muted-strong lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"
          >
            <span>
              Showing <strong className="font-semibold text-navy tabular-nums">{list.length}</strong> of{" "}
              <strong className="font-semibold text-navy tabular-nums">{achievements.length}</strong>{" "}
              {achievements.length === 1 ? "profile" : "profiles"}
              {cat !== "all" ? (
                <span className="text-gold-deep"> · {activeCategoryLabel}</span>
              ) : null}
            </span>
            {cat !== "all" ? (
              <button
                type="button"
                onClick={() => setCat("all")}
                className="inline-flex items-center gap-1 font-semibold text-gold-deep hover:underline"
              >
                <RotateCcw className="size-3" aria-hidden /> Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Data Integrity / Sample Disclaimer */}
      {hasSamples ? (
        <SampleNotice className="mt-6">
          No verified achievement has replaced the demonstration set yet. Profiles badged{" "}
          <strong>Sample</strong> illustrate the directory layout — they do not describe real people, graduation
          years, awards or organisational affiliations.
        </SampleNotice>
      ) : null}

      {/* 3-Column Desktop / 2-Column Tablet / 1-Column Mobile Grid */}
      {list.length ? (
        <m.ul layout className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((a, idx) => (
              <m.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(idx * 0.05, 0.25) }}
                className="h-full"
              >
                <AchievementCard a={a} />
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-line bg-card/80 px-6 py-16 text-center">
          <Sparkles className="mx-auto size-7 text-gold-dark" aria-hidden />
          <p className="mt-3 font-serif text-2xl text-navy">No published profiles in {activeCategoryLabel} yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-strong">
            Know a Newton House alumnus recognized in this field? Submit their story below for verification.
          </p>
          <button
            type="button"
            onClick={() => setCat("all")}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
          >
            <RotateCcw className="size-3.5" aria-hidden /> Show all fields
          </button>
        </div>
      )}
    </div>
  );
}
