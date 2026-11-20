import { isTauri } from "@tauri-apps/api/core";

/**
 * Save a file. Desktop app: native "Save as" dialog. Browser (pnpm dev): normal download.
 * Returns false if the user cancelled.
 */
export async function saveBlob(blob: Blob, suggestedName: string): Promise<boolean> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const ext = suggestedName.split(".").pop() ?? "";
    const path = await save({
      defaultPath: suggestedName,
      filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : [],
    });
    if (!path) return false;
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
    return true;
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: suggestedName });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
