import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";

// One lazy chunk per tool.
const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  shadow: lazy(() => import("./shadow-tool")),
  gradient: lazy(() => import("./gradient-tool")),
  radius: lazy(() => import("./radius-tool")),
  flexbox: lazy(() => import("./flex-tool")),
  grid: lazy(() => import("./grid-tool")),
  glass: lazy(() => import("./glass-tool")),
  transition: lazy(() => import("./transition-tool")),
  "clip-path": lazy(() => import("./clip-path-tool")),
};

export default function CssToolsDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  return Tool ? <Tool /> : null;
}
