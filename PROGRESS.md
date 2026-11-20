# Progress

**Current phase:** 7 — Database (waiting for Khaled to test)
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

## Phase 7 — Database (built, waiting for Khaled's check)
- [x] Module `database` (order 35): Schema designer (tables/columns, PK/NULL/UQ, defaults, FK + on delete, templates Blank/Blog/Shop/Auth with Undo, validation, Import SQL from CREATE TABLE)
- [x] Outputs: PostgreSQL / MySQL / SQLite / SQL Server DDL, Prisma 7 (prisma-client generator), TypeORM, Mongoose, EF Core, Mermaid ER; ER diagram view + Expand dialog
- [x] SQL Server rules: no RESTRICT (→ NO ACTION), multiple cascade paths downgraded to NO ACTION, Prisma `onUpdate: NoAction`
- [x] Seed data (faker, reproducible seed): FKs pick real parent keys (int or uuid); SQL per dialect / JSON / CSV
- [x] Connection string builder (password kept in memory only, never saved)
- [x] 13 SQL snippets (content/snippets/sql) grouped Queries / Writes / Performance / PostgreSQL
- [x] Verified: all 16 template×provider Prisma schemas pass Prisma's validator; DDL + seeds run in SQLite with foreign_keys=ON; 101 tests
- [ ] Checked by Khaled on Windows (`pnpm install` first — new dep @faker-js/faker)

## Open questions / later
- Khaled's Node.js is managed by **fnm** (default v26). Fixed for every shell by adding `%APPDATA%\fnm\aliases\default` to the user PATH (pnpm is installed globally there). If node/pnpm go missing after changing Node versions, check that folder first.
- `fluidClamp()` (design/lib/scale.ts) is reused by the Responsive phase for the clamp() generator.
- Image tool: one file at a time; batch convert later. Lossy output can be bigger than a small PNG (shown in orange).
- Package-manager switch (npm ↔ pnpm ↔ yarn) on install commands — later; for now npm and pnpm have their own lists.
- Prisma 8 is in RC; commands target Prisma 7 (stable). Re-check when 8 is GA.
- shadcn registry is blocked in Claude's sandbox: button/tooltip/dialog/input were written by hand in shadcn style. On Windows, `pnpm dlx shadcn@latest add <x>` works normally.
- Clipboard uses navigator.clipboard; switch to the Tauri clipboard plugin if WebView2/macOS ever refuses.
- CSP is `null` in tauri.conf.json for now → set a strict CSP in Phase 10.
- productName is `Khaleds Dev Kit` (no apostrophe, safer for installers); window title keeps "Khaled's".

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
| 7 Database | built | 2026-11-20, waiting for Windows check |
| 8 My Library + VS Code snippet export | — | |
| 9 Integrations (DB connect, run commands, VS Code extension) | — | |
| 10 Polish (installer, auto-update, perf) | — | |
