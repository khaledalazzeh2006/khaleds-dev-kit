import { Link2, Link2Off, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CssOutput } from "@/components/tool/css-output";
import { Preview } from "@/components/tool/preview";
import { RangeField } from "@/components/tool/range-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { borderRadius, type Corners } from "../lib/css";

const DEFAULT: Corners = { tl: 16, tr: 16, br: 16, bl: 16 };
const LABELS: Record<keyof Corners, string> = {
  tl: "Top left",
  tr: "Top right",
  br: "Bottom right",
  bl: "Bottom left",
};

export default function RadiusTool() {
  const [c, setC] = usePersistentState<Corners>("css:radius", DEFAULT);
  const [linked, setLinked] = usePersistentState("css:radius:linked", true);
  const result = borderRadius(c);
  const set = (key: keyof Corners, v: number) =>
    setC(linked ? { tl: v, tr: v, br: v, bl: v } : { ...c, [key]: v });

  return (
    <ToolLayout
      title="Border radius"
      description="Round all corners together or each one on its own."
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLinked(!linked)}
            aria-pressed={linked}
          >
            {linked ? <Link2 /> : <Link2Off />} {linked ? "Linked" : "Separate"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setC(DEFAULT)}>
            <RotateCcw /> Reset
          </Button>
        </>
      }
      input={
        linked ? (
          <RangeField
            label="All corners"
            value={c.tl}
            onChange={(v) => set("tl", v)}
            min={0}
            max={150}
            unit="px"
          />
        ) : (
          (Object.keys(LABELS) as (keyof Corners)[]).map((k) => (
            <RangeField
              key={k}
              label={LABELS[k]}
              value={c[k]}
              onChange={(v) => set(k, v)}
              min={0}
              max={150}
              unit="px"
            />
          ))
        )
      }
      output={
        <>
          <Preview>
            <div
              className="size-40 border-2 border-primary bg-primary/20"
              style={{ borderRadius: `${c.tl}px ${c.tr}px ${c.br}px ${c.bl}px` }}
            />
          </Preview>
          <CssOutput {...result} />
        </>
      }
    />
  );
}
