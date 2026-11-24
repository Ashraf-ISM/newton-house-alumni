"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Lock,
  PenTool,
  Quote,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { submitAlumniStoryAction } from "@/app/actions/community";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { departments } from "@/data/alumni";
import { storyCategories } from "@/data/community";
import { images } from "@/data/images";
import { useFormAction } from "@/hooks/use-form-action";
import { cn, formatDate, initials } from "@/lib/utils";
import type { AlumniRecord, AlumniStory, StoryCategorySlug } from "@/types";

export function StoriesMagazine({
  stories,
  canSubmit,
  viewerAlumni,
}: {
  stories: AlumniStory[];
  canSubmit: boolean;
  viewerAlumni: AlumniRecord | null;
}) {
  const [cat, setCat] = useState<string>("all");

  const featured = useMemo(
    () => stories.find((s) => s.featured) ?? stories[0] ?? null,
    [stories],
  );

  const filtered = useMemo(
    () => (cat === "all" ? stories : stories.filter((s) => s.categorySlug === cat)),
    [stories, cat],
  );

  const catName = (slug: StoryCategorySlug) =>
    storyCategories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="space-y-16">
      {/* B. FEATURED STORY — Large Editorial Magazine Layout */}
      {featured ? (
        <article className="group relative overflow-hidden bg-card shadow-lift ring-1 ring-line/90">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-navy via-gold to-brick"
          />
          <div className="grid lg:grid-cols-12">
            {/* Cover Photograph */}
            <div className="relative min-h-[22rem] overflow-hidden bg-navy lg:col-span-6">
              <Image
                src={featured.coverImageUrl ?? images.heroExterior.src}
                alt={featured.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                unoptimized={Boolean(featured.coverImageUrl?.startsWith("data:"))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-ink/85 via-navy-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-ivory">
                <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold">
                  Featured Narrative · {catName(featured.categorySlug)}
                </span>
                {featured.isSample ? <Badge variant="sample-dark">Sample Story</Badge> : null}
              </div>
            </div>

            {/* Editorial Copy & Author Card */}
            <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-6 lg:p-12">
              <div>
                <p className="eyebrow text-gold-deep">Lead Essay</p>
                <h2 className="mt-4 font-serif text-3xl leading-[1.08] text-navy sm:text-4xl">
                  <Link href={`/alumni/stories/${featured.slug}`} className="hover:text-gold-deep">
                    {featured.title}
                  </Link>
                </h2>

                <p className="mt-4 text-base leading-relaxed text-muted-strong">{featured.summary}</p>

                {/* Author Information Block */}
                <div className="mt-6 flex items-center gap-4 border-y border-line/80 py-4">
                  <div className="relative flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-ivory font-serif text-base font-semibold text-navy">
                    {featured.authorPhotoUrl ? (
                      <Image
                        src={featured.authorPhotoUrl}
                        alt={featured.authorName}
                        fill
                        sizes="3.25rem"
                        className="object-cover"
                      />
                    ) : (
                      initials(featured.authorName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-serif text-lg font-semibold text-navy">{featured.authorName}</p>
                    <p className="text-gold-deep">
                      {featured.authorDepartment} · Class of {featured.authorGraduationYear}
                      {featured.authorResidenceYears ? ` (${featured.authorResidenceYears})` : ""}
                    </p>
                    {featured.authorDesignation || featured.authorOrganisation ? (
                      <p className="mt-0.5 truncate text-muted-strong">
                        {[featured.authorDesignation, featured.authorOrganisation].filter(Boolean).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href={`/alumni/stories/${featured.slug}`}
                  className={cn(buttonVariants({ variant: "navy", size: "md" }))}
                >
                  Read Full Story
                  <ArrowRight
                    aria-hidden
                    className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  />
                </Link>
                {featured.publishedAt ? (
                  <span className="text-xs text-muted">Published {formatDate(featured.publishedAt)}</span>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      {/* C. STORY CATEGORIES (7 Categories) */}
      <div>
        <div className="rounded-lg border border-line bg-card p-3 shadow-soft sm:p-4">
          <div
            role="group"
            aria-label="Filter stories by category"
            className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-1 sm:flex-wrap"
          >
            {[{ slug: "all", name: "All Stories" }, ...storyCategories].map((c) => {
              const active = cat === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCat(c.slug)}
                  className={cn(
                    "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors",
                    active ? "bg-gold text-navy" : "text-muted-strong hover:bg-ivory hover:text-navy",
                  )}
                >
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Magazine Grid */}
        {filtered.length > 0 ? (
          <m.ul layout className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((story, idx) => (
                <m.li
                  key={story.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
                >
                  <article className="group relative flex h-full flex-col justify-between bg-card shadow-soft ring-1 ring-line/85 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                        <Image
                          src={story.coverImageUrl ?? images.heroExterior.src}
                          alt={story.title}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                          unoptimized={Boolean(story.coverImageUrl?.startsWith("data:"))}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
                        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
                          <span className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">
                            {catName(story.categorySlug)}
                          </span>
                          {story.isSample ? <Badge variant="sample-dark">Sample</Badge> : null}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-serif text-2xl leading-snug text-navy group-hover:text-gold-deep">
                          <Link href={`/alumni/stories/${story.slug}`} className="after:absolute after:inset-0">
                            {story.title}
                          </Link>
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-strong">{story.summary}</p>
                      </div>
                    </div>

                    <div className="mx-6 mb-6 flex items-center justify-between border-t border-line/70 pt-4 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{story.authorName}</p>
                        <p className="truncate text-muted-strong">
                          {story.authorDepartment} · Class of {story.authorGraduationYear}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-gold-deep">
                        Read <ArrowUpRight className="size-3.5" aria-hidden />
                      </span>
                    </div>
                  </article>
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-14 text-center">
            <BookOpen className="mx-auto size-7 text-gold-dark" aria-hidden />
            <p className="mt-3 font-serif text-3xl text-navy">No published stories in this category yet</p>
            <button
              type="button"
              onClick={() => setCat("all")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
            >
              <RotateCcw className="size-3.5" aria-hidden /> View all categories
            </button>
          </div>
        )}
      </div>

      {/* E. STORY SUBMISSION SECTION */}
      <div id="submit-story" className="scroll-mt-24">
        <StorySubmissionEditor canSubmit={canSubmit} viewerAlumni={viewerAlumni} />
      </div>
    </div>
  );
}

function StorySubmissionEditor({
  canSubmit,
  viewerAlumni,
}: {
  canSubmit: boolean;
  viewerAlumni: AlumniRecord | null;
}) {
  const [state, onSubmit, pending] = useFormAction(submitAlumniStoryAction);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [saveMode, setSaveMode] = useState<"submitted" | "draft">("submitted");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (snippet: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(start);
    el.value = `${before}${before.endsWith("\n\n") || !before ? "" : "\n\n"}${snippet}\n\n${after}`;
    el.focus();
  };

  if (!canSubmit) {
    return (
      <div className="rounded-lg border border-dashed border-gold-dark/45 bg-card p-8 text-center sm:p-12">
        <Lock className="mx-auto size-7 text-gold-dark" aria-hidden />
        <h3 className="mt-3 font-serif text-3xl text-navy">Share Your Newton House Story</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-strong">
          Approved Newton House alumni can author personal memories, academic journeys and career reflections for Voices
          of Newton House.
        </p>
        <Link
          href="/login?next=/alumni/stories#submit-story"
          className={cn(buttonVariants({ variant: "navy", size: "lg" }), "mt-6")}
        >
          Sign In to Write a Story
        </Link>
      </div>
    );
  }

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-[#bcd8c4] bg-[#eef6f0] p-8 text-center text-[#1f4d33] sm:p-12">
        <CheckCircle2 className="mx-auto size-8" aria-hidden />
        <h3 className="mt-3 font-serif text-3xl">Story Saved in Editorial Queue</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 shadow-lift ring-1 ring-line sm:p-10">
      <div className="max-w-2xl">
        <p className="eyebrow text-gold-deep">Editorial Submission</p>
        <h3 className="mt-2 font-serif text-3xl text-navy">Write for Voices of Newton House</h3>
        <p className="mt-1.5 text-sm text-muted-strong">
          All submitted stories pass through editorial moderation (<em>Draft → Submitted → Under Review → Approved → Published</em>).
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate encType="multipart/form-data" className="mt-8 space-y-6">
        <input type="hidden" name="saveMode" value={saveMode} />
        <FormStatus state={state} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="st-title" label="Story title / headline" required error={fe?.title} className="sm:col-span-2">
            {(a) => <Input {...a} name="title" placeholder="e.g. Evening Lamps in the West Wing" />}
          </Field>
          <Field id="st-cat" label="Story category" required error={fe?.categorySlug}>
            {(a) => (
              <Select {...a} name="categorySlug" defaultValue="life-at-newton-house">
                {storyCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <Field
          id="st-sum"
          label="Short summary / editorial standfirst"
          required
          error={fe?.summary}
          hint="20–320 characters introducing your story on magazine cards."
        >
          {(a) => <Textarea {...a} name="summary" rows={2} maxLength={320} className="min-h-20" />}
        </Field>

        {/* Structured Editorial Story Editor */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="st-body" className="text-[0.8125rem] font-semibold text-ink">
              Full story <span className="text-brick">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => insertSnippet("“A memorable pull-quote from your years at Newton House…”")}
                className="inline-flex items-center gap-1 rounded border border-line bg-ivory px-2.5 py-1 text-xs font-medium text-navy hover:border-gold-dark"
              >
                <Quote className="size-3 text-gold-dark" aria-hidden /> Insert Pull-Quote
              </button>
              <button
                type="button"
                onClick={() => insertSnippet("SECTION HEADING — CHAPTER AT NEWTON HOUSE")}
                className="inline-flex items-center gap-1 rounded border border-line bg-ivory px-2.5 py-1 text-xs font-medium text-navy hover:border-gold-dark"
              >
                <PenTool className="size-3 text-gold-dark" aria-hidden /> Insert Section Break
              </button>
            </div>
          </div>
          <Textarea
            ref={bodyRef}
            id="st-body"
            name="content"
            rows={9}
            required
            aria-invalid={fe?.content ? true : undefined}
            placeholder="Write your story here. Separate paragraphs with a blank line…"
          />
          {fe?.content ? <p className="mt-1.5 text-xs font-medium text-brick">{fe.content[0]}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="st-author" label="Author name" required error={fe?.authorName}>
            {(a) => <Input {...a} name="authorName" defaultValue={viewerAlumni?.fullName ?? ""} />}
          </Field>
          <Field id="st-dept" label="Department" required>
            {(a) => (
              <Select {...a} name="authorDepartment" defaultValue={viewerAlumni?.department ?? "Physics"}>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="st-grad" label="Graduation year" required error={fe?.authorGraduationYear}>
            {(a) => (
              <Input
                {...a}
                name="authorGraduationYear"
                inputMode="numeric"
                defaultValue={viewerAlumni?.graduationYear ?? 2014}
              />
            )}
          </Field>
          <Field id="st-res" label="Residence years">
            {(a) => (
              <Input
                {...a}
                name="authorResidenceYears"
                placeholder="e.g. 2011 – 2014"
                defaultValue={
                  viewerAlumni
                    ? `${viewerAlumni.residenceStartYear ?? viewerAlumni.graduationYear - 3} – ${viewerAlumni.graduationYear}`
                    : ""
                }
              />
            )}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="st-desig" label="Current designation">
            {(a) => <Input {...a} name="authorDesignation" defaultValue={viewerAlumni?.designation ?? ""} />}
          </Field>
          <Field id="st-org" label="Organisation">
            {(a) => <Input {...a} name="authorOrganisation" defaultValue={viewerAlumni?.organisation ?? ""} />}
          </Field>
          <Field
            id="st-cover"
            label="Cover photograph"
            error={fe?.coverImage}
            hint="JPEG, PNG, WebP or AVIF up to 3 MB."
          >
            {(a) => (
              <Input
                {...a}
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="pt-2.5"
              />
            )}
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <SubmitButton
            pending={pending}
            variant="navy"
            size="lg"
            onClick={() => setSaveMode("submitted")}
            pendingLabel="Submitting…"
          >
            Submit Story for Editorial Review
          </SubmitButton>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => setSaveMode("draft")}
          >
            Save as Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
