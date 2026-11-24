"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { mainNav, type NavItem } from "@/data/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  return [item.href, ...(item.match ?? [])].some((b) => pathname === b || pathname.startsWith(`${b}/`));
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[70] -translate-y-24 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled
            ? "bg-navy/[0.96] shadow-[0_1px_0_rgb(214_173_104_/_0.14),0_12px_32px_-18px_rgb(0_0_0_/_0.6)] backdrop-blur-md"
            : "bg-gradient-to-b from-navy-ink/70 via-navy-ink/25 to-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "container-nh flex items-center justify-between gap-6 transition-[height] duration-500",
            scrolled ? "h-[4.5rem]" : "h-[5.5rem] lg:h-24",
          )}
        >
          <Logo tone="light" />

          <ul className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex items-center gap-1 px-3.5 py-2 font-sans text-[0.875rem] font-medium tracking-[0.01em] transition-colors duration-300",
                      active ? "text-gold" : "text-ivory/80 hover:text-ivory",
                    )}
                  >
                    {item.label}
                    {item.children ? (
                      <ChevronDown aria-hidden className="size-3.5 opacity-60 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
                    ) : null}
                    {active ? (
                      <m.span
                        layoutId="nav-active"
                        className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    ) : (
                      <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-ivory/40 transition-transform duration-300 group-hover:scale-x-100" />
                    )}
                  </Link>

                  {item.children ? (
                    <div className="invisible absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="overflow-hidden rounded-lg border border-gold/15 bg-navy/[0.98] p-2 shadow-[0_24px_48px_-20px_rgb(0_0_0_/_0.7)] backdrop-blur-md">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="group/item flex items-start justify-between gap-3 rounded-md px-3.5 py-3 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05]"
                            >
                              <span>
                                <span className="block text-sm font-semibold text-ivory">{c.label}</span>
                                {c.description ? <span className="mt-0.5 block text-xs leading-relaxed text-ivory/60">{c.description}</span> : null}
                              </span>
                              <ArrowRight aria-hidden className="mt-0.5 size-3.5 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link href="/join" className={cn(buttonVariants({ variant: "gold", size: "sm" }), "hidden sm:inline-flex")}>
              Join Network
              <ArrowRight aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-full text-ivory transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <MobileNav open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}

function MobileNav({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-navy navy-grain lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="container-nh flex h-[5.5rem] shrink-0 items-center justify-between">
            <Logo tone="light" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex size-11 items-center justify-center rounded-full text-ivory hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <m.ul
            className="container-nh mt-4 flex-1 divide-y divide-gold/10 border-t border-gold/10"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
          >
            {mainNav.map((item) => {
              const active = isActive(pathname, item);
              const isOpen = expanded === item.label;
              return (
                <m.li
                  key={item.label}
                  variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex-1 py-4 font-serif text-[1.85rem] leading-none", active ? "text-gold" : "text-ivory")}
                    >
                      {item.label}
                    </Link>
                    {item.children ? (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label} links`}
                        className="inline-flex size-11 items-center justify-center rounded-full text-ivory/70 hover:bg-white/10"
                      >
                        <ChevronDown className={cn("size-5 transition-transform duration-300", isOpen && "rotate-180")} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                  <AnimatePresence initial={false}>
                    {item.children && isOpen ? (
                      <m.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} onClick={onClose} className="block py-2.5 pl-4 text-[0.95rem] text-ivory/75 hover:text-gold">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                        <li className="h-3" aria-hidden />
                      </m.ul>
                    ) : null}
                  </AnimatePresence>
                </m.li>
              );
            })}
          </m.ul>

          <div className="container-nh shrink-0 pb-10 pt-8">
            <Link href="/join" onClick={onClose} className={cn(buttonVariants({ variant: "gold", size: "lg" }), "w-full")}>
              Join the Alumni Network <ArrowRight aria-hidden />
            </Link>
            <p className="mt-6 text-center font-serif text-lg italic text-gold/80">Bound by Memories. United by Legacy.</p>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
