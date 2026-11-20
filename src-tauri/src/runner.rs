//! Run terminal commands in a project folder: inside the app (output streamed line by line) or in a
//! real terminal window (for interactive commands like `npm create vite`).

use serde::Serialize;
use std::collections::HashSet;
use std::io::{BufRead, BufReader, Read};
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State, ipc::Channel};

#[cfg(windows)]
use std::os::windows::process::CommandExt;
#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data", rename_all = "camelCase")]
pub enum RunEvent {
    Stdout(String),
    Stderr(String),
    Exit { code: Option<i32> },
}

/// PIDs of commands still running (so Stop can find them).
#[derive(Default)]
pub struct Running(Mutex<HashSet<u32>>);

fn check_dir(cwd: &str) -> Result<(), String> {
    if cwd.trim().is_empty() {
        return Err("Pick a project folder first.".into());
    }
    if !Path::new(cwd).is_dir() {
        return Err(format!("Folder not found: {cwd}"));
    }
    Ok(())
}

/// The user's shell, so PATH matches their terminal (node from fnm/nvm, pnpm, git…).
fn shell(command: &str) -> Command {
    #[cfg(windows)]
    {
        let mut c = Command::new("cmd");
        // /S + quotes: run the line exactly as typed.
        c.raw_arg("/D /S /C").raw_arg(format!("\"{command}\""));
        c.creation_flags(CREATE_NO_WINDOW);
        c
    }
    #[cfg(not(windows))]
    {
        use std::os::unix::process::CommandExt;
        let sh = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".into());
        let mut c = Command::new(sh);
        // -l -i: load the same profile files as a terminal (macOS GUI apps start with a bare PATH).
        c.args(["-l", "-i", "-c", command]);
        c.process_group(0);
        c
    }
}

fn pipe<R: Read + Send + 'static>(
    reader: R,
    on_event: Channel<RunEvent>,
    wrap: fn(String) -> RunEvent,
) -> std::thread::JoinHandle<()> {
    std::thread::spawn(move || {
        for line in BufReader::new(reader).split(b'\n').map_while(Result::ok) {
            let text = String::from_utf8_lossy(&line)
                .trim_end_matches('\r')
                .to_string();
            let _ = on_event.send(wrap(text));
        }
    })
}

/// Start `command` in `cwd`. Returns the process id; output and the exit code arrive on `on_event`.
#[tauri::command]
pub fn run_command(
    cwd: String,
    command: String,
    on_event: Channel<RunEvent>,
    app: AppHandle,
) -> Result<u32, String> {
    check_dir(&cwd)?;
    let mut child = shell(&command)
        .current_dir(&cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        // No colors (we show plain text) and no "Ok to proceed? (y)" prompts from npx.
        .env("NO_COLOR", "1")
        .env("FORCE_COLOR", "0")
        .env("npm_config_yes", "true")
        .spawn()
        .map_err(|e| format!("Couldn't start the command: {e}"))?;
    let pid = child.id();
    app.state::<Running>().0.lock().unwrap().insert(pid);

    let out = pipe(
        child.stdout.take().unwrap(),
        on_event.clone(),
        RunEvent::Stdout,
    );
    let err = pipe(
        child.stderr.take().unwrap(),
        on_event.clone(),
        RunEvent::Stderr,
    );
    std::thread::spawn(move || {
        let _ = out.join();
        let _ = err.join();
        let code = child.wait().ok().and_then(|s| s.code());
        app.state::<Running>().0.lock().unwrap().remove(&pid);
        let _ = on_event.send(RunEvent::Exit { code });
    });
    Ok(pid)
}

/// Stop a running command and everything it started (npm → node → …).
#[tauri::command]
pub fn stop_command(pid: u32, running: State<'_, Running>) -> Result<(), String> {
    if !running.0.lock().unwrap().contains(&pid) {
        return Ok(()); // already finished
    }
    #[cfg(windows)]
    let status = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        .creation_flags(CREATE_NO_WINDOW)
        .status();
    #[cfg(not(windows))]
    let status = Command::new("kill")
        .args(["-TERM", &format!("-{pid}")])
        .status();
    status
        .map(|_| ())
        .map_err(|e| format!("Couldn't stop it: {e}"))
}

#[cfg(target_os = "macos")]
fn applescript_string(s: &str) -> String {
    format!("\"{}\"", s.replace('\\', "\\\\").replace('"', "\\\""))
}

/// Open a terminal window in `cwd` and run `command` there (it stays open afterwards).
#[tauri::command]
pub fn open_terminal(cwd: String, command: String) -> Result<(), String> {
    check_dir(&cwd)?;
    #[cfg(windows)]
    {
        // Windows Terminal if installed, otherwise a classic console window.
        let wt = Command::new("wt.exe")
            .args(["-d", &cwd, "cmd", "/k", &command])
            .spawn();
        if wt.is_ok() {
            return Ok(());
        }
        Command::new("cmd")
            .raw_arg(format!("/C start \"\" /D \"{cwd}\" cmd /K \"{command}\""))
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Couldn't open a terminal: {e}"))
    }
    #[cfg(target_os = "macos")]
    {
        let line = format!("cd {} && {}", shell_quote(&cwd), command);
        let script = format!(
            "tell application \"Terminal\"\nactivate\ndo script {}\nend tell",
            applescript_string(&line)
        );
        Command::new("osascript")
            .args(["-e", &script])
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Couldn't open Terminal: {e}"))
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        let line = format!("cd {} && {}; exec $SHELL", shell_quote(&cwd), command);
        Command::new("x-terminal-emulator")
            .args(["-e", "sh", "-c", &line])
            .spawn()
            .map(|_| ())
            .map_err(|e| format!("Couldn't open a terminal: {e}"))
    }
}

#[cfg(unix)]
fn shell_quote(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_missing_folder() {
        assert!(check_dir("").unwrap_err().contains("Pick"));
        assert!(
            check_dir("/definitely/not/here")
                .unwrap_err()
                .contains("not found")
        );
        assert!(check_dir(".").is_ok());
    }

    #[cfg(unix)]
    #[test]
    fn shell_runs_in_folder_with_quotes() {
        let dir = std::env::temp_dir();
        let out = shell("echo \"a b\" && pwd && echo err 1>&2")
            .current_dir(&dir)
            .stdin(Stdio::null())
            .output()
            .unwrap();
        let stdout = String::from_utf8_lossy(&out.stdout);
        assert!(stdout.contains("a b"), "{stdout}");
        assert!(
            stdout.contains(dir.canonicalize().unwrap().to_str().unwrap())
                || stdout.contains(dir.to_str().unwrap())
        );
        assert!(String::from_utf8_lossy(&out.stderr).contains("err"));
        assert_eq!(shell_quote("it's"), "'it'\\''s'");
    }
}
