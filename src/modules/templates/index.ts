import { lazy } from "react";
import { LayoutTemplate } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";
import { presets } from "./lib/presets";

const GROUP: Record<string, string> = {
  marketing: "Marketing",
  store: "Store",
  app: "App",
  personal: "Personal",
  content: "Blog",
  auth: "Auth pages",
};

const items: ModuleItem[] = presets.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  tags: p.tags,
  keywords: [...(p.keywords ?? []), "template", "starter"],
  group: GROUP[p.tags[0] ?? ""] ?? "Templates",
}));

export const templatesModule: DevKitModule = {
  id: "templates",
  title: "Templates",
  description: "Ready-made pages and sections, exported as React, Next.js or HTML",
  icon: LayoutTemplate,
  order: 60,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
