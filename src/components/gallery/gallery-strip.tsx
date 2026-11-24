"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "./lightbox";

/** Simple thumbnail grid that opens the shared lightbox. Used on event pages. */
export function GalleryStrip({ srcs, title }: { srcs: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = srcs.map((src, i) => ({ src, alt: `${title} — photograph ${i + 1}`, title, caption: `Photograph ${i + 1} of ${srcs.length}`, width: 1200, height: 800 }));
  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.src + i}>
            <button type="button" onClick={() => setOpen(i)} className="group relative block aspect-[4/3] w-full overflow-hidden bg-navy" aria-label={`Open ${it.alt}`}>
              <Image src={it.src} alt={it.alt} fill sizes="(min-width: 640px) 20vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
