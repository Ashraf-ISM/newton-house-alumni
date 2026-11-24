import { ArrowRight, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlumniDirectory } from "@/components/alumni/alumni-directory";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { viewerIsMember } from "@/lib/auth";
import { listDirectory } from "@/lib/data/alumni";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Alumni Directory",
  description: "Discover and reconnect with Newton House alumni across generations, professions and locations.",
  alternates: { canonical: "/alumni" },
  openGraph: { title: "Newton House Alumni Directory", url: "/alumni" },
};

export default async function AlumniPage() {
  const member = await viewerIsMember();
  const alumni = await listDirectory({ viewerIsMember: member });
  const hasSamples = alumni.some((a) => a.isSample);

  return (
    <>
      <PageHeader
        eyebrow="Alumni Directory"
        title={
          <>
            Reconnect with Your <span className="italic text-gold">Newton House Family</span>
          </>
        }
        lead="Discover and connect with fellow alumni across generations, professions and locations."
        crumbs={[{ label: "Alumni" }]}
        image={images.facadeWestWing}
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/join" className={cn(buttonVariants({ variant: "gold" }))}>
            Add your profile <ArrowRight aria-hidden />
          </Link>
          <Link href="/achievements" className={cn(buttonVariants({ variant: "outline-light" }))}>
            Notable alumni
          </Link>
        </div>
      </PageHeader>

      <section className="paper min-h-[60vh] bg-ivory py-14 lg:py-20">
        <div className="container-nh">
          <div className="mb-8 grid gap-3 lg:grid-cols-2">
            {hasSamples ? (
              <SampleNotice>
                The directory currently contains <strong>sample records</strong> (fictional people with generic organisations) so you can try search and filters.
                They will be removed as verified members are approved.
              </SampleNotice>
            ) : null}
            <SampleNotice>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Lock className="size-3.5" aria-hidden /> Privacy first.
              </span>{" "}
              {member
                ? "You are viewing as a signed-in member: profiles shared with members are included."
                : "Only profiles members have chosen to make public are shown. Sign in to see profiles shared with members."}{" "}
              Contact details are never displayed without consent.
            </SampleNotice>
          </div>
          <Suspense fallback={<p className="py-20 text-center text-muted-strong">Loading the directory…</p>}>
            <AlumniDirectory alumni={alumni} memberView={member} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
