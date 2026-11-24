"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/** Loads a reduced Motion feature set and honours the OS reduced-motion preference. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
