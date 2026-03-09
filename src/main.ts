import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from 'pinia'
import router from "./router/index";
import 'virtual:uno.css'

import { isRegistered, register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emit } from "@tauri-apps/api/event";

const pinia = createPinia()

createApp(App)
    .use(router)
    .use(pinia)
    .mount("#app");

async function initShortcut() {
    try {
        if (getCurrentWebviewWindow().label == 'draw') {
            // Ctrl+Alt+D 抽签快捷键  Ctrl+Alt+E 关闭抽签窗口快捷键
            if(!(await isRegistered('CommandOrControl+Alt+D'))){
                await register('CommandOrControl+Alt+D', () => emit('draw'))
                await register('CommandOrControl+Alt+E', () => emit('close-draw-window'))
            }
            window.addEventListener('beforeunload', () => unregisterAll())
        }
    } catch (e) {
        console.error(e)
    }
}
initShortcut()