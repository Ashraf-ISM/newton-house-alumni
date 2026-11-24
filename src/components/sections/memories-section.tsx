import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Gallery } from "@/components/gallery/gallery";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";
import type { GalleryCategory, GalleryItem } from "@/types";
import { PrintCollage } from "./print-collage";

export function MemoriesSection({ items, categories }: { items: GalleryItem[]; categories: GalleryCategory[] }) {
  return (
    <section id="memories" aria-labelledby="memories-title" className="relative overflow-hidden bg-navy py-24 text-ivory sm:py-28 lg:py-36">
      <div aria-hidden className="absolute inset-0 navy-grain" />
      <div className="container-nh relative">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <PrintCollage
            className="order-2 mx-auto aspect-[6/5] w-full max-w-lg lg:order-1 lg:col-span-6 lg:max-w-none"
            prints={[
              { image: images.mainEntrance, className: "left-[2%] top-[6%] w-[46%]", rotate: -6, depth: 20 },
              { image: images.illuminated, className: "right-[2%] top-0 w-[52%]", rotate: 4, depth: 40 },
              { image: images.alumniGathering, className: "left-[18%] bottom-[4%] w-[62%]", rotate: -2, depth: 28 },
            ]}
          />
          <Reveal className="order-1 lg:order-2 lg:col-span-6 lg:pl-10">
            <SectionHeading
              id="memories-title"
              tone="dark"
              eyebrow="Memories & Gallery"
              title={
                <>
                  Moments That
                  <br />
                  Last Forever
                </>
              }
              lead="Relive the laughter, celebrations, friendships and unforgettable times at Newton House."
            />
            <Link href="/memories" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }), "mt-9")}>
              Explore Gallery <ArrowRight aria-hidden className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-24 border-t border-gold/10 pt-14">
          <Gallery items={items} categories={categories} limit={6} showEmptyCategories={false} />
        </div>
      </div>
    </section>
  );
}
