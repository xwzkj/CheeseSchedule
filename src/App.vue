<template>
    <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <n-message-provider>
            <router-view>
            </router-view>
            <messageApi />
        </n-message-provider>
    </n-config-provider>
</template>

<script setup>
import { RouterView } from 'vue-router';
import messageApi from './component/messageApi.vue';
import { NMessageProvider, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
import { ref } from 'vue';
import { Window } from "@tauri-apps/api/window"

let themeOverrides = ref({
    common: {
        borderRadius: '0.5rem'
    },
})

let currentWindow = Window.getCurrent()
if (currentWindow.label == 'cheese-schedule') { // 主窗口
    currentWindow.onCloseRequested(() => {
        currentWindow.preventDefault(); // 别关
    })
}
</script>

<style scoped></style>