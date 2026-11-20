//! Automatic daily backups of My Library, kept in the app's data folder (last 14 days).

use serde::Serialize;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const KEEP: usize = 14;

fn backups_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("backups");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

/// "library-2026-11-20.json" only: no paths, no other files.
fn valid_name(name: &str) -> bool {
    let Some(date) = name
        .strip_prefix("library-")
        .and_then(|n| n.strip_suffix(".json"))
    else {
        return false;
    };
    date.len() == 10
        && date.chars().enumerate().all(|(i, c)| {
            if i == 4 || i == 7 {
                c == '-'
            } else {
                c.is_ascii_digit()
            }
        })
}

/// Newest first; everything after the first `keep` names.
fn to_prune(mut names: Vec<String>, keep: usize) -> Vec<String> {
    names.sort_unstable_by(|a, b| b.cmp(a));
    names.into_iter().skip(keep).collect()
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupFile {
    name: String,
    size: u64,
}

fn list(dir: &PathBuf) -> Vec<BackupFile> {
    let mut files: Vec<BackupFile> = std::fs::read_dir(dir)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            valid_name(&name).then(|| BackupFile {
                size: e.metadata().map(|m| m.len()).unwrap_or(0),
                name,
            })
        })
        .collect();
    files.sort_unstable_by(|a, b| b.name.cmp(&a.name));
    files
}

/// Write today's backup (`date` = YYYY-MM-DD from the app) and delete the oldest beyond 14.
#[tauri::command]
pub fn library_backup(app: AppHandle, date: String, content: String) -> Result<String, String> {
    let name = format!("library-{date}.json");
    if !valid_name(&name) {
        return Err("Bad backup date.".into());
    }
    let dir = backups_dir(&app)?;
    std::fs::write(dir.join(&name), content).map_err(|e| e.to_string())?;
    let names = list(&dir).into_iter().map(|f| f.name).collect();
    for old in to_prune(names, KEEP) {
        let _ = std::fs::remove_file(dir.join(old));
    }
    Ok(dir.join(name).display().to_string())
}

#[tauri::command]
pub fn library_backups(app: AppHandle) -> Result<Vec<BackupFile>, String> {
    Ok(list(&backups_dir(&app)?))
}

#[tauri::command]
pub fn library_backup_read(app: AppHandle, name: String) -> Result<String, String> {
    if !valid_name(&name) {
        return Err("Not a backup file.".into());
    }
    std::fs::read_to_string(backups_dir(&app)?.join(name)).map_err(|e| e.to_string())
}

/// Where backups are stored (for "Show in folder").
#[tauri::command]
pub fn backups_path(app: AppHandle) -> Result<String, String> {
    Ok(backups_dir(&app)?.display().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_are_strict() {
        assert!(valid_name("library-2026-11-20.json"));
        assert!(!valid_name("library-2026-11-20.json.bak"));
        assert!(!valid_name("library-../../x.json"));
        assert!(!valid_name("library-2026_11_20.json"));
        assert!(!valid_name("other-2026-11-20.json"));
    }

    #[test]
    fn prunes_oldest() {
        let names: Vec<String> = (1..=16)
            .map(|d| format!("library-2026-11-{d:02}.json"))
            .collect();
        let gone = to_prune(names, 14);
        assert_eq!(
            gone,
            vec!["library-2026-11-02.json", "library-2026-11-01.json"]
        );
    }
}
