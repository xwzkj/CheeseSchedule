<template>
    <div class="p-1rem flex flex-col">
        <div class="flex justify-between">
            <div class="flex gap-4">
                <n-button @click="() => { scheduleStore.scheduleOverride.override = [] }" secondary>清除临时换课</n-button>
            </div>
            <div class="flex gap-4">
                <n-button @click="scheduleStore.save" type="primary" secondary>保存</n-button>
                <n-button @click="scheduleStore.init" secondary>重置</n-button>
            </div>
        </div>
        <div class="flex flex-col items-center">
            <div>
                <div class="font-size-1.2rem font-bold">编辑今日临时换课</div>
                <!-- {{ scheduleStore.scheduleOverride }} -->
            </div>
            <div class="flex gap-1 flex-col">
                <div v-for="(value, index) in dataCopy" class="w-5rem">
                    <schedule-edit-card :data="value" :class="{
                        ' bg-#66ccff': scheduleStore.scheduleOverride.override?.[index]
                    }"></schedule-edit-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import scheduleEditCard from "../component/scheduleEditCard.vue";
import { useScheduleStore } from "../stores/scheduleStore";
import { onMounted, ref, watch, WatchHandle } from "vue";
import { NButton } from "naive-ui";
const scheduleStore = useScheduleStore()

let dataCopy = ref<Lesson[]>([])
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

<style scoped></style>