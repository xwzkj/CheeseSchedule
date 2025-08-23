<template>
    <div>
        编辑“模式”
        <n-dynamic-input v-model:value="patterns[0].data" :on-create="patternDefault">
            <template #create-button-default>
                添加时间安排
            </template>
            <template #default="{ value }">
                <div style="display: flex; align-items: center; width: 100%">
                    <n-checkbox v-model:checked="value.isDivider" class="w-10rem ml-0.5rem" label="是否为分割线" />
                    <n-input v-show="!value.isDivider" v-model:value="value.time" type="text" placeholder="hh:mm-hh:mm格式的课程时间" />
                </div>
            </template>
        </n-dynamic-input>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NDynamicInput, NCheckbox, NInput } from 'naive-ui'

type Pattern = {
    name: string,
    data: {
        isDivider: boolean,
        time?: string
    }[]
}
type Lesson = { name: string, time: string, active?: boolean }
type Day = { pattern: string | null, lessons: (Lesson | "divider")[] }
type Schedule = {
    mon: Day,
    tue: Day,
    wed: Day,
    thu: Day,
    fri: Day,
    sat: Day,
    sun: Day
}

const patterns = ref<Pattern[]>([{ name: "Default", data: [] }])
const schedule = ref<Schedule>()

function patternDefault(){
    return { 
        isDivider: false,
        time: ""
    }
}
</script>

<style scoped></style>