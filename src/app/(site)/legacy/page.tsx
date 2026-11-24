import { ArrowRight, Camera, MessageSquareQuote } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { Timeline } from "@/components/animations/timeline";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section-heading";
import { LegacyIntro } from "@/components/sections/legacy-intro";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { memoryPrompts, timeline, traditions } from "@/data/legacy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Legacy",
  description: "The story of Newton House, Patna Science College — its red-brick home, its traditions and the generations who lived there.",
  alternates: { canonical: "/legacy" },
  openGraph: { title: "The Legacy of Newton House", url: "/legacy" },
};

export default function LegacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Legacy"
        title={
          <>
            A House of Dreams. <span className="italic text-gold">A Lifelong Bond.</span>
          </>
        }
        lead="Red brick, green shutters and an arched gateway — and within them, generations of students who learned, lived and grew together."
        crumbs={[{ label: "Legacy" }]}
        image={images.exteriorVintage}
      />

      <LegacyIntro withTimeline={false} />

      <section aria-labelledby="timeline-title" className="relative overflow-hidden bg-navy py-24 text-ivory lg:py-32">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Reveal>
            <SectionHeading
              id="timeline-title"
              tone="dark"
              align="center"
              eyebrow="Historical Timeline"
              title="Chapters of the House"
              lead="We are reconstructing the history of Newton House from the college archive and from alumni recollections. Dates appear only once verified."
              className="mb-16"
            />
          </Reveal>
          <Timeline entries={timeline} tone="dark" />
        </div>
      </section>

      <section aria-labelledby="traditions-title" className="bg-card py-24 lg:py-32">
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="traditions-title"
              eyebrow="Hostel Traditions"
              title="Customs handed from senior to junior"
              lead="The rituals that turn a building into a home. Photographs appear where the archive holds them — share yours to complete the record."
            />
          </Reveal>
          <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {traditions.map((t) => (
              <StaggerItem as="li" key={t.title} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                  {t.image ? (
                    <Image src={t.image.src} alt={t.image.alt} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  ) : (
                    <Link
                      href="/contact?subject=Photograph%20submission"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-gold/30 p-6 text-center text-ivory/70 transition-colors hover:text-gold"
                    >
                      <Camera className="size-7 text-gold" aria-hidden />
                      <span className="text-sm">Photograph awaited — share yours</span>
                    </Link>
                  )}
                </div>
                <h3 className="mt-5 font-serif text-2xl text-navy">{t.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-strong">{t.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="archive-title" className="paper bg-ivory-2 py-24 lg:py-32">
        <div className="container-nh grid gap-14 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              id="archive-title"
              eyebrow="Historical Photographs"
              title="From the archive"
              lead="Older prints of the house and its gateway. If you hold photographs from your years in Newton House, the Association would be honoured to preserve them."
            />
            <Link href="/memories" className={cn(buttonVariants({ variant: "navy" }), "mt-8")}>
              Open the gallery <ArrowRight aria-hidden />
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 lg:col-span-7">
            {[images.archiveExterior, images.archiveEntrance, images.exteriorVintage, images.mainEntrance].map((img, i) => (
              <Reveal key={img.src} delay={i * 0.08} className={cn("print-frame print-frame--sepia", i % 2 ? "translate-y-8" : "")}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 28vw, 45vw" className={cn("object-cover", i === 3 && "sepia-[0.6]")} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="generations-title" className="bg-navy py-24 text-ivory lg:py-32">
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="generations-title"
              tone="dark"
              align="center"
              eyebrow="Memories from Every Generation"
              title="Every resident holds a piece of the story"
              lead="We are collecting first-hand recollections from alumni of every era. Choose a prompt and write to us — selected memories will be published with your permission."
            />
          </Reveal>
          <Stagger as="ul" className="mt-14 grid gap-6 md:grid-cols-3">
            {memoryPrompts.map((p) => (
              <StaggerItem as="li" key={p.decade} className="flex flex-col border border-gold/15 p-8 transition-colors hover:border-gold/40">
                <MessageSquareQuote className="size-7 text-gold" strokeWidth={1.25} aria-hidden />
                <p className="mt-6 font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold/80">{p.decade}</p>
                <p className="mt-3 font-serif text-[1.65rem] italic leading-snug">{p.prompt}</p>
                <Link
                  href={`/contact?subject=${encodeURIComponent("Memory submission")}`}
                  className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold text-gold hover:underline"
                >
                  Share your memory <ArrowRight className="size-4" aria-hidden />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
