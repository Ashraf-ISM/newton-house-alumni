"use client";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Landmark,
  Lock,
  MessageSquareQuote,
  Quote,
  UserCheck,
  X,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { submitAlumniTestimonialAction } from "@/app/actions/about";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { heritageTimelineCategories } from "@/data/about";
import { departments } from "@/data/alumni";
import { cn, initials } from "@/lib/utils";
import type {
  AlumniProfile,
  AlumniTestimonial,
  HeritageMilestone,
  HeritageTimelineCategory,
  SuperintendentRecord,
} from "@/types";

/* ==================================================================
   SECTION 3: INTERACTIVE HERITAGE TIMELINE
   ================================================================== */
export function AboutHeritageTimeline({
  milestones,
}: {
  milestones: HeritageMilestone[];
}) {
  const [activeCategory, setActiveCategory] = useState<HeritageTimelineCategory | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return milestones;
    return milestones.filter((m) => m.category === activeCategory);
  }, [milestones, activeCategory]);

  return (
    <div>
      {/* Category filter bar */}
      <div
        role="tablist"
        aria-label="Filter timeline chapters"
        className="mb-12 flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all",
            activeCategory === "all"
              ? "border-gold bg-gold text-navy shadow-soft"
              : "border-gold/25 bg-white/[0.04] text-ivory/80 hover:border-gold/50 hover:text-ivory",
          )}
        >
          All Chapters ({milestones.length})
        </button>
        {heritageTimelineCategories.map((cat, idx) => {
          const count = milestones.filter((m) => m.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all",
                activeCategory === cat
                  ? "border-gold bg-gold text-navy shadow-soft"
                  : "border-gold/25 bg-white/[0.04] text-ivory/80 hover:border-gold/50 hover:text-ivory",
              )}
            >
              <span className="mr-1.5 font-serif italic opacity-75">0{idx + 1}.</span>
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vertical interactive timeline */}
      {filtered.length === 0 ? (
        <div className="mx-auto max-w-2xl border border-dashed border-gold/30 bg-white/[0.03] p-10 text-center">
          <Clock className="mx-auto size-8 text-gold" aria-hidden />
          <h3 className="mt-4 font-serif text-2xl text-ivory">No Milestones Published in This Chapter Yet</h3>
          <p className="mt-2 text-sm text-ivory/70">
            Historical records for this era are currently being verified from the Patna Science College archive.
          </p>
        </div>
      ) : (
        <ol className="relative mx-auto max-w-5xl space-y-12 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px before:bg-gradient-to-b before:from-gold/20 before:via-gold before:to-gold/20 md:before:left-1/2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => {
              const isRight = idx % 2 === 1;
              return (
                <m.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative grid pl-12 md:grid-cols-2 md:gap-14 md:pl-0"
                >
                  {/* Timeline node */}
                  <span
                    aria-hidden
                    className="absolute left-4 top-6 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-gold bg-navy text-xs font-serif font-semibold text-gold shadow-[0_0_0_6px_rgba(214,173,104,0.12)] md:left-1/2"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={cn(
                      "border border-gold/20 bg-navy-deep/90 p-6 shadow-lift backdrop-blur-sm sm:p-8",
                      isRight ? "md:col-start-2" : "md:col-start-1",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                        {item.category}
                      </span>
                      {item.periodLabel && item.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 font-serif text-sm italic text-gold">
                          <CheckCircle2 className="size-3.5" aria-hidden /> {item.periodLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-gold/35 px-2.5 py-0.5 font-label text-[0.6rem] uppercase tracking-[0.14em] text-gold/80">
                          <Clock className="size-3" aria-hidden />
                          {item.periodLabel ? `${item.periodLabel} (Unverified)` : "Date: Archive Verification Pending"}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-serif text-2xl leading-snug text-ivory sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/78">{item.description}</p>

                    {item.importantDevelopment ? (
                      <div className="mt-5 border-l-2 border-gold bg-white/[0.04] px-4 py-3">
                        <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold">
                          Key Institutional Development
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ivory/85">
                          {item.importantDevelopment}
                        </p>
                      </div>
                    ) : null}

                    {item.imageUrl ? (
                      <div className="mt-6 print-frame">
                        <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                          <Image
                            src={item.imageUrl}
                            alt={item.imageAlt ?? item.title}
                            fill
                            sizes="(min-width: 768px) 26rem, 90vw"
                            className="object-cover"
                            unoptimized={item.imageUrl.startsWith("data:")}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </m.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </div>
  );
}

/* ==================================================================
   SECTION 4: SUPERINTENDENTS OF NEWTON HOUSE
   ================================================================== */
export function SuperintendentsShowcase({
  superintendents,
}: {
  superintendents: SuperintendentRecord[];
}) {
  const [roleFilter, setRoleFilter] = useState<"all" | "current" | "former">("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  const periodOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of superintendents) {
      if (s.tenurePeriodLabel) set.add(s.tenurePeriodLabel);
    }
    return [...set];
  }, [superintendents]);

  const currentSupt = useMemo(
    () => superintendents.find((s) => s.isCurrent) ?? null,
    [superintendents],
  );

  const formerSupts = useMemo(() => {
    return superintendents
      .filter((s) => !s.isCurrent)
      .filter((s) => periodFilter === "all" || s.tenurePeriodLabel === periodFilter);
  }, [superintendents, periodFilter]);

  const showCurrent =
    roleFilter !== "former" &&
    currentSupt &&
    (periodFilter === "all" || currentSupt.tenurePeriodLabel === periodFilter);

  const showFormer = roleFilter !== "current";

  return (
    <div className="space-y-14">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter superintendents by tenure type" className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Superintendents" },
            { key: "current", label: "Current Superintendent" },
            { key: "former", label: "Former Superintendents" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={roleFilter === tab.key}
              onClick={() => setRoleFilter(tab.key as "all" | "current" | "former")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
                roleFilter === tab.key
                  ? "bg-navy text-ivory shadow-soft"
                  : "bg-card text-muted-strong ring-1 ring-line hover:text-navy",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="supt-period-filter"
            className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-strong"
          >
            Period of Service
          </label>
          <select
            id="supt-period-filter"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="h-10 rounded-full border border-line bg-card px-4 text-xs font-medium text-ink focus:border-gold-dark focus:outline-none"
          >
            <option value="all">All Service Periods</option>
            {periodOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* A. Current Superintendent Featured Editorial Split Profile */}
      {showCurrent && currentSupt ? (
        <div className="overflow-hidden bg-navy text-ivory shadow-lift ring-1 ring-gold/30">
          <div className="grid lg:grid-cols-12">
            {/* Editorial Portrait Column */}
            <div className="relative flex min-h-[22rem] flex-col items-center justify-center bg-gradient-to-br from-navy-deep via-navy to-navy-soft p-8 lg:col-span-5 lg:p-12">
              {currentSupt.profileImage ? (
                <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden border border-gold/40 shadow-lift">
                  <Image
                    src={currentSupt.profileImage}
                    alt={currentSupt.fullName}
                    fill
                    sizes="(min-width: 1024px) 22rem, 80vw"
                    className="object-cover"
                    unoptimized={currentSupt.profileImage.startsWith("data:")}
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center border border-dashed border-gold/40 bg-white/[0.03] p-8 text-center">
                  <div className="flex size-24 items-center justify-center rounded-full border border-gold/50 bg-gold/10 font-serif text-4xl font-semibold text-gold">
                    {currentSupt.isPlaceholder ? "NH" : initials(currentSupt.fullName)}
                  </div>
                  <p className="mt-5 font-label text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                    Official Portrait Slot
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ivory/65">
                    {currentSupt.isPlaceholder
                      ? "Awaiting verified portrait upload from Newton House administration."
                      : "Portrait photograph awaiting upload."}
                  </p>
                </div>
              )}
            </div>

            {/* Editorial Biography & Tenure Column */}
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7 lg:p-14">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1 font-label text-[0.625rem] font-bold uppercase tracking-[0.16em] text-navy">
                  <UserCheck className="size-3.5" aria-hidden /> Current Superintendent
                </span>
                {currentSupt.isPlaceholder ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold/45 bg-gold/10 px-3 py-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold">
                    Official Record Pending Verification
                  </span>
                ) : null}
              </div>

              <h3 className="mt-5 font-serif text-3xl leading-tight text-ivory sm:text-4xl">
                {currentSupt.fullName}
              </h3>
              <p className="mt-2 font-medium text-gold">{currentSupt.designation}</p>

              <p className="mt-2 inline-flex items-center gap-2 text-xs text-ivory/70">
                <Calendar className="size-3.5 text-gold" aria-hidden />
                <span>{currentSupt.tenurePeriodLabel}</span>
              </p>

              <p className="mt-6 text-[0.975rem] leading-relaxed text-ivory/82">{currentSupt.biography}</p>

              <div className="mt-7 grid gap-5 border-t border-gold/15 pt-6 sm:grid-cols-2">
                {currentSupt.academicBackground ? (
                  <div>
                    <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">
                      Academic &amp; Faculty Background
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ivory/75">
                      {currentSupt.academicBackground}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">
                    Stewardship &amp; Contributions
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory/75">{currentSupt.contributions}</p>
                </div>
              </div>

              {currentSupt.personalMessage ? (
                <blockquote className="mt-6 border-l-2 border-gold/60 pl-4 font-serif text-base italic text-ivory/80">
                  “{currentSupt.personalMessage}”
                </blockquote>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* B. Former Superintendents Chronological Collection */}
      {showFormer ? (
        <div>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Chronological Roll of Honour</p>
              <h3 className="mt-2 font-serif text-3xl text-navy">Former Superintendents of Newton House</h3>
            </div>
            <p className="text-xs text-muted-strong">
              Ordered by tenure · Historical records are permanently preserved when leadership changes
            </p>
          </div>

          {formerSupts.length === 0 ? (
            <div className="bg-card p-10 text-center shadow-soft ring-1 ring-line">
              <p className="font-serif text-2xl text-navy">No Former Superintendent Records Match This Filter</p>
              <p className="mt-2 text-sm text-muted-strong">
                Select &ldquo;All Service Periods&rdquo; or contribute archival details via the Association.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {formerSupts.map((supt) => (
                <article
                  key={supt.id}
                  className="flex flex-col bg-card p-7 shadow-soft ring-1 ring-line/80 transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-start gap-4">
                    {supt.profileImage ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-gold-dark/30 bg-navy">
                        <Image
                          src={supt.profileImage}
                          alt={supt.fullName}
                          fill
                          sizes="4rem"
                          className="object-cover"
                          unoptimized={supt.profileImage.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-gold-dark/35 bg-navy font-serif text-xl font-semibold text-gold">
                        {supt.isPlaceholder ? "NH" : initials(supt.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                          {supt.designation}
                        </span>
                        {supt.isPlaceholder ? <Badge variant="sample">Placeholder</Badge> : null}
                      </div>
                      <h4 className="mt-1 font-serif text-xl leading-snug text-navy">{supt.fullName}</h4>
                      <p className="mt-1 text-xs font-medium text-muted-strong">{supt.tenurePeriodLabel}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-muted-strong">{supt.biography}</p>

                  {supt.academicBackground ? (
                    <div className="mt-4 border-t border-line pt-3 text-xs text-muted-strong">
                      <span className="font-semibold text-ink">Academic Background: </span>
                      {supt.academicBackground}
                    </div>
                  ) : null}

                  <div className="mt-3 border-t border-line pt-3 text-xs text-muted-strong">
                    <span className="font-semibold text-ink">Notable Contributions: </span>
                    {supt.contributions}
                  </div>

                  {supt.personalMessage ? (
                    <blockquote className="mt-4 border-l-2 border-gold-dark pl-3 font-serif text-sm italic text-navy">
                      “{supt.personalMessage}”
                    </blockquote>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* C. Historical Recognition Statement */}
      <div className="border border-gold-dark/30 bg-ivory-2 px-6 py-8 text-center sm:px-12">
        <Landmark className="mx-auto size-7 text-gold-dark" strokeWidth={1.3} aria-hidden />
        <blockquote className="mx-auto mt-4 max-w-3xl font-serif text-2xl italic leading-relaxed text-navy sm:text-[1.75rem]">
          “Every generation of Newton House has been shaped not only by its residents, but also by the people entrusted
          with guiding and nurturing its community.”
        </blockquote>
        <p className="mt-3 text-xs text-muted-strong">
          Know a former Superintendent’s exact tenure dates or hold an archival photograph?{" "}
          <Link
            href="/contact?subject=Superintendent%20Archival%20Record"
            className="font-semibold text-gold-deep underline-offset-4 hover:underline"
          >
            Share verified records with the Association →
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ==================================================================
   SECTION 6: THE NEWTON HOUSE EXPERIENCE (MASONRY GALLERY + LIGHTBOX)
   ================================================================== */
export interface ExperiencePhotoItem {
  id: string;
  title: string;
  caption: string;
  category:
    | "Hostel Life"
    | "Friendships"
    | "Campus Moments"
    | "Festivals & Celebrations"
    | "Reunions"
    | "Memories Across Generations";
  imageUrl: string;
  year: string | null;
  sourceLabel: "Memories Gallery" | "Digital Heritage Archive";
  aspect: "landscape" | "portrait" | "classic";
}

const experienceCategories: (ExperiencePhotoItem["category"] | "All Moments")[] = [
  "All Moments",
  "Hostel Life",
  "Friendships",
  "Campus Moments",
  "Festivals & Celebrations",
  "Reunions",
  "Memories Across Generations",
];

export function NewtonHouseExperienceGallery({
  items,
}: {
  items: ExperiencePhotoItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<ExperiencePhotoItem["category"] | "All Moments">(
    "All Moments",
  );
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "All Moments") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const activeItem = lightboxIdx !== null ? filtered[lightboxIdx] ?? null : null;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const goPrev = useCallback(() => {
    setLightboxIdx((curr) => (curr === null ? null : (curr - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);
  const goNext = useCallback(() => {
    setLightboxIdx((curr) => (curr === null ? null : (curr + 1) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, closeLightbox, goPrev, goNext]);

  return (
    <div>
      {/* Category Pills */}
      <div
        role="tablist"
        aria-label="Filter Newton House experience photographs"
        className="mb-10 flex flex-wrap gap-2"
      >
        {experienceCategories.map((cat) => {
          const count = cat === "All Moments" ? items.length : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIdx(null);
              }}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em] transition-all",
                activeCategory === cat
                  ? "bg-navy text-ivory shadow-soft"
                  : "bg-card text-muted-strong ring-1 ring-line hover:text-navy",
              )}
            >
              {cat} <span className="opacity-65">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Asymmetrical Masonry Layout */}
      <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
        {filtered.map((item, idx) => (
          <figure
            key={item.id}
            className="group relative break-inside-avoid overflow-hidden bg-navy shadow-soft ring-1 ring-line"
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(idx)}
              className="block w-full text-left focus:outline-none"
              aria-label={`Open "${item.title}" in lightbox viewer`}
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden",
                  item.aspect === "portrait"
                    ? "aspect-[4/5]"
                    : item.aspect === "landscape"
                      ? "aspect-[16/10]"
                      : "aspect-[4/3]",
                )}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 95vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy-ink/90 via-navy-ink/25 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">
                      {item.category}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-ivory/80">
                      {item.sourceLabel}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-serif text-xl leading-snug text-ivory">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ivory/75">{item.caption}</p>
                </div>
              </div>
            </button>
          </figure>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem ? (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-ink/95 p-4 backdrop-blur-md sm:p-8"
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full border border-gold/30 bg-navy text-ivory hover:border-gold hover:text-gold"
              aria-label="Close lightbox"
            >
              <X className="size-5" />
            </button>

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex size-11 items-center justify-center rounded-full border border-gold/30 bg-navy/90 text-ivory hover:border-gold hover:text-gold"
              aria-label="Previous photograph"
            >
              <ArrowLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex size-11 items-center justify-center rounded-full border border-gold/30 bg-navy/90 text-ivory hover:border-gold hover:text-gold"
              aria-label="Next photograph"
            >
              <ArrowRight className="size-5" />
            </button>

            <div className="mx-auto grid max-h-[90vh] w-full max-w-5xl overflow-hidden border border-gold/25 bg-navy shadow-lift lg:grid-cols-12">
              <div className="relative min-h-[20rem] bg-navy-ink lg:col-span-8 lg:min-h-[32rem]">
                <Image
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 95vw"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-between p-6 text-ivory sm:p-8 lg:col-span-4">
                <div>
                  <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                    {activeItem.category}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl text-ivory">{activeItem.title}</h3>
                  {activeItem.year ? (
                    <p className="mt-1 text-xs text-gold/80">{activeItem.year}</p>
                  ) : null}
                  <p className="mt-4 text-sm leading-relaxed text-ivory/80">{activeItem.caption}</p>
                </div>

                <div className="mt-6 space-y-3 border-t border-gold/15 pt-4 text-xs">
                  <p className="text-ivory/65">Source: {activeItem.sourceLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/memories"
                      className="inline-flex items-center gap-1 font-semibold text-gold hover:underline"
                    >
                      Open Memories Gallery →
                    </Link>
                    <Link
                      href="/archive"
                      className="inline-flex items-center gap-1 font-semibold text-gold hover:underline"
                    >
                      Digital Heritage Archive →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ==================================================================
   SECTION 9: VOICES OF NEWTON HOUSE (TESTIMONIALS + SUBMISSION)
   ================================================================== */
export function VoicesTestimonialsSection({
  testimonials,
  canSubmit,
  viewerAlumni,
}: {
  testimonials: AlumniTestimonial[];
  canSubmit: boolean;
  viewerAlumni: AlumniProfile | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState(submitAlumniTestimonialAction, null);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <div>
      {testimonials.length === 0 ? (
        <div className="bg-card p-10 text-center shadow-soft ring-1 ring-line">
          <MessageSquareQuote className="mx-auto size-8 text-gold-dark" aria-hidden />
          <h3 className="mt-3 font-serif text-2xl text-navy">Alumni Reflections Awaiting Publication</h3>
          <p className="mt-2 text-sm text-muted-strong">
            Share a short memory or reflection from your years at Newton House for review by the Association.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="flex flex-col justify-between bg-card p-8 shadow-soft ring-1 ring-line/80 transition-shadow hover:shadow-lift"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Quote className="size-7 text-gold-dark" strokeWidth={1.35} aria-hidden />
                  {t.isSample ? <Badge variant="sample">Sample</Badge> : null}
                </div>
                <p className="mt-5 font-serif text-[1.25rem] italic leading-relaxed text-navy">
                  “{t.quote}”
                </p>
              </div>

              <footer className="mt-6 flex items-center gap-3.5 border-t border-line pt-4">
                {t.photoUrl ? (
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-navy">
                    <Image
                      src={t.photoUrl}
                      alt={t.alumniName}
                      fill
                      sizes="2.75rem"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm font-semibold text-gold">
                    {initials(t.alumniName)}
                  </div>
                )}
                <div className="min-w-0">
                  <cite className="block truncate not-italic font-semibold text-ink">{t.alumniName}</cite>
                  <p className="truncate text-xs text-muted-strong">
                    {t.batchYear}
                    {t.department ? ` · ${t.department}` : ""}
                  </p>
                  {t.designation ? (
                    <p className="truncate text-xs text-gold-deep">{t.designation}</p>
                  ) : null}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      )}

      {/* Action bar & submission drawer */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <div>
          <p className="text-sm font-medium text-ink">
            Every published testimonial is verified by the Association before appearing on this page.
          </p>
          <p className="text-xs text-muted-strong">
            Want to read or contribute full-length narratives? Explore our editorial magazine.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Close Testimonial Form" : "Share a Short Testimonial"}
          </Button>
          <Link href="/alumni/stories" className={cn(buttonVariants({ variant: "navy" }))}>
            Read Full Alumni Stories <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>

      {showForm ? (
        <div className="mt-8 bg-card p-6 shadow-soft ring-1 ring-line sm:p-8">
          <h3 className="font-serif text-2xl text-navy">Contribute a Newton House Reflection</h3>
          <p className="mt-1 text-sm text-muted-strong">
            Approved alumni reflections are featured in Voices of Newton House after administrator review.
          </p>

          {!canSubmit ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-ivory p-5">
              <div className="flex items-center gap-3 text-sm text-ink">
                <Lock className="size-4 text-gold-dark" aria-hidden />
                <span>Please sign in with a verified Newton House alumni account to submit a testimonial.</span>
              </div>
              <Link href="/login?next=/about" className={cn(buttonVariants({ variant: "navy", size: "sm" }))}>
                Sign In to Contribute
              </Link>
            </div>
          ) : (
            <form action={action} className="mt-6 space-y-5">
              <FormStatus state={state} />
              <div className="grid gap-5 sm:grid-cols-3">
                <Field id="test-name" label="Your Name" required error={fieldErrors?.alumniName}>
                  {(a11y) => (
                    <Input
                      {...a11y}
                      name="alumniName"
                      defaultValue={viewerAlumni?.fullName ?? ""}
                      placeholder="Full name"
                    />
                  )}
                </Field>
                <Field id="test-batch" label="Batch / Year" required error={fieldErrors?.batchYear}>
                  {(a11y) => (
                    <Input
                      {...a11y}
                      name="batchYear"
                      defaultValue={viewerAlumni ? `Class of ${viewerAlumni.graduationYear}` : ""}
                      placeholder="e.g. Class of 2014"
                    />
                  )}
                </Field>
                <Field id="test-dept" label="Department">
                  {(a11y) => (
                    <Select {...a11y} name="department" defaultValue={viewerAlumni?.department ?? "Physics"}>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
              <Field id="test-desig" label="Professional Designation">
                {(a11y) => (
                  <Input
                    {...a11y}
                    name="designation"
                    defaultValue={
                      viewerAlumni?.designation
                        ? `${viewerAlumni.designation}${viewerAlumni.organisation ? `, ${viewerAlumni.organisation}` : ""}`
                        : ""
                    }
                    placeholder="e.g. Senior Scientist, ISRO"
                  />
                )}
              </Field>
              <Field
                id="test-quote"
                label="Your Reflection (25–420 characters)"
                required
                error={fieldErrors?.quote}
              >
                {(a11y) => (
                  <Textarea
                    {...a11y}
                    name="quote"
                    rows={3}
                    placeholder="What does Newton House mean to you?"
                  />
                )}
              </Field>
              <SubmitButton pending={pending} pendingLabel="Submitting for verification…">
                Submit Reflection for Approval
              </SubmitButton>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
