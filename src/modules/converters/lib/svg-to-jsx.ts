export interface SvgToJsxOptions {
  componentName: string;
  typescript: boolean;
  /** Replace fill/stroke colors with currentColor so the icon follows text color. */
  currentColor: boolean;
  /** Drop width/height on the root so the icon is sized with CSS or props. */
  removeSize: boolean;
}

const KEEP_AS_IS = /^(data-|aria-)/;
const SPECIAL: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  "xml:lang": "xmlLang",
  "xmlns:xlink": "xmlnsXlink",
  tabindex: "tabIndex",
};

const camel = (s: string) => s.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());

function attrName(name: string): string {
  if (SPECIAL[name]) return SPECIAL[name];
  if (KEEP_AS_IS.test(name)) return name;
  return camel(name);
}

function styleObject(style: string): string {
  const pairs = style
    .split(";")
    .map((d) => d.split(":").map((x) => x.trim()))
    .filter(([k, v]) => k && v)
    .map(
      ([k, v]) => `${k!.startsWith("--") ? JSON.stringify(k) : camel(k!)}: ${JSON.stringify(v)}`,
    );
  return `{{ ${pairs.join(", ")} }}`;
}

const isPaint = (name: string) => name === "fill" || name === "stroke";
const keepPaint = (v: string) =>
  /^(none|currentcolor|transparent|inherit)$/i.test(v) || v.startsWith("url(");

function jsxText(text: string): string {
  return /[{}<>]/.test(text) ? `{${JSON.stringify(text)}}` : text;
}

/** Convert SVG markup into a React component. Throws if the SVG can't be parsed. */
export function svgToJsx(svg: string, opts: SvgToJsxOptions): string {
  if (!svg.trim()) return "";
  const doc = new DOMParser().parseFromString(svg.trim(), "image/svg+xml");
  const root = doc.documentElement;
  if (doc.getElementsByTagName("parsererror").length || root.nodeName !== "svg") {
    throw new Error("Couldn't read this SVG. Paste markup that starts with <svg.");
  }

  const render = (el: Element, depth: number): string => {
    const pad = "  ".repeat(depth);
    const attrs: string[] = [];
    for (const a of Array.from(el.attributes)) {
      if (el === root && opts.removeSize && (a.name === "width" || a.name === "height")) continue;
      let value = a.value;
      if (opts.currentColor && isPaint(a.name) && !keepPaint(value)) value = "currentColor";
      if (a.name === "style") attrs.push(`style=${styleObject(value)}`);
      else attrs.push(`${attrName(a.name)}=${JSON.stringify(value)}`);
    }
    if (el === root) attrs.push("{...props}");

    const children: string[] = [];
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === 1) children.push(render(node as Element, depth + 1));
      else if (node.nodeType === 3 && node.textContent?.trim()) {
        children.push(`${"  ".repeat(depth + 1)}${jsxText(node.textContent.trim())}`);
      }
    }

    const open = `${pad}<${el.nodeName}${attrs.length ? " " + attrs.join(" ") : ""}`;
    if (!children.length) return `${open} />`;
    return `${open}>\n${children.join("\n")}\n${pad}</${el.nodeName}>`;
  };

  const name = /^[A-Z][A-Za-z0-9]*$/.test(opts.componentName) ? opts.componentName : "Icon";
  const signature = opts.typescript ? `props: SVGProps<SVGSVGElement>` : "props";
  const header = opts.typescript ? `import type { SVGProps } from "react";\n\n` : "";
  return `${header}export function ${name}(${signature}) {\n  return (\n${render(root, 2)}\n  );\n}\n`;
}
