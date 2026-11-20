import { lazy } from "react";
import { Braces } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";
import { formatterTools } from "./lib/tools";

const items: ModuleItem[] = [
  ...formatterTools.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    tags: ["format"],
  })),
  {
    id: "diff",
    title: "Diff",
    description: "Compare two texts line by line",
    keywords: ["compare", "patch", "changes"],
    tags: ["compare"],
  },
];

export const formattersModule: DevKitModule = {
  id: "formatters",
  title: "Formatters",
  description: "Format, minify and compare code",
  icon: Braces,
  order: 20,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
