<template>
    <div>
        <n-button @click="p1">编辑模式1</n-button>
    </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router';
const router = useRouter();
const p1 = () => {
    router.push({ name: 'patternEditor', query: { patternNum: 0 } });
}
</script>

<style scoped></style>