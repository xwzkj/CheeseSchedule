// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// 封装获取配置文件路径的函数
fn get_config_path() -> Result<std::path::PathBuf, String> {
    // 获取可执行文件路径
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    // 获取可执行文件所在目录
    let exe_dir = exe_path.parent()
        .ok_or_else(|| "Failed to get executable directory".to_string())?;
    
    // 构造配置文件路径（与exe同目录）
    Ok(exe_dir.join("config.json"))
}

#[tauri::command]
fn read_config() -> Result<String, String> {
    let config_path = get_config_path()?;
    println!("Config path: {}", config_path.display());
    
    // 检查文件是否存在
    match config_path.exists() {
        true => std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e)),
        false => Err("Config file does not exist".to_string())
    }
}

#[tauri::command]
fn write_config(data: &str) -> Result<(), String> {
    let config_path = get_config_path()?;
    
    std::fs::write(&config_path, data)
        .map_err(|e| format!("Failed to write config: {}", e))
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
