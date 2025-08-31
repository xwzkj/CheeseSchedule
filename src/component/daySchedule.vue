<template>
    <div class="flex flex-col items-center gap-1">
        <n-dropdown :options="scheduleStore.patternsOption" @select="handlePatternSelect" trigger="click">
            <n-button dashed type="primary">{{ patternName }}</n-button>
        </n-dropdown>
        <div class="flex flex-col items-center gap-1" v-if="scheduleStore.schedule[props.day]?.pattern != -1">
            <div v-for="(item, index) in scheduleStore.patterns?.[scheduleStore.schedule[props.day]?.pattern]?.data"
                class="w-100%">
                <n-divider v-if="item.isDivider" style="margin:3px 0;"></n-divider>

                <div v-else
                    class="p-1 rounded-2 border-#999 border-dashed border-1 flex items-center flex-col cursor-pointer">
                    <!-- <div class="text-1.2rem">{{ scheduleStore.schedule[props.day]?.lessons?.[index]?.name ??
                            '空' }}</div> -->
                    <n-auto-complete v-model:value="scheduleStore.schedule[props.day].lessons[index].name"
                        :options="lessonsOption" :input-props="{
                            autocomplete: 'disabled'
                        }" blur-after-select class="w-4.5rem">

                    </n-auto-complete>
                    <div class="text-0.7rem text-gray">{{ item?.time }}</div>
                </div>


            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NDropdown, NAutoComplete, NButton, NDivider } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore';
import { computed } from 'vue';
const scheduleStore = useScheduleStore();
const props = defineProps<{
    day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
}>()
let patternName = computed(() => {
    let p = scheduleStore.schedule[props.day]?.pattern
    return p != -1 ? scheduleStore.patterns?.[p]?.name : "选择本日模式"
})
const lessonsOption = computed(() => {
    let l = [
        '语文', '数学', '英语', '物理', '化学',
        '历史', '地理', '生物', '政治', '微机',
        '劳动', '班会', '体育', '自习', '其他'
    ]
    return l.map(i => {
        return { value: i, label: i }
    })
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

<style>
.n-auto-complete .n-input-wrapper {
    padding: 0 !important;
}

.n-auto-complete .n-input__border {
    border: none !important;
}

.n-auto-complete .n-input-wrapper input {
    font-size: 1.2rem !important;
    text-align: center;
}
</style>