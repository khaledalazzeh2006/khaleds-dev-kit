---
name: content-data
description: Rules and schemas for the static content of Khaled's Dev Kit — terminal commands, code snippets, cheatsheets in content/. Use when adding, editing or verifying any JSON content.
---

# Content data

Content is data, not code: JSON files in `content/`, validated against `content/schemas/`
(JSON Schema, mirrored by zod in `src/lib/content/schema.ts`). The app loads it at startup.

## Files
- `content/commands/<framework>.json` — array of Command entries for one framework/tool.
- `content/snippets/<category>/<id>.json` — one Snippet per file (has code + params + preview id).

## Rules
1. **Source = official docs only.** Each entry has `source` (URL of the official page). No blogs,
   no memory-only commands. If a command can't be confirmed in official docs, leave it out.
2. **`verified`** = `YYYY-MM` when it was last checked against the docs. Re-check entries older than 6 months.
3. **Cross-platform**: if a command differs on Windows/macOS, use `platforms` overrides.
   Prefer commands that work in PowerShell and zsh alike.
4. **Variables** use `{{name}}` in the command/code and must be declared in `vars`/`params` with a default.
5. **Ids** are kebab-case and unique across the whole content folder: `<framework>-<action>`.
6. **Scope**: commands a developer actually uses, not the whole CLI reference. ~20–40 per framework.
7. **Descriptions**: one plain sentence, what it does — not how. English.
8. **Dangerous commands** (delete data, force push, reset DB) get `"danger": true`; the UI shows a warning.
9. After editing, run `pnpm validate:content`. It must pass with zero errors.

## Frameworks
Ids (file name = framework id): npm, pnpm, git, vite-react, nextjs, express, nestjs, prisma,
threejs (incl. R3F, drei, gltfjsx), gltf-transform. A new framework needs an entry in
`src/modules/commands/lib/frameworks.ts` (label + order) — the content test fails otherwise.
Order inside a file = order in the app list, so put the most-used commands first.
Flags in `flags` are appended to the end of the command when toggled, so only list flags that
work at the end.

## Snippets (content/snippets/<category>/<id>.json)
- `code` = vanilla, `codeReact` = React version (useGSAP). Both may use `{{param}}` placeholders.
- `params[].type`: number (min/max/step/unit) · select/ease (`options`) · boolean · color · string.
- `preview` = id of a live preview component (GSAP: `src/modules/gsap/components/previews/index.ts`).
- `group` decides the list section. New GSAP snippets: also add the id to ORDER in `src/modules/gsap/lib/data.ts`.
- SQL snippets live in `content/snippets/sql/sql-<name>.json` (category "sql", id prefixed `sql-`, no params/preview).
  `group` is one of Queries / Writes / Performance / PostgreSQL and shows as "SQL · <group>". Write standard SQL
  and say in a comment when a line is PostgreSQL-only (e.g. RETURNING, JSONB).
- Tests fail if a snippet doesn't parse (with defaults filled), uses an undeclared param, or a React
  component name shadows an import — so run `pnpm test` after editing.

## Official sources
- Next.js: nextjs.org/docs · React/Vite: react.dev, vite.dev · Express: expressjs.com
- NestJS: docs.nestjs.com · Prisma: prisma.io/docs · Git: git-scm.com/docs · pnpm: pnpm.io
- Three.js: threejs.org/docs · R3F: r3f.docs.pmnd.rs · glTF Transform: gltf-transform.dev
- GSAP: gsap.com/docs · Tailwind: tailwindcss.com/docs · Tauri: v2.tauri.app
- PostgreSQL: postgresql.org/docs · MySQL: dev.mysql.com/doc · MongoDB: mongodb.com/docs

## Example
See `content/schemas/examples/`.
