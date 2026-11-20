import type { SiteTheme } from "./theme";

export type SectionCategory =
  "Basics" | "Marketing" | "Store" | "App" | "Portfolio" | "Blog" | "Auth";

export interface Section {
  id: string;
  /** Component name in React / Next.js exports (PascalCase, unique). */
  component: string;
  label: string;
  category: SectionCategory;
  description: string;
  /** If set, the section has this id and navbars link to it with this label. */
  anchor?: { id: string; label: string };
  /** JSX-safe HTML using only the theme utility names (see theme.ts). */
  render: (theme: SiteTheme, page: PageContext) => string;
}

/** What a section knows about the page it's on (e.g. navbars list the other sections). */
export interface PageContext {
  /** Anchors of the sections on this page, in order. */
  anchors: { id: string; label: string }[];
}

export const emptyPage: PageContext = { anchors: [] };

export interface Preset {
  id: string;
  title: string;
  description: string;
  sections: string[];
  tags: string[];
  keywords?: string[];
}

/** Escape user text (brand name) before putting it into markup. */
export function esc(s: string): string {
  return s.replace(/[&<>"'{}]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Shared class strings so every section looks like one site. */
export const ui = {
  container: "mx-auto w-full max-w-6xl px-6",
  section: "py-20 md:py-28",
  eyebrow: "text-sm font-semibold uppercase tracking-wider text-brand",
  h2: "mt-3 text-3xl font-bold tracking-tight md:text-4xl",
  lead: "mt-4 text-lg text-muted",
  btn: "inline-flex items-center justify-center gap-2 rounded-btn bg-brand px-5 py-3 text-sm font-semibold text-on-brand shadow-sm transition hover:opacity-90",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-btn border border-line px-5 py-3 text-sm font-semibold transition hover:bg-soft",
  card: "rounded-card border border-line bg-card",
  input:
    "w-full rounded-btn border border-line bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20",
  label: "text-sm font-medium",
};
