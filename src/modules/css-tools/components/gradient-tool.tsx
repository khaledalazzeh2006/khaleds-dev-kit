import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/tool/color-field";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { gradient, gradientValue, type GradientStop, type GradientType } from "../lib/css";

const DEFAULT = {
  type: "linear" as GradientType,
  angle: 135,
  stops: [
    { color: "#8b5cf6", position: 0 },
    { color: "#ec4899", position: 50 },
    { color: "#f59e0b", position: 100 },
  ] as GradientStop[],
};

export default function GradientTool() {
  const [state, setState] = usePersistentState("css:gradient", DEFAULT);
  const { type, angle, stops } = state;
  const setStop = (i: number, patch: Partial<GradientStop>) =>
    setState({ ...state, stops: stops.map((s, k) => (k === i ? { ...s, ...patch } : s)) });
  const result = gradient(type, angle, stops);

  return (
    <ToolLayout
      title="Gradient"
      description="Linear, radial and conic gradients with any number of stops."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setState(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <Segmented
            label="Type"
            value={type}
            onChange={(t) => setState({ ...state, type: t })}
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
              { value: "conic", label: "Conic" },
            ]}
          />
          {type !== "radial" && (
            <RangeField
              label="Angle"
              value={angle}
              onChange={(a) => setState({ ...state, angle: a })}
              min={0}
              max={360}
              unit="°"
            />
          )}
          {stops.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Stop {i + 1}</span>
                {stops.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove stop ${i + 1}`}
                    onClick={() => setState({ ...state, stops: stops.filter((_, k) => k !== i) })}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              <ColorField
                label="Color"
                value={s.color}
                onChange={(color) => setStop(i, { color })}
              />
              <RangeField
                label="Position"
                value={s.position}
                onChange={(position) => setStop(i, { position })}
                min={0}
                max={100}
                unit="%"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() =>
              setState({ ...state, stops: [...stops, { color: "#ffffff", position: 100 }] })
            }
          >
            <Plus /> Add stop
          </Button>
        </>
      }
      output={
        <>
          <Preview className="p-0">
            <div
              className="h-56 w-full"
              style={{ background: gradientValue(type, angle, stops) }}
            />
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
