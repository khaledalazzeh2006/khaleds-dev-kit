import { create } from "zustand";

/** The item open in the detail pane (set by the shell), so tools can label saved output. */
interface ActiveItemState {
  moduleTitle: string;
  itemTitle: string;
  set: (moduleTitle: string, itemTitle: string) => void;
}

export const useActiveItem = create<ActiveItemState>()((set) => ({
  moduleTitle: "",
  itemTitle: "",
  set: (moduleTitle, itemTitle) => set({ moduleTitle, itemTitle }),
}));
