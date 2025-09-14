<template>
    <n-config-provider :theme-overrides="themeOverrides">
        <n-message-provider>
            <n-scrollbar class="h-100vh" ref="outerScrollbar">
                <router-view v-slot="{ Component }">
                    <transition name="blur" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </n-scrollbar>
            <messageApi />
        </n-message-provider>
    </n-config-provider>
</template>

<script setup>
import { RouterView } from 'vue-router';
import messageApi from './component/messageApi.vue';
import { NMessageProvider, NConfigProvider, NScrollbar } from 'naive-ui';
import { ref, useTemplateRef } from 'vue';
import { Window } from "@tauri-apps/api/window"

let themeOverrides = ref({
    common: {
        borderRadius: '0.5rem'
    },
})

window.$outerScrollbar = useTemplateRef('outerScrollbar')

let currentWindow = Window.getCurrent()
if (currentWindow.label == 'cheese-schedule') { // 主窗口
    currentWindow.onCloseRequested(() => {
        currentWindow.preventDefault(); // 别关
    })
}
</script>

<style scoped>
.blur-enter-active,
.blur-leave-active {
    transition: all 0.2s ease-in;
    overflow: hidden;
}

.blur-enter-from,
.blur-leave-to {
    filter: blur(1.5rem);
    opacity: 0;
    transform: scale(1.05);
}
</style>