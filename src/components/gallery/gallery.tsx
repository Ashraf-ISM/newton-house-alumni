"use client";

import { Camera, Expand } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryCategory, GalleryItem } from "@/types";
import { Lightbox } from "./lightbox";

/**
 * Editorial masonry gallery with category filters and a full-screen lightbox.
 * Categories without photographs show an invitation tile instead of filler images.
 */
export function Gallery({
  items,
  categories,
  limit,
  showEmptyCategories = true,
  initialCategory = "all",
}: {
  items: GalleryItem[];
  categories: GalleryCategory[];
  limit?: number;
  showEmptyCategories?: boolean;
  initialCategory?: string;
}) {
  const [active, setActive] = useState(initialCategory);
  const [open, setOpen] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((i) => (c[i.categorySlug] = (c[i.categorySlug] ?? 0) + 1));
    return c;
  }, [items]);

  const visibleCats = showEmptyCategories ? categories : categories.filter((c) => counts[c.slug]);
  const filtered = (active === "all" ? items : items.filter((i) => i.categorySlug === active)).slice(0, limit ?? Infinity);
  const activeCat = categories.find((c) => c.slug === active);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";

  const lightboxItems = filtered.map((i) => ({ src: i.imageUrl, alt: i.alt, title: i.title, caption: i.caption, width: i.width, height: i.height }));

  return (
    <div>
      <div role="group" aria-label="Filter photographs by category" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ slug: "all", name: "All Memories" }, ...visibleCats].map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(c.slug)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-all duration-300",
                isActive ? "border-gold bg-gold text-navy" : "border-gold/25 text-ivory/75 hover:border-gold/60 hover:text-ivory",
              )}
            >
              {c.name}
              {c.slug !== "all" ? <span className={cn("ml-1.5 text-[0.7rem]", isActive ? "text-navy/60" : "text-ivory/40")}>{counts[c.slug] ?? 0}</span> : null}
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <m.ul layout className="mt-10 columns-1 gap-5 min-[520px]:columns-2 lg:columns-3 [&>li]:mb-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, i) => (
              <m.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.04, 0.3) }}
                className="break-inside-avoid"
              >
                <figure className="group relative overflow-hidden bg-navy-deep">
                  <button type="button" onClick={() => setOpen(i)} className="block w-full text-left" aria-label={`Open photograph: ${item.title}`}>
                    <Image
                      src={item.imageUrl}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      sizes="(min-width: 1024px) 30vw, (min-width: 520px) 45vw, 92vw"
                      className="h-auto w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      unoptimized={item.imageUrl.startsWith("data:")}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy-ink/90 via-navy-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-navy/50 text-ivory opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                      <Expand className="size-4" aria-hidden />
                    </span>
                    <figcaption className="absolute inset-x-0 bottom-0 p-5">
                      <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">{catName(item.categorySlug)}</span>
                      <span className="mt-1 block font-serif text-xl leading-tight text-ivory">{item.title}</span>
                      <span className="mt-1 block max-h-0 overflow-hidden text-[0.8125rem] leading-snug text-ivory/70 transition-all duration-500 group-hover:max-h-16">
                        {item.caption}
                      </span>
                    </figcaption>
                  </button>
                </figure>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      ) : (
        <div className="mt-10 flex flex-col items-center justify-center border border-dashed border-gold/30 px-6 py-20 text-center">
          <Camera className="size-8 text-gold" aria-hidden />
          <p className="mt-5 font-serif text-3xl text-ivory">{activeCat?.name ?? "This collection"} is waiting for your photographs</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ivory/65">
            {activeCat?.description ? `${activeCat.description}. ` : ""}We publish only genuine Newton House photographs, shared by residents and alumni.
          </p>
          <Link
            href="/contact?subject=Photograph%20submission"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold/55 px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:bg-white/5"
          >
            Share your photographs
          </Link>
        </div>
      )}

      <Lightbox items={lightboxItems} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </div>
  );
}
