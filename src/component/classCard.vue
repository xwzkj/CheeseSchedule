<template>
    <div class="p-0.2rem m-b-0.3rem flex flex-col items-center w-7.5rem rounded-4 border-#999 border-solid border-1"
        :class="{ 'bg-#55efc4': props.active == 2, 'bg-#66ccff': props.active == 1, 'bg-white': props.active == 0 }">

        <div class="font-bold" :class="{ 'text-2.5rem': props.active, 'text-2rem': !props.active }">
            {{ props.name }}
        </div>
        <div v-if="props.active" class="text-1rem">{{ props.time }}</div>

    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    name: string,
    time: string | null,
    active: 0 | 1 | 2
}>()
</script>

<style scoped></style>