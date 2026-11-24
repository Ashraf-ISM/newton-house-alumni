import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { AchievementSubmissionSection } from "@/components/achievements/achievement-submission-section";
import { FeaturedAlumnus } from "@/components/achievements/featured-alumnus";
import { Reveal } from "@/components/animations/reveal";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SectionHeading } from "@/components/layout/section-heading";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { listAchievements } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Distinguished Alumni & Achievements",
  description:
    "Celebrating Newton House alumni in research, public service, science and technology, corporate leadership and entrepreneurship.",
  alternates: { canonical: "/achievements" },
  openGraph: { title: "Newton House — Distinguished Alumni & Achievements", url: "/achievements" },
};

export default async function AchievementsPage() {
  const achievements = await listAchievements();

  return (
    <>
      {/* 1. HERO SECTION */}
      <section
        aria-labelledby="achievements-hero-title"
        className="relative isolate overflow-hidden bg-navy pb-20 pt-36 text-ivory sm:pb-24 lg:pb-28 lg:pt-44"
      >
        {/* Background hostel photography on the right */}
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[56%]">
          <Image
            src={images.facadeCorner.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 56vw, 100vw"
            quality={80}
            className="object-cover opacity-35 lg:opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/45" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-20 navy-grain" />

        {/* Subtle architectural watermark */}
        <ArchitecturalLineArt className="pointer-events-none absolute -bottom-8 right-6 -z-10 w-[32rem] text-gold/[0.08] sm:w-[38rem] lg:right-12" />

        <div className="container-nh relative">
          <Breadcrumbs items={[{ label: "Alumni", href: "/alumni" }, { label: "Achievements" }]} />

          <Reveal className="mt-9 max-w-3xl" y={24}>
            <p className="eyebrow text-gold">DISTINGUISHED ALUMNI</p>

            <h1
              id="achievements-hero-title"
              className="mt-5 font-serif text-[2.85rem] leading-[1.02] tracking-[-0.015em] text-ivory sm:text-6xl lg:text-[4.5rem]"
            >
              Carrying the House <span className="italic text-gold">Into the World</span>
            </h1>

            <p className="mt-6 max-w-2xl text-[1.0625rem] leading-[1.78] text-ivory/80 sm:text-lg">
              Newton House alumni serve in laboratories, classrooms, public offices and boardrooms. Every achievement
              published in this directory is verified with the member before it appears.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <a href="#directory" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
                Explore Honourees
                <ArrowDown aria-hidden className="size-4" />
              </a>
              <a
                href="#submit-achievement"
                className={cn(buttonVariants({ variant: "outline-light", size: "lg" }))}
              >
                Submit Your Achievement
                <ArrowRight
                  aria-hidden
                  className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                />
              </a>
            </div>

            <p className="mt-7 inline-flex items-center gap-2 border-t border-gold/15 pt-4 font-label text-[0.6875rem] tracking-[0.14em] text-ivory/65 uppercase">
              <ShieldCheck className="size-3.5 text-gold" aria-hidden />
              Verified records only · No unverified claims or affiliations
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. FEATURED ALUMNUS SPOTLIGHT */}
      <section className="paper bg-ivory pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="container-nh">
          <FeaturedAlumnus achievements={achievements} />
        </div>
      </section>

      {/* 3 & 4. ACHIEVEMENT FILTERS & PROFILE CARDS DIRECTORY */}
      <section id="directory" aria-labelledby="directory-heading" className="paper scroll-mt-24 bg-ivory py-14 lg:py-20">
        <div className="container-nh">
          <Reveal className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              id="directory-heading"
              eyebrow="Roll of Honour"
              title="Achievements Across Disciplines"
              lead="Browse distinguished Newton House alumni by field of contribution."
            />
          </Reveal>

          <AchievementsShowcase achievements={achievements} heading={false} />
        </div>
      </section>

      {/* 5. ACHIEVEMENT SUBMISSION SECTION */}
      <AchievementSubmissionSection />
    </>
  );
}
