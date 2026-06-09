<template>
    <div class="h-5.7rem w-full p-3 bg-#fff card-border
    flex flex-col items-end justify-center 
    overflow-hidden whitespace-nowrap">
        <div class="flex items-center gap-1 w-full justify-end">
            <div class="text-1.2rem c8">距</div>
            <div class="text-1.7rem line-height-120% min-w-0 flex-shrink-1">
                <component :is="props.param?.name?.value.length < 3 ? 'div' : NMarquee">
                    <div :class="{ 'm-r-1rem': props.param?.name?.value.length >= 3 }">{{ props.param?.name?.value }}
                    </div>
                </component>
            </div>
            <div class="text-1.2rem c8">{{ dayData.passed }}</div>
        </div>
        <div class="text-2.2rem line-height-120% font-bold">{{ dayData.days }}天</div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { NMarquee } from 'naive-ui';
import { onBeforeUnmount, ref } from 'vue';
const props = defineProps<{
    param: {
        name: {
            label: string,
            type: string,
            value: string
        },
        date: {
            label: string,
            type: string,
            value: number
        }
    }
}>()
function update() {
    let diff = dayjs(props.param?.date?.value).diff(dayjs().startOf('day'), 'day')
    let res = {
        passed: "还有",
        days: Math.abs(diff)
    }
    if (diff < 0) {
        res.passed = "已过"
    }
    return res
}
let dayData = ref(update())
let timer = setInterval(() => {
    dayData.value = update()
}, 1000)
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>

<style scoped></style>