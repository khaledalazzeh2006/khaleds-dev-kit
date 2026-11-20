# Progress

**Current phase:** 3 — Formatters + Converters (built, waiting for Khaled's check on Windows)
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

## Phase 3 — Formatters + Converters
- [x] Shared: CodeInput (CodeMirror 6, themed by tokens, syntax colors in theme.css), OutputCode `language`, Segmented, RangeField, CopyRows, usePersistentState, useAsyncResult, saveBlob
- [x] Formatters module: JSON (format/minify/validate with line+col), HTML, CSS (+minify), JavaScript (+minify), TypeScript, SQL (dialect + keyword case), Diff (+ unified patch)
- [x] Converters: Color (HEX/RGB/HSL/OKLCH + WCAG contrast), Image (WebP/AVIF/JPEG/PNG, quality, max width, worker + WASM, native Save dialog), JSON↔YAML, JSON↔CSV, JSON→TS, SVG→JSX (+safe preview), Base64, URL (+parts), Timestamp
- [x] Tool inputs/options remembered between sessions
- [x] Rust: tauri-plugin-dialog + tauri-plugin-fs (capabilities: dialog:allow-save, fs:allow-write-file)
- [x] 51 tests; screenshots checked for every tool (dark + light); WebP and AVIF encoding verified in Chromium
- [ ] Khaled: `pnpm install` + `pnpm tauri dev` (Rust rebuild for the new plugins), test Image → Save, then commit

## Open questions / later
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
| 3 Formatters + Converters | review | 2026-11-20 |
| 4 CSS Visual Editors + Design | — | |
| 5 GSAP & Scroll | — | |
| 6 Responsive Tools | — | |
| 7 Database | — | |
| 8 My Library + VS Code snippet export | — | |
| 9 Integrations (DB connect, run commands, VS Code extension) | — | |
| 10 Polish (installer, auto-update, perf) | — | |
