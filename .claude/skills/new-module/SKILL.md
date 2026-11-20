---
name: new-module
description: Step-by-step recipe for adding a new module (section) to Khaled's Dev Kit — folder layout, registry entry, search items, routes and tests. Use whenever a new section or tool group is added.
---

# Adding a module

A module is self-contained: the app shell knows it only through the registry.
Adding a module must never require edits to other modules.

## Contract (`src/app/module.ts`)
```ts
interface ModuleItem {
  id: string;            // kebab-case, unique within the module
  title: string;
  description?: string;
  tags?: string[];       // first tag shows as a badge in the list
  keywords?: string[];   // extra search words
  copyValue?: string;    // if set, Enter copies it (commands, snippets); else Enter opens
}

interface DevKitModule {
  id: string;            // kebab-case, used in the URL: /#/<id>/<itemId>
  title: string;
  description: string;
  icon: LucideIcon;
  order: number;         // sidebar position + Mod 1..9
  items: () => ModuleItem[];            // list pane; at least one item
  Detail: ComponentType<DetailProps> | LazyExoticComponent<...>; // renders { item }
}
```
The shell does the rest: sidebar entry, routes (`/<id>/<itemId>`), list pane with fuzzy filter,
Mod K search entries (built from `items()`), recent history. Reference: `src/modules/converters/`.

## Steps
1. Create `src/modules/<id>/`:
   ```
   index.ts                 exports the DevKitModule (items + lazy Detail) — nothing else
   components/detail.tsx    default export: maps item.id → lazy tool/view component
   components/<tool>.tsx    one file per tool, default export, uses ToolLayout
   lib/                     pure logic (no React) — tests focus here
   <id>.test.ts             tests for lib/
   ```
2. Register it: one import + one entry in `src/app/registry.ts`. Nothing else in the shell changes.
3. Every tool screen uses `ToolLayout` + `Field` + `OutputCode` (see `ui-guidelines` §3–4).
4. Keep logic pure in `lib/` (input → output). UI only wires state to it.
5. Tests: cover `lib/` with real examples (happy path + 1–2 edge cases).
6. Native access (files, DB, shell)? Add a Tauri command in `src-tauri/src/commands/` and request
   only the minimum capability in `src-tauri/capabilities/`.
7. Run the applicable `phase-review` items before calling it done.

## Rules
- No imports from another module's folder. Shared code goes to `src/lib/` or `src/components/`.
- Lazy-load module routes so startup stays fast.
- Module state that should persist (last inputs, favorites) goes through `src/lib/store/` helpers.
