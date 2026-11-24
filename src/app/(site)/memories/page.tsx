import { ArrowRight, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Gallery } from "@/components/gallery/gallery";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { listGallery, listGalleryCategories } from "@/lib/data/content";
import { cn, paramValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Memories & Gallery",
  description: "Relive the laughter, celebrations, friendships and unforgettable times at Newton House, Patna Science College.",
  alternates: { canonical: "/memories" },
  openGraph: { title: "Newton House — Moments That Last Forever", url: "/memories" },
};

export default async function MemoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [items, categories, sp] = await Promise.all([listGallery(), listGalleryCategories(), searchParams]);
  const requested = paramValue(sp.category);
  const initial = requested && categories.some((c) => c.slug === requested) ? requested : "all";

  return (
    <>
      <PageHeader
        eyebrow="Memories & Gallery"
        title={
          <>
            Moments That <span className="italic text-gold">Last Forever</span>
          </>
        }
        lead="Relive the laughter, celebrations, friendships and unforgettable times at Newton House."
        crumbs={[{ label: "Memories" }]}
        image={images.illuminated}
      />
      <section className="relative bg-navy pb-24 pt-4 text-ivory lg:pb-32">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Gallery key={initial} items={items} categories={categories} initialCategory={initial} />
        </div>
      </section>
      <section className="paper bg-ivory py-20 lg:py-28">
        <div className="container-nh grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <SectionHeading
              eyebrow="Contribute"
              title="Help us complete the album"
              lead="Freshers’ welcomes, farewells, cultural evenings, quiet afternoons in the corridors — if you have photographs from your years at Newton House, share them with the Association. We credit every contributor and publish only genuine images."
            />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href={`/contact?subject=${encodeURIComponent("Photograph submission")}`} className={cn(buttonVariants({ variant: "navy", size: "lg" }))}>
              <Upload aria-hidden /> Share photographs
            </Link>
            <Link href="/legacy" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Our legacy <ArrowRight aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
