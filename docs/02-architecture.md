# Architecture

## Layers
1. **Shell** (`src/app/`): window layout, sidebar, router, theme, command palette, toasts.
2. **Registry** (`src/app/registry.ts`): the list of modules. The shell renders the sidebar, routes
   and search index from it. Adding a module = new folder + one registry line.
3. **Modules** (`src/modules/<id>/`): independent; pure logic in `lib/`, UI in `routes.tsx`/`components/`.
4. **Shared** (`src/components/`, `src/lib/`): ToolLayout, OutputCode, Kbd, stores, search, content loader.
5. **Data**
   - Static content: `content/**/*.json` → validated (zod) → loaded at startup.
   - User data: SQLite (tauri-plugin-sql): favorites, own snippets, history, settings.
   - Search: FlexSearch index built at startup from registry `searchItems()` + user data.
6. **Native** (`src-tauri/`): only what the browser can't do — file system, DB connections,
   running commands. Each capability is granted explicitly in `src-tauri/capabilities/`.

## Libraries (all free)
TanStack Router · Zustand · cmdk · FlexSearch · CodeMirror 6 (Monaco for diff) ·
prettier/standalone · sql-formatter · js-yaml · papaparse · @faker-js/faker · culori ·
jSquash (WASM image codecs) or Rust `image` crate · gsap · lenis · motion · zod · vitest.
Note: `sharp` needs Node and does not run inside Tauri's webview — don't use it.

## Data flow example (copy a command)
Mod K → palette queries FlexSearch → item `{action: copy}` → fills `{{vars}}` from last used
values → clipboard (Tauri clipboard plugin) → toast "Copied" → history row in SQLite.
