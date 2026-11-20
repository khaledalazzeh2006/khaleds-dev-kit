import { lazy } from "react";
import { Paintbrush } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";

const items: ModuleItem[] = [
  {
    id: "shadow",
    title: "Box shadow",
    description: "Layered shadows, presets",
    tags: ["visual"],
    keywords: ["box-shadow", "elevation", "glow"],
  },
  {
    id: "gradient",
    title: "Gradient",
    description: "Linear, radial, conic",
    tags: ["visual"],
    keywords: ["background", "linear-gradient"],
  },
  {
    id: "radius",
    title: "Border radius",
    description: "All corners or each one",
    tags: ["visual"],
    keywords: ["rounded", "corners"],
  },
  {
    id: "flexbox",
    title: "Flexbox",
    description: "Direction, justify, align, gap",
    tags: ["layout"],
    keywords: ["flex", "justify", "align", "center"],
  },
  {
    id: "grid",
    title: "Grid",
    description: "Fixed or auto-fit columns",
    tags: ["layout"],
    keywords: ["grid-template-columns", "cards", "responsive"],
  },
  {
    id: "glass",
    title: "Glassmorphism",
    description: "Frosted glass with backdrop blur",
    tags: ["visual"],
    keywords: ["backdrop-filter", "blur", "frosted"],
  },
  {
    id: "transition",
    title: "Transition & easing",
    description: "cubic-bezier curve editor",
    tags: ["motion"],
    keywords: ["ease", "cubic-bezier", "animation", "duration"],
  },
  {
    id: "clip-path",
    title: "Clip path",
    description: "Shapes with draggable points",
    tags: ["visual"],
    keywords: ["polygon", "shape", "mask"],
  },
];

export const cssToolsModule: DevKitModule = {
  id: "css-tools",
  title: "CSS Tools",
  description: "Visual CSS editors with CSS and Tailwind output",
  icon: Paintbrush,
  order: 40,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
