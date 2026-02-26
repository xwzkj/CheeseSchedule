<template>
    <div class="p-1rem w-100%">
        <div class="flex gap-2 items-center">
            <n-dropdown :options="scheduleStore.scheduleIdOption" @select="handleSelect" trigger="click">
                <n-button type="primary" dashed>
                    选择课程表
                    <template #icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1.5" d="M18 9s-4.419 6-6 6s-6-6-6-6" />
                        </svg>
                    </template>
                </n-button>
            </n-dropdown>
            当前编辑：{{ scheduleStore.scheduleIdOption[scheduleId]?.label }}
        </div>
        <div class="w-100% flex gap-1 justify-center">
            <div v-for="i in 7" class="flex flex-col items-center">
                <div class="text-1rem">{{ CNdays[i - 1] }}</div>
                <day-schedule :scheduleId="scheduleId" :day="days[i - 1]"></day-schedule>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { NDropdown, NButton } from 'naive-ui'
import { ref } from 'vue';
import { useScheduleStore } from '../stores/scheduleStore';
import daySchedule from '../component/daySchedule.vue';

const days: Week[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const CNdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const scheduleStore = useScheduleStore()

const scheduleId = ref(scheduleStore.currentScheduleId)
function handleSelect(key: number) {
    scheduleId.value = key
}
</script>

<style scoped></style>