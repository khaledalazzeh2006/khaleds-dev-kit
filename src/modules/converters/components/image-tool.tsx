import { useEffect, useMemo, useState } from "react";
import { Download, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/tool/field";
import { RangeField } from "@/components/tool/range-field";
import { Segmented } from "@/components/tool/segmented";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useAsyncResult } from "@/lib/hooks/use-async-result";
import { usePersistentState } from "@/lib/hooks/use-persistent-state";
import { saveBlob } from "@/lib/save-file";
import { cn } from "@/lib/utils";
import { encodeImage } from "../lib/encode";
import {
  formatBytes,
  formatInfo,
  loadPixels,
  outputName,
  sizeChange,
  type ImageFormat,
} from "../lib/image";

export default function ImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = usePersistentState<ImageFormat>("conv:image:format", "webp");
  const [quality, setQuality] = usePersistentState("conv:image:quality", 80);
  const [maxWidth, setMaxWidth] = usePersistentState("conv:image:maxWidth", "");

  const result = useAsyncResult(
    async () => {
      if (!file) return null;
      const pixels = await loadPixels(file, Number(maxWidth) || undefined);
      const blob = await encodeImage(pixels, format, quality);
      return { blob, width: pixels.width, height: pixels.height };
    },
    [file, format, quality, maxWidth],
    300,
  );
  const out = result.data ?? null;

  // Object URL for the preview, revoked when it changes.
  const previewUrl = useMemo(() => (out ? URL.createObjectURL(out.blob) : null), [out]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pick = (files: FileList | null) => {
    const f = files?.[0];
    if (f && f.type.startsWith("image/")) setFile(f);
  };

  return (
    <ToolLayout
      title="Image"
      description="Compress, resize and convert images to WebP, AVIF, JPEG or PNG — all offline."
      input={
        <>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-accent/50",
              dragging && "border-primary bg-primary/10",
            )}
          >
            <ImageUp className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {file ? file.name : "Drop an image or click to choose"}
            </span>
            <span className="text-xs text-muted-foreground">
              {file ? formatBytes(file.size) : "PNG, JPEG, WebP, AVIF, GIF, SVG"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pick(e.target.files)}
            />
          </label>
          <Segmented
            label="Output format"
            value={format}
            onChange={setFormat}
            options={(Object.keys(formatInfo) as ImageFormat[]).map((f) => ({
              value: f,
              label: formatInfo[f].label,
            }))}
          />
          {formatInfo[format].lossy && (
            <RangeField label="Quality" value={quality} onChange={setQuality} min={10} max={100} />
          )}
          <Field
            label="Max width (px)"
            hint="Leave empty to keep the original size. Never upscales."
          >
            {(id) => (
              <Input
                id={id}
                inputMode="numeric"
                placeholder="e.g. 1600"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value.replace(/\D/g, ""))}
              />
            )}
          </Field>
        </>
      }
      output={
        !file ? (
          <p className="text-muted-foreground">Choose an image to see the result here.</p>
        ) : result.error ? (
          <p className="text-xs text-destructive">{result.error}</p>
        ) : !out || !previewUrl ? (
          <p className="text-muted-foreground">Converting…</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="text-xs">
                <span className="text-muted-foreground">{formatBytes(file.size)} → </span>
                <span className="font-medium">{formatBytes(out.blob.size)}</span>
                <span
                  className={cn(
                    "ml-2 font-medium",
                    out.blob.size < file.size ? "text-success" : "text-warning",
                  )}
                >
                  {sizeChange(file.size, out.blob.size)}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {out.width}×{out.height}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => void saveBlob(out.blob, outputName(file.name, format))}
              >
                <Download /> Save
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
              <img
                src={previewUrl}
                alt="Converted preview"
                className="mx-auto max-h-96 object-contain"
              />
            </div>
          </div>
        )
      }
    />
  );
}
