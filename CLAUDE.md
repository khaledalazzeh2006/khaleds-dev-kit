# Khaled's Dev Kit

Personal desktop toolbox for web developers: framework terminal commands, GSAP/scroll snippets,
visual CSS editors, formatters, converters, database helpers and responsive tools — all offline,
all reachable from one command palette (Mod+K). Free, open-source stack only. Quality over speed.

## Start of every session (keep token use low)
1. Read `PROGRESS.md` only. It says the current phase, what is done and what is next.
2. Do NOT scan the whole repo. Open only the files the current task touches.
3. Load a skill only when its task comes up (see Skills below). `docs/` is reference — read a doc
   only when the task needs it.
4. Prefer small, focused sessions: one phase step per session.

## Stack (decided — see docs/decisions/)
- Desktop shell: Tauri 2 (Windows + macOS). Rust only for native work (files, DB, shell).
- UI: React 19 + TypeScript (strict) + Vite. Package manager: pnpm.
- Styling: Tailwind CSS v4 + shadcn/ui (Radix). Icons: lucide-react. Motion: `motion`.
- Routing: TanStack Router. State: Zustand. Palette: cmdk. Search: FlexSearch.
- Code views: CodeMirror 6 (Monaco only for diff view).
- User data: SQLite via tauri-plugin-sql. Static content: JSON in `content/`, validated with zod.
- Tests: Vitest + Testing Library.

## Structure
```
src/app/            shell: layout, sidebar, router, theme, command palette
src/modules/<id>/   one folder per module (commands, gsap, css-tools, database, formatters,
                    converters, design, responsive, library) — registered in src/app/registry.ts
src/components/ui/  shadcn components (generated, edit sparingly)
src/lib/            shared logic used by 2+ modules (search, stores, hooks, json, fluid, tailwind…)
content/            static data (commands/, snippets/) + schemas/
src-tauri/          Rust side
docs/               analysis, architecture, roadmap, decisions (ADRs)
```

## Golden rules
- UI text, code, comments, commit messages: English. UI is LTR.
- Talk to Khaled in Arabic (Palestinian dialect); keep technical terms in English.
- Surgical edits. Never rewrite a file when a targeted change was asked.
- Every UI change follows the `ui-guidelines` skill. Consistency beats cleverness.
- Cross-platform: use the `Mod` key (Ctrl on Windows, Cmd on macOS); use Tauri path APIs, never
  hard-coded paths or OS-specific shell syntax.
- No paid services, no telemetry, no network calls at runtime (the app works offline).
- Content (commands/snippets) comes only from official docs and must pass schema validation.
- Modules never import each other's files (ESLint enforces it). Shared code → `src/lib/`.
- Never add a dependency without saying why and checking its license is free for this use.
- Don't start the next phase until the current one passes `phase-review`.
- `useEffect` bodies always use braces — never `useEffect(() => fn())`. Some DOM APIs now return
  Promises (e.g. `scrollIntoView` in WebView2) and React crashes with "destroy is not a function".
- Test in `pnpm tauri dev` (StrictMode runs effect cleanups immediately), not only in a build.

## Skills (in .claude/skills/)
- `ui-guidelines` — before building or changing any screen or component.
- `new-module` — when adding a new section/module to the app.
- `content-data` — when adding or editing commands, snippets or other JSON content.
- `phase-review` — at the end of a phase or a big step, before committing.
- `templates` — when adding or changing template sections/presets (src/modules/templates).

## Commands (run on Windows from the repo root)
- `pnpm tauri dev` — run the desktop app with hot reload
- `pnpm dev` — frontend only in the browser (no native APIs)
- `pnpm check` — typecheck + lint + tests + content validation (run before every commit)
- `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm validate:content` · `pnpm format`
- `pnpm build` — frontend build · `pnpm tauri build` — installer for the current OS
- `pnpm dlx shadcn@latest add <component>` — add a shadcn/ui component into src/components/ui
