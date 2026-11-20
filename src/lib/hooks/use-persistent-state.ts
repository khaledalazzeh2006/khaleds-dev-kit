import { useEffect, useState } from "react";

const MAX_CHARS = 200_000; // don't fill localStorage with huge pastes

/** useState that survives app restarts (per-viewer, localStorage). Falls back silently if storage fails. */
export function usePersistentState<T>(key: string, initial: T) {
  const storageKey = `devkit:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      const raw = JSON.stringify(value);
      if (raw.length <= MAX_CHARS) localStorage.setItem(storageKey, raw);
    } catch {
      // storage full or unavailable: keep working in memory
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
