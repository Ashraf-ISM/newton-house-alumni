import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { AlumniShowcase } from "@/components/sections/alumni-showcase";
import { CommunityCTA } from "@/components/sections/community-cta";
import { EventsSection } from "@/components/sections/events-section";
import { ImpactStats } from "@/components/sections/impact-stats";
import { LegacyIntro } from "@/components/sections/legacy-intro";
import { MemoriesSection } from "@/components/sections/memories-section";
import { listDirectory } from "@/lib/data/alumni";
import { listAchievements, listGallery, listGalleryCategories } from "@/lib/data/content";
import { splitEvents } from "@/lib/data/events";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [alumni, gallery, categories, achievements, { upcoming }] = await Promise.all([
    listDirectory({ viewerIsMember: false }),
    listGallery(),
    listGalleryCategories(),
    listAchievements(),
    splitEvents(),
  ]);

  // Prefer real profiles with photographs; fall back to labelled samples.
  const featured = [...alumni].sort((a, b) => Number(a.isSample) - Number(b.isSample) || Number(!!b.photoUrl) - Number(!!a.photoUrl)).slice(0, 8);

  return (
    <>
      <Hero />
      <ImpactStats />
      <LegacyIntro />
      <AlumniShowcase alumni={featured} total={alumni.length} />
      <MemoriesSection items={gallery} categories={categories} />
      <section aria-labelledby="achievements-title" className="bg-ivory-2 py-24 sm:py-28 lg:py-32">
        <div className="container-nh">
          <AchievementsShowcase achievements={achievements.slice(0, 6)} />
        </div>
      </section>
      <EventsSection upcoming={upcoming} />
      <CommunityCTA />
    </>
  );
}
