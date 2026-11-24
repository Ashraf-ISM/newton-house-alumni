import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/reveal";
import { BatchContributionForm } from "@/components/batches/batch-contribution-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { viewerIsMember } from "@/lib/auth";
import { getBatchBySlug } from "@/lib/data/community";
import { splitEvents } from "@/lib/data/events";
import { cn, formatDate, initials } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const batch = await getBatchBySlug(slug, { viewerIsMember: false });
  if (!batch) return { title: "Batch Cohort" };
  return {
    title: `${batch.title} (${batch.residencePeriod}) — Batch Directory`,
    description: batch.description,
    alternates: { canonical: `/alumni/batches/${batch.slug}` },
  };
}

export default async function BatchDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = await viewerIsMember();
  const [batch, { upcoming }] = await Promise.all([
    getBatchBySlug(slug, { viewerIsMember: member }),
    splitEvents(),
  ]);
  if (!batch) notFound();

  const memories = batch.contributions.filter((c) => c.type === "memory" || c.type === "historical_info");
  const updates = batch.contributions.filter((c) => c.type === "reunion_detail" || c.type === "photograph");

  return (
    <>
      {/* 1 & 2. Batch Introduction & Batch Photograph Hero */}
      <section className="relative isolate overflow-hidden bg-navy pb-20 pt-36 text-ivory lg:pb-24 lg:pt-44">
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[55%]">
          <Image
            src={batch.photoUrl ?? images.alumniGathering.src}
            alt={`Newton House ${batch.title}`}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover opacity-40 lg:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-20 navy-grain" />

        <div className="container-nh relative">
          <Breadcrumbs
            items={[
              { label: "Alumni", href: "/alumni" },
              { label: "Batches", href: "/alumni/batches" },
              { label: batch.title },
            ]}
          />
          <Reveal className="mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="eyebrow text-gold">Residence Period · {batch.residencePeriod}</p>
              {batch.isSample ? <Badge variant="sample-dark">Sample Cohort Data</Badge> : null}
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-ivory sm:text-6xl">{batch.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/80 sm:text-lg">{batch.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-6 border-t border-gold/15 pt-5 text-sm text-ivory/80">
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-gold" aria-hidden />
                <strong className="text-ivory">{batch.memberCount}</strong> verified{" "}
                {batch.memberCount === 1 ? "alumnus" : "alumni"}
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="size-4 text-gold" aria-hidden />
                <strong className="text-ivory">{batch.departments.length}</strong> academic{" "}
                {batch.departments.length === 1 ? "department" : "departments"}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh space-y-16">
          {batch.isSample ? (
            <SampleNotice>
              Profiles and recollections badged <strong>Sample</strong> on this page are demonstrations. Real batch
              members and moderated memories appear here as verified alumni register and contribute.
            </SampleNotice>
          ) : null}

          {/* 4. Department Distribution */}
          <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
            <h2 className="font-serif text-2xl text-navy">Department Distribution — {batch.title}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {batch.departments.map((d) => {
                const pct = batch.memberCount ? Math.round((d.count / batch.memberCount) * 100) : 0;
                return (
                  <div key={d.department} className="rounded border border-line bg-ivory/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-navy">{d.department}</span>
                      <span className="font-mono text-xs text-gold-deep tabular-nums">
                        {d.count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ivory-2">
                      <div className="h-full bg-gold-dark" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 & E. Verified Alumni Members Cards */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold-deep">Verified Cohort Roster</p>
                <h2 className="mt-2 font-serif text-3xl text-navy">Alumni of {batch.title}</h2>
              </div>
              <Link href={`/alumni?year=${batch.year}`} className="text-sm font-semibold text-gold-deep hover:underline">
                Filter in main directory →
              </Link>
            </div>

            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {batch.members.map((m) => (
                <li key={m.id}>
                  <article className="group relative flex h-full flex-col justify-between bg-card p-6 shadow-soft ring-1 ring-line/80 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/45 bg-ivory font-serif text-lg font-semibold text-navy">
                          {m.photoUrl ? (
                            <Image
                              src={m.photoUrl}
                              alt={m.fullName}
                              fill
                              sizes="3.5rem"
                              className="object-cover"
                              unoptimized={m.photoUrl.startsWith("data:")}
                            />
                          ) : (
                            initials(m.fullName)
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                            {m.department}
                          </span>
                          {m.isSample ? (
                            <div className="mt-1">
                              <Badge variant="sample">Sample</Badge>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <h3 className="mt-4 font-serif text-2xl text-navy group-hover:text-gold-deep">
                        <Link href={`/alumni/${m.slug}`} className="after:absolute after:inset-0">
                          {m.fullName}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-muted-strong">
                        Residence: {m.residenceStartYear ?? m.graduationYear - 3} – {m.graduationYear}
                      </p>

                      {m.designation || m.organisation ? (
                        <div className="mt-3 border-l-2 border-gold/50 pl-3 text-xs">
                          {m.designation ? <p className="font-semibold text-ink">{m.designation}</p> : null}
                          {m.organisation ? (
                            <p className="mt-0.5 flex items-center gap-1 text-muted-strong">
                              <Building2 className="size-3 text-gold-dark" aria-hidden /> {m.organisation}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-3.5 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-strong">
                        <MapPin className="size-3.5 text-gold-dark" aria-hidden />
                        {m.city ?? "Location private"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-navy group-hover:text-gold-deep">
                        View Profile <ArrowUpRight className="size-3.5 text-gold-dark" aria-hidden />
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          {/* 5, 6 & 7. Shared Memories, Batch Events & Recent Updates */}
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
                <h2 className="font-serif text-2xl text-navy">Shared Batch Memories &amp; Historical Notes</h2>
                <ul className="mt-5 divide-y divide-line">
                  {memories.map((c) => (
                    <li key={c.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-serif text-xl text-navy">{c.title}</p>
                        {c.isSample ? <Badge variant="sample">Sample</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-strong">{c.content}</p>
                      <p className="mt-2 text-xs text-muted">Contributed {formatDate(c.submittedAt)}</p>
                    </li>
                  ))}
                  {!memories.length ? (
                    <li className="py-6 text-sm text-muted-strong">
                      No memories have been published for {batch.title} yet. Contribute the first recollection below!
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
                <h2 className="font-serif text-2xl text-navy">Batch Events &amp; Recent Updates</h2>
                <div className="mt-4 space-y-4">
                  {updates.map((u) => (
                    <div key={u.id} className="rounded border border-line bg-ivory/50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-navy">{u.title}</p>
                        {u.isSample ? <Badge variant="sample">Sample</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-strong">{u.content}</p>
                    </div>
                  ))}
                  {upcoming.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="flex items-start justify-between gap-4 border-t border-line pt-4">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-gold-deep">
                          <CalendarDays className="size-3.5" aria-hidden /> {formatDate(ev.startsAt)}
                        </p>
                        <Link
                          href={`/events/${ev.slug}`}
                          className="mt-1 block font-serif text-xl text-navy hover:text-gold-deep"
                        >
                          {ev.title}
                        </Link>
                        <p className="text-xs text-muted-strong">
                          {ev.venue}, {ev.city}
                        </p>
                      </div>
                      <Link
                        href={`/events/${ev.slug}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* F. Batch Contributions Form */}
            <div className="lg:col-span-5">
              <BatchContributionForm batchSlug={batch.slug} batchYear={batch.year} canContribute={member} />
            </div>
          </div>

          <div>
            <Link href="/alumni/batches" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft aria-hidden /> All Newton House Batches
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
