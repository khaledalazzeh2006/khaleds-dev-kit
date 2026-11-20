import { createTwoFilesPatch, diffLines } from "diff";

export interface DiffLine {
  type: "add" | "remove" | "same";
  text: string;
}

/** Line-by-line diff, flattened so each output row is one line. */
export function lineDiff(
  before: string,
  after: string,
): { lines: DiffLine[]; added: number; removed: number } {
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  for (const part of diffLines(before, after)) {
    const type = part.added ? "add" : part.removed ? "remove" : "same";
    const rows = part.value.replace(/\n$/, "").split("\n");
    for (const text of rows) lines.push({ type, text });
    if (type === "add") added += rows.length;
    if (type === "remove") removed += rows.length;
  }
  return { lines, added, removed };
}

/** Unified diff (patch) text. */
export function unifiedPatch(before: string, after: string): string {
  return createTwoFilesPatch("original", "changed", before, after, "", "", { context: 3 });
}
