/**
 * Convert the template HTML (which we author to be JSX-safe: void tags self-closed, no inline
 * styles, no comments) into JSX. Only attribute names need renaming.
 */
const renames: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  // Uncontrolled in React: keeps the starting state without needing onChange.
  checked: "defaultChecked",
  maxlength: "maxLength",
  minlength: "minLength",
  autocomplete: "autoComplete",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  viewbox: "viewBox",
};

/** React types these as numbers: rows="5" must become rows={5}. */
const NUMERIC = /(\s)(rows|cols|minLength|maxLength|tabIndex|colSpan|rowSpan|span)="(\d+)"/g;

export function htmlToJsx(html: string): string {
  return html.replace(/<[a-zA-Z][^>]*>/g, (tag) =>
    tag
      .replace(/(\s)([a-zA-Z-]+)(=|(?=[\s/>]))/g, (m, space: string, name: string, eq: string) => {
        const renamed = renames[name.toLowerCase()];
        return renamed ? `${space}${renamed}${eq}` : m;
      })
      .replace(NUMERIC, "$1$2={$3}"),
  );
}

/** Re-indent a block of markup by `spaces`. */
export function indent(code: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return code
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");
}
