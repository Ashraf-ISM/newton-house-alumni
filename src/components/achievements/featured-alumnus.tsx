import { ArrowRight, Award, BadgeCheck, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Emblem } from "@/components/brand/emblem";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { categoryName } from "@/data/achievements";
import { images } from "@/data/images";
import { cn, initials } from "@/lib/utils";
import type { Achievement } from "@/types";

/**
 * Featured Alumnus Spotlight — Editorial split layout placed above the directory.
 * Strictly uses verified records when available; when no verified record has
 * been published yet, renders an honest, clearly-badged editorial preview
 * without inventing any identity, graduation year, achievement, or organisation.
 */
export function FeaturedAlumnus({ achievements }: { achievements: Achievement[] }) {
  const verifiedFeatured = achievements.find((a) => a.verified && !a.isSample);
  const featured = verifiedFeatured ?? achievements[0];
  if (!featured) return null;

  const isVerifiedRecord = Boolean(verifiedFeatured);
  const shortBio = featured.biography[0] ?? featured.summary;

  return (
    <section aria-labelledby="featured-alumnus-heading" className="relative">
      <Reveal>
        <div className="group relative overflow-hidden bg-card shadow-lift ring-1 ring-line/90">
          {/* Top champagne gold accent rule */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-navy via-gold to-brick/80"
          />
          <ArchitecturalLineArt className="pointer-events-none absolute -bottom-10 -right-16 w-[30rem] text-gold-dark/[0.08]" />

          <div className="grid lg:grid-cols-12">
            {/* Left: Large Portrait Frame */}
            <div className="relative min-h-[22rem] overflow-hidden bg-navy sm:min-h-[26rem] lg:col-span-5">
              {isVerifiedRecord && featured.portraitUrl ? (
                <Image
                  src={featured.portraitUrl}
                  alt={`Portrait of ${featured.name}`}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  unoptimized={featured.portraitUrl.startsWith("data:")}
                />
              ) : isVerifiedRecord ? (
                <div
                  role="img"
                  aria-label={`Monogram portrait for ${featured.name}`}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,#173957_0%,#0b1f38_75%)] p-8 text-center"
                >
                  <Emblem className="size-24 text-gold/25" title="" />
                  <span className="mt-4 font-serif text-7xl font-medium tracking-wider text-gold">
                    {initials(featured.name)}
                  </span>
                </div>
              ) : (
                <>
                  <Image
                    src={images.archiveEntrance.src}
                    alt={images.archiveEntrance.alt}
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="object-cover opacity-35 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/40" />
                  <div className="relative flex h-full flex-col items-center justify-center p-8 text-center text-ivory">
                    <span className="inline-flex size-20 items-center justify-center rounded-full border border-gold/40 bg-navy-deep/80 text-gold shadow-soft">
                      <Emblem className="size-12 text-gold" title="Newton House crest" />
                    </span>
                    <p className="mt-5 font-label text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                      Large Portrait Slot
                    </p>
                    <p className="mt-2 max-w-xs font-serif text-xl italic text-ivory/90">
                      Reserved for verified Newton House honourees
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-ivory/65">
                      No fabricated or stock portraits are ever used. Confirmed portraits appear here once verified with the alumnus.
                    </p>
                  </div>
                </>
              )}

              {/* Bottom overlay badge inside portrait column */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-navy-ink/90 via-navy-ink/60 to-transparent px-6 pb-5 pt-10 text-ivory">
                <span className="inline-flex items-center gap-2 font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  <Award className="size-3.5" aria-hidden />
                  Featured Spotlight
                </span>
                {isVerifiedRecord ? (
                  <Badge variant="gold">
                    <BadgeCheck className="size-3" aria-hidden /> Verified Honouree
                  </Badge>
                ) : (
                  <Badge variant="sample-dark">Verified Records Only</Badge>
                )}
              </div>
            </div>

            {/* Right: Editorial Split Content */}
            <div className="relative flex flex-col justify-between p-7 sm:p-10 lg:col-span-7 lg:p-12">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="eyebrow text-gold-deep">Featured Alumnus</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-dark/35 bg-ivory px-3.5 py-1.5 font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-navy">
                    {categoryName(featured.category)}
                  </span>
                </div>

                <h2
                  id="featured-alumnus-heading"
                  className="mt-5 font-serif text-3xl leading-[1.08] text-navy sm:text-4xl lg:text-[2.65rem]"
                >
                  {featured.name}
                </h2>

                {/* Designation, Organisation & Graduation Year */}
                <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line/80 py-3.5 text-sm">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Professional designation</dt>
                    <dd className="font-semibold text-ink">{featured.designation}</dd>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-strong">
                    <dt className="sr-only">Organisation</dt>
                    <Building2 className="size-4 text-gold-dark" aria-hidden />
                    <dd>{featured.organisation}</dd>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-strong">
                    <dt className="sr-only">Graduation year</dt>
                    <GraduationCap className="size-4 text-brick/85" aria-hidden />
                    <dd>
                      {featured.graduationYear
                        ? `Class of ${featured.graduationYear}${featured.department ? ` · ${featured.department}` : ""}`
                        : "Batch year published upon verification"}
                    </dd>
                  </div>
                </dl>

                {/* Citation Pull-Quote */}
                <blockquote className="mt-6 border-l-2 border-gold pl-5 font-serif text-xl italic leading-snug text-navy sm:text-2xl">
                  “{featured.summary}”
                </blockquote>

                {/* Short Biography */}
                <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-strong">{shortBio}</p>

                {!isVerifiedRecord ? (
                  <p className="mt-4 flex items-center gap-2 text-xs font-medium text-gold-deep">
                    <ShieldCheck className="size-4 shrink-0 text-gold-dark" aria-hidden />
                    <span>
                      Editorial integrity policy: This spotlight automatically promotes the first verified alumnus approved in the admin dashboard.
                    </span>
                  </p>
                ) : null}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line/70 pt-6">
                <Link
                  href={`/achievements/${featured.slug}`}
                  className={cn(buttonVariants({ variant: "navy", size: "md" }))}
                >
                  Read full story
                  <ArrowRight
                    aria-hidden
                    className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                  />
                </Link>
                <a
                  href="#submit-achievement"
                  className={cn(buttonVariants({ variant: "outline", size: "md" }))}
                >
                  Nominate an Alumnus
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
