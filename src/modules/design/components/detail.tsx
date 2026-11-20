import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";

const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  palette: lazy(() => import("./palette-tool")),
  "type-scale": lazy(() => import("./type-scale-tool")),
  spacing: lazy(() => import("./spacing-tool")),
  contrast: lazy(() => import("./contrast-tool")),
};

export default function DesignDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  return Tool ? <Tool /> : null;
}
