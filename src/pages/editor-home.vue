<template>
    <div class="h-100vh p-0.5rem flex flex-col items-center justify-between">
        <div class="flex flex-col items-center gap-2 w-full">
            <div class="text-1.5rem">
                🧀欢迎使用奶酪课程表！
            </div>
            <div class="text-3rem color-#999">
                {{ timeNow }}
            </div>
            <div class="text-1.2rem color-#444 text-align-center">
                奶酪课程表是一个开源项目
                <br />
                若您有其他课程表软件导出的CSES文件，可在设置中直接导入
                <br />
                若您首次使用，请先编辑时间表，再尝试编辑课程表
                <br />
                详细说明请点击下方的“GitHub”查看README文档
            </div>
            <settingItem t1="版本信息" :t2="versionText">
                <n-button type="primary" secondary @click="() => showUpdateModal = true">查看更新</n-button>
            </settingItem>
        </div>
        <div class="flex flex-col items-center">
            <div class="flex gap-2">
                <div @click="openUrl('https://schedule.wanzii.cn')"
                    class="underline decoration-solid cursor-pointer link">官网</div>
                <div @click="openUrl('https://github.com/xwzkj/CheeseSchedule')"
                    class="underline decoration-solid cursor-pointer link">GitHub</div>
            </div>
            <div>© 2025-至今 丸子</div>
        </div>

        <!-- 检查更新模态框 -->
        <n-modal v-model:show="showUpdateModal">
            <div class="h-90vh w-90vw flex flex-col bg-white p-1.5rem rounded-1rem gap-2">
                <div class="text-2rem line-height-110%">
                    {{ updateInfo?.hasUpdate === true ? '有新版本' : (updateInfo?.hasUpdate === false ? '已是最新版本' : '检查中') }}
                </div>
                <div class="flex gap-2 justify-between">
                    <div class="rounded-0.5rem bg-#f5f5f5 p-0.5rem text-center flex-1">
                        <div class="text-1.2rem">v{{ version }}</div>
                        <div class="text-#777">当前</div>
                    </div>
                    <div class="rounded-0.5rem bg-#f5f5f5 p-0.5rem text-center flex-1">
                        <div class="text-1.2rem">
                            {{ updateInfo?.latestVersion === undefined ? '检查中' : updateInfo?.latestVersion || '检查失败' }}
                        </div>
                        <div class="text-#777">最新</div>
                    </div>
                </div>
                <div class="text-1.2rem">更新日志：</div>
                <div class="flex-1 min-h-0 border-2px border-#f5f5f5 rounded-0.5rem p-0.5rem">
                    <n-scrollbar>
                        <div class="markdown-body" v-html="renderedChangeLog"></div>
                    </n-scrollbar>
                </div>
                <div v-for="item in updateInfo?.assets"
                    class="flex justify-between items-center rounded-0.5rem bg-#f5f5f5 p-0.25rem">
                    <div>{{ item.name }}</div>
                    <div class="flex gap-2">
                        <n-button @click="openUrl(item.browser_download_url)" secondary type="primary"
                            size="small">直接下载</n-button>
                        <n-button @click="openUrl(proxyURI(item.browser_download_url))" secondary type="primary"
                            size="small">代理下载</n-button>
                    </div>
                </div>
                <div class="flex gap-2">
                    <n-button @click="openUrl('http://schedule.wanzii.cn')" secondary type="primary">打开官网</n-button>
                    <n-button @click="openUrl('https://github.com/xwzkj/CheeseSchedule/releases')" secondary
                        type="primary">GitHub发布页</n-button>
                    <n-button secondary @click="showUpdateModal = false">关闭</n-button>
                </div>
            </div>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import settingItem from '../component/settingItem.vue';
import { proxyURI, checkUpdate } from '../tools/tool.ts';
import dayjs from 'dayjs';
import MarkdownIt from "markdown-it";
import 'github-markdown-css/github-markdown-light.css';
import { NModal, NScrollbar, NButton } from 'naive-ui'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { openUrl } from '@tauri-apps/plugin-opener';
import { app } from '@tauri-apps/api';
const md = new MarkdownIt().disable('link');
let timeNow = ref(dayjs().format('YYYY/MM/DD HH:mm:ss'))
let version = ref('0.0.0')
let updateInfo = ref<UpdateInfo>()
let versionText = computed(() => {
    let res = "当前版本：v" + version.value
    if (updateInfo.value?.hasUpdate) {
        res += " | 新版本可用：" + updateInfo.value?.latestVersion
    }
    return res
})
let showUpdateModal = ref(false)
let renderedChangeLog = ref('暂无更新日志');


(async () => {
    version.value = await app.getVersion()
    updateInfo.value = await checkUpdate()
})()

onMounted(() => {
    watch(updateInfo, () => {
        console.log(updateInfo.value)
        renderedChangeLog.value = md.render(updateInfo.value?.changeLog?.full || '### 暂无更新日志')
    }, { immediate: true, deep: true })
})

// 更新时钟
let timer = setInterval(() => {
    timeNow.value = dayjs().format('YYYY/MM/DD HH:mm:ss')
}, 500);
onUnmounted(() => {
    clearInterval(timer);
})
</script>

<style scoped>
.link {
    color: var(--color-5);
}
</style>