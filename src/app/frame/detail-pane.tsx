import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUi } from "@/lib/store/ui";
import { cn } from "@/lib/utils";
import type { DevKitModule, ModuleItem } from "../module";

interface DetailPaneProps {
  module: DevKitModule;
  item: ModuleItem;
  className?: string;
}

/** Renders the selected item using the module's Detail component (lazy-loaded). */
export function DetailPane({ module, item, className }: DetailPaneProps) {
  const setNarrowView = useUi((s) => s.setNarrowView);
  const { Detail } = module;

  return (
    <main className={cn("min-w-0 flex-1 flex-col", className)}>
      <div className="border-b px-2 py-1.5 @min-[760px]:hidden">
        <Button variant="ghost" size="sm" onClick={() => setNarrowView("list")}>
          <ArrowLeft /> {module.title}
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-muted-foreground">Loading…</div>}>
          <Detail key={item.id} item={item} />
        </Suspense>
      </div>
    </main>
  );
}
