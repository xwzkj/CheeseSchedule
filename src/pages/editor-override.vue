<template>
    <div class="p-1rem">
        <div class="flex flex-col gap-2">
            <div class="flex justify-between">
                <div class="text-1.5rem">临时换课</div>
                <n-button @click="() => { scheduleStore.scheduleOverride.override = [] }" secondary>清除临时换课</n-button>
            </div>
            <!-- {{ scheduleStore.scheduleOverride }} -->
            <n-card>
                <div class="flex gap-2 flex-col">
                    <div v-for="(value, index) in dataCopy">
                        <div class="w-full rounded-0.5rem p-0.5rem bg-#F7F8F9 flex items-center justify-between gap-4"
                            v-if="!value.isDivider">
                            <div class="text-0.7rem text-#777 m-l-4 p-0.5rem rounded-0.5rem line-height-100%" 
                                :class="{ 'overrided': scheduleStore.scheduleOverride.override?.[index] }">{{
                                value?.time }}</div>
                            <n-auto-complete v-model:value="value.name" :options="lessonsOption" :input-props="{
                                autocomplete: 'disabled'
                            }" blur-after-select
                                @update:value="(val: string) => { if (val.length > 3) value.name = val.slice(0, 3) }"
                                class="min-w-0 flex-1">
                            </n-auto-complete>
                        </div>
                        <div v-else>
                            <n-divider class="m-y-0.5rem!" />
                        </div>
                    </div>
                </div>
            </n-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { useScheduleStore } from "../stores/scheduleStore";
import { computed, onMounted, ref, watch, WatchHandle } from "vue";
import { NButton, NAutoComplete, NDivider, NCard } from "naive-ui";
const scheduleStore = useScheduleStore()

let dataCopy = ref<Lesson[]>([])
const lessonsOption = computed(() => {
    let l = [
        '语文', '数学', '英语', '物理', '化学',
        '生物', '历史', '地理', '政治', '微机',
        '劳动', '班会', '体育', '自习', '其他'
    ]
    return l.map(i => {
        return { value: i, label: i }
    })
})
let watchHandles: WatchHandle[] = []
onMounted(() => {
    watch(() => scheduleStore.scheduleToday, () => {
        dataCopy.value = []
        // 取消所有监听
        watchHandles.forEach(h => h())

        let data = scheduleStore.scheduleToday
        for (let i = 0; i < data.length; i++) {
            dataCopy.value.push({ ...data[i] })

            // 监听数据,并设置override
            let handle = watch(() => dataCopy.value[i].name, (val) => {
                scheduleStore.scheduleOverride.override[i] = val
                scheduleStore.scheduleOverride.date = dayjs().format("YYYY-MM-DD")
            })
            watchHandles.push(handle)
        }
        console.log(dataCopy.value);
    }, { deep: true, immediate: true })

})
</script>

<style scoped>
.overrided {
    background-color: var(--color-1);
}
</style>