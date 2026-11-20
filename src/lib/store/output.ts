import { create } from "zustand";

/** The output of the tool on screen, so Mod C can copy it from anywhere in the tool. */
export const useActiveOutput = create<{ value: string | null; set: (v: string | null) => void }>(
  (set) => ({ value: null, set: (value) => set({ value }) }),
);
