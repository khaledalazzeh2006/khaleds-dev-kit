import { useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { RangeField } from "@/components/tool/range-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "./previews/setup";

const EASES = [
  "none",
  "power1.out",
  "power2.out",
  "power3.out",
  "power4.out",
  "power2.in",
  "power2.inOut",
  "power4.inOut",
  "expo.out",
  "expo.inOut",
  "sine.inOut",
  "circ.out",
  "back.out(1.7)",
  "back.inOut(1.7)",
  "elastic.out(1, 0.3)",
  "bounce.out",
  "steps(6)",
];
const W = 240;
const H = 160;

function curvePoints(ease: string): string | null {
  const fn = gsap.parseEase(ease) as ((t: number) => number) | undefined;
  if (typeof fn !== "function") return null;
  // y range −0.5…1.5 so back/elastic overshoot stays visible
  return Array.from({ length: 121 }, (_, i) => {
    const t = i / 120;
    const y = fn(t);
    return `${(t * W).toFixed(1)},${(H - ((y + 0.5) / 2) * H).toFixed(1)}`;
  }).join(" ");
}

export default function EaseVisualizer() {
  const [ease, setEase] = usePersistentState("gsap:ease", "power3.out");
  const [duration, setDuration] = usePersistentState("gsap:ease:duration", 1.2);
  const ref = useRef<HTMLDivElement>(null);
  const points = useMemo(() => curvePoints(ease), [ease]);

  useGSAP(
    () => {
      if (!points) return;
      gsap.fromTo(
        ".dot",
        { x: 0 },
        {
          x: () => ref.current!.querySelector(".track")!.clientWidth - 24,
          duration,
          ease,
          repeat: -1,
          repeatDelay: 0.6,
        },
      );
    },
    { scope: ref, dependencies: [ease, duration, points], revertOnUpdate: true },
  );

  const y0 = H - (0.5 / 2) * H;
  const y1 = H - (1.5 / 2) * H;

  return (
    <ToolLayout
      title="Ease visualizer"
      description="Pick a GSAP ease (or type one) and see its curve and feel."
      input={
        <>
          <div className="flex flex-wrap gap-1.5">
            {EASES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEase(e)}
                aria-pressed={e === ease}
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-[11px] hover:bg-accent",
                  e === ease && "border-primary/60 bg-primary/10 text-primary",
                )}
              >
                {e}
              </button>
            ))}
          </div>
          <Field
            label="Ease"
            error={points ? undefined : "Unknown ease. Try power2.out or back.out(2)."}
          >
            {(id) => (
              <Input
                id={id}
                value={ease}
                onChange={(e) => setEase(e.target.value)}
                className="font-mono"
                spellCheck={false}
              />
            )}
          </Field>
          <RangeField
            label="Duration"
            value={duration}
            onChange={setDuration}
            min={0.2}
            max={4}
            step={0.1}
            unit="s"
          />
        </>
      }
      output={
        <div ref={ref} className="flex flex-col gap-3">
          <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
            <svg
              viewBox={`-8 -8 ${W + 16} ${H + 16}`}
              className="w-full max-w-sm"
              role="img"
              aria-label={`Curve of ${ease}`}
            >
              <line x1={0} y1={y0} x2={W} y2={y0} stroke="var(--border)" />
              <line x1={0} y1={y1} x2={W} y2={y1} stroke="var(--border)" strokeDasharray="4 3" />
              {points && (
                <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={2.5} />
              )}
            </svg>
          </div>
          <div className="track relative h-10 rounded-lg border bg-muted/30">
            <div className="dot absolute top-2 left-0 size-6 rounded-md bg-primary" />
          </div>
          <OutputCode label="Ease" code={`ease: "${ease}"`} />
        </div>
      }
    />
  );
}
