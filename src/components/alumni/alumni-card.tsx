import { MapPin } from "lucide-react";
import Link from "next/link";
import { LinkedInIcon } from "@/components/brand/social-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlumniProfile } from "@/types";
import { Portrait } from "./portrait";

export function AlumniCard({ alum, className }: { alum: AlumniProfile; className?: string }) {
  const role = [alum.designation, alum.organisation].filter(Boolean).join(", ");
  const place = [alum.city, alum.country && alum.country !== "India" && alum.country !== alum.city ? alum.country : null].filter(Boolean).join(", ");
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col bg-card shadow-soft ring-1 ring-line/70 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <Portrait name={alum.fullName} photoUrl={alum.photoUrl} className="aspect-[4/4.4]" />
      {alum.isSample ? <Badge variant="sample-dark" className="absolute left-3 top-3 bg-navy/70 backdrop-blur-sm">Sample record</Badge> : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-[1.45rem] leading-tight text-navy">
          <Link href={`/alumni/${alum.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {alum.fullName}
          </Link>
        </h3>
        <p className="mt-1 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {alum.department} · Class of {alum.graduationYear}
        </p>
        {role ? <p className="mt-3 text-sm leading-snug text-ink/85">{role}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {place ? (
            <p className="flex items-center gap-1.5 text-[0.8125rem] text-muted-strong">
              <MapPin className="size-3.5 text-gold-dark" aria-hidden /> {place}
            </p>
          ) : (
            <span />
          )}
          {alum.linkedinUrl ? (
            <a
              href={alum.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${alum.fullName} on LinkedIn`}
              className="relative z-10 inline-flex size-8 items-center justify-center rounded-full text-muted-strong transition-colors hover:bg-navy hover:text-gold"
            >
              <LinkedInIcon className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}
