import { useEffect, useState } from "react";

export interface AsyncResult<T> {
  data?: T;
  error?: string;
}

/**
 * Run an async computation when deps change (debounced) and keep the latest result.
 * Stale runs are ignored, so fast typing never shows an older result.
 */
export function useAsyncResult<T>(
  fn: () => Promise<T>,
  deps: unknown[],
  delay = 150,
): AsyncResult<T> {
  const [result, setResult] = useState<AsyncResult<T>>({});

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fn().then(
        (data) => {
          if (!cancelled) setResult({ data });
        },
        (e: unknown) => {
          if (!cancelled) setResult({ error: e instanceof Error ? e.message : String(e) });
        },
      );
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes the real deps
  }, deps);

  return result;
}
