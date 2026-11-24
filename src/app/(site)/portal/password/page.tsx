import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/forms/auth-forms";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Change password", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const viewer = await requireUser("/portal/password");
  return (
    <>
      <PageHeader eyebrow="Member Portal" title="Change password" crumbs={[{ label: "Portal", href: "/portal" }, { label: "Password" }]} image={null} compact />
      <section className="paper bg-ivory py-16">
        <div className="container-nh max-w-xl">
          <div className="bg-card p-8 shadow-soft ring-1 ring-line/70">
            {viewer.demo ? <SampleNotice>Password management is handled by Supabase Auth and is unavailable in demo mode.</SampleNotice> : <UpdatePasswordForm />}
          </div>
        </div>
      </section>
    </>
  );
}
