<template>
    <n-config-provider :theme-overrides="themeOverrides">
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
import { NMessageProvider, NConfigProvider } from 'naive-ui';
import { ref } from 'vue';
import { Window } from "@tauri-apps/api/window"

let themeOverrides = ref({
    common: {
        borderRadius: '0.5rem'
    },
})


let currentWindow = Window.getCurrent()
if (currentWindow.label == 'editor') {
    currentWindow.onCloseRequested((event) => {
        event.preventDefault(); // 阻止关闭
        currentWindow.hide(); // 隐藏窗口
    })
}
</script>

<style scoped></style>