<template>
    <div class="w-100% rounded-2">
        <!-- 上方的rounded2是为了搭配overrideEditor的背景用的 -->
        <n-divider v-if="props.data.isDivider" style="margin:3px 0;"></n-divider>
        <div v-else class="p-1 rounded-2 border-#999 border-dashed border-1 flex items-center flex-col cursor-pointer">
            <n-auto-complete v-model:value="props.data.name" :options="lessonsOption" :input-props="{
                autocomplete: 'disabled'
            }" blur-after-select class="w-4.5rem">
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
        '历史', '地理', '生物', '政治', '微机',
        '劳动', '班会', '体育', '自习', '其他'
    ]
    return l.map(i => {
        return { value: i, label: i }
    })
})


</script>

<style>
.n-auto-complete .n-input-wrapper {
    padding: 0 !important;
}

.n-auto-complete .n-input__border {
    border: none !important;
}

.n-auto-complete .n-input-wrapper input {
    font-size: 1.2rem !important;
    text-align: center;
}
</style>