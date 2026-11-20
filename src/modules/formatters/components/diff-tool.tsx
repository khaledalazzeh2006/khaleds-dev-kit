import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/tool/code-input";
import { OutputCode } from "@/components/tool/output-code";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import { lineDiff, unifiedPatch } from "../lib/diff";

const SAMPLE_A = `const port = 3000;\napp.listen(port);\nconsole.log("ready");\n`;
const SAMPLE_B = `const port = process.env.PORT ?? 3000;\napp.listen(port);\nconsole.log(\`ready on \${port}\`);\n`;

const rowStyle = {
  add: "bg-[var(--diff-add)]",
  remove: "bg-[var(--diff-remove)]",
  same: "",
} as const;
const sign = { add: "+", remove: "−", same: " " } as const;

export default function DiffTool() {
  const [before, setBefore] = usePersistentState("diff:before", SAMPLE_A);
  const [after, setAfter] = usePersistentState("diff:after", SAMPLE_B);
  const { lines, added, removed } = useMemo(() => lineDiff(before, after), [before, after]);
  const patch = useMemo(() => unifiedPatch(before, after), [before, after]);

  return (
    <ToolLayout
      title="Diff"
      description="Compare two texts line by line."
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setBefore(SAMPLE_A);
            setAfter(SAMPLE_B);
          }}
        >
          <RotateCcw /> Sample
        </Button>
      }
      input={
        <>
          <CodeInput
            value={before}
            onChange={setBefore}
            label="Original"
            placeholder="Original text"
            className="min-h-40"
          />
          <CodeInput
            value={after}
            onChange={setAfter}
            label="Changed"
            placeholder="Changed text"
            className="min-h-40"
          />
        </>
      }
      output={
        <>
          <div className="overflow-hidden rounded-lg border bg-muted/30">
            <div className="flex h-9 items-center gap-3 border-b px-3 text-xs">
              <span className="text-muted-foreground">Changes</span>
              <span className="text-success">+{added}</span>
              <span className="text-destructive">−{removed}</span>
            </div>
            <pre className="overflow-x-auto py-2 font-mono text-[12.5px] leading-relaxed">
              {lines.map((l, i) => (
                <div key={i} className={cn("flex px-3", rowStyle[l.type])}>
                  <span
                    aria-hidden
                    className={cn(
                      "w-4 shrink-0 select-none text-muted-foreground",
                      l.type === "add" && "text-success",
                      l.type === "remove" && "text-destructive",
                    )}
                  >
                    {sign[l.type]}
                  </span>
                  <span className="whitespace-pre-wrap">{l.text || " "}</span>
                </div>
              ))}
            </pre>
          </div>
          <OutputCode label="Unified patch" code={patch} />
        </>
      }
    />
  );
}
