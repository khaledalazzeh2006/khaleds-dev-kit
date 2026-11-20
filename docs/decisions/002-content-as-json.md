# 002 — Static content as validated JSON

**Context:** Hundreds of commands/snippets that must be easy to add and safe to load.

**Decision:** JSON files in `content/`, JSON Schema + zod validation, `source` + `verified` fields.

**Consequences:** adding content needs no code; bad entries fail validation instead of breaking the
UI; stale entries are detectable by `verified` date.
