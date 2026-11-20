import type { DevKitModule } from "./module";
import { commandsModule } from "@/modules/commands";
import { convertersModule } from "@/modules/converters";

/** Every module in the app. Adding a module = one import + one entry here. */
export const modules: DevKitModule[] = [commandsModule, convertersModule].sort(
  (a, b) => a.order - b.order,
);

export function getModule(id: string | undefined): DevKitModule | undefined {
  return modules.find((m) => m.id === id);
}
