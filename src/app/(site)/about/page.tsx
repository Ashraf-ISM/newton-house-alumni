import { ArrowRight, BookOpen, HandHeart, Landmark, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/layout/section-heading";
import { CommunityCTA } from "@/components/sections/community-cta";
import { buttonVariants } from "@/components/ui/button";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About the Association",
  description:
    "The Newton House Alumni Association connects every generation of residents of Newton House, Patna Science College — preserving its heritage and supporting its community.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About the Newton House Alumni Association", url: "/about" },
};

const pillars = [
  { icon: Landmark, title: "Preserve the Heritage", body: "Keep the story of the house — its building, its traditions and its people — recorded, verified and shared." },
  { icon: Users, title: "Reconnect Generations", body: "A verified directory and regular reunions so that residents of every era can find one another again." },
  { icon: BookOpen, title: "Mentor & Guide", body: "Alumni share experience with current residents and recent graduates as they choose their paths." },
  { icon: HandHeart, title: "Give Back", body: "Support for the house and its residents, organised transparently through the Association." },
];

const commitments = [
  "Every alumni profile is reviewed by the Association before it is published.",
  "Members decide who can see their profile: everyone, members only, or nobody.",
  "Email addresses and phone numbers are never shown without explicit consent.",
  "Historical dates, figures and achievements are published only once verified.",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About the Association"
        title={
          <>
            The Home. The Memories. <span className="italic text-gold">The Brotherhood.</span>
          </>
        }
        lead="The Newton House Alumni Association brings together former residents of Newton House, Patna Science College, to keep a shared home alive long after the last night in its rooms."
        crumbs={[{ label: "About" }]}
        image={images.mainEntrance}
      />

      <section className="paper bg-ivory py-24 lg:py-32">
        <div className="container-nh grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <SectionHeading
              eyebrow="Who we are"
              title="More than a hostel. A shared beginning."
              lead="For many of us, Newton House was the first home away from home — the place where classmates became brothers and where the habits of a scientific life took root."
            />
            <div className="prose-nh mt-6 max-w-xl">
              <p>
                The Association exists so that bond does not end at graduation. We maintain a verified record of alumni, organise reunions and
                lectures, keep an open archive of photographs and memories, and connect experienced alumni with those just starting out.
              </p>
              <p>
                We are run by alumni volunteers. Everything published on this platform is reviewed so that the record of the house remains
                accurate and trustworthy.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden shadow-lift">
                <Image src={images.facadeCorner.src} alt={images.facadeCorner.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-4 hidden w-56 print-frame rotate-[-4deg] sm:block">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={images.archiveEntrance.src} alt={images.archiveEntrance.alt} fill sizes="14rem" className="object-cover" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-card py-24 lg:py-32" aria-labelledby="pillars-title">
        <div className="container-nh">
          <Reveal>
            <SectionHeading id="pillars-title" align="center" eyebrow="Our Purpose" title="Four commitments to the house" />
          </Reveal>
          <Stagger as="ul" className="mt-16 grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <StaggerItem as="li" key={p.title} className="bg-card p-8 lg:p-10">
                <p.icon className="size-8 text-gold-dark" strokeWidth={1.25} aria-hidden />
                <h3 className="mt-6 font-serif text-2xl text-navy">{p.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-strong">{p.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-navy py-24 text-ivory lg:py-32" aria-labelledby="trust-title">
        <div className="container-nh grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              id="trust-title"
              tone="dark"
              eyebrow="Privacy & Trust"
              title="A record you can rely on"
              lead="An alumni network is only as valuable as it is trustworthy. These principles govern everything on this platform."
            />
          </Reveal>
          <Stagger as="ol" className="space-y-px lg:col-span-7">
            {commitments.map((c, i) => (
              <StaggerItem as="li" key={c} className="flex gap-6 border-b border-gold/10 py-6">
                <span className="font-serif text-3xl italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1.5 text-[1.0625rem] leading-relaxed text-ivory/80">{c}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-ivory py-24 lg:py-28" aria-labelledby="committee-title">
        <div className="container-nh grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <SectionHeading
              id="committee-title"
              eyebrow="Governance"
              title="The Executive Committee"
              lead="The names and roles of the Association’s office-bearers will be published here once confirmed by the committee. Until then, the Association can be reached through the contact form."
            />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href="/contact" className={cn(buttonVariants({ variant: "navy", size: "lg" }))}>
              Contact the Association <ArrowRight aria-hidden />
            </Link>
            <Link href="/legacy" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Our legacy
            </Link>
          </Reveal>
        </div>
      </section>

      <CommunityCTA />
    </>
  );
}
