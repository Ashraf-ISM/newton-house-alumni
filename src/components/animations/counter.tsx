"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Counts up to `value` once in view. Renders the final value for reduced-motion users. */
export function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {(reduce ? value : display).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
