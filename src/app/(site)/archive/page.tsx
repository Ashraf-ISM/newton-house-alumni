import type { Metadata } from "next";
import { Reveal } from "@/components/animations/reveal";
import { Timeline } from "@/components/animations/timeline";
import { HeritageArchiveClient } from "@/components/archive/heritage-archive";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { SectionHeading } from "@/components/layout/section-heading";
import { images } from "@/data/images";
import { timeline } from "@/data/legacy";
import { getViewer } from "@/lib/auth";
import { listArchiveItems } from "@/lib/data/community";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digital Heritage Archive — Memories That Time Cannot Erase",
  description:
    "A living archive of Newton House — preserving the photographs, people, traditions, documents and moments that shaped generations.",
  alternates: { canonical: "/archive" },
  openGraph: { title: "Newton House Digital Heritage Archive", url: "/archive" },
};

export default async function HeritageArchivePage() {
  const viewer = await getViewer();
  const canContribute = Boolean(viewer.userId && (viewer.isApprovedMember || viewer.role));
  const items = listArchiveItems({ includeUnapproved: false });

  return (
    <>
      {/* A. HERO */}
      <PageHeader
        eyebrow="PRESERVING OUR HISTORY"
        title={
          <>
            Memories That Time <span className="italic text-gold">Cannot Erase.</span>
          </>
        }
        lead="A living archive of Newton House — preserving the photographs, people, traditions and moments that shaped generations."
        crumbs={[{ label: "Legacy", href: "/legacy" }, { label: "Digital Heritage Archive" }]}
        image={images.exteriorVintage}
      />

      {/* B, D, E & F. Museum Collections, Photo/Document Viewer & Contributions */}
      <section className="relative overflow-hidden bg-navy py-16 text-ivory lg:py-24">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <SampleNotice tone="dark" className="mb-8">
            <strong>Archival Integrity:</strong> Only authentic Newton House photographs and verified documents are
            published in this museum archive. Any demonstration document entry is explicitly badged{" "}
            <strong>Sample</strong>, and dates are displayed only when supported by verified sources.
          </SampleNotice>

          <HeritageArchiveClient
            items={items}
            canContribute={canContribute}
            defaultContributorName={viewer.alumni?.fullName ?? ""}
          />
        </div>
      </section>

      {/* C. Interactive Historical Timeline */}
      <section aria-labelledby="archive-timeline-heading" className="paper bg-ivory py-20 lg:py-28">
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="archive-timeline-heading"
              align="center"
              eyebrow="Chronicle of the House"
              title="Interactive Historical Timeline"
              lead="Explore the architectural milestones, traditions and chapters of Newton House. Specific years appear only when corroborated by verified college records."
              className="mb-16"
            />
          </Reveal>
          <Timeline entries={timeline} tone="light" showImages={true} />
        </div>
      </section>
    </>
  );
}
