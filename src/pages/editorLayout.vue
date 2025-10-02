<template>
    <div class="flex">
        <div class="flex flex-col justify-between bg-gray-500/5">
            <n-menu class="w-12rem grow-0 shrink-0" :options="menuOptions" v-model:value="selectedNow" />
            <div class="flex gap-4 justify-center m-b-1rem">
                <n-button @click="() => { scheduleStore.refreshPatternToDay(); scheduleStore.save() }" type="primary"
                    secondary>保存</n-button>
                <n-button @click="scheduleStore.init" secondary>重置</n-button>
            </div>
        </div>
        <n-scrollbar class="h-100vh">
            <router-view v-slot="{ Component }">
                <transition name="blur" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </n-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { type MenuOption, NMenu, NScrollbar, NButton } from 'naive-ui';
import { h, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useRoute } from 'vue-router';
import { useScheduleStore } from '../stores/scheduleStore';
const route = useRoute();
const scheduleStore = useScheduleStore();
let selectedNow = ref('editorHome');
function renderLink(name: string, text: string) {
    return () => h(RouterLink, { to: { name } }, () => text)
}
onMounted(() => {
    watch(() => route, (val) => {
        selectedNow.value = val.name as string;
    }, { deep: true, immediate: true });
});
const menuOptions: MenuOption[] = [
    {
        label: renderLink('editorHome', '主页'),
        key: 'editorHome',
    },
    {
        label: renderLink('patternEditor', '模式编辑'),
        key: 'patternEditor',
    },
    {
        label: renderLink('scheduleEditor', '课程表编辑'),
        key: 'scheduleEditor',
    },
    {
        label: renderLink('overrideEditor', '临时换课'),
        key: 'overrideEditor',
    },
    {
        label: renderLink('widgetEditor', '小组件'),
        key: 'widgetEditor',

    }
]
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