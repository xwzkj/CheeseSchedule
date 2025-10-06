<template>
    <div class="h-3rem w-full bg-#fff 
     text-2rem font-bold text-center
     card-border
     flex items-center justify-center
     overflow-hidden">
        <div>{{ formattedTime }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';

const formattedTime = ref(dayjs().format('HH:mm:ss'));

let timer = setInterval(() => {
    formattedTime.value = dayjs().format('HH:mm:ss');
}, 500);

// 组件卸载时清除定时器
onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<style scoped></style>
