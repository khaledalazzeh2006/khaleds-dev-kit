import { useState } from "react";
import { Check, Copy, FileCode2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeInput } from "@/components/tool/code-input";
import { Field } from "@/components/tool/field";
import { SelectField } from "@/components/tool/select-field";
import { copyText } from "@/lib/clipboard";
import { SNIPPET_LANGUAGES, toPrefix, useLibrary, type SnippetLanguage } from "@/lib/store/library";
import { toVsCodeText } from "../lib/vscode";

const LANGUAGE_OPTIONS = (Object.keys(SNIPPET_LANGUAGES) as SnippetLanguage[]).map((value) => ({
  value,
  label: SNIPPET_LANGUAGES[value].label,
}));

/** Edit one library snippet. Every change is saved right away. */
export default function SnippetEditor({ id }: { id: string }) {
  const snippet = useLibrary((s) => s.snippets.find((x) => x.id === id));
  const update = useLibrary((s) => s.updateSnippet);
  const [copied, setCopied] = useState(false);
  // Keep the prefix following the title until the user edits it.
  const [prefixTouched, setPrefixTouched] = useState(
    () => !!snippet && snippet.prefix !== toPrefix(snippet.title),
  );
  const [tagText, setTagText] = useState(() => snippet?.tags.join(", ") ?? "");
  if (!snippet) return null;

  const set = (patch: Parameters<typeof update>[1]) => update(id, patch);

  const remove = () => {
    const { removeSnippet, restoreSnippet } = useLibrary.getState();
    const removed = removeSnippet(id);
    if (removed)
      toast(`Deleted “${removed.title}”`, {
        action: { label: "Undo", onClick: () => restoreSnippet(removed) },
      });
  };

  const copyVsCode = async () => {
    const entry = toVsCodeText([snippet]).trim().slice(1, -1).trim(); // just the "name": {…} pair
    if (await copyText(entry + ","))
      toast("VS Code snippet copied: paste it inside your snippets file");
  };

  return (
    <div className="@container flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <input
          value={snippet.title}
          onChange={(e) =>
            set({
              title: e.target.value,
              ...(prefixTouched ? {} : { prefix: toPrefix(e.target.value) }),
            })
          }
          aria-label="Snippet title"
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void copyVsCode()}
          title="Copy as a VS Code snippet entry"
        >
          <FileCode2 /> VS Code
        </Button>
        <Button variant="ghost" size="sm" onClick={remove}>
          <Trash2 /> Delete
        </Button>
        <Button size="sm" onClick={async () => setCopied(await copyText(snippet.code))}>
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-4 overflow-auto p-4 @min-[760px]:grid-cols-[16rem_1fr] @min-[760px]:content-stretch">
        <section aria-label="Details" className="flex flex-col gap-3">
          <SelectField
            label="Language"
            value={snippet.language}
            options={LANGUAGE_OPTIONS}
            onChange={(language) => set({ language })}
          />
          <Field label="VS Code prefix" hint="Type this in VS Code, then press Tab.">
            {(fid) => (
              <Input
                id={fid}
                value={snippet.prefix}
                onChange={(e) => {
                  setPrefixTouched(true);
                  set({ prefix: e.target.value });
                }}
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
          <Field label="Tags" hint="Comma separated, e.g. react, hooks">
            {(fid) => (
              <Input
                id={fid}
                value={tagText}
                onChange={(e) => {
                  setTagText(e.target.value);
                  set({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean),
                  });
                }}
              />
            )}
          </Field>
          <Field label="Description">
            {(fid) => (
              <textarea
                id={fid}
                value={snippet.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={3}
                className="w-full resize-y rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            )}
          </Field>
          <p className="text-xs text-muted-foreground">
            {snippet.source && (
              <>
                From {snippet.source}
                <br />
              </>
            )}
            Saved automatically · edited {new Date(snippet.updatedAt).toLocaleString()}
          </p>
        </section>
        <section aria-label="Code" className="flex min-h-80 min-w-0 flex-col">
          <CodeInput
            value={snippet.code}
            onChange={(code) => set({ code })}
            language={SNIPPET_LANGUAGES[snippet.language].highlight}
            label="Snippet code"
            placeholder="Paste or write your code…"
            className="min-h-0 flex-1"
          />
        </section>
      </div>
    </div>
  );
}
