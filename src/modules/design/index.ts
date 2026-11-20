import { lazy } from "react";
import { Palette } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";

const items: ModuleItem[] = [
  {
    id: "palette",
    title: "Palette",
    description: "50–950 scale from one color",
    tags: ["color"],
    keywords: ["shades", "scale", "tokens", "oklch", "theme"],
  },
  {
    id: "contrast",
    title: "Contrast checker",
    description: "WCAG AA / AAA for text and UI",
    tags: ["a11y"],
    keywords: ["wcag", "accessibility", "ratio"],
  },
  {
    id: "type-scale",
    title: "Type scale",
    description: "Modular, fixed or fluid sizes",
    tags: ["type"],
    keywords: ["font size", "typography", "clamp", "fluid"],
  },
  {
    id: "spacing",
    title: "Spacing scale",
    description: "Spacing tokens from a base unit",
    tags: ["tokens"],
    keywords: ["margin", "padding", "gap", "space"],
  },
];

export const designModule: DevKitModule = {
  id: "design",
  title: "Design",
  description: "Palettes, type and spacing scales, contrast",
  icon: Palette,
  order: 50,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
