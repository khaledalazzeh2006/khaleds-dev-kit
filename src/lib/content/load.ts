import { z } from "zod";
import { commandSchema, type Command } from "./schema";

// Bundled at build time: every JSON file in content/commands becomes part of the app (works offline).
const commandFiles = import.meta.glob<unknown>("/content/commands/*.json", {
  eager: true,
  import: "default",
});

/** Parse every command file. Invalid files are skipped with a console error instead of crashing. */
export function loadCommands(files: Record<string, unknown> = commandFiles): Command[] {
  return Object.entries(files).flatMap(([path, data]) => {
    const result = z.array(commandSchema).safeParse(data);
    if (result.success) return result.data;
    console.error(`Invalid content in ${path}`, z.prettifyError(result.error));
    return [];
  });
}
