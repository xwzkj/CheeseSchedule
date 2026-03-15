<template>
    <div class="p-1rem">
        <n-card title="密码设置">
            <div v-if="scheduleStore.setting.password">已启用锁定，设置密码为空以关闭</div>
            <div class="m-b-0.5rem" v-else>未启用锁定，设置密码以开启</div>
            <div class="flex gap-1 m-t-0.5rem">
                <n-input v-model:value="password" type="password" show-password-on="click" placeholder="请输入新密码" />
                <n-button type="primary" @click="setPassword" secondary>确认</n-button>
            </div>
            <n-divider title-placement="left">作用域</n-divider>
            <div class="grid grid-cols-3">
                <div v-for="item in (routeNames as string[])" :key="item">
                    <n-checkbox :checked="scheduleStore.setting.passwordScope.includes(item)"
                        @update:checked="(change: boolean) => changePasswordScope(item, change)"
                        :disabled="item === 'editor-password' && scheduleStore.setting.passwordScope.includes(item)">
                        {{ (routeDisplayNames as any)[item] ?? item }}
                    </n-checkbox>
                </div>
            </div>
            <n-divider title-placement="left">密钥文件</n-divider>
            <div class="m-b-0.5rem">你可以选择生成密钥文件，保存在可移动设备（如U盘）的根目录以快速解锁编辑器</div>
            <n-button type="primary" @click="saveKeyFile" secondary>生成密钥文件</n-button>
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

import { ref } from 'vue';
import { NInput, NButton, NDivider, NCheckbox, NCard } from 'naive-ui'
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js'
import { useScheduleStore } from '../stores/scheduleStore'
import { useMessage } from 'naive-ui'

const scheduleStore = useScheduleStore()
const NMessage = useMessage()

const router = useRouter()
let password = ref('')
const routeNames = router.getRoutes()
    .map(route => route.name)
    .filter(i => (i as string).startsWith('editor-'))
const routeDisplayNames = {
    'editor-pattern': '模式编辑',
    'editor-schedule': '课程表编辑',
    'editor-override': '临时换课',
    'editor-draw': '抽签',
    'editor-widget': '小组件',
    'editor-setting': '设置',
    'editor-home': '主页',
    'editor-password': '密码设置',
}
async function setPassword() {
    if (password.value) {
        scheduleStore.setting.password = CryptoJS.SHA256(password.value).toString()
    } else {
        scheduleStore.setting.password = ''
    }
    await scheduleStore.save()
}

// 改变密码作用域
function changePasswordScope(routeName: string, checked: boolean) {
    if (checked) {
        scheduleStore.setting.passwordScope.push(routeName)
    } else {
        scheduleStore.setting.passwordScope = scheduleStore.setting.passwordScope.filter(i => i !== routeName)
    }
    scheduleStore.save()
}
// 保存解锁编辑器用的密钥文件
async function saveKeyFile() {
    try {
        const filePath = await save({
            title: '保存密钥文件 | 请选择可移动设备的根目录，不要更改文件名',
            defaultPath: "cheese-schedule.key",
            filters: [{ name: 'key文件', extensions: ['key'] }]
        })
        if (!filePath) return
        await writeTextFile(filePath, scheduleStore.setting.password)
        NMessage.success('已生成密钥文件')
    } catch (error) {
        NMessage.error('生成密钥文件失败')
    }
}

</script>

<style scoped></style>