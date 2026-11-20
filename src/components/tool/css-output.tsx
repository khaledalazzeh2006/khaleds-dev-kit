import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { OutputCode } from "./output-code";
import { Segmented } from "./segmented";

/** CSS ↔ Tailwind switch over one result. The choice is remembered across tools. */
export function CssOutput({ css, tailwind }: { css: string; tailwind: string }) {
  const [format, setFormat] = usePersistentState<"css" | "tailwind">("css-output-format", "css");
  return (
    <div className="flex flex-col gap-2">
      <Segmented
        label="Output"
        value={format}
        onChange={setFormat}
        options={[
          { value: "css", label: "CSS" },
          { value: "tailwind", label: "Tailwind" },
        ]}
      />
      {format === "css" ? (
        <OutputCode label="CSS" code={css} language="css" />
      ) : (
        <OutputCode label="Tailwind classes" code={tailwind} />
      )}
    </div>
  );
}
