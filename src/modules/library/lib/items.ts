import type { DevKitModule, ModuleItem } from "@/app/module";
import { SNIPPET_LANGUAGES, useLibrary, type LibrarySnippet } from "@/lib/store/library";

export const SNIPPET_PREFIX = "s-";
export const FAVORITE_PREFIX = "f-";

/** "f-css-tools--shadow" ⇄ "css-tools:shadow" (ids are kebab-case, so "--" is a safe joint). */
export const favoriteItemId = (key: string) => FAVORITE_PREFIX + key.replace(":", "--");
export const favoriteKey = (itemId: string) =>
  itemId.slice(FAVORITE_PREFIX.length).replace("--", ":");

export function snippetItem(s: LibrarySnippet): ModuleItem {
  return {
    id: SNIPPET_PREFIX + s.id,
    title: s.title,
    description: s.description || s.source || SNIPPET_LANGUAGES[s.language].label,
    tags: [s.language, ...s.tags],
    keywords: [s.prefix, ...s.tags, SNIPPET_LANGUAGES[s.language].label],
    group: "My snippets",
    copyValue: s.code,
  };
}

/** Build the list: the manage page, favorites (resolved through `lookup`), then snippets. */
export function libraryItems(
  lookup: (moduleId: string) => DevKitModule | undefined,
  state = useLibrary.getState(),
): ModuleItem[] {
  const favorites = state.favorites.flatMap((key): ModuleItem[] => {
    const [moduleId, itemId] = key.split(":");
    const m = moduleId ? lookup(moduleId) : undefined;
    const item = m?.items().find((i) => i.id === itemId);
    if (!m || !item) return [];
    return [
      {
        id: favoriteItemId(key),
        title: item.title,
        description: m.title + (item.description ? ` · ${item.description}` : ""),
        tags: item.tags,
        keywords: [...(item.keywords ?? []), m.title],
        group: "Favorites",
        copyValue: item.copyValue,
      },
    ];
  });
  return [
    {
      id: "manage",
      title: "Import & export",
      description: "VS Code snippets, backups, how it works",
      tags: ["tool"],
      keywords: ["vscode", "code-snippets", "backup", "export", "import"],
      group: "Library",
    },
    ...favorites,
    ...state.snippets.map(snippetItem),
  ];
}
