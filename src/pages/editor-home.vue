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
                若您有其他课程表软件导出的CSES文件，可在设置中直接导入
                <br />
                若您首次使用，请先编辑时间表，再尝试编辑课程表
                <br />
                详细说明请点击下方的“GitHub”查看README文档
            </div>
        </div>
        <div class="flex flex-col items-center">
            <div class="flex gap-2">
                <div @click="openUrl('https://schedule.wanzii.cn')"
                    class="underline decoration-solid cursor-pointer link">官网</div>
                <div @click="openUrl('https://github.com/xwzkj/CheeseSchedule')"
                    class="underline decoration-solid cursor-pointer link">GitHub</div>
            </div>
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
onUnmounted(() => {
    clearInterval(timer);
})
</script>

<style scoped>
.link {
    color: var(--color-5);
}
</style>