<template>
    <div class="p-1rem">
        <n-button @click="toPatternEdit">去编辑“模式”</n-button>
    </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router';
const router = useRouter();
const toPatternEdit = () => {
    router.push({ name: 'patternEditor' });
}
</script>

<style scoped></style>