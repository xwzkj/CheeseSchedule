<template>
    <div class="h-100vh w-100vw flex justify-center items-center">
        <div class="h-95% w-95% bg-white rounded-1rem p-2rem 
    flex flex-col justify-center outer">
            <div class="text-3rem color-#555">
                从{{ drawStore.enabledCandidates.length }}人中随机抽选：
            </div>
            <div class="text-6rem text-align-center result" ref="result">
                {{ drawResult }}
            </div>
            <div class="text-1.5rem color-#777">
                {{ scheduleStore.setting.drawDynamicProbability ? "✅" : "❌" }}动态概率<br />
                {{ scheduleStore.setting.drawPreventDuplicate ? "✅" : "❌" }}防止重复<br />
                <span v-if="scheduleStore.setting.drawPreventDuplicate">
                    本轮还剩：{{ drawStore.availableCandidates.length }}人
                </span>
            </div>
            <div class="flex gap-2 m-t-1rem">
                <n-button @click="draw" type="primary" size="large" secondary>重新抽选</n-button>
                <n-button @click="router.push({ name: 'draw-float' })" size="large" secondary>关闭窗口</n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LogicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { onMounted, ref, useTemplateRef } from "vue";
import { NButton } from "naive-ui";

import router from "../router";
import { useDrawStore } from "../stores/drawStore";
import { useScheduleStore } from "../stores/scheduleStore";
import { sleep } from "../tools/tool";
import { listen } from "@tauri-apps/api/event";

const drawStore = useDrawStore();
const scheduleStore = useScheduleStore();
let drawResult = ref("刘华强");
const result = useTemplateRef('result')

onMounted(async () => {
    try {
        const webviewWindow = getCurrentWebviewWindow()
        await webviewWindow.setSize(new LogicalSize(730, 550))
        await webviewWindow.center()
        await webviewWindow.setFocus()
        await webviewWindow.show()
    } catch (e) {
        console.error(e)
    }
    listen('draw', draw)
    await sleep(50)
    draw()
});

window.addEventListener('keydown', function (e) {
    if (e.key == 'Escape') {
        router.push({ name: 'draw-float' })
    }
})

let drawLock = false // 互斥锁
async function draw() {
    if (drawLock) {
        return
    }
    drawLock = true
    try {
        result.value!.style.transform = 'scale(0.85)'

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
                await sleep(delay)
                delay += 50
            }
        }
        drawResult.value = drawStore.draw(scheduleStore.setting.drawDynamicProbability)?.name ?? "抽选失败"
        scheduleStore.save(true)
        result.value!.style.transform = 'scale(1)'
    } finally { // 防止死锁
        drawLock = false
    }
}
</script>

<style scoped>
.outer {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.result {
    transition: transform 0.5s ease;
}
</style>