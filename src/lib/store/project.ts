import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The project folder commands run in (and recent ones), remembered between sessions. */
interface ProjectState {
  folder: string;
  recent: string[];
  setFolder: (folder: string) => void;
}

export const useProject = create<ProjectState>()(
  persist(
    (set) => ({
      folder: "",
      recent: [],
      setFolder: (folder) =>
        set((s) => ({
          folder,
          recent: [folder, ...s.recent.filter((f) => f !== folder)].slice(0, 8),
        })),
    }),
    { name: "devkit-project" },
  ),
);

/** Last part of a path, for compact labels. */
export const folderName = (path: string) => path.split(/[\\/]/).filter(Boolean).pop() ?? path;
