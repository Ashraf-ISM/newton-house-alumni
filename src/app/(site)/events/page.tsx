import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { EventCard, FeaturedEventCard } from "@/components/events/event-card";
import { PageHeader } from "@/components/layout/page-header";
import { SampleNotice } from "@/components/layout/sample-notice";
import { SectionHeading } from "@/components/layout/section-heading";
import { images } from "@/data/images";
import { listAnnouncements } from "@/lib/data/content";
import { splitEvents } from "@/lib/data/events";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & Reunions",
  description: "Upcoming Newton House alumni reunions, networking evenings, guest lectures, hostel gatherings and cultural celebrations.",
  alternates: { canonical: "/events" },
  openGraph: { title: "Newton House Events & Reunions", url: "/events" },
};

export default async function EventsPage() {
  const [{ upcoming, past }, announcements] = await Promise.all([splitEvents(), listAnnouncements()]);
  const [featured, ...rest] = upcoming;
  const hasDemo = [...upcoming, ...past].some((e) => e.isDemo);

  return (
    <>
      <PageHeader
        eyebrow="Events & Reunions"
        title={
          <>
            Let’s <span className="italic text-gold">Reconnect.</span>
          </>
        }
        lead="Reunions, networking evenings, guest lectures, hostel gatherings and cultural celebrations — every generation is welcome home."
        crumbs={[{ label: "Events" }]}
        image={images.alumniGathering}
      />

      {announcements.length ? (
        <section aria-label="Announcements" className="border-b border-line bg-card">
          <div className="container-nh flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
            <span className="inline-flex shrink-0 items-center gap-2 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
              <Megaphone className="size-4" aria-hidden /> Announcement
            </span>
            <p className="text-sm text-ink">
              <strong className="font-semibold">{announcements[0].title}.</strong> <span className="text-muted-strong">{announcements[0].body}</span>
            </p>
          </div>
        </section>
      ) : null}

      <section id="upcoming" aria-labelledby="upcoming-title" className="paper scroll-mt-24 bg-ivory py-20 lg:py-28">
        <div className="container-nh">
          <Reveal>
            <SectionHeading id="upcoming-title" eyebrow="Upcoming" title="On the calendar" />
          </Reveal>
          {hasDemo ? (
            <SampleNotice className="mt-8 max-w-3xl">
              Events marked <strong>Demonstration</strong> illustrate how listings and registrations work. Confirmed dates will be published by the Association.
            </SampleNotice>
          ) : null}
          {featured ? (
            <>
              <Reveal className="mt-10">
                <FeaturedEventCard event={featured} />
              </Reveal>
              {rest.length ? (
                <Stagger as="ul" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((e) => (
                    <StaggerItem as="li" key={e.id}>
                      <EventCard event={e} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
            </>
          ) : (
            <p className="mt-10 text-muted-strong">No upcoming events right now. Subscribe to the newsletter to hear first.</p>
          )}
        </div>
      </section>

      <section id="past" aria-labelledby="past-title" className="scroll-mt-24 bg-card py-20 lg:py-28">
        <div className="container-nh">
          <Reveal>
            <SectionHeading id="past-title" eyebrow="Past Events" title="Gatherings remembered" lead="Reports and photo galleries from earlier events." />
          </Reveal>
          {past.length ? (
            <Stagger as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <StaggerItem as="li" key={e.id}>
                  <EventCard event={e} past />
                  <p className="mt-2 text-xs text-muted-strong">Held {formatDate(e.startsAt)}</p>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="mt-10 text-muted-strong">Past event galleries will appear here.</p>
          )}
        </div>
      </section>
    </>
  );
}
