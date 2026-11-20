import { lazy } from "react";
import { SquareTerminal } from "lucide-react";
import type { DevKitModule } from "@/app/module";
import { commandItems } from "./lib/data";

export const commandsModule: DevKitModule = {
  id: "commands",
  title: "Commands",
  description: "Terminal commands for every framework you use",
  icon: SquareTerminal,
  order: 10,
  items: () => commandItems,
  Detail: lazy(() => import("./components/command-detail")),
};
