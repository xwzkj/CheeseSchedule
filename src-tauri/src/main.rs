// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    std::env::set_var("GDK_BACKEND", "x11"); // 让软件在linux的Wayland中以XWayland运行，避免Wayland中的窗口管理问题
    cheese_schedule_lib::run()
}
