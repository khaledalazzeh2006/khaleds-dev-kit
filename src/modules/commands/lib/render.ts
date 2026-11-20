import type { Command } from "@/lib/content/schema";

export type Platform = "windows" | "macos";

/** The command text for this OS (platform override if the entry has one). */
export function baseCommand(cmd: Command, platform: Platform): string {
  return cmd.platforms?.[platform] ?? cmd.command;
}

/** Replace every {{key}} with its value; empty values fall back to the entry's default. */
export function fillVars(text: string, cmd: Command, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = values[key]?.trim();
    if (value) return value;
    return cmd.vars?.find((v) => v.key === key)?.default ?? match;
  });
}

/** Final command: platform text + filled vars + selected flags (in the entry's order). */
export function renderCommand(
  cmd: Command,
  opts: { platform: Platform; values?: Record<string, string>; flags?: string[] },
): string {
  const filled = fillVars(baseCommand(cmd, opts.platform), cmd, opts.values ?? {});
  const selected = (cmd.flags ?? []).map((f) => f.flag).filter((f) => opts.flags?.includes(f));
  return [filled, ...selected].join(" ");
}
