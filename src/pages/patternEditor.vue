<template>
    <div v-if="scheduleStore.patterns.length" class="h-100% w-100% flex items-center justify-center">
        <div class=" shadow-[0_0_7px_0_#999] rounded-2rem w-95% h-95% p-1rem flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <n-dropdown :options="optionData" @select="handleSelect">
                    <n-button>选择一个“模式”来编辑</n-button>
                </n-dropdown>
                <span>正在编辑:“{{ scheduleStore.patterns[editingNum].name }}”</span>
            </div>
            <div class="max-h-80%">
                <n-scrollbar>
                    <n-dynamic-input class="max-h-100%" v-model:value="scheduleStore.patterns[editingNum].data"
                        :on-create="patternDefault">
                        <template #create-button-default>
                            添加时间安排
                        </template>
                        <template #default="{ value }">
                            <div style="display: flex; align-items: center; width: 100%">
                                <n-checkbox v-model:checked="value.isDivider" class="w-10rem ml-0.5rem"
                                    label="是否为分割线" />
                                <n-input v-show="!value.isDivider" v-model:value="value.time" type="text"
                                    placeholder="hh:mm-hh:mm格式的课程时间" />
                            </div>
                        </template>
                    </n-dynamic-input>
                </n-scrollbar>
            </div>
            <div class="flex justify-between">
                <n-button @click="goHome" secondary>返回到课程表编辑</n-button>
                <div class="flex gap-4">
                    <n-button @click="scheduleStore.save" type="primary" secondary>保存</n-button>
                    <n-button @click="scheduleStore.init" secondary>重置</n-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NScrollbar, NDropdown, NDynamicInput, NCheckbox, NInput, NButton } from 'naive-ui'
import { useScheduleStore } from '../stores/scheduleStore'
import { useRouter } from 'vue-router'
const router = useRouter()
const scheduleStore = useScheduleStore()
const optionData = computed(() => {
    let t = []
    for (let i = 0; i < scheduleStore.patterns.length; i++) {
        t.push({ key: i, label: scheduleStore.patterns[i].name })
    }
    return t
})
let editingNum = ref(0);

function handleSelect(key: number) {
    editingNum.value = key
}
function patternDefault() {
    return {
        isDivider: false,
        time: ""
    }
}

function goHome() {
    router.push({ name: 'editor' })
}
</script>

<style scoped></style>