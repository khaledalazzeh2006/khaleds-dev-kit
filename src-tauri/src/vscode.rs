//! VS Code + project files: install snippets, write a generated project, open folders in VS Code.

use std::collections::HashMap;
use std::path::{Component, Path, PathBuf};
use std::process::Command;

#[cfg(windows)]
use std::os::windows::process::CommandExt;
#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

pub const SNIPPETS_FILE: &str = "khaleds-dev-kit.code-snippets";

/// VS Code's per-user folder (…/Code/User), where `snippets/` lives.
fn vscode_user_dir() -> Result<PathBuf, String> {
    #[cfg(windows)]
    let base = std::env::var("APPDATA").map(PathBuf::from);
    #[cfg(target_os = "macos")]
    let base = std::env::var("HOME").map(|h| PathBuf::from(h).join("Library/Application Support"));
    #[cfg(all(unix, not(target_os = "macos")))]
    let base = std::env::var("HOME").map(|h| PathBuf::from(h).join(".config"));
    Ok(base
        .map_err(|_| "Can't find your user folder.".to_string())?
        .join("Code")
        .join("User"))
}

/// Write the library as a global snippets file. Returns the full path.
#[tauri::command]
pub fn vscode_install_snippets(content: String) -> Result<String, String> {
    let user = vscode_user_dir()?;
    if !user.is_dir() {
        return Err(format!(
            "VS Code doesn't seem to be installed for this user (no {} folder). Open VS Code once, then try again.",
            user.display()
        ));
    }
    let dir = user.join("snippets");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(SNIPPETS_FILE);
    std::fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

/// Only plain relative paths (no `..`, no drive letters) may be written.
fn safe_relative(path: &str) -> Result<PathBuf, String> {
    let p = Path::new(path);
    if path.is_empty() || p.components().any(|c| !matches!(c, Component::Normal(_))) {
        return Err(format!("Refusing to write “{path}”."));
    }
    Ok(p.to_path_buf())
}

/// Create `dir` (must not exist yet, or be empty) and write every file into it.
#[tauri::command]
pub fn write_project(dir: String, files: HashMap<String, String>) -> Result<String, String> {
    let root = PathBuf::from(&dir);
    if root.exists() {
        let empty = std::fs::read_dir(&root)
            .map_err(|e| e.to_string())?
            .next()
            .is_none();
        if !empty {
            return Err(format!(
                "“{}” already exists and isn't empty.",
                root.display()
            ));
        }
    }
    let checked: Vec<(PathBuf, &String)> = files
        .iter()
        .map(|(p, c)| safe_relative(p).map(|rel| (root.join(rel), c)))
        .collect::<Result<_, _>>()?;
    for (path, content) in checked {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&path, content).map_err(|e| e.to_string())?;
    }
    Ok(root.display().to_string())
}

/// Open a folder (or file) in VS Code.
#[tauri::command]
pub fn open_in_vscode(path: String) -> Result<(), String> {
    if !Path::new(&path).exists() {
        return Err(format!("Not found: {path}"));
    }
    #[cfg(windows)]
    let result = Command::new("cmd")
        .raw_arg(format!("/D /S /C \"code \"{path}\"\""))
        .creation_flags(CREATE_NO_WINDOW)
        .status();
    #[cfg(target_os = "macos")]
    let result = Command::new("open")
        .args(["-a", "Visual Studio Code", &path])
        .status();
    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("code").arg(&path).status();
    match result {
        Ok(s) if s.success() => Ok(()),
        _ => Err("Couldn't start VS Code. In VS Code run “Shell Command: Install 'code' command in PATH”, then try again.".into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_safe_relative_paths() {
        assert!(safe_relative("src/App.tsx").is_ok());
        assert!(safe_relative("../evil").is_err());
        assert!(safe_relative("/etc/passwd").is_err());
        assert!(safe_relative("a/../../b").is_err());
        assert!(safe_relative("").is_err());
    }

    #[test]
    fn writes_project_once() {
        let dir = std::env::temp_dir().join(format!("devkit-test-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let files = HashMap::from([
            ("package.json".to_string(), "{}".to_string()),
            ("src/components/Hero.tsx".to_string(), "x".to_string()),
        ]);
        write_project(dir.display().to_string(), files.clone()).unwrap();
        assert_eq!(
            std::fs::read_to_string(dir.join("src/components/Hero.tsx")).unwrap(),
            "x"
        );
        assert!(
            write_project(dir.display().to_string(), files)
                .unwrap_err()
                .contains("isn't empty")
        );
        let bad = HashMap::from([("../x".to_string(), "x".to_string())]);
        assert!(write_project(dir.join("other").display().to_string(), bad).is_err());
        assert!(
            !dir.join("other").exists()
                || std::fs::read_dir(dir.join("other"))
                    .unwrap()
                    .next()
                    .is_none()
        );
        std::fs::remove_dir_all(&dir).unwrap();
    }
}
