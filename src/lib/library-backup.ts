import { isDesktop, writeLibraryBackup } from "./native";
import { useLibrary } from "./store/library";
import { makeLibraryBackup } from "./store/library-backup-format";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Desktop app: after every change to My Library, write today's backup file (debounced).
 * One file per day, the last 14 days are kept (src-tauri/src/backups.rs). Returns a stop function.
 */
export function startLibraryBackups(delay = 3000): () => void {
  if (!isDesktop()) return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const save = () => {
    const { snippets, favorites } = useLibrary.getState();
    if (!snippets.length && !favorites.length) return;
    writeLibraryBackup(today(), makeLibraryBackup(snippets, favorites)).catch((e: unknown) => {
      console.warn("Library backup failed", e);
    });
  };
  save(); // also once per launch, so a day without edits still has a file
  const unsubscribe = useLibrary.subscribe((s, prev) => {
    if (s.rev === prev.rev) return;
    clearTimeout(timer);
    timer = setTimeout(save, delay);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
