import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

/** A list of label → value rows, each with its own copy button (for multi-format results). */
export function CopyRows({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <div className="border-b px-3 py-2 text-xs text-muted-foreground">{title}</div>
      <ul>
        {rows.map((r) => (
          <CopyRow key={r.label} {...r} />
        ))}
      </ul>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="group flex items-center gap-3 border-b px-3 py-1.5 last:border-0">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-[12.5px]" title={value}>
        {value}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Copy ${label}`}
        onClick={async () => {
          setCopied(await copyText(value));
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </li>
  );
}
