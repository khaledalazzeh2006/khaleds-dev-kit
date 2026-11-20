import { loadSnippets } from "@/lib/content/load";
import type { ModuleItem } from "@/app/module";

export const GROUPS = ["Basics", "ScrollTrigger", "Text & SVG", "Interaction", "Setup"] as const;

// List order inside each group (files load alphabetically).
const ORDER = [
  "gsap-fade-in",
  "gsap-stagger",
  "gsap-timeline",
  "gsap-counter",
  "gsap-scroll-reveal",
  "gsap-scroll-progress",
  "gsap-pin-section",
  "gsap-horizontal-scroll",
  "gsap-parallax",
  "gsap-split-text",
  "gsap-draw-svg",
  "gsap-marquee",
  "gsap-flip",
  "gsap-draggable",
  "gsap-magnetic",
  "gsap-register-plugins",
  "gsap-lenis",
  "gsap-match-media",
];

const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : 999);

export const snippets = loadSnippets()
  .filter((s) => s.category === "gsap")
  .sort(
    (a, b) =>
      GROUPS.indexOf(a.group as never) - GROUPS.indexOf(b.group as never) ||
      rank(a.id) - rank(b.id),
  );

export const snippetById = new Map(snippets.map((s) => [s.id, s]));

export const EASE_TOOL_ID = "ease-visualizer";

export const gsapItems: ModuleItem[] = [
  ...snippets.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    group: s.group,
    tags: s.tags.slice(0, 1),
    keywords: [...s.tags, "gsap", s.group ?? ""],
  })),
  {
    id: EASE_TOOL_ID,
    title: "Ease visualizer",
    description: "See and compare GSAP eases",
    group: "Tools",
    tags: ["ease"],
    keywords: ["easing", "curve", "power", "elastic", "bounce"],
  },
];
