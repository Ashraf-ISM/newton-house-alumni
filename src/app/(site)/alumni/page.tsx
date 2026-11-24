import { ArrowRight, Lock, ShieldCheck, UserCheck } from "lucide-react";
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

export const dynamic = "force-dynamic";

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
          {member ? (
            <Link href="/portal" className={cn(buttonVariants({ variant: "gold" }))}>
              <UserCheck aria-hidden /> Manage My Profile &amp; Privacy
            </Link>
          ) : (
            <>
              <Link href="/login?next=/alumni" className={cn(buttonVariants({ variant: "gold" }))}>
                <Lock aria-hidden className="size-3.5" /> Member Sign In
              </Link>
              <Link href="/join" className={cn(buttonVariants({ variant: "outline-light" }))}>
                Register as an Alumnus <ArrowRight aria-hidden />
              </Link>
            </>
          )}
          <Link href="/achievements" className={cn(buttonVariants({ variant: "outline-light" }))}>
            Notable alumni
          </Link>
        </div>
      </PageHeader>

      <section className="paper min-h-[60vh] bg-ivory py-14 lg:py-20">
        <div className="container-nh">
          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            {hasSamples ? (
              <SampleNotice>
                The directory currently contains <strong>sample records</strong> (fictional people with generic
                organisations) so you can try search and filters. They are replaced as verified members are approved.
              </SampleNotice>
            ) : null}

            {member ? (
              <div className="flex items-start gap-3 rounded-md border border-[#bcd8c4] bg-[#eef6f0] px-4 py-3 text-[0.8125rem] leading-relaxed text-[#1f4d33]">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div>
                  <strong>Verified Member View Active:</strong> You are signed in as an authorised member. Profiles
                  shared with <em>Members Only</em> and consented networking details are unlocked.{" "}
                  <Link href="/portal" className="font-semibold underline">
                    Edit your privacy settings
                  </Link>
                  .
                </div>
              </div>
            ) : (
              <SampleNotice>
                <span className="inline-flex items-center gap-1.5 font-semibold text-navy">
                  <Lock className="size-3.5 text-gold-dark" aria-hidden /> Privacy &amp; Member Protection:
                </span>{" "}
                Only profiles members have chosen to make <strong>Public</strong> are shown here, and contact details are
                redacted for visitors.{" "}
                <Link href="/login?next=/alumni" className="font-semibold text-gold-deep underline">
                  Sign in as a verified alumnus
                </Link>{" "}
                to view members-only profiles and networking details.
              </SampleNotice>
            )}
          </div>
          <Suspense fallback={<p className="py-20 text-center text-muted-strong">Loading the directory…</p>}>
            <AlumniDirectory alumni={alumni} memberView={member} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
