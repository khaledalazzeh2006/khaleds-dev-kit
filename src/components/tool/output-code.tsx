import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { useActiveOutput } from "@/lib/store/output";
import { cn } from "@/lib/utils";

interface OutputCodeProps {
  code: string;
  /** Shown above the code, e.g. "CSS". */
  label?: string;
  className?: string;
}

/** Code block with the standard Copy button (top-right). Registers itself for Mod C. */
export function OutputCode({ code, label, className }: OutputCodeProps) {
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
        <span className="text-xs text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => setCopied(await copyText(code))}
          aria-label="Copy code"
        >
          {copied ? <Check className="text-success" /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
