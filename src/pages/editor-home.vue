<template>
    <div class="h-100vh p-1rem flex flex-col items-center justify-between">
        <div class="flex flex-col items-center">
            <div class="text-1.5rem">
                🧀欢迎使用奶酪课程表！
            </div>
            <div class="text-3rem color-#999">
                {{ timeNow }}
            </div>
            <div class="text-1.2rem color-#444 text-align-center">
                奶酪课程表是一个开源项目
                <br />
                若您首次使用，请先前往“模式编辑”编辑时间表，再尝试编辑课程表
                <br />
                详细说明请点击下方的“GitHub”查看README文档
            </div>
        </div>
        <div class="flex flex-col items-center">
            <div @click="openGithub" class="underline decoration-solid color-#5fc76a cursor-pointer">GitHub</div>
            <div>© 2025-至今 丸子</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { onUnmounted, ref } from 'vue';
import { openUrl } from '@tauri-apps/plugin-opener';
let timeNow = ref(dayjs().format('YYYY/MM/DD HH:mm:ss'))
let timer = setInterval(() => {
    timeNow.value = dayjs().format('YYYY/MM/DD HH:mm:ss')
}, 500);
let openGithub = async () => {
    await openUrl('https://github.com/xwzkj/CheeseSchedule')
}
onUnmounted(() => {
    clearInterval(timer);
})
</script>

<style scoped></style>