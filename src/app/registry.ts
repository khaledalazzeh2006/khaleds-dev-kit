import type { DevKitModule } from "./module";
import { convertersModule } from "@/modules/converters";

/** Every module in the app. Adding a module = one import + one entry here. */
export const modules: DevKitModule[] = [convertersModule].sort((a, b) => a.order - b.order);

export function getModule(id: string | undefined): DevKitModule | undefined {
  return modules.find((m) => m.id === id);
}
