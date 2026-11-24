import type { Metadata } from "next";
import { JoinForm } from "@/components/forms/join-form";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { images } from "@/data/images";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Join the Alumni Network",
  description: "Register as a Newton House alumnus. Every profile is reviewed by the Association, and you control who can see it.",
  alternates: { canonical: "/join" },
  openGraph: { title: "Join the Newton House Alumni Network", url: "/join" },
};

export default function JoinPage() {
  const live = isSupabaseConfigured();
  return (
    <>
      <PageHeader
        eyebrow="Join the Network"
        title={
          <>
            Your Story <span className="italic text-gold">Belongs Here.</span>
          </>
        }
        lead="Register to join the verified Newton House directory, receive reunion invitations and reconnect with batch-mates. It takes about three minutes."
        crumbs={[{ label: "Alumni", href: "/alumni" }, { label: "Join" }]}
        image={images.mainEntrance}
        compact
      />
      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh max-w-6xl">
          {!live ? (
            <SampleNotice className="mb-10">
              <strong>Demo mode:</strong> Supabase is not connected, so no account or verification email is created. Your registration is stored in
              server memory and appears in the admin dashboard for approval — the complete workflow can be tested end to end.
            </SampleNotice>
          ) : null}
          <div className="bg-card p-6 shadow-soft ring-1 ring-line/70 sm:p-10 lg:p-14">
            <JoinForm requiresPassword={live} demo={!live} />
          </div>
        </div>
      </section>
    </>
  );
}
