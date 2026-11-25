import {
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenText,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  Globe2,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartHandshake,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AboutHeritageTimeline,
  type ExperiencePhotoItem,
  NewtonHouseExperienceGallery,
  SuperintendentsShowcase,
  VoicesTestimonialsSection,
} from "@/components/about/about-interactive";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SampleNotice } from "@/components/layout/sample-notice";
import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { associationLeadershipRoles } from "@/data/about";
import { images } from "@/data/images";
import { getViewer } from "@/lib/auth";
import {
  getLiveCommunitySnapshot,
  listAssociationLeaders,
  listHeritageMilestones,
  listSuperintendents,
  listTestimonials,
} from "@/lib/data/about";
import { listArchiveItems } from "@/lib/data/community";
import { listGallery } from "@/lib/data/content";
import { cn, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Newton House & the Alumni Association",
  description:
    "Discover the story, heritage, hostel culture, superintendents, alumni community and leadership of the Newton House Alumni Association, Patna Science College, Patna University.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Newton House — More Than a Hostel. A Lifelong Bond.",
    description:
      "An enduring community shaped by friendships, shared experiences, ambition and memories that transcend generations.",
    url: "/about",
  },
};

const missionPoints = [
  {
    icon: Users,
    title: "Reconnect Alumni Across Generations",
    body: "Maintain a verified, privacy-first directory and batch network so residents from every decade can find one another.",
  },
  {
    icon: Landmark,
    title: "Preserve the History & Memories of Newton House",
    body: "Curate authentic photographs, batch records, superintendent rosters, and archival documents for future generations.",
  },
  {
    icon: Handshake,
    title: "Encourage Mentorship & Knowledge Sharing",
    body: "Connect experienced alumni across research, public service, technology, and industry with younger cohorts.",
  },
  {
    icon: GraduationCap,
    title: "Support Current Students Through Alumni Guidance",
    body: "Help current residents navigate higher education, competitive examinations, research fellowships, and career transitions.",
  },
  {
    icon: CalendarDays,
    title: "Organise Reunions & Community Initiatives",
    body: "Bring generations back through the arched gateway of Newton House for homecomings, lectures, and cultural evenings.",
  },
  {
    icon: HeartHandshake,
    title: "Strengthen Ties With the Institution",
    body: "Foster an enduring, constructive partnership between the alumni brotherhood, hostel administration, and Patna Science College.",
  },
];

const initiatives = [
  {
    icon: Users,
    title: "Alumni Network",
    description:
      "Search the verified directory and yearbook-inspired batch cohorts across Physics, Chemistry, Mathematics, Geology and allied sciences.",
    href: "/alumni",
    cta: "Explore Directory",
  },
  {
    icon: Handshake,
    title: "Mentorship Programme",
    description:
      "Structured career, research and civil-services mentorship connecting seasoned Newton House seniors with students and young alumni.",
    href: "/mentorship",
    cta: "Find a Mentor",
  },
  {
    icon: Archive,
    title: "Heritage Archive",
    description:
      "A living digital museum preserving historical photographs of the red-brick facade, illumination nights, superintendents and documents.",
    href: "/archive",
    cta: "Enter the Archive",
  },
  {
    icon: BookOpenText,
    title: "Alumni Stories",
    description:
      "Long-form editorial narratives, personal recollections and professional journeys written by the people who called Newton House home.",
    href: "/alumni/stories",
    cta: "Read Stories",
  },
  {
    icon: CalendarDays,
    title: "Reunions & Events",
    description:
      "Annual alumni meets in Patna, guest lectures, batch reunions and community gatherings with online RSVP and calendar exports.",
    href: "/events",
    cta: "View Calendar",
  },
  {
    icon: HandHeart,
    title: "Student Support",
    description:
      "Academic guidance, study-abroad counsel and career preparation initiatives organised by alumni volunteers for current residents.",
    href: "/mentorship#become-mentor",
    cta: "Support Residents",
  },
];

