import { lazy } from "react";
import { Sparkles } from "lucide-react";
import type { DevKitModule } from "@/app/module";
import { gsapItems } from "./lib/data";

export const gsapModule: DevKitModule = {
  id: "gsap",
  title: "GSAP & Scroll",
  description: "Animation snippets with live previews",
  icon: Sparkles,
  order: 45,
  items: () => gsapItems,
  Detail: lazy(() => import("./components/detail")),
};
