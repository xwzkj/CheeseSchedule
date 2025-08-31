<template>
    <div class="flex flex-col items-center gap-1">
        <n-dropdown :options="scheduleStore.patternsOption" @select="handlePatternSelect" trigger="click">
            <n-button dashed type="primary">{{ patternName }}</n-button>
        </n-dropdown>
        <div class="flex flex-col items-center gap-1" v-if="scheduleStore.schedule[props.day]?.pattern != -1">
            <div v-for="item in scheduleStore.schedule[props.day].lessons" class="w-100%">
                <schedule-edit-card :data="item"></schedule-edit-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NDropdown, NButton } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore';
import { computed } from 'vue';
import ScheduleEditCard from './scheduleEditCard.vue'
const scheduleStore = useScheduleStore();
const props = defineProps<{
    day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
}>()
let patternName = computed(() => {
    let p = scheduleStore.schedule[props.day]?.pattern
    return p != -1 ? scheduleStore.patterns?.[p]?.name : "选择本日模式"
})

function handlePatternSelect(key: number) {
    scheduleStore.schedule[props.day].pattern = key
    let p = scheduleStore.patterns[key].data
    let lessons = scheduleStore.schedule[props.day].lessons
    if (lessons.length > p.length) {
        lessons.splice(p.length)
    }
    for (let i = 0; i < p.length; i++) {
        let lesson: Lesson = {
            name: lessons?.[i]?.name ?? '空',
            time: p[i]?.time ?? '',
            isDivider: p[i].isDivider,
        }
        if (lessons.length < i + 1) {
            lessons.push(lesson)
        } else {
            lessons[i] = lesson
        }
    }
    scheduleStore.schedule[props.day].lessons = lessons
}

</script>

<style></style>