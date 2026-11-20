import { loadCommands } from "@/lib/content/load";
import type { Command } from "@/lib/content/schema";
import { fillVars, renderCommand } from "./lib/render";
import { frameworks } from "./lib/frameworks";

const cmd: Command = {
  id: "x-create",
  framework: "nextjs",
  title: "Create",
  command: "npx create-next-app@latest {{name}}",
  description: "d",
  vars: [{ key: "name", default: "my-app" }],
  flags: [
    { flag: "--ts", desc: "" },
    { flag: "--tailwind", desc: "" },
  ],
  platforms: { windows: "npx.cmd create-next-app@latest {{name}}" },
  tags: [],
  source: "https://nextjs.org",
  verified: "2026-11",
};

describe("renderCommand", () => {
  it("fills vars and falls back to defaults", () => {
    expect(fillVars(cmd.command, cmd, { name: "shop" })).toBe("npx create-next-app@latest shop");
    expect(fillVars(cmd.command, cmd, { name: "  " })).toBe("npx create-next-app@latest my-app");
  });

  it("uses the platform override", () => {
    expect(renderCommand(cmd, { platform: "windows" })).toBe(
      "npx.cmd create-next-app@latest my-app",
    );
    expect(renderCommand(cmd, { platform: "macos" })).toBe("npx create-next-app@latest my-app");
  });

  it("appends selected flags in the entry's order", () => {
    expect(renderCommand(cmd, { platform: "macos", flags: ["--tailwind", "--ts"] })).toBe(
      "npx create-next-app@latest my-app --ts --tailwind",
    );
  });
});

describe("content", () => {
  const commands = loadCommands();

  it("loads every command file", () => {
    expect(commands.length).toBeGreaterThan(100);
  });

  it("has unique ids and a known framework for every command", () => {
    expect(new Set(commands.map((c) => c.id)).size).toBe(commands.length);
    for (const c of commands) expect(frameworks[c.framework], c.id).toBeDefined();
  });

  it("declares every {{var}} it uses", () => {
    for (const c of commands) {
      const used = [
        ...(c.command + (c.platforms?.windows ?? "") + (c.platforms?.macos ?? "")).matchAll(
          /\{\{(\w+)\}\}/g,
        ),
      ].map((m) => m[1]);
      for (const key of used)
        expect(
          c.vars?.some((v) => v.key === key),
          `${c.id}: ${key}`,
        ).toBe(true);
    }
  });
});
