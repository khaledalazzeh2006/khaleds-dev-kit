import { toast } from "sonner";
import { isDesktop } from "./native";

export type UpdateState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "none" }
  | { kind: "available"; version: string; notes?: string }
  | { kind: "downloading"; percent: number }
  | { kind: "error"; message: string };

type Update = NonNullable<Awaited<ReturnType<typeof import("@tauri-apps/plugin-updater").check>>>;
let pending: Update | null = null;

/** Updates come from GitHub Releases, signed; see RELEASE.md. */
export async function checkForUpdate(): Promise<UpdateState> {
  if (!isDesktop()) return { kind: "error", message: "Updates work in the installed app." };
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    pending = await check();
    return pending
      ? { kind: "available", version: pending.version, notes: pending.body ?? undefined }
      : { kind: "none" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      kind: "error",
      message: /endpoint|pubkey|public key/i.test(msg)
        ? "Updates aren't set up yet (see RELEASE.md in the project)."
        : `Couldn't check for updates: ${msg}`,
    };
  }
}

/** Download, install, restart. `onProgress` gets 0–100. */
export async function installUpdate(onProgress: (percent: number) => void): Promise<void> {
  if (!pending) throw new Error("No update to install.");
  let total = 0;
  let done = 0;
  await pending.downloadAndInstall((event) => {
    if (event.event === "Started") total = event.data.contentLength ?? 0;
    if (event.event === "Progress") {
      done += event.data.chunkLength;
      if (total) onProgress(Math.min(100, Math.round((done / total) * 100)));
    }
  });
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}

/** Quiet check a few seconds after launch; only speaks up when there is something new. */
export function checkForUpdateInBackground(openAbout: () => void, delay = 8000): () => void {
  if (!isDesktop()) return () => {};
  const timer = setTimeout(async () => {
    const state = await checkForUpdate();
    if (state.kind === "available")
      toast(`Version ${state.version} is available`, {
        action: { label: "See update", onClick: openAbout },
        duration: 15000,
      });
  }, delay);
  return () => clearTimeout(timer);
}
