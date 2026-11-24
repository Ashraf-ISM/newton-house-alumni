import { ArrowRight, Lock, ShieldCheck, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/forms/auth-forms";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn, paramValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Member & Administrator Sign In",
  description: "Authorised sign-in for verified Newton House alumni members and Association administrators.",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawNext = paramValue(sp.next) ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  const viewer = await getViewer();
  if (viewer.userId && (viewer.role || viewer.isApprovedMember)) {
    redirect(next || (viewer.role ? "/admin" : "/portal"));
  }

  const error = paramValue(sp.error);
  const live = isSupabaseConfigured();

  return (
    <>
      <PageHeader
        eyebrow="Authorised Access"
        title={
          <>
            Member &amp; Admin <span className="italic text-gold">Sign In</span>
          </>
        }
        lead="Sign in to access the member-only alumni directory, manage your profile privacy settings, or administer pending approvals."
        crumbs={[{ label: "Sign in" }]}
        image={images.facadeWestWing}
        compact
      />

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh grid max-w-6xl gap-12 lg:grid-cols-12 lg:items-start">
          <div className="bg-card p-8 shadow-soft ring-1 ring-line/80 sm:p-10 lg:col-span-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-3xl text-navy">Sign in to your account</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory px-3 py-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-navy">
                <Lock className="size-3 text-gold-dark" aria-hidden /> Protected
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-strong">
              Only verified Newton House alumni whose registrations have been approved and authorised administrators can
              sign in.
            </p>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-md border border-[#e8c3b8] bg-[#fbefeb] px-4 py-3 text-sm text-[#7c3121]"
              >
                {error === "auth"
                  ? "That sign-in link is invalid or has expired. Please sign in below."
                  : error === "pending-approval"
                    ? "Your registration is still awaiting administrator verification and approval."
                    : "Please sign in with an authorised account to continue."}
              </p>
            ) : null}

            {next.startsWith("/admin") ? (
              <p className="mt-5 rounded-md border border-gold-dark/35 bg-gold/10 px-4 py-3 text-xs font-medium text-navy">
                Administrator credentials are required to access <strong>{next}</strong> and approve registrations or
                achievements.
              </p>
            ) : null}

            <div className="mt-7">
              <SignInForm next={next} showLocalAccounts={!live || process.env.NODE_ENV !== "production"} />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5 lg:pl-4">
            <div className="bg-card p-7 shadow-soft ring-1 ring-line/70">
              <p className="eyebrow text-gold-deep">Privacy &amp; Verification</p>
              <h2 className="mt-3 font-serif text-3xl text-navy">How Authorisation Works</h2>
              <ul className="mt-5 space-y-4 text-sm text-muted-strong">
                <li className="flex items-start gap-3">
                  <UserCheck className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                  <span>
                    <strong className="text-ink">1. Register with a password:</strong> Alumni submit their batch,
                    department and password on the Join page.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                  <span>
                    <strong className="text-ink">2. Administrator verification:</strong> Registrations stay locked in
                    pending state until an authorised administrator verifies and approves them.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                  <span>
                    <strong className="text-ink">3. Member-only privacy:</strong> Once approved, you can sign in to view
                    members-only profiles, networking links, and control your own visibility (Public, Members Only, or
                    Private).
                  </span>
                </li>
              </ul>

              <div className="mt-7 border-t border-line pt-6">
                <p className="text-xs text-muted-strong">Not registered in the alumni network yet?</p>
                <Link
                  href="/join"
                  className={cn(buttonVariants({ variant: "gold", size: "md" }), "mt-3 w-full sm:w-auto")}
                >
                  Register as an Alumnus <ArrowRight aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
