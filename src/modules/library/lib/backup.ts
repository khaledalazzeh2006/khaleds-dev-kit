import { z } from "zod";
import { SNIPPET_LANGUAGES, type LibrarySnippet } from "@/lib/store/library";

const snippetSchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.enum(Object.keys(SNIPPET_LANGUAGES) as [keyof typeof SNIPPET_LANGUAGES]),
  code: z.string(),
  prefix: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  source: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const backupSchema = z.object({
  app: z.literal("khaleds-dev-kit"),
  kind: z.literal("library"),
  version: z.literal(1),
  snippets: z.array(snippetSchema),
  favorites: z.array(z.string()),
});

export type LibraryBackup = z.infer<typeof backupSchema>;

export function makeBackup(snippets: LibrarySnippet[], favorites: string[]): string {
  const backup: LibraryBackup & { exportedAt: string } = {
    app: "khaleds-dev-kit",
    kind: "library",
    version: 1,
    exportedAt: new Date().toISOString(),
    snippets,
    favorites,
  };
  return JSON.stringify(backup, null, 2) + "\n";
}

export function parseBackup(text: string): LibraryBackup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("This file isn't valid JSON.", { cause: e });
  }
  const result = backupSchema.safeParse(data);
  if (!result.success) throw new Error("This isn't a Dev Kit library backup.");
  return result.data;
}
