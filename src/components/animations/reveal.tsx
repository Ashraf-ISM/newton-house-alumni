"use client";

import { m, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Tag = "div" | "section" | "li" | "ul" | "ol" | "header" | "article" | "p" | "span" | "figure";

/** Fade-and-rise when the element scrolls into view. Runs once. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
  amount?: number;
}) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({
  children,
  className,
  stagger = 0.08,
  as = "div",
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: Tag;
  amount?: number;
}) {
  const Comp = m[as];
  return (
    <Comp className={className} variants={container} custom={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: Tag }) {
  const Comp = m[as];
  return (
    <Comp className={className} variants={item}>
      {children}
    </Comp>
  );
}
