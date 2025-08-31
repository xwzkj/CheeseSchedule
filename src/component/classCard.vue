<template>
    <div ref="outer" class="outer" :class="{ 'w-9rem h-5.7rem': props.active, 'w-5.5rem h-3.2rem': !props.active }">
        <div class="relative flex flex-col items-center z-2">

            <div :class="{ 'text-2.5rem font-bold': props.active, 'text-1.8rem': !props.active }"
                class="line-height-120%">
                {{ props.name }}
            </div>
            <div v-if="props.active" class="text-1.3rem font-bold whitespace-nowrap">{{ props.time }}</div>

        </div>
        <div v-if="props.active" class="bg">
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, useTemplateRef, onMounted } from 'vue'
const props = defineProps<{
    name: string,
    time: string | null,
    active: 0 | 1 | 2 | undefined
}>()
const outerEle = useTemplateRef('outer')
onMounted(() => {
    watch(() => props.active, () => {
        let val = props.active
        if (outerEle.value) {
            outerEle.value.style.setProperty('--bg-color', val == 0 ? 'white' : val == 1 ? '#66ccff' : '#55efc4');
            // outerEle.value.style.setProperty('--bg-color', 'blue');
        }
    }, { immediate: true })
})
</script>

<style scoped>
.outer {
    --bg-color: rgb(248, 127, 62);
    padding: 0.2rem;
    margin-bottom: 0.3rem;
    border-radius: 1rem;
    border: 1px solid #ccc;
    background-color: white;
    position: relative;
    overflow: hidden;
    transition: all 0.7s ease-in-out;
    /* 居中 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.bg {
    z-index: 1;
    height: 65%;
    aspect-ratio: 1 / 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg-color, white);
    box-shadow: 0 0 4rem 1rem var(--bg-color, white);
    border-radius: 1rem;
    filter: blur(0.7rem);
    animation: bg-animation 10s linear infinite;
}

@keyframes bg-animation {
    0% {
        transform: translate(-75%, -50%) rotate(0deg) scale(1);
    }

    25% {
        transform: translate(-50%, -50%) rotate(90deg) scale(1.2);
    }

    50% {
        transform: translate(-25%, -50%) rotate(180deg) scale(1);
    }

    75% {
        transform: translate(-50%, -50%) rotate(270deg) scale(1.2);
    }

    100% {
        transform: translate(-75%, -50%) rotate(360deg) scale(1);
    }
}
</style>