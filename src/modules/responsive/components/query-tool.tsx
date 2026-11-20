import { Input } from "@/components/ui/input";
import { CopyRows } from "@/components/tool/copy-rows";
import { CssOutput } from "@/components/tool/css-output";
import { Field } from "@/components/tool/field";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { buildQuery, featureQueries, type QueryOptions } from "../lib/queries";

const DEFAULT: QueryOptions = {
  kind: "media",
  condition: "min",
  min: 768,
  max: 1024,
  unit: "px",
  rangeSyntax: true,
  containerName: "",
};

export default function QueryTool() {
  const [o, setO] = usePersistentState("resp:query", DEFAULT);
  const set = (patch: Partial<QueryOptions>) => setO({ ...o, ...patch });
  const q = buildQuery(o);

  return (
    <ToolLayout
      title="Media & container queries"
      description="Build width queries in modern or classic syntax, plus the Tailwind variant."
      input={
        <>
          <Segmented
            label="Query type"
            value={o.kind}
            onChange={(kind) => set({ kind })}
            options={[
              { value: "media", label: "@media (screen)" },
              { value: "container", label: "@container (parent)" },
            ]}
          />
          <Segmented
            label="Condition"
            value={o.condition}
            onChange={(condition) => set({ condition })}
            options={[
              { value: "min", label: "At least" },
              { value: "max", label: "Below" },
              { value: "between", label: "Between" },
            ]}
          />
          {o.condition !== "max" && (
            <RangeField
              label="From"
              value={o.min}
              onChange={(min) => set({ min })}
              min={0}
              max={2000}
              step={8}
              unit="px"
            />
          )}
          {o.condition !== "min" && (
            <RangeField
              label="Up to (not including)"
              value={o.max}
              onChange={(max) => set({ max })}
              min={0}
              max={2000}
              step={8}
              unit="px"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Segmented
              label="Unit"
              value={o.unit}
              onChange={(unit) => set({ unit })}
              options={[
                { value: "px", label: "px" },
                { value: "rem", label: "rem" },
                { value: "em", label: "em" },
              ]}
            />
            <Segmented
              label="Syntax"
              value={o.rangeSyntax ? "range" : "classic"}
              onChange={(v) => set({ rangeSyntax: v === "range" })}
              options={[
                { value: "range", label: "Range (width >= …)" },
                { value: "classic", label: "Classic (min-width)" },
              ]}
            />
          </div>
          {o.kind === "container" && (
            <Field
              label="Container name (optional)"
              hint="Set it on the parent: container: card / inline-size;  Tailwind: @container/card"
            >
              {(id) => (
                <Input
                  id={id}
                  value={o.containerName ?? ""}
                  onChange={(e) => set({ containerName: e.target.value.replace(/[^\w-]/g, "") })}
                  placeholder="card"
                />
              )}
            </Field>
          )}
        </>
      }
      output={
        <>
          <CssOutput css={q.css} tailwind={q.tailwind} />
          <CopyRows
            title="Feature queries"
            rows={featureQueries.map((f) => ({
              label: f.label,
              value: `${f.css}  ·  ${f.tailwind}`,
            }))}
          />
        </>
      }
    />
  );
}
