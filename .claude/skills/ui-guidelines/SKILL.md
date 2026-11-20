---
name: ui-guidelines
description: Design and UX rules for Khaled's Dev Kit. Use before building or changing any screen, component, layout, theme token or interaction, so every module looks and behaves the same and stays easy to use.
---

# UI guidelines

The bar: **a tool must be usable without explanation.** If it needs a tooltip to be understood,
redesign it. References for feel: Raycast, Linear, VS Code. Calm, dense, fast, keyboard-first.

## 1. App frame
- Three panes: **Sidebar** (modules) → **List** (items in module) → **Detail** (tool / preview).
- Window width (use container queries on the app root, not media queries):
  - ≥ 1100px: all three panes.
  - 760–1099px: sidebar collapses to icons (tooltips on hover).
  - < 760px: single pane with a back button; list and detail stack.
- Min window size 640×480 (set in tauri.conf).
- Title bar area: app name left, global search hint `Mod K` right.

## 2. Tokens (all in `src/app/theme.css` — the single source of truth)
- Names follow shadcn/ui so its components work unmodified. Use them as Tailwind classes
  (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`, `ring-ring`...).
  Never raw hex/oklch or arbitrary colors in components.
- Neutrals = zinc. Brand color = `primary` (violet). NOTE: shadcn's `accent` is the subtle
  hover surface, NOT the brand color.
- Surfaces: `background` (app), `card` (panels), `popover` (floating), `muted` (code blocks, wells).
- Status: `destructive`, `success`, `warning`.
- Themes: dark (default) and light, plus "system". Both must pass WCAG AA contrast (4.5:1 text).
- Spacing: 4px grid only (Tailwind 1 = 4px). Panel padding 16px, gaps 8/12/16.
- Radius: `rounded-md` (6px) controls, `rounded-lg` (10px) cards/panels, `rounded-full` pills.
- Type: `font-sans` = Inter, `font-mono` = JetBrains Mono (bundled via @fontsource, works offline).
  Sizes: 12 (meta), 13 (body/UI default), 14 (inputs, list titles), 16 (section title), 20 (page title).
  Weights 400/500/600 only.
- Shadows: only on floating layers (palette, popovers, toasts).
- Motion: 150ms ease-out for hover/focus, 200ms for panels. Respect `prefers-reduced-motion`.

## 3. The Tool layout (every tool uses the same shared component)
```
┌ ToolHeader: title · short one-line description · actions (Reset, Settings?) ┐
├ Input pane (left / top)        │ Output pane (right / bottom)                │
│ controls, sliders, text input  │ live preview  +  code block                 │
│                                │ [Copy] always top-right of the code block   │
└──────────────────────────────────────────────────────────────────────────────┘
```
- Use `<ToolLayout>`, `<ToolHeader>`, `<OutputCode>` from `src/components/tool/`. Don't hand-roll.
- Output updates live (debounce 150ms for heavy work). No "Generate" button unless the work is slow (>300ms).
- Output format switch (e.g. CSS ↔ Tailwind, SQL dialect) is a segmented control above the code block.
- Every tool opens with sensible defaults already producing a result — never an empty screen.

## 4. Copy & feedback
- Copy button: icon + "Copy" text, top-right of every code block. After copy: icon becomes a check
  for 1.5s and a toast "Copied" appears (bottom-center, 1.5s). Same everywhere.
- Enter on a selected list item = copy its main value. Mod+C with no text selection in a tool = copy output.
- Errors: inline, under the input that caused them, in `text-destructive`, one sentence saying how to fix.
  Never alert(), confirm() or blocking modals for errors.
- Destructive actions (delete my snippet): undo toast for 5s instead of a confirm dialog.

## 5. Lists & search
- List rows: title (14/500), one-line description (12, muted), right-aligned tags/badge.
- Filter box at top of every list; `/` focuses it. Fuzzy match. Highlight matched characters.
- Empty search result: say what was searched and offer "Search everywhere (Mod K)".
- Command palette results grouped by module, max 8 per group, recent items first.

## 6. Keyboard (Mod = Ctrl on Windows, Cmd on macOS)
- `Mod K` palette · `Mod 1..9` jump to module · `/` filter list · `↑↓` move · `Enter` copy/open
- `Esc` closes the top layer, then clears the filter · `Mod ,` settings · `Mod B` toggle sidebar
- Every interactive element reachable by Tab, with a visible focus ring (2px `ring`, 2px offset — set globally in theme.css).
- Show shortcuts in tooltips and palette rows (`<Kbd>` component).

## 7. Components
- Use shadcn/ui primitives first (Button, Input, Select, Slider, Tabs, Tooltip, Dialog, Popover,
  ToggleGroup, ScrollArea). Wrap, don't fork. New shared components go in `src/components/`.
- Buttons: one primary per view max. Icon-only buttons need `aria-label` + tooltip.
- Sliders always paired with a number input showing the value and unit.
- Color inputs: swatch + text field accepting HEX/RGB/HSL/OKLCH.

## 8. Writing (UI copy)
- English, sentence case, short. Verbs on buttons ("Copy", "Reset", "Export").
- No jargon the tool doesn't need. Units always shown (px, rem, ms).

## 9. Before you finish a UI change, check
- [ ] Uses tokens only (no raw colors/sizes)  - [ ] Dark + light look right
- [ ] Works at <760px and ≥1100px             - [ ] Fully keyboard usable, focus visible
- [ ] Default state already shows a result    - [ ] Copy behaves exactly as §4
