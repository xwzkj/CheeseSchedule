<template>
    <div class="p-0.5rem">
        <n-divider title-placement="left" class="m-y-0.5rem!">配置文件</n-divider>
        <setting-item t1="打开配置文件所在位置" t2="可手动导入导出 / 若文件不存在会先保存再打开" :needInput="false" :actionOnClick="openConfigDir" />
        <setting-item t1="从通用课程表交换格式(CSES)文件导入" t2="实验性功能，将覆盖当前课程信息，请注意备份！" :needInput="false">
            <n-popconfirm @positive-click="importFromCSES">
                <template #trigger>
                    <n-button type="primary" secondary>导入</n-button>
                </template>
                警告！导入后当前课程信息会被覆盖，请先手动备份后继续！<br />是否继续？
            </n-popconfirm>
        </setting-item>
        <setting-item t1="导出为通用课程表交换格式(CSES)文件" t2="可导入到ClassIsland等支持的软件" :needInput="false">
            <n-button @click="exportToCSES" type="primary" secondary>导出</n-button>
        </setting-item>
        <setting-item t1="开机自启动" t2="是否允许奶酪课程表跟随系统自动启动">
            <n-switch v-model:value="scheduleStore.setting.startup" />
        </setting-item>
        <n-divider title-placement="left" class="m-y-0.5rem!">AI</n-divider>
        <setting-item t1="AI API密钥" t2="若想使用AI功能，请先设置您的阿里百炼apiKey">
            <div class="w-7rem">
                <n-input v-model:value="scheduleStore.setting.AIapiKey" type="password" :show-password-toggle="true" />
            </div>
        </setting-item>
        <setting-item t1="上下课语音提醒" t2="开启后，将会在上下课时进行语音播报">
            <n-switch v-model:value="scheduleStore.setting.AIplayVoiceWhenLessonSwitch" />
        </setting-item>
        <setting-item t1="单词卡片历史记录" :t2="`防止AI重复输出 | 当前有${scheduleStore.setting.widgetWordCardHistory.length}个单词`">
            <n-button type="error" secondary @click="scheduleStore.setting.widgetWordCardHistory = []">清除</n-button>
        </setting-item>
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
            <n-switch v-model:value="scheduleStore.setting.drawSmallWindowEnabled" />
        </setting-item>
        <setting-item t1="动态概率" t2="抽中越多，概率越低，使每人的总抽取次数更平均">
            <n-switch v-model:value="scheduleStore.setting.drawDynamicProbability" />
        </setting-item>
        <setting-item t1="防止重复" t2="抽中后，本轮内将不会再抽取该候选人">
            <n-switch v-model:value="scheduleStore.setting.drawPreventDuplicate" />
        </setting-item>
        <setting-item t1="自动开启新轮次" t2="在每节课开始时自动开启新一轮抽选">
            <n-switch v-model:value="scheduleStore.setting.drawAutoNewRound" />
        </setting-item>
        <setting-item t1="排除请假者" t2="防止抽中请假者，需搭配出席人数小组件使用">
            <n-switch v-model:value="scheduleStore.setting.drawExcludeLeaveStudents" />
        </setting-item>
        <setting-item t1="课间防作弊" t2="开启后，课间时的抽选将不被计入历史记录">
            <n-switch v-model:value="scheduleStore.setting.drawPreventCheating" />
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
        <setting-item t1="主题色" t2="选择一个主题色，将生成配色方案 | 默认值：#ce9e04">
            <div class="w-7rem">
                <n-color-picker v-model:value="scheduleStore.setting.themeColor" :show-alpha="false" :modes="['hex']" />
            </div>
        </setting-item>
        <n-divider title-placement="left" class="m-y-0.5rem!">身份验证</n-divider>
        <setting-item t1="设置密码" t2="用于锁定编辑器"
            :actionOnClick="() => router.push({ name: 'editor-password' })"></setting-item>
    </div>
</template>

<script setup lang="ts">
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { save, open } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, BaseDirectory, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

import { useMessage, NSlider, NInputNumber, NButton, NPopconfirm, NDropdown, NDivider, NSwitch, NColorPicker, NInput } from 'naive-ui'
import settingItem from '../component/settingItem.vue'
import { useScheduleStore } from '../stores/scheduleStore'
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router'
import dayjs from 'dayjs';
const router = useRouter()
const scheduleStore = useScheduleStore()
const NMessage = useMessage()

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
    if (!await exists('config.json', { baseDir: BaseDirectory.AppData })) {
        await scheduleStore.save()
    }
    await revealItemInDir(await appDataDir() + '/config.json');
}
async function exportToCSES() {
    try {
        const filePath = await save({
            title: '导出配置为通用课程表交换格式(CSES)',
            defaultPath: `奶酪课程表-CSES-${dayjs().format('YYYY-MM-DD')}.yaml`,
            filters: [{ name: '通用课程表交换格式(CSES)文件', extensions: ['yaml', 'yml'] }]
        })
        if (!filePath) return
        await writeTextFile(filePath, scheduleStore.exportToCSES())
        NMessage.success('已成功导出')
        if (scheduleStore.schedule.length > 2) { // 多周轮换多于两周
            NMessage.warning('由于CSES格式限制，仅导出了前两周的课程！', { duration: 60 * 1000, closable: true })
        }
    } catch (error) {
        NMessage.error('导出CSES失败：' + JSON.stringify(error), { duration: 60 * 1000, closable: true })
    }
}

async function importFromCSES() {
    try {
        const filePath = await open({
            title: '从通用课程表交换格式(CSES)导入',
            filters: [{ name: '通用课程表交换格式(CSES)文件', extensions: ['yaml', 'yml'] }]
        })
        if (!filePath) return
        let res = scheduleStore.importFromCSES(await readTextFile(filePath))
        if (res.success) {
            NMessage.success(res.message)
            NMessage.success('请在检查后点击保存以更新配置')
        } else {
            NMessage.error(res.message, { duration: 60 * 1000, closable: true })
        }
    } catch (error) {
        NMessage.error('导入CSES失败：' + JSON.stringify(error), { duration: 60 * 1000, closable: true })
    }
}
</script>

<style scoped></style>