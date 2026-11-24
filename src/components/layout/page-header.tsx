import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/animations/reveal";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/**
 * Inner-page header: navy field with a cinematic slice of real Newton House
 * photography on the right, breadcrumbs, eyebrow and editorial title.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  image = images.heroExterior,
  imagePosition = "center",
  children,
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs: Crumb[];
  image?: { src: string; alt: string } | null;
  imagePosition?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-navy text-ivory", compact ? "pb-14 pt-36 lg:pt-40" : "pb-16 pt-36 sm:pb-20 lg:pb-24 lg:pt-44")}>
      {image ? (
        <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%]">
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            quality={75}
            className="object-cover opacity-45 lg:opacity-80"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />
        </div>
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-20 navy-grain" />
      <div className="container-nh">
        <Breadcrumbs items={crumbs} />
        <Reveal className="mt-8 max-w-3xl" y={20}>
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="mt-5 text-[2.75rem] leading-[1] sm:text-6xl lg:text-[4.5rem]">{title}</h1>
          {lead ? <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ivory/75 sm:text-lg">{lead}</p> : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
