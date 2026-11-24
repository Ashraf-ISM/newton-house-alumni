"use client";

import { ArrowRight, Play } from "lucide-react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";
import { MemoriesReel } from "./memories-reel";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [reelOpen, setReelOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const word = (text: string, i: number) => (
    <span key={text} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <m.span
        className="inline-block"
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.35 + i * 0.12 }}
      >
        {text}
      </m.span>
    </span>
  );

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-navy text-ivory md:h-[92vh] md:max-h-[1000px] md:items-center">
      {/* Photograph */}
      <m.div aria-hidden className="absolute inset-0 -z-10" style={reduce ? undefined : { y: imgY }}>
        <m.div
          className="absolute inset-0 md:left-[22%]"
          initial={{ scale: 1.14, opacity: 0 }}
          animate={{ scale: 1.02, opacity: 1 }}
          transition={{ scale: { duration: 2.8, ease: EASE }, opacity: { duration: 1.2 } }}
        >
          <Image
            src={images.heroExterior.src}
            alt={images.heroExterior.alt}
            fill
            priority
            fetchPriority="high"
            quality={85}
            sizes="(min-width: 768px) 78vw, 100vw"
            className="object-cover object-[62%_40%]"
          />
        </m.div>
        {/* Cinematic overlays: dense navy on the left, natural photo on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/[0.88] via-35% to-navy/0 to-80% max-md:via-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 via-30% to-navy/40 max-md:from-navy max-md:via-navy/60 max-md:via-45%" />
        <div className="absolute inset-0 shadow-[inset_0_0_160px_rgb(7_22_41_/_0.55)]" />
      </m.div>

      <m.div className="container-nh relative pb-24 pt-40 md:pb-0 md:pt-24" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
        <div className="max-w-[40rem]">
          <m.p
            className="eyebrow text-gold"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            <span>
              Patna Science College <span aria-hidden className="mx-1.5 text-gold/50">|</span> Newton House
            </span>
          </m.p>

          <h1 id="hero-title" className="mt-6 font-serif text-display font-medium tracking-[-0.015em] text-ivory text-shadow-soft">
            {["Newton", "House"].map((w, i) => (
              <span key={w}>
                {word(w, i)}
                {i === 0 ? " " : null}
              </span>
            ))}
          </h1>

          <m.p
            className="mt-4 font-serif text-[1.55rem] italic leading-snug text-gold sm:text-[2rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.75 }}
          >
            The Home. The Memories. The Brotherhood.
          </m.p>

          <m.p
            className="mt-6 max-w-[32rem] text-base leading-relaxed text-ivory/80 sm:text-[1.0625rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.9 }}
          >
            Celebrating the journey, friendships, achievements and lifelong connections of Newton House, Patna Science College.
          </m.p>

          <m.div
            className="mt-9 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.05 }}
          >
            <Link href="/legacy" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
              Explore Our Legacy
              <ArrowRight aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
            <button type="button" onClick={() => setReelOpen(true)} className={cn(buttonVariants({ variant: "outline-light", size: "lg" }), "pl-2.5")}>
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-gold/60 transition-colors group-hover/btn:bg-gold group-hover/btn:text-navy">
                <Play className="!size-3.5 translate-x-px fill-current" aria-hidden />
              </span>
              Watch Memories
            </button>
          </m.div>
        </div>
      </m.div>

      {/* Scroll cue */}
      <m.a
        href="#impact"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-ivory/65 transition-colors hover:text-gold md:left-auto md:flex md:translate-x-0 md:[left:max(3rem,calc((100vw-84rem)/2+3rem))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        aria-label="Scroll to explore"
      >
        <span className="relative flex h-9 w-[1.35rem] justify-center rounded-full border border-current pt-1.5">
          <span className="block h-2 w-px animate-scroll-cue bg-current" />
        </span>
        <span className="font-label text-[0.65rem] font-medium uppercase tracking-[0.22em]">Scroll Down</span>
      </m.a>

      <MemoriesReel open={reelOpen} onClose={() => setReelOpen(false)} />
    </section>
  );
}
