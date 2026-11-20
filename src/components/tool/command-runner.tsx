import { useEffect, useRef, useState } from "react";
import { Code2, FolderOpen, Play, Square, SquareTerminal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DESKTOP_ONLY,
  isDesktop,
  openInVsCode,
  openTerminal,
  pickFolder,
  runCommand,
  stopCommand,
  type RunEvent,
} from "@/lib/native";
import { folderName, useProject } from "@/lib/store/project";
import { cn } from "@/lib/utils";

const MAX_LINES = 3000;
interface Line {
  text: string;
  err: boolean;
}

/**
 * Run a command in the remembered project folder: here (output streams below) or in a real
 * terminal window (for commands that ask questions). Dangerous commands need a second click.
 */
export function CommandRunner({ command, danger }: { command: string; danger?: boolean }) {
  const { folder, recent, setFolder } = useProject();
  const [pid, setPid] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [exit, setExit] = useState<number | null | undefined>(undefined);
  const [armed, setArmed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!isDesktop()) {
    return <p className="text-xs text-muted-foreground">Run in your project: {DESKTOP_ONLY}</p>;
  }

  const choose = async () => {
    const dir = await pickFolder("Project folder to run commands in");
    if (dir) setFolder(dir);
  };

  const onEvent = (e: RunEvent) => {
    if (e.event === "exit") {
      setPid(null);
      setExit(e.data.code);
      return;
    }
    setLines((prev) => {
      const next = [...prev, { text: e.data, err: e.event === "stderr" }];
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
    });
  };

  const run = async () => {
    if (danger && !armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    setLines([{ text: `$ ${command}`, err: false }]);
    setExit(undefined);
    try {
      setPid(await runCommand(folder, command, onEvent));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const terminal = async () => {
    try {
      await openTerminal(folder, command);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section aria-label="Run" className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void choose()}
          title={folder || undefined}
        >
          <FolderOpen /> {folder ? folderName(folder) : "Choose project folder"}
        </Button>
        {recent.length > 1 && (
          <select
            aria-label="Recent folders"
            value=""
            onChange={(e) => e.target.value && setFolder(e.target.value)}
            className="h-7 max-w-40 rounded-md border border-input bg-background px-1.5 text-xs text-muted-foreground"
          >
            <option value="">Recent…</option>
            {recent.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto flex gap-1.5">
          {pid !== null ? (
            <Button size="sm" variant="destructive" onClick={() => void stopCommand(pid)}>
              <Square /> Stop
            </Button>
          ) : (
            <Button
              size="sm"
              variant={danger ? "destructive" : "default"}
              disabled={!folder}
              onClick={() => void run()}
            >
              <Play /> {armed ? "Click again to run" : "Run"}
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={!folder} onClick={() => void terminal()}>
            <SquareTerminal /> Terminal
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!folder}
            title="Open this folder in VS Code"
            onClick={() =>
              void openInVsCode(folder).catch((e: unknown) =>
                toast.error(e instanceof Error ? e.message : String(e)),
              )
            }
          >
            <Code2 /> VS Code
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {folder ? (
          <>
            Runs in <span className="font-mono break-all">{folder}</span>. Commands that ask
            questions (like create-vite) need <b className="font-medium">Terminal</b>.
          </>
        ) : (
          "Pick the folder of your project; it's remembered for every command."
        )}
      </p>
      {lines.length > 0 && (
        <div className="overflow-hidden rounded-md border bg-muted/40">
          <div className="flex h-8 items-center justify-between border-b px-3 text-xs">
            <span
              className={cn(
                "text-muted-foreground",
                exit === 0 && "text-success",
                exit !== undefined && exit !== 0 && "text-destructive",
              )}
            >
              {pid !== null
                ? "Running…"
                : exit === undefined
                  ? ""
                  : exit === 0
                    ? "Done (exit code 0)"
                    : `Failed (exit code ${exit ?? "?"})`}
            </span>
            <Button variant="ghost" size="sm" disabled={pid !== null} onClick={() => setLines([])}>
              <Trash2 /> Clear
            </Button>
          </div>
          <div className="max-h-80 overflow-auto p-3 font-mono text-xs leading-relaxed">
            {lines.map((l, i) => (
              <div
                key={i}
                className={cn("break-all whitespace-pre-wrap", l.err && "text-muted-foreground")}
              >
                {l.text || " "}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>
      )}
    </section>
  );
}
