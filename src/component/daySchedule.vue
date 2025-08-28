<template>
    <div class="flex flex-col items-center gap-1">
        <n-dropdown :options="scheduleStore.patternsOption" @select="handlePatternSelect">
            <n-button dashed type="primary">{{ patternName }}</n-button>
        </n-dropdown>
        <div class="flex flex-col items-center gap-1" v-if="scheduleStore.schedule[props.day]?.pattern != -1">
            <div v-for="(item, index) in scheduleStore.patterns?.[scheduleStore.schedule[props.day]?.pattern]?.data"
                class="w-100%">
                <n-divider v-if="item.isDivider" style="margin:3px 0;"></n-divider>
                <n-dropdown v-else :options="lessonsOption" trigger="click"
                    @select="(k) => handleLessonSelect(k, index)">

                    <div
                        class="p-1 rounded-2 border-#999 border-dashed border-1 flex items-center flex-col cursor-pointer">
                        <div class="text-1.2rem">{{ scheduleStore.schedule[props.day]?.lessons?.[index]?.name ??
                            '空' }}</div>
                        <div class="text-0.7rem text-gray">{{ item?.time }}</div>
                    </div>

                </n-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NDropdown, NButton, NDivider } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore';
import { computed, ref } from 'vue';
const scheduleStore = useScheduleStore();
const props = defineProps<{
    day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
}>()
let patternName = computed(() => {
    let p = scheduleStore.schedule[props.day]?.pattern
    return p != -1 ? scheduleStore.patterns?.[p]?.name : "选择本日模式"
})
const lessonsOption = ref([
    {
        label: '语文',
        key: '语文'
    },
    {
        label: '数学',
        key: '数学'
    },
    {
        label: '英语',
        key: '英语'
    },
    {
        label: '物理',
        key: '物理'
    },
    {
        label: '化学',
        key: '化学'
    },
    {
        label: '历史',
        key: '历史'
    },
    {
        label: '地理',
        key: '地理'
    },
    {
        label: '生物',
        key: '生物'
    },
    {
        label: '政治',
        key: '政治'
    },
    {
        label: '微机',
        key: '微机'
    },
    {
        label: '劳动',
        key: '劳动'
    },
    {
        label: '班会',
        key: '班会'
    },
    {
        label: '体育',
        key: '体育'
    },
    {
        label: '自习',
        key: '自习'
    },
    {
        label: '其他',
        key: '其他'
    }
])

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

/**
 * 课程选择
 * @param key 课程名称
 * @param id 第几节
*/
function handleLessonSelect(key: string, id: number) {
    scheduleStore.schedule[props.day].lessons[id].name = key
}
</script>

<style scoped></style>