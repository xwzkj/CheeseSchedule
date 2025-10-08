<template>
    <div class="h-5.7rem w-full p-3 bg-#fff card-border
    flex flex-col items-end justify-center 
    overflow-hidden whitespace-nowrap relative">
        <div class="flex items-center gap-1 relative z-2">
            <span class="text-1.7rem line-height-120%">{{ props.param?.name?.value }}</span>
            <span class="text-1.2rem">已过</span>
        </div>
        <div class="font-bold flex items-end relative z-2 top-1.5">
            <div class="text-2.2rem line-height-120%">{{ dayData.int }}</div>
            <div class="text-1.2rem">{{ dayData.dec }}%</div>
        </div>
        <div class="progress-box">
            <div class="progress-bar"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { onBeforeUnmount, ref } from 'vue';
const props = defineProps<{
    param: {
        name: {
            label: string,
            type: string,
            value: string
        },
        from: {
            label: string,
            type: string,
            value: number
        },
        to: {
            label: string,
            type: string,
            value: number
        }
    }
}>()
function updateProgress() {
    let small = Math.min(props.param?.from?.value, props.param?.to?.value)
    let large = Math.max(props.param?.from?.value, props.param?.to?.value)

    let diff = dayjs().diff(dayjs(small), 'second')
    let total = dayjs(large).diff(dayjs(small), 'second')

    let progress = diff / total * 100
    let res = {
        int: Math.floor(progress).toString(),
        dec: progress.toFixed(6).replace(Math.floor(progress).toString(), ''),
    }
    if (diff <= 0) { // 目前在时间区间之前
        res.int = '0'
        res.dec = ''
    } else if (diff >= total) { // 目前在时间区间之后
        res.int = '100'
        res.dec = ''
    }
    return res
}
let dayData = ref(updateProgress())
let timer = setInterval(() => {
    dayData.value = updateProgress()
}, 1000)

onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>

<style scoped>
.progress-box {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    z-index: 1;
    background-color: #eaeaea;
}

.progress-bar {
    height: 100%;
    width: 100%;
    border-radius: inherit;
    background: linear-gradient(to right,
        #d4d4d4 v-bind('`${dayData.int}%`'),
        transparent v-bind('`${dayData.int}%`'));
}
</style>