export default async function AboutPage() {
  const [viewer, gallery, snapshot] = await Promise.all([
    getViewer(),
    listGallery(),
    getLiveCommunitySnapshot(),
  ]);

  const milestones = listHeritageMilestones();
  const superintendents = listSuperintendents();
  const testimonials = listTestimonials();
  const leaders = listAssociationLeaders();
  const archivePhotos = listArchiveItems().filter((a) => a.mediaType === "photograph");
  const canContribute = Boolean(viewer.userId && (viewer.isApprovedMember || viewer.role));

  // Map existing Memories Gallery + Digital Heritage Archive items into the 6 Experience categories
  // without creating a duplicate media storage system.
  const experienceItems: ExperiencePhotoItem[] = [];
  const seenUrls = new Set<string>();

  const mapCategory = (slug: string, idx: number): ExperiencePhotoItem["category"] => {
    if (slug.includes("festival") || slug.includes("celebration") || slug.includes("cultural")) {
      return "Festivals & Celebrations";
    }
    if (slug.includes("reunion") || slug.includes("alumni") || slug.includes("batch")) {
      return "Reunions";
    }
    if (slug.includes("hostel-life") || slug.includes("life")) {
      return "Hostel Life";
    }
    if (slug.includes("archive") || slug.includes("vintage") || slug.includes("superintendent")) {
      return "Memories Across Generations";
    }
    if (slug.includes("architecture") || slug.includes("building")) {
      return idx % 2 === 0 ? "Campus Moments" : "Hostel Life";
    }
    return idx % 2 === 0 ? "Friendships" : "Memories Across Generations";
  };

  const aspects: ExperiencePhotoItem["aspect"][] = ["classic", "portrait", "landscape"];

  gallery.forEach((g, idx) => {
    seenUrls.add(g.imageUrl);
    experienceItems.push({
      id: `gal-${g.id}`,
      title: g.title,
      caption: g.caption,
      category: mapCategory(g.categorySlug, idx),
      imageUrl: g.imageUrl,
      year: g.year,
      sourceLabel: "Memories Gallery",
      aspect: aspects[idx % aspects.length],
    });
  });

  archivePhotos.forEach((a, idx) => {
    if (seenUrls.has(a.fileUrl)) return;
    seenUrls.add(a.fileUrl);
    experienceItems.push({
      id: `arch-${a.id}`,
      title: a.title,
      caption: a.description,
      category: mapCategory(a.categorySlug, idx + 1),
      imageUrl: a.fileUrl,
      year: a.yearVerified ? a.approximateYear : null,
      sourceLabel: "Digital Heritage Archive",
      aspect: aspects[(idx + 1) % aspects.length],
    });
  });

  // Ensure every one of the 6 experience categories has at least one authentic Newton House photograph
  const fallbackCards: Omit<ExperiencePhotoItem, "id">[] = [
    {
      title: "Morning Sun Over the Green-Shuttered Corridors",
      caption: "Daily life inside the three-storey red-brick residence of Newton House, Patna Science College.",
      category: "Hostel Life",
      imageUrl: images.facadeWestWing.src,
      year: null,
      sourceLabel: "Memories Gallery",
      aspect: "landscape",
    },
    {
      title: "Brotherhood Before the Arched Entrance",
      caption: "Residents and batchmates gathered together before the historic red-brick facade.",
      category: "Friendships",
      imageUrl: images.alumniGathering.src,
      year: null,
      sourceLabel: "Memories Gallery",
      aspect: "classic",
    },
    {
      title: "The Red-Brick Pilasters & Campus Grounds",
      caption: "The architectural silhouette of Newton House on the Patna Science College campus.",
      category: "Campus Moments",
      imageUrl: images.facadeCorner.src,
      year: null,
      sourceLabel: "Digital Heritage Archive",
      aspect: "portrait",
    },
    {
      title: "Newton House on Illumination Night",
      caption: "Strings of festive lights across all three storeys during a house celebration.",
      category: "Festivals & Celebrations",
      imageUrl: images.illuminated.src,
      year: null,
      sourceLabel: "Memories Gallery",
      aspect: "classic",
    },
    {
      title: "Generations Returning to the House",
      caption: "Alumni and residents standing together along the perimeter railings during a reunion meet.",
      category: "Reunions",
      imageUrl: images.heroExterior.src,
      year: null,
      sourceLabel: "Memories Gallery",
      aspect: "landscape",
    },
    {
      title: "Archival Print of the Main Gateway",
      caption: "Vintage sepia photograph preserving the arched main doorway through which every batch entered.",
      category: "Memories Across Generations",
      imageUrl: images.archiveEntrance.src,
      year: null,
      sourceLabel: "Digital Heritage Archive",
      aspect: "portrait",
    },
  ];

  fallbackCards.forEach((fb, i) => {
    if (!experienceItems.some((item) => item.category === fb.category)) {
      experienceItems.push({ ...fb, id: `fb-${i}` });
    }
  });

  return (
    <>
      {/* ================================================================
          SECTION 1: HERO — THE IDENTITY
          ================================================================ */}
      <section className="relative isolate flex min-h-[38rem] items-end overflow-hidden bg-navy pt-32 pb-16 text-ivory lg:min-h-[44rem] lg:pb-24">
        <Image
          src={images.heroExterior.src}
          alt={images.heroExterior.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-navy-ink via-navy/82 to-navy-ink/70"
        />
        <div aria-hidden className="absolute inset-0 navy-grain" />

        <div className="container-nh relative z-10">
          <Breadcrumbs items={[{ label: "About" }]} />

          <Reveal className="mt-6 max-w-4xl">
            <p className="eyebrow text-gold">Bound by Memories. United by Legacy.</p>
            <h1 className="mt-4 font-serif text-[clamp(2.6rem,5.4vw,4.75rem)] font-medium leading-[1.05] tracking-[-0.015em] text-ivory">
              More Than a Hostel. <span className="italic text-gold">A Lifelong Bond.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/82 sm:text-xl">
              An enduring community shaped by friendships, shared experiences, ambition and memories that transcend
              generations.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/join" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
                Join the Alumni Network <ArrowRight aria-hidden />
              </Link>
              <a
                href="#superintendents-title"
                className={cn(buttonVariants({ variant: "outline-light", size: "lg" }))}
              >
                Leadership &amp; Superintendents
              </a>
            </div>
          </Reveal>

          {/* Small Scroll Indicator */}
          <div className="mt-14 flex items-center justify-between border-t border-gold/15 pt-6 text-xs text-ivory/65">
            <a
              href="#our-story"
              className="group inline-flex items-center gap-2.5 font-label text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors hover:text-ivory"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full border border-gold/40 transition-transform group-hover:translate-y-0.5">
                <ArrowDown className="size-3.5" aria-hidden />
              </span>
              Scroll to Our Story
            </a>
            <span className="hidden font-serif italic text-ivory/65 sm:inline">
              Newton House · Patna Science College · Patna University
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2: OUR STORY — A HOME THAT SHAPES GENERATIONS
          ================================================================ */}
      <section id="our-story" aria-labelledby="story-title" className="paper bg-ivory py-24 lg:py-32">
        <div className="container-nh grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <SectionHeading
              id="story-title"
              eyebrow="Our Story"
              title="A Home That Shapes Generations"
              lead="Standing on the historic campus of Patna Science College, Newton House has been far more than a residential building — it is the place where young science scholars first found independence, discipline and brotherhood."
            />
            <div className="prose-nh mt-6 space-y-4 text-[1rem] leading-[1.8] text-ink/90">
              <p>
                Every academic year, students from towns and villages across Bihar and beyond step through the arched
                main doorway of Newton House to pursue physics, chemistry, mathematics, geology, botany, zoology and
                allied sciences at Patna Science College, Patna University. Within days, unfamiliar roommates become
                study partners, and seniors become mentors who pass down textbooks, laboratory notes and counsel.
              </p>
              <p>
                Life behind the red-brick facade and green-shuttered windows carries a rhythm of its own — early morning
                walks to practical laboratories, intense discussions along the corridors before university examinations,
                shared meals, and festive evenings when the entire building glows with strings of lights.
              </p>
              <p>
                The <strong>Newton House Alumni Association</strong> was formed so that this fellowship never ends at
                graduation. Whether an alumnus is leading a research laboratory, serving in public administration,
                teaching at a university, or building an enterprise, Newton House remains a permanent anchor of identity
                and mutual support for past and current residents alike.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                  Parent Institution
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-navy">Patna Science College</p>
              </div>
              <div>
                <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                  University
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-navy">Patna University</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                  Enduring Ethos
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-navy">Science &amp; Brotherhood</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="relative pb-10 sm:pr-6">
              <div className="relative aspect-[4/3] overflow-hidden bg-navy shadow-lift ring-1 ring-line">
                <Image
                  src={images.facadeCorner.src}
                  alt={images.facadeCorner.alt}
                  fill
                  sizes="(min-width: 1024px) 46vw, 95vw"
                  className="object-cover"
                />
              </div>

              {/* Small Photographic Inset */}
              <div className="mt-6 sm:absolute sm:-bottom-4 sm:-left-6 sm:mt-0 sm:w-60 print-frame print-frame--sepia sm:rotate-[-3deg]">
                <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                  <Image
                    src={images.archiveEntrance.src}
                    alt={images.archiveEntrance.alt}
                    fill
                    sizes="16rem"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 font-serif text-xs italic text-ink/80">
                  The arched main entrance of Newton House — archival print.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================
          SECTION 3: HISTORY & HERITAGE — A LEGACY ACROSS GENERATIONS
          ================================================================ */}
      <section
        id="history-heritage"
        aria-labelledby="heritage-title"
        className="relative overflow-hidden bg-navy py-24 text-ivory lg:py-32"
      >
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Reveal>
            <SectionHeading
              id="heritage-title"
              tone="dark"
              align="center"
              eyebrow="History & Heritage"
              title="A Legacy Across Generations"
              lead="Explore the chapters of Newton House across generations. In keeping with our commitment to historical accuracy, dates are published only when verified from official college records."
              className="mb-12"
            />
          </Reveal>

          <AboutHeritageTimeline milestones={milestones} />
        </div>
      </section>

      {/* ================================================================
          SECTION 4: SUPERINTENDENTS OF NEWTON HOUSE
          ================================================================ */}
      <section
        id="superintendents"
        aria-labelledby="superintendents-title"
        className="paper bg-ivory py-24 lg:py-32"
      >
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="superintendents-title"
              eyebrow="Hostel Stewardship & Academic Guidance"
              title="Those Who Guided Our Home"
              lead="Honouring the educators and administrators who have contributed to the life, discipline and development of Newton House."
            />
          </Reveal>

          <SampleNotice className="mt-8">
            <strong>Archival Integrity Notice:</strong> Newton House never fabricates the names, photographs,
            biographies, or tenure dates of its Superintendents. Placeholder profiles below indicate where official
            college verification is pending and can be updated at any time by authorised administrators in{" "}
            <Link href="/admin/about" className="font-semibold text-gold-deep underline-offset-4 hover:underline">
              Admin → About &amp; Heritage
            </Link>
            .
          </SampleNotice>

          <div className="mt-10">
            <SuperintendentsShowcase superintendents={superintendents} />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5: OUR VISION & MISSION
          ================================================================ */}
      <section
        id="vision-mission"
        aria-labelledby="vision-title"
        className="bg-card py-24 ring-1 ring-line/60 lg:py-32"
      >
        <div className="container-nh space-y-16">
          {/* OUR VISION */}
          <Reveal className="relative overflow-hidden bg-navy p-8 text-ivory shadow-lift sm:p-12 lg:p-16">
            <div aria-hidden className="absolute inset-0 navy-grain" />
            <div className="relative grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                  <Compass className="size-6" aria-hidden />
                </span>
                <p className="mt-5 font-label text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Our Vision
                </p>
                <h2 id="vision-title" className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
                  Carrying the Spirit Forward
                </h2>
              </div>
              <div className="border-t border-gold/20 pt-6 lg:col-span-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                <blockquote className="font-serif text-2xl italic leading-relaxed text-ivory sm:text-3xl lg:text-[2.15rem]">
                  “To preserve the spirit of Newton House and build a connected, supportive and inclusive alumni
                  community that carries its legacy into the future.”
                </blockquote>
              </div>
            </div>
          </Reveal>

          {/* OUR MISSION */}
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Our Mission"
                title="Six Commitments to the Newton House Brotherhood"
                lead="Every initiative of the Association is guided by six practical responsibilities toward our alumni, our current residents and our historic house."
              />
            </Reveal>

            <Stagger as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {missionPoints.map((m, idx) => (
                <StaggerItem
                  as="li"
                  key={m.title}
                  className="group relative flex flex-col justify-between border border-line bg-ivory/65 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold-dark/60 hover:bg-card hover:shadow-lift"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex size-11 items-center justify-center rounded-full bg-navy text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                        <m.icon className="size-5" aria-hidden />
                      </span>
                      <span className="font-serif text-2xl italic text-gold-deep/60">
                        0{idx + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl leading-snug text-navy">{m.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-strong">{m.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 6: THE NEWTON HOUSE EXPERIENCE
          ================================================================ */}
      <section
        id="experience"
        aria-labelledby="experience-title"
        className="paper bg-ivory py-24 lg:py-32"
      >
        <div className="container-nh">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionHeading
                id="experience-title"
                eyebrow="The Newton House Experience"
                title="Some Places Stay With You Forever."
                lead="Glimpses of hostel life, architectural heritage, illumination nights and homecomings — drawn directly from our Memories Gallery and Digital Heritage Archive."
              />
            </Reveal>
            <div className="flex flex-wrap gap-3">
              <Link href="/memories" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Memories Gallery
              </Link>
              <Link href="/archive" className={cn(buttonVariants({ variant: "navy", size: "sm" }))}>
                Digital Heritage Archive <ArrowRight aria-hidden />
              </Link>
            </div>
          </div>

          <NewtonHouseExperienceGallery items={experienceItems} />
        </div>
      </section>

      {/* ================================================================
          SECTION 7: OUR ALUMNI COMMUNITY — ONE HOME. MANY JOURNEYS.
          ================================================================ */}
      <section
        id="alumni-community"
        aria-labelledby="community-title"
        className="relative overflow-hidden bg-navy py-24 text-ivory lg:py-32"
      >
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative">
          <Reveal>
            <SectionHeading
              id="community-title"
              tone="dark"
              eyebrow="Our Alumni Community"
              title="One Home. Many Journeys."
              lead="From the laboratories of Patna Science College to universities, research institutes, civil services and enterprises across India and the world — every metric below is computed directly from our live directory database."
            />
          </Reveal>

          {snapshot.sampleCount > 0 ? (
            <SampleNotice tone="dark" className="mt-8">
              <strong>Live Database Transparency:</strong> The directory currently holds{" "}
              <strong>{snapshot.verifiedNonSampleCount}</strong> user-submitted verified record(s) alongside{" "}
              <strong>{snapshot.sampleCount}</strong> clearly badged <strong>Sample</strong> demonstration profiles. No
              unverified figures are inflated or invented. Only locations and professional domains where members opted
              into sharing (`showLocation` / `showProfessional`) are aggregated below.
            </SampleNotice>
          ) : null}

          {/* 4 Live Database Metric Cards */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-gold/20 bg-white/[0.04] p-7">
              <div className="flex items-center justify-between">
                <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  Registered Alumni
                </span>
                <Users className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-4 font-serif text-4xl text-ivory">
                {snapshot.verifiedNonSampleCount > 0
                  ? `${snapshot.verifiedNonSampleCount} Verified`
                  : `${snapshot.totalProfilesCount} Active`}
              </p>
              <p className="mt-2 text-xs text-ivory/70">
                {snapshot.verifiedNonSampleCount > 0
                  ? `Plus ${snapshot.sampleCount} sample preview records in the directory`
                  : `Live directory seeded with ${snapshot.sampleCount} clearly marked sample profiles`}
              </p>
            </div>

            <div className="border border-gold/20 bg-white/[0.04] p-7">
              <div className="flex items-center justify-between">
                <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  Batches Represented
                </span>
                <GraduationCap className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-4 font-serif text-4xl text-ivory">{snapshot.batchesCount}</p>
              <p className="mt-2 text-xs text-ivory/70">
                Residence cohorts indexed in the Newton House Batch Directory
              </p>
            </div>

            <div className="border border-gold/20 bg-white/[0.04] p-7">
              <div className="flex items-center justify-between">
                <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  Cities &amp; Countries
                </span>
                <Globe2 className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-4 font-serif text-4xl text-ivory">
                {snapshot.citiesCount} {snapshot.citiesCount === 1 ? "City" : "Cities"}
              </p>
              <p className="mt-2 text-xs text-ivory/70">
                Across {snapshot.countriesCount} {snapshot.countriesCount === 1 ? "country" : "countries"} (consented
                locations only)
              </p>
            </div>

            <div className="border border-gold/20 bg-white/[0.04] p-7">
              <div className="flex items-center justify-between">
                <span className="font-label text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  Professional Domains
                </span>
                <Briefcase className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-4 font-serif text-4xl text-ivory">{snapshot.domainsCount}</p>
              <p className="mt-2 text-xs text-ivory/70">
                Scientific, academic, public-service &amp; industry fields represented
              </p>
            </div>
          </div>

          {/* Geographical & Professional Distribution Visualisation */}
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {/* Geographical Footprint */}
            <div className="border border-gold/20 bg-white/[0.03] p-7 lg:col-span-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">
                    Privacy-Preserving Geographical Footprint
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-ivory">Where Newton House Alumni Reside</h3>
                </div>
                <MapPin className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-2 text-xs text-ivory/70">
                Aggregated strictly from profiles that enabled city visibility (`showLocation`). Individual street
                addresses or private contact details are never stored or displayed.
              </p>

              {snapshot.cityDistribution.length === 0 ? (
                <p className="mt-6 text-sm text-ivory/75">
                  Geographical distribution will populate as verified members opt in to share their city.
                </p>
              ) : (
                <ul className="mt-6 space-y-3.5">
                  {snapshot.cityDistribution.map((c) => {
                    const pct = snapshot.totalProfilesCount
                      ? Math.max(12, Math.round((c.count / snapshot.totalProfilesCount) * 100))
                      : 0;
                    return (
                      <li key={`${c.city}-${c.country}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ivory">
                            {c.city}, <span className="font-normal text-ivory/70">{c.country}</span>
                          </span>
                          <span className="font-mono text-gold">
                            {c.count} {c.count === 1 ? "profile" : "profiles"}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Professional Domains & Science Departments */}
            <div className="border border-gold/20 bg-white/[0.03] p-7 lg:col-span-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold">
                    Academic &amp; Professional Footprint
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-ivory">Fields of Contribution</h3>
                </div>
                <Sparkles className="size-5 text-gold" aria-hidden />
              </div>
              <p className="mt-2 text-xs text-ivory/70">
                Disciplines studied at Patna Science College and professional spheres represented across the network.
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    Professional Domains
                  </p>
                  <ul className="mt-3 space-y-2.5 text-xs">
                    {snapshot.domainDistribution.map((d) => (
                      <li
                        key={d.domain}
                        className="flex items-center justify-between border-b border-gold/10 pb-2 text-ivory/85"
                      >
                        <span>{d.domain}</span>
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[0.65rem] text-gold">
                          {d.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold/85">
                    Science Departments
                  </p>
                  <ul className="mt-3 space-y-2.5 text-xs">
                    {snapshot.departmentDistribution.map((d) => (
                      <li
                        key={d.department}
                        className="flex items-center justify-between border-b border-gold/10 pb-2 text-ivory/85"
                      >
                        <span>{d.department}</span>
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[0.65rem] text-gold">
                          {d.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 8: OUR INITIATIVES
          ================================================================ */}
      <section
        id="initiatives"
        aria-labelledby="initiatives-title"
        className="bg-card py-24 ring-1 ring-line/60 lg:py-32"
      >
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="initiatives-title"
              align="center"
              eyebrow="Our Initiatives"
              title="Six Pillars of the Digital Heritage Platform"
              lead="Built to serve every generation of Newton House — from preserving archival photographs to mentoring current students at Patna Science College."
            />
          </Reveal>

          <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item) => (
              <StaggerItem
                as="li"
                key={item.title}
                className="group flex flex-col justify-between border border-line bg-ivory/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold-dark hover:bg-card hover:shadow-lift"
              >
                <div>
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-navy text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-6 font-serif text-2xl text-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-strong">{item.description}</p>
                </div>

                <Link
                  href={item.href}
                  className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep group-hover:text-navy"
                >
                  {item.cta}
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================================================================
          SECTION 9: VOICES OF NEWTON HOUSE — STORIES THAT STAY WITH US
          ================================================================ */}
      <section
        id="voices"
        aria-labelledby="voices-title"
        className="paper bg-ivory py-24 lg:py-32"
      >
        <div className="container-nh">
          <Reveal>
            <SectionHeading
              id="voices-title"
              eyebrow="Voices of Newton House"
              title="Stories That Stay With Us"
              lead="Short reflections and memories contributed by alumni of Newton House. Only reflections approved by administrators and contributors are published here."
            />
          </Reveal>

          <SampleNotice className="mt-8">
            <strong>Editorial Verification:</strong> Reflections badged <strong>Sample</strong> illustrate the
            testimonial showcase. Verified members can submit their own reflection below for moderator approval.
          </SampleNotice>

          <div className="mt-10">
            <VoicesTestimonialsSection
              testimonials={testimonials}
              canSubmit={canContribute}
              viewerAlumni={viewer.alumni}
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 10: ASSOCIATION LEADERSHIP
          ================================================================ */}
      <section
        id="association-leadership"
        aria-labelledby="leadership-title"
        className="bg-card py-24 ring-1 ring-line/60 lg:py-32"
      >
        <div className="container-nh">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-8">
              <SectionHeading
                id="leadership-title"
                eyebrow="Association Governance"
                title="The People Behind the Community"
                lead="The Newton House Alumni Association is governed by elected and nominated alumni volunteers alongside faculty advisors. Association governance is distinct from Hostel Administration (led by the Superintendent of Newton House)."
              />
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4 lg:text-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ivory px-4 py-2 text-xs font-semibold text-navy">
                <ShieldCheck className="size-4 text-gold-dark" aria-hidden />
                Only Officially Confirmed Office-Bearers Displayed
              </span>
            </Reveal>
          </div>

          {/* Confirmed & Published Leaders (if any have been verified in /admin/about) */}
          {leaders.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {leaders.map((leader) => (
                <article
                  key={leader.id}
                  className="flex flex-col bg-ivory/70 p-6 shadow-soft ring-1 ring-line transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-center gap-3.5">
                    {leader.photoUrl ? (
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-navy">
                        <Image
                          src={leader.photoUrl}
                          alt={leader.fullName}
                          fill
                          sizes="3.5rem"
                          className="object-cover"
                          unoptimized={leader.photoUrl.startsWith("data:")}
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy font-serif text-lg font-semibold text-gold">
                        {initials(leader.fullName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-label text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                        {leader.role}
                      </p>
                      <h3 className="mt-0.5 truncate font-serif text-xl text-navy">{leader.fullName}</h3>
                      {leader.batchYear ? (
                        <p className="text-xs text-muted-strong">
                          {leader.department ? `${leader.department} · ` : ""}Class of {leader.batchYear}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {leader.designation ? (
                    <p className="mt-4 text-xs font-medium text-ink">{leader.designation}</p>
                  ) : null}
                  {leader.bio ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted-strong">{leader.bio}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {/* Constitutional Offices Grid — shows confirmed status or transparent awaiting-confirmation state */}
          <div className="mt-12">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-2xl text-navy">Constitutional Offices &amp; Committees</h3>
              <p className="text-xs text-muted-strong">
                Managed by authorised administrators in{" "}
                <Link href="/admin/about" className="font-semibold text-gold-deep hover:underline">
                  Admin → About &amp; Heritage
                </Link>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {associationLeadershipRoles.map((office) => {
                const confirmedForRole = leaders.filter((l) => l.role === office.role);
                return (
                  <div
                    key={office.role}
                    className="flex flex-col justify-between border border-line bg-ivory/40 p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Building2 className="size-4 text-gold-dark" aria-hidden />
                        {confirmedForRole.length > 0 ? (
                          <Badge variant="success">Confirmed ({confirmedForRole.length})</Badge>
                        ) : (
                          <Badge variant="neutral">Awaiting Confirmation</Badge>
                        )}
                      </div>
                      <h4 className="mt-4 font-serif text-xl text-navy">{office.role}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted-strong">{office.description}</p>
                    </div>

                    <div className="mt-4 border-t border-line pt-3 text-xs">
                      {confirmedForRole.length > 0 ? (
                        <p className="font-semibold text-navy">
                          {confirmedForRole.map((c) => c.fullName).join(", ")}
                        </p>
                      ) : (
                        <p className="italic text-muted-strong">
                          Official office-bearer profile will appear once confirmed by the Executive Committee.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 11: FINAL CALL TO ACTION
          ================================================================ */}
      <section
        aria-labelledby="about-cta-title"
        className="relative isolate overflow-hidden bg-navy py-24 text-ivory lg:py-32"
      >
        <Image
          src={images.illuminated.src}
          alt={images.illuminated.alt}
          fill
          sizes="100vw"
          className="object-cover object-center opacity-28"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-navy-ink/95 via-navy/88 to-navy-ink/90"
        />
        <div aria-hidden className="absolute inset-0 navy-grain" />

        <div className="container-nh relative z-10 text-center">
          <Reveal className="mx-auto max-w-3xl">
            <p className="eyebrow text-gold">Newton House Alumni Association</p>
            <h2
              id="about-cta-title"
              className="mt-4 font-serif text-[clamp(2.25rem,4.5vw,3.85rem)] font-medium leading-[1.08] text-ivory"
            >
              Your Journey Began Here. <span className="italic text-gold">Your Connection Never Ends.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory/80 sm:text-lg">
              Reconnect with old friends, rediscover your memories and help preserve the legacy of Newton House for
              generations to come.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/join" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
                Join the Alumni Network <ArrowRight aria-hidden />
              </Link>
              <Link href="/memories" className={cn(buttonVariants({ variant: "outline-light", size: "lg" }))}>
                <BookOpen className="size-4" aria-hidden /> Explore Our Memories
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
