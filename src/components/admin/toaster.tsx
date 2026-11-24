"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";

type Toast = { id: number; ok: boolean; message: string };

export function toast(ok: boolean, message: string) {
  window.dispatchEvent(new CustomEvent<Omit<Toast, "id">>("nh-toast", { detail: { ok, message } }));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Omit<Toast, "id">>).detail;
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs, { ...d, id }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4200);
    };
    window.addEventListener("nh-toast", on);
    return () => window.removeEventListener("nh-toast", on);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <m.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24 }}
            role={t.ok ? "status" : "alert"}
            className="pointer-events-auto flex items-start gap-3 rounded-md bg-navy px-4 py-3 text-sm text-ivory shadow-lift"
          >
            {t.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" /> : <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#f0a48f]" />}
            {t.message}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
