<template>
    <div class="p-1rem w-100%">
        <div class="w-100% flex gap-1 justify-center">
            <div v-for="i in 7" class="flex flex-col items-center">
                <div class="text-1rem">{{ CNdays[i - 1] }}</div>
                <day-schedule :day="days[i - 1]"></day-schedule>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import daySchedule from '../component/daySchedule.vue';
const days: Week[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const CNdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
</script>

<style scoped></style>