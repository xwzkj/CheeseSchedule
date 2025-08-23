<template>
    <div class="p-0.5rem rounded-1rem m-0.1rem flex flex-col items-center w-7.5rem shadow-[0_0_3px_0_#777]"
        :class="{ 'bg-#66ccff': props.active, 'bg-#eee': !props.active }">

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
    active: boolean
}>()
</script>

<style scoped></style>