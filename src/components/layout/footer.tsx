import { Heart, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ArchitecturalLineArt } from "@/components/brand/line-art";
import { socialIconMap } from "@/components/brand/social-icons";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { footerNav, siteConfig } from "@/data/site";

export function Footer() {
  const socials = siteConfig.social.filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy-ink text-ivory" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
      <ArchitecturalLineArt className="absolute -bottom-6 right-[-4rem] w-[34rem] text-gold/[0.09] sm:right-0 lg:w-[40rem]" />

      <div className="container-nh relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-6 max-w-xs font-serif text-xl italic leading-snug text-gold">{siteConfig.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/65">
            The official home of the {siteConfig.association}, connecting every generation of residents of Newton House,{" "}
            {siteConfig.institution}.
          </p>
        </div>

        <nav aria-label="Quick links" className="lg:col-span-2">
          <h3 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Quick Links</h3>
          <ul className="mt-5 space-y-2.5">
            {footerNav.quick.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-sm text-ivory/75 transition-colors hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Alumni resources" className="lg:col-span-2">
          <h3 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Alumni</h3>
          <ul className="mt-5 space-y-2.5">
            {footerNav.resources.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-sm text-ivory/75 transition-colors hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2 lg:col-span-4">
          <h3 className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Stay Updated</h3>
          <p className="mt-5 text-sm text-ivory/70">Reunion dates, alumni news and new memories from the archive.</p>
          <NewsletterForm className="mt-4 max-w-md" />

          <h3 className="mt-6 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold">Connect</h3>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-ivory/70">
            <p className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold/80" aria-hidden />
              <span>{siteConfig.contact.addressLines.slice(0, 2).join(", ")}</span>
            </p>
            <p className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold/80" aria-hidden />
              {siteConfig.contact.email ? (
                <a href={`mailto:${siteConfig.contact.email}`} className="link-underline hover:text-ivory">
                  {siteConfig.contact.email}
                </a>
              ) : (
                <Link href="/contact" className="link-underline hover:text-ivory">
                  Write to the Association
                </Link>
              )}
            </p>
          </address>
          {socials.length ? (
            <ul className="mt-5 flex gap-2" aria-label="Social media">
              {socials.map((s) => {
                const Icon = socialIconMap[s.key];
                return (
                  <li key={s.key}>
                    <a
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-gold/20 text-ivory/80 transition-colors hover:border-gold hover:text-gold"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="relative border-t border-gold/10">
        <div className="container-nh flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-ivory/55 sm:flex-row sm:text-left">
          <p>
            © {year} Newton House Alumni Association | Patna Science College. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="size-3.5 fill-brick text-brick" aria-label="love" /> for the Newton House community
          </p>
        </div>
      </div>
    </footer>
  );
}
