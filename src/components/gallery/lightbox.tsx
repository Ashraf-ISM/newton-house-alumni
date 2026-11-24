"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

export interface LightboxItem {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width: number;
  height: number;
}

export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, go, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title ?? "Photograph"}
          className="fixed inset-0 z-[80] flex flex-col bg-navy-ink/[0.97] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 text-ivory sm:px-8">
            <p className="font-label text-xs tracking-[0.2em] text-ivory/60">
              {index! + 1} / {items.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close photograph"
              className="inline-flex size-11 items-center justify-center rounded-full text-ivory/80 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={item.src}
                className="relative h-full w-full max-w-6xl"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={item.src} alt={item.alt} fill sizes="100vw" quality={85} className="object-contain" unoptimized={item.src.startsWith("data:")} />
              </m.div>
            </AnimatePresence>

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photograph"
                  className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 text-ivory transition-colors hover:border-gold hover:bg-white/5 sm:inline-flex sm:left-6"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photograph"
                  className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 text-ivory transition-colors hover:border-gold hover:bg-white/5 sm:inline-flex sm:right-6"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}
          </div>

          <div className="px-6 pb-8 pt-5 text-center">
            {item.title ? <p className="font-serif text-2xl text-ivory">{item.title}</p> : null}
            {item.caption ? <p className="mx-auto mt-1.5 max-w-xl text-sm text-ivory/65">{item.caption}</p> : null}
            {items.length > 1 ? (
              <div className="mt-4 flex justify-center gap-3 sm:hidden">
                <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="inline-flex size-11 items-center justify-center rounded-full border border-gold/30 text-ivory">
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="inline-flex size-11 items-center justify-center rounded-full border border-gold/30 text-ivory">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            ) : null}
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
