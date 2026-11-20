import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { SelectField } from "@/components/tool/select-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import {
  bezierPoint,
  bezierValue,
  easings,
  transition,
  type Bezier,
  type TransitionOptions,
} from "../lib/css";

const DEFAULT: TransitionOptions = {
  property: "transform",
  duration: 600,
  delay: 0,
  bezier: easings["ease-out-expo"]!,
};
const SIZE = 200; // curve box in SVG units
const PAD = 40;

/** Drag the two handles to shape the curve. y may go outside 0–1 (overshoot). */
function CurveEditor({ value, onChange }: { value: Bezier; onChange: (b: Bezier) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const [x1, y1, x2, y2] = value;
  const toSvg = (x: number, y: number) => [PAD + x * SIZE, PAD + (1 - y) * SIZE] as const;
  const path = Array.from({ length: 41 }, (_, i) =>
    toSvg(...bezierPoint(value, i / 40)).join(","),
  ).join(" ");

  const drag = (handle: 1 | 2) => (e: React.PointerEvent) => {
    const el = svg.current;
    if (!el) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const sx = ((ev.clientX - r.left) / r.width) * (SIZE + PAD * 2);
      const sy = ((ev.clientY - r.top) / r.height) * (SIZE + PAD * 2);
      const x = Math.min(1, Math.max(0, (sx - PAD) / SIZE));
      const y = Math.min(1.5, Math.max(-0.5, 1 - (sy - PAD) / SIZE));
      const r2 = (n: number) => Math.round(n * 100) / 100;
      onChange(handle === 1 ? [r2(x), r2(y), x2, y2] : [x1, y1, r2(x), r2(y)]);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const [p0, p1, h1, h2] = [toSvg(0, 0), toSvg(1, 1), toSvg(x1, y1), toSvg(x2, y2)];
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${SIZE + PAD * 2} ${SIZE + PAD * 2}`}
      className="w-full max-w-64 touch-none select-none"
      role="img"
      aria-label={`Easing curve ${bezierValue(value)}`}
    >
      <rect x={PAD} y={PAD} width={SIZE} height={SIZE} fill="none" stroke="var(--border)" />
      <line
        x1={p0[0]}
        y1={p0[1]}
        x2={h1[0]}
        y2={h1[1]}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 3"
      />
      <line
        x1={p1[0]}
        y1={p1[1]}
        x2={h2[0]}
        y2={h2[1]}
        stroke="var(--muted-foreground)"
        strokeDasharray="4 3"
      />
      <polyline points={path} fill="none" stroke="var(--primary)" strokeWidth={3} />
      {[h1, h2].map(([cx, cy], k) => (
        <circle
          key={k}
          cx={cx}
          cy={cy}
          r={9}
          fill="var(--background)"
          stroke="var(--primary)"
          strokeWidth={3}
          className="cursor-grab"
          onPointerDown={drag((k + 1) as 1 | 2)}
        />
      ))}
    </svg>
  );
}

export default function TransitionTool() {
  const [o, setO] = usePersistentState("css:transition", DEFAULT);
  const [moved, setMoved] = useState(false);
  const set = (patch: Partial<TransitionOptions>) => setO({ ...o, ...patch });
  const preset =
    Object.entries(easings).find(([, b]) => b.join() === o.bezier.join())?.[0] ?? "custom";
  const result = transition(o);

  return (
    <ToolLayout
      title="Transition & easing"
      description="Shape a cubic-bezier curve and see how it feels."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setO(DEFAULT)}>
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <SelectField
            label="Easing preset"
            value={preset}
            onChange={(name) => easings[name] && set({ bezier: easings[name] })}
            options={[
              ...Object.keys(easings).map((k) => ({ value: k, label: k })),
              { value: "custom", label: "custom (drag the handles)" },
            ]}
          />
          <CurveEditor value={o.bezier} onChange={(bezier) => set({ bezier })} />
          <SelectField
            label="Property"
            value={o.property}
            onChange={(property) => set({ property })}
            options={["all", "transform", "opacity", "colors"].map((v) => ({ value: v, label: v }))}
          />
          <RangeField
            label="Duration"
            value={o.duration}
            onChange={(duration) => set({ duration })}
            min={50}
            max={2000}
            step={50}
            unit="ms"
          />
          <RangeField
            label="Delay"
            value={o.delay}
            onChange={(delay) => set({ delay })}
            min={0}
            max={1000}
            step={50}
            unit="ms"
          />
        </>
      }
      output={
        <>
          <Preview className="flex-col items-stretch gap-4">
            <div className="relative h-14 rounded-md border border-dashed">
              <div
                className="absolute top-2 size-10 rounded-lg bg-primary"
                style={{
                  // The demo animates `left` so it can travel the full width; your CSS uses the property you chose.
                  left: moved ? "calc(100% - 3rem)" : "0.5rem",
                  transition: `left ${o.duration}ms ${bezierValue(o.bezier)} ${o.delay}ms`,
                }}
              />
            </div>
            <Button size="sm" className="w-fit self-center" onClick={() => setMoved(!moved)}>
              <Play /> Play
            </Button>
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
