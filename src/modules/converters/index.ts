import { lazy } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { DevKitModule, ModuleItem } from "@/app/module";

const items: ModuleItem[] = [
  {
    id: "color",
    title: "Color",
    description: "HEX, RGB, HSL, OKLCH + contrast",
    tags: ["css"],
    keywords: ["hex", "rgb", "hsl", "oklch", "contrast", "wcag"],
  },
  {
    id: "px-rem",
    title: "PX ↔ REM",
    description: "Convert pixels to rem and back",
    tags: ["css"],
    keywords: ["units", "font size", "pixels", "root"],
  },
  {
    id: "image",
    title: "Image",
    description: "Compress, resize, WebP / AVIF",
    tags: ["media"],
    keywords: ["webp", "avif", "jpeg", "png", "compress", "resize", "optimize"],
  },
  {
    id: "json-yaml",
    title: "JSON ↔ YAML",
    description: "Configs, Compose files, workflows",
    tags: ["data"],
    keywords: ["yml", "docker", "config"],
  },
  {
    id: "json-csv",
    title: "JSON ↔ CSV",
    description: "Arrays of objects ↔ spreadsheets",
    tags: ["data"],
    keywords: ["excel", "spreadsheet", "table"],
  },
  {
    id: "json-ts",
    title: "JSON → TypeScript",
    description: "Interfaces from a JSON sample",
    tags: ["data"],
    keywords: ["types", "interface", "api", "ts"],
  },
  {
    id: "svg-jsx",
    title: "SVG → JSX",
    description: "SVG to a React component",
    tags: ["react"],
    keywords: ["icon", "react", "component", "tsx"],
  },
  {
    id: "base64",
    title: "Base64",
    description: "Encode / decode, UTF-8 safe",
    tags: ["encode"],
    keywords: ["btoa", "atob", "encode", "decode"],
  },
  {
    id: "url",
    title: "URL encode / decode",
    description: "Percent-encoding + query params",
    tags: ["encode"],
    keywords: ["uri", "query", "params", "percent"],
  },
  {
    id: "timestamp",
    title: "Timestamp",
    description: "Unix ↔ ISO, UTC, local, relative",
    tags: ["time"],
    keywords: ["unix", "epoch", "date", "iso"],
  },
];

export const convertersModule: DevKitModule = {
  id: "converters",
  title: "Converters",
  description: "Units, colors, encodings and formats",
  icon: ArrowLeftRight,
  order: 30,
  items: () => items,
  Detail: lazy(() => import("./components/detail")),
};
