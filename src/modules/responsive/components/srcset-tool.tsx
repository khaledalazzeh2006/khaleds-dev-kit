import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { parseWidths, pictureMarkup, type Layout, type SrcsetOptions } from "../lib/srcset";

const DEFAULT = {
  base: "/images/hero",
  widths: "480, 768, 1200, 1600, 2400",
  formats: ["avif", "webp", "jpg"],
  layout: "container" as Layout,
  value: 1200,
  alt: "",
  width: 2400,
  height: 1350,
};
const FORMATS = ["avif", "webp", "jpg"] as const;

export default function SrcsetTool() {
  const [o, setO] = usePersistentState("resp:srcset", DEFAULT);
  const set = (patch: Partial<typeof o>) => setO({ ...o, ...patch });
  const widths = parseWidths(o.widths);
  const opts: SrcsetOptions = {
    ...o,
    widths,
    formats: o.formats.filter((f): f is (typeof FORMATS)[number] =>
      (FORMATS as readonly string[]).includes(f),
    ),
  };

  return (
    <ToolLayout
      title="Responsive images (srcset)"
      description="Let the browser download the right image size and format for each screen."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Field
            label="Image path (without size and extension)"
            hint="Files are expected as hero-480.webp, hero-768.webp, …"
          >
            {(id) => (
              <Input
                id={id}
                value={o.base}
                onChange={(e) => set({ base: e.target.value })}
                className="font-mono"
              />
            )}
          </Field>
          <Field
            label="Widths you export (px)"
            error={widths.length ? undefined : "Add at least one width."}
          >
            {(id) => (
              <Input
                id={id}
                value={o.widths}
                onChange={(e) => set({ widths: e.target.value })}
                className="font-mono"
              />
            )}
          </Field>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Formats">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={o.formats.includes(f)}
                disabled={f === "jpg"}
                onClick={() =>
                  set({
                    formats: o.formats.includes(f)
                      ? o.formats.filter((x) => x !== f)
                      : [...o.formats, f],
                  })
                }
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs uppercase",
                  o.formats.includes(f) && "border-primary/60 bg-primary/10 text-primary",
                  f === "jpg" && "opacity-70",
                )}
              >
                {f}
                {f === "jpg" && " (fallback)"}
              </button>
            ))}
          </div>
          <Segmented
            label="How wide is the image on the page?"
            value={o.layout}
            onChange={(layout) => set({ layout })}
            options={[
              { value: "full", label: "Full width" },
              { value: "container", label: "In a container" },
              { value: "columns", label: "Grid column" },
              { value: "fixed", label: "Fixed" },
            ]}
          />
          {o.layout === "container" && (
            <RangeField
              label="Container max width"
              value={o.value}
              onChange={(value) => set({ value })}
              min={320}
              max={1920}
              step={20}
              unit="px"
            />
          )}
          {o.layout === "columns" && (
            <RangeField
              label="Columns on desktop"
              value={o.value}
              onChange={(value) => set({ value })}
              min={2}
              max={6}
            />
          )}
          {o.layout === "fixed" && (
            <RangeField
              label="Rendered width"
              value={o.value}
              onChange={(value) => set({ value })}
              min={40}
              max={1200}
              step={10}
              unit="px"
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <RangeField
              label="Original width"
              value={o.width}
              onChange={(width) => set({ width })}
              min={100}
              max={4000}
              step={10}
              unit="px"
            />
            <RangeField
              label="Original height"
              value={o.height}
              onChange={(height) => set({ height })}
              min={100}
              max={4000}
              step={10}
              unit="px"
            />
          </div>
          <Field
            label="Alt text"
            hint="Describe the image for screen readers; leave empty only for decoration."
          >
            {(id) => <Input id={id} value={o.alt} onChange={(e) => set({ alt: e.target.value })} />}
          </Field>
        </>
      }
      output={
        <OutputCode
          label="<picture>"
          code={widths.length ? pictureMarkup(opts) : ""}
          language="html"
        />
      }
    />
  );
}
