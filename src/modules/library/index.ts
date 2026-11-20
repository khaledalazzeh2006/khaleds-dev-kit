import { lazy } from "react";
import { Library } from "lucide-react";
import type { DevKitModule } from "@/app/module";
import { findModule } from "@/lib/module-lookup";
import { useLibrary } from "@/lib/store/library";
import { libraryItems } from "./lib/items";

export const libraryModule: DevKitModule = {
  id: "library",
  title: "My Library",
  description: "Favorites and your own snippets, exportable to VS Code",
  icon: Library,
  order: 70,
  items: () => libraryItems(findModule),
  watch: { subscribe: useLibrary.subscribe, version: () => useLibrary.getState().rev },
  Detail: lazy(() => import("./components/detail")),
};
