import { ArrowRight, CheckCircle2, Clock, KeyRound, LayoutDashboard, LogOut, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { requireUser } from "@/lib/auth";
import { cn, paramValue } from "@/lib/utils";

export const metadata: Metadata = { title: "Member Portal", robots: { index: false } };
export const dynamic = "force-dynamic";

const statusCopy = {
  pending: { icon: Clock, badge: "warning" as const, label: "Awaiting approval", body: "The Association is reviewing your registration. Your profile will appear in the directory once approved." },
  approved: { icon: CheckCircle2, badge: "success" as const, label: "Approved member", body: "Your profile is live according to your visibility setting." },
  rejected: { icon: XCircle, badge: "danger" as const, label: "Not approved", body: "We could not verify your registration. Please contact the Association if you believe this is a mistake." },
};

export default async function PortalPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const viewer = await requireUser("/portal");
  const sp = await searchParams;
  const a = viewer.alumni;
  const s = a ? statusCopy[a.status] : null;

  return (
    <>
      <PageHeader eyebrow="Member Portal" title={a ? `Welcome, ${a.fullName.split(" ")[0]}` : "Your account"} crumbs={[{ label: "Portal" }]} image={images.facadeWestWing} compact />
      <section className="paper bg-ivory py-14 lg:py-20">
        <div className="container-nh grid gap-10 lg:grid-cols-12">
          <aside className="space-y-5 lg:col-span-4">
            {viewer.demo ? (
              <SampleNotice>
                <strong>Demo mode.</strong> You are previewing the portal as a demonstration member. Changes are kept in server memory until Supabase is connected.
              </SampleNotice>
            ) : null}
            {paramValue(sp.error) === "not-admin" ? (
              <p role="alert" className="rounded-md border border-[#e8c3b8] bg-[#fbefeb] px-4 py-3 text-sm text-[#7c3121]">
                Your account does not have admin access.
              </p>
            ) : null}
            {s && a ? (
              <div className="bg-card p-6 shadow-soft ring-1 ring-line/70">
                <Badge variant={s.badge}>
                  <s.icon className="size-3" aria-hidden /> {s.label}
                </Badge>
                <p className="mt-3 text-sm leading-relaxed text-muted-strong">{s.body}</p>
                {a.status === "approved" && a.visibility !== "private" ? (
                  <Link href={`/alumni/${a.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline">
                    View my public profile <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div className="bg-card p-6 shadow-soft ring-1 ring-line/70">
              <h2 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-strong">Account</h2>
              <p className="mt-3 break-all text-sm text-ink">{viewer.email}</p>
              <div className="mt-5 flex flex-col gap-2">
                {!viewer.demo ? (
                  <Link href="/portal/password" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}>
                    <KeyRound aria-hidden /> Change password
                  </Link>
                ) : null}
                {viewer.role ? (
                  <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}>
                    <LayoutDashboard aria-hidden /> Admin dashboard
                  </Link>
                ) : null}
                {!viewer.demo ? (
                  <form action={signOut}>
                    <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
                      <LogOut aria-hidden /> Sign out
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="bg-card p-6 shadow-soft ring-1 ring-line/70 sm:p-10">
              {a ? (
                <>
                  <h2 className="font-serif text-3xl text-navy">Your profile</h2>
                  <p className="mt-2 text-sm text-muted-strong">
                    {a.fullName} · {a.department} · Class of {a.graduationYear}. To correct your name, batch or department, contact the Association.
                  </p>
                  <div className="mt-8">
                    <ProfileForm alum={a} />
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <h2 className="font-serif text-3xl text-navy">No alumni profile yet</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-muted-strong">Your account is not linked to an alumni registration. Register to appear in the directory.</p>
                  <Link href="/join" className={cn(buttonVariants({ variant: "gold" }), "mt-6")}>
                    Register as an alumnus
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
