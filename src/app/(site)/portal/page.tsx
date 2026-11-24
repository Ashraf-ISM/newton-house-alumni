import { ArrowRight, CheckCircle2, Clock, KeyRound, LayoutDashboard, Lock, LogOut, ShieldCheck, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { requireUser } from "@/lib/auth";
import { cn, paramValue } from "@/lib/utils";

export const metadata: Metadata = { title: "Member Portal", robots: { index: false } };
export const dynamic = "force-dynamic";

const statusCopy = {
  pending: {
    icon: Clock,
    badge: "warning" as const,
    label: "Awaiting approval",
    body: "The Association is reviewing your registration. Your profile will appear in the directory once approved.",
  },
  approved: {
    icon: CheckCircle2,
    badge: "success" as const,
    label: "Verified & Approved Member",
    body: "Your profile is active and follows the privacy visibility tier you selected.",
  },
  rejected: {
    icon: XCircle,
    badge: "danger" as const,
    label: "Not approved",
    body: "We could not verify your registration. Please contact the Association if you believe this is a mistake.",
  },
  info_required: {
    icon: Clock,
    badge: "warning" as const,
    label: "Additional Information Required",
    body: "Please review and complete your profile details below so the Association can complete verification.",
  },
};

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireUser("/portal");
  const sp = await searchParams;
  const a = viewer.alumni;
  const s = a ? statusCopy[a.status] : null;

  return (
    <>
      <PageHeader
        eyebrow="Authorised Member Portal"
        title={a ? `Welcome, ${a.fullName.split(" ")[0]}` : "Your Account"}
        lead="Manage your Newton House alumni profile, directory visibility, and contact privacy preferences."
        crumbs={[{ label: "Portal" }]}
        image={images.facadeWestWing}
        compact
      />
      <section className="paper bg-ivory py-14 lg:py-20">
        <div className="container-nh grid gap-10 lg:grid-cols-12">
          <aside className="space-y-5 lg:col-span-4">
            {paramValue(sp.error) === "not-admin" ? (
              <p
                role="alert"
                className="rounded-md border border-[#e8c3b8] bg-[#fbefeb] px-4 py-3 text-sm text-[#7c3121]"
              >
                Access denied: only authorised administrators can access the admin dashboard or approve registrations.
              </p>
            ) : null}

            {s && a ? (
              <div className="bg-card p-6 shadow-soft ring-1 ring-line/70">
                <Badge variant={s.badge}>
                  <s.icon className="size-3" aria-hidden /> {s.label}
                </Badge>
                <p className="mt-3 text-sm leading-relaxed text-muted-strong">{s.body}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-navy">
                  <Lock className="size-3.5 text-gold-dark" aria-hidden />
                  Visibility: <span className="capitalize">{a.visibility}</span> · Email{" "}
                  {a.showEmail ? "shared with members" : "hidden"}
                </p>
                {a.status === "approved" && a.visibility !== "private" ? (
                  <Link
                    href={`/alumni/${a.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
                  >
                    View my directory profile <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="bg-card p-6 shadow-soft ring-1 ring-line/70">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-strong">
                  Signed-in Session
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#22553a]">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  {viewer.role ? "Administrator" : "Member"}
                </span>
              </div>
              <p className="mt-3 break-all text-sm font-medium text-ink">{viewer.email}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/member/dashboard"
                  className={cn(buttonVariants({ variant: "gold", size: "sm" }), "justify-start")}
                >
                  <LayoutDashboard aria-hidden /> Full Member Dashboard
                </Link>
                <Link
                  href="/portal/password"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start")}
                >
                  <KeyRound aria-hidden /> Change password
                </Link>
                {viewer.role ? (
                  <Link
                    href="/admin"
                    className={cn(buttonVariants({ variant: "navy", size: "sm" }), "justify-start")}
                  >
                    <LayoutDashboard aria-hidden /> Admin dashboard
                  </Link>
                ) : null}
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-brick">
                    <LogOut aria-hidden /> Sign out
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="bg-card p-6 shadow-soft ring-1 ring-line/70 sm:p-10">
              {a ? (
                <>
                  <h2 className="font-serif text-3xl text-navy">Profile &amp; Privacy Controls</h2>
                  <p className="mt-2 text-sm text-muted-strong">
                    {a.fullName} · {a.department} · Class of {a.graduationYear}. Choose who can view your profile and
                    whether your email is visible to fellow signed-in alumni.
                  </p>
                  <div className="mt-8">
                    <ProfileForm alum={a} />
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <h2 className="font-serif text-3xl text-navy">Administrator Account</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm text-muted-strong">
                    You are signed in with an administrator account. Use the Admin Dashboard to review and approve
                    pending alumni registrations, achievements, events, and gallery items.
                  </p>
                  {viewer.role ? (
                    <Link href="/admin" className={cn(buttonVariants({ variant: "navy" }), "mt-6")}>
                      Open Admin Dashboard <ArrowRight aria-hidden />
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
