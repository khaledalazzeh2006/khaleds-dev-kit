import type { ConvertConfig } from "./convert-tool";
import { csvToJson, jsonToCsv, jsonToYaml, yamlToJson, type Delimiter } from "../lib/data";
import { jsonToTs } from "../lib/json-to-ts";
import { base64Decode, base64Encode, parseUrl, urlDecode, urlEncode } from "../lib/encoding";
import { svgToJsx } from "../lib/svg-to-jsx";

const SAMPLE_JSON =
  '{\n  "name": "devkit",\n  "version": "0.1.0",\n  "tags": ["tauri", "react"],\n  "author": { "name": "Khaled" }\n}';
const SAMPLE_ROWS =
  '[\n  { "id": 1, "name": "Ada", "active": true },\n  { "id": 2, "name": "Linus", "active": false }\n]';
const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

const delimiterChoice = {
  key: "delimiter",
  label: "Delimiter",
  default: ",",
  options: [
    { value: ",", label: "Comma" },
    { value: ";", label: "Semicolon" },
    { value: "\t", label: "Tab" },
  ],
};

export const convertConfigs: ConvertConfig[] = [
  {
    id: "json-yaml",
    title: "JSON ↔ YAML",
    description: "Convert between JSON and YAML (configs, Docker Compose, GitHub Actions).",
    directions: [
      {
        id: "to-yaml",
        label: "JSON → YAML",
        inLang: "json",
        outLang: "yaml",
        sample: SAMPLE_JSON,
        run: (i) => jsonToYaml(i),
      },
      {
        id: "to-json",
        label: "YAML → JSON",
        inLang: "yaml",
        outLang: "json",
        sample: "name: devkit\ntags:\n  - tauri\n  - react\n",
        run: (i) => yamlToJson(i),
      },
    ],
  },
  {
    id: "json-csv",
    title: "JSON ↔ CSV",
    description: "Turn an array of objects into a spreadsheet-ready CSV, and back.",
    choices: [delimiterChoice],
    directions: [
      {
        id: "to-csv",
        label: "JSON → CSV",
        inLang: "json",
        sample: SAMPLE_ROWS,
        run: (i, o) => jsonToCsv(i, o.delimiter as Delimiter),
      },
      {
        id: "to-json",
        label: "CSV → JSON",
        inLang: "text",
        outLang: "json",
        sample: "id,name,active\n1,Ada,true\n2,Linus,false",
        run: (i, o) => csvToJson(i, o.delimiter as Delimiter),
      },
    ],
  },
  {
    id: "json-ts",
    title: "JSON → TypeScript",
    description: "Generate TypeScript interfaces from a JSON sample (e.g. an API response).",
    textOptions: [{ key: "root", label: "Root type name", default: "Root" }],
    directions: [
      {
        id: "to-ts",
        label: "JSON → TS",
        inLang: "json",
        outLang: "typescript",
        sample: SAMPLE_JSON,
        run: (i, o) => jsonToTs(i, o.root || "Root"),
      },
    ],
  },
  {
    id: "base64",
    title: "Base64",
    description: "Encode or decode Base64 (UTF-8 safe, works with Arabic and emoji).",
    choices: [
      {
        key: "urlSafe",
        label: "Alphabet",
        default: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "url", label: "URL-safe" },
        ],
      },
    ],
    directions: [
      {
        id: "encode",
        label: "Encode",
        inLang: "text",
        sample: "Hello, Khaled 👋",
        run: (i, o) => (i ? base64Encode(i, o.urlSafe === "url") : ""),
      },
      {
        id: "decode",
        label: "Decode",
        inLang: "text",
        sample: "SGVsbG8sIEtoYWxlZCDwn5GL",
        run: (i) => (i.trim() ? base64Decode(i) : ""),
      },
    ],
  },
  {
    id: "url",
    title: "URL encode / decode",
    description: "Percent-encode text for URLs, decode it, and inspect query parameters.",
    directions: [
      {
        id: "encode",
        label: "Encode",
        inLang: "text",
        sample: "search term & more/=?",
        run: (i) => urlEncode(i),
      },
      {
        id: "decode",
        label: "Decode",
        inLang: "text",
        sample: "https://example.com/search?q=react%20hooks&page=2",
        run: (i) => urlDecode(i),
      },
    ],
    extraOutput: (input, direction) => {
      const parts = parseUrl(direction.id === "decode" ? input : decodeURIComponent(input));
      if (!parts) return null;
      const rows: [string, string][] = [
        ["Protocol", parts.protocol],
        ["Host", parts.host],
        ...(parts.port ? [["Port", parts.port] as [string, string]] : []),
        ["Path", parts.path],
        ...(parts.hash ? [["Hash", parts.hash] as [string, string]] : []),
        ...parts.params.map(([k, v]) => [`?${k}`, v] as [string, string]),
      ];
      return (
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">URL parts</div>
          <table className="w-full text-xs">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b last:border-0">
                  <th
                    scope="row"
                    className="w-28 px-3 py-1.5 text-left font-medium text-muted-foreground"
                  >
                    {k}
                  </th>
                  <td className="px-3 py-1.5 font-mono break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
  {
    id: "svg-jsx",
    title: "SVG → JSX",
    description: "Turn an SVG into a React component (attributes camelCased, props spread).",
    textOptions: [{ key: "name", label: "Component name", default: "Icon" }],
    choices: [
      {
        key: "ts",
        label: "Language",
        default: "ts",
        options: [
          { value: "ts", label: "TSX" },
          { value: "js", label: "JSX" },
        ],
      },
      {
        key: "color",
        label: "Colors",
        default: "current",
        options: [
          { value: "current", label: "currentColor" },
          { value: "keep", label: "Keep" },
        ],
      },
      {
        key: "size",
        label: "Size",
        default: "remove",
        options: [
          { value: "remove", label: "Remove size" },
          { value: "keep", label: "Keep size" },
        ],
      },
    ],
    directions: [
      {
        id: "to-jsx",
        label: "SVG → JSX",
        inLang: "html",
        outLang: "jsx",
        sample: SAMPLE_SVG,
        run: (i, o) =>
          svgToJsx(i, {
            componentName: o.name || "Icon",
            typescript: o.ts === "ts",
            currentColor: o.color === "current",
            removeSize: o.size === "remove",
          }),
      },
    ],
    // Preview as an <img>: scripts inside a pasted SVG can't run this way.
    extraOutput: (input) =>
      input.trim().startsWith("<svg") ? (
        <div className="flex items-center gap-4 rounded-lg border p-3">
          <span className="text-xs text-muted-foreground">Preview</span>
          <img
            alt="SVG preview"
            className="size-12 rounded bg-white p-1"
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(input)}`}
          />
        </div>
      ) : null,
  },
];
