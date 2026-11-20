import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { clipPath, clipPathValue, clipShapes, type Point } from "../lib/css";

export default function ClipPathTool() {
  const [points, setPoints] = usePersistentState<Point[]>("css:clip", clipShapes.hexagon!);
  const box = useRef<HTMLDivElement>(null);
  const result = clipPath(points);
  const preset =
    Object.entries(clipShapes).find(([, p]) => JSON.stringify(p) === JSON.stringify(points))?.[0] ??
    "custom";

  const drag = (i: number) => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const x = Math.round(Math.min(100, Math.max(0, ((ev.clientX - r.left) / r.width) * 100)));
      const y = Math.round(Math.min(100, Math.max(0, ((ev.clientY - r.top) / r.height) * 100)));
      setPoints((prev) => prev.map((p, k) => (k === i ? [x, y] : p)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <ToolLayout
      title="Clip path"
      description="Pick a shape, then drag the points to adjust it."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setPoints(clipShapes.hexagon!)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <SelectField
            label="Shape"
            value={preset}
            onChange={(name) => clipShapes[name] && setPoints(clipShapes[name])}
            options={[
              ...Object.keys(clipShapes).map((k) => ({ value: k, label: k })),
              { value: "custom", label: "custom" },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            {points.length} points · drag them in the preview.
          </p>
        </>
      }
      output={
        <>
          <Preview>
            <div ref={box} className="relative size-56 touch-none">
              <div className="absolute inset-0 rounded-sm border border-dashed" />
              <div
                className="absolute inset-0 bg-[linear-gradient(135deg,var(--primary),#ec4899)]"
                style={{ clipPath: clipPathValue(points) }}
              />
              {points.map(([x, y], i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Point ${i + 1}: ${x}% ${y}%`}
                  onPointerDown={drag(i)}
                  className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              ))}
            </div>
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
