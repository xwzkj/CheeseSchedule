<template>
    <div class="h-100vh w-100vw flex justify-center items-center">
        <div class="h-90% w-90% bg-white rounded-1rem p-1rem 
    flex flex-col justify-center outer">
            <div class="text-3rem color-#777">
                从{{ drawStore.enabledCandidates.length }}人中随机抽选：
            </div>
            <div class="text-6rem text-align-center">
                {{ drawResult }}
            </div>
            <div class="text-1.5rem color-#777">
                动态概率{{ scheduleStore.setting.drawDynamicProbability ? "已" : "未" }}启用
                防止重复{{ scheduleStore.setting.drawPreventDuplicate ? "已" : "未" }}启用
                <span v-if="scheduleStore.setting.drawPreventDuplicate">
                    本轮还剩：{{ drawStore.availableCandidates.length }}人
                </span>
            </div>
            <div class="flex gap-2">
                <n-button @click="draw" type="primary" secondary>重新抽选</n-button>
                <n-button @click="router.push({ name: 'draw-float' })" secondary>关闭窗口</n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LogicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { onMounted, ref } from "vue";
import { NButton } from "naive-ui";

import router from "../router";
import { useDrawStore } from "../stores/drawStore";
import { useScheduleStore } from "../stores/scheduleStore";

const drawStore = useDrawStore();
const scheduleStore = useScheduleStore();
let drawResult = ref("-");

onMounted(async () => {
    const webviewWindow = getCurrentWebviewWindow();
    await webviewWindow.setSize(new LogicalSize(800, 600));
    webviewWindow.center();
    webviewWindow.setAlwaysOnTop(false);
    draw()
});

async function draw() {
    if (drawStore.availableCandidates.length === 0) {
        drawStore.newRound()
    }
    let delay = 50
    if (drawStore.availableCandidates.length > 1) { // 可抽选人数大于1，播放动画
        for (let i = 0; i < 5; i++) {
            drawResult.value = drawStore.draw(scheduleStore.setting.drawDynamicProbability, true)?.name ?? ""
            if (drawResult.value == "") { // 抽选出现问题
                break
            }
            await new Promise(resolve => setTimeout(resolve, delay))
            delay += 50
        }
    }
    drawResult.value = drawStore.draw(scheduleStore.setting.drawDynamicProbability)?.name ?? "抽选失败"
    scheduleStore.save(true)
}
</script>

<style scoped>
.outer {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>