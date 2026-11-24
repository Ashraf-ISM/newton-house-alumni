import type { StatMetric } from "@/types";

/**
 * Central, editable site configuration.
 * Anything marked `null` is intentionally unset until the Association
 * supplies verified information — the UI renders a graceful placeholder
 * rather than an invented value.
 */
export const siteConfig = {
  name: "Newton House",
  institution: "Patna Science College",
  association: "Newton House Alumni Association",
  tagline: "Bound by Memories. United by Legacy.",
  statement: "The Home. The Memories. The Brotherhood.",
  description:
    "Celebrating the journey, friendships, achievements and lifelong connections of Newton House, Patna Science College.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",

  contact: {
    addressLines: ["Newton House, Patna Science College", "Ashok Rajpath, Patna, Bihar 800005", "India"],
    /** Set once an official mailbox is confirmed. The contact form works regardless. */
    email: null as string | null,
    phone: null as string | null,
  },

  /**
   * Official social channels. Only entries with a verified `href` are rendered,
   * so no placeholder link ever points nowhere.
   */
  social: [
    { key: "linkedin", label: "LinkedIn", href: null },
    { key: "youtube", label: "YouTube", href: null },
    { key: "instagram", label: "Instagram", href: null },
    { key: "x", label: "X (Twitter)", href: null },
    { key: "facebook", label: "Facebook", href: null },
  ] as { key: "linkedin" | "youtube" | "instagram" | "x" | "facebook"; label: string; href: string | null }[],
} as const;

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}
export interface NavItem {
  label: string;
  href: string;
  /** Additional path prefixes that mark this item active. */
  match?: string[];
  children?: NavChild[];
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About the Association", href: "/about", description: "Purpose, values and the people behind it" },
      { label: "Contact", href: "/contact", description: "Write to the Association" },
    ],
  },
  {
    label: "Legacy",
    href: "/legacy",
    match: ["/archive"],
    children: [
      { label: "Our Legacy", href: "/legacy", description: "History, traditions and chapters of the house" },
      { label: "Digital Heritage Archive", href: "/archive", description: "Historical photographs, documents and records" },
    ],
  },
  {
    label: "Alumni",
    href: "/alumni",
    match: ["/achievements", "/join", "/portal", "/member", "/mentorship", "/login"],
    children: [
      { label: "Alumni Directory", href: "/alumni", description: "Find fellow residents across generations" },
      { label: "Batch Directory", href: "/alumni/batches", description: "Explore Newton House cohorts by year" },
      { label: "Alumni Stories", href: "/alumni/stories", description: "Voices, memories and professional journeys" },
      { label: "Mentorship Network", href: "/mentorship", description: "Career guidance across generations" },
      { label: "Achievements", href: "/achievements", description: "Celebrating notable alumni" },
      { label: "Member Dashboard", href: "/member/dashboard", description: "Connections, notifications and privacy" },
      { label: "Join the Network", href: "/join", description: "Register as a Newton House alumnus" },
    ],
  },
  { label: "Memories", href: "/memories" },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming Events", href: "/events#upcoming", description: "Reunions, lectures and gatherings" },
      { label: "Past Events", href: "/events#past", description: "Galleries from earlier gatherings" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  quick: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Legacy", href: "/legacy" },
    { label: "Memories", href: "/memories" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Alumni Directory", href: "/alumni" },
    { label: "Batch Directory", href: "/alumni/batches" },
    { label: "Alumni Stories", href: "/alumni/stories" },
    { label: "Digital Heritage Archive", href: "/archive" },
    { label: "Mentorship Network", href: "/mentorship" },
    { label: "Achievements", href: "/achievements" },
    { label: "Member Dashboard", href: "/member/dashboard" },
    { label: "Join the Network", href: "/join" },
    { label: "Member Sign In", href: "/login" },
  ],
};

/**
 * Community impact metrics. `value: null` renders as "awaiting verification".
 * Replace with verified figures only — they animate automatically once set.
 */
export const impactStats: StatMetric[] = [
  { key: "alumni", label: "Alumni Network", value: null, suffix: "+", caption: "Registered members" },
  { key: "heritage", label: "Years of Heritage", value: null, suffix: "+", caption: "Of residence & tradition" },
  { key: "achievements", label: "Alumni Achievements", value: null, suffix: "+", caption: "Recognised honours" },
  { key: "global", label: "Global Connections", value: null, suffix: "", caption: "Cities & countries" },
];
