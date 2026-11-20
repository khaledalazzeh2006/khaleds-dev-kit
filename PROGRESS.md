# Progress

**Current phase:** 9 — Integrations (waiting for Khaled to test)
**Last updated:** 2026-11-20

## Done
- Project analysis & decisions (docs/)
- Claude environment: CLAUDE.md, skills, content schemas

## Phase 0 (done)
- [x] Khaled installed Node, pnpm, Rust, MS C++ Build Tools; git init
- [x] Scaffold Tauri 2 + React 19 + TS + Vite 8 (pnpm), window 1280x800, min 640x480
- [x] Tailwind v4 + theme tokens (shadcn naming) + Inter/JetBrains Mono (offline) + components.json
- [x] ESLint, Prettier, Vitest (jsdom), content validator — `pnpm check` passes (verified on Linux)
- [x] Commands section in CLAUDE.md
- [x] Runs on Windows (`pnpm tauri dev`), first commit 2a83604

## Phase 1 — Shell (done)
- [x] Theme store (dark/light/system, persisted) + toggle in title bar
- [x] App frame: 3 panes, container queries (≥1100 / 760–1099 / <760 list-or-detail + back)
- [x] Module contract + registry (`src/app/module.ts`, `registry.ts`); routes generated: `/#/<module>/<item>`
- [x] Command palette (cmdk) on Mod K, FlexSearch index, grouped results, recent items
- [x] Hotkeys: Mod K, Mod B, Mod 1..9, Mod C (copy tool output), `/` filter, ↑↓ Enter Esc
- [x] Shared: ToolLayout, Field, OutputCode (copy + toast), Kbd, Highlight, route error screen
- [x] Demo module: Converters → PX ↔ REM (real tool, 5 tests)
- [x] `pnpm check` + build pass; screenshots checked at 1280 / 900 / 620 px, dark + light
- [x] Checked by Khaled on Windows: everything works

