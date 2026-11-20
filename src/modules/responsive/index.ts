import { lazy } from "react";
import { MonitorSmartphone } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";

const items: ModuleItem[] = [
  {
    id: "devices",
    title: "Device preview",
    description: "Your page on phone, tablet, desktop",
    tags: ["preview"],
    keywords: ["iframe", "mobile", "localhost", "viewport"],
  },
  {
    id: "breakpoints",
    title: "Breakpoints",
    description: "Tailwind & Bootstrap, live width",
    tags: ["reference"],
    keywords: ["sm", "md", "lg", "xl", "screens"],
  },
  {
    id: "clamp",
    title: "clamp() generator",
    description: "Fluid sizes without breakpoints",
    tags: ["css"],
    keywords: ["fluid", "typography", "vw", "font size"],
  },
  {
    id: "queries",
    title: "Media & container queries",
    description: "@media, @container, Tailwind variants",
    tags: ["css"],
    keywords: ["media query", "container query", "min-width", "range"],
  },
  {
    id: "srcset",
    title: "Responsive images",
    description: "srcset, sizes and <picture>",
    tags: ["html"],
    keywords: ["srcset", "sizes", "picture", "avif", "webp", "lazy"],
  },
  {
    id: "units",
    title: "CSS units",
    description: "dvh, svh, cqw, rem, ch…",
    tags: ["reference"],
    keywords: ["vh", "dvh", "rem", "em", "viewport units"],
  },
];

export const responsiveModule: DevKitModule = {
  id: "responsive",
  title: "Responsive",
  description: "Device preview, breakpoints, fluid sizes and responsive images",
  icon: MonitorSmartphone,
  order: 55,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
