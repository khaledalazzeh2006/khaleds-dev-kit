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

let cache: { entries: SearchEntry[]; index: ReturnType<typeof createSearchIndex> } | null = null;

export function getSearch() {
  if (!cache) {
    const entries = collectEntries();
    cache = { entries, index: createSearchIndex(entries) };
  }
  return cache;
}
