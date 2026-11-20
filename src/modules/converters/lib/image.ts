export type ImageFormat = "webp" | "avif" | "jpeg" | "png";

export const formatInfo: Record<
  ImageFormat,
  { label: string; mime: string; ext: string; lossy: boolean }
> = {
  webp: { label: "WebP", mime: "image/webp", ext: "webp", lossy: true },
  avif: { label: "AVIF", mime: "image/avif", ext: "avif", lossy: true },
  jpeg: { label: "JPEG", mime: "image/jpeg", ext: "jpg", lossy: true },
  png: { label: "PNG", mime: "image/png", ext: "png", lossy: false },
};

/** Scale (w, h) down to fit maxWidth, keeping the aspect ratio. Never upscales. */
export function fitSize(
  width: number,
  height: number,
  maxWidth?: number,
): { width: number; height: number } {
  if (!maxWidth || maxWidth <= 0 || width <= maxWidth) return { width, height };
  return {
    width: Math.round(maxWidth),
    height: Math.max(1, Math.round((height * maxWidth) / width)),
  };
}

/** "photo.png" + webp → "photo.webp" */
export function outputName(name: string, format: ImageFormat): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${formatInfo[format].ext}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** "−63%" / "+12%" change from before to after. */
export function sizeChange(before: number, after: number): string {
  if (!before) return "";
  const pct = Math.round(((after - before) / before) * 100);
  return `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct)}%`;
}

/** Decode a file and draw it at the target size. Runs on the main thread (needs a canvas). */
export async function loadPixels(file: Blob, maxWidth?: number): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitSize(bitmap.width, bitmap.height, maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return ctx.getImageData(0, 0, width, height);
}
