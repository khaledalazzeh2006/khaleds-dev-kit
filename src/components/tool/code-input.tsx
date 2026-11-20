import { useMemo } from "react";
import CodeMirror, { EditorView, type Extension } from "@uiw/react-codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";
import { cn } from "@/lib/utils";

export type CodeLanguage =
  "json" | "html" | "css" | "javascript" | "typescript" | "jsx" | "sql" | "yaml" | "text";

const languages: Record<CodeLanguage, () => Extension[]> = {
  json: () => [json()],
  html: () => [html()],
  css: () => [css()],
  javascript: () => [javascript()],
  typescript: () => [javascript({ typescript: true })],
  jsx: () => [javascript({ jsx: true, typescript: true })],
  sql: () => [sql()],
  yaml: () => [yaml()],
  text: () => [],
};

// Colors come from theme.css tokens, so editors follow dark/light automatically.
const theme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "12.5px",
    height: "100%",
  },
  "&.cm-focused": { outline: "none" },
  // No ligatures: code should show exactly the characters you will copy (=> not ⇒).
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.6",
    fontVariantLigatures: "none",
  },
  ".cm-content": { caretColor: "var(--foreground)", padding: "10px 0" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
  },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
  "&.cm-focused .cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--accent) 60%, transparent)",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in oklch, var(--primary) 30%, transparent) !important",
  },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
  ".cm-matchingBracket": { backgroundColor: "var(--accent)", outline: "1px solid var(--border)" },
});

const highlight = syntaxHighlighting(
  HighlightStyle.define([
    {
      tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword],
      color: "var(--syntax-keyword)",
    },
    { tag: [t.string, t.special(t.string), t.regexp], color: "var(--syntax-string)" },
    { tag: [t.number, t.bool, t.null, t.atom], color: "var(--syntax-number)" },
    { tag: [t.propertyName, t.attributeName], color: "var(--syntax-property)" },
    {
      tag: [t.function(t.variableName), t.function(t.propertyName)],
      color: "var(--syntax-function)",
    },
    { tag: [t.tagName, t.typeName, t.className], color: "var(--syntax-tag)" },
    { tag: [t.comment, t.meta], color: "var(--syntax-comment)", fontStyle: "italic" },
  ]),
);

interface CodeInputProps {
  value: string;
  onChange?: (value: string) => void;
  language?: CodeLanguage;
  placeholder?: string;
  readOnly?: boolean;
  /** Accessible name, e.g. "JSON input". */
  label: string;
  invalid?: boolean;
  className?: string;
}

/** Code editor (CodeMirror 6) with syntax highlighting, themed by the app tokens. */
export function CodeInput({
  value,
  onChange,
  language = "text",
  placeholder,
  readOnly,
  label,
  invalid,
  className,
}: CodeInputProps) {
  const extensions = useMemo(
    () => [
      ...languages[language](),
      theme,
      highlight,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-label": label }),
    ],
    [language, label],
  );

  return (
    <div
      className={cn(
        "min-h-40 overflow-hidden rounded-lg border bg-muted/30 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
        invalid && "border-destructive",
        className,
      )}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        placeholder={placeholder}
        readOnly={readOnly}
        editable={!readOnly}
        theme="none"
        height="100%"
        basicSetup={{
          lineNumbers: !readOnly,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          autocompletion: false,
          searchKeymap: true,
        }}
        className="h-full"
      />
    </div>
  );
}
