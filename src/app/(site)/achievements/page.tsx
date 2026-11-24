import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section-heading";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { listAchievements } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Alumni Achievements",
  description: "Celebrating Newton House alumni in research, public service, science and technology, corporate leadership and entrepreneurship.",
  alternates: { canonical: "/achievements" },
  openGraph: { title: "Newton House Alumni Achievements", url: "/achievements" },
};

export default async function AchievementsPage() {
  const achievements = await listAchievements();
  return (
    <>
      <PageHeader
        eyebrow="Alumni Achievements"
        title={
          <>
            Carrying the House <span className="italic text-gold">Into the World</span>
          </>
        }
        lead="Newton House alumni serve in laboratories, classrooms, public offices and boardrooms. Every achievement published here is verified with the member before it appears."
        crumbs={[{ label: "Alumni", href: "/alumni" }, { label: "Achievements" }]}
        image={images.facadeCorner}
      />
      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh">
          <AchievementsShowcase achievements={achievements} heading={false} />
        </div>
      </section>
      <section className="bg-card py-20 lg:py-24">
        <div className="container-nh grid gap-8 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-8">
            <SectionHeading
              eyebrow="Nominations"
              title="Know an alumnus whose story should be told?"
              lead="Nominate a fellow resident — or submit your own achievement. The Association verifies every detail with the member before publishing."
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:text-right">
            <Link href={`/contact?subject=${encodeURIComponent("Achievement nomination")}`} className={cn(buttonVariants({ variant: "navy", size: "lg" }))}>
              Submit a nomination <ArrowRight aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
