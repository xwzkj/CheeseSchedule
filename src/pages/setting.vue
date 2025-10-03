<template>
    <div class="p-0.5rem">
        <setting-item t1="打开配置文件所在位置" t2="可手动导入导出" :needInput="false" :actionOnClick="openConfigDir" />
    </div>
</template>

<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';
import settingItem from '../component/settingItem.vue'
async function openConfigDir() {
    await revealItemInDir(await invoke('get_config_path'));
}
</script>

<style scoped></style>