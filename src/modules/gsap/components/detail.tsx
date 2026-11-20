import { lazy } from "react";
import type { DetailProps } from "@/app/module";
import { EASE_TOOL_ID } from "../lib/data";
import SnippetDetail from "./snippet-detail";

const EaseVisualizer = lazy(() => import("./ease-visualizer"));

export default function GsapDetail({ item }: DetailProps) {
  if (item.id === EASE_TOOL_ID) return <EaseVisualizer />;
  return <SnippetDetail key={item.id} item={item} />;
}
