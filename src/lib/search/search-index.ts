import { Index } from "flexsearch";

export interface SearchEntry {
  /** "<moduleId>:<itemId>" — unique across the app. */
  key: string;
  moduleId: string;
  itemId: string;
  title: string;
  description?: string;
  keywords?: string[];
  copyValue?: string | (() => string);
}

/** Full-text index over every module item. Forward tokenizing gives search-as-you-type. */
export function createSearchIndex(entries: SearchEntry[]) {
  const index = new Index({ tokenize: "forward" });
  entries.forEach((e, i) => {
    index.add(i, [e.title, e.description, ...(e.keywords ?? [])].filter(Boolean).join(" "));
  });

  return {
    search(query: string, limit = 50): SearchEntry[] {
      const q = query.trim();
      if (!q) return [];
      const ids = index.search(q, { limit }) as number[];
      return ids.map((i) => entries[i]).filter((e): e is SearchEntry => e !== undefined);
    },
  };
}
