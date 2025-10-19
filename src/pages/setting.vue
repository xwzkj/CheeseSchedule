<template>
    <div class="p-0.5rem">
        <setting-item t1="打开配置文件所在位置" t2="可手动导入导出 / 若文件不存在会先保存再打开" :needInput="false" :actionOnClick="openConfigDir" />
        <setting-item t1="主窗口缩放比例" t2="默认为1，与系统缩放乘算">
            <div class="w-7rem">
                <n-slider v-model:value="scheduleStore.setting.zoom" :min="0.5" :max="2" :step="0.1" />
            </div>
        </setting-item>
        <setting-item t1="主窗口高度乘数" t2="高度=屏幕高度(不含任务栏)*乘数 | 默认值：0.7">
            <div class="w-7rem">
                <n-slider v-model:value="scheduleStore.setting.heightFactor" :min="0.3" :max="1" :step="0.01" />
            </div>
        </setting-item>
        <setting-item t1="多周轮换" :t2="`设置循环使用的课程表数量 | 当前：${scheduleStore.schedule.length}`">
            <div class="w-7rem flex gap-1">
                <n-input-number v-model:value="scheduleCount" :precision="0" :min="1" :max="8" :show-button="false" />
                <n-popconfirm @positive-click="setScheduleCount">
                    <template #trigger>
                        <n-button type="primary" secondary>确定</n-button>
                    </template>
                    若当前课程表数量小于设置值，此操作会删除额外的课程表，是否继续？
                </n-popconfirm>
            </div>
        </setting-item>
        <setting-item t1="设置起始周" t2="请选择现在应使用哪张课程表">
            <div>
                <n-dropdown :options="scheduleStore.scheduleIdOption" trigger="click" @select="setFirstWeek">
                    <n-button type="primary" dashed>
                        {{ scheduleStore.scheduleIdOption[scheduleStore.currentScheduleId]?.label }}
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="1.5" d="M18 9s-4.419 6-6 6s-6-6-6-6" />
                            </svg>
                        </template>
                    </n-button>
                </n-dropdown>
            </div>
        </setting-item>
        <setting-item t1="时间偏移" t2="适用于铃声不准的场景 | 单位：秒 | 正值将延后课程切换，负值则会提前">
            <div class="w-7rem">
                <n-input-number v-model:value="scheduleStore.setting.timeOffset" />
            </div>
        </setting-item>
    </div>
</template>

<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';

import { useMessage, NSlider, NInputNumber, NButton, NPopconfirm, NDropdown } from 'naive-ui'
import settingItem from '../component/settingItem.vue'
import { useScheduleStore } from '../stores/scheduleStore'
import { onMounted, ref, watch } from 'vue';
const scheduleStore = useScheduleStore()
const NMessage = useMessage()

let scheduleCount = ref(scheduleStore.schedule.length)
onMounted(() => {
    watch(scheduleStore.schedule, () => {
        scheduleCount.value = scheduleStore.schedule.length
    }, { deep: true, immediate: true })
})
function setScheduleCount() {
    scheduleStore.setScheduleCount(scheduleCount.value)
    NMessage.success('已设置')
}
function setFirstWeek(key: number) {
    scheduleStore.setFirstWeek(key)
    NMessage.success('已设置')
}
async function openConfigDir() {
    const filePath = await invoke('get_config_path') as string
    if (!await invoke('check_file_exists', { filePath: filePath })) {
        await scheduleStore.save()
    }
    await revealItemInDir(filePath);
}
</script>

<style scoped></style>