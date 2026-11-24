/**
 * Photography registry. Every image used on the site is declared here,
 * with intrinsic dimensions and descriptive alt text.
 *
 * To upgrade a photograph, drop a higher-resolution original at the same
 * path (any aspect ratio close to the original) and update width/height.
 * See docs/PHOTOGRAPHY.md for the full replacement guide.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const images = {
  heroExterior: {
    src: "/images/hero/newton-house-exterior.webp",
    width: 1388,
    height: 1020,
    alt: "The red-brick facade of Newton House with rows of green-shuttered windows behind its iron railings, Patna Science College",
  },
  facadeCorner: {
    src: "/images/hostel/facade-corner.webp",
    width: 848,
    height: 780,
    alt: "Corner of the Newton House building showing its brick pilasters and green windows against a blue sky",
  },
  facadeWestWing: {
    src: "/images/hostel/facade-west-wing.webp",
    width: 860,
    height: 540,
    alt: "The long wing of Newton House with three storeys of green-shuttered windows",
  },
  mainEntrance: {
    src: "/images/hostel/main-entrance.webp",
    width: 492,
    height: 468,
    alt: "The arched main entrance of Newton House framed by trees",
  },
  exteriorVintage: {
    src: "/images/hostel/exterior-vintage.webp",
    width: 1388,
    height: 1020,
    alt: "Sepia-toned photograph of the Newton House facade and railings",
  },
  archiveExterior: {
    src: "/images/hostel/archive-exterior-sepia.webp",
    width: 636,
    height: 348,
    alt: "Archival sepia photograph of the Newton House building and its fenced grounds",
  },
  archiveEntrance: {
    src: "/images/hostel/archive-entrance-sepia.webp",
    width: 444,
    height: 516,
    alt: "Archival sepia photograph of the arched entrance of Newton House",
  },
  illuminated: {
    src: "/images/memories/illuminated-facade.webp",
    width: 582,
    height: 408,
    alt: "Newton House illuminated with strings of decorative lights during a celebration",
  },
  alumniGathering: {
    src: "/images/memories/alumni-gathering.webp",
    width: 678,
    height: 300,
    alt: "A large group of Newton House residents and alumni gathered in front of the building",
  },
} satisfies Record<string, SiteImage>;
