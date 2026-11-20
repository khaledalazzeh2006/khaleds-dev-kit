import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";

const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  devices: lazy(() => import("./device-preview")),
  breakpoints: lazy(() => import("./breakpoints-tool")),
  clamp: lazy(() => import("./clamp-tool")),
  queries: lazy(() => import("./query-tool")),
  srcset: lazy(() => import("./srcset-tool")),
  units: lazy(() => import("./units-tool")),
};

export default function ResponsiveDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  return Tool ? <Tool /> : null;
}
