import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { absoluteUrl } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/** Visible breadcrumb trail plus BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-label text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ivory/60">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="transition-colors hover:text-gold">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-gold" : undefined}>
                  {c.label}
                </span>
              )}
              {!last ? <ChevronRight className="size-3 opacity-60" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
