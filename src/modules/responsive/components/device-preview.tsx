import { useState } from "react";
import { ExternalLink, RefreshCw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { RangeField } from "@/components/tool/range-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { openExternal } from "@/lib/open-url";
import { cn } from "@/lib/utils";
import { devices } from "../lib/breakpoints";

const normalize = (url: string) =>
  /^https?:\/\//i.test(url.trim()) ? url.trim() : `http://${url.trim()}`;

export default function DevicePreview() {
  const [url, setUrl] = usePersistentState("resp:url", "http://localhost:5173");
  const [selected, setSelected] = usePersistentState<string[]>("resp:devices", [
    "iphone-15",
    "ipad-mini",
    "laptop",
  ]);
  const [landscape, setLandscape] = usePersistentState("resp:landscape", false);
  const [frameHeight, setFrameHeight] = usePersistentState("resp:height", 480);
  const [reload, setReload] = useState(0);
  const src = normalize(url);
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((d) => d !== id) : [...selected, id]);

  return (
    <ToolLayout
      layout="stacked"
      title="Device preview"
      description="See one page at several screen sizes side by side. Works best with your local dev server."
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLandscape(!landscape)}
            aria-pressed={landscape}
          >
            <RotateCw /> {landscape ? "Landscape" : "Portrait"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setReload((r) => r + 1)}>
            <RefreshCw /> Reload
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void openExternal(src)}>
            <ExternalLink /> Browser
          </Button>
        </>
      }
      input={
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 @min-[640px]:grid-cols-[1fr_16rem]">
            <Field
              label="URL"
              hint="e.g. http://localhost:5173 (Vite) or http://localhost:3000 (Next.js). Some public sites block being framed."
            >
              {(id) => (
                <Input
                  id={id}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setReload((r) => r + 1)}
                  spellCheck={false}
                  className="font-mono"
                />
              )}
            </Field>
            <RangeField
              label="Frame height"
              value={frameHeight}
              onChange={setFrameHeight}
              min={240}
              max={900}
              step={20}
              unit="px"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Devices">
            {devices.map((d) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={selected.includes(d.id)}
                onClick={() => toggle(d.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent",
                  selected.includes(d.id) && "border-primary/60 bg-primary/10 text-primary",
                )}
              >
                {d.name} <span className="opacity-60">{d.width}</span>
              </button>
            ))}
          </div>
        </div>
      }
      output={
        <div className="flex gap-4 overflow-x-auto pb-2">
          {devices
            .filter((d) => selected.includes(d.id))
            .map((d) => {
              const w = landscape ? d.height : d.width;
              const h = landscape ? d.width : d.height;
              const scale = frameHeight / h;
              return (
                <figure key={d.id} className="flex shrink-0 flex-col gap-1.5">
                  <figcaption className="text-xs text-muted-foreground">
                    {d.name} · {w}×{h} · {Math.round(scale * 100)}%
                  </figcaption>
                  <div
                    className="overflow-hidden rounded-lg border bg-white"
                    style={{ width: w * scale, height: frameHeight }}
                  >
                    <iframe
                      key={`${src}-${reload}-${landscape}`}
                      src={src}
                      title={`${d.name} preview`}
                      width={w}
                      height={h}
                      className="origin-top-left border-0"
                      style={{ transform: `scale(${scale})` }}
                    />
                  </div>
                </figure>
              );
            })}
        </div>
      }
    />
  );
}
