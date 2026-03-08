<template>
    <div class="w-100vw h-100vh
    flex justify-center items-center">
        <div ref="button" class="w-90% h-90% rounded-0.5rem
        flex justify-center items-center cursor-pointer" @click="() => router.push({ name: 'draw-home' })">
            <div class="text-0.8rem select-none">抽签</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LogicalSize, PhysicalPosition, primaryMonitor } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { onMounted, useTemplateRef, watch } from "vue";
import router from "../router";
import { useScheduleStore } from "../stores/scheduleStore";
import { listen } from "@tauri-apps/api/event";
const button = useTemplateRef('button')
const scheduleStore = useScheduleStore()
onMounted(async () => {
    const webviewWindow = getCurrentWebviewWindow();
    const monitor = await primaryMonitor();
    await webviewWindow.setSize(new LogicalSize(35, 35));
    await webviewWindow.setPosition(new PhysicalPosition(2, monitor?.workArea.size.height as number / 3 * 2));
    listen('draw', () => router.push({ name: 'draw-home' }))

    watch(() => scheduleStore.setting.drawSmallWindowEnabled, (enabled) => {
        if (enabled) {
            webviewWindow.show()
        } else {
            webviewWindow.hide()
        }
    }, { immediate: true })

    button.value!.style.backgroundColor = '#dda300ee' // 防止切换页面时出现闪烁
});
</script>

<style scoped></style>