import { lazy } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";

const items: ModuleItem[] = [
  {
    id: "px-rem",
    title: "PX ↔ REM",
    description: "Convert pixels to rem and back",
    tags: ["css"],
    keywords: ["units", "font size", "pixels", "root"],
  },
];

export const convertersModule: DevKitModule = {
  id: "converters",
  title: "Converters",
  description: "Units, colors, encodings and formats",
  icon: ArrowLeftRight,
  order: 30,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
