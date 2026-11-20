import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { useActiveOutput } from "@/lib/store/output";
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
}

/** Code block with the standard Copy button (top-right). Registers itself for Mod C. */
export function OutputCode({ code, label, language, meta, className }: OutputCodeProps) {
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
