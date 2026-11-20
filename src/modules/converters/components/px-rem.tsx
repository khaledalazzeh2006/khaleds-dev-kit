import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { OutputCode } from "@/components/tool/output-code";
import { ToolLayout } from "@/components/tool/tool-layout";
import { formatNumber, parseNumber, pxToRem, remScale, remToPx } from "../lib/units";

const DEFAULTS = { px: "24", rem: "1.5", base: "16" };

/** Two-way px ↔ rem: typing in either field updates the other. */
export default function PxRemTool() {
  const [px, setPx] = useState(DEFAULTS.px);
  const [rem, setRem] = useState(DEFAULTS.rem);
  const [base, setBase] = useState(DEFAULTS.base);

  const baseNum = parseNumber(base);
  const baseError = baseNum === null || baseNum <= 0 ? "Base must be a number above 0." : undefined;
  const b = baseError ? 16 : baseNum!;

  const onPx = (v: string) => {
    setPx(v);
    const n = parseNumber(v);
    if (n !== null) setRem(formatNumber(pxToRem(n, b)));
  };
  const onRem = (v: string) => {
    setRem(v);
    const n = parseNumber(v);
    if (n !== null) setPx(formatNumber(remToPx(n, b)));
  };
  const onBase = (v: string) => {
    setBase(v);
    const n = parseNumber(v);
    const p = parseNumber(px);
    if (n && n > 0 && p !== null) setRem(formatNumber(pxToRem(p, n)));
  };

  const pxNum = parseNumber(px);
  const result = pxNum === null ? "" : `${formatNumber(pxToRem(pxNum, b))}rem`;

  return (
    <ToolLayout
      title="PX ↔ REM"
      description="Convert pixel values to rem and back, based on the root font size."
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPx(DEFAULTS.px);
            setRem(DEFAULTS.rem);
            setBase(DEFAULTS.base);
          }}
        >
          <RotateCcw /> Reset
        </Button>
      }
      input={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Pixels (px)"
              error={pxNum === null ? "Enter a number, e.g. 24." : undefined}
            >
              {(id) => (
                <Input
                  id={id}
                  inputMode="decimal"
                  value={px}
                  onChange={(e) => onPx(e.target.value)}
                />
              )}
            </Field>
            <Field
              label="Rem"
              error={parseNumber(rem) === null ? "Enter a number, e.g. 1.5." : undefined}
            >
              {(id) => (
                <Input
                  id={id}
                  inputMode="decimal"
                  value={rem}
                  onChange={(e) => onRem(e.target.value)}
                />
              )}
            </Field>
          </div>
          <Field label="Root font size (px)" error={baseError} hint="Browsers default to 16px.">
            {(id) => (
              <Input
                id={id}
                inputMode="decimal"
                value={base}
                onChange={(e) => onBase(e.target.value)}
              />
            )}
          </Field>
        </>
      }
      output={
        <>
          <OutputCode label="Result" code={result} />
          <OutputCode label={`Common sizes (base ${formatNumber(b)}px)`} code={remScale(b)} />
        </>
      }
    />
  );
}
