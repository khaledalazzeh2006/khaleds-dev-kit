import { ArrowUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/tool/color-field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { checkContrast } from "../lib/contrast";

export default function ContrastTool() {
  const [fg, setFg] = usePersistentState("design:contrast:fg", "#a1a1aa");
  const [bg, setBg] = usePersistentState("design:contrast:bg", "#18181b");
  const r = checkContrast(fg, bg);

  const checks = r
    ? [
        { label: "AA · normal text", pass: r.aaNormal, need: "4.5:1" },
        { label: "AA · large text", pass: r.aaLarge, need: "3:1" },
        { label: "AAA · normal text", pass: r.aaaNormal, need: "7:1" },
        { label: "AAA · large text", pass: r.aaaLarge, need: "4.5:1" },
        { label: "UI · icons & borders", pass: r.ui, need: "3:1" },
      ]
    : [];

  return (
    <ToolLayout
      title="Contrast checker"
      description="WCAG 2 contrast between a text color and its background."
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFg(bg);
            setBg(fg);
          }}
        >
          <ArrowUpDown /> Swap
        </Button>
      }
      input={
        <>
          <ColorField label="Text color" value={fg} onChange={setFg} />
          <ColorField label="Background" value={bg} onChange={setBg} />
        </>
      }
      output={
        r && (
          <>
            <div className="rounded-lg border p-5" style={{ background: bg, color: fg }}>
              <p className="text-2xl font-semibold">Large heading text</p>
              <p className="mt-1 text-sm">Body text at normal size should stay easy to read.</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{r.ratio}:1</span>
              <span className="text-muted-foreground">contrast ratio</span>
            </div>
            <ul className="overflow-hidden rounded-lg border">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between border-b px-3 py-2 text-xs last:border-0"
                >
                  <span>{c.label}</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 font-medium",
                      c.pass ? "text-success" : "text-destructive",
                    )}
                  >
                    {c.pass ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                    {c.pass ? "Pass" : `Fail (needs ${c.need})`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )
      }
    />
  );
}
