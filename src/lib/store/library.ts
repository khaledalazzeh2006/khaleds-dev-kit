import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CodeLanguage } from "@/components/tool/code-input";

/** Languages a library snippet can have. `highlight` = editor mode, `scope` = VS Code scopes. */
export const SNIPPET_LANGUAGES = {
  typescript: { label: "TypeScript", highlight: "typescript", scope: "typescript" },
  tsx: { label: "React (TSX/JSX)", highlight: "jsx", scope: "typescriptreact,javascriptreact" },
  javascript: { label: "JavaScript", highlight: "javascript", scope: "javascript" },
  html: { label: "HTML", highlight: "html", scope: "html" },
  css: { label: "CSS", highlight: "css", scope: "css,scss" },
  json: { label: "JSON", highlight: "json", scope: "json,jsonc" },
  sql: { label: "SQL", highlight: "sql", scope: "sql" },
  yaml: { label: "YAML", highlight: "yaml", scope: "yaml" },
  shell: { label: "Shell", highlight: "text", scope: "shellscript,powershell" },
  text: { label: "Plain text", highlight: "text", scope: "" },
} as const satisfies Record<string, { label: string; highlight: CodeLanguage; scope: string }>;

export type SnippetLanguage = keyof typeof SNIPPET_LANGUAGES;

export interface LibrarySnippet {
  id: string;
  title: string;
  language: SnippetLanguage;
  code: string;
  /** What you type in VS Code before pressing Tab. */
  prefix: string;
  description: string;
  tags: string[];
  /** Where it was saved from, e.g. "CSS Tools · Box shadow". */
  source?: string;
  createdAt: number;
  updatedAt: number;
}

export type NewSnippet = Partial<Omit<LibrarySnippet, "id" | "createdAt" | "updatedAt">> & {
  code: string;
};

interface LibraryState {
  snippets: LibrarySnippet[];
  /** "<moduleId>:<itemId>" of starred items, most recent first. */
  favorites: string[];
  /** Bumped on every change so the shell can refresh lists and search. */
  rev: number;
  addSnippet: (s: NewSnippet) => LibrarySnippet;
  updateSnippet: (id: string, patch: Partial<LibrarySnippet>) => void;
  removeSnippet: (id: string) => LibrarySnippet | undefined;
  restoreSnippet: (s: LibrarySnippet) => void;
  toggleFavorite: (key: string) => boolean;
  /** Add snippets, skipping ones whose title + code already exist. Returns how many were added. */
  importSnippets: (list: NewSnippet[]) => number;
  importFavorites: (keys: string[]) => number;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** "Box shadow (CSS)" → "box-shadow-css". Used as the default VS Code prefix. */
export const toPrefix = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "snippet";

function create_(s: NewSnippet): LibrarySnippet {
  const now = Date.now();
  const title = s.title?.trim() || "Untitled snippet";
  return {
    id: uid(),
    title,
    language: s.language && s.language in SNIPPET_LANGUAGES ? s.language : "text",
    code: s.code,
    prefix: s.prefix?.trim() || toPrefix(title),
    description: s.description ?? "",
    tags: s.tags ?? [],
    source: s.source,
    createdAt: now,
    updatedAt: now,
  };
}

const sameSnippet = (a: { title: string; code: string }, b: { title?: string; code: string }) =>
  a.code === b.code && a.title === (b.title?.trim() || "Untitled snippet");

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      snippets: [],
      favorites: [],
      rev: 0,
      addSnippet: (s) => {
        const snippet = create_(s);
        set((st) => ({ snippets: [snippet, ...st.snippets], rev: st.rev + 1 }));
        return snippet;
      },
      updateSnippet: (id, patch) =>
        set((st) => ({
          snippets: st.snippets.map((s) =>
            s.id === id ? { ...s, ...patch, id, updatedAt: Date.now() } : s,
          ),
          rev: st.rev + 1,
        })),
      removeSnippet: (id) => {
        const found = get().snippets.find((s) => s.id === id);
        set((st) => ({ snippets: st.snippets.filter((s) => s.id !== id), rev: st.rev + 1 }));
        return found;
      },
      restoreSnippet: (s) =>
        set((st) => ({
          snippets: [s, ...st.snippets.filter((x) => x.id !== s.id)].sort(
            (a, b) => b.createdAt - a.createdAt,
          ),
          rev: st.rev + 1,
        })),
      toggleFavorite: (key) => {
        const on = !get().favorites.includes(key);
        set((st) => ({
          favorites: on ? [key, ...st.favorites] : st.favorites.filter((k) => k !== key),
          rev: st.rev + 1,
        }));
        return on;
      },
      importSnippets: (list) => {
        const existing = get().snippets;
        const fresh: LibrarySnippet[] = [];
        for (const s of list) {
          if ([...existing, ...fresh].some((e) => sameSnippet(e, s))) continue;
          fresh.push(create_(s));
        }
        if (fresh.length) set((st) => ({ snippets: [...fresh, ...st.snippets], rev: st.rev + 1 }));
        return fresh.length;
      },
      importFavorites: (keys) => {
        const add = [...new Set(keys)].filter((k) => !get().favorites.includes(k));
        if (add.length) set((st) => ({ favorites: [...st.favorites, ...add], rev: st.rev + 1 }));
        return add.length;
      },
    }),
    {
      name: "devkit-library",
      partialize: (s) => ({ snippets: s.snippets, favorites: s.favorites }),
    },
  ),
);

/** Map an editor language back to a snippet language (for "Save to library"). */
export function snippetLanguageFor(lang: CodeLanguage | undefined): SnippetLanguage {
  if (lang === "jsx") return "tsx";
  if (!lang) return "text";
  return lang in SNIPPET_LANGUAGES ? (lang as SnippetLanguage) : "text";
}
