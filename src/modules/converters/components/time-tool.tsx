import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyRows } from "@/components/tool/copy-rows";
import { Field } from "@/components/tool/field";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { formatTime, parseTime } from "../lib/time";

const nowSeconds = () => String(Math.floor(Date.now() / 1000));

export default function TimeTool() {
  const [input, setInput] = usePersistentState("conv:time:input", nowSeconds());
  const date = parseTime(input);
  const f = date ? formatTime(date) : null;

  return (
    <ToolLayout
      title="Timestamp"
      description="Convert Unix timestamps (seconds or ms) and date strings to every common format."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setInput(nowSeconds())}>
          <Clock /> Now
        </Button>
      }
      input={
        <Field
          label="Timestamp or date"
          hint="Examples: 1700000000 · 1700000000000 · 2026-11-20T10:00:00Z"
          error={input.trim() && !date ? "Couldn't read this as a timestamp or date." : undefined}
        >
          {(id) => (
            <Input
              id={id}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      }
      output={
        f ? (
          <CopyRows
            title={f.relative}
            rows={[
              { label: "Unix (s)", value: f.unixSeconds },
              { label: "Unix (ms)", value: f.unixMs },
              { label: "ISO 8601", value: f.iso },
              { label: "UTC", value: f.utc },
              { label: "Local", value: f.local },
            ]}
          />
        ) : null
      }
    />
  );
}
