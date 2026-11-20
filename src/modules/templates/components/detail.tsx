import type { DetailProps } from "@/app/module";
import { presetById } from "../lib/presets";
import Builder from "./builder";

export default function TemplatesDetail({ item }: DetailProps) {
  const preset = presetById.get(item.id);
  // key: switching presets starts a fresh builder (its own section list).
  return preset ? <Builder key={preset.id} preset={preset} /> : null;
}
