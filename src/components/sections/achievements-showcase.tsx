"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Reveal } from "@/components/animations/reveal";
import { SampleNotice } from "@/components/layout/sample-notice";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { achievementCategories } from "@/data/achievements";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/types";

export function AchievementsShowcase({ achievements, heading = true }: { achievements: Achievement[]; heading?: boolean }) {
  const [cat, setCat] = useState<string>("all");
  const list = cat === "all" ? achievements : achievements.filter((a) => a.category === cat);
  const hasSamples = achievements.some((a) => a.isSample);

  return (
    <div>
      {heading ? (
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              id="achievements-title"
              eyebrow="Alumni Achievements"
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

      <div role="group" aria-label="Filter by field" className={cn("no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0", heading && "mt-12")}>
        {[{ slug: "all", name: "All Fields" }, ...achievementCategories].map((c) => (
          <button
            key={c.slug}
            type="button"
            aria-pressed={cat === c.slug}
            onClick={() => setCat(c.slug)}
            className={cn(
              "relative shrink-0 px-4 py-3.5 text-[0.8125rem] font-semibold transition-colors",
              cat === c.slug ? "text-navy" : "text-muted-strong hover:text-ink",
            )}
          >
            {c.name}
            {cat === c.slug ? <m.span layoutId="ach-tab" className="absolute inset-x-3 -bottom-px h-0.5 bg-gold-dark" /> : null}
          </button>
        ))}
      </div>

      {hasSamples ? (
        <SampleNotice className="mt-8">
          No achievement has been published yet. The profiles below are <strong>clearly-marked samples</strong> showing the layout — they do not describe real people, awards or affiliations.
        </SampleNotice>
      ) : null}

      <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((a) => (
            <m.li key={a.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <AchievementCard a={a} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      {!list.length ? <p className="mt-10 text-center text-muted-strong">No published achievements in this field yet.</p> : null}
    </div>
  );
}
