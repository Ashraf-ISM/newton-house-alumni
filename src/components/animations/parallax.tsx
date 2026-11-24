"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Gentle vertical parallax for imagery. Content moves ±`distance`px across the viewport. */
export function Parallax({ children, className, distance = 40 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={cn("relative", className)}>
      <m.div style={reduce ? undefined : { y }} className="relative h-full w-full will-change-transform">
        {children}
      </m.div>
    </div>
  );
}