## Phase 2 — Terminal Commands (done)
- [x] `src/lib/content/`: zod schema (mirrors content/schemas) + loader (import.meta.glob, bundled → offline)
- [x] Module `commands`: list grouped by framework; detail with {{vars}} (remembered across commands), toggleable flags, Windows/macOS variants, Docs link, danger banner + red badge
- [x] Enter on a list/palette item copies the command with your last-used values
- [x] Shell upgrades: `ModuleItem.group` (section headers), `copyValue` can be a function, list filter also matches group/keywords, active row scrolls into view, code blocks wrap between words only
- [x] Content batch 1: 131 commands / 10 files (npm, pnpm, git, vite-react, nextjs, express, nestjs, prisma v7, threejs+R3F+gltfjsx, gltf-transform) — sources: official docs, checked 2026-11
- [x] Tests: render (vars, flags, platforms) + content integrity (unique ids, known framework, every {{var}} declared) — 23 tests
- [x] Screenshots checked: list, detail with vars/flags, danger command, filter, Mod K
- [x] Checked by Khaled on Windows (after fixing "destroy is not a function": useEffect returned scrollIntoView's Promise)

## Phase 3 — Formatters + Converters (done)
- [x] Shared: CodeInput (CodeMirror 6, themed by tokens, syntax colors in theme.css), OutputCode `language`, Segmented, RangeField, CopyRows, usePersistentState, useAsyncResult, saveBlob
- [x] Formatters module: JSON (format/minify/validate with line+col), HTML, CSS (+minify), JavaScript (+minify), TypeScript, SQL (dialect + keyword case), Diff (+ unified patch)
- [x] Converters: Color (HEX/RGB/HSL/OKLCH + WCAG contrast), Image (WebP/AVIF/JPEG/PNG, quality, max width, worker + WASM, native Save dialog), JSON↔YAML, JSON↔CSV, JSON→TS, SVG→JSX (+safe preview), Base64, URL (+parts), Timestamp
- [x] Tool inputs/options remembered between sessions
- [x] Rust: tauri-plugin-dialog + tauri-plugin-fs (capabilities: dialog:allow-save, fs:allow-write-file)
- [x] 51 tests; screenshots checked for every tool (dark + light); WebP and AVIF encoding verified in Chromium
- [x] Checked by Khaled on Windows, committed 6fa078f

## Phase 4 — CSS Visual Editors + Design (done)
- [x] Shared: ColorField, CssOutput (CSS ↔ Tailwind, remembered), Preview stage, SelectField
- [x] CSS Tools module: Box shadow (layers, presets, light/dark stage), Gradient (linear/radial/conic, stops), Border radius (linked/separate), Flexbox, Grid (fixed / auto-fit), Glassmorphism, Transition & easing (draggable cubic-bezier + play demo), Clip path (presets + draggable points)
- [x] Design module: Palette (50–950 in OKLCH, export @theme / CSS vars / JSON), Contrast checker (WCAG AA/AAA + UI), Type scale (fixed or fluid clamp), Spacing scale
- [x] Pure generators in lib/ (css.ts, tailwind.ts, palette.ts, scale.ts, contrast.ts) — 70 tests total
- [x] Screenshots checked for all 12 tools; drag on clip-path verified
- [x] Checked by Khaled on Windows

## Phase 5 — GSAP & Scroll (done)
- [x] Snippet content: 18 JSON snippets in content/snippets/gsap (schema + zod now support `group`, `codeReact`, param `options`)
- [x] Module `gsap` (GSAP & Scroll): groups Basics / ScrollTrigger / Text & SVG / Interaction / Setup / Tools
- [x] Detail: live preview (15 previews, ScrollTrigger ones scroll inside their own box via `scroller`), params (number/select/ease/boolean/color), Replay, React (useGSAP) ↔ Vanilla code, install line, Docs
- [x] Ease visualizer: curve from gsap.parseEase + animated dot, custom ease input
- [x] Code blocks: ligatures off (=> stays =>)
- [x] Tests: every snippet (both flavors, filled with defaults) parses with Prettier; params declared; eases valid; React component names never shadow imports — 77 tests
- [x] Screenshots: all previews checked, scroll + Flip interactions verified
- [x] Checked by Khaled on Windows

## Phase 6 — Responsive Tools (done)
- [x] Module `responsive`: Device preview (iframes at real device sizes, scaled; portrait/landscape; reload; open in browser), Breakpoints (Tailwind v4 / Bootstrap 5 + container sizes, live window width), clamp() generator (+ "try a screen width"), Media & container queries (range or classic syntax, px/rem/em, named containers, Tailwind variants, feature queries), Responsive images (srcset/sizes/<picture>), CSS units cheat sheet
- [x] Refactor: shared helpers moved to src/lib (json.ts, fluid.ts, tailwind.ts); ESLint now blocks deep imports between modules (`@/modules/*/*`)
- [x] ToolLayout `layout="stacked"` for wide tools; Commands platform switch uses Segmented; RangeField number box fits large values
- [x] 85 tests; screenshots checked (device preview rendered the app itself in 3 frames)
- [x] Checked by Khaled on Windows

## Phase 7 — Database (done)
- [x] Module `database` (order 35): Schema designer (tables/columns, PK/NULL/UQ, defaults, FK + on delete, templates Blank/Blog/Shop/Auth with Undo, validation, Import SQL from CREATE TABLE)
- [x] Outputs: PostgreSQL / MySQL / SQLite / SQL Server DDL, Prisma 7 (prisma-client generator), TypeORM, Mongoose, EF Core, Mermaid ER; ER diagram view + Expand dialog
- [x] SQL Server rules: no RESTRICT (→ NO ACTION), multiple cascade paths downgraded to NO ACTION, Prisma `onUpdate: NoAction`
- [x] Seed data (faker, reproducible seed): FKs pick real parent keys (int or uuid); SQL per dialect / JSON / CSV
- [x] Connection string builder (password kept in memory only, never saved)
- [x] 13 SQL snippets (content/snippets/sql) grouped Queries / Writes / Performance / PostgreSQL
- [x] Verified: all 16 template×provider Prisma schemas pass Prisma's validator; DDL + seeds run in SQLite with foreign_keys=ON; 101 tests
- [x] Checked by Khaled on Windows, committed

## Phase 7.5 — Templates (done)
- [x] Module `templates` (order 60): 11 presets (Landing, E-commerce, Product, Cart, Dashboard, Portfolio, Blog home, Blog article, Login, Sign up, Forgot password) built from 30 reusable sections
- [x] Builder: add / remove (Undo) / reorder sections, brand name + color, light/dark, corners, font; live preview at desktop/tablet/phone widths; Code view of every exported file
- [x] Export .zip: React (Vite + TS + Tailwind v4), Next.js 16 (App Router, Server Components), or plain HTML + compiled CSS
- [x] Tailwind compiled inside the app, offline (no CDN); navbar links follow the sections on the page; no JS needed in exported sites (menus/FAQ use <details>)
- [x] Verified: every class name is a real Tailwind utility, every section is valid JSX; an export with all 30 sections passes `tsc` + `vite build`, a Next.js export passes `next build`; 140 tests; screenshots checked
- [x] New skill: .claude/skills/templates/SKILL.md
- [x] Checked by Khaled on Windows, committed

## Phase 8 — My Library (done)
- [x] Module `library` (order 70): Import & export page, Favorites, My snippets; items change live (new `watch` on DevKitModule + `useModuleItems`; search index rebuilds on change)
- [x] Favorites: ☆ on every list row (outside My Library) or Mod D; a favorite opens its own tool inside My Library with "Open in …" / Unstar
- [x] "Save" next to Copy on every OutputCode → snippet named after the open tool (no duplicates; toast with Open)
- [x] Snippet editor: title, language, VS Code prefix (follows the title until edited), tags, description, code editor; autosave; Delete with Undo; copy as a VS Code entry
- [x] VS Code: export `.code-snippets` (scopes per language, `$` escaped, `$1`/`${1:x}` kept as tab stops by choice), import `.code-snippets` / per-language JSONC files
- [x] Backup: export/import JSON (merge, never overwrite); stored in localStorage (`devkit-library`)
- [x] `src/lib/module-lookup.ts` lets a module find others without importing the registry (no import cycle)
- [x] 148 tests; screenshots checked (star, Mod D, Save toast, favorites view, editor, Mod K finds snippets)
- [x] Checked by Khaled on Windows, committed

## Phase 9 — Integrations (built, waiting for Khaled's check)
- [x] Rust side (src-tauri/src): `db.rs` (sqlx 0.9: PostgreSQL, MySQL/MariaDB, SQLite; every value returned as text; read-only enforced by the database; 15 s connect / 2 min query timeouts; one connection per call, nothing stored), `runner.rs` (run a command in a folder with streamed output + Stop that kills the whole tree; open a real terminal: Windows Terminal → cmd fallback, macOS Terminal), `vscode.rs` (install snippets into VS Code's user folder, write a generated project into a new/empty folder with path checks, open a folder in VS Code)
- [x] Frontend bridge: `src/lib/native.ts` (typed invoke wrappers, isDesktop, pickFolder); browser shows "desktop app only" hints
- [x] Database → **Connect & query**: fields or pasted URL (Prisma URLs cleaned), tables sidebar, SQL editor (Mod Enter), Read-only on by default, max rows, results grid (NULL shown), copy CSV/JSON, **Import into designer** (introspection → Schema, Undo)
- [x] Password + pasted URL live in memory only (`lib/session.ts`), shared with "Connection string"
- [x] Commands: Run here / Terminal / VS Code under every command, remembered project folder (+ recent); danger commands need a second click
- [x] My Library: **Install into VS Code**; Templates: **Create folder** → "Open in VS Code"
- [x] Verified in Claude's Linux sandbox: `cargo clippy` clean; Rust tests incl. real PostgreSQL 16 + MariaDB (`DEVKIT_PG_URL=… DEVKIT_MYSQL_URL=… cargo test -- --ignored`); introspection SQL run on all 3 engines with our Shop/Auth/Blog DDL → fixtures in `src/modules/database/fixtures/` (read-back equals the original schema); 154 frontend tests; UI checked with a mocked Tauri bridge
- [ ] Windows-only code paths (cmd/taskkill/wt/code) reviewed but only compiled on Windows → check on Khaled's PC
- [ ] Checked by Khaled on Windows (first `pnpm tauri dev` compiles sqlx + SQLite: a few minutes)

## Open questions / later
- Khaled's Node.js is managed by **fnm** (default v26). Fixed for every shell by adding `%APPDATA%\fnm\aliases\default` to the user PATH (pnpm is installed globally there). If node/pnpm go missing after changing Node versions, check that folder first.
- `fluidClamp()` (design/lib/scale.ts) is reused by the Responsive phase for the clamp() generator.
- Image tool: one file at a time; batch convert later. Lossy output can be bigger than a small PNG (shown in orange).
- Package-manager switch (npm ↔ pnpm ↔ yarn) on install commands — later; for now npm and pnpm have their own lists.
- Prisma 8 is in RC; commands target Prisma 7 (stable). Re-check when 8 is GA.
- shadcn registry is blocked in Claude's sandbox: button/tooltip/dialog/input were written by hand in shadcn style. On Windows, `pnpm dlx shadcn@latest add <x>` works normally.
- Library lives in localStorage; consider a file-based store with automatic backups (Phase 10). VS Code install is done (Phase 9).
- SQL Server / MongoDB live connections: not in Phase 9 (sqlx has no SQL Server driver); add with tiberius / mongodb crates if needed.
- Clipboard uses navigator.clipboard; switch to the Tauri clipboard plugin if WebView2/macOS ever refuses.
- CSP is `null` in tauri.conf.json for now → set a strict CSP in Phase 10.
- productName is `Khaleds Dev Kit` (no apostrophe, safer for installers); window title keeps "Khaled's".

## Idea backlog
- Templates, next steps: "matching database" button (Shop → e-commerce, Auth → login pages) via a shared store in src/lib; optional GSAP entrance animations; multi-page export (e.g. store home + product + cart in one project); edit texts inline.

## Phase log
| Phase | Status | Notes |
|---|---|---|
| 0 Setup | done | 2026-11-20 |
| 1 Shell (layout, sidebar, Mod+K, registry, themes) | done | 2026-11-20 |
| 2 Terminal Commands | done | 2026-11-20 |
| 3 Formatters + Converters | done | 2026-11-20 |
| 4 CSS Visual Editors + Design | done | 2026-11-20 |
| 5 GSAP & Scroll | done | 2026-11-20 |
| 6 Responsive Tools | done | 2026-11-20 |
| 7 Database | done | 2026-11-20 |
| 7.5 Templates | done | 2026-11-20 |
| 8 My Library + VS Code snippet export | done | 2026-11-20 |
| 9 Integrations (DB connect, run commands, VS Code) | built | 2026-11-20, waiting for Windows check |
| 10 Polish (installer, auto-update, perf) | — | |
