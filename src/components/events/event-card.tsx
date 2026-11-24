import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { eventCategoryLabels } from "@/data/events";
import { cn, dateParts, formatDate, formatTime } from "@/lib/utils";
import type { NHEvent } from "@/types";

export function DateTile({ iso, className, tone = "light" }: { iso: string; className?: string; tone?: "light" | "dark" }) {
  const { day, month, year } = dateParts(iso);
  return (
    <div className={cn("flex w-[4.5rem] shrink-0 flex-col items-center border py-2.5 text-center", tone === "dark" ? "border-gold/30 text-ivory" : "border-line bg-white text-navy", className)}>
      <span className="font-label text-[0.625rem] font-semibold tracking-[0.18em] text-gold-deep">{month}</span>
      <span className="font-serif text-[2rem] leading-none">{day}</span>
      <span className={cn("mt-0.5 text-[0.6875rem]", tone === "dark" ? "text-ivory/60" : "text-muted-strong")}>{year}</span>
    </div>
  );
}

/** Large featured event card (image + details). */
export function FeaturedEventCard({ event }: { event: NHEvent }) {
  return (
    <article className="group relative grid overflow-hidden bg-navy text-ivory shadow-lift md:grid-cols-2">
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[26rem]">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            unoptimized={event.imageUrl.startsWith("data:")}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent md:bg-gradient-to-r md:from-transparent md:to-navy/30" />
      </div>
      <div className="relative flex flex-col p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">{eventCategoryLabels[event.category]}</span>
          {event.isDemo ? <Badge variant="sample-dark">Demonstration</Badge> : null}
        </div>
        <h3 className="mt-4 font-serif text-[2.1rem] leading-[1.05] sm:text-[2.5rem]">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <p className="mt-4 leading-relaxed text-ivory/72">{event.summary}</p>
        <dl className="mt-7 space-y-2.5 text-sm text-ivory/80">
          <div className="flex gap-3">
            <dt className="sr-only">Date and time</dt>
            <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <dd>
              {formatDate(event.startsAt, { weekday: "long" })} · {formatTime(event.startsAt)}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="sr-only">Venue</dt>
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            <dd>
              {event.venue}, {event.city}
            </dd>
          </div>
        </dl>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold text-gold">
          {event.registrationOpen ? "View details & register" : "View details"}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

/** Compact list row. */
export function EventRow({ event, past = false }: { event: NHEvent; past?: boolean }) {
  return (
    <article className="group relative flex gap-5 border-b border-line py-6 sm:gap-7">
      <DateTile iso={event.startsAt} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">{eventCategoryLabels[event.category]}</span>
          {event.isDemo ? <Badge variant="sample">Demonstration</Badge> : null}
          {past ? <Badge variant="outline">Past event</Badge> : null}
        </div>
        <h3 className="mt-1.5 font-serif text-[1.55rem] leading-tight text-navy transition-colors group-hover:text-gold-deep">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-muted-strong">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-gold-dark" aria-hidden /> {formatTime(event.startsAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-gold-dark" aria-hidden /> {event.venue}, {event.city}
          </span>
        </p>
      </div>
      <ArrowUpRight className="mt-2 hidden size-5 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-deep sm:block" aria-hidden />
    </article>
  );
}

/** Grid card for the events index. */
export function EventCard({ event, past = false }: { event: NHEvent; past?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col bg-card shadow-soft ring-1 ring-line/70 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className={cn("object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]", past && "grayscale-[35%]")}
            unoptimized={event.imageUrl.startsWith("data:")}
          />
        ) : null}
        <DateTile iso={event.startsAt} className="absolute left-4 top-4 shadow-soft" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">{eventCategoryLabels[event.category]}</span>
          {event.isDemo ? <Badge variant="sample">Demonstration</Badge> : null}
        </div>
        <h3 className="mt-2 font-serif text-[1.6rem] leading-tight text-navy">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-strong">{event.summary}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-5 text-[0.8125rem] text-muted-strong">
          <MapPin className="size-3.5 text-gold-dark" aria-hidden /> {event.venue}, {event.city}
        </p>
      </div>
    </article>
  );
}
