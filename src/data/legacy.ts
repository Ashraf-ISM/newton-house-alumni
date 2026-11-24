import type { TimelineEntry } from "@/types";
import { images } from "./images";

/**
 * Legacy timeline. Dates are deliberately left unset (`dateLabel: null`)
 * until the Association verifies them from the college archive.
 * Set `dateLabel` and `verified: true` to publish a date.
 */
export const timeline: TimelineEntry[] = [
  {
    id: "foundation",
    era: "Chapter I",
    title: "A Home Is Built",
    body:
      "The red-brick walls and arched gateway of Newton House rise on the Patna Science College campus, opening a residence for students who come to the city to study the sciences.",
    dateLabel: null,
    verified: false,
    image: { src: images.archiveEntrance.src, alt: images.archiveEntrance.alt },
  },
  {
    id: "first-residents",
    era: "Chapter II",
    title: "The First Residents",
    body:
      "Rooms fill, corridors find their rhythm, and the first generation of residents begins the routines that later batches will inherit.",
    dateLabel: null,
    verified: false,
  },
  {
    id: "traditions",
    era: "Chapter III",
    title: "Traditions Take Shape",
    body:
      "Welcomes for freshers, farewells for those leaving, and evenings when the facade is lit in celebration become customs passed from senior to junior.",
    dateLabel: null,
    verified: false,
    image: { src: images.illuminated.src, alt: images.illuminated.alt },
  },
  {
    id: "widening-circle",
    era: "Chapter IV",
    title: "A Widening Circle",
    body:
      "Residents graduate and go on to laboratories, classrooms, public service and enterprise, carrying the house with them wherever they settle.",
    dateLabel: null,
    verified: false,
  },
  {
    id: "association",
    era: "Chapter V",
    title: "The Alumni Association",
    body:
      "Former residents come together to keep the bond alive: reunions, mentorship and a shared record of the people who called Newton House home.",
    dateLabel: null,
    verified: false,
    image: { src: images.alumniGathering.src, alt: images.alumniGathering.alt },
  },
  {
    id: "today",
    era: "Today",
    title: "A Digital Home for the Brotherhood",
    body:
      "This platform carries the story forward: a verified directory, an open archive of memories, and a calendar that brings every generation back to the house.",
    dateLabel: null,
    verified: true,
  },
];

export const traditions = [
  {
    title: "Illumination Nights",
    body: "Evenings when the facade is strung with lights and the whole house gathers outside.",
    image: images.illuminated,
  },
  {
    title: "Welcoming Freshers",
    body: "The first introductions that turn a room allotment into a lifelong friendship.",
    image: null,
  },
  {
    title: "Farewells",
    body: "The last evening of a batch: speeches, songs and promises to return.",
    image: null,
  },
  {
    title: "Alumni Meets",
    body: "Generations returning through the arched gateway to the house that shaped them.",
    image: images.alumniGathering,
  },
] as const;

/** Prompts used to invite memories from different generations (no invented quotes). */
export const memoryPrompts = [
  { decade: "Earliest generations", prompt: "What did the house look like the day you first arrived?" },
  { decade: "Middle generations", prompt: "Which room, corridor or corner still feels like yours?" },
  { decade: "Recent generations", prompt: "Who was the senior who looked out for you, and how?" },
];
