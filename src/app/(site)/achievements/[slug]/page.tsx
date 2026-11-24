import { ArrowLeft, BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Portrait } from "@/components/alumni/portrait";
import { Reveal } from "@/components/animations/reveal";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { categoryName } from "@/data/achievements";
import { getAchievement, listAchievements } from "@/lib/data/content";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateStaticParams() {
  return (await listAchievements()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAchievement(slug);
  if (!a) return { title: "Achievement" };
  return {
    title: a.name,
    description: a.summary,
    alternates: { canonical: `/achievements/${a.slug}` },
    robots: a.isSample ? { index: false, follow: true } : undefined,
    openGraph: { title: a.name, description: a.summary, url: `/achievements/${a.slug}` },
  };
}

export default async function AchievementDetailPage({ params }: Props) {
  const { slug } = await params;
  const a = await getAchievement(slug);
  if (!a) notFound();
  const more = (await listAchievements()).filter((x) => x.id !== a.id && x.category === a.category).slice(0, 2);

  return (
    <>
      <section className="relative bg-navy pb-40 pt-36 text-ivory lg:pt-40">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Breadcrumbs items={[{ label: "Achievements", href: "/achievements" }, { label: a.name }]} />
        </div>
      </section>
      <article className="paper bg-ivory pb-24">
        <div className="container-nh -mt-28 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="bg-card p-3 shadow-lift">
              <Portrait name={a.isSample ? "Sample Profile" : a.name} photoUrl={a.portraitUrl} className="aspect-[4/5]" textClassName="text-7xl" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-8 lg:pt-32">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow text-gold-deep">{categoryName(a.category)}</p>
              {a.isSample ? <Badge variant="sample">Sample profile</Badge> : null}
              {a.verified ? (
                <Badge variant="success">
                  <BadgeCheck className="size-3" aria-hidden /> Verified
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-4 text-5xl leading-[1.02] text-navy sm:text-6xl">{a.name}</h1>
            <p className="mt-3 text-lg text-ink/80">
              {a.designation} · {a.organisation}
              {a.graduationYear ? ` · Class of ${a.graduationYear}` : ""}
            </p>
            <p className="mt-8 max-w-2xl border-l border-gold pl-6 font-serif text-2xl italic leading-snug text-navy">{a.summary}</p>
            {a.isSample ? (
              <SampleNotice className="mt-8 max-w-2xl">
                Demonstration content only — no real person, honour or affiliation is described on this page.
              </SampleNotice>
            ) : null}
            <div className="prose-nh mt-8 max-w-2xl">
              {a.biography.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link href="/achievements" className={cn(buttonVariants({ variant: "outline" }), "mt-10")}>
              <ArrowLeft aria-hidden /> All achievements
            </Link>
          </Reveal>
        </div>
        {more.length ? (
          <div className="container-nh mt-24">
            <h2 className="font-serif text-3xl text-navy">More in {categoryName(a.category)}</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {more.map((m) => (
                <li key={m.id}>
                  <AchievementCard a={m} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    </>
  );
}
