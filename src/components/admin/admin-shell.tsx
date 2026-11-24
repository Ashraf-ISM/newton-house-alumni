"use client";

import { Award, CalendarDays, Images, Inbox, LayoutDashboard, LogOut, Mail, Megaphone, Menu, ShieldCheck, Users, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { Emblem } from "@/components/brand/emblem";
import { cn } from "@/lib/utils";
import { Toaster } from "./toaster";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/alumni", label: "Alumni", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/subscribers", label: "Newsletter", icon: Mail },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
];

export function AdminShell({ children, email, demo, pendingCount }: { children: ReactNode; email: string | null; demo: boolean; pendingCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-6 py-6">
        <Emblem className="size-10 text-gold" />
        <span className="leading-tight">
          <span className="block font-serif text-lg font-semibold tracking-[0.05em] text-ivory">NEWTON HOUSE</span>
          <span className="block font-label text-[0.6rem] tracking-[0.2em] text-gold/80">ADMIN</span>
        </span>
      </Link>
      <nav aria-label="Admin" className="mt-2 flex-1 space-y-0.5 px-3">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(n.href) ? "bg-white/[0.07] text-gold" : "text-ivory/70 hover:bg-white/[0.04] hover:text-ivory",
            )}
          >
            <n.icon className="size-4" aria-hidden />
            {n.label}
            {n.href === "/admin/alumni" && pendingCount ? (
              <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-navy">{pendingCount}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gold/10 px-6 py-5 text-xs text-ivory/55">
        <p className="truncate font-medium text-ivory/80">{email ?? "—"}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-gold/80 hover:text-gold">
            View website <ExternalLink className="size-3" aria-hidden />
          </Link>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-1 text-ivory/65 hover:text-gold">
              <LogOut className="size-3" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-navy lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-navy-ink/60" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy shadow-lift">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-5 inline-flex size-10 items-center justify-center text-ivory" aria-label="Close menu">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-ivory/95 px-5 backdrop-blur-md sm:px-8">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-ink/5 lg:hidden" aria-label="Open admin menu">
            <Menu className="size-5" />
          </button>
          <p className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-strong">Newton House Alumni Association</p>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3efe6] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#22553a]">
              <ShieldCheck className="size-3" aria-hidden /> Authorised Admin
            </span>
            {demo ? <span className="hidden rounded-full border border-dashed border-gold-dark/60 bg-gold/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-deep sm:inline-flex">Local Store</span> : null}
          </div>
        </header>
        <main id="main" className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
