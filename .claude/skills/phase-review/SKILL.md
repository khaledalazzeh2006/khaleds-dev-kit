---
name: phase-review
description: End-of-phase (or end-of-big-step) review for Khaled's Dev Kit — runs the Definition of Done, explains the important code to Khaled, updates PROGRESS.md and proposes the commit. Use before closing any phase or before committing a significant change.
---

# Phase review

Nothing moves to the next phase until every applicable item passes. If an item fails, fix it or
write it under "Open questions" in PROGRESS.md — never silently skip it.

## 1. Automated checks (run, don't assume)
- `pnpm typecheck` — zero errors
- `pnpm lint` — zero errors
- `pnpm test` — all green
- `pnpm validate:content` — if content changed
- `pnpm build` — frontend builds

## 2. Definition of Done (ask Khaled to confirm the ones only he can see on Windows)
- [ ] Runs on Windows (`pnpm tauri dev`); macOS checked via CI build when available
- [ ] Dark and light themes both look right
- [ ] Wide (≥1100px) and narrow (<760px) windows both work
- [ ] Everything is reachable and usable from the keyboard, focus is visible
- [ ] New tools/items appear in Mod K search
- [ ] No errors or warnings in the devtools console
- [ ] Content verified against official docs (`source`, `verified`)
- [ ] `ui-guidelines` §9 checklist passes for every changed screen

## 3. Explain to Khaled (in Arabic, Palestinian dialect; terms in English)
- 3–6 short points: what was built, the 1–2 key ideas in the code (why it's structured this way),
  and where to look in the files. Use concrete web-dev examples. Ask if anything is unclear.
- Point out any trade-off or shortcut taken, honestly.

## 4. Record
- Update `PROGRESS.md`: move done items, set the current phase/next steps, log the phase row.
- If a real decision was made (library choice, structure change), add an ADR in
  `docs/decisions/NNN-title.md` (Context · Decision · Consequences, ≤ 20 lines).
- Update the Commands section of CLAUDE.md if scripts changed.

## 5. Commit
Propose a Conventional Commit message, e.g. `feat(commands): add Next.js and NestJS command sets`.
Khaled runs the commit on Windows (or confirms before it's run).
