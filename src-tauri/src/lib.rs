// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn write_config(data: &str) -> Result<(), String> {
    std::fs::write("config.json", data).map_err(|e| format!("Failed to write config: {}", e))
}

#[tauri::command]
fn read_config() -> String {
    let res;
    if std::fs::exists("config.json").unwrap() {
        res = std::fs::read_to_string("config.json").expect("");
    } else {
        res = "".to_string();
    }
    return res;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_config, write_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
