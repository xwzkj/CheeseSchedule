<template>
    <div class="p-0.5rem">
        <setting-item t1="打开配置文件所在位置" t2="可手动导入导出 / 若文件不存在会先保存再打开" :needInput="false" :actionOnClick="openConfigDir" />
        <n-divider title-placement="left" class="m-y-0.5rem!">课程表</n-divider>
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
                <n-input-number v-model:value="scheduleStore.setting.timeOffset" :update-value-on-input="false" />
            </div>
        </setting-item>
        <n-divider title-placement="left" class="m-y-0.5rem!">抽签</n-divider>
        <setting-item t1="全局快捷键说明：" t2="抽签：Ctrl+Alt+D | 关闭抽签窗口：Ctrl+Alt+E">
            <div></div>
        </setting-item>
        <setting-item t1="启用悬浮按钮" t2="关闭后将不显示抽签悬浮按钮，但仍可通过快捷键触发">
            <div>
                <n-switch v-model:value="scheduleStore.setting.drawSmallWindowEnabled" />
            </div>
        </setting-item>
        <setting-item t1="动态概率" t2="抽中越多，概率越低，使每人的总抽取次数更平均">
            <div>
                <n-switch v-model:value="scheduleStore.setting.drawDynamicProbability" />
            </div>
        </setting-item>
        <setting-item t1="防止重复" t2="抽中后，本轮内将不会再抽取该候选人">
            <div>
                <n-switch v-model:value="scheduleStore.setting.drawPreventDuplicate" />
            </div>
        </setting-item>
        <setting-item t1="自动开启新轮次" t2="在每节课开始时自动开启新一轮抽选">
            <div>
                <n-switch v-model:value="scheduleStore.setting.drawAutoNewRound" />
            </div>
        </setting-item>
        <setting-item t1="课间防作弊" t2="开启后，课间时的抽选将不被计入历史记录">
            <div>
                <n-switch v-model:value="scheduleStore.setting.drawPreventCheating" />
            </div>
        </setting-item>
        <n-divider title-placement="left" class="m-y-0.5rem!">个性化</n-divider>
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
        <n-divider title-placement="left" class="m-y-0.5rem!">身份验证</n-divider>
        <setting-item t1="设置密码" t2="用于锁定编辑器" :actionOnClick="() => showPasswordEditor = true"></setting-item>

        <n-modal v-model:show="showPasswordEditor">
            <n-card style="width: 600px" title="密码设置" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <div v-if="scheduleStore.setting.password">已启用锁定，设置密码为空以关闭</div>
                <div v-else>未启用锁定，设置密码以开启</div>
                <div class="m-b-0.5rem">请在下方输入新密码：</div>
                <div class="flex">
                    <n-input v-model:value="password" type="password" show-password-on="click" placeholder="请输入新密码" />
                    <n-button type="primary" @click="setPassword" secondary>确认</n-button>
                </div>
                <n-divider />
                <div class="m-b-0.5rem">你可以选择生成密钥文件，保存在可移动设备（如U盘）的根目录以快速解锁编辑器</div>
                <n-button type="primary" @click="saveKeyFile" secondary>生成密钥文件</n-button>
                <template #footer>

                </template>
            </n-card>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'


import { useMessage, NSlider, NInputNumber, NButton, NPopconfirm, NDropdown, NDivider, NSwitch, NModal, NCard, NInput } from 'naive-ui'
import settingItem from '../component/settingItem.vue'
import { useScheduleStore } from '../stores/scheduleStore'
import { onMounted, ref, watch } from 'vue';
import CryptoJS from 'crypto-js'
const scheduleStore = useScheduleStore()
const NMessage = useMessage()

let showPasswordEditor = ref(false)
let password = ref('')
let scheduleCount = ref(scheduleStore.schedule.length)
onMounted(() => {
    watch(() => scheduleStore.setting.timeOffset, (value) => {
        if (typeof value !== 'number') {
            scheduleStore.setting.timeOffset = 0
        }
    },)
    watch(scheduleCount, (value) => {
        if (typeof value !== 'number') {
            scheduleCount.value = 1
        }
    })
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

async function setPassword() {
    if (password.value) {
        scheduleStore.setting.password = CryptoJS.SHA256(password.value).toString()
    } else {
        scheduleStore.setting.password = ''
    }
    console.log(scheduleStore.setting.password)
    await scheduleStore.save()
}

// 保存解锁编辑器用的密钥文件
async function saveKeyFile() {
    try {
        const filePath = await save({
            defaultPath: "cheese-schedule.key"
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