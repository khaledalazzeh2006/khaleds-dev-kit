import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";

// One lazy chunk per tool, so opening the app doesn't load every tool.
const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  "px-rem": lazy(() => import("./px-rem")),
};

export default function ConvertersDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  return Tool ? <Tool /> : null;
}
