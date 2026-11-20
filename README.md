# Khaled's Dev Kit

Offline, keyboard-first desktop toolbox for web developers (Windows + macOS).
Built with Tauri 2, React, TypeScript, Tailwind and Rust.

**Inside:** terminal commands for 10 frameworks (run them in your project) · formatters & converters ·
CSS and design tools · GSAP & scroll snippets with live previews · responsive tools · database
designer, seed data, live PostgreSQL/MySQL/SQLite queries · page templates exported as React,
Next.js or HTML · My Library (favorites + your snippets, installed into VS Code).

## Develop

```bash
pnpm install
pnpm tauri dev     # desktop app with hot reload
pnpm check         # typecheck + lint + tests + content validation
pnpm tauri build   # local installer → src-tauri/target/release/bundle/
```

## Docs

- Releases & auto-update: `RELEASE.md`
- Vision & scope: `docs/01-vision.md` · Architecture: `docs/02-architecture.md` · Roadmap: `docs/03-roadmap.md`
- Current status: `PROGRESS.md` · Working rules for Claude: `CLAUDE.md`
