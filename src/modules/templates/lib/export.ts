import { indent, htmlToJsx } from "./jsx";
import { sectionById } from "./sections";
import type { PageContext, Section } from "./model";
import { BODY_CLASS, entryCss, type SiteTheme } from "./theme";

export type Target = "html" | "vite" | "next";
export type Files = Record<string, string>;

/** Versions used in generated package.json files (checked when this phase was built). */
export const VERSIONS = {
  react: "^19.2.0",
  next: "^16.4.0",
  vite: "^8.0.0",
  pluginReact: "^6.0.0",
  tailwind: "^4.3.0",
  typescript: "~6.0.3",
  typesReact: "^19.2.0",
  typesReactDom: "^19.2.0",
  typesNode: "^24.0.0",
};

export function resolveSections(ids: string[]): Section[] {
  return ids.flatMap((id) => sectionById.get(id) ?? []);
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "my-site";

/** Body markup of the page (one block per section). */
export function pageContext(ids: string[]): PageContext {
  return { anchors: resolveSections(ids).flatMap((s) => (s.anchor ? [s.anchor] : [])) };
}

export function pageHtml(ids: string[], theme: SiteTheme): string {
  const page = pageContext(ids);
  return resolveSections(ids)
    .map((s) => s.render(theme, page))
    .join("\n\n");
}

/** Standalone HTML document. `css` = compiled Tailwind (inline) or a link to styles.css. */
export function htmlDocument(
  ids: string[],
  theme: SiteTheme,
  title: string,
  css: { inline: string } | { href: string },
): string {
  const head =
    "inline" in css
      ? `<style>\n${css.inline}\n</style>`
      : `<link rel="stylesheet" href="${css.href}" />`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  ${head}
</head>
<body class="${BODY_CLASS}">
${indent(pageHtml(ids, theme), 2)}
</body>
</html>
`;
}

function component(s: Section, theme: SiteTheme, page: PageContext): string {
  return `export default function ${s.component}() {
  return (
${indent(htmlToJsx(s.render(theme, page)), 4)}
  );
}
`;
}

const tsconfig = (extra: Record<string, unknown>) =>
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["DOM", "DOM.Iterable", "ES2022"],
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        isolatedModules: true,
        ...extra,
      },
    },
    null,
    2,
  ) + "\n";

const readme = (title: string, steps: string[], notes: string[]) => `# ${title}

Generated with Khaled's Dev Kit.

## Run it

\`\`\`bash
${steps.join("\n")}
\`\`\`

## Notes

${notes.map((n) => `- ${n}`).join("\n")}
`;

const THEME_NOTE =
  "Colors, radius and font live in the `@theme` block of the CSS file: change `--color-brand` to re-brand the whole site.";
const IMAGE_NOTE =
  "Image areas are gradient placeholders (`div` with `bg-linear-to-br`): replace them with your own `<img>` tags.";

export function viteProject(ids: string[], theme: SiteTheme, title: string): Files {
  const list = resolveSections(ids);
  const name = slug(title);
  const pkg = {
    name,
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: { react: VERSIONS.react, "react-dom": VERSIONS.react },
    devDependencies: {
      "@tailwindcss/vite": VERSIONS.tailwind,
      "@types/react": VERSIONS.typesReact,
      "@types/react-dom": VERSIONS.typesReactDom,
      "@vitejs/plugin-react": VERSIONS.pluginReact,
      tailwindcss: VERSIONS.tailwind,
      typescript: VERSIONS.typescript,
      vite: VERSIONS.vite,
    },
  };
  const files: Files = {
    "package.json": JSON.stringify(pkg, null, 2) + "\n",
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`,
    "tsconfig.json": tsconfig({ types: ["vite/client"] }),
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body class="${BODY_CLASS}">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    "src/index.css": entryCss(theme),
    "src/App.tsx": `${list.map((s) => `import ${s.component} from "./components/${s.component}";`).join("\n")}

export default function App() {
  return (
    <>
${list.map((s) => `      <${s.component} />`).join("\n")}
    </>
  );
}
`,
    "README.md": readme(
      title,
      ["npm install", "npm run dev"],
      [THEME_NOTE, IMAGE_NOTE, "Each section is its own component in `src/components/`."],
    ),
  };
  for (const s of list)
    files[`src/components/${s.component}.tsx`] = component(s, theme, pageContext(ids));
  return files;
}

export function nextProject(ids: string[], theme: SiteTheme, title: string): Files {
  const list = resolveSections(ids);
  const name = slug(title);
  const pkg = {
    name,
    private: true,
    version: "0.1.0",
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: { next: VERSIONS.next, react: VERSIONS.react, "react-dom": VERSIONS.react },
    devDependencies: {
      "@tailwindcss/postcss": VERSIONS.tailwind,
      "@types/node": VERSIONS.typesNode,
      "@types/react": VERSIONS.typesReact,
      "@types/react-dom": VERSIONS.typesReactDom,
      tailwindcss: VERSIONS.tailwind,
      typescript: VERSIONS.typescript,
    },
  };
  const files: Files = {
    "package.json": JSON.stringify(pkg, null, 2) + "\n",
    "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`,
    "postcss.config.mjs": `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`,
    "tsconfig.json": tsconfig({
      allowJs: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    }).replace(
      /\n}\n$/,
      `,\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}\n`,
    ),
    "app/globals.css": entryCss(theme),
    "app/layout.tsx": `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(`${theme.name}: built with Next.js and Tailwind CSS.`)},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="${BODY_CLASS}">{children}</body>
    </html>
  );
}
`,
    "app/page.tsx": `${list.map((s) => `import ${s.component} from "@/components/${s.component}";`).join("\n")}

export default function Home() {
  return (
    <>
${list.map((s) => `      <${s.component} />`).join("\n")}
    </>
  );
}
`,
    "README.md": readme(
      title,
      ["npm install", "npm run dev"],
      [
        THEME_NOTE,
        IMAGE_NOTE,
        "Sections are Server Components in `components/` (no client JavaScript needed: menus and FAQ use `<details>`).",
      ],
    ),
  };
  for (const s of list)
    files[`components/${s.component}.tsx`] = component(s, theme, pageContext(ids));
  return files;
}

export function htmlProject(ids: string[], theme: SiteTheme, title: string, css: string): Files {
  return {
    "index.html": htmlDocument(ids, theme, title, { href: "styles.css" }),
    "styles.css": css,
    "README.md":
      readme(
        title,
        ["# No build step: open index.html in a browser"],
        [
          "`styles.css` is compiled Tailwind CSS containing only the classes this page uses.",
          'To keep editing with Tailwind, use the React or Next.js export, or the Tailwind CLI with `@import "tailwindcss";` and the `@theme` block below.',
          IMAGE_NOTE,
        ],
      ) + `\n\`\`\`css\n${entryCss(theme)}\`\`\`\n`,
  };
}
