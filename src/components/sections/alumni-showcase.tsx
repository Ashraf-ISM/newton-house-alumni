"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlumniCard } from "@/components/alumni/alumni-card";
import { Reveal } from "@/components/animations/reveal";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AlumniProfile } from "@/types";

export function AlumniShowcase({ alumni, total }: { alumni: AlumniProfile[]; total: number }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const hasSamples = alumni.some((a) => a.isSample);

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="alumni-title" className="relative overflow-hidden bg-card py-24 sm:py-28 lg:py-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
      <div className="container-nh grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <Reveal className="min-w-0 lg:col-span-4">
          <SectionHeading
            id="alumni-title"
            eyebrow="Alumni Directory"
            title="Reconnect with Your Newton House Family"
            lead="Discover and connect with fellow alumni across generations, professions and locations."
          />
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/alumni" className={cn(buttonVariants({ variant: "navy", size: "lg" }))}>
              Browse Alumni <ArrowRight aria-hidden className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
            <Link href="/join" className="link-underline text-sm font-semibold text-gold-deep">
              Add your profile
            </Link>
          </div>
          {hasSamples ? (
            <p className="mt-6 max-w-sm text-[0.8125rem] leading-relaxed text-muted-strong">
              Profiles shown are clearly labelled <strong className="font-semibold text-ink">sample records</strong> until verified members are approved.
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted-strong">{total} alumni in the public directory.</p>
          )}
        </Reveal>

        <div className="relative min-w-0 lg:col-span-8">
          <ul
            ref={track}
            onScroll={update}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 pt-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
            aria-label="Featured alumni"
          >
            {alumni.map((a) => (
              <li key={a.id} className="w-[74%] shrink-0 snap-start min-[480px]:w-[46%] md:w-[31%] lg:w-[calc((100%-2.5rem)/3)]">
                <AlumniCard alum={a} />
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={edge.start}
              aria-label="Previous alumni"
              className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold-dark hover:text-gold-deep disabled:opacity-35"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={edge.end}
              aria-label="Next alumni"
              className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold-dark hover:text-gold-deep disabled:opacity-35"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
