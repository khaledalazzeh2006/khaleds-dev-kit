import { create } from "zustand";
import { persist } from "zustand/middleware";
import { templates, type Schema } from "./schema";

/** The schema being designed. Shared by the designer and the seed generator, saved between sessions. */
export const useSchema = create<{ schema: Schema; setSchema: (s: Schema) => void }>()(
  persist((set) => ({ schema: templates.Blog!(), setSchema: (schema) => set({ schema }) }), {
    name: "devkit-db-schema",
  }),
);
