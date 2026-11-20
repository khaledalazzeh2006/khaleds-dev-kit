import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyRows } from "@/components/tool/copy-rows";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { openExternal } from "@/lib/open-url";
import { activeBreakpoint, breakpointSets, tailwindContainers } from "../lib/breakpoints";

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export default function BreakpointsTool() {
  const [setId, setSetId] = usePersistentState("resp:bp-set", "tailwind");
  const set = breakpointSets[setId] ?? breakpointSets.tailwind!;
  const width = useWindowWidth();
  const active = activeBreakpoint(set.items, width);

  return (
    <ToolLayout
      title="Breakpoints"
      description="Common breakpoints with ready media queries. Resize this window to see which one is active."
      actions={
        <Button variant="ghost" size="sm" onClick={() => void openExternal(set.source)}>
          <ExternalLink /> Docs
        </Button>
      }
      input={
        <>
          <Segmented
            label="Framework"
            value={setId}
            onChange={setSetId}
            options={Object.entries(breakpointSets).map(([id, s]) => ({
              value: id,
              label: s.label,
            }))}
          />
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">This window is</p>
            <p className="text-3xl font-semibold tabular-nums">{width}px</p>
            <p className="text-sm">
              Active: <span className="font-mono font-medium text-primary">{active}</span>
            </p>
          </div>
          <ol className="flex flex-col gap-1">
            {set.items.map((b) => (
              <li key={b.name} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-mono font-medium">{b.name}</span>
                <span
                  className="h-2 rounded-sm bg-primary/70"
                  style={{ width: `${(b.min / 1600) * 100}%` }}
                />
                <span className="text-muted-foreground">{b.min}px</span>
              </li>
            ))}
          </ol>
        </>
      }
      output={
        <>
          <CopyRows
            title="Media queries (min-width, mobile first)"
            rows={set.items.map((b) => ({ label: b.name, value: `@media (width >= ${b.min}px)` }))}
          />
          {setId === "tailwind" && (
            <CopyRows
              title="Tailwind container query sizes (@container)"
              rows={tailwindContainers.map((c) => ({
                label: c.name,
                value: `@container (width >= ${c.min / 16}rem) /* ${c.min}px */`,
              }))}
            />
          )}
        </>
      }
    />
  );
}
