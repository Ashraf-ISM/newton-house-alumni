import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BatchDirectory } from "@/components/batches/batch-directory";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { viewerIsMember } from "@/lib/auth";
import { listBatchesWithMembers } from "@/lib/data/community";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Batch Directory — Together Through the Years",
  description:
    "Explore the generations of Newton House residents by batch year, department and residence period, and reconnect with the people who shared your journey.",
  alternates: { canonical: "/alumni/batches" },
  openGraph: { title: "Newton House Batch Directory", url: "/alumni/batches" },
};

export default async function BatchesPage() {
  const member = await viewerIsMember();
  const batches = await listBatchesWithMembers({ viewerIsMember: member });

  return (
    <>
      <PageHeader
        eyebrow="OUR GENERATIONS"
        title={
          <>
            Together Through <span className="italic text-gold">the Years.</span>
          </>
        }
        lead="Explore the generations of Newton House residents and reconnect with the people who shared your journey."
        crumbs={[{ label: "Alumni", href: "/alumni" }, { label: "Batches" }]}
        image={images.alumniGathering}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/alumni" className={cn(buttonVariants({ variant: "outline-light" }))}>
            Full Alumni Directory
          </Link>
          <Link href="/join" className={cn(buttonVariants({ variant: "gold" }))}>
            Add Your Batch Profile <ArrowRight aria-hidden />
          </Link>
        </div>
      </PageHeader>

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh">
          <SampleNotice className="mb-8">
            <strong>Data Integrity Notice:</strong> Batch cohorts and member counts below are derived from currently
            registered profiles (including clearly labelled <strong>sample records</strong>). No historical cohort dates
            or alumni identities are fabricated.
          </SampleNotice>

          <BatchDirectory batches={batches} />
        </div>
      </section>
    </>
  );
}
