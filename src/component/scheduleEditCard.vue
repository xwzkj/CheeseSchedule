<template>
    <div class="w-100% rounded-2">
        <!-- 上方的rounded2是为了搭配overrideEditor的背景用的 -->
        <n-divider v-if="props.data.isDivider" style="margin:3px 0;"></n-divider>
        <div v-else class="p-1 rounded-2 border-#ddd border flex items-center flex-col cursor-pointer schedule-edit-card">
            <n-auto-complete v-model:value="props.data.name" :options="lessonsOption" :input-props="{
                autocomplete: 'disabled'
            }" blur-after-select
                @update:value="(val: string) => { if (val.length > 3) props.data.name = val.slice(0, 3) }"
                class="w-4.5rem">
            </n-auto-complete>
            <div class="text-0.7rem text-gray">{{ props.data?.time }}</div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NAutoComplete, NDivider } from 'naive-ui';
const props = defineProps<{
    data: Lesson
}>()

const lessonsOption = computed(() => {
    let l = [
        '语文', '数学', '英语', '物理', '化学',
        '生物', '历史', '地理', '政治', '微机',
        '劳动', '班会', '体育', '自习', '其他'
    ]
    return l.map(i => {
        return { value: i, label: i }
    })
})


</script>

<style>
.schedule-edit-card .n-auto-complete .n-input-wrapper {
    padding: 0 !important;
}

.schedule-edit-card .n-auto-complete .n-input__border {
    border: none !important;
}

.schedule-edit-card .n-auto-complete .n-input-wrapper input {
    font-size: 1.2rem !important;
    text-align: center;
}
</style>