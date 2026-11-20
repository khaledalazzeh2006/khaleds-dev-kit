import { Channel, invoke, isTauri } from "@tauri-apps/api/core";

/**
 * Typed calls into the Rust side (src-tauri/src). Everything here works only in the desktop app;
 * check `isDesktop()` first and show a hint in the browser (`pnpm dev`).
 */
export const isDesktop = () => isTauri();

export const DESKTOP_ONLY = "Available in the desktop app (pnpm tauri dev).";

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function call<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  if (!isDesktop()) throw new Error(DESKTOP_ONLY);
  try {
    return await invoke<T>(cmd, args);
  } catch (e) {
    // Rust commands reject with a plain string.
    throw new Error(errorText(e), { cause: e });
  }
}

// ---------- database ----------

export interface QueryResult {
  columns: string[];
  rows: (string | null)[][];
  rowsAffected: number;
  truncated: boolean;
  elapsedMs: number;
}

export const dbQuery = (
  url: string,
  sql: string,
  opts: { maxRows?: number; readOnly?: boolean } = {},
) =>
  call<QueryResult>("db_query", {
    url,
    sql,
    maxRows: opts.maxRows,
    readOnly: opts.readOnly ?? true,
  });

// ---------- commands ----------

export type RunEvent =
  { event: "stdout" | "stderr"; data: string } | { event: "exit"; data: { code: number | null } };

/** Start a command in `cwd`; returns its pid. Output arrives through `onEvent`. */
export function runCommand(cwd: string, command: string, onEvent: (e: RunEvent) => void) {
  const channel = new Channel<RunEvent>();
  channel.onmessage = onEvent;
  return call<number>("run_command", { cwd, command, onEvent: channel });
}

export const stopCommand = (pid: number) => call<void>("stop_command", { pid });
export const openTerminal = (cwd: string, command: string) =>
  call<void>("open_terminal", { cwd, command });

// ---------- VS Code + files ----------

/** Writes the global snippets file; resolves to its path. */
export const installVsCodeSnippets = (content: string) =>
  call<string>("vscode_install_snippets", { content });

/** Creates `dir` (must be new or empty) with these files; resolves to the folder path. */
export const writeProject = (dir: string, files: Record<string, string>) =>
  call<string>("write_project", { dir, files });

export const openInVsCode = (path: string) => call<void>("open_in_vscode", { path });

export async function pickFolder(title: string): Promise<string | null> {
  if (!isDesktop()) throw new Error(DESKTOP_ONLY);
  const { open } = await import("@tauri-apps/plugin-dialog");
  const picked = await open({ directory: true, title });
  return typeof picked === "string" ? picked : null;
}

/** Join a folder and a name with the right separator for that folder. */
export function joinPath(dir: string, name: string): string {
  const sep = dir.includes("\\") && !dir.includes("/") ? "\\" : "/";
  return dir.replace(/[\\/]+$/, "") + sep + name;
}
