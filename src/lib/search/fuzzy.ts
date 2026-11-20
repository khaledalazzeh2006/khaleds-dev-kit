export interface FuzzyMatch {
  score: number;
  /** Positions in the text that matched, for highlighting. */
  indices: number[];
}

/**
 * Subsequence fuzzy match ("pxr" matches "PX to REM"). Case-insensitive.
 * Higher score = better: rewards consecutive characters and word starts, penalises gaps.
 * Returns null when not every query character is found in order.
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const indices: number[] = [];
  let score = 0;
  let from = 0;
  let prev = -2;
  for (const ch of q) {
    if (ch === " ") continue;
    const i = t.indexOf(ch, from);
    if (i === -1) return null;
    const wordStart = i === 0 || /[\s\-_/.:]/.test(t[i - 1] ?? "");
    score += i === prev + 1 ? 5 : wordStart ? 3 : 1;
    score -= Math.min(i - from, 5) * 0.1;
    indices.push(i);
    prev = i;
    from = i + 1;
  }
  return { score, indices };
}
