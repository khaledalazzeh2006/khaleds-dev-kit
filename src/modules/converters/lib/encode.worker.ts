/// <reference lib="webworker" />
// Encoding (especially AVIF) can take seconds, so it runs off the UI thread.
import type { ImageFormat } from "./image";

export interface EncodeRequest {
  id: number;
  data: ImageData;
  format: Exclude<ImageFormat, "png">;
  quality: number;
}

self.onmessage = async (e: MessageEvent<EncodeRequest>) => {
  const { id, data, format, quality } = e.data;
  try {
    let buffer: ArrayBuffer;
    if (format === "webp") buffer = await (await import("@jsquash/webp")).encode(data, { quality });
    else if (format === "avif")
      buffer = await (await import("@jsquash/avif")).encode(data, { quality });
    else buffer = await (await import("@jsquash/jpeg")).encode(data, { quality });
    self.postMessage({ id, buffer }, [buffer]);
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
