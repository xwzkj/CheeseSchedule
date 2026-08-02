<template>
    <div v-if="scheduleStore.patterns.length" class="h-100vh w-100% flex items-center justify-center">
        <div class="w-95% h-95% p-1rem flex flex-col gap-4 justify-between">
            <div class="flex items-center gap-2">
                <n-dropdown :options="scheduleStore.patternsOption" @select="handleSelect" trigger="click">
                    <n-button type="primary" dashed>
                        选择一个时间表来编辑
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="1.5" d="M18 9s-4.419 6-6 6s-6-6-6-6" />
                            </svg>
                        </template>
                    </n-button>
                </n-dropdown>
                <span>正在编辑:</span><n-input v-model:value="scheduleStore.patterns[editingNum].name"
                    style="width: 7rem;"></n-input>
            </div>
            <div class="h-80% flex-1">
                <n-scrollbar>
                    <n-dynamic-input class="max-h-100%" v-model:value="scheduleStore.patterns[editingNum].data"
                        :on-create="patternDefault" show-sort-button>
                        <template #create-button-default>
                            添加时间安排
                        </template>
                        <template #default="{ value }">
                            <div style="display: flex; align-items: center; width: 100%">
                                <n-checkbox v-model:checked="value.isDivider" class="w-10rem ml-0.5rem"
                                    label="是否为分割线" />
                                <time-range-picker v-if="!value.isDivider" v-model="value.time" />
                                <n-divider v-else class="m-0!" />
                            </div>
                        </template>
                    </n-dynamic-input>
                </n-scrollbar>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NScrollbar, NDropdown, NDynamicInput, NCheckbox, NInput, NButton, NDivider } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore'
import timeRangePicker from '../component/timeRangePicker.vue'
const scheduleStore = useScheduleStore()
let editingNum = ref(0);

function handleSelect(key: number) {
    editingNum.value = key
}
function patternDefault(index: number) {
    let lastTimeSlot: TimeSlot = { isDivider: false, time: "07:00-07:45" }
    let lastTimeSlotEndTime = 7 * 60 + 45 // 上一节时间槽位距离零点过去的分钟数
    for (let i = index - 1; i >= 0; i--) {
        if (!scheduleStore.patterns[editingNum.value].data[i].isDivider) {
            lastTimeSlot = scheduleStore.patterns[editingNum.value].data[i] // 这就是上一个不是分割线的槽位
            break
        }
    }
    let match = /^(\d{1,2})[：:](\d{1,2})[-~ ]+(\d{1,2})[：:](\d{1,2})$/.exec(lastTimeSlot.time || "07:00-07:45")
    if (match && match.length === 5) {
        lastTimeSlotEndTime = parseInt(match[3]) * 60 + parseInt(match[4])
    }
    let start = Math.min(lastTimeSlotEndTime + 10, 24 * 60 - 1)
    let end = Math.min(start + 45, 24 * 60 - 1)
    return {
        isDivider: false,
        time: `${Math.floor(start / 60)}:${start % 60}-${Math.floor(end / 60)}:${end % 60}`
    }
}

</script>

<style scoped></style>