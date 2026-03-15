<template>
    <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <n-message-provider>
            <router-view>
            </router-view>
            <messageApi />
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import messageApi from './component/messageApi.vue';
import { NMessageProvider, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
import { ref } from 'vue';
import { Window } from "@tauri-apps/api/window"
import { isRegistered, register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { emit } from "@tauri-apps/api/event";

let themeOverrides = ref({
    common: {
        borderRadius: '0.5rem'
    },
})
async function initAnyThing() {
    try {
        let currentWindow = Window.getCurrent()
        if (currentWindow.label == 'cheese-schedule') { // 主窗口
            currentWindow.onCloseRequested(() => {
                (currentWindow as any).preventDefault(); // 别关
            })
        }
        if (currentWindow.label == 'draw') { // 抽签窗口
            // Ctrl+Alt+D 抽签快捷键  Ctrl+Alt+E 关闭抽签窗口快捷键
            if (!(await isRegistered('CommandOrControl+Alt+D'))) {
                await register('CommandOrControl+Alt+D', () => emit('draw'))
                await register('CommandOrControl+Alt+E', () => emit('close-draw-window'))
            }
            window.addEventListener('beforeunload', () => unregisterAll())
        }
    } catch (error) {
        console.error(error);
    }
}
initAnyThing()
</script>

<style scoped></style>