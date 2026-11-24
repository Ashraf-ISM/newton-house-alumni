import { Handshake, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { MentorshipNetworkClient } from "@/components/mentorship/mentorship-network";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { getViewer } from "@/lib/auth";
import { listMentors } from "@/lib/data/community";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentorship Network — Guidance That Goes Beyond Generations",
  description:
    "Connect with experienced Newton House alumni, exchange knowledge and help the next generation navigate their academic and professional journeys.",
  alternates: { canonical: "/mentorship" },
  openGraph: { title: "Newton House Mentorship Network", url: "/mentorship" },
};

export default async function MentorshipPage() {
  const viewer = await getViewer();
  const isVerifiedUser = Boolean(viewer.userId && (viewer.isApprovedMember || viewer.role));
  const mentors = listMentors({ includeUnapproved: false });

  return (
    <>
      <PageHeader
        eyebrow="GROW TOGETHER"
        title={
          <>
            Guidance That Goes <span className="italic text-gold">Beyond Generations.</span>
          </>
        }
        lead="Connect with experienced Newton House alumni, exchange knowledge and help the next generation navigate their academic and professional journeys."
        crumbs={[{ label: "Alumni", href: "/alumni" }, { label: "Mentorship" }]}
        image={images.facadeWestWing}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#become-mentor" className={cn(buttonVariants({ variant: "gold" }))}>
            <Handshake aria-hidden className="size-4" /> Become a Mentor
          </a>
        </div>
      </PageHeader>

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh">
          <div className="mb-10 grid gap-4 lg:grid-cols-2">
            <SampleNotice>
              <strong>Demonstration Mentor Profiles:</strong> Mentors badged <strong>Sample</strong> illustrate the
              mentorship directory across scientific and public-service domains. Verified alumni mentor profiles appear
              here upon administrator approval.
            </SampleNotice>
            <SampleNotice>
              <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                <ShieldCheck className="size-4 text-gold-dark" aria-hidden /> Controlled Contact Sharing:
              </span>{" "}
              Personal phone numbers and private email addresses are never exposed publicly. Mentorship requests are
              routed through the platform and require verified membership.
            </SampleNotice>
          </div>

          <MentorshipNetworkClient
            mentors={mentors}
            isVerifiedUser={isVerifiedUser}
            viewerAlumni={viewer.alumni}
          />
        </div>
      </section>
    </>
  );
}
