import { PenTool } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { StoriesMagazine } from "@/components/stories/stories-magazine";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { getViewer } from "@/lib/auth";
import { listStories } from "@/lib/data/community";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alumni Stories — Beyond These Walls",
  description:
    "Every resident carries a story. Discover the journeys, experiences and achievements of the people who called Newton House home.",
  alternates: { canonical: "/alumni/stories" },
  openGraph: { title: "Voices of Newton House — Alumni Stories", url: "/alumni/stories" },
};

export default async function AlumniStoriesPage() {
  const viewer = await getViewer();
  const canSubmit = Boolean(viewer.userId && (viewer.isApprovedMember || viewer.role));
  const stories = listStories({ includeUnpublished: false });

  return (
    <>
      <PageHeader
        eyebrow="VOICES OF NEWTON HOUSE"
        title={
          <>
            Beyond <span className="italic text-gold">These Walls.</span>
          </>
        }
        lead="Every resident carries a story. Discover the journeys, experiences and achievements of the people who called Newton House home."
        crumbs={[{ label: "Alumni", href: "/alumni" }, { label: "Stories" }]}
        image={images.facadeCorner}
      >
        <div className="mt-8">
          <a href="#submit-story" className={cn(buttonVariants({ variant: "gold" }))}>
            <PenTool aria-hidden className="size-4" /> Share Your Story
          </a>
        </div>
      </PageHeader>

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh">
          <SampleNotice className="mb-10">
            <strong>Editorial Note:</strong> Stories marked <strong>Sample</strong> demonstrate the magazine layout and
            reading experience. Every member-submitted story is reviewed by the editorial committee before publication.
          </SampleNotice>

          <StoriesMagazine stories={stories} canSubmit={canSubmit} viewerAlumni={viewer.alumni} />
        </div>
      </section>
    </>
  );
}
