import { Input } from "@/components/ui/input";
import { ColorField } from "@/components/tool/color-field";
import { Field } from "@/components/tool/field";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { SelectField } from "@/components/tool/select-field";
import type { ParamValue, SnippetParam } from "@/lib/content/schema";

/** Renders the right control for a snippet param type. */
export function ParamField({
  param,
  value,
  onChange,
}: {
  param: SnippetParam;
  value: ParamValue;
  onChange: (v: ParamValue) => void;
}) {
  const label = param.label ?? param.key;
  switch (param.type) {
    case "number":
      return (
        <RangeField
          label={label}
          value={Number(value)}
          onChange={onChange}
          min={param.min ?? 0}
          max={param.max ?? 100}
          step={param.step ?? 1}
          unit={param.unit}
        />
      );
    case "boolean":
      return (
        <Field label={label}>
          {() => (
            <Segmented
              label={label}
              value={String(value)}
              onChange={(v) => onChange(v === "true")}
              options={[
                { value: "true", label: "On" },
                { value: "false", label: "Off" },
              ]}
            />
          )}
        </Field>
      );
    case "select":
    case "ease":
      return (
        <SelectField
          label={label}
          value={String(value)}
          onChange={onChange}
          options={(param.options ?? []).map((o) => ({ value: o, label: o }))}
        />
      );
    case "color":
      return <ColorField label={label} value={String(value)} onChange={onChange} />;
    default:
      return (
        <Field label={label}>
          {(id) => (
            <Input id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} />
          )}
        </Field>
      );
  }
}
