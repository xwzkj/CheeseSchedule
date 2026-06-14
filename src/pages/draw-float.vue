<template>
    <div class="w-100vw h-100vh
    flex flex-col justify-center items-center gap-0.5" v-if="inited">
        <div class="w-90% h-90% rounded-0.5rem
        flex justify-center items-center cursor-pointer bg" @click="() => router.push({ name: 'draw-home' })">
            <div class="text-0.8rem select-none">抽签</div>
        </div>
        <div class="w-90% h-90% rounded-0.5rem
        flex justify-center items-center cursor-pointer bg" @click="() => router.push({ name: 'draw-AI-note' })">
            <div class="text-0.8rem select-none">笔记</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LogicalSize, PhysicalPosition, primaryMonitor } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import router from "../router";
import { useScheduleStore } from "../stores/scheduleStore";
import { useDrawStore } from "../stores/drawStore";
import { sleep } from "../tools/tool";
const scheduleStore = useScheduleStore()
useDrawStore() // 为了让store初始化，开始监听请假列表更新
let inited = ref(false)
let unlisten: UnlistenFn
onMounted(async () => {
    try {
        const webviewWindow = getCurrentWebviewWindow();
        const monitor = await primaryMonitor();
        await webviewWindow.setMaxSize(new LogicalSize(35, 70))
        await webviewWindow.setMinSize(new LogicalSize(35, 70))
        await webviewWindow.setSize(new LogicalSize(35, 70));
        await sleep(50)
        await webviewWindow.setPosition(new PhysicalPosition(2, Math.floor(monitor?.workArea.size.height as number / 3 * 2)));
        watch(() => scheduleStore.setting.drawSmallWindowEnabled, async (enabled) => {
            if (enabled) {
                await webviewWindow.show()
            } else {
                await webviewWindow.hide()
            }
        }, { immediate: true })
    } catch (e) {
        console.error(e)
    }
    unlisten = await listen('draw', () => router.push({ name: 'draw-home' }))
    inited.value = true // 防止切换页面时出现闪烁
});
onBeforeUnmount(() => {
    unlisten()
})
</script>

<style scoped>
.bg {
    background-color: var(--color-4);
}
</style>