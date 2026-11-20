import type { DevKitModule } from "./module";
import { commandsModule } from "@/modules/commands";
import { convertersModule } from "@/modules/converters";
import { formattersModule } from "@/modules/formatters";
import { cssToolsModule } from "@/modules/css-tools";
import { designModule } from "@/modules/design";
import { gsapModule } from "@/modules/gsap";

/** Every module in the app. Adding a module = one import + one entry here. */
export const modules: DevKitModule[] = [
  commandsModule,
  formattersModule,
  convertersModule,
  cssToolsModule,
  gsapModule,
  designModule,
].sort((a, b) => a.order - b.order);

export function getModule(id: string | undefined): DevKitModule | undefined {
  return modules.find((m) => m.id === id);
}
