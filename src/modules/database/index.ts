import { lazy } from "react";
import { Database } from "lucide-react";
import type { DevKitModule } from "@/app/module";
import { databaseItems } from "./lib/data";

export const databaseModule: DevKitModule = {
  id: "database",
  title: "Database",
  description: "Schema designer, ORM code, seed data, SQL cheat sheet",
  icon: Database,
  order: 35,
  items: () => databaseItems,
  Detail: lazy(() => import("./components/detail")),
};
