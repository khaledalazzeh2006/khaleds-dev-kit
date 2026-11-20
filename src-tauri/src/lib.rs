mod db;
mod runner;
mod vscode;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(runner::Running::default())
        .invoke_handler(tauri::generate_handler![
            db::db_query,
            runner::run_command,
            runner::stop_command,
            runner::open_terminal,
            vscode::vscode_install_snippets,
            vscode::write_project,
            vscode::open_in_vscode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
