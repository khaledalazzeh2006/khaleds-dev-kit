# 003 — Libraries for formatters and converters

**Context:** Phase 3 needs formatting, minifying, data conversion and image encoding, offline.

**Decision:** CodeMirror 6 (@uiw/react-codemirror) for editors · prettier/standalone for
HTML/CSS/JS/TS · sql-formatter · csso + terser for minify · js-yaml · papaparse · culori · diff (jsdiff) ·
jSquash WASM codecs (WebP/AVIF/JPEG) in a Web Worker · own code for JSON→TS and SVG→JSX.
Heavy libraries are loaded with dynamic import() only when a tool is used.

**Consequences:** everything runs offline; bundle grows (~1–3 MB JS chunks, ~9 MB WASM) but only
loads on demand. All licenses are MIT/BSD/Apache-2.0.
