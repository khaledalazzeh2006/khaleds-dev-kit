# 001 — Tauri 2 + React + TypeScript

**Context:** Desktop app for Windows + macOS that needs file system, DB connections and shell
access, must stay light, and is built by a web developer.

**Decision:** Tauri 2 shell, React 19 + TypeScript + Vite frontend, pnpm.

**Consequences:** small binaries and low RAM; UI is plain React; a little Rust for native
features (mostly via official plugins). macOS builds need a Mac or GitHub Actions.
Fallback: Electron can host the same React UI if Rust becomes a blocker.
