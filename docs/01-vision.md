# Vision & scope

**Khaled's Dev Kit** (`khaleds-dev-kit`) is a personal desktop app that replaces the daily
"search Google for that command/snippet/converter" loop with one offline, keyboard-first tool.

- **It is:** a reference library + small fast tools + one global search (Mod K).
- **It is not:** a code editor (VS Code), a design tool (Figma), or an AI code generator.
- **Success:** anything you need is copied within ~3 seconds of pressing Mod K.
- **Constraints:** free and open-source stack only, no runtime network, Windows + macOS,
  English LTR UI, quality and ease of use over speed of delivery.

## Modules
| Module | What it gives |
|---|---|
| Command Palette | fuzzy search over everything, recent-first |
| Terminal Commands | per-framework commands with fill-in variables and flags |
| GSAP & Scroll | snippets with live preview and editable params, easing visualizer |
| CSS Tools | visual editors (shadow, gradient, radius, flex/grid, glass, transitions, clip-path) → CSS or Tailwind |
| Database | table designer → SQL (Postgres first, MySQL, SQLite, SQL Server) / Prisma / Mongoose / TypeORM / EF Core; ER preview; SQL formatter; seed data |
| Formatters | JSON/HTML/CSS/JS/TS/SQL format & minify, diff, JSON tree |
| Converters | JSON↔YAML/CSV/TS types, px↔rem, colors, Base64, URL, timestamps, SVG→JSX, images (WebP/AVIF, favicons) |
| Design | palette, type scale, spacing, contrast checker, token export |
| Responsive | device preview, breakpoint reference, clamp() generator, media/container queries, srcset |
| My Library | favorites, own snippets, tags, history, export to VS Code snippets |

## Integrations (later phases)
- Easy: Open in VS Code, export `.code-snippets`, import `.sql` / Prisma schema.
- Medium: run commands from the app (with confirmation), direct DB connection (read-only by
  default; sqlx for Postgres/MySQL/SQLite, tiberius for SQL Server), VS Code extension talking to
  the app over localhost.
- Not feasible: controlling DBeaver/TablePlus/SSMS — we only generate connection strings.

## Licensing note
GSAP is free including commercial use, but its standard license restricts visual animation
builders that compete with Webflow. Fine for personal use; re-check before publishing the app.
