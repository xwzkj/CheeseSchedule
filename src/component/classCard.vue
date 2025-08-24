<template>
    <div ref="outer" class="outer" :class="{ 'w-7.5rem max-h-7rem': props.active, 'w-5.5rem max-h-5rem': !props.active }">
        <div class="relative flex flex-col items-center z-2">

            <div :class="{'text-2.5rem font-bold': props.active, 'text-1.8rem': !props.active }">
                {{ props.name }}
            </div>
            <div v-if="props.active" class="text-1rem whitespace-nowrap">{{ props.time }}</div>

        </div>
        <div class="absolute h-75% w-75% rounded-1rem bg z-1">
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, useTemplateRef } from 'vue'
const props = defineProps<{
    name: string,
    time: string | null,
    active: 0 | 1 | 2
}>()
const outerEle = useTemplateRef('outer')
watch(() => props.active, (val) => {
    if (outerEle.value) {
        outerEle.value.style.setProperty('--bg-color', val == 0 ? 'white' : val == 1 ? '#66ccff' : '#55efc4');
        // outerEle.value.style.setProperty('--bg-color', 'blue');
    }
})
</script>

<style scoped>
.outer {
    padding: 0.2rem;
    margin-bottom: 0.3rem;
    border-radius: 1rem;
    border: 1px solid #ccc;
    background-color: white;
    position: relative;
    overflow: hidden;
    transition: all 0.5s;
}

.bg {
    top: 12.5%;
    left: 12.5%;
    background-color: var(--bg-color, white);
    box-shadow: 0 0 4rem 1rem var(--bg-color, white);
    filter: blur(1rem);
}
</style>