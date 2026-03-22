<template>
    <div class="h-100vh w-100vw flex justify-center items-center" v-if="showWindow">
        <div class="h-95% w-95% bg-white rounded-1rem p-2rem 
    flex flex-col justify-center outer">
            <div v-if="!res" class="text-1.5rem">
                深度思考中...
            </div>
            <div class="flex-1 min-h-0">
                <n-scrollbar ref="scrollbarRef">
                    <div v-if="!res" class="!color-#888 markdown-body" v-html="renderedReasoningRes"></div>
                    <div v-else class="markdown-body" v-html="renderedRes"></div>
                </n-scrollbar>
            </div>
            <div class="m-t-1rem">
                <n-button @click="closeWindow" size="large" secondary>关闭</n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LogicalSize } from "@tauri-apps/api/window";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getScreenshotableMonitors, getMonitorScreenshot } from "tauri-plugin-screenshots-api";
import { readFile } from "@tauri-apps/plugin-fs";

import { computed, onMounted, onBeforeUnmount, ref, useTemplateRef } from "vue";
import { NButton, NScrollbar } from "naive-ui";
import OpenAI from "openai";
import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownItKatex from "@vscode/markdown-it-katex";
import 'github-markdown-css/github-markdown-light.css';
import 'katex/dist/katex.min.css';

import router from "../router";
import { useScheduleStore } from "../stores/scheduleStore";

const scheduleStore = useScheduleStore();
const md = new MarkdownIt();
md.use(MarkdownItKatex);

let showWindow = ref(false)
let reasoningRes = ref('')
let res = ref('')
let scrollbarRef = useTemplateRef('scrollbarRef')

let renderedReasoningRes = computed(() => {
    return md.render(reasoningRes.value);
});
let renderedRes = computed(() => {
    return md.render(res.value);
});

onMounted(async () => {
    try {
        const webviewWindow = getCurrentWebviewWindow()
        await webviewWindow.setSize(new LogicalSize(850, 700))
        await webviewWindow.center()
        await webviewWindow.show()
        // await webviewWindow.setAlwaysOnTop(false)
        // await webviewWindow.setFocus()
    } catch (e) {
        console.error(e)
    }
    try {
        const screenshotableMonitors = await getScreenshotableMonitors()
        const monitor = screenshotableMonitors[0]
        const image = await getMonitorScreenshot(monitor.id)
        const base64 = await imageToBase64(await readFile(image))
        console.log(image)
        showWindow.value = true
        await AInote(base64)
    } catch (e) {
        console.error(e)
    }
});

function closeWindow() {
    router.push({ name: 'draw-float' })
}
function imageToBase64(image: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            window.$NMessageApi.success('截图读取成功')
            resolve(e.target.result)
        }
        reader.onerror = (e: any) => {
            window.$NMessageApi.error('截图读取失败')
            reject(e)
        }
        const blob = new Blob([image])
        reader.readAsDataURL(blob)
    })
}


const controller = new AbortController();
onBeforeUnmount(() => {
    controller.abort()
})
window.addEventListener('beforeunload', () => {
    controller.abort()
})
async function AInote(image: string) {
    try {
        if (!scheduleStore.setting.AIapiKey) {
            window.$NMessageApi.error('您没有配置AI API密钥，请先前往设置再使用！')
            return
        }
        const openai = new OpenAI(
            {
                apiKey: scheduleStore.setting.AIapiKey,
                baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
                dangerouslyAllowBrowser: true
            }
        );
        res.value = ''
        reasoningRes.value = ''
        const stream = await (openai as any).chat.completions.create({
            model: "qwen3.5-plus",
            stream: true,
            thinking_budget: 500,
            messages: [
                {
                    role: "system",
                    content: `
                    你是一个资深的学习助手，正在为我整理学习笔记，你需要根据以下截图，生成学习笔记
                    要求：
                    笔记层次清晰，简明易懂
                    可适当拓展知识
                    使用markdown格式输出
                    可使用latex公式
                    输出的html标签将不会被渲染，如果为了排版请不要使用html标签（如<br>）`
                },
                {
                    role: "user",
                    content: [{
                        "type": "image_url",
                        "image_url": { "url": image },
                    }]
                }]
        }, {
            signal: controller.signal
        }
        );
        for await (const chunk of stream) {
            if (chunk.choices && chunk.choices.length > 0) {
                const content = chunk.choices[0]?.delta?.content || "";
                const reasoning = (chunk as any).choices[0].delta.reasoning_content || "";
                res.value += content;
                reasoningRes.value += reasoning;
                scrollbarRef.value?.scrollBy({ top: 10000, behavior: 'smooth' })
            } else if (chunk.usage) {
                // 请求结束

            }
        }
        console.log(reasoningRes.value)
        console.log(res.value)

    } catch (error) {
        window.$NMessageApi.error('发生错误：' + error, { duration: 60 * 1000, closable: true })
    }
}
</script>

<style scoped>
.outer {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.flex-center {
    display: flex;
    align-items: center;
}
</style>