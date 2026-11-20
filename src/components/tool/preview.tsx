import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Neutral stage for live previews (subtle dot grid, works in both themes). */
export function Preview({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-56 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-[length:16px_16px] p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
