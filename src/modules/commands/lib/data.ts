import { loadCommands } from "@/lib/content/load";
import { isMac } from "@/lib/platform";
import type { ModuleItem } from "@/app/module";
import { frameworkLabel, frameworkOrder } from "./frameworks";
import { renderCommand, type Platform } from "./render";
import { useCommandVars } from "./store";

export const currentPlatform: Platform = isMac ? "macos" : "windows";

/** All commands, sorted by framework order (keeps each framework's own order). */
export const commands = loadCommands()
  .map((c, i) => ({ c, i }))
  .sort((a, b) => frameworkOrder(a.c.framework) - frameworkOrder(b.c.framework) || a.i - b.i)
  .map(({ c }) => c);

export const commandById = new Map(commands.map((c) => [c.id, c]));

export const commandItems: ModuleItem[] = commands.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  group: frameworkLabel(c.framework),
  tags: c.danger ? ["danger", ...c.tags] : c.tags,
  keywords: [c.framework, ...c.tags, c.command],
  // Enter copies the command with the user's last-used variable values.
  copyValue: () =>
    renderCommand(c, { platform: currentPlatform, values: useCommandVars.getState().values }),
}));
