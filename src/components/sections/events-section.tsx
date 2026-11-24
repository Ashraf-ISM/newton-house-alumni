import { ArrowRight, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { EventRow, FeaturedEventCard } from "@/components/events/event-card";
import { SectionHeading } from "@/components/layout/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NHEvent } from "@/types";

export function EventsSection({ upcoming }: { upcoming: NHEvent[] }) {
  const [featured, ...rest] = upcoming;
  return (
    <section id="events" aria-labelledby="events-title" className="paper bg-ivory py-24 sm:py-28 lg:py-32">
      <div className="container-nh">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              id="events-title"
              eyebrow="Upcoming Events"
              title="Let’s Reconnect."
              lead="Be part of our upcoming alumni meets, lectures and gatherings — every generation is welcome home."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>
              View All Events <ArrowRight aria-hidden />
            </Link>
          </Reveal>
        </div>

        {featured ? (
          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <FeaturedEventCard event={featured} />
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4">
              <h3 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted-strong">Also coming up</h3>
              <div className="mt-2 border-t border-line">
                {rest.slice(0, 3).map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
                {!rest.length ? <p className="py-6 text-sm text-muted-strong">More events will be announced soon.</p> : null}
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center border border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <CalendarPlus className="size-8 text-gold-dark" aria-hidden />
            <p className="mt-4 font-serif text-3xl text-navy">New dates are being planned</p>
            <p className="mt-2 max-w-md text-sm text-muted-strong">Subscribe to the newsletter in the footer to hear about the next reunion first.</p>
          </div>
        )}
      </div>
    </section>
  );
}
