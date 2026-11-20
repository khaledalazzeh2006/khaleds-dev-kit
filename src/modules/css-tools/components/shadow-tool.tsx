import { formatRgb, parse } from "culori";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/tool/color-field";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { boxShadow, shadowValue, type ShadowLayer } from "../lib/css";

interface Layer extends Omit<ShadowLayer, "color"> {
  color: string; // hex/any CSS color
  alpha: number; // 0–100
}

const PRESETS: Record<string, Layer[]> = {
  Soft: [{ x: 0, y: 4, blur: 16, spread: -2, color: "#000000", alpha: 12, inset: false }],
  Medium: [
    { x: 0, y: 2, blur: 4, spread: -1, color: "#000000", alpha: 10, inset: false },
    { x: 0, y: 8, blur: 24, spread: -4, color: "#000000", alpha: 18, inset: false },
  ],
  Large: [
    { x: 0, y: 12, blur: 32, spread: -8, color: "#000000", alpha: 25, inset: false },
    { x: 0, y: 4, blur: 8, spread: -2, color: "#000000", alpha: 10, inset: false },
  ],
  Glow: [{ x: 0, y: 0, blur: 32, spread: 4, color: "#8b5cf6", alpha: 55, inset: false }],
  Inset: [{ x: 0, y: 2, blur: 6, spread: 0, color: "#000000", alpha: 25, inset: true }],
};

const withAlpha = (color: string, alpha: number) => {
  const c = parse(color);
  return c
    ? formatRgb({ ...c, alpha: alpha / 100 }).replace(
        /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/,
        "rgb($1 $2 $3 / $4)",
      )
    : color;
};

export default function ShadowTool() {
  const [layers, setLayers] = usePersistentState<Layer[]>("css:shadow", PRESETS.Medium!);
  const [active, setActive] = usePersistentState("css:shadow:active", 0);
  const [stage, setStage] = usePersistentState<"light" | "dark">("css:shadow:stage", "light");
  const i = Math.min(active, layers.length - 1);
  const layer = layers[i];
  const update = (patch: Partial<Layer>) =>
    setLayers(layers.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const resolved = layers.map((l) => ({ ...l, color: withAlpha(l.color, l.alpha) }));
  const result = boxShadow(resolved);

  return (
    <ToolLayout
      title="Box shadow"
      description="Layered shadows with a live preview."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setLayers(PRESETS.Medium!)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(PRESETS).map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => (setLayers(PRESETS[name]!), setActive(0))}
              >
                {name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {layers.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                aria-pressed={k === i}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs",
                  k === i && "border-primary/60 bg-primary/10 text-primary",
                )}
              >
                Layer {k + 1}
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Add layer"
              onClick={() => (setLayers([...layers, { ...layer! }]), setActive(layers.length))}
            >
              <Plus />
            </Button>
            {layers.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove layer"
                onClick={() => (setLayers(layers.filter((_, k) => k !== i)), setActive(0))}
              >
                <Trash2 />
              </Button>
            )}
          </div>
          {layer && (
            <>
              <Segmented
                label="Type"
                value={layer.inset ? "inset" : "outer"}
                onChange={(v) => update({ inset: v === "inset" })}
                options={[
                  { value: "outer", label: "Outer" },
                  { value: "inset", label: "Inset" },
                ]}
              />
              <RangeField
                label="X offset"
                value={layer.x}
                onChange={(x) => update({ x })}
                min={-50}
                max={50}
                unit="px"
              />
              <RangeField
                label="Y offset"
                value={layer.y}
                onChange={(y) => update({ y })}
                min={-50}
                max={50}
                unit="px"
              />
              <RangeField
                label="Blur"
                value={layer.blur}
                onChange={(blur) => update({ blur })}
                min={0}
                max={100}
                unit="px"
              />
              <RangeField
                label="Spread"
                value={layer.spread}
                onChange={(spread) => update({ spread })}
                min={-50}
                max={50}
                unit="px"
              />
              <ColorField
                label="Color"
                value={layer.color}
                onChange={(color) => update({ color })}
              />
              <RangeField
                label="Opacity"
                value={layer.alpha}
                onChange={(alpha) => update({ alpha })}
                min={0}
                max={100}
                unit="%"
              />
            </>
          )}
        </>
      }
      output={
        <>
          <Segmented
            label="Preview background"
            value={stage}
            onChange={setStage}
            options={[
              { value: "light", label: "Light stage" },
              { value: "dark", label: "Dark stage" },
            ]}
          />
          <Preview className={stage === "light" ? "bg-zinc-100 bg-none" : "bg-zinc-900 bg-none"}>
            <div
              className={cn("size-36 rounded-xl", stage === "light" ? "bg-white" : "bg-zinc-800")}
              style={{ boxShadow: shadowValue(resolved) }}
            />
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
