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
            if(!(await isRegistered('CommandOrControl+Alt+D'))){
                await register('CommandOrControl+Alt+D', () => emit('draw'))
            }
            window.addEventListener('beforeunload', () => unregisterAll())
        }
    } catch (e) {
        console.error(e)
    }
}
initShortcut()