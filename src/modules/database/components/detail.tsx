import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";

const tools: Record<string, LazyExoticComponent<ComponentType>> = {
  designer: lazy(() => import("./schema-designer")),
  seed: lazy(() => import("./seed-tool")),
  connection: lazy(() => import("./connection-tool")),
};
const SqlSnippet = lazy(() => import("./sql-snippet"));

export default function DatabaseDetail({ item }: DetailProps) {
  const Tool = tools[item.id];
  return Tool ? <Tool /> : <SqlSnippet item={item} />;
}
