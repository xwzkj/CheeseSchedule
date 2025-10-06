<template>
    <div class="h-5.7rem w-full bg-#fff card-border
    flex flex-col items-center justify-center 
    overflow-hidden whitespace-nowrap">
        <div class="flex items-center">
            <span class="text-1rem">距</span>
            <span class="text-1.8rem line-height-120%">{{ props.param?.name?.value }}</span>
            <span class="text-1rem">{{ dayData.passed }}</span>
        </div>
        <div class="text-2.2rem line-height-120% font-bold">{{ dayData.days }}天</div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
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
let dayData = computed(() => {
    let diff = dayjs(props.param?.date?.value).diff(dayjs(), 'day')
    let res = {
        passed: "还有",
        days: Math.abs(diff)
    }
    if (diff < 0) {
        res.passed = "已过"
    }
    return res
})
</script>

<style scoped></style>