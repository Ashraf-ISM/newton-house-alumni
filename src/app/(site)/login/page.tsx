import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/forms/auth-forms";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn, paramValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Member Sign In",
  description: "Sign in to the Newton House alumni portal to manage your profile and privacy.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const rawNext = paramValue(sp.next) ?? "/portal";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/portal";
  const live = isSupabaseConfigured();
  if (live) {
    const v = await getViewer();
    if (v.userId) redirect(next);
  }
  const error = paramValue(sp.error);

  return (
    <>
      <PageHeader eyebrow="Member Portal" title="Welcome back" crumbs={[{ label: "Sign in" }]} image={images.facadeWestWing} compact />
      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh grid max-w-5xl gap-10 lg:grid-cols-2">
          <div className="bg-card p-8 shadow-soft ring-1 ring-line/70 sm:p-10">
            <h2 className="font-serif text-3xl text-navy">Sign in</h2>
            <p className="mt-2 text-sm text-muted-strong">Use the email and password you registered with.</p>
            {error ? (
              <p role="alert" className="mt-5 rounded-md border border-[#e8c3b8] bg-[#fbefeb] px-4 py-3 text-sm text-[#7c3121]">
                {error === "auth" ? "That sign-in link is invalid or has expired. Please try again." : "Please sign in to continue."}
              </p>
            ) : null}
            <div className="mt-8">
              {live ? (
                <SignInForm next={next} />
              ) : (
                <div className="space-y-5">
                  <SampleNotice>
                    <strong>Demo mode:</strong> authentication is provided by Supabase Auth and activates automatically once credentials are configured. You can
                    preview the member portal and admin dashboard as a demo user.
                  </SampleNotice>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/portal" className={cn(buttonVariants({ variant: "navy" }))}>
                      Open member portal <ArrowRight aria-hidden />
                    </Link>
                    <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }))}>
                      Admin dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center lg:pl-6">
            <p className="eyebrow text-gold-deep">New here?</p>
            <h2 className="mt-4 font-serif text-4xl text-navy">Join the Newton House network</h2>
            <p className="mt-4 leading-relaxed text-muted-strong">
              Registration is open to everyone who lived at Newton House. Your profile is reviewed by the Association, and you decide who can see it.
            </p>
            <Link href="/join" className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mt-8 self-start")}>
              Register as an alumnus <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
