import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookmarkPlus, Download, FileUp, Plus, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/kbd";
import { OutputCode } from "@/components/tool/output-code";
import { isMac } from "@/lib/platform";
import { installVsCodeSnippets, isDesktop } from "@/lib/native";
import { saveBlob } from "@/lib/save-file";
import { useLibrary } from "@/lib/store/library";
import {
  makeLibraryBackup as makeBackup,
  parseLibraryBackup as parseBackup,
} from "@/lib/store/library-backup-format";
import { SNIPPET_PREFIX } from "../lib/items";
import { fromVsCode, languageFromFileName, toVsCodeText } from "../lib/vscode";

const SNIPPETS_FOLDER = isMac
  ? "~/Library/Application Support/Code/User/snippets/"
  : "%APPDATA%\\Code\\User\\snippets\\";

/** Read a file the user picks (works in the browser and in the desktop app). */
function useFilePicker(accept: string, onText: (text: string, name: string) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const input = (
    <input
      ref={ref}
      type="file"
      accept={accept}
      hidden
      onChange={async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) onText(await file.text(), file.name);
      }}
    />
  );
  return { input, open: () => ref.current?.click() };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export default function Manage() {
  const navigate = useNavigate();
  const snippets = useLibrary((s) => s.snippets);
  const favorites = useLibrary((s) => s.favorites);
  const [keepTabStops, setKeepTabStops] = useState(true);
  const vscode = toVsCodeText(snippets, keepTabStops);

  const openSnippet = (id: string) =>
    navigate({
      to: "/$moduleId/$itemId",
      params: { moduleId: "library", itemId: SNIPPET_PREFIX + id },
    });

  const newSnippet = () => {
    const s = useLibrary
      .getState()
      .addSnippet({ code: "", title: "Untitled snippet", language: "typescript" });
    openSnippet(s.id);
  };

  const vsImport = useFilePicker(".code-snippets,.json", (text, name) => {
    try {
      const added = useLibrary
        .getState()
        .importSnippets(fromVsCode(text, languageFromFileName(name)));
      toast.success(
        added
          ? `Imported ${added} snippet${added === 1 ? "" : "s"}`
          : "Nothing new: all of them are already here",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  });

  const backupImport = useFilePicker(".json", (text) => {
    try {
      const b = parseBackup(text);
      const lib = useLibrary.getState();
      const s = lib.importSnippets(b.snippets);
      const f = lib.importFavorites(b.favorites);
      toast.success(
        `Restored ${s} snippet${s === 1 ? "" : "s"} and ${f} favorite${f === 1 ? "" : "s"}`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  });

  const install = async () => {
    try {
      const path = await installVsCodeSnippets(vscode);
      toast.success(
        `Installed ${snippets.length} snippet${snippets.length === 1 ? "" : "s"} into VS Code`,
        {
          description: path,
        },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const download = async (text: string, name: string) => {
    if (await saveBlob(new Blob([text], { type: "application/json" }), name))
      toast.success(`Saved ${name}`);
  };

  return (
    <div className="@container flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">My Library</h2>
          <p className="text-xs text-muted-foreground">
            {snippets.length} snippet{snippets.length === 1 ? "" : "s"} · {favorites.length}{" "}
            favorite
            {favorites.length === 1 ? "" : "s"} · stored on this computer
          </p>
        </div>
        <Button size="sm" onClick={newSnippet}>
          <Plus /> New snippet
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 overflow-auto p-4 @min-[900px]:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card title="How to fill it">
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Star className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  Star any tool, command or snippet with the ☆ in its list, or press{" "}
                  <Kbd keys={["mod", "D"]} />. Favorites open right here.
                </span>
              </li>
              <li className="flex gap-2">
                <BookmarkPlus className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Press <b className="font-medium text-foreground">Save</b> next to Copy on any
                  output (a shadow, a query, a GSAP snippet…) to keep it as your own snippet.
                </span>
              </li>
              <li className="flex gap-2">
                <Plus className="mt-0.5 size-4 shrink-0" />
                <span>Or write one from scratch with New snippet.</span>
              </li>
            </ul>
          </Card>

          <Card title="VS Code snippets">
            <p className="text-sm text-muted-foreground">
              Use your library in VS Code: type a snippet’s prefix and press Tab.
            </p>
            <div className="flex flex-wrap gap-2">
              {isDesktop() && (
                <Button size="sm" disabled={!snippets.length} onClick={() => void install()}>
                  <Zap /> Install into VS Code
                </Button>
              )}
              <Button
                size="sm"
                variant={isDesktop() ? "outline" : "default"}
                disabled={!snippets.length}
                onClick={() => void download(vscode, "khaleds-dev-kit.code-snippets")}
              >
                <Download /> Export .code-snippets
              </Button>
              <Button size="sm" variant="outline" onClick={vsImport.open}>
                <FileUp /> Import from VS Code
              </Button>
              {vsImport.input}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={keepTabStops}
                onChange={(e) => setKeepTabStops(e.target.checked)}
                className="size-4 accent-primary"
              />
              Keep <code className="font-mono text-xs">$1</code> /{" "}
              <code className="font-mono text-xs">{"${1:name}"}</code> as tab stops (other $ are
              escaped)
            </label>
            <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
              {isDesktop() && (
                <li>Install writes it straight into VS Code (updates the same file every time).</li>
              )}
              <li>
                Or save the file into your VS Code snippets folder:{" "}
                <code className="font-mono break-all text-foreground">{SNIPPETS_FOLDER}</code>
              </li>
              <li>
                Or in VS Code: Snippets: Configure Snippets → New Global Snippets file, and paste.
              </li>
              <li>
                Import reads .code-snippets files and per-language files like typescript.json.
              </li>
            </ol>
          </Card>

          <Card title="Backup">
            <p className="text-sm text-muted-foreground">
              Everything (snippets + favorites) in one file. Importing merges; nothing is
              overwritten.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  void download(
                    makeBackup(snippets, favorites),
                    `dev-kit-library-${new Date().toISOString().slice(0, 10)}.json`,
                  )
                }
              >
                <Download /> Export backup
              </Button>
              <Button size="sm" variant="outline" onClick={backupImport.open}>
                <FileUp /> Import backup
              </Button>
              {backupImport.input}
            </div>
          </Card>
        </div>

        <div className="flex min-h-80 flex-col">
          {snippets.length ? (
            <OutputCode
              code={vscode}
              label="khaleds-dev-kit.code-snippets"
              language="json"
              meta={`${snippets.length} snippet${snippets.length === 1 ? "" : "s"}`}
              saveable={false}
              className="min-h-0 flex-1 overflow-auto"
            />
          ) : (
            <div className="grid flex-1 place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No snippets yet. Save one from any tool, or press New snippet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
