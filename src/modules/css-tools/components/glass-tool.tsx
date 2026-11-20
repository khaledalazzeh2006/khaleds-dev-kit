import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { glass, type GlassOptions } from "../lib/css";

const DEFAULT: GlassOptions = {
  blur: 14,
  tint: "255 255 255",
  opacity: 12,
  saturation: 160,
  border: 25,
  radius: 20,
};

export default function GlassTool() {
  const [o, setO] = usePersistentState("css:glass", DEFAULT);
  const set = (patch: Partial<GlassOptions>) => setO({ ...o, ...patch });
  const result = glass(o);
  const style = {
    background: `rgb(${o.tint} / ${o.opacity / 100})`,
    backdropFilter: `blur(${o.blur}px) saturate(${o.saturation}%)`,
    border: o.border ? `1px solid rgb(${o.tint} / ${o.border / 100})` : undefined,
    borderRadius: o.radius,
  };

  return (
    <ToolLayout
      title="Glassmorphism"
      description="Frosted-glass panels with backdrop blur."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Segmented
            label="Tint"
            value={o.tint}
            onChange={(tint) => set({ tint })}
            options={[
              { value: "255 255 255", label: "Light" },
              { value: "0 0 0", label: "Dark" },
            ]}
          />
          <RangeField
            label="Blur"
            value={o.blur}
            onChange={(blur) => set({ blur })}
            min={0}
            max={40}
            unit="px"
          />
          <RangeField
            label="Background opacity"
            value={o.opacity}
            onChange={(opacity) => set({ opacity })}
            min={0}
            max={80}
            unit="%"
          />
          <RangeField
            label="Saturation"
            value={o.saturation}
            onChange={(saturation) => set({ saturation })}
            min={100}
            max={250}
            step={10}
            unit="%"
          />
          <RangeField
            label="Border opacity"
            value={o.border}
            onChange={(border) => set({ border })}
            min={0}
            max={60}
            unit="%"
          />
          <RangeField
            label="Radius"
            value={o.radius}
            onChange={(radius) => set({ radius })}
            min={0}
            max={48}
            unit="px"
          />
        </>
      }
      output={
        <>
          <Preview className="relative p-0">
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777 50%, #f59e0b)" }}
            />
            <div className="absolute top-8 left-10 size-24 rounded-full bg-sky-400" />
            <div className="absolute right-12 bottom-6 size-32 rounded-full bg-emerald-400" />
            <div
              className="relative m-10 flex h-36 w-64 flex-col justify-end p-5 text-white"
              style={style}
            >
              <p className="text-sm font-semibold">Glass card</p>
              <p className="text-xs opacity-80">backdrop-filter: blur({o.blur}px)</p>
            </div>
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
