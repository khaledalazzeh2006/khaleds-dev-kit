import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when a screen crashes, instead of a blank window. */
export function RouteError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-base font-semibold">This screen hit an error</p>
      <p className="max-w-md font-mono text-xs text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
        <RotateCcw /> Reload
      </Button>
    </div>
  );
}
