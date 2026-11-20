// One-time setup for auto-updates. Usage:  pnpm setup:updater <github-user>/<repo>
// Reads the PUBLIC key made by `pnpm tauri signer generate` and writes it + the GitHub
// endpoint into src-tauri/tauri.conf.json. The private key never leaves your computer
// (it goes into the repo's GitHub secrets, see RELEASE.md).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const repo = process.argv[2];
if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
  console.error(
    "Usage: pnpm setup:updater <github-user>/<repo>   e.g. pnpm setup:updater khaled/khaleds-dev-kit",
  );
  process.exit(1);
}
const pubPath = process.argv[3] ?? join(homedir(), ".tauri", "khaleds-dev-kit.key.pub");
if (!existsSync(pubPath)) {
  console.error(
    `Public key not found: ${pubPath}\nRun first: pnpm tauri signer generate -w "${pubPath.replace(/\.pub$/, "")}"`,
  );
  process.exit(1);
}
const confPath = new URL("../src-tauri/tauri.conf.json", import.meta.url);
const conf = JSON.parse(readFileSync(confPath, "utf8"));
conf.plugins ??= {};
conf.plugins.updater = {
  ...conf.plugins.updater,
  pubkey: readFileSync(pubPath, "utf8").trim(),
  endpoints: [`https://github.com/${repo}/releases/latest/download/latest.json`],
};
writeFileSync(confPath, JSON.stringify(conf, null, 2) + "\n");
console.log(`Updater set up for ${repo}. Commit src-tauri/tauri.conf.json.`);
