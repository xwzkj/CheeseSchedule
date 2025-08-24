<template>
    <div class="p-1rem w-100%">
        <div class="flex justify-between">
            <n-button @click="toPatternEdit">去编辑“模式”</n-button>
            <div class="flex gap-4">
                <n-button @click="scheduleStore.save" type="primary" secondary>保存</n-button>
                <n-button @click="scheduleStore.init" secondary>重置</n-button>
            </div>
        </div>
        <div class="w-100% flex gap-1 justify-between">
            <div class="column" v-for="i in 7">
                {{ CNdays[i - 1] }}
                <day-schedule :day="days[i - 1]"></day-schedule>
            </div>
        </div>
    </div>

</template>

<script setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router';
import { useScheduleStore } from '../stores/scheduleStore';
import daySchedule from '../component/daySchedule.vue';
const router = useRouter();
const scheduleStore = useScheduleStore();
const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const CNdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const toPatternEdit = () => {
    router.push({ name: 'patternEditor' });
}
</script>

<style scoped></style>