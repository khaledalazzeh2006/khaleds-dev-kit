import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycle: () => void;
}

const order: ThemeMode[] = ["dark", "light", "system"];
const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** Put the resolved theme on <html> so the `.dark` tokens in theme.css apply. */
export function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && systemQuery().matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
      cycle: () => {
        const next = order[(order.indexOf(get().mode) + 1) % order.length] ?? "dark";
        get().setMode(next);
      },
    }),
    { name: "devkit-theme" },
  ),
);

/** Apply the saved theme before first paint and follow OS changes while in "system" mode. */
export function initTheme() {
  applyTheme(useTheme.getState().mode);
  systemQuery().addEventListener("change", () => {
    if (useTheme.getState().mode === "system") applyTheme("system");
  });
}
