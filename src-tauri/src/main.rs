#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    soc_cover_generator_lib::run()
}

#[tauri::command]
fn noop() {}

#[allow(dead_code)]
mod generated {
    pub fn run() {
        tauri::Builder::default()
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }
}
