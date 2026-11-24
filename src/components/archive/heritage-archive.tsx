"use client";

import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileText,
  Lock,
  Share2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { submitArchiveItemAction } from "@/app/actions/community";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { archiveCategories } from "@/data/community";
import { useFormAction } from "@/hooks/use-form-action";
import { cn, formatDate } from "@/lib/utils";
import type { ArchiveCategorySlug, ArchiveItem } from "@/types";

export function HeritageArchiveClient({
  items,
  canContribute,
  defaultContributorName,
}: {
  items: ArchiveItem[];
  canContribute: boolean;
  defaultContributorName: string;
}) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [mediaFilter, setMediaFilter] = useState<"all" | "photograph" | "document">("all");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const c of archiveCategories) map[c.slug] = 0;
    for (const i of items) map[i.categorySlug] = (map[i.categorySlug] ?? 0) + 1;
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (activeCat !== "all" && i.categorySlug !== activeCat) return false;
      if (mediaFilter !== "all" && i.mediaType !== mediaFilter) return false;
      return true;
    });
  }, [items, activeCat, mediaFilter]);

  const currentItem = viewerIndex !== null ? filtered[viewerIndex] : null;
  const catLabel = (slug: ArchiveCategorySlug) =>
    archiveCategories.find((c) => c.slug === slug)?.name ?? slug;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (viewerIndex === null || filtered.length === 0) return;
      setZoom(1);
      setViewerIndex((viewerIndex + dir + filtered.length) % filtered.length);
    },
    [viewerIndex, filtered.length],
  );

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewerIndex(null);
        setZoom(1);
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerIndex, go]);

  const handleShare = async (item: ArchiveItem) => {
    const url = `${window.location.origin}/archive?item=${encodeURIComponent(item.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch {
      // User cancelled share dialog
    }
  };

  return (
    <div>
      {/* B. 10 Archive Categories + Media Type Toggle */}
      <div className="rounded-lg border border-gold/20 bg-navy-deep p-4 shadow-lift">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/15 pb-3">
          <p className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Curated Museum Collections (10 Categories)
          </p>
          <div className="flex gap-1.5" role="group" aria-label="Filter by media type">
            {(
              [
                { id: "all", label: "All Media" },
                { id: "photograph", label: "Photographs" },
                { id: "document", label: "Documents & Press" },
              ] as const
            ).map((mTab) => (
              <button
                key={mTab.id}
                type="button"
                onClick={() => setMediaFilter(mTab.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  mediaFilter === mTab.id
                    ? "bg-gold text-navy"
                    : "text-ivory/70 hover:bg-white/10 hover:text-ivory",
                )}
              >
                {mTab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter archive by category"
          className="no-scrollbar -mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap"
        >
          {[{ slug: "all", name: "All Collections" }, ...archiveCategories].map((c) => {
            const active = activeCat === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCat(c.slug)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
                  active
                    ? "border-gold bg-gold text-navy"
                    : "border-gold/25 text-ivory/75 hover:border-gold/60 hover:text-ivory",
                )}
              >
                <span>{c.name}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[0.65rem] tabular-nums",
                    active ? "bg-navy/15 text-navy" : "bg-white/10 text-ivory/65",
                  )}
                >
                  {counts[c.slug] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exhibition Grid */}
      {filtered.length > 0 ? (
        <m.ul layout className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, idx) => (
              <m.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <article className="group flex h-full flex-col justify-between overflow-hidden border border-gold/20 bg-navy-deep/90 text-ivory shadow-lift">
                  {/* Framed Archival Print */}
                  <div className="p-3 pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setViewerIndex(idx);
                      }}
                      className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f1e9d9] p-2 shadow-inner"
                      aria-label={`Inspect archival item: ${item.title}`}
                    >
                      <div className="relative h-full w-full overflow-hidden bg-navy">
                        {item.previewUrl ? (
                          <Image
                            src={item.previewUrl}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            unoptimized={item.previewUrl.startsWith("data:")}
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ivory text-navy">
                            <FileText className="size-10 text-gold-dark" aria-hidden />
                            <span className="font-label text-xs font-semibold uppercase tracking-[0.16em]">
                              PDF Archival Document
                            </span>
                          </div>
                        )}
                        <span className="absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full bg-navy/70 text-gold opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <Expand className="size-4" aria-hidden />
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Museum Placard */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">
                          {catLabel(item.categorySlug)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {item.mediaType === "document" ? (
                            <Badge variant="outline" className="border-gold/30 text-gold">
                              {item.fileFormat.toUpperCase()}
                            </Badge>
                          ) : null}
                          {item.isSample ? <Badge variant="sample-dark">Sample</Badge> : null}
                        </div>
                      </div>

                      <h3 className="mt-2 font-serif text-2xl leading-snug text-ivory">
                        <button
                          type="button"
                          onClick={() => {
                            setZoom(1);
                            setViewerIndex(idx);
                          }}
                          className="text-left hover:text-gold"
                        >
                          {item.title}
                        </button>
                      </h3>

                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ivory/70">{item.description}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-3.5 text-[0.75rem] text-ivory/60">
                      <span>{item.approximateYear}</span>
                      <span>
                        {item.showContributor ? `Contributor: ${item.contributorName}` : "Newton House Archive"}
                      </span>
                    </div>
                  </div>
                </article>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      ) : (
        <div className="mt-10 border border-dashed border-gold/30 bg-navy-deep/50 px-6 py-16 text-center text-ivory">
          <Camera className="mx-auto size-8 text-gold" aria-hidden />
          <p className="mt-4 font-serif text-3xl">This collection awaits its first verified artefact</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ivory/70">
            Do you hold photographs, allotment lists, or press clippings from this category? Submit them below for
            archival preservation.
          </p>
        </div>
      )}

      {/* D. Full-Screen Museum Photo & Document Viewer with Zoom & Share */}
      <AnimatePresence>
        {currentItem ? (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={currentItem.title}
            className="fixed inset-0 z-[85] flex flex-col bg-navy-ink/[0.97] text-ivory backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Viewer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/15 px-4 py-3.5 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="font-label text-xs tracking-[0.2em] text-gold">
                  {viewerIndex! + 1} / {filtered.length}
                </span>
                <span className="hidden text-xs text-ivory/60 sm:inline">
                  · {catLabel(currentItem.categorySlug)} · {currentItem.approximateYear}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentItem.fileFormat !== "pdf" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
                      disabled={zoom <= 1}
                      aria-label="Zoom out"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-gold/30 text-ivory hover:border-gold disabled:opacity-35"
                    >
                      <ZoomOut className="size-4" />
                    </button>
                    <span className="min-w-12 text-center font-mono text-xs text-gold">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.5).toFixed(1))))}
                      disabled={zoom >= 2.5}
                      aria-label="Zoom in"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-gold/30 text-ivory hover:border-gold disabled:opacity-35"
                    >
                      <ZoomIn className="size-4" />
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleShare(currentItem)}
                  aria-label="Share archival item"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/30 px-3 text-xs font-semibold text-ivory hover:border-gold"
                >
                  {copiedId === currentItem.id ? (
                    <>
                      <Check className="size-3.5 text-gold" /> Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5 text-gold" /> Share
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewerIndex(null);
                    setZoom(1);
                  }}
                  aria-label="Close viewer"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/20"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 py-6 sm:px-20">
              {currentItem.fileFormat === "pdf" ? (
                <iframe
                  src={currentItem.fileUrl}
                  title={currentItem.title}
                  className="h-full w-full max-w-4xl rounded bg-white"
                />
              ) : (
                <div
                  className="relative h-full w-full max-w-5xl transition-transform duration-300"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <Image
                    src={currentItem.fileUrl}
                    alt={currentItem.title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    unoptimized={currentItem.fileUrl.startsWith("data:")}
                  />
                </div>
              )}

              {filtered.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous item"
                    className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-navy/80 text-ivory hover:border-gold sm:left-6"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next item"
                    className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-navy/80 text-ivory hover:border-gold sm:right-6"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              ) : null}
            </div>

            {/* Placard Footer */}
            <div className="border-t border-gold/15 bg-navy px-6 py-5">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-2xl text-ivory">{currentItem.title}</h3>
                  <span className="font-label text-xs text-gold">
                    {currentItem.approximateYear} ·{" "}
                    {currentItem.showContributor
                      ? `Contributed by ${currentItem.contributorName}`
                      : "Newton House Archive"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-ivory/75">{currentItem.description}</p>
                <p className="mt-1 text-xs text-ivory/50">
                  Archived {formatDate(currentItem.submittedAt)} · Format: {currentItem.fileFormat.toUpperCase()}
                </p>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>

      {/* E & F. Archive Contribution System (Photographs & Documents) */}
      <div id="contribute-archive" className="mt-20 scroll-mt-24">
        <ArchiveContributionSection
          canContribute={canContribute}
          defaultContributorName={defaultContributorName}
        />
      </div>
    </div>
  );
}

function ArchiveContributionSection({
  canContribute,
  defaultContributorName,
}: {
  canContribute: boolean;
  defaultContributorName: string;
}) {
  const [state, onSubmit, pending] = useFormAction(submitArchiveItemAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (!canContribute) {
    return (
      <div className="rounded-lg border border-dashed border-gold/40 bg-navy-deep p-8 text-center text-ivory sm:p-12">
        <Lock className="mx-auto size-7 text-gold" aria-hidden />
        <h3 className="mt-4 font-serif text-3xl text-ivory">Contribute to the Digital Heritage Archive</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ivory/75">
          Registered Newton House alumni can submit historical photographs, batch portraits, allotment documents (PDF),
          and press clippings for archival preservation.
        </p>
        <Link
          href="/login?next=/archive#contribute-archive"
          className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mt-6")}
        >
          Sign In to Contribute
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-gold/40 bg-navy-deep p-8 text-center text-ivory sm:p-12">
        <CheckCircle2 className="mx-auto size-8 text-gold" aria-hidden />
        <h3 className="mt-4 font-serif text-3xl text-ivory">Archival Contribution Queued for Review</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ivory/80">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 text-ink shadow-lift ring-1 ring-line sm:p-10">
      <div className="max-w-2xl">
        <p className="eyebrow text-gold-deep">Archival Preservation</p>
        <h3 className="mt-2 font-serif text-3xl text-navy">Submit a Historical Photograph or Document</h3>
        <p className="mt-2 text-sm text-muted-strong">
          Supported formats: <strong>PDF, JPEG, PNG, WebP</strong> (up to 5 MB). Every contribution enters the{" "}
          <strong>Pending Review</strong> queue and is published after verification by the Association’s archivists.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate encType="multipart/form-data" className="mt-8 space-y-6">
        <FormStatus state={state} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="ar-title" label="Item title" required error={fe?.title}>
            {(a) => <Input {...a} name="title" placeholder="e.g. Farewell Portrait Before the Arched Gate" />}
          </Field>
          <Field id="ar-cat" label="Archive category" required error={fe?.categorySlug}>
            {(a) => (
              <Select {...a} name="categorySlug" defaultValue="historical-building">
                {archiveCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="ar-year" label="Approximate year / era" required error={fe?.approximateYear}>
            {(a) => <Input {...a} name="approximateYear" placeholder="e.g. c. 1995 or 2012" />}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="ar-file"
            label="Photograph or Document file (PDF, JPEG, PNG, WebP)"
            required
            error={fe?.file}
            hint="Maximum file size: 5 MB."
          >
            {(a) => (
              <Input
                {...a}
                name="file"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp,image/avif"
                className="pt-2.5"
              />
            )}
          </Field>
          <Field id="ar-contrib" label="Contributor name" required error={fe?.contributorName}>
            {(a) => <Input {...a} name="contributorName" defaultValue={defaultContributorName} />}
          </Field>
        </div>

        <Field id="ar-desc" label="Historical description & context" required error={fe?.description}>
          {(a) => (
            <Textarea
              {...a}
              name="description"
              rows={4}
              placeholder="Describe the occasion, people, superintendents or building details visible in this item…"
            />
          )}
        </Field>

        <div className="space-y-3 border-t border-line pt-4">
          <Checkbox
            id="ar-show-contrib"
            name="showContributor"
            defaultChecked
            label="Credit my name publicly on the museum placard"
            description="Uncheck if you prefer your contribution to be credited anonymously to 'Newton House Archive'."
          />
          <Checkbox
            id="ar-perm"
            name="permissionConfirmed"
            error={fe?.permissionConfirmed}
            label={
              <>
                I confirm that I own or have permission to share this historical photograph/document with the Newton
                House Alumni Association Digital Heritage Archive. <span className="text-brick">*</span>
              </>
            }
          />
        </div>

        <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Uploading to archive queue…">
          <Upload aria-hidden /> Submit to Digital Heritage Archive
        </SubmitButton>
      </form>
    </div>
  );
}
