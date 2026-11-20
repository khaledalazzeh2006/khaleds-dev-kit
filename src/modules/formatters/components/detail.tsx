import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { DetailProps } from "@/app/module";
import { formatterTools } from "../lib/tools";
import { FormatterTool } from "./formatter-tool";

const DiffTool: LazyExoticComponent<ComponentType> = lazy(() => import("./diff-tool"));

export default function FormattersDetail({ item }: DetailProps) {
  if (item.id === "diff") return <DiffTool />;
  const config = formatterTools.find((t) => t.id === item.id);
  return config ? <FormatterTool key={config.id} config={config} /> : null;
}
