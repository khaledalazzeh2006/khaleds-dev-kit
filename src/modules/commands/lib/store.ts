import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Last value typed for each variable key ("name", "pkg", "branch"...), shared across commands,
 * so typing a project name once fills it everywhere.
 */
export const useCommandVars = create<{
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  reset: (keys: string[]) => void;
}>()(
  persist(
    (set) => ({
      values: {},
      setValue: (key, value) => set((s) => ({ values: { ...s.values, [key]: value } })),
      reset: (keys) =>
        set((s) => ({
          values: Object.fromEntries(Object.entries(s.values).filter(([k]) => !keys.includes(k))),
        })),
    }),
    { name: "devkit-command-vars" },
  ),
);
