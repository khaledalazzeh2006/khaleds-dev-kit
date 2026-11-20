import { parse, formatHex } from "culori";
import { Input } from "@/components/ui/input";
import { Field } from "./field";

/** Swatch picker + free text (accepts any CSS color). Shows an error for invalid colors. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parse(value.trim());
  return (
    <Field label={label} error={parsed ? undefined : "Not a valid color."}>
      {(id) => (
        <div className="flex gap-2">
          <input
            type="color"
            aria-label={`${label} picker`}
            value={parsed ? formatHex(parsed) : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
          />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="font-mono"
          />
        </div>
      )}
    </Field>
  );
}
