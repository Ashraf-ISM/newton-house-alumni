import { Clock, MapPin, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/animations/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { images } from "@/data/images";
import { siteConfig } from "@/data/site";
import { paramValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to the Newton House Alumni Association — reunions, directory help, photograph and memory submissions, and nominations.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact the Newton House Alumni Association", url: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const subject = paramValue(sp.subject);
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Write to the <span className="italic text-gold">Association</span>
          </>
        }
        lead="Questions about reunions, the directory or your profile — or photographs and memories you would like to share. We read every message."
        crumbs={[{ label: "Contact" }]}
        image={images.facadeCorner}
        compact
      />
      <section className="paper bg-ivory py-16 lg:py-24">
        <div className="container-nh grid gap-12 lg:grid-cols-12">
          <Reveal className="space-y-8 lg:col-span-4">
            <div>
              <h2 className="font-serif text-3xl text-navy">Newton House</h2>
              <p className="mt-1 text-sm text-muted-strong">{siteConfig.association}</p>
            </div>
            <ul className="space-y-6 text-[0.9375rem]">
              <li className="flex gap-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                <address className="not-italic leading-relaxed text-ink">
                  {siteConfig.contact.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex gap-4">
                <MessageSquare className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                <p className="leading-relaxed text-ink">
                  {siteConfig.contact.email ? (
                    <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-gold-deep hover:underline">
                      {siteConfig.contact.email}
                    </a>
                  ) : (
                    "Use the form — messages go directly to the Association’s volunteers."
                  )}
                </p>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-0.5 size-5 shrink-0 text-gold-dark" aria-hidden />
                <p className="leading-relaxed text-ink">We aim to reply within a few working days.</p>
              </li>
            </ul>
            <div className="print-frame rotate-[-2deg]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={images.mainEntrance.src} alt={images.mainEntrance.alt} fill sizes="(min-width: 1024px) 26vw, 90vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="bg-card p-6 shadow-soft ring-1 ring-line/70 sm:p-10">
              <h2 className="font-serif text-3xl text-navy">Send a message</h2>
              <p className="mt-2 text-sm text-muted-strong">Your email is used only to reply to you.</p>
              <div className="mt-8">
                <ContactForm defaultSubject={subject} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
