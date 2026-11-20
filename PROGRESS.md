# Progress

**Current phase:** 1 — Shell (built, waiting for Khaled's check on Windows)
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

## Phase 1 — Shell
- [x] Theme store (dark/light/system, persisted) + toggle in title bar
- [x] App frame: 3 panes, container queries (≥1100 / 760–1099 / <760 list-or-detail + back)
- [x] Module contract + registry (`src/app/module.ts`, `registry.ts`); routes generated: `/#/<module>/<item>`
- [x] Command palette (cmdk) on Mod K, FlexSearch index, grouped results, recent items
- [x] Hotkeys: Mod K, Mod B, Mod 1..9, Mod C (copy tool output), `/` filter, ↑↓ Enter Esc
- [x] Shared: ToolLayout, Field, OutputCode (copy + toast), Kbd, Highlight, route error screen
- [x] Demo module: Converters → PX ↔ REM (real tool, 5 tests)
- [x] `pnpm check` + build pass; screenshots checked at 1280 / 900 / 620 px, dark + light
- [ ] Khaled: `pnpm install` + `pnpm tauri dev` on Windows, try the shortcuts, then commit

## Open questions / later
- shadcn registry is blocked in Claude's sandbox: button/tooltip/dialog/input were written by hand in shadcn style. On Windows, `pnpm dlx shadcn@latest add <x>` works normally.
- Clipboard uses navigator.clipboard; switch to the Tauri clipboard plugin if WebView2/macOS ever refuses.
- CSP is `null` in tauri.conf.json for now → set a strict CSP in Phase 10.
- productName is `Khaleds Dev Kit` (no apostrophe, safer for installers); window title keeps "Khaled's".

## Phase log
| Phase | Status | Notes |
|---|---|---|
| 0 Setup | done | 2026-11-20 |
| 1 Shell (layout, sidebar, Mod+K, registry, themes) | review | 2026-11-20 |
| 2 Terminal Commands | — | |
| 3 Formatters + Converters | — | |
| 4 CSS Visual Editors + Design | — | |
| 5 GSAP & Scroll | — | |
| 6 Responsive Tools | — | |
| 7 Database | — | |
| 8 My Library + VS Code snippet export | — | |
| 9 Integrations (DB connect, run commands, VS Code extension) | — | |
| 10 Polish (installer, auto-update, perf) | — | |
