// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

use std::fs;
use std::path::PathBuf;
use sysinfo::Disks;

// 封装获取配置文件路径的函数
#[tauri::command]
fn get_config_path() -> Result<PathBuf, String> {
    // 获取可执行文件路径
    let exe_path =
        std::env::current_exe().map_err(|e| format!("Failed to get executable path: {}", e))?;

    // 获取可执行文件所在目录
    let exe_dir = exe_path
        .parent()
        .ok_or_else(|| "Failed to get executable directory".to_string())?;

    // 构造配置文件路径（与exe同目录）
    Ok(exe_dir.join("config.json"))
}

#[tauri::command]
fn check_file_exists(file_path: String) -> Result<bool, String> {
    // 将传入的字符串转换为 PathBuf
    let path = PathBuf::from(file_path);
    // 检查文件是否存在
    Ok(path.exists())
}

#[tauri::command]
fn read_config() -> Result<String, String> {
    let config_path = get_config_path()?;
    println!("Config path: {}", config_path.display());

    // 检查文件是否存在
    match config_path.exists() {
        true => {
            fs::read_to_string(&config_path).map_err(|e| format!("Failed to read config: {}", e))
        }
        false => Err("Config file does not exist".to_string()),
    }
}

#[tauri::command]
fn write_config(data: &str) -> Result<(), String> {
    let config_path = get_config_path()?;

    fs::write(&config_path, data).map_err(|e| format!("Failed to write config: {}", e))
}

#[tauri::command]
fn read_key_from_removable() -> Result<String, String> {
    let disks = Disks::new_with_refreshed_list();

    for disk in disks.list() {
        if disk.is_removable() {
            let mut path = PathBuf::from(disk.mount_point());
            path.push("cheese-schedule.key");

            if path.exists() {
                match fs::read_to_string(&path) {
                    Ok(content) => return Ok(content),
                    Err(e) => return Err(e.to_string()),
                }
            }
        }
    }

    Err("未找到密钥文件".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let window = app
                .get_webview_window("cheese-schedule")
                .expect("no cheese-schedule window");
            window.show().unwrap();
            window.unminimize().unwrap();
            window.set_focus().unwrap();
        }))
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_config_path,
            check_file_exists,
            read_config,
            write_config,
            read_key_from_removable
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
