import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";
import { ConvertTool } from "./convert-tool";
import { convertConfigs } from "./converters-config";

// One lazy chunk per custom tool, so opening the app doesn't load every tool.
const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  "px-rem": lazy(() => import("./px-rem")),
  color: lazy(() => import("./color-tool")),
  timestamp: lazy(() => import("./time-tool")),
  image: lazy(() => import("./image-tool")),
};

export default function ConvertersDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  if (Tool) return <Tool />;
  const config = convertConfigs.find((c) => c.id === item.id);
  return config ? <ConvertTool key={config.id} config={config} /> : null;
}
