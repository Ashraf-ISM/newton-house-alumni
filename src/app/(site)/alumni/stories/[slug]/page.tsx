import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/reveal";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { storyCategories } from "@/data/community";
import { images } from "@/data/images";
import { getStoryBySlug, listStories } from "@/lib/data/community";
import { cn, formatDate, initials } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: "Alumni Story" };
  return {
    title: `${story.title} — Voices of Newton House`,
    description: story.summary,
    alternates: { canonical: `/alumni/stories/${story.slug}` },
    robots: story.isSample ? { index: false, follow: true } : undefined,
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  const categoryLabel = storyCategories.find((c) => c.slug === story.categorySlug)?.name ?? story.categorySlug;
  const related = listStories()
    .filter((s) => s.id !== story.id)
    .slice(0, 2);

  return (
    <>
      {/* Editorial Story Header */}
      <section className="relative isolate overflow-hidden bg-navy pb-16 pt-36 text-ivory lg:pb-24 lg:pt-44">
        <div aria-hidden className="absolute inset-0 -z-10 navy-grain" />
        <div className="container-nh max-w-5xl">
          <Breadcrumbs
            items={[
              { label: "Alumni", href: "/alumni" },
              { label: "Stories", href: "/alumni/stories" },
              { label: story.title },
            ]}
          />

          <Reveal className="mt-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="eyebrow text-gold">{categoryLabel}</p>
              {story.isSample ? <Badge variant="sample-dark">Sample Story</Badge> : null}
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-[1.06] text-ivory sm:text-5xl lg:text-6xl">
              {story.title}
            </h1>

            <p className="mt-6 max-w-3xl font-serif text-xl italic leading-relaxed text-gold/90 sm:text-2xl">
              {story.summary}
            </p>

            {/* Author Meta Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-navy-deep font-serif text-base font-semibold text-gold">
                  {story.authorPhotoUrl ? (
                    <Image
                      src={story.authorPhotoUrl}
                      alt={story.authorName}
                      fill
                      sizes="3.25rem"
                      className="object-cover"
                    />
                  ) : (
                    initials(story.authorName)
                  )}
                </div>
                <div>
                  <p className="font-serif text-xl text-ivory">{story.authorName}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ivory/70">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="size-3.5 text-gold" aria-hidden />
                      {story.authorDepartment} · Class of {story.authorGraduationYear}
                      {story.authorResidenceYears ? ` (${story.authorResidenceYears})` : ""}
                    </span>
                    {story.authorDesignation || story.authorOrganisation ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="size-3.5 text-gold" aria-hidden />
                        {[story.authorDesignation, story.authorOrganisation].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-ivory/65">
                {story.publishedAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-gold" aria-hidden />
                    Published {formatDate(story.publishedAt)}
                  </span>
                ) : null}
                {story.authorSlug ? (
                  <Link
                    href={`/alumni/${story.authorSlug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/35 px-3.5 py-1.5 font-semibold text-gold hover:border-gold"
                  >
                    Author Profile <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Main Story Reading Experience */}
      <article className="paper bg-ivory py-14 lg:py-20">
        <div className="container-nh max-w-4xl">
          {story.isSample ? (
            <SampleNotice className="mb-10">
              This is a <strong>demonstration story</strong> showing the editorial layout of Voices of Newton House.
            </SampleNotice>
          ) : null}

          {/* Cover Image */}
          <figure className="overflow-hidden bg-card p-3 shadow-lift ring-1 ring-line">
            <div className="relative aspect-[16/9] overflow-hidden bg-navy">
              <Image
                src={story.coverImageUrl ?? images.heroExterior.src}
                alt={story.title}
                fill
                priority
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-cover"
                unoptimized={Boolean(story.coverImageUrl?.startsWith("data:"))}
              />
            </div>
          </figure>

          {/* Editorial Body Copy */}
          <div className="mt-10 bg-card p-7 shadow-soft ring-1 ring-line/80 sm:p-12">
            <div className="prose-nh space-y-6 text-lg leading-[1.85] text-ink/90">
              {story.content.map((paragraph, i) => (
                <p
                  key={i}
                  className={cn(
                    i === 0 &&
                      "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-5xl first-letter:leading-none first-letter:text-navy",
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Related Photographs */}
            {story.supportingImages.length > 0 ? (
              <div className="mt-12 border-t border-line pt-8">
                <h2 className="font-serif text-2xl text-navy">Accompanying Photographs</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {story.supportingImages.map((img, i) => (
                    <div key={img + i} className="print-frame">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={img}
                          alt={`${story.title} — photograph ${i + 1}`}
                          fill
                          sizes="(min-width: 640px) 24rem, 90vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Related Stories */}
          {related.length > 0 ? (
            <div className="mt-16">
              <h2 className="font-serif text-3xl text-navy">More from Voices of Newton House</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/alumni/stories/${r.slug}`}
                    className="group block bg-card p-6 shadow-soft ring-1 ring-line transition-transform hover:-translate-y-1"
                  >
                    <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                      {storyCategories.find((c) => c.slug === r.categorySlug)?.name}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-navy group-hover:text-gold-deep">{r.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-strong">{r.summary}</p>
                    <p className="mt-4 text-xs font-semibold text-navy">
                      {r.authorName} · Class of {r.authorGraduationYear}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12">
            <Link href="/alumni/stories" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft aria-hidden /> All Alumni Stories
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
