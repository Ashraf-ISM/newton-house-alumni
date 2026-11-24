"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { SiteImage } from "@/data/images";
import { cn } from "@/lib/utils";

interface PrintSpec {
  image: SiteImage;
  className: string; // positioning / size within the collage box
  rotate: number;
  depth: number; // parallax distance in px
  sepia?: boolean;
}

/** A cluster of photographic prints with layered parallax, echoing a family album. */
export function PrintCollage({ prints, className, sizes = "(min-width: 1024px) 26vw, 60vw" }: { prints: PrintSpec[]; className?: string; sizes?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {prints.map((p, i) => (
        <PrintLayer key={p.image.src + i} spec={p} progress={scrollYProgress} reduce={!!reduce} index={i} sizes={sizes} />
      ))}
    </div>
  );
}

function PrintLayer({
  spec,
  progress,
  reduce,
  index,
  sizes,
}: {
  spec: PrintSpec;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
  index: number;
  sizes: string;
}) {
  const y = useTransform(progress, [0, 1], [spec.depth, -spec.depth]);
  return (
    <m.figure
      className={cn("absolute", spec.className)}
      style={reduce ? { rotate: spec.rotate } : { y, rotate: spec.rotate }}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
    >
      <div className={cn("print-frame transition-transform duration-700 hover:scale-[1.02]", spec.sepia && "print-frame--sepia")}>
        <div className="relative overflow-hidden" style={{ aspectRatio: `${spec.image.width} / ${spec.image.height}` }}>
          <Image src={spec.image.src} alt={spec.image.alt} fill sizes={sizes} className="object-cover" />
        </div>
      </div>
    </m.figure>
  );
}
