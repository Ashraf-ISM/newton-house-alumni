"use client";

import { Pause, Play, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { images } from "@/data/images";

const slides = [
  { ...images.heroExterior, title: "The House", caption: "Red brick, green shutters, and the railings every resident walked past." },
  { ...images.mainEntrance, title: "The Gateway", caption: "The arch that welcomed each new batch." },
  { ...images.illuminated, title: "Nights of Light", caption: "When the facade was dressed in lights for celebration." },
  { ...images.alumniGathering, title: "The Brotherhood", caption: "Generations standing together before the house." },
  { ...images.exteriorVintage, title: "The Legacy", caption: "A home whose story is still being written." },
];

const DURATION = 6000;

/** "Watch Memories" — a quiet, full-screen photographic reel of real Newton House images. */
export function MemoriesReel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset to the first slide each time the reel opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setI(0);
      setPlaying(!reduce);
    }
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % slides.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + slides.length) % slides.length);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !playing) return;
    const t = setTimeout(() => setI((v) => (v + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [open, playing, i]);

  const s = slides[i];

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label="Newton House memories reel"
          className="fixed inset-0 z-[80] overflow-hidden bg-navy-ink text-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div aria-hidden className="absolute inset-0 navy-grain opacity-70" />
          <AnimatePresence initial={false}>
            <m.div
              key={s.src}
              className="absolute inset-x-4 bottom-[15rem] top-20 sm:inset-x-16 sm:bottom-[13rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4 }}
            >
              <m.div
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: reduce ? 1.08 : 1 }}
                transition={{ duration: DURATION / 1000 + 1.5, ease: "linear" }}
              >
                <Image src={s.src} alt={s.alt} fill sizes="100vw" quality={85} className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" />
              </m.div>
            </m.div>
          </AnimatePresence>

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-8">
            <p className="eyebrow text-gold">Newton House · Memories</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close memories reel"
              className="inline-flex size-11 items-center justify-center rounded-full bg-navy/40 backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
            <AnimatePresence mode="wait">
              <m.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-live="polite"
              >
                <p className="font-serif text-4xl sm:text-6xl">{s.title}</p>
                <p className="mt-3 max-w-lg text-ivory/75 sm:text-lg">{s.caption}</p>
              </m.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause reel" : "Play reel"}
                className="inline-flex size-11 items-center justify-center rounded-full border border-gold/50 transition-colors hover:bg-gold hover:text-navy"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
              </button>
              <div className="flex flex-1 gap-2" role="tablist" aria-label="Slides">
                {slides.map((sl, idx) => (
                  <button
                    key={sl.src}
                    type="button"
                    role="tab"
                    aria-selected={idx === i}
                    aria-label={`Show ${sl.title}`}
                    onClick={() => setI(idx)}
                    className="relative h-1 max-w-24 flex-1 overflow-hidden rounded-full bg-ivory/20"
                  >
                    {idx < i ? <span className="absolute inset-0 bg-gold" /> : null}
                    {idx === i ? (
                      <m.span
                        key={`${i}-${playing}`}
                        className="absolute inset-y-0 left-0 bg-gold"
                        initial={{ width: playing ? "0%" : "100%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: playing ? DURATION / 1000 : 0, ease: "linear" }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              <Link href="/memories" onClick={onClose} className="text-sm font-semibold text-gold hover:underline">
                Open the full gallery →
              </Link>
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
