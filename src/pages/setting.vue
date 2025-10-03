<template>
    <div class="p-0.5rem">
        <setting-item t1="打开配置文件所在位置" t2="可手动导入导出" :needInput="false" :actionOnClick="openConfigDir" />
        <setting-item t1="缩放比例" t2="设置主窗口缩放">
            <div class="w-7rem">
                <n-slider v-model:value="scheduleStore.zoom" :min="0.5" :max="2" :step="0.1" />
            </div>
        </setting-item>

    </div>
</template>

<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';

import { NSlider } from 'naive-ui'
import settingItem from '../component/settingItem.vue'
import { useScheduleStore } from '../stores/scheduleStore'
const scheduleStore = useScheduleStore()
async function openConfigDir() {
    await revealItemInDir(await invoke('get_config_path'));
}
</script>

<style scoped></style>