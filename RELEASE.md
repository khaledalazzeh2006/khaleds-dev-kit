# Releasing Khaled's Dev Kit

Installers for Windows and macOS are built by GitHub Actions (free for public repos) and
published as a GitHub Release. Installed apps check that release and update themselves; every
update is signed, and the app refuses files that weren't signed with your key.

## One-time setup (≈10 minutes)

1. **Create the repo on GitHub** (public), e.g. `khaleds-dev-kit`, then in this folder:

   ```bash
   git remote add origin https://github.com/<your-user>/khaleds-dev-kit.git
   git branch -M main
   git push -u origin main
   ```

2. **Make your signing key** (keep it secret, back it up — without it you can't ship updates):

   ```bash
   pnpm tauri signer generate --ci --force -w ~/.tauri/khaleds-dev-kit.key
   ```

   `--ci` makes a key with no password (one less secret to get wrong). It writes `khaleds-dev-kit.key` (private) and
   `khaleds-dev-kit.key.pub` (public) in `~/.tauri/` (on Windows: `C:\Users\<you>\.tauri\`).

3. **Point the app at your releases** (writes the public key + URL into `src-tauri/tauri.conf.json`):

   ```bash
   pnpm setup:updater <your-user>/khaleds-dev-kit
   git commit -am "chore: set up updater" && git push
   ```

4. **Give GitHub the private key**: repo → Settings → Secrets and variables → Actions →
   New repository secret:
   - `TAURI_SIGNING_PRIVATE_KEY` = the whole content of `~/.tauri/khaleds-dev-kit.key`
     (Windows: `Get-Content -Raw "$HOME\.tauri\khaleds-dev-kit.key" | Set-Clipboard`, then paste)
   - No password secret needed. If a key with a password is used instead, add
     `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` with that exact password.

## Every release

```bash
pnpm check                 # everything green first
pnpm set-version 1.0.1     # package.json + tauri.conf.json + Cargo.toml
git commit -am "release: v1.0.1"
git tag v1.0.1
git push && git push --tags
```

The `release` workflow (Actions tab, ~15 min) builds:

- Windows: `Khaleds Dev Kit_1.0.1_x64-setup.exe` (installs for your user, no admin needed)
- macOS: `.dmg` for Apple Silicon and for Intel
- `latest.json` + `.sig` files for the updater

Installed apps see it within seconds of starting (or via ⓘ → Check for updates).

## Good to know

- **Unsigned installers**: Windows SmartScreen says "Windows protected your PC" → More info →
  Run anyway. macOS: right-click the app → Open the first time (or System Settings → Privacy &
  Security → Open Anyway). Code-signing certificates cost money; this is optional later.
- **Local build without GitHub**: `pnpm tauri build` → `src-tauri/target/release/bundle/nsis/`.
  (Local builds don't make updater files; that needs the private key, done in CI.)
- **Lost the private key?** Make a new one, run `pnpm setup:updater` again, and release; users
  must install that one version by hand, updates work again after it.
- `ci` workflow runs `pnpm check` and the Rust tests on every push to `main`.
