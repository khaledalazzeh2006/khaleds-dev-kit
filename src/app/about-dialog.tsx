import { useEffect, useState } from "react";
import { Download, FolderOpen, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/kbd";
import {
  appVersion,
  backupsPath,
  isDesktop,
  listLibraryBackups,
  readLibraryBackup,
  revealPath,
  type BackupFile,
} from "@/lib/native";
import { useLibrary } from "@/lib/store/library";
import { parseLibraryBackup } from "@/lib/store/library-backup-format";
import { checkForUpdate, installUpdate, type UpdateState } from "@/lib/updates";
import { useUi } from "@/lib/store/ui";

const SHORTCUTS: [string[], string][] = [
  [["mod", "K"], "Search everything"],
  [["/"], "Filter the list"],
  [["↑", "↓"], "Move in the list"],
  [["↵"], "Copy or open"],
  [["mod", "C"], "Copy the tool output"],
  [["mod", "D"], "Add to favorites"],
  [["mod", "B"], "Collapse the sidebar"],
  [["mod", "1…9"], "Jump to a section"],
];

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function AboutDialog() {
  const open = useUi((s) => s.aboutOpen);
  const setOpen = useUi((s) => s.setAboutOpen);
  const [version, setVersion] = useState(__APP_VERSION__);
  const [update, setUpdate] = useState<UpdateState>({ kind: "idle" });
  const [backups, setBackups] = useState<BackupFile[] | null>(null);

  useEffect(() => {
    if (!open) return;
    void appVersion().then(setVersion);
    if (isDesktop()) void listLibraryBackups().then(setBackups, () => setBackups([]));
  }, [open]);

  const check = async () => {
    setUpdate({ kind: "checking" });
    setUpdate(await checkForUpdate());
  };

  const install = async () => {
    try {
      setUpdate({ kind: "downloading", percent: 0 });
      await installUpdate((percent) => setUpdate({ kind: "downloading", percent }));
    } catch (e) {
      setUpdate({ kind: "error", message: message(e) });
    }
  };

  const restore = async (name: string) => {
    try {
      const b = parseLibraryBackup(await readLibraryBackup(name));
      const lib = useLibrary.getState();
      const s = lib.importSnippets(b.snippets);
      const f = lib.importFavorites(b.favorites);
      toast.success(
        `Restored ${s} snippet${s === 1 ? "" : "s"} and ${f} favorite${f === 1 ? "" : "s"} from ${name}`,
      );
    } catch (e) {
      toast.error(message(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[8%] flex max-h-[84vh] max-w-lg flex-col gap-5 overflow-auto p-5">
        <div className="flex items-center gap-4">
          <img src="/favicon.svg" alt="" className="size-14" />
          <div>
            <DialogTitle className="text-lg font-semibold">Khaled&apos;s Dev Kit</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Version {version} · offline toolbox for web developers
            </DialogDescription>
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Updates
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {update.kind === "available" ? (
              <Button size="sm" onClick={() => void install()}>
                <Download /> Install {update.version} and restart
              </Button>
            ) : update.kind === "downloading" ? (
              <Button size="sm" disabled>
                <Loader2 className="animate-spin" /> Downloading… {update.percent}%
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => void check()}
                disabled={update.kind === "checking"}
              >
                {update.kind === "checking" ? <Loader2 className="animate-spin" /> : <RefreshCw />}{" "}
                Check for updates
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {update.kind === "none" && "You have the latest version."}
              {update.kind === "error" && (
                <span className="text-destructive">{update.message}</span>
              )}
            </span>
          </div>
          {update.kind === "available" && update.notes && (
            <p className="rounded-md bg-muted/50 p-2.5 text-xs whitespace-pre-wrap text-muted-foreground">
              {update.notes}
            </p>
          )}
        </section>

        {isDesktop() && (
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Library backups
            </h3>
            <p className="text-sm text-muted-foreground">
              A copy of My Library is saved every day you use it (last 14 days). Restoring merges;
              nothing is overwritten.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Backup to restore"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) void restore(e.target.value);
                  e.target.value = "";
                }}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                disabled={!backups?.length}
              >
                <option value="">
                  {backups?.length ? `Restore from… (${backups.length})` : "No backups yet"}
                </option>
                {backups?.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name.slice(8, 18)} · {(b.size / 1024).toFixed(1)} KB
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  void backupsPath()
                    .then(revealPath)
                    .catch((e: unknown) => toast.error(message(e)))
                }
              >
                <FolderOpen /> Show folder
              </Button>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Shortcuts
          </h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {SHORTCUTS.map(([keys, label]) => (
              <li key={label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{label}</span>
                <Kbd keys={keys} />
              </li>
            ))}
          </ul>
        </section>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RotateCcw className="size-3" /> Everything stays on this computer. No accounts, no
          tracking.
        </p>
      </DialogContent>
    </Dialog>
  );
}
