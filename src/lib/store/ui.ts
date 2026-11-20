import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  /** Sidebar forced to icons only (Mod B). */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  /** In narrow windows only one of list/detail is visible. */
  narrowView: "list" | "detail";
  setNarrowView: (view: "list" | "detail") => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  /** Most recent first, "<moduleId>:<itemId>" keys. */
  recent: string[];
  pushRecent: (key: string) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      narrowView: "list",
      setNarrowView: (narrowView) => set({ narrowView }),
      paletteOpen: false,
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      recent: [],
      pushRecent: (key) =>
        set((s) => ({ recent: [key, ...s.recent.filter((k) => k !== key)].slice(0, 20) })),
    }),
    {
      name: "devkit-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, recent: s.recent }),
    },
  ),
);
