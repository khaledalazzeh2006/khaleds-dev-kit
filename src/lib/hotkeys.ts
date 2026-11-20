import { useEffect, useRef } from "react";
import { isMac } from "./platform";

/**
 * Match a keyboard event against a combo like "mod+k", "mod+shift+p", "/", "escape".
 * "mod" = Cmd on macOS, Ctrl elsewhere.
 */
export function matchesHotkey(e: KeyboardEvent, combo: string, mac = isMac): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop();
  const want = new Set(parts);
  const mod = mac ? e.metaKey : e.ctrlKey;
  if (want.has("mod") !== mod) return false;
  if (want.has("shift") !== e.shiftKey) return false;
  if (want.has("alt") !== e.altKey) return false;
  // The non-Mod modifier must not be pressed (e.g. Ctrl on macOS).
  if (mac ? e.ctrlKey : e.metaKey) return false;
  return e.key.toLowerCase() === key;
}

/** True when the user is typing in a field, so single-key shortcuts must not fire. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

/** Register global hotkeys for the lifetime of the component. Handlers always see fresh state. */
export function useHotkeys(map: HotkeyMap) {
  const ref = useRef(map);
  useEffect(() => {
    ref.current = map;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const [combo, handler] of Object.entries(ref.current)) {
        if (matchesHotkey(e, combo)) {
          handler(e);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
