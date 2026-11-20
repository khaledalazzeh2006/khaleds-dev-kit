import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

/** Fixed-height stage for animation previews. */
export function Stage({
  children,
  className,
  ref,
}: {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-72 items-center justify-center overflow-hidden rounded-lg border bg-muted/30",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Scrollable stage for ScrollTrigger previews; pass its ref as `scroller`. */
export function ScrollStage({ children, ref }: { children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div className="relative h-72 overflow-hidden rounded-lg border bg-muted/30">
      <div ref={ref} className="h-full overflow-y-auto overscroll-contain">
        {children}
      </div>
      <span className="pointer-events-none absolute right-2 bottom-2 rounded bg-background/80 px-1.5 py-0.5 text-[11px] text-muted-foreground">
        Scroll inside ↓
      </span>
    </div>
  );
}

export const Spacer = ({ label }: { label: string }) => (
  <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">{label}</div>
);
