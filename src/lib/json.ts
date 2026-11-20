// Shared by Formatters and Converters.

/** Parse JSON with a readable error that includes line and column. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const pos = Number(/position (\d+)/.exec(msg)?.[1]);
    if (Number.isFinite(pos)) {
      const before = text.slice(0, pos).split("\n");
      const line = before.length;
      const col = (before.at(-1)?.length ?? 0) + 1;
      throw new Error(
        `Invalid JSON at line ${line}, column ${col}: ${msg.replace(/ in JSON at position \d+.*$/, "")}`,
        { cause: e },
      );
    }
    throw new Error(`Invalid JSON: ${msg}`, { cause: e });
  }
}
