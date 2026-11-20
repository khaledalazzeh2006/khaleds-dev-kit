import { z } from "zod";
import { commandSchema, snippetSchema, type Command, type Snippet } from "./schema";

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

const snippetFiles = import.meta.glob<unknown>("/content/snippets/**/*.json", {
  eager: true,
  import: "default",
});

/** Parse every snippet file (one snippet per file). Invalid files are skipped with a console error. */
export function loadSnippets(files: Record<string, unknown> = snippetFiles): Snippet[] {
  return Object.entries(files).flatMap(([path, data]) => {
    const result = snippetSchema.safeParse(data);
    if (result.success) return [result.data];
    console.error(`Invalid content in ${path}`, z.prettifyError(result.error));
    return [];
  });
}
