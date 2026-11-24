import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { Reveal } from "@/components/animations/reveal";
import { Timeline } from "@/components/animations/timeline";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { timeline } from "@/data/legacy";
import { cn } from "@/lib/utils";
import { PrintCollage } from "./print-collage";

export function LegacyIntro({ withTimeline = true }: { withTimeline?: boolean }) {
  return (
    <section id="legacy" aria-labelledby="legacy-title" className="paper relative overflow-hidden bg-ivory py-24 sm:py-28 lg:py-36">
      <ArchitecturalLineArt className="absolute -right-24 top-24 hidden w-[36rem] text-gold-dark/[0.12] lg:block" />

      <div className="container-nh relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <PrintCollage
          className="mx-auto aspect-[5/4] w-full max-w-xl lg:col-span-6 lg:max-w-none"
          prints={[
            { image: images.archiveExterior, className: "left-[2%] top-[14%] w-[62%]", rotate: -7, depth: 18, sepia: true },
            { image: images.exteriorVintage, className: "left-[12%] top-[40%] w-[56%]", rotate: 3, depth: 34, sepia: true },
            { image: images.archiveEntrance, className: "right-[2%] top-[4%] w-[40%]", rotate: 5, depth: 52, sepia: true },
          ]}
        />

        <div className="lg:col-span-6 lg:pl-8">
          <Reveal>
            <SectionHeading
              id="legacy-title"
              eyebrow="Our Legacy"
              title={
                <>
                  A House of Dreams.
                  <br />
                  <span className="italic text-gold-dark">A Lifelong Bond.</span>
                </>
              }
              lead="From classrooms to lifelong friendships, Newton House represents a shared journey of learning, memories and personal growth."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <blockquote className="mt-10 border-l border-gold pl-6">
              <p className="font-serif text-[1.65rem] italic leading-snug text-navy">“Newton House — where friendships last a lifetime.”</p>
            </blockquote>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            <Link href="/legacy" className={cn(buttonVariants({ variant: "outline" }))}>
              Know More <ArrowRight aria-hidden className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
            <Link href="/memories" className={cn(buttonVariants({ variant: "ghost" }))}>
              Browse the archive
            </Link>
          </Reveal>
        </div>
      </div>

      {withTimeline ? (
        <div className="container-nh relative mt-28 lg:mt-36">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Through the Years"
              title="The Story of the House"
              lead="Chapters in the life of Newton House. Dates are added only once they are verified against the college archive."
              className="mb-16"
            />
          </Reveal>
          <Timeline entries={timeline} showImages={false} />
        </div>
      ) : null}
    </section>
  );
}
