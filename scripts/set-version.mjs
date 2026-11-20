// Set the app version everywhere at once. Usage:  pnpm set-version 1.0.1
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: pnpm set-version <major.minor.patch>   e.g. pnpm set-version 1.0.1");
  process.exit(1);
}
const edit = (path, fn) => {
  const url = new URL(`../${path}`, import.meta.url);
  writeFileSync(url, fn(readFileSync(url, "utf8")));
  console.log(`  ${path} → ${version}`);
};
edit("package.json", (s) => s.replace(/"version": "[^"]+"/, `"version": "${version}"`));
edit("src-tauri/tauri.conf.json", (s) =>
  s.replace(/"version": "[^"]+"/, `"version": "${version}"`),
);
edit("src-tauri/Cargo.toml", (s) => s.replace(/^version = "[^"]+"/m, `version = "${version}"`));
console.log(
  `\nNext:\n  git commit -am "release: v${version}"\n  git tag v${version}\n  git push && git push --tags`,
);
