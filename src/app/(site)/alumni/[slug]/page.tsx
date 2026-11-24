import { ArrowLeft, Briefcase, Building2, GraduationCap, Lock, Mail, MapPin, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlumniCard } from "@/components/alumni/alumni-card";
import { Portrait } from "@/components/alumni/portrait";
import { Reveal } from "@/components/animations/reveal";
import { LinkedInIcon } from "@/components/brand/social-icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { viewerIsMember } from "@/lib/auth";
import { getDirectoryProfile, listDirectory } from "@/lib/data/alumni";
import { absoluteUrl, cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getDirectoryProfile(slug, { viewerIsMember: false });
  if (!a) return { title: "Alumni profile", robots: { index: false } };
  const role = [a.designation, a.organisation].filter(Boolean).join(", ");
  return {
    title: `${a.fullName} — Class of ${a.graduationYear}`,
    description: `${a.fullName}, ${a.department} (${a.graduationYear})${role ? ` — ${role}` : ""}. Newton House alumni directory.`,
    alternates: { canonical: `/alumni/${a.slug}` },
    robots: a.isSample ? { index: false, follow: true } : undefined,
    openGraph: { type: "profile", title: a.fullName, url: `/alumni/${a.slug}` },
  };
}

export default async function AlumniProfilePage({ params }: Props) {
  const { slug } = await params;
  const member = await viewerIsMember();
  const a = await getDirectoryProfile(slug, { viewerIsMember: member });
  if (!a) notFound();

  const all = await listDirectory({ viewerIsMember: member });
  const related = all
    .filter((x) => x.id !== a.id && (x.graduationYear === a.graduationYear || x.department === a.department))
    .slice(0, 4);

  const details = [
    { icon: Briefcase, label: "Designation", value: a.designation },
    { icon: Building2, label: "Organisation", value: a.organisation },
    { icon: GraduationCap, label: "Department & batch", value: `${a.department}, Class of ${a.graduationYear}` },
    { icon: MapPin, label: "Location", value: [a.city, a.country].filter(Boolean).join(", ") || null },
  ].filter((d) => d.value);

  const jsonLd = a.isSample
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: a.fullName,
        jobTitle: a.designation ?? undefined,
        worksFor: a.organisation ? { "@type": "Organization", name: a.organisation } : undefined,
        alumniOf: { "@type": "CollegeOrUniversity", name: "Patna Science College" },
        url: absoluteUrl(`/alumni/${a.slug}`),
      };

  return (
    <>
      <section className="relative bg-navy pb-40 pt-36 text-ivory lg:pt-40">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Breadcrumbs items={[{ label: "Alumni", href: "/alumni" }, { label: a.fullName }]} />
        </div>
      </section>

      <section className="paper bg-ivory pb-24">
        <div className="container-nh -mt-28 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="bg-card p-3 shadow-lift">
              <Portrait
                name={a.fullName}
                photoUrl={a.photoUrl}
                className="aspect-[4/5]"
                textClassName="text-7xl"
                sizes="(min-width: 1024px) 28vw, 90vw"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8 lg:pt-32">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow text-gold-deep">Class of {a.graduationYear}</p>
              {a.isSample ? <Badge variant="sample">Sample record</Badge> : null}
              {a.visibility === "members" ? (
                <Badge variant="outline">
                  <Lock className="size-3" aria-hidden /> Members only
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-4 text-5xl leading-[1.02] text-navy sm:text-6xl">{a.fullName}</h1>
            {a.designation || a.organisation ? (
              <p className="mt-3 text-lg text-ink/80">{[a.designation, a.organisation].filter(Boolean).join(" · ")}</p>
            ) : null}

            {a.isSample ? (
              <SampleNotice className="mt-6 max-w-2xl">
                This is a <strong>fictional demonstration profile</strong>. It does not represent a real person or
                employer.
              </SampleNotice>
            ) : null}

            <dl className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex gap-4 bg-card p-5">
                  <d.icon className="mt-0.5 size-5 shrink-0 text-gold-dark" strokeWidth={1.5} aria-hidden />
                  <div>
                    <dt className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
                      {d.label}
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] text-ink">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {a.bio ? (
              <div className="mt-10 max-w-2xl">
                <h2 className="font-serif text-2xl text-navy">About</h2>
                <p className="prose-nh mt-3">{a.bio}</p>
              </div>
            ) : null}

            {/* Contact & Networking Privacy Gate */}
            {member ? (
              <div className="mt-10 max-w-2xl rounded-md border border-line bg-card p-5">
                <p className="flex items-center gap-2 font-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#22553a]">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Verified Member Contact Details
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {a.linkedinUrl ? (
                    <a
                      href={a.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "navy", size: "sm" }))}
                    >
                      <LinkedInIcon /> LinkedIn profile
                    </a>
                  ) : null}
                  {a.publicEmail ? (
                    <a href={`mailto:${a.publicEmail}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      <Mail aria-hidden /> {a.publicEmail}
                    </a>
                  ) : null}
                  {!a.publicEmail && !a.linkedinUrl ? (
                    <p className="text-sm text-muted-strong">
                      This member has chosen not to share an email address or LinkedIn URL with the directory.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-10 max-w-2xl rounded-md border border-dashed border-gold-dark/45 bg-card/85 p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-navy">Contact &amp; Networking Protected</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-strong">
                        Direct email addresses and networking links are visible only to signed-in, verified Newton House
                        alumni.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/alumni/${a.slug}`)}`}
                    className={cn(buttonVariants({ variant: "navy", size: "sm" }), "shrink-0")}
                  >
                    <Lock aria-hidden className="size-3.5" /> Sign in to connect
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8">
              <Link href="/alumni" className={cn(buttonVariants({ variant: "ghost" }))}>
                <ArrowLeft aria-hidden /> Back to directory
              </Link>
            </div>
          </Reveal>
        </div>

        {related.length ? (
          <div className="container-nh mt-24">
            <h2 className="font-serif text-3xl text-navy">From the same batch or department</h2>
            <ul className="mt-8 grid gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.id}>
                  <AlumniCard alum={r} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </>
  );
}
