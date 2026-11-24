import { ArrowLeft, CalendarPlus, Clock, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/reveal";
import { DateTile } from "@/components/events/event-card";
import { EventRegistrationForm } from "@/components/events/registration-form";
import { GalleryStrip } from "@/components/gallery/gallery-strip";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { eventCategoryLabels } from "@/data/events";
import { getEvent, listEvents } from "@/lib/data/events";
import { absoluteUrl, cn, formatDate, formatTime, isUpcoming } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return { title: "Event" };
  return {
    title: e.title,
    description: e.summary,
    alternates: { canonical: `/events/${e.slug}` },
    robots: e.isDemo ? { index: false, follow: true } : undefined,
    openGraph: { title: e.title, description: e.summary, url: `/events/${e.slug}`, images: e.imageUrl && !e.imageUrl.startsWith("data:") ? [e.imageUrl] : undefined },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) notFound();
  const upcoming = isUpcoming(e.startsAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: e.startsAt,
    endDate: e.endsAt ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: "IN" } },
    image: e.imageUrl && !e.imageUrl.startsWith("data:") ? [absoluteUrl(e.imageUrl)] : undefined,
    organizer: { "@type": "Organization", name: "Newton House Alumni Association", url: absoluteUrl("/") },
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy pb-16 pt-36 text-ivory lg:pb-24 lg:pt-44">
        {e.imageUrl ? (
          <div className="absolute inset-0 -z-10">
            <Image src={e.imageUrl} alt="" fill priority sizes="100vw" className="object-cover opacity-35" unoptimized={e.imageUrl.startsWith("data:")} />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
          </div>
        ) : null}
        <div className="container-nh">
          <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: e.title }]} />
          <Reveal className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end" y={20}>
            <DateTile iso={e.startsAt} tone="dark" className="bg-navy/60 backdrop-blur-sm" />
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow text-gold">{eventCategoryLabels[e.category]}</p>
                {e.isDemo ? <Badge variant="sample-dark">Demonstration</Badge> : null}
                {!upcoming ? <Badge variant="sample-dark">Past event</Badge> : null}
              </div>
              <h1 className="mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl">{e.title}</h1>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {e.isDemo ? (
              <SampleNotice className="mb-8">
                This is a <strong>demonstration event</strong>. Registrations are functional so the workflow can be tested, but the date and programme are illustrative.
              </SampleNotice>
            ) : null}
            <p className="font-serif text-2xl leading-snug text-navy sm:text-[1.75rem]">{e.summary}</p>
            <div className="prose-nh mt-8">
              {e.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {e.gallery.length ? (
              <div className="mt-14">
                <h2 className="font-serif text-3xl text-navy">Event gallery</h2>
                <GalleryStrip srcs={e.gallery} title={e.title} />
              </div>
            ) : null}
            <Link href="/events" className={cn(buttonVariants({ variant: "outline" }), "mt-12")}>
              <ArrowLeft aria-hidden /> All events
            </Link>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="bg-card p-7 shadow-soft ring-1 ring-line/70">
                <h2 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted-strong">Event details</h2>
                <dl className="mt-5 space-y-4 text-[0.9375rem]">
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                    <div>
                      <dt className="sr-only">Date and time</dt>
                      <dd className="text-ink">{formatDate(e.startsAt, { weekday: "long" })}</dd>
                      <dd className="text-muted-strong">
                        {formatTime(e.startsAt)}
                        {e.endsAt ? ` – ${formatTime(e.endsAt)}` : ""} IST
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                    <div>
                      <dt className="sr-only">Venue</dt>
                      <dd className="text-ink">{e.venue}</dd>
                      <dd className="text-muted-strong">{e.city}</dd>
                    </div>
                  </div>
                  {e.capacity ? (
                    <div className="flex gap-3">
                      <Users className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                      <div>
                        <dt className="sr-only">Capacity</dt>
                        <dd className="text-ink">Up to {e.capacity} guests</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>
                {upcoming ? (
                  <a href={`/events/${e.slug}/calendar`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6")}>
                    <CalendarPlus aria-hidden /> Add to calendar
                  </a>
                ) : null}
              </div>

              <div id="register" className="scroll-mt-28 bg-card p-7 shadow-soft ring-1 ring-line/70">
                <h2 className="font-serif text-3xl text-navy">{upcoming && e.registrationOpen ? "Register" : "Registration"}</h2>
                {upcoming && e.registrationOpen ? (
                  <div className="mt-5">
                    <EventRegistrationForm eventId={e.id} eventTitle={e.title} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-muted-strong">
                    {upcoming
                      ? "Registration for this event is not open yet. Subscribe to the newsletter to be notified when it opens."
                      : "This event has taken place. Thank you to everyone who joined us."}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
