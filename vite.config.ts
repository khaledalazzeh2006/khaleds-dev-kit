/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

/**
 * `virtual:tailwind-index-css` = the text of tailwindcss/index.css, so the Templates module can
 * compile Tailwind offline at runtime. (A `?raw` CSS import comes back empty under Vitest.)
 */
function tailwindIndexCss() {
  const id = "virtual:tailwind-index-css";
  return {
    name: "tailwind-index-css",
    resolveId: (source: string) => (source === id ? "\0" + id : null),
    load(resolved: string) {
      if (resolved !== "\0" + id) return null;
      const file = createRequire(import.meta.url).resolve("tailwindcss/index.css");
      return `export default ${JSON.stringify(readFileSync(file, "utf8"))};`;
    },
  };
}

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), tailwindIndexCss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  // Tauri-specific: keep Rust errors visible, fixed port, don't watch src-tauri
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },

  // WASM image codecs must not be pre-bundled; workers are ES modules.
  optimizeDeps: { exclude: ["@jsquash/webp", "@jsquash/avif", "@jsquash/jpeg"] },
  worker: { format: "es" as const },

  // Loaded from disk by the desktop app, so a larger main chunk is fine.
  build: { chunkSizeWarningLimit: 1000 },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
