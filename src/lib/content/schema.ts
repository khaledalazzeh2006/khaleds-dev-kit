import { z } from "zod";

// Mirrors content/schemas/command.schema.json. The JSON Schema is checked by
// `pnpm validate:content`; this zod copy guards the app at runtime.
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const commandSchema = z
  .object({
    id: z.string().regex(kebab),
    framework: z.string(),
    title: z.string().max(80),
    command: z.string(),
    description: z.string().max(160),
    vars: z
      .array(
        z.object({ key: z.string(), default: z.string(), label: z.string().optional() }).strict(),
      )
      .optional(),
    flags: z.array(z.object({ flag: z.string(), desc: z.string() }).strict()).optional(),
    platforms: z
      .object({ windows: z.string().optional(), macos: z.string().optional() })
      .strict()
      .optional(),
    tags: z.array(z.string()),
    danger: z.boolean().optional(),
    source: z.url(),
    verified: z.string().regex(/^\d{4}-\d{2}$/),
  })
  .strict();

export type Command = z.infer<typeof commandSchema>;
export type CommandVar = NonNullable<Command["vars"]>[number];
