import type { FormatterConfig } from "../components/formatter-tool";

/** The formatter tools, in list order. Each entry is one item in the Formatters module. */
export const formatterTools: (FormatterConfig & { id: string; keywords: string[] })[] = [
  {
    id: "json",
    lang: "json",
    title: "JSON",
    description: "Format, validate or minify JSON.",
    editor: "json",
    keywords: ["prettify", "beautify", "validate", "minify"],
    sample: '{"name":"devkit","version":"0.1.0","tags":["tauri","react"],"private":true}',
  },
  {
    id: "html",
    lang: "html",
    title: "HTML",
    description: "Format HTML with Prettier.",
    editor: "html",
    keywords: ["prettify", "beautify", "markup"],
    sample:
      '<section class="hero"><h1>Hello</h1><p>Welcome to <a href="/docs">the docs</a></p></section>',
  },
  {
    id: "css",
    lang: "css",
    title: "CSS",
    description: "Format or minify CSS.",
    editor: "css",
    keywords: ["prettify", "beautify", "minify", "stylesheet"],
    sample:
      ".card{display:flex;gap:12px;padding:16px;border-radius:10px;background:#18181b}.card:hover{background:#27272a}",
  },
  {
    id: "javascript",
    lang: "javascript",
    title: "JavaScript",
    description: "Format or minify JavaScript and JSX.",
    editor: "jsx",
    keywords: ["js", "jsx", "prettify", "beautify", "minify", "uglify"],
    sample: "export function sum(a,b){return a+b}\nconst items=[1,2,3].map(n=>n*2)",
  },
  {
    id: "typescript",
    lang: "typescript",
    title: "TypeScript",
    description: "Format TypeScript and TSX with Prettier.",
    editor: "typescript",
    keywords: ["ts", "tsx", "prettify", "beautify"],
    sample:
      "interface User{id:number;name:string}\nexport const greet=(u:User):string=>`Hi ${u.name}`",
  },
  {
    id: "sql",
    lang: "sql",
    title: "SQL",
    description: "Format SQL for PostgreSQL, MySQL, SQLite or SQL Server.",
    editor: "sql",
    keywords: ["query", "postgres", "mysql", "prettify"],
    sample:
      "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = true group by u.id, u.name order by orders desc limit 10",
  },
];
