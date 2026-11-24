"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Vertical legacy timeline. A gold progress line is scrubbed by scroll
 * (GSAP ScrollTrigger) and each milestone marker lights up as it is reached.
 * Dates are shown only when verified; otherwise a discreet "archive pending" tag.
 */
export function Timeline({ entries, tone = "light", showImages = true }: { entries: TimelineEntry[]; tone?: "light" | "dark"; showImages?: boolean }) {
  const root = useRef<HTMLOListElement>(null);
  const dark = tone === "dark";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          const progress = root.current!.querySelector<HTMLElement>("[data-progress]");
          const items = gsap.utils.toArray<HTMLElement>("[data-entry]", root.current);

          if (reduce) {
            gsap.set(progress, { scaleY: 1 });
            items.forEach((el) => el.classList.add("is-reached"));
            return;
          }

          gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
            },
          );

          items.forEach((el) => {
            ScrollTrigger.create({
              trigger: el,
              start: "top 65%",
              onEnter: () => el.classList.add("is-reached"),
              onLeaveBack: () => el.classList.remove("is-reached"),
            });
            gsap.from(el.querySelector("[data-card]"), {
              opacity: 0,
              y: 36,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative mx-auto max-w-5xl">
      {/* Track + progress */}
      <span aria-hidden className={cn("absolute bottom-2 left-[0.6875rem] top-2 w-px md:left-1/2", dark ? "bg-gold/15" : "bg-line")} />
      <span
        aria-hidden
        data-progress
        className="absolute bottom-2 left-[0.6875rem] top-2 w-px origin-top bg-gradient-to-b from-gold via-gold-dark to-gold md:left-1/2"
        style={{ transform: "scaleY(0)" }}
      />

      {entries.map((e, i) => {
        const right = i % 2 === 1;
        return (
          <li key={e.id} data-entry className={cn("group/entry relative grid pl-12 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0", showImages ? "pb-14" : "pb-10 md:pb-6 md:not-first:-mt-12")}>
            {/* Marker */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1.5 flex size-[1.375rem] items-center justify-center rounded-full border transition-all duration-500 md:left-1/2 md:-translate-x-1/2",
                dark ? "border-gold/30 bg-navy" : "border-line bg-ivory",
                "group-[.is-reached]/entry:border-gold group-[.is-reached]/entry:shadow-[0_0_0_6px_rgb(214_173_104_/_0.15)]",
              )}
            >
              <span className="size-2 rounded-full bg-line transition-colors duration-500 group-[.is-reached]/entry:bg-gold" />
            </span>

            <div data-card className={cn("md:col-span-1", right ? "md:col-start-2" : "md:col-start-1 md:text-right")}>
              <p className={cn("font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em]", dark ? "text-gold" : "text-gold-deep")}>
                {e.era}
              </p>
              <h3 className={cn("mt-2 font-serif text-[1.85rem] leading-tight", dark ? "text-ivory" : "text-navy")}>{e.title}</h3>
              <p className={cn("mt-3 leading-relaxed", dark ? "text-ivory/70" : "text-muted-strong")}>{e.body}</p>
              <p className="mt-3">
                {e.dateLabel && e.verified ? (
                  <span className={cn("font-serif text-lg italic", dark ? "text-gold" : "text-gold-deep")}>{e.dateLabel}</span>
                ) : e.id !== "today" ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 font-label text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
                      dark ? "border-gold/30 text-gold/80" : "border-gold-dark/40 text-gold-deep",
                    )}
                  >
                    Date: archive verification pending
                  </span>
                ) : null}
              </p>
              {showImages && e.image ? (
                <div className={cn("mt-5 inline-block w-full max-w-sm print-frame rotate-[-1.2deg] transition-transform duration-700 hover:rotate-0", right ? "" : "md:rotate-[1.2deg]")}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={e.image.src} alt={e.image.alt} fill sizes="(min-width: 768px) 24rem, 90vw" className="object-cover" />
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
