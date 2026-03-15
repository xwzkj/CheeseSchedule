<template>
    <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN" class="colorProvider">
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
import { generate } from '@ant-design/colors'
import { computed, ref, watch } from 'vue';
import { useScheduleStore } from './stores/scheduleStore'
import { debounce } from './tools/tool';
import { Window } from "@tauri-apps/api/window"
import { isRegistered, register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { emit } from "@tauri-apps/api/event";
const scheduleStore = useScheduleStore()

let mainColors = ref(generate(scheduleStore.setting.themeColor))
watch(() => scheduleStore.setting.themeColor,
    debounce((val: string) => {
        mainColors.value = generate(val)
    }, 100)
)

let themeOverrides = computed(() => ({
    common: {
        borderRadius: '0.5rem',

        primaryColor: mainColors.value[5],
        primaryColorHover: mainColors.value[4],
        primaryColorSuppl: mainColors.value[4],
        primaryColorPressed: mainColors.value[7],
        textColorBase: mainColors.value[8],

    },
}))
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

<style>
.colorProvider {
    --color-0: v-bind('mainColors[0]');
    --color-1: v-bind('mainColors[1]');
    --color-2: v-bind('mainColors[2]');
    --color-3: v-bind('mainColors[3]');
    --color-4: v-bind('mainColors[4]');
    --color-5: v-bind('mainColors[5]');
    --color-6: v-bind('mainColors[6]');
    --color-7: v-bind('mainColors[7]');
    --color-8: v-bind('mainColors[8]');
    --color-9: v-bind('mainColors[9]');
}
</style>