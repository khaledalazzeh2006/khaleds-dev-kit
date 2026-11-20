import { createSearchIndex, type SearchEntry } from "@/lib/search/search-index";
import { modules } from "./registry";

/** Flatten every module item into search entries (built once, on first use). */
function collectEntries(): SearchEntry[] {
  return modules.flatMap((m) =>
    m.items().map((item) => ({
      key: `${m.id}:${item.id}`,
      moduleId: m.id,
      itemId: item.id,
      title: item.title,
      description: item.description,
      keywords: [...(item.keywords ?? []), ...(item.tags ?? []), item.group ?? "", m.title],
      copyValue: item.copyValue,
    })),
  );
}

let cache: {
  key: string;
  entries: SearchEntry[];
  index: ReturnType<typeof createSearchIndex>;
} | null = null;

/** Rebuilt only when a module with changing items (My Library) reports a new version. */
export function getSearch() {
  const key = modules.map((m) => m.watch?.version() ?? 0).join(",");
  if (!cache || cache.key !== key) {
    const entries = collectEntries();
    cache = { key, entries, index: createSearchIndex(entries) };
  }
  return cache;
}
