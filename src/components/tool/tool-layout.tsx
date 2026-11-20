import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  title: string;
  /** One line: what the tool does. */
  description: string;
  /** Header actions, e.g. a Reset button. */
  actions?: ReactNode;
  /** Controls (left / top). */
  input: ReactNode;
  /** Preview + OutputCode (right / bottom). */
  output: ReactNode;
  /** "stacked": input above output at full width (for wide previews). Default "split". */
  layout?: "split" | "stacked";
}

/** The one layout every tool uses: header, then input and output side by side (stacked when narrow). */
export function ToolLayout({
  title,
  description,
  actions,
  input,
  output,
  layout = "split",
}: ToolLayoutProps) {
  return (
    <div className="@container flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </header>
      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1 content-start gap-4 overflow-auto p-4",
          layout === "split" && "@min-[640px]:grid-cols-2",
        )}
      >
        <section aria-label="Input" className="flex flex-col gap-3">
          {input}
        </section>
        <section aria-label="Output" className="flex min-w-0 flex-col gap-3">
          {output}
        </section>
      </div>
    </div>
  );
}
