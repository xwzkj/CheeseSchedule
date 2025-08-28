// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn write_config(data: &str) -> Result<(), String> {
    std::fs::write("config.json", data)
        .map_err(|e| format!("Failed to write config: {}", e))
}

#[tauri::command]
fn read_config() -> Result<String, String> {
    match std::fs::exists("config.json") {
        Ok(exists) => {
            if exists {
                std::fs::read_to_string("config.json")
                    .map_err(|e| format!("Failed to read config: {}", e))
            } else {
                Err("Config file does not exist".to_string())
            }
        }
        Err(e) => Err(format!("Failed to check config file: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_config, write_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
