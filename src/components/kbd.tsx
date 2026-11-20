import { cn } from "@/lib/utils";
import { modLabel } from "@/lib/platform";

/** Keyboard hint. Write "mod" for the platform Mod key: <Kbd keys={["mod", "K"]} /> */
export function Kbd({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-sans text-[11px] font-medium text-muted-foreground"
        >
          {k === "mod" ? modLabel : k}
        </kbd>
      ))}
    </span>
  );
}
