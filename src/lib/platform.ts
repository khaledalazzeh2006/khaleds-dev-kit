/** True on macOS. Decides whether "Mod" means Cmd (⌘) or Ctrl. */
export const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** Label for the Mod key, used in shortcut hints. */
export const modLabel = isMac ? "⌘" : "Ctrl";
