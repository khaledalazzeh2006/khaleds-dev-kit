// CI wrapper around `pnpm tauri …` (used by .github/workflows/release.yml as tauriScript).
// 1. Before building: checks the signing key + password in a few seconds (instead of failing
//    at the end of a 15-minute build) and says exactly which secret is wrong.
// 2. If the build fails: prints the last lines as a GitHub annotation, which shows on the run
//    page and in the public API (full logs need repo-owner access).
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TAURI = (process.env.TAURI_CMD ?? "pnpm tauri").split(" ");
const isWin = process.platform === "win32";

/** GitHub annotation (newlines and % must be encoded). */
const annotate = (title, text) =>
  console.log(
    `::error title=${title}::${text.replace(/%/g, "%25").replace(/\r/g, "").replace(/\n/g, "%0A")}`,
  );

function run(args, capture) {
  return new Promise((resolve) => {
    const child = spawn(TAURI[0], [...TAURI.slice(1), ...args], {
      shell: isWin,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let out = "";
    const onData = (d) => {
      out += d;
      if (!capture) process.stdout.write(d);
      if (out.length > 200_000) out = out.slice(-100_000);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("close", (code) => resolve({ code: code ?? 1, out }));
  });
}

const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
const args = process.argv.slice(2);

if (args[0] === "build") {
  const key = process.env.TAURI_SIGNING_PRIVATE_KEY ?? "";
  const password = process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD;
  if (!key.trim()) {
    annotate("Signing key missing", "The secret TAURI_SIGNING_PRIVATE_KEY is empty or not set (check its exact name in Settings → Secrets and variables → Actions).");
    process.exit(1);
  }
  if (password === undefined || password === "") {
    annotate("Signing password missing", "The secret TAURI_SIGNING_PRIVATE_KEY_PASSWORD is empty or not set (check its exact name).");
    process.exit(1);
  }
  const file = join(mkdtempSync(join(tmpdir(), "sig-")), "check.txt");
  writeFileSync(file, "signing check\n");
  const check = await run(["signer", "sign", file], true);
  if (check.code !== 0) {
    const out = strip(check.out);
    const hint = /password/i.test(out)
      ? "TAURI_SIGNING_PRIVATE_KEY_PASSWORD doesn't match the key (type it again, without quotes or spaces)."
      : "TAURI_SIGNING_PRIVATE_KEY isn't a valid key (copy the whole .key file again).";
    annotate("Signing check failed", `${hint}\n\n${out.trim().split("\n").slice(-8).join("\n")}`);
    process.exit(1);
  }
  console.log("Signing key and password OK.");
}

const result = await run(args, false);
if (result.code !== 0) {
  annotate(`tauri ${args[0]} failed (${process.platform})`, strip(result.out).trim().split("\n").slice(-40).join("\n"));
}
process.exit(result.code);
