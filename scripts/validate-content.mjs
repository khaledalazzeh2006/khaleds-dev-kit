// Validates everything in content/ against content/schemas/ and checks ids are unique.
// Usage: pnpm validate:content
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = join(import.meta.dirname, "..", "content");
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const load = (p) => JSON.parse(readFileSync(p, "utf8"));
const validateCommands = ajv.compile(load(join(root, "schemas", "command.schema.json")));
const validateSnippet = ajv.compile(load(join(root, "schemas", "snippet.schema.json")));

const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
      });

const errors = [];
const ids = new Map();
const seen = (id, file) => {
  if (ids.has(id)) errors.push(`${file}: duplicate id "${id}" (also in ${ids.get(id)})`);
  else ids.set(id, file);
};

const check = (file, validate, data) => {
  const rel = relative(root, file);
  if (!validate(data)) {
    for (const e of validate.errors) errors.push(`${rel}${e.instancePath}: ${e.message}`);
    return;
  }
  (Array.isArray(data) ? data : [data]).forEach((item) => seen(item.id, rel));
};

let files = 0;
for (const f of walk(join(root, "commands"))) (files++, check(f, validateCommands, load(f)));
for (const f of walk(join(root, "snippets"))) (files++, check(f, validateSnippet, load(f)));
// The schema examples must stay valid too.
check(
  join(root, "schemas/examples/command.example.json"),
  validateCommands,
  load(join(root, "schemas/examples/command.example.json")),
);
check(
  join(root, "schemas/examples/snippet.example.json"),
  validateSnippet,
  load(join(root, "schemas/examples/snippet.example.json")),
);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ content valid (${files} file(s), ${ids.size} id(s))`);
