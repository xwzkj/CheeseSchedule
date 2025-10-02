<template>
    <div class="flex flex-col items-center gap-1">
        <n-dropdown :options="scheduleStore.patternsOption" @select="handlePatternSelect" trigger="click">
            <n-el tag="div" style="color: var(--primary-color);"
                class="cursor-pointer border b-dashed rounded-0.5rem p-t-0.1rem p-b-0.1rem">
                <n-ellipsis class="w-5rem text-align-center text-0.8rem">{{ patternName }}</n-ellipsis>
            </n-el>
        </n-dropdown>
        <div class="flex flex-col items-center gap-1" v-if="scheduleStore.schedule[props.day]?.pattern != -1">
            <div v-for="item in scheduleStore.schedule[props.day].lessons" class="w-100%">
                <schedule-edit-card :data="item"></schedule-edit-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NDropdown, NEl, NEllipsis } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore';
import { computed } from 'vue';
import ScheduleEditCard from './scheduleEditCard.vue'
const scheduleStore = useScheduleStore();
const props = defineProps<{
    day: Week
}>()
let patternName = computed(() => {
    let p = scheduleStore.schedule[props.day]?.pattern
    return p != -1 ? scheduleStore.patterns?.[p]?.name : "选择本日模式"
})

function handlePatternSelect(key: number) {
    scheduleStore.setPatternToDay(key, props.day)
}

</script>

<style></style>