"use client";

import { m } from "motion/react";

/** Soft cross-fade between public pages. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </m.div>
  );
}
