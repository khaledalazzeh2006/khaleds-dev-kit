---
name: new-module
description: Step-by-step recipe for adding a new module (section) to Khaled's Dev Kit — folder layout, registry entry, search items, routes and tests. Use whenever a new section or tool group is added.
---

# Adding a module

A module is self-contained: the app shell knows it only through the registry.
Adding a module must never require edits to other modules.

## Contract (`src/app/module.ts`)
```ts
export interface DevKitModule {
  id: string;                 // kebab-case, unique, e.g. "css-tools"
  title: string;              // sidebar label, e.g. "CSS Tools"
  icon: LucideIcon;
  order: number;              // sidebar position
  routes: RouteDef[];         // TanStack Router child routes under /<id>
  searchItems: () => SearchItem[] | Promise<SearchItem[]>; // fed into the global index
}

export interface SearchItem {
  id: string;                 // "<moduleId>:<itemId>"
  title: string;
  subtitle?: string;
  keywords?: string[];
  action: { type: "open"; to: string } | { type: "copy"; value: string };
}
```

## Steps
1. Create `src/modules/<id>/` with:
   ```
   index.ts          exports the DevKitModule object (and nothing else public)
   routes.tsx        route components
   components/       module-only components
   lib/              pure logic (no React) — this is where tests focus
   <id>.test.ts      tests for lib/
   ```
2. Register it: one line in `src/app/registry.ts`. Nothing else in the shell changes.
3. Every tool screen uses `ToolLayout` (see `ui-guidelines` §3).
4. Expose each tool and each content item via `searchItems()` so Mod K finds it.
5. Keep logic pure in `lib/` (input → output functions). UI only wires state to it.
6. Tests: cover `lib/` functions with real examples (happy path + 1–2 edge cases).
7. If it needs native access (files, DB, shell), add a Tauri command in `src-tauri/src/commands/`
   and request only the minimum capability in `src-tauri/capabilities/`.
8. Run `phase-review` checklist items that apply before calling it done.

## Rules
- No imports from another module's folder. Shared code goes to `src/lib/` or `src/components/`.
- Lazy-load module routes so startup stays fast.
- Module state that should persist (last inputs, favorites) goes through `src/lib/store/` helpers.
