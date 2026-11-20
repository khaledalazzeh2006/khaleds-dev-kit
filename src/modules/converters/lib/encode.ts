import { formatInfo, type ImageFormat } from "./image";
import type { EncodeRequest } from "./encode.worker";

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (b: Blob) => void; reject: (e: Error) => void; mime: string }
>();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./encode.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<{ id: number; buffer?: ArrayBuffer; error?: string }>) => {
      const job = pending.get(e.data.id);
      if (!job) return;
      pending.delete(e.data.id);
      if (e.data.buffer) job.resolve(new Blob([e.data.buffer], { type: job.mime }));
      else job.reject(new Error(e.data.error ?? "Encoding failed."));
    };
  }
  return worker;
}

/** Encode pixels to the chosen format. PNG uses the browser; the rest use WASM codecs in a worker. */
export function encodeImage(data: ImageData, format: ImageFormat, quality: number): Promise<Blob> {
  if (format === "png") {
    const canvas = document.createElement("canvas");
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext("2d")!.putImageData(data, 0, 0);
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encoding failed."))),
        "image/png",
      ),
    );
  }
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, mime: formatInfo[format].mime });
    const req: EncodeRequest = { id, data, format, quality };
    getWorker().postMessage(req);
  });
}
