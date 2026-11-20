import { useEffect, useState } from "react";
import { BookmarkPlus, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { useActiveOutput } from "@/lib/store/output";
import { useActiveItem } from "@/lib/store/active-item";
import { snippetLanguageFor, useLibrary } from "@/lib/store/library";
import { cn } from "@/lib/utils";
import { CodeInput, type CodeLanguage } from "./code-input";

interface OutputCodeProps {
  code: string;
  /** Shown above the code, e.g. "CSS". */
  label?: string;
  /** Highlight with this language (read-only editor). Without it: plain text that wraps between words. */
  language?: CodeLanguage;
  /** Extra info shown next to the label, e.g. "1.2 KB → 840 B". */
  meta?: string;
  className?: string;
  /** Show "Save" (to My Library). Default true. */
  saveable?: boolean;
}

/** Hash route of a library snippet (hash history, so this works without the router object). */
const librarySnippetHref = (id: string) => `#/library/s-${id}`;

/** Save output to My Library, named after the open tool. Same code twice = no duplicate. */
function saveToLibrary(
  code: string,
  label: string | undefined,
  language: CodeLanguage | undefined,
) {
  const { moduleTitle, itemTitle } = useActiveItem.getState();
  const lib = useLibrary.getState();
  const existing = lib.snippets.find((s) => s.code === code);
  const title =
    label && itemTitle && !itemTitle.toLowerCase().includes(label.toLowerCase())
      ? `${itemTitle} · ${label}`
      : itemTitle || label || "Snippet";
  const snippet =
    existing ??
    lib.addSnippet({
      code,
      title,
      language: snippetLanguageFor(language),
      source: [moduleTitle, itemTitle].filter(Boolean).join(" · ") || undefined,
    });
  toast(existing ? "Already in My Library" : `Saved “${snippet.title}” to My Library`, {
    action: {
      label: "Open",
      onClick: () => (window.location.hash = librarySnippetHref(snippet.id)),
    },
  });
}

/** Code block with the standard Copy button (top-right). Registers itself for Mod C. */
export function OutputCode({
  code,
  label,
  language,
  meta,
  className,
  saveable = true,
}: OutputCodeProps) {
  const [copied, setCopied] = useState(false);
  const setActive = useActiveOutput((s) => s.set);

  useEffect(() => {
    setActive(code);
    return () => setActive(null);
  }, [code, setActive]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/50", className)}>
      <div className="flex h-9 items-center justify-between border-b px-3">
        <span className="truncate text-xs text-muted-foreground">
          {label}
          {meta && <span className="ml-2 text-muted-foreground/70">{meta}</span>}
        </span>
        <span className="flex shrink-0 items-center">
          {saveable && (
            <Button
              variant="ghost"
              size="sm"
              disabled={!code}
              onClick={() => saveToLibrary(code, label, language)}
              aria-label="Save to My Library"
              title="Save to My Library"
            >
              <BookmarkPlus /> Save
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={!code}
            onClick={async () => setCopied(await copyText(code))}
            aria-label="Copy code"
          >
            {copied ? <Check className="text-success" /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </span>
      </div>
      {language ? (
        <CodeInput
          value={code}
          language={language}
          readOnly
          label={label ?? "Output"}
          className="min-h-0 rounded-none border-0 bg-transparent focus-within:ring-0"
        />
      ) : (
        <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
          <code>
            <WrapAtSpaces text={code} />
          </code>
        </pre>
      )}
    </div>
  );
}

/**
 * Long lines wrap only between words, never inside one (so "--use-pnpm" never splits at a hyphen).
 * Copying still yields the exact original text.
 */
function WrapAtSpaces({ text }: { text: string }) {
  return text.split(/( +)/).map((part, i) =>
    part.trim() ? (
      <span key={i} className="whitespace-pre">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
