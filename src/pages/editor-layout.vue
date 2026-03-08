<template>
    <div class="flex">
        <div class="flex flex-col justify-between bg-#f7f8f9">
            <n-menu class="w-12rem grow-0 shrink-0" :options="menuOptions" v-model:value="selectedNow" />
            <div class="flex gap-4 justify-center m-b-1rem">
                <n-button @click="() => { scheduleStore.refreshPatternToDay(); scheduleStore.save() }" type="primary"
                    secondary>保存</n-button>
                <n-button @click="scheduleStore.init" secondary>重置</n-button>
            </div>
        </div>
        <n-scrollbar v-if="!locked" class="h-100vh">
            <router-view v-slot="{ Component }">
                <transition name="blur" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </n-scrollbar>

        <!-- 编辑器锁定 -->
        <div v-else class="fixed left-0 top-0 bottom-0 right-0 z-100 
        bg-white p-1rem justify-center items-center flex flex-col gap-0.5rem">
            <HugeiconsLock class="text-5rem"/>
            <div class="text-3rem">编辑器已锁定</div>
            <div class="w-15rem flex">
                <n-input v-model:value="password" type="password" show-password-on="click" placeholder="请输入密码" />
                <n-button type="primary" @click="checkPassword" secondary>解锁</n-button>
            </div>
            <div class="flex gap-0.5rem">
                <n-button type="primary" @click="checkKeyFile" secondary>使用密钥解锁</n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type MenuOption, NMenu, NScrollbar, NButton, NInput } from 'naive-ui';
import { h, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useRoute } from 'vue-router';
import { useScheduleStore } from '../stores/scheduleStore';
import { sleep } from '../tools/tool';
import { invoke } from '@tauri-apps/api/core';
import CryptoJS from 'crypto-js'
import HugeiconsLock from '~icons/hugeicons/lock';
const route = useRoute();
const scheduleStore = useScheduleStore();
let selectedNow = ref('editorHome');
let locked = ref(false);
let password = ref('');
function renderLink(name: string, text: string) {
    return () => h(RouterLink, { to: { name } }, () => text)
}
onMounted(async () => {
    watch(() => route, (val) => {
        selectedNow.value = val.name as string;
    }, { deep: true, immediate: true });
    while (!scheduleStore.inited) {
        await sleep(100)
    }
    if (scheduleStore.setting.password) {
        locked.value = true;
        checkKeyFile(); // 尝试使用密钥解锁
    }
});
const menuOptions: MenuOption[] = [
    {
        label: renderLink('editor-home', '主页'),
        key: 'editor-home',
    },
    {
        label: renderLink('editor-pattern', '模式编辑'),
        key: 'editor-pattern',
    },
    {
        label: renderLink('editor-schedule', '课程表编辑'),
        key: 'editor-schedule',
    },
    {
        label: renderLink('editor-override', '临时换课'),
        key: 'editor-override',
    },
    {
        label: renderLink('editor-draw', '抽签'),
        key: 'editor-draw',
    },
    {
        label: renderLink('editor-widget', '小组件'),
        key: 'editor-widget',
    },
    {
        label: renderLink('editor-setting', '设置'),
        key: 'editor-setting',
    }
]

function checkPassword() {
    if (CryptoJS.SHA256(password.value).toString() === scheduleStore.setting.password) {
        locked.value = false;
        window.$NMessageApi.success('解锁成功');
    } else {
        window.$NMessageApi.error('密码错误');
    }
}
async function checkKeyFile() {
    try {
        let hash = await invoke('read_key_from_removable')
        if (hash === scheduleStore.setting.password) {
            locked.value = false;
            window.$NMessageApi.success('使用密钥解锁成功');
        } else {
            window.$NMessageApi.error('密钥错误');
        }
    } catch (error) {
        window.$NMessageApi.error(error);
        return;
    }
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