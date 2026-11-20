---
name: templates
description: How the Templates module (ready-made pages exported as React/Vite, Next.js or HTML) works, and the rules for adding or editing sections and presets. Use when touching src/modules/templates.
---

# Templates module

Pages are built from **sections** (`src/modules/templates/lib/sections/*.ts`) and **presets**
(`lib/presets.ts` = a named list of section ids). The builder lets the user add/remove/reorder
sections, set brand (name, color, light/dark, corners, font) and export a zip.

## How it renders
- `section.render(theme, page)` returns HTML. The same HTML is used for the live preview, the HTML
  export and (through `htmlToJsx` in `lib/jsx.ts`) the React / Next.js components.
- Tailwind v4 is compiled **in the app, offline** (`lib/tailwind.ts`, `compile()` from `tailwindcss`
  + `virtual:tailwind-index-css` from vite.config.ts). The preview iframe gets that CSS; the HTML
  export ships it as `styles.css`.
- `page.anchors` lists sections that have an `anchor` → navbars link only to what's on the page.

## Rules for section markup (tests enforce them)
1. **Theme names only for colors/radius/font**: `bg-surface bg-soft bg-card text-ink text-muted
   border-line bg-brand text-on-brand rounded-card rounded-btn font-sans` (+ opacity like `bg-brand/10`).
   Never hard-code palette colors like `bg-violet-600`: re-theming must work.
2. **JSX-safe HTML**: void tags self-closed (`<input />`), no inline `style`, no comments, no `{ }` in
   text, use ’ and “ ” instead of straight quotes in text.
3. **One root element** per section. A section with an anchor must have `id="<anchor.id>"`.
4. No JavaScript, no external images/fonts: menus and FAQ use `<details>`; images are gradient
   placeholders; icons come from `lib/icons.ts` (Lucide shapes, regenerate with a script if you need
   a new one — brand icons like GitHub are not in Lucide anymore).
5. Reuse `ui.*` class strings from `lib/model.ts` (container, section, h2, btn, card, input…).
6. `component` names are unique PascalCase (they become file names).

## Checks
- `pnpm test` runs templates.test.ts: every class must exist in Tailwind's output (catches typos),
  every section must transpile as JSX, presets must reference real sections, anchors must exist.
- After big changes, also build the exports for real: generate with a throwaway test into /tmp,
  then `npm install && npx tsc --noEmit && npx vite build` (Vite) and `npx next build` (Next.js).
- Versions written into exported package.json files live in `VERSIONS` (lib/export.ts) — bump them
  when React / Next / Vite / Tailwind majors change.
