/// <reference types="vite/client" />

declare module "virtual:tailwind-index-css" {
  const css: string;
  export default css;
}

/** package.json version, baked in at build time (the desktop app reads its own version at runtime). */
declare const __APP_VERSION__: string;